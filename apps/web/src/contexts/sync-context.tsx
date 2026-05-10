import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import type { LocalSession } from '@/utils/constant';
import {
  getSession,
  getAllSessions,
  getSessionsByStatus,
  getSessionSyncStats,
  cleanupPublishedSession,
  cleanupEntireSession,
} from '@/utils/db';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SyncPhase = 'idle' | 'audio' | 'strokes' | 'manifest';

export interface SyncProgress {
  phase: SyncPhase;
  current: number;
  total: number;
  percentage: number;
}

export interface SyncStats {
  totalAudio: number;
  audioSent: number;
  audioPending: number;
  audioFailed: number;
  totalStrokes: number;
  strokesSent: number;
  strokesPending: number;
  strokesFailed: number;
}

export interface SyncContextValue {
  // State
  isSyncing: boolean;
  isPaused: boolean;
  currentSessionId: string | null;
  progress: SyncProgress;
  error: string | null;

  // Actions
  startSync: (sessionId: string, cloudinaryConfig: CloudinaryConfig) => void;
  pauseSync: () => void;
  resumeSync: () => void;
  cancelSync: () => void;
  retrySync: () => void;

  // Queries
  getSyncStats: (sessionId: string) => Promise<SyncStats>;
  getLocalSessions: () => Promise<LocalSession[]>;
  getCompletedSessions: () => Promise<LocalSession[]>;
  getPublishedSessions: () => Promise<LocalSession[]>;
  getSessionById: (sessionId: string) => Promise<LocalSession | undefined>;

  // Cleanup
  cleanupSession: (sessionId: string, deleteAll?: boolean) => Promise<number>;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
}

// ── Worker Message Types ──────────────────────────────────────────────────────

type FromWorkerMsg =
  | { type: 'READY' }
  | { type: 'PROGRESS'; phase: SyncPhase; current: number; total: number }
  | { type: 'COMPLETE'; sessionId: string }
  | { type: 'ERROR'; error: string }
  | { type: 'PAUSED' }
  | { type: 'RESUMED' }
  | { type: 'CANCELLED' };

// ── Context ───────────────────────────────────────────────────────────────────

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

interface SyncProviderProps {
  children: React.ReactNode;
  onSyncComplete?: (sessionId: string) => void;
  onSyncError?: (sessionId: string, error: string) => void;
}

export function SyncProvider({ children, onSyncComplete, onSyncError }: SyncProviderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress>({
    phase: 'idle',
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const cloudinaryConfigRef = useRef<CloudinaryConfig | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const worker = new Worker(
      new URL('../workers/sync.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<FromWorkerMsg>) => {
      const msg = e.data;

      switch (msg.type) {
        case 'READY':
          console.log('[SyncContext] Worker ready');
          break;

        case 'PROGRESS':
          setProgress({
            phase: msg.phase,
            current: msg.current,
            total: msg.total,
            percentage: msg.total > 0 ? Math.round((msg.current / msg.total) * 100) : 0,
          });
          break;

        case 'COMPLETE':
          setIsSyncing(false);
          setProgress({ phase: 'idle', current: 0, total: 0, percentage: 100 });
          onSyncComplete?.(msg.sessionId);
          break;

        case 'ERROR':
          setError(msg.error);
          setIsSyncing(false);
          if (currentSessionId) {
            onSyncError?.(currentSessionId, msg.error);
          }
          break;

        case 'PAUSED':
          setIsPaused(true);
          break;

        case 'RESUMED':
          setIsPaused(false);
          break;

        case 'CANCELLED':
          setIsSyncing(false);
          setIsPaused(false);
          setCurrentSessionId(null);
          setProgress({ phase: 'idle', current: 0, total: 0, percentage: 0 });
          break;
      }
    };

    worker.onerror = (err) => {
      console.error('[SyncContext] Worker error:', err);
      setError(err.message);
      setIsSyncing(false);
    };

    workerRef.current = worker;
    return worker;
  }, [currentSessionId, onSyncComplete, onSyncError]);

  // Actions
  const startSync = useCallback((sessionId: string, cloudinaryConfig: CloudinaryConfig) => {
    if (isSyncing) {
      console.warn('[SyncContext] Sync already in progress');
      return;
    }

    setError(null);
    setIsSyncing(true);
    setIsPaused(false);
    setCurrentSessionId(sessionId);
    setProgress({ phase: 'audio', current: 0, total: 0, percentage: 0 });

    cloudinaryConfigRef.current = cloudinaryConfig;
    const worker = initWorker();

    worker.postMessage({
      type: 'START',
      sessionId,
      cloudinaryConfig,
    });
  }, [isSyncing, initWorker]);

  const pauseSync = useCallback(() => {
    if (!workerRef.current || !isSyncing) return;
    workerRef.current.postMessage({ type: 'PAUSE' });
  }, [isSyncing]);

  const resumeSync = useCallback(() => {
    if (!workerRef.current || !isPaused) return;
    workerRef.current.postMessage({ type: 'RESUME' });
  }, [isPaused]);

  const cancelSync = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: 'CANCEL' });
  }, []);

  const retrySync = useCallback(() => {
    if (!currentSessionId || !cloudinaryConfigRef.current) {
      console.warn('[SyncContext] Cannot retry - no session or config');
      return;
    }
    startSync(currentSessionId, cloudinaryConfigRef.current);
  }, [currentSessionId, startSync]);

  // Queries
  const getSyncStatsWrapper = useCallback(async (sessionId: string): Promise<SyncStats> => {
    return getSessionSyncStats(sessionId);
  }, []);

  const getLocalSessionsWrapper = useCallback(async (): Promise<LocalSession[]> => {
    return getAllSessions();
  }, []);

  const getCompletedSessionsWrapper = useCallback(async (): Promise<LocalSession[]> => {
    return getSessionsByStatus('completed');
  }, []);

  const getPublishedSessionsWrapper = useCallback(async (): Promise<LocalSession[]> => {
    return getSessionsByStatus('published');
  }, []);

  const getSessionByIdWrapper = useCallback(async (sessionId: string): Promise<LocalSession | undefined> => {
    return getSession(sessionId);
  }, []);

  // Cleanup
  const cleanupSessionWrapper = useCallback(async (sessionId: string, deleteAll = false): Promise<number> => {
    if (deleteAll) {
      return cleanupEntireSession(sessionId);
    }
    return cleanupPublishedSession(sessionId);
  }, []);

  const value: SyncContextValue = {
    // State
    isSyncing,
    isPaused,
    currentSessionId,
    progress,
    error,

    // Actions
    startSync,
    pauseSync,
    resumeSync,
    cancelSync,
    retrySync,

    // Queries
    getSyncStats: getSyncStatsWrapper,
    getLocalSessions: getLocalSessionsWrapper,
    getCompletedSessions: getCompletedSessionsWrapper,
    getPublishedSessions: getPublishedSessionsWrapper,
    getSessionById: getSessionByIdWrapper,

    // Cleanup
    cleanupSession: cleanupSessionWrapper,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// ── Helper Hook for Sync Status ───────────────────────────────────────────────

export function useSyncStatus(sessionId: string | null) {
  const { getSyncStats, getSessionById } = useSyncContext();
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!sessionId) {
      setStats(null);
      setSession(null);
      return;
    }

    setLoading(true);
    try {
      const [s, sess] = await Promise.all([
        getSyncStats(sessionId),
        getSessionById(sessionId),
      ]);
      setStats(s);
      setSession(sess ?? null);
    } catch (err) {
      console.error('[useSyncStatus] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, getSyncStats, getSessionById]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, session, loading, refresh };
}
