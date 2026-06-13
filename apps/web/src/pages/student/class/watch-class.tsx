import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@bluethub/ui-kit";
import { CheckCircle2, Download, Loader2, PlayCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import boardSessionService from "@/services/board-session";
import {
  addAudio,
  addStrokes,
  deleteAudioBySession,
  deleteClassBySession,
  getAudioBySession,
  getClassBySession,
} from "@/utils/db";
import type { AudioBatch, IActions, IBatch } from "@/utils/constant";
import type { MediaType } from "@/utils/constant";
import { LESSON_MEDIA_CACHE, buildLessonScopedCacheKey } from "@/utils/lesson-media-cache";

interface ReplayCheckpoint {
  sessionId: string;
  lessonId: string;
  totalStrokeBatches: number;
  totalAudioChunks: number;
  totalMediaAssets: number;
  downloadedStrokeBatchKeys: string[];
  downloadedAudioChunkIndexes: number[];
  downloadedMediaIds: string[];
  manifestSaved: boolean;
  completed: boolean;
  updatedAt: string;
}

interface WatchLocationState {
  sessionId?: string;
  lessonId?: string;
}

const replayCheckpointKey = (sessionId: string) => `replay.download.checkpoint.${sessionId}`;

const toMmSs = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const clockToMs = (value: string | null | undefined): number => {
  if (!value) return NaN;
  const parts = String(value)
    .trim()
    .split(":")
    .map((part) => Number(part));

  if (!parts.every((part) => Number.isFinite(part))) return NaN;

  if (parts.length === 2) {
    return Math.max(0, (parts[0] * 60 + parts[1]) * 1000);
  }

  if (parts.length === 3) {
    return Math.max(0, (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000);
  }

  return NaN;
};

interface ManifestChunkEvent {
  type: string;
  timestampMs: number;
  mediaAssetId?: string;
  frameIndex?: 0 | 1;
}

const buildReplayBatches = (
  manifest: NonNullable<Awaited<ReturnType<typeof boardSessionService.getManifest>>>
): IActions => {
  const sortedChunks = [...manifest.chunks].sort((a, b) => a.startMs - b.startMs);
  const batches: IBatch[] = sortedChunks.map((chunk, idx) => ({
    id: `batch-${idx}`,
    startTime: toMmSs(chunk.startMs),
    endTime: toMmSs(chunk.endMs),
    hasAudio: true,
    hasBoard: true,
    mediaAction: [],
  }));

  const assetById = new Map(manifest.mediaAssets.map((asset) => [asset.id, asset] as const));
  const openMedia = new Map<
    string,
    {
      id: string;
      name: string;
      url: string;
      type: MediaType;
      show: string;
      showMs: number;
      frameIndex?: 0 | 1;
    }
  >();

  const attachMediaToBatch = (media: {
    id: string;
    name: string;
    url: string;
    type: MediaType;
    show: string;
    closed: string;
    showMs: number;
    closedMs: number;
    frameIndex?: 0 | 1;
  }) => {
    const idx = sortedChunks.findIndex(
      (chunk) => media.showMs >= chunk.startMs && media.showMs < chunk.endMs
    );
    const batchIndex = idx >= 0 ? idx : Math.max(0, sortedChunks.length - 1);
    batches[batchIndex].mediaAction = [...(batches[batchIndex].mediaAction ?? []), media];
  };

  // If the manifest stores event timestamps as absolute wall-clock ms (same
  // format as stroke.timestamp), convert them to session-relative ms before use.
  const sessionStartWallMs = manifest.session?.recordedAt
    ? new Date(manifest.session.recordedAt).getTime()
    : 0;
  // Timestamps above this threshold (year 2001+) are treated as absolute.
  const ABSOLUTE_TS_THRESHOLD_MS = 1_000_000_000_000;
  const toRelativeMs = (rawMs: number): number => {
    if (sessionStartWallMs > 0 && rawMs > ABSOLUTE_TS_THRESHOLD_MS) {
      return Math.max(0, rawMs - sessionStartWallMs);
    }
    return Math.max(0, rawMs);
  };

  for (const chunk of sortedChunks) {
    const events = ((chunk.events as ManifestChunkEvent[] | undefined) ?? [])
      .filter((event) => Number.isFinite(event.timestampMs))
      .sort((a, b) => a.timestampMs - b.timestampMs);

    for (const event of events) {
      if (!event.mediaAssetId) continue;
      const asset = assetById.get(event.mediaAssetId);
      if (!asset) continue;

      const relativeMs = toRelativeMs(event.timestampMs);

      if (event.type === "media:show") {
        openMedia.set(event.mediaAssetId, {
          id: asset.id,
          name: asset.name,
          url: asset.url,
          type: asset.type as MediaType,
          show: toMmSs(relativeMs),
          showMs: relativeMs,
          frameIndex: event.frameIndex,
        });
        continue;
      }

      if (event.type === "media:hide") {
        const active = openMedia.get(event.mediaAssetId);
        if (!active) continue;

        attachMediaToBatch({
          ...active,
          closed: toMmSs(relativeMs),
          closedMs: relativeMs,
        });

        openMedia.delete(event.mediaAssetId);
      }
    }
  }

  const totalDurationMs = Math.max(
    manifest.stats.totalDurationMs,
    sortedChunks.length > 0 ? sortedChunks[sortedChunks.length - 1].endMs : 0
  );

  for (const active of openMedia.values()) {
    attachMediaToBatch({
      ...active,
      closed: toMmSs(totalDurationMs),
      closedMs: totalDurationMs,
    });
  }

  // Fallback: if the server didn't return any media:show events but the session
  // has media assets, show them from the session midpoint. This avoids blocking
  // the board at t=0 while still making media visible during replay.
  const hasAnyMediaEvents = batches.some((b) => (b.mediaAction?.length ?? 0) > 0);
  if (!hasAnyMediaEvents && manifest.mediaAssets.length > 0 && sortedChunks.length > 0) {
    const fallbackShowMs = Math.floor(totalDurationMs / 2);
    for (const asset of manifest.mediaAssets) {
      attachMediaToBatch({
        id: asset.id,
        name: asset.name,
        url: asset.url,
        type: asset.type as MediaType,
        show: toMmSs(fallbackShowMs),
        closed: toMmSs(totalDurationMs),
        showMs: fallbackShowMs,
        closedMs: totalDurationMs,
      });
    }
  }

  return {
    totalDuration: totalDurationMs,
    totalBatches: batches.length,
    batches,
  };
};

const WatchClass = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const location = useLocation();
  const locationState = (location.state as WatchLocationState | null) ?? null;

  const lessonId = locationState?.lessonId ?? classId ?? "";
  const sessionId = locationState?.sessionId ?? classId ?? "";

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Ready to prepare replay data.");
  const [isRunning, setIsRunning] = useState(false);

  const checkpoint = useMemo<ReplayCheckpoint | null>(() => {
    if (!sessionId) return null;
    try {
      const raw = localStorage.getItem(replayCheckpointKey(sessionId));
      return raw ? (JSON.parse(raw) as ReplayCheckpoint) : null;
    } catch {
      return null;
    }
  }, [sessionId]);

  const writeCheckpoint = useCallback((cp: ReplayCheckpoint) => {
    localStorage.setItem(replayCheckpointKey(cp.sessionId), JSON.stringify(cp));
  }, []);

  const ensureReplayData = useCallback(async () => {
    if (!sessionId || !lessonId) {
      throw new Error("Missing lesson/session id for replay.");
    }

    setIsRunning(true);
    setProgress(0);
    setStatusText("Checking local replay cache...");

    await Promise.all([deleteAudioBySession(sessionId), deleteClassBySession(sessionId)]);

    const cachedAudio = await getAudioBySession(sessionId);
    const cachedStrokes = await getClassBySession(sessionId);

    setStatusText("Downloading replay manifest...");
    setProgress(5);

    const manifest = await boardSessionService.getStudentManifest(sessionId);
    if (!manifest) {
      throw new Error("Replay manifest not found for this class.");
    }

    // Derive session start from the manifest's recorded-at timestamp so that
    // stroke timestamps (real wall-clock ms from the server) and audio batch
    // timestamps all share the same reference frame.
    const sessionStartWallMs = manifest.session?.recordedAt
      ? new Date(manifest.session.recordedAt).getTime()
      : Date.now();

    const replayManifest = buildReplayBatches(manifest);
    localStorage.setItem("currentBatches", JSON.stringify(replayManifest));
    localStorage.setItem("replaySessionId", sessionId);
    localStorage.setItem("sessionStartWallMs", String(sessionStartWallMs));
    localStorage.setItem("sessionStartSessionId", sessionId);
    localStorage.setItem("recordingStartTimerMs", "0");
    localStorage.setItem("recordingStartSessionId", sessionId);

    const totalItems =
      manifest.strokeBatches.length + manifest.chunks.length + manifest.mediaAssets.length + 1;

    let cp: ReplayCheckpoint = checkpoint ?? {
      sessionId,
      lessonId,
      totalStrokeBatches: manifest.strokeBatches.length,
      totalAudioChunks: manifest.chunks.length,
      totalMediaAssets: manifest.mediaAssets.length,
      downloadedStrokeBatchKeys: [],
      downloadedAudioChunkIndexes: [],
      downloadedMediaIds: [],
      manifestSaved: false,
      completed: false,
      updatedAt: new Date().toISOString(),
    };

    cp.totalStrokeBatches = manifest.strokeBatches.length;
    cp.totalAudioChunks = manifest.chunks.length;
    cp.totalMediaAssets = manifest.mediaAssets.length;
    cp.manifestSaved = true;
    cp.updatedAt = new Date().toISOString();
    writeCheckpoint(cp);

    const cachedAudioIndexes = new Set(cachedAudio.map((a) => a.batchId));
    const cachedStrokeIds = new Set(cachedStrokes.map((s) => s.id));

    let completedItems =
      (cp.manifestSaved ? 1 : 0) +
      cp.downloadedStrokeBatchKeys.length +
      cp.downloadedAudioChunkIndexes.length +
      cp.downloadedMediaIds.length;

    const updateProgress = (label: string) => {
      const pct = Math.min(100, Math.round((completedItems / Math.max(1, totalItems)) * 100));
      setStatusText(label);
      setProgress(pct);
    };

    updateProgress("Manifest saved. Preparing stroke batches...");

    // Checkpoint can become stale (for example after DB clear), so do not use
    // it as the source of truth for skipping stroke batch fetches.
    // We always fetch stroke batches and then dedupe by stroke id locally.

    for (const strokeBatchRef of manifest.strokeBatches) {
      const batch = await boardSessionService.getBatchByIndexKey(sessionId, strokeBatchRef.indexKey);
      if (!batch) continue;

      // Student payloads can occasionally contain stroke start/end clocks that
      // drift outside the batch window. Re-anchor strokes to their batch window
      // so board rendering advances with replay time and audio progression.
      const batchStartMs = Math.max(0, strokeBatchRef.startMs ?? batch.startMs ?? 0);
      const batchEndMs = Math.max(batchStartMs + 1000, strokeBatchRef.endMs ?? batch.endMs ?? batchStartMs + 60000);
      const batchWindowMs = Math.max(1000, batchEndMs - batchStartMs);

      const strokesByTimestamp = [...batch.strokes].sort(
        (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
      );

      const validTimestamps = strokesByTimestamp
        .map((stroke) => stroke.timestamp)
        .filter((ts): ts is number => typeof ts === "number" && Number.isFinite(ts));

      const minTimestamp = validTimestamps.length > 0 ? Math.min(...validTimestamps) : null;
      const maxTimestamp = validTimestamps.length > 0 ? Math.max(...validTimestamps) : null;

      const normalized = strokesByTimestamp.map((stroke, index) => {
        const duration = Math.max(50, stroke.duration ?? 0);
        const providedStartMs = clockToMs(stroke.startTime);
        const startWithinBatch =
          Number.isFinite(providedStartMs) &&
          providedStartMs >= batchStartMs - 2000 &&
          providedStartMs <= batchEndMs + 2000;

        let alignedStartMs: number;
        if (startWithinBatch) {
          alignedStartMs = providedStartMs;
        } else if (
          minTimestamp !== null &&
          maxTimestamp !== null &&
          maxTimestamp > minTimestamp &&
          typeof stroke.timestamp === "number" &&
          Number.isFinite(stroke.timestamp)
        ) {
          const ratio = (stroke.timestamp - minTimestamp) / (maxTimestamp - minTimestamp);
          alignedStartMs = batchStartMs + Math.round(ratio * Math.max(0, batchWindowMs - duration));
        } else {
          const spreadRatio = index / Math.max(1, strokesByTimestamp.length - 1);
          alignedStartMs = batchStartMs + Math.round(spreadRatio * Math.max(0, batchWindowMs - duration));
        }

        alignedStartMs = Math.max(batchStartMs, Math.min(alignedStartMs, Math.max(batchStartMs, batchEndMs - duration)));

        const providedEndMs = clockToMs(stroke.endTime);
        const endFromProvided =
          Number.isFinite(providedEndMs) && providedEndMs >= alignedStartMs
            ? providedEndMs
            : alignedStartMs + duration;

        const alignedEndMs = Math.max(alignedStartMs + 50, Math.min(batchEndMs, endFromProvided));

        return {
          ...stroke,
          sessionId,
          timestamp: sessionStartWallMs + alignedStartMs,
          startTime: toMmSs(alignedStartMs),
          endTime: toMmSs(alignedEndMs),
          duration: Math.max(50, alignedEndMs - alignedStartMs),
        };
      });

      const missing = normalized.filter((stroke) => !cachedStrokeIds.has(stroke.id));
      if (missing.length > 0) {
        await addStrokes(missing);
        missing.forEach((stroke) => cachedStrokeIds.add(stroke.id));
      }

      if (!cp.downloadedStrokeBatchKeys.includes(strokeBatchRef.indexKey)) {
        cp.downloadedStrokeBatchKeys.push(strokeBatchRef.indexKey);
      }
      cp.updatedAt = new Date().toISOString();
      writeCheckpoint(cp);

      completedItems += 1;
      updateProgress(`Downloaded board batch ${strokeBatchRef.batchIndex + 1}/${manifest.strokeBatches.length}`);
    }


    for (const chunk of manifest.chunks) {
      // Skip only when the chunk is truly present in IndexedDB for this session.
      // Checkpoint flags alone are not reliable after local cache resets.
      if (cachedAudioIndexes.has(chunk.index)) {
        if (!cp.downloadedAudioChunkIndexes.includes(chunk.index)) {
          cp.downloadedAudioChunkIndexes.push(chunk.index);
          cp.updatedAt = new Date().toISOString();
          writeCheckpoint(cp);
        }
        continue;
      }

      // Skip chunks with no audio content (sizeBytes=0 means the server
      // uploaded nothing for this sub-segment). Without this, the player
      // would create a phantom audio batch that fails immediately in
      // onError, causing playedSessionMsRef to jump the full chunk window
      // in one frame — producing the "board rushes to 1 min" effect.
      if (chunk.audio.sizeBytes === 0) {
        cachedAudioIndexes.add(chunk.index);
        completedItems += 1;
        updateProgress(`Skipped empty audio chunk ${chunk.index + 1}/${manifest.chunks.length}`);
        continue;
      }

      const audioResponse = await fetch(chunk.audio.url);
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio chunk ${chunk.index}.`);
      }

      const blob = await audioResponse.blob();
      const chunkWindowDurationMs = Math.max(1000, chunk.endMs - chunk.startMs);
      // Use the actual audio blob duration (mirrors useAudioRecorder approach).
      // Anchoring to the chunk window end causes plannedEndMs to jump to the window
      // end even when the audio file is shorter, triggering a spurious gap-fill that
      // races the timer to 1 minute.
      const actualDurationMs = Math.max(1000, chunk.audio.durationMs > 0 ? chunk.audio.durationMs : chunkWindowDurationMs);
      const audioBatch: AudioBatch = {
        id: `${sessionId}_audio_${chunk.index}`,
        type: "audio",
        sessionId,
        batchId: chunk.index,
        timestamp: sessionStartWallMs + chunk.startMs + actualDurationMs,
        blob,
        duration: actualDurationMs / 1000,
        size: chunk.audio.sizeBytes,
      };

      await addAudio(audioBatch);
      cachedAudioIndexes.add(chunk.index);

      cp.downloadedAudioChunkIndexes.push(chunk.index);
      cp.updatedAt = new Date().toISOString();
      writeCheckpoint(cp);

      completedItems += 1;
      updateProgress(`Downloaded audio chunk ${chunk.index + 1}/${manifest.chunks.length}`);
    }


    if (typeof window !== "undefined" && "caches" in window) {
      const cache = await caches.open(LESSON_MEDIA_CACHE);

      for (const media of manifest.mediaAssets) {
        if (cp.downloadedMediaIds.includes(media.id)) continue;

        const lessonScopedKey = buildLessonScopedCacheKey(lessonId, media.url);
        let response = await cache.match(lessonScopedKey);
        if (!response) {
          response = await cache.match(media.url);
        }

        if (!response) {
          const fetched = await fetch(media.url);
          if (!fetched.ok) {
            throw new Error(`Failed to download media ${media.name}.`);
          }
          await cache.put(media.url, fetched.clone());
          await cache.put(lessonScopedKey, fetched.clone());
        }

        cp.downloadedMediaIds.push(media.id);
        cp.updatedAt = new Date().toISOString();
        writeCheckpoint(cp);

        completedItems += 1;
        updateProgress(`Downloaded media ${cp.downloadedMediaIds.length}/${manifest.mediaAssets.length}`);
      }
    }

    cp.completed = true;
    cp.updatedAt = new Date().toISOString();
    writeCheckpoint(cp);

    setProgress(100);
    setStatusText("Replay data is ready. Launching player...");
    localStorage.setItem("replaySessionId", sessionId);
  }, [checkpoint, lessonId, sessionId, writeCheckpoint]);

  const handlePrepareAndWatch = useCallback(async () => {
    try {
      await ensureReplayData();
      toast.success("Replay ready");
      navigate(`/student/recorded-class/${lessonId}/replay`, {
        state: { sessionId, lessonId },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare replay.";
      setStatusText(message);
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  }, [ensureReplayData, lessonId, navigate, sessionId]);

  const completedLabel = checkpoint?.completed ? "Cached locally" : "Not fully cached";

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Recorded Class Replay</h1>
            <p className="mt-1 text-sm text-slate-500">Session: {sessionId || "N/A"}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>{completedLabel}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Download Progress</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#4F61E8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">{statusText}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={handlePrepareAndWatch}
            disabled={isRunning || !sessionId || !lessonId}
            className="rounded-full bg-student-chestnut px-5 py-2 text-sm font-semibold text-white hover:bg-[#4052D6] disabled:opacity-60"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            <span>{isRunning ? "Preparing..." : "Prepare & Watch"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrepareAndWatch}
            disabled={isRunning || !sessionId || !lessonId}
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Resume Download</span>
          </Button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">How this works</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Manifest is fetched first and saved as local replay metadata.</li>
            <li>Board stroke batches are downloaded individually and saved in IndexedDB.</li>
            <li>Audio chunks are downloaded individually and saved in IndexedDB.</li>
            <li>Media assets are stored in Cache API for offline replay rendering.</li>
            <li>If network breaks, resume continues from the last successful item.</li>
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Download className="h-3.5 w-3.5" />
          <span>Replay cache persists between sessions for faster next watch.</span>
        </div>
      </div>
    </div>
  );
};

export default WatchClass;