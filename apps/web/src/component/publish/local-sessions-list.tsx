import { useState, useEffect } from 'react';
import { Loader2, Upload, Trash2, PlayCircle, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useSyncContext } from '@/contexts/sync-context';
import type { LocalSession } from '@/utils/constant';
import { PublishSessionModal } from './publish-session-modal';

interface LocalSessionsListProps {
  onSessionSelect?: (session: LocalSession) => void;
  showPublished?: boolean;
}

export function LocalSessionsList({ onSessionSelect, showPublished = true }: LocalSessionsListProps) {
  const { getLocalSessions, cleanupSession } = useSyncContext();
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const allSessions = await getLocalSessions();
      const filtered = showPublished
        ? allSessions
        : allSessions.filter((s) => s.status !== 'published');
      setSessions(filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [getLocalSessions, showPublished]);

  const handlePublish = (session: LocalSession) => {
    setSelectedSessionId(session.id);
    setShowPublishModal(true);
  };

  const handleDelete = async (session: LocalSession) => {
    if (!confirm('Delete this recording? This cannot be undone.')) return;

    setDeletingId(session.id);
    try {
      await cleanupSession(session.id, true);
      loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recording':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Recording
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <CheckCircle className="w-3 h-3" />
            Ready to Publish
          </span>
        );
      case 'publishing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <Loader2 className="w-3 h-3 animate-spin" />
            Publishing
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No recordings found</p>
        <p className="text-sm text-gray-400 mt-1">
          Your recorded lessons will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {session.lesson.topic}
                  </h3>
                  {getStatusBadge(session.status)}
                </div>
                <p className="text-sm text-gray-600 truncate">{session.lesson.subTopic}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{session.lesson.className}</span>
                  <span>•</span>
                  <span>{session.lesson.subjectName}</span>
                  <span>•</span>
                  <span>{formatDuration(session.recording.totalDurationMs)}</span>
                  <span>•</span>
                  <span>{formatDate(session.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {session.status === 'completed' && (
                  <button
                    onClick={() => handlePublish(session)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Publish
                  </button>
                )}
                {session.status === 'failed' && (
                  <button
                    onClick={() => handlePublish(session)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Retry
                  </button>
                )}
                {onSessionSelect && (
                  <button
                    onClick={() => onSessionSelect(session)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <PlayCircle className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(session)}
                  disabled={deletingId === session.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === session.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sync Progress Indicator */}
            {(session.status === 'publishing' || session.syncProgress.audioSent > 0) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Audio: {session.syncProgress.audioSent}/{session.totalAudioChunks}
                  </span>
                  <span>
                    Strokes: {session.syncProgress.strokesSent}/{session.totalStrokeBatches}
                  </span>
                  {session.syncProgress.manifestSent && (
                    <span className="text-green-600">Manifest sent</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showPublishModal && selectedSessionId && (
        <PublishSessionModal
          sessionId={selectedSessionId}
          isOpen={showPublishModal}
          onClose={() => {
            setShowPublishModal(false);
            loadSessions();
          }}
          onPublished={() => {
            setShowPublishModal(false);
            loadSessions();
          }}
        />
      )}
    </>
  );
}

export default LocalSessionsList;
