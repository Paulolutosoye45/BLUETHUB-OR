/**
 * Pending Uploads Page
 *
 * Shows sessions with incomplete uploads and allows teachers to:
 * - View upload progress per session
 * - Resume interrupted uploads
 * - Retry failed batches
 * - Delete failed sessions
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  HardDrive,
  Music,
  Pencil,
  ChevronRight,
  Play,
  XCircle,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuthContext } from "@/contexts/auth-context";
import {
  getAllSessions,
  getAudioChunksBySession,
  getStrokeBatchesBySession,
  cleanupEntireSession,
} from "@/utils/db";
import type { LocalSession, LocalAudioChunk, LocalStrokeBatch } from "@/utils/constant";
import { useSessionUpload, type UploadResults } from "@/hooks/useSessionUpload";
import { boardSessionService } from "@/services/board-session";

// ── Types ────────────────────────────────────────────────────────────────────

interface SessionUploadStats {
  session: LocalSession;
  audioChunks: LocalAudioChunk[];
  strokeBatches: LocalStrokeBatch[];
  stats: {
    totalAudio: number;
    audioSent: number;
    audioPending: number;
    audioFailed: number;
    totalStrokes: number;
    strokesSent: number;
    strokesPending: number;
    strokesFailed: number;
    totalSizeBytes: number;
    uploadedSizeBytes: number;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusColor(session: SessionUploadStats): string {
  const { stats } = session;
  if (stats.audioFailed > 0 || stats.strokesFailed > 0) return "red";
  if (stats.audioPending > 0 || stats.strokesPending > 0) return "amber";
  if (stats.audioSent === stats.totalAudio && stats.strokesSent === stats.totalStrokes) return "green";
  return "blue";
}

function getStatusLabel(session: SessionUploadStats): string {
  const { stats } = session;
  if (stats.audioFailed > 0 || stats.strokesFailed > 0) return "Failed";
  if (stats.audioPending === 0 && stats.strokesPending === 0) return "Ready";
  return "Pending";
}

// ── Session Card Component ───────────────────────────────────────────────────

interface SessionCardProps {
  data: SessionUploadStats;
  isUploading: boolean;
  uploadProgress: number;
  onResume: () => void;
  onDelete: () => void;
  onRetryFailed: () => void;
}

function SessionCard({
  data,
  isUploading,
  uploadProgress,
  onResume,
  onDelete,
  onRetryFailed,
}: SessionCardProps) {
  const { session, stats } = data;
  const statusColor = getStatusColor(data);
  const statusLabel = getStatusLabel(data);

  const hasFailed = stats.audioFailed > 0 || stats.strokesFailed > 0;
  const isComplete = stats.audioPending === 0 && stats.strokesPending === 0 && !hasFailed;

  return (
    <div className={cn(
      "bg-white rounded-2xl border-2 overflow-hidden transition-all",
      statusColor === "red" && "border-red-200",
      statusColor === "amber" && "border-amber-200",
      statusColor === "green" && "border-green-200",
      statusColor === "blue" && "border-blue-200",
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        statusColor === "red" && "bg-red-50",
        statusColor === "amber" && "bg-amber-50",
        statusColor === "green" && "bg-green-50",
        statusColor === "blue" && "bg-blue-50",
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            statusColor === "red" && "bg-red-100 text-red-600",
            statusColor === "amber" && "bg-amber-100 text-amber-600",
            statusColor === "green" && "bg-green-100 text-green-600",
            statusColor === "blue" && "bg-blue-100 text-blue-600",
          )}>
            {hasFailed ? (
              <XCircle className="w-5 h-5" />
            ) : isComplete ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {session.lesson.subjectName || "Untitled Class"}
            </h3>
            <p className="text-xs text-gray-500">
              {session.lesson.className} • {formatDate(session.createdAt)}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-full",
          statusColor === "red" && "bg-red-100 text-red-700",
          statusColor === "amber" && "bg-amber-100 text-amber-700",
          statusColor === "green" && "bg-green-100 text-green-700",
          statusColor === "blue" && "bg-blue-100 text-blue-700",
        )}>
          {statusLabel}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Audio Progress */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Audio</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {stats.audioSent}/{stats.totalAudio}
          </p>
          <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${stats.totalAudio > 0 ? (stats.audioSent / stats.totalAudio) * 100 : 0}%` }}
            />
          </div>
          {stats.audioFailed > 0 && (
            <p className="text-xs text-red-500 mt-1">{stats.audioFailed} failed</p>
          )}
        </div>

        {/* Strokes Progress */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Pencil className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-600">Board</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {stats.strokesSent}/{stats.totalStrokes}
          </p>
          <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${stats.totalStrokes > 0 ? (stats.strokesSent / stats.totalStrokes) * 100 : 0}%` }}
            />
          </div>
          {stats.strokesFailed > 0 && (
            <p className="text-xs text-red-500 mt-1">{stats.strokesFailed} failed</p>
          )}
        </div>

        {/* Duration */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-600">Duration</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatDuration(session.recording.totalDurationMs)}
          </p>
        </div>

        {/* Size */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-600">Size</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatBytes(stats.totalSizeBytes)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatBytes(stats.uploadedSizeBytes)} uploaded
          </p>
        </div>
      </div>

      {/* Upload Progress Bar (when uploading) */}
      {isUploading && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
        <button
          onClick={onDelete}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete session"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {hasFailed && (
            <Button
              onClick={onRetryFailed}
              disabled={isUploading}
              variant="outline"
              className="h-9 px-3 text-sm font-medium rounded-lg border-red-200 text-red-600 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry Failed
            </Button>
          )}

          {!isComplete && (
            <Button
              onClick={onResume}
              disabled={isUploading}
              className={cn(
                "h-9 px-4 text-sm font-semibold rounded-lg text-white transition-all",
                isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5" />
                  Resume Upload
                </>
              )}
            </Button>
          )}

          {isComplete && (
            <Button
              onClick={onResume}
              disabled={isUploading}
              className="h-9 px-4 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/25"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

const PendingUploads = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [sessions, setSessions] = useState<SessionUploadStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(null);

  const { uploadSession, state: uploadState, reset: resetUpload } = useSessionUpload();

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load sessions with pending uploads
  const loadSessions = useCallback(async () => {
    if (!user?.id && !user?.emailAddress) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const allSessions = await getAllSessions();

      // Scope sessions to the currently logged-in teacher on shared browsers/devices.
      const userSessions = allSessions.filter((s) => {
        const byId = !!user?.id && s.teacher?.id === user.id;
        const byEmail = !!user?.emailAddress && s.teacher?.email === user.emailAddress;
        return byId || byEmail;
      });

      // Filter sessions that need upload (not published, has data)
      const pendingSessions = userSessions.filter(
        (s) => s.status !== "published" && (s.totalAudioChunks > 0 || s.totalStrokeBatches > 0)
      );

      // Load chunk data for each session
      const sessionsWithStats: SessionUploadStats[] = await Promise.all(
        pendingSessions.map(async (session) => {
          const audioChunks = await getAudioChunksBySession(session.id);
          const strokeBatches = await getStrokeBatchesBySession(session.id);

          const audioSent = audioChunks.filter((c) => c.syncStatus === "sent").length;
          const audioPending = audioChunks.filter((c) => c.syncStatus === "pending").length;
          const audioFailed = audioChunks.filter((c) => c.syncStatus === "failed").length;

          const strokesSent = strokeBatches.filter((b) => b.syncStatus === "sent").length;
          const strokesPending = strokeBatches.filter((b) => b.syncStatus === "pending").length;
          const strokesFailed = strokeBatches.filter((b) => b.syncStatus === "failed").length;

          const totalSizeBytes = audioChunks.reduce((sum, c) => sum + c.sizeBytes, 0) +
            strokeBatches.reduce((sum, b) => sum + b.sizeBytes, 0);

          const uploadedSizeBytes = audioChunks
            .filter((c) => c.syncStatus === "sent")
            .reduce((sum, c) => sum + c.sizeBytes, 0) +
            strokeBatches
              .filter((b) => b.syncStatus === "sent")
              .reduce((sum, b) => sum + b.sizeBytes, 0);

          return {
            session,
            audioChunks,
            strokeBatches,
            stats: {
              totalAudio: audioChunks.length,
              audioSent,
              audioPending,
              audioFailed,
              totalStrokes: strokeBatches.length,
              strokesSent,
              strokesPending,
              strokesFailed,
              totalSizeBytes,
              uploadedSizeBytes,
            },
          };
        })
      );

      // Sort by most recent first
      sessionsWithStats.sort(
        (a, b) => new Date(b.session.createdAt).getTime() - new Date(a.session.createdAt).getTime()
      );

      setSessions(sessionsWithStats);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      toast.error("Failed to load pending uploads");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.emailAddress]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Handle resume upload
  const handleResumeUpload = async (sessionId: string) => {
    if (!isOnline) {
      toast.error("No internet connection");
      return;
    }

    setUploadingSessionId(sessionId);
    resetUpload();

    try {
      const results = await uploadSession(sessionId, { concurrency: 2 });

      if (results.success) {
        // Submit manifest
        const sessionData = sessions.find((s) => s.session.id === sessionId);
        if (sessionData) {
          const manifest = buildManifestFromResults(sessionData.session, results);
          await boardSessionService.submitManifest(sessionId, manifest);
          toast.success("Upload complete! Lesson published.");
        }
      } else {
        toast.error(`Upload incomplete: ${results.errors.length} errors`);
      }

      // Reload sessions to reflect new status
      await loadSessions();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSessionId(null);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Delete this recording? This cannot be undone.")) return;

    try {
      await cleanupEntireSession(sessionId);
      toast.success("Session deleted");
      await loadSessions();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete session");
    }
  };

  // Handle retry failed
  const handleRetryFailed = async (sessionId: string) => {
    // The upload hook already handles retrying failed items
    await handleResumeUpload(sessionId);
  };

  // Build manifest from upload results
  // Note: Stroke batches are uploaded to MongoDB separately via submitBatch endpoint
  // The manifest references them by session-scoped batch ID (sessionId_batchIndex)
  const buildManifestFromResults = (session: LocalSession, results: UploadResults) => {
    const { audioUrls, strokeBatches } = results;

    return {
      version: "2.0" as const,
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
        chunkDurationMs: 60000,        // Upload batch size (60s)
        seekGranularityMs: 10000,      // Seeking granularity (10s) - for player skip controls
        totalAudioSizeBytes: audioUrls.length * 150000,
        totalStrokeCount: strokeBatches.length,
        boardCount: 1,
        strokeBatchCount: strokeBatches.length,
      },
      // Audio chunks (Cloudinary URLs) - 60s (1-minute) each
      chunks: audioUrls.map((audio, idx) => ({
        index: audio.chunkIndex,
        startMs: idx * 60000,
        endMs: (idx + 1) * 60000,
        audio: {
          url: audio.url,
          mediaId: audio.mediaId,
          sizeBytes: 150000, // ~150KB per 1-minute chunk
          durationMs: 60000,
        },
        events: [],
      })),
      // Stroke batches (stored in MongoDB, referenced by index key)
      strokeBatches: strokeBatches.map((batch) => ({
        id: batch.id,
        batchIndex: batch.batchIndex,
        indexKey: batch.indexKey, // sessionId_batchIndex
        startMs: batch.batchIndex * 60000, // 1-minute batches
        endMs: (batch.batchIndex + 1) * 60000,
        strokeCount: 0, // Will be populated from local data if needed
        sizeBytes: 5000, // Approximate
      })),
      mediaAssets: session.mediaEvents.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        url: m.url,
      })),
      boards: [{
        index: 1,
        dimensions: { width: session.recording.screenWidth, height: session.recording.screenHeight },
        strokeCount: strokeBatches.length,
      }],
      chapters: session.adjustments.chapters.map((c) => ({
        title: c.label,
        startMs: c.timestampMs,
        endMs: c.timestampMs,
      })),
    };
  };

  // Calculate totals
  const totalPending = sessions.reduce(
    (sum, s) => sum + s.stats.audioPending + s.stats.strokesPending,
    0
  );
  const totalFailed = sessions.reduce(
    (sum, s) => sum + s.stats.audioFailed + s.stats.strokesFailed,
    0
  );
  const totalSize = sessions.reduce((sum, s) => sum + s.stats.totalSizeBytes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Pending Uploads</h1>
                <p className="text-xs text-gray-500">
                  {sessions.length} session{sessions.length !== 1 ? "s" : ""} • {formatBytes(totalSize)}
                </p>
              </div>
            </div>

            {/* Network Status */}
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full",
              isOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Summary Banner */}
      {(totalPending > 0 || totalFailed > 0) && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">{totalPending} chunks</span> pending upload
                {totalFailed > 0 && (
                  <>, <span className="font-semibold text-red-600">{totalFailed} failed</span></>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              No pending uploads. All your class recordings have been uploaded successfully.
            </p>
            <Button
              onClick={() => navigate("/teacher")}
              className="mt-6 rounded-xl"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sessionData) => (
              <SessionCard
                key={sessionData.session.id}
                data={sessionData}
                isUploading={uploadingSessionId === sessionData.session.id}
                uploadProgress={
                  uploadingSessionId === sessionData.session.id
                    ? uploadState.overallProgress
                    : 0
                }
                onResume={() => handleResumeUpload(sessionData.session.id)}
                onDelete={() => handleDeleteSession(sessionData.session.id)}
                onRetryFailed={() => handleRetryFailed(sessionData.session.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingUploads;
