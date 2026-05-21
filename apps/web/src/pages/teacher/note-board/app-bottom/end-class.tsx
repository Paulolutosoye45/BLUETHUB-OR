import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@bluethub/ui-kit";
import PhoneIcon from "@/assets/svg/phone.svg?react";
import { Upload, Trash2, X, AlertTriangle, Loader2, CheckCircle, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setEndClass } from "@/store/class-action-slice";
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { useSession } from "@/contexts/session-context";
import { useSessionUpload, type UploadResults } from "@/hooks/useSessionUpload";
import { boardSessionService, type SessionManifestPayload } from "@/services/board-session";
import type { RootState } from "@/store";
import {
  getSession,
  updateSession,
  cleanupEntireSession,
  saveSessionAsDraft,
  getAllSessions,
  getAudioChunksBySession,
  getStrokeBatchesBySession,
} from "@/utils/db";
import type { LocalSession } from "@/utils/constant";

type ModalState = "closed" | "confirm" | "discard-confirm" | "uploading" | "complete" | "error" | "draft-saved" | "pending-uploads";

const EndClass = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stopRecording } = useSession();
  const sessionId = useSelector((state: RootState) => state.action.sessionIdRef);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);

  const timer = useGlobalTimer({});

  const [modalState, setModalState] = useState<ModalState>("closed");
  const [uploadProgress, setUploadProgress] = useState({ phase: "", current: 0, total: 0, percentage: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingUploads, setPendingUploads] = useState<LocalSession[]>([]);
  const [selectedPendingSessionId, setSelectedPendingSessionId] = useState<string | null>(null);
  const allowExitRef = useRef(false);
  const backGuardInstalledRef = useRef(false);

  // Token-based upload hook
  const { uploadSession, abort: abortUpload } = useSessionUpload();

  // Class hasn't started yet if no time has elapsed
  const classNotStarted = timerElapsedSeconds === 0;

  useEffect(() => {
    if (classNotStarted || backGuardInstalledRef.current) return;

    const onPopState = () => {
      if (allowExitRef.current) return;
      // Keep user on board route and show existing end-class options.
      window.history.pushState({ boardExitGuard: true }, "", window.location.href);
      setModalState((prev) => (prev === "uploading" ? prev : "confirm"));
    };

    window.history.pushState({ boardExitGuard: true }, "", window.location.href);
    window.addEventListener("popstate", onPopState);
    backGuardInstalledRef.current = true;

    return () => {
      window.removeEventListener("popstate", onPopState);
      backGuardInstalledRef.current = false;
    };
  }, [classNotStarted]);

  const handleEndClick = () => {
    if (classNotStarted) {
      toast.error("Class hasn't started yet");
      return;
    }
    void loadPendingUploads();
    setModalState("confirm");
  };

  const handleClose = () => {
    if (modalState === "uploading") {
      // Abort ongoing upload
      abortUpload();
    }
    setModalState("closed");
    setUploadProgress({ phase: "", current: 0, total: 0, percentage: 0 });
    setErrorMessage("");
    setSelectedPendingSessionId(null);
  };

  const loadPendingUploads = async () => {
    const sessions = await getAllSessions();
    const pending = sessions
      .filter((s) => Boolean(s.uploadRequested) && s.status !== "published")
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    setPendingUploads(pending);
  };

  const handleOpenPendingUploads = async () => {
    await loadPendingUploads();
    setModalState("pending-uploads");
  };

  const handleDiscard = async () => {
    setModalState("discard-confirm");
  };

  const handleConfirmDiscard = async () => {
    try {
      // Stop recording first
      stopRecording();
      dispatch(setEndClass());
      timer.stop();

      // Delete all local data
      if (sessionId) {
        await cleanupEntireSession(sessionId);
      }

      // Clear localStorage
      localStorage.removeItem("currentBatches");
      localStorage.removeItem("sessionStartWallMs");
      localStorage.removeItem("recordingStartTimerMs");

      toast.success("Recording discarded");
      allowExitRef.current = true;
      navigate("/teacher");
      setModalState("closed");
    } catch (err) {
      console.error("Failed to discard:", err);
      toast.error("Failed to discard recording");
    }
  };

  const handleSaveAsDraft = async () => {
    console.log("[SaveDraft] === STARTING SAVE AS DRAFT ===");
    console.log("[SaveDraft] Current sessionId from Redux:", sessionId);
    console.log("[SaveDraft] Timer elapsed seconds:", timerElapsedSeconds);

    try {
      // Stop recording first
      console.log("[SaveDraft] Step 1: Stopping recording...");
      stopRecording();
      dispatch(setEndClass());
      timer.stop();

      // Wait for worker to finalize - give it time to complete IDB writes
      console.log("[SaveDraft] Step 2: Waiting 2s for worker to finalize...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get or generate a session ID
      const effectiveSessionId = sessionId || crypto.randomUUID();
      const sessionStartWallMs = parseInt(localStorage.getItem('sessionStartWallMs') || '0', 10);
      const totalPausedMs = parseInt(localStorage.getItem('totalPausedMs') || '0', 10);
      const durationMs = timerElapsedSeconds * 1000;

      console.log("[SaveDraft] Step 3: Preparing session data");
      console.log("[SaveDraft]   - effectiveSessionId:", effectiveSessionId);
      console.log("[SaveDraft]   - sessionStartWallMs:", sessionStartWallMs);
      console.log("[SaveDraft]   - totalPausedMs:", totalPausedMs);
      console.log("[SaveDraft]   - durationMs:", durationMs);

      // Create session data object
      const sessionData: LocalSession = {
        id: effectiveSessionId,
        lessonId: `draft_${effectiveSessionId}`,
        schoolId: "local",
        status: "draft",
        uploadRequested: false,
        teacher: {
          id: "local",
          name: "Teacher",
          email: "",
        },
        lesson: {
          topic: `Draft Recording - ${new Date().toLocaleDateString()}`,
          subTopic: "",
          aim: "",
          subjectId: "",
          subjectName: "Unsaved Class",
          classroomId: "",
          className: "Local Recording",
        },
        recording: {
          startedAt: new Date(sessionStartWallMs || Date.now()).toISOString(),
          endedAt: new Date().toISOString(),
          totalDurationMs: durationMs,
          pausedDurationMs: totalPausedMs,
          deviceType: "desktop",
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        },
        totalAudioChunks: 0,
        totalStrokeBatches: 0,
        syncProgress: {
          audioSent: 0,
          audioFailed: 0,
          strokesSent: 0,
          strokesFailed: 0,
          manifestSent: false,
        },
        adjustments: {
          trimStartMs: 0,
          trimEndMs: 0,
          deletedSections: [],
          chapters: [],
        },
        mediaEvents: [],
        boardEvents: [],
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };

      // Use dedicated saveSessionAsDraft function with fresh DB connection
      // This avoids transaction conflicts with the worker's connection
      console.log("[SaveDraft] Step 4: Calling saveSessionAsDraft...");
      await saveSessionAsDraft(effectiveSessionId, sessionData);
      console.log("[SaveDraft] Step 5: Session saved successfully!");

      toast.success("Recording saved as draft");

      // Navigate directly to drafts page
      navigate("/teacher/drafts");
      setModalState("closed");
    } catch (err) {
      // Log FULL error details
      console.error("[SaveDraft] ========== SAVE DRAFT FAILED ==========");
      console.error("[SaveDraft] Error object:", err);
      console.error("[SaveDraft] Error name:", err instanceof Error ? err.name : 'N/A');
      console.error("[SaveDraft] Error message:", err instanceof Error ? err.message : String(err));
      console.error("[SaveDraft] Error stack:", err instanceof Error ? err.stack : 'N/A');

      // Also try to get IndexedDB state for debugging
      try {
        const dbNames = await indexedDB.databases();
        console.error("[SaveDraft] Available databases:", dbNames);
      } catch (dbErr) {
        console.error("[SaveDraft] Could not list databases:", dbErr);
      }

      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save draft: ${errorMsg}`);
    }
  };

  const uploadBySessionId = async (targetSessionId: string, opts?: { stopActiveRecording?: boolean; navigateOnSuccess?: boolean }) => {
    const shouldStopActiveRecording = opts?.stopActiveRecording ?? false;
    const shouldNavigateOnSuccess = opts?.navigateOnSuccess ?? false;

    setModalState("uploading");
    setUploadProgress({ phase: "Preparing...", current: 0, total: 0, percentage: 0 });

    try {
      if (shouldStopActiveRecording) {
        await stopRecording();
        dispatch(setEndClass());
        timer.stop();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const existingSession = await getSession(targetSessionId);
      if (existingSession) {
        existingSession.uploadRequested = true;
        existingSession.status = "publishing";
        await updateSession(existingSession);
      }

      setUploadProgress({ phase: "Starting upload...", current: 0, total: 0, percentage: 0 });

      const results = await uploadSession(targetSessionId, {
        concurrency: 2,
        onProgress: (state) => {
          const phaseLabel = state.phase === 'audio'
            ? 'Uploading audio...'
            : state.phase === 'strokes'
              ? 'Uploading board data...'
              : state.phase === 'complete'
                ? 'Complete!'
                : 'Preparing...';
          setUploadProgress({
            phase: phaseLabel,
            current: state.currentChunk,
            total: state.totalChunks,
            percentage: state.overallProgress,
          });
        },
      });

      if (!results.success) {
        throw new Error(results.errors.join('; ') || 'Upload failed');
      }

      setUploadProgress({ phase: "Finalizing...", current: 0, total: 1, percentage: 95 });

      const finalizedSession = await getSession(targetSessionId);
      if (finalizedSession) {
        const manifest = await buildManifest(finalizedSession, results);
        await boardSessionService.submitManifest(targetSessionId, manifest);

        finalizedSession.status = "published";
        finalizedSession.uploadRequested = false;
        finalizedSession.syncProgress.manifestSent = true;
        await updateSession(finalizedSession);
      }

      setUploadProgress({ phase: "Complete!", current: 1, total: 1, percentage: 100 });
      toast.success("Lesson uploaded successfully!");

      if (shouldNavigateOnSuccess) {
        allowExitRef.current = true;
        navigate("/teacher");
      } else {
        await loadPendingUploads();
        setModalState("pending-uploads");
      }
    } catch (err) {
      const uploadError = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload failed:", err);

      const failedSession = await getSession(targetSessionId);
      if (failedSession) {
        failedSession.status = "failed";
        failedSession.uploadRequested = true;
        await updateSession(failedSession);
      }

      setErrorMessage(uploadError);
      setModalState("error");
    }
  };

  const handleUpload = async () => {
    if (!sessionId) {
      toast.error("No session ID");
      return;
    }
    await uploadBySessionId(sessionId, { stopActiveRecording: true, navigateOnSuccess: true });
  };

  const handleRetryPendingUpload = async (targetSessionId: string) => {
    setSelectedPendingSessionId(targetSessionId);
    await uploadBySessionId(targetSessionId, { stopActiveRecording: false, navigateOnSuccess: false });
    setSelectedPendingSessionId(null);
  };

  // Build manifest from local session and upload results using actual IDB timing data
  const buildManifest = async (
    session: Awaited<ReturnType<typeof getSession>>,
    uploadResults: UploadResults
  ): Promise<SessionManifestPayload> => {
    if (!session) {
      throw new Error('Session not found');
    }

    const { audioUrls, strokeBatches: uploadedStrokeBatches } = uploadResults;

    // Fetch actual timing data from IDB
    const allAudioChunks = await getAudioChunksBySession(session.id);
    const allStrokeBatches = await getStrokeBatchesBySession(session.id);

    // Build a map of uploadBatchIndex → actual startMs/endMs from IDB audio chunks
    // Each upload batch (60s) covers 6 × 10s local chunks — take min startMs / max endMs
    const audioBatchTimings = new Map<number, { startMs: number; endMs: number; sizeBytes: number }>();
    for (const chunk of allAudioChunks) {
      const idx = chunk.uploadBatchIndex;
      const existing = audioBatchTimings.get(idx);
      audioBatchTimings.set(idx, {
        startMs: existing ? Math.min(existing.startMs, chunk.startMs) : chunk.startMs,
        endMs: existing ? Math.max(existing.endMs, chunk.endMs) : chunk.endMs,
        sizeBytes: (existing?.sizeBytes ?? 0) + chunk.sizeBytes,
      });
    }

    // Build a map of batchIndex → actual IDB stroke batch record
    const strokeBatchMap = new Map<number, typeof allStrokeBatches[0]>();
    for (const batch of allStrokeBatches) {
      strokeBatchMap.set(batch.batchIndex, batch);
    }

    // Build chunks array with actual timestamps and events
    const chunks = audioUrls.map((audio) => {
      const timing = audioBatchTimings.get(audio.chunkIndex);
      const startMs = timing?.startMs ?? audio.chunkIndex * 60000;
      const endMs = timing?.endMs ?? (audio.chunkIndex + 1) * 60000;
      const sizeBytes = timing?.sizeBytes ?? 150000;

      // Collect board/media events that fall within this audio chunk's time window
      const events: unknown[] = [];

      session.mediaEvents
        .filter(e => {
          const ms = e.showMs ?? 0;
          return ms >= startMs && ms < endMs;
        })
        .forEach(e => {
          events.push({ type: 'media:show', timestampMs: e.showMs ?? 0, mediaAssetId: e.id });
          if (e.closed !== null && e.closedMs !== undefined && e.closedMs >= startMs && e.closedMs < endMs) {
            events.push({ type: 'media:hide', timestampMs: e.closedMs, mediaAssetId: e.id });
          }
        });

      session.boardEvents
        .filter(e => e.timestampMs >= startMs && e.timestampMs < endMs)
        .forEach(e => {
          events.push({ type: 'board:switch', timestampMs: e.timestampMs, fromBoard: e.fromBoard, toBoard: e.toBoard });
        });

      (events as Array<{ timestampMs: number }>).sort((a, b) => a.timestampMs - b.timestampMs);

      return {
        index: audio.chunkIndex,
        startMs,
        endMs,
        audio: {
          url: audio.url,
          mediaId: audio.mediaId,
          sizeBytes,
          durationMs: endMs - startMs,
        },
        events,
      };
    });

    // Build stroke batches with actual timing from IDB
    const strokeBatchesManifest = uploadedStrokeBatches.map((uploaded) => {
      const idbBatch = strokeBatchMap.get(uploaded.batchIndex);
      return {
        id: uploaded.id,
        batchIndex: uploaded.batchIndex,
        indexKey: uploaded.indexKey,
        startMs: idbBatch?.startMs ?? uploaded.batchIndex * 60000,
        endMs: idbBatch?.endMs ?? (uploaded.batchIndex + 1) * 60000,
        strokeCount: idbBatch?.strokeCount ?? 0,
        sizeBytes: idbBatch?.sizeBytes ?? 5000,
      };
    });

    // Collect unique board indices from stroke data
    const boardIndices = new Set<number>();
    allStrokeBatches.forEach(b => b.strokes.forEach(s => boardIndices.add(s.currentBoard)));
    if (boardIndices.size === 0) boardIndices.add(0);

    const totalAudioSizeBytes = allAudioChunks
      .filter(c => c.syncStatus === 'sent')
      .reduce((sum, c) => sum + c.sizeBytes, 0);

    return {
      version: "2.0",
      session: {
        id: session.id,
        lessonId: session.lessonId,
        schoolId: session.schoolId,
        recordedAt: session.recording.startedAt,
        publishedAt: new Date().toISOString(),
        teacher: { id: session.teacher.id, name: session.teacher.name },
      },
      lesson: {
        topic: session.lesson.topic,
        subTopic: session.lesson.subTopic,
        aim: session.lesson.aim,
        subject: { id: session.lesson.subjectId, name: session.lesson.subjectName },
        classroom: { id: session.lesson.classroomId, name: session.lesson.className },
      },
      stats: {
        totalDurationMs: session.recording.totalDurationMs,
        totalDurationFormatted: formatDuration(session.recording.totalDurationMs),
        chunkCount: audioUrls.length,
        chunkDurationMs: 60000,
        seekGranularityMs: 10000,
        totalAudioSizeBytes,
        totalStrokeCount: allStrokeBatches.reduce((sum, b) => sum + b.strokeCount, 0),
        boardCount: boardIndices.size,
        strokeBatchCount: uploadedStrokeBatches.length,
      },
      chunks,
      strokeBatches: strokeBatchesManifest,
      mediaAssets: session.mediaEvents
        .filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i)
        .map((m) => ({ id: m.id, name: m.name, type: m.type, url: m.url })),
      boards: Array.from(boardIndices).sort().map(index => ({
        index,
        dimensions: { width: session.recording.screenWidth, height: session.recording.screenHeight },
        strokeCount: allStrokeBatches.flatMap(b => b.strokes).filter(s => s.currentBoard === index).length,
      })),
      chapters: session.adjustments.chapters.map((c) => ({
        title: c.label,
        startMs: c.timestampMs,
        endMs: c.timestampMs,
      })),
    };
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const progressPercent = uploadProgress.percentage > 0
    ? uploadProgress.percentage
    : (uploadProgress.total > 0 ? Math.round((uploadProgress.current / uploadProgress.total) * 100) : 0);

  return (
    <>
      <Button
        onClick={handleEndClick}
        disabled={classNotStarted}
        title={classNotStarted ? "Start the class first" : "End class"}
        className="size-10 cursor-pointer rounded-full bg-[#D92D25] text-white shadow-md transition-all duration-200 hover:bg-[#B61F19] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PhoneIcon className="size-5 text-white" />
      </Button>

      {/* Modal rendered via portal to escape parent positioning */}
      {modalState !== "closed" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalState === "confirm" && "End Class"}
                {modalState === "discard-confirm" && "Discard Recording?"}
                {modalState === "uploading" && "Uploading Lesson"}
                {modalState === "complete" && "Upload Complete"}
                {modalState === "error" && "Upload Failed"}
                {modalState === "draft-saved" && "Draft Saved"}
                {modalState === "pending-uploads" && "Pending Uploads"}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                title={modalState === "uploading" ? "Cancel upload" : "Close"}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {/* Confirm State */}
              {modalState === "confirm" && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    What would you like to do with this recording?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleUpload}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-blue-600" />
                      <span className="font-medium text-blue-900">Upload</span>
                      <span className="text-xs text-blue-600 text-center">
                        Publish for students
                      </span>
                    </button>
                    <button
                      onClick={handleSaveAsDraft}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-amber-200 bg-amber-50 rounded-xl hover:border-amber-400 hover:bg-amber-100 transition-colors"
                    >
                      <Save className="w-8 h-8 text-amber-600" />
                      <span className="font-medium text-amber-900">Save Draft</span>
                      <span className="text-xs text-amber-600 text-center">
                        Upload later
                      </span>
                    </button>
                    <button
                      onClick={handleDiscard}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 bg-gray-50 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors group"
                    >
                      <Trash2 className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
                      <span className="font-medium text-gray-700 group-hover:text-red-700">Discard</span>
                      <span className="text-xs text-gray-500 group-hover:text-red-500 text-center">
                        Delete recording
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={handleOpenPendingUploads}
                    className="w-full flex items-center justify-center gap-2 p-3 border border-indigo-200 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-700" />
                    <span className="text-sm font-medium text-indigo-800">View Pending Uploads</span>
                    {pendingUploads.length > 0 && (
                      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                        {pendingUploads.length}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* Pending Uploads State */}
              {modalState === "pending-uploads" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Lessons you selected for upload but are not fully pushed yet.
                  </p>

                  {pendingUploads.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                      No pending uploads. Only lessons where Upload was selected appear here.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {pendingUploads.map((pending) => (
                        <div key={pending.id} className="rounded-lg border border-gray-200 p-3 bg-white">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{pending.lesson.topic || "Untitled lesson"}</p>
                              <p className="text-xs text-gray-500 truncate">{pending.lesson.subTopic || "No subtopic"}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Status: <span className="font-medium text-gray-700">{pending.status}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => void handleRetryPendingUpload(pending.id)}
                              disabled={selectedPendingSessionId === pending.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                            >
                              {selectedPendingSessionId === pending.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              Push
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalState("confirm")}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => void loadPendingUploads()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {/* Discard Confirm State */}
              {modalState === "discard-confirm" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Are you sure?</p>
                      <p className="text-sm text-red-700 mt-1">
                        All audio and board recordings will be permanently deleted. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalState("confirm")}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleConfirmDiscard}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Yes, Delete Everything
                    </button>
                  </div>
                </div>
              )}

              {/* Uploading State */}
              {modalState === "uploading" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="font-medium text-gray-900">{uploadProgress.phase}</span>
                  </div>
                  {(uploadProgress.total > 0 || uploadProgress.percentage > 0) && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          {uploadProgress.current} / {uploadProgress.total} chunks
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Uploading via direct transfer...
                    </p>
                    <button
                      onClick={handleClose}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Complete State */}
              {modalState === "complete" && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Your lesson has been uploaded and is now available for students.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Draft Saved State */}
              {modalState === "draft-saved" && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                      <Save className="w-10 h-10 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-gray-600">
                    Your recording has been saved as a draft. You can continue or upload it later.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigate("/teacher/drafts")}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                    >
                      View Drafts
                    </button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {modalState === "error" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Upload Failed</p>
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Your recording is saved locally. You can try uploading again later from your lessons.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => void handleOpenPendingUploads()}
                      className="flex-1 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                    >
                      Pending Uploads
                    </button>
                    <button
                      onClick={handleUpload}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EndClass;
