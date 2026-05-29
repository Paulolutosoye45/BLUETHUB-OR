import { useState, useEffect } from 'react';
import { X, Upload, Pause, Play, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useSyncContext, useSyncStatus } from '@/contexts/sync-context';
import { lessonService, LessonMediaType } from '@/services/lesson';

interface PublishSessionModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
}

export function PublishSessionModal({
  sessionId,
  isOpen,
  onClose,
  onPublished,
}: PublishSessionModalProps) {
  const {
    isSyncing,
    isPaused,
    progress,
    error,
    startSync,
    pauseSync,
    resumeSync,
    cancelSync,
  } = useSyncContext();

  const { stats, session, loading, refresh } = useSyncStatus(sessionId);
  const [loadingSignature, setLoadingSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  const handlePublish = async () => {
    if (!session) return;

    setLoadingSignature(true);
    try {
      const signatureRes = await lessonService.getUploadSignature(LessonMediaType.Audio);
      if (!signatureRes.data.data) {
        throw new Error('Failed to get upload signature');
      }

      const cloudinaryConfig = signatureRes.data.data;
      startSync(sessionId, cloudinaryConfig);
    } catch (err) {
      console.error('Failed to start sync:', err);
    } finally {
      setLoadingSignature(false);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };


  if (!isOpen) return null;

  const isPublished = session?.status === 'published';
  const isCompleted = session?.status === 'completed';
  const canPublish = isCompleted && !isSyncing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Publish Recording</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSyncing}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : session ? (
            <>
              {/* Session Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-gray-900">{session.lesson.topic}</h3>
                <p className="text-sm text-gray-600">{session.lesson.subTopic}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  <span>Duration: {formatDuration(session.recording.totalDurationMs)}</span>
                  <span>Audio: {session.totalAudioChunks} chunks</span>
                  <span>Strokes: {session.totalStrokeBatches} batches</span>
                </div>
              </div>

              {/* Sync Status */}
              {stats && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Upload Status</h4>

                  {/* Audio Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Audio</span>
                      <span>
                        {stats.audioSent}/{stats.totalAudio} uploaded
                        {stats.audioFailed > 0 && (
                          <span className="text-red-500 ml-2">({stats.audioFailed} failed)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${stats.totalAudio > 0 ? (stats.audioSent / stats.totalAudio) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Strokes Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Board Updates</span>
                      <span>
                        {stats.strokesSent}/{stats.totalStrokes} uploaded
                        {stats.strokesFailed > 0 && (
                          <span className="text-red-500 ml-2">({stats.strokesFailed} failed)</span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{
                          width: `${stats.totalStrokes > 0 ? (stats.strokesSent / stats.totalStrokes) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Sync Progress */}
              {isSyncing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Uploading {progress.phase}...
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-blue-700">
                      <span>
                        {progress.current} / {progress.total}
                      </span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Upload Failed</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Published State */}
              {isPublished && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Successfully Published</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">Session not found</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {isSyncing ? (
            <>
              <button
                onClick={cancelSync}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isPaused ? resumeSync : pauseSync}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isPublished ? 'Close' : 'Cancel'}
              </button>
              {canPublish && (
                <button
                  onClick={handlePublish}
                  disabled={loadingSignature}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                >
                  {loadingSignature ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Publish
                </button>
              )}
              {isPublished && onPublished && (
                <button
                  onClick={onPublished}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Done
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublishSessionModal;
