/**
 * SessionContext — provides the session worker and audio recording to the
 * entire live-classroom component tree.
 *
 * PAUSE/RESUME ARCHITECTURE:
 * - On PAUSE: Stop MediaRecorder, notify worker (PAUSE), worker stops batch timer
 * - On RESUME: Restart MediaRecorder from same stream, notify worker (RESUME)
 * - Worker adjusts sessionStartMs to skip paused time, keeping audio/board in sync
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { setIsRecording, setSessionIdRef } from '@/store/class-action-slice';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionContextValue {
  isRecording:    boolean;
  isMicMuted:     boolean;
  isPaused:       boolean;
  startRecording: () => Promise<void>;
  continueSession: (sessionId: string, elapsedMs: number, pausedMs: number) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording:() => void;
  muteMic:        () => void;
  unmuteMic:      () => void;
  stopRecording:  () => void;

  sendStroke: (payload: StrokePayload) => void;
  sendShape: (payload: ShapePayload) => void;
  sendMediaShow: (media: MediaEventPayload) => void;
  sendMediaHide: (mediaId: string, timerDisplay: string, elapsedMs?: number) => void;
  sendPdfPage: (mediaId: string, page: number, timerDisplay: string, elapsedMs?: number) => void;
  sendMediaScroll: (mediaId: string, scrollRatio: number, timerDisplay: string, elapsedMs?: number) => void;
  sendMediaPlayback: (mediaId: string, state: 'play' | 'pause', timerDisplay: string, elapsedMs?: number) => void;
}

export interface PdfScrollPayload {
  scrollRatio: number;
}

export interface StrokePayload {
  id:           string;
  rawPoints:    number[];
  color:        string;
  width:        number;
  strokeType:   'stroke' | 'eraser';
  currentBoard: number;
  startTime:    string;
  endTime:      string;
  timestamp:    number;
}

export interface ShapePayload {
  id:           string;
  shape:        Record<string, unknown>;
  color:        string;
  strokeWidth:  number;
  shapeType:    string;
  currentBoard: number;
  startTime:    string;
  endTime:      string;
  timestamp:    number;
}

export interface MediaEventPayload {
  mediaId:      string;
  name:         string;
  mediaType:    string;
  url:          string;
  timerDisplay: string;
  elapsedMs?: number;
  frameIndex?: 0 | 1;
}

// ── Context ───────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: ReactNode }) {
  const dispatch     = useDispatch();
  const isRecording  = useSelector((state: RootState) => state.action.isRecording);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);

  const workerRef        = useRef<Worker | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const recorderRef      = useRef<MediaRecorder | null>(null);
  const batchIndexRef    = useRef(0);
  const sessionStartMsRef = useRef(0);

  // State flags
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for use in callbacks (avoid stale closure issues)
  const isRecordingRef   = useRef(isRecording);
  const isMicMutedRef    = useRef(true);
  const isPausedRef      = useRef(false);
  const micWasMutedBeforePauseRef = useRef(true);

  // Track pause timing for sync (main thread mirrors what worker tracks)
  const pauseStartMsRef = useRef(0);
  const totalPausedMsRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isMicMutedRef.current = isMicMuted; }, [isMicMuted]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // ── Worker lifecycle ──────────────────────────────────────────────────────

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/session.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;

      switch (msg.type) {
        case 'READY':
          console.log('[SessionContext] Worker ready');
          break;

        case 'TICK':
          // Worker reached the 10-second boundary — stop the current audio batch.
          // Only process TICK if not paused (worker shouldn't send during pause anyway)
          if (!isPausedRef.current && recorderRef.current?.state === 'recording') {
            console.log('[SessionContext] TICK received, stopping recorder for batch boundary');
            recorderRef.current.stop();
          }
          break;

        case 'MANIFEST_UPDATE':
          try { localStorage.setItem('currentBatches', msg.manifest); } catch {}
          break;

        case 'SESSION_COMPLETE':
          console.log('[SessionContext] Session complete:', msg.sessionId);
          break;

        case 'ERROR':
          console.error('[SessionWorker]', msg.error);
          break;
      }
    };

    worker.onerror = (e) => console.error('[SessionWorker] uncaught', e.message);
    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // ── Audio helpers ─────────────────────────────────────────────────────────

  function getSupportedMimeType(): string {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/webm',
    ];
    return candidates.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
  }

  /**
   * Start a single audio batch.
   * The worker TICK message stops the recorder at the correct 10-second boundary.
   *
   * @param stream - The MediaStream to record from
   * @param isFirstBatch - If true, updates sessionStartWallMs to the exact moment
   *                       recording starts (eliminates startup latency drift).
   */
  function startAudioBatch(stream: MediaStream, isFirstBatch = false) {
    if (!stream.active) {
      console.warn('[SessionContext] startAudioBatch: stream not active');
      return;
    }
    if (isPausedRef.current) {
      console.log('[SessionContext] startAudioBatch: skipped (paused)');
      return;
    }

    console.log('[SessionContext] Starting audio batch', batchIndexRef.current);

    const recorder = new MediaRecorder(stream, {
      mimeType:           getSupportedMimeType(),
      audioBitsPerSecond: 128_000,
    });
    recorderRef.current = recorder;

    // batchStartMs will be captured right before recorder.start()
    let batchStartMs = 0;

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return;
      const duration = (Date.now() - batchStartMs) / 1000;

      console.log('[SessionContext] Audio chunk ready, batch:', batchIndexRef.current, 'duration:', duration.toFixed(2) + 's', 'size:', event.data.size);

      workerRef.current?.postMessage({
        type:       'AUDIO_CHUNK',
        blob:       event.data,
        batchIndex: batchIndexRef.current,
        duration,
      });
      batchIndexRef.current++;
    };

    recorder.onstop = () => {
      console.log('[SessionContext] recorder.onstop - isPaused:', isPausedRef.current, 'isRecording:', isRecordingRef.current);

      if (isPausedRef.current) {
        // Paused — send PAUSE to worker NOW (after AUDIO_CHUNK was sent in ondataavailable)
        // This ensures the final chunk is saved before worker enters paused state
        console.log('[SessionContext] Recorder stopped for pause - sending PAUSE to worker');
        workerRef.current?.postMessage({ type: 'PAUSE', elapsedMs: 0 });
        return;
      }

      if (streamRef.current?.active && isRecordingRef.current) {
        // TICK-driven: session still running, start the next 10s batch
        console.log('[SessionContext] Starting next batch after TICK');
        startAudioBatch(stream);
      } else {
        // Full stop — clean up
        console.log('[SessionContext] Full stop - cleaning up stream and sending END');
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        workerRef.current?.postMessage({ type: 'END' });
      }
    };

    recorder.onerror = (e) => {
      console.error('[SessionContext] MediaRecorder error:', e);
    };

    // CRITICAL: Capture timestamp IMMEDIATELY before recorder.start()
    // This is the sync anchor - must be as close as possible to actual recording start
    batchStartMs = Date.now();

    if (isFirstBatch) {
      // Update sync anchor to exact recording start moment
      sessionStartMsRef.current = batchStartMs;
      localStorage.setItem('sessionStartWallMs', String(batchStartMs));
      console.log('[SessionContext] SYNC ANCHOR set at recorder.start():', batchStartMs);
    }

    recorder.start();
    console.log('[SessionContext] Recorder started, batchStartMs:', batchStartMs);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      console.log('[SessionContext] startRecording called');

      // Get microphone FIRST - this can take time (permission dialog)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount:     1,
          sampleRate:       48_000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const sid = crypto.randomUUID();
      batchIndexRef.current = 0;

      // Reset pause tracking
      pauseStartMsRef.current = 0;
      totalPausedMsRef.current = 0;
      localStorage.setItem('totalPausedMs', '0');

      streamRef.current = stream;

      // Start with mic MUTED
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      setIsMicMuted(true);
      isMicMutedRef.current = true;
      setIsPaused(false);
      isPausedRef.current = false;

      // Preliminary anchor (will be finalized in startAudioBatch right before recorder.start())
      const preliminaryAnchor = Date.now();
      localStorage.setItem('recordingStartTimerMs', String(Math.round(timerElapsedSeconds * 1000)));

      // Initialise worker with preliminary timestamp (close enough for batch timing)
      workerRef.current?.postMessage({
        type:           'INIT',
        sessionId:      sid,
        sessionStartMs: preliminaryAnchor,
      });

      dispatch(setSessionIdRef(sid));
      dispatch(setIsRecording(true));

      // Start audio recording - isFirstBatch=true captures the EXACT sync anchor
      // right before recorder.start() and updates sessionStartWallMs
      startAudioBatch(stream, true);

      console.log('[SessionContext] Recording started, sessionId:', sid);
      toast.success('Recording started — mic is muted');
    } catch (err) {
      console.error('[SessionContext] startRecording failed:', err);
      toast.error('Recording failed — check microphone permissions');
    }
  }, [dispatch, timerElapsedSeconds]);

  /**
   * Continue recording from a saved draft session.
   * Restores state and starts a new audio batch from where we left off.
   */
  const continueSession = useCallback(async (sessionId: string, elapsedMs: number, pausedMs: number) => {
    try {
      console.log('[SessionContext] Continuing session:', sessionId, 'elapsed:', elapsedMs, 'paused:', pausedMs);

      // Get the existing audio batch count to continue from the right index
      // Import dynamically to avoid circular dependencies
      const { getAudioBySession } = await import('@/utils/db');
      const existingAudio = await getAudioBySession(sessionId);
      const existingBatchCount = existingAudio.length;

      console.log('[SessionContext] Found', existingBatchCount, 'existing audio batches');

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount:     1,
          sampleRate:       48_000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Continue from where we left off with batch indexing
      batchIndexRef.current = existingBatchCount;

      // Start with mic MUTED
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      setIsMicMuted(true);
      isMicMutedRef.current = true;
      setIsPaused(false);
      isPausedRef.current = false;

      // Restore pause tracking
      pauseStartMsRef.current = 0;
      totalPausedMsRef.current = pausedMs;
      localStorage.setItem('totalPausedMs', String(pausedMs));

      // Calculate the session start time based on current time and elapsed time
      // sessionStartWallMs = now - elapsedMs (accounting for pause)
      const sessionStartMs = Date.now() - elapsedMs;
      sessionStartMsRef.current = sessionStartMs;
      localStorage.setItem('sessionStartWallMs', String(sessionStartMs));

      console.log('[SessionContext] Restored sessionStartWallMs:', sessionStartMs, 'batchIndex:', existingBatchCount);

      // Initialize worker with the existing session ID
      workerRef.current?.postMessage({
        type:           'INIT',
        sessionId:      sessionId,
        sessionStartMs: sessionStartMs,
      });

      dispatch(setSessionIdRef(sessionId));
      dispatch(setIsRecording(true));

      // Start audio recording
      startAudioBatch(stream, true);

      console.log('[SessionContext] Session continued:', sessionId);
      toast.success('Recording continued — click mic to unmute');
    } catch (err) {
      console.error('[SessionContext] continueSession failed:', err);
      toast.error('Failed to continue recording — check microphone permissions');
    }
  }, [dispatch]);

  const pauseRecording = useCallback(() => {
    if (!isRecordingRef.current || isPausedRef.current) {
      console.log('[SessionContext] pauseRecording: skipped (not recording or already paused)');
      return;
    }

    console.log('[SessionContext] Pausing recording');

    // Remember mic state before pause
    micWasMutedBeforePauseRef.current = isMicMutedRef.current;

    // Record when pause started (for calculating pause duration)
    pauseStartMsRef.current = Date.now();

    // Set paused flag - onstop handler will check this
    setIsPaused(true);
    isPausedRef.current = true;

    if (recorderRef.current?.state === 'recording') {
      console.log('[SessionContext] Stopping recorder for pause');
      // recorder.stop() triggers: ondataavailable (sends AUDIO_CHUNK) -> onstop
      // We send PAUSE to worker in onstop handler AFTER the chunk is sent
      recorderRef.current.stop();
    } else {
      // Recorder not running, send PAUSE immediately
      const elapsedMs = Math.round(timerElapsedSeconds * 1000);
      workerRef.current?.postMessage({ type: 'PAUSE', elapsedMs });
    }

    console.log('[SessionContext] Recording paused at', pauseStartMsRef.current);
  }, [timerElapsedSeconds]);

  const resumeRecording = useCallback(() => {
    if (!isRecordingRef.current || !isPausedRef.current) {
      console.log('[SessionContext] resumeRecording: skipped (not recording or not paused)');
      return;
    }

    console.log('[SessionContext] Resuming recording');

    // Calculate how long we were paused and update total
    const pauseDuration = Date.now() - pauseStartMsRef.current;
    totalPausedMsRef.current += pauseDuration;
    pauseStartMsRef.current = 0;

    // Store in localStorage so stroke timestamps can access it
    localStorage.setItem('totalPausedMs', String(totalPausedMsRef.current));

    console.log('[SessionContext] Pause duration:', pauseDuration, 'Total paused:', totalPausedMsRef.current);

    // Clear paused state FIRST
    setIsPaused(false);
    isPausedRef.current = false;

    // Tell worker to resume (adjusts sessionStartMs and restarts batch timer)
    workerRef.current?.postMessage({ type: 'RESUME' });

    // Restart audio recording from the same stream
    if (streamRef.current?.active) {
      console.log('[SessionContext] Restarting audio batch after resume');
      startAudioBatch(streamRef.current);

      // Restore mic state (unmute if it was unmuted before pause)
      if (!micWasMutedBeforePauseRef.current) {
        streamRef.current.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
        setIsMicMuted(false);
        isMicMutedRef.current = false;
        console.log('[SessionContext] Mic restored to unmuted state');
      }
    } else {
      console.error('[SessionContext] Cannot resume - stream is not active');
      toast.error('Cannot resume recording - please restart');
    }

    console.log('[SessionContext] Recording resumed');
  }, []);

  const stopRecording = useCallback(() => {
    console.log('[SessionContext] stopRecording called');

    // Clear all state
    isRecordingRef.current = false;
    isPausedRef.current = false;
    dispatch(setIsRecording(false));
    setIsMicMuted(true);
    setIsPaused(false);

    if (recorderRef.current?.state === 'recording' || recorderRef.current?.state === 'paused') {
      console.log('[SessionContext] Stopping active recorder');
      recorderRef.current.stop();
    } else {
      // Recorder already inactive
      console.log('[SessionContext] Recorder already inactive, cleaning up');
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      workerRef.current?.postMessage({ type: 'END' });
    }

    toast.success('Recording stopped');
  }, [dispatch]);

  const muteMic = useCallback(() => {
    if (!isRecordingRef.current || isMicMutedRef.current) return;

    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = false;
    });
    setIsMicMuted(true);
    isMicMutedRef.current = true;
    console.log('[SessionContext] Mic muted');
  }, []);

  const unmuteMic = useCallback(() => {
    if (!isRecordingRef.current || !isMicMutedRef.current) return;

    streamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = true;
    });
    setIsMicMuted(false);
    isMicMutedRef.current = false;
    console.log('[SessionContext] Mic unmuted');
  }, []);

  // React when Redux isRecording is turned off externally (e.g. EndClass)
  useEffect(() => {
    if (!isRecording && streamRef.current) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // ── Worker message senders ────────────────────────────────────────────────

  const sendStroke = useCallback((payload: StrokePayload) => {
    if (!isRecordingRef.current || isPausedRef.current) return;
    workerRef.current?.postMessage({ type: 'RAW_STROKE', ...payload });
  }, []);

  const sendShape = useCallback((payload: ShapePayload) => {
    if (!isRecordingRef.current || isPausedRef.current) return;
    workerRef.current?.postMessage({ type: 'RAW_SHAPE', ...payload });
  }, []);

  const sendMediaShow = useCallback((media: MediaEventPayload) => {
    workerRef.current?.postMessage({ type: 'MEDIA_SHOW', ...media });
  }, []);

  const sendMediaHide = useCallback((mediaId: string, timerDisplay: string, elapsedMs?: number) => {
    workerRef.current?.postMessage({ type: 'MEDIA_HIDE', mediaId, timerDisplay, elapsedMs });
  }, []);

  const sendPdfPage = useCallback((mediaId: string, page: number, timerDisplay: string, elapsedMs?: number) => {
    workerRef.current?.postMessage({ type: 'PDF_PAGE', mediaId, page, timerDisplay, elapsedMs });
  }, []);

  const sendMediaScroll = useCallback((mediaId: string, scrollRatio: number, timerDisplay: string, elapsedMs?: number) => {
    workerRef.current?.postMessage({ type: 'MEDIA_SCROLL', mediaId, scrollRatio, timerDisplay, elapsedMs });
  }, []);

  const sendMediaPlayback = useCallback((mediaId: string, state: 'play' | 'pause', timerDisplay: string, elapsedMs?: number) => {
    workerRef.current?.postMessage({ type: 'MEDIA_PLAYBACK', mediaId, state, timerDisplay, elapsedMs });
  }, []);

  return (
    <SessionContext.Provider value={{
      isRecording,
      isMicMuted,
      isPaused,
      startRecording,
      continueSession,
      pauseRecording,
      resumeRecording,
      muteMic,
      unmuteMic,
      stopRecording,
      sendStroke,
      sendShape,
      sendMediaShow,
      sendMediaHide,
      sendPdfPage,
      sendMediaScroll,
      sendMediaPlayback,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within <SessionProvider>');
  return ctx;
}
