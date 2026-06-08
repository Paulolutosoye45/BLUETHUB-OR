import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@bluethub/ui-kit";
import { CheckCircle2, Download, Loader2, PlayCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import boardSessionService from "@/services/board-session";
import { addAudio, addStrokes, getAudioBySession, getClassBySession } from "@/utils/db";
import type { AudioBatch, IActions, IBatch } from "@/utils/constant";
import { LESSON_MEDIA_CACHE, buildLessonScopedCacheKey } from "@/utils/lesson-media-cache";

type DownloadStage =
  | "idle"
  | "checking-local"
  | "downloading-manifest"
  | "downloading-strokes"
  | "downloading-audio"
  | "downloading-media"
  | "ready"
  | "error";

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

const parseClockToMs = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parts = value.split(":").map((part) => Number(part));
  if (parts.length === 2) {
    const [m, s] = parts;
    return (Math.max(0, m) * 60 + Math.max(0, s)) * 1000;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (Math.max(0, h) * 3600 + Math.max(0, m) * 60 + Math.max(0, s)) * 1000;
  }
  return 0;
};

const buildReplayBatches = (
  manifest: NonNullable<Awaited<ReturnType<typeof boardSessionService.getManifest>>>
): IActions => {
  const batches: IBatch[] = manifest.chunks.map((chunk) => {
    const mediaAction = manifest.mediaAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      url: asset.url,
      type: asset.type,
      show: toMmSs(chunk.startMs),
      closed: toMmSs(chunk.endMs),
      showMs: chunk.startMs,
      closedMs: chunk.endMs,
    }));

    return {
      startTime: toMmSs(chunk.startMs),
      endTime: toMmSs(chunk.endMs),
      hasAudio: true,
      hasBoard: true,
      mediaAction,
    };
  });

  return {
    totalDuration: manifest.stats.totalDurationMs,
    totalBatches: batches.length,
    batches,
  };
};

const WatchClass = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const location = useLocation();
  const locationState = (location.state as WatchLocationState | null) ?? null;

  const lessonId = locationState.lessonId ?? classId ?? "";
  const sessionId = locationState.sessionId ?? classId ?? "";

  const [stage, setStage] = useState<DownloadStage>("idle");
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
    setStage("checking-local");
    setStatusText("Checking local replay cache...");

    const cachedAudio = await getAudioBySession(sessionId);
    const cachedStrokes = await getClassBySession(sessionId);

    setStage("downloading-manifest");
    setStatusText("Downloading replay manifest...");
    setProgress(5);

    const manifest = await boardSessionService.getManifest(sessionId);
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
    setStage("downloading-strokes");
    for (const strokeBatchRef of manifest.strokeBatches) {
      const batch = await boardSessionService.getBatchByIndexKey(sessionId, strokeBatchRef.indexKey);
      if (!batch) continue;

      // Preserve the original wall-clock timestamp from the server — it has
      // ms precision and is already anchored to the real recording time.
      // Reconstructing it from startTime strings would lose precision and
      // break mapWallTsToAudioMs synchronisation in the replay engine.
      const normalized = batch.strokes.map((stroke) => ({
        ...stroke,
        sessionId,
      }));

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

    setStage("downloading-audio");
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

      const audioResponse = await fetch(chunk.audio.url);
      if (!audioResponse.ok) {
        throw new Error(`Failed to download audio chunk ${chunk.index}.`);
      }

      const blob = await audioResponse.blob();
      const audioBatch: AudioBatch = {
        id: `${sessionId}_audio_${chunk.index}`,
        type: "audio",
        sessionId,
        batchId: chunk.index,
        // Anchor to the real recording start so the replay engine's
        // mapWallTsToAudioMs can match stroke wall-clock timestamps to audio ranges.
        timestamp: sessionStartWallMs + Math.max(chunk.endMs, chunk.startMs + chunk.audio.durationMs),
        blob,
        duration: Math.max(1, chunk.audio.durationMs / 1000),
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

    setStage("downloading-media");
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

    setStage("ready");
    setProgress(100);
    setStatusText("Replay data is ready. Launching player...");
    localStorage.setItem("replaySessionId", sessionId);
  }, [checkpoint, lessonId, sessionId, writeCheckpoint]);

  const handlePrepareAndWatch = useCallback(async () => {
    try {
      await ensureReplayData();
      toast.success("Replay ready");
      navigate("/replay");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare replay.";
      setStage("error");
      setStatusText(message);
      toast.error(message);
    } finally {
      setIsRunning(false);
    }
  }, [ensureReplayData, navigate]);

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