/**
 * SessionContext — provides the session worker and audio recording to the
 * entire live-classroom component tree.
 *
 * Why a context?
 * The worker reference must be shared by three independent components:
 *   • class.tsx  — sends stroke / shape data
 *   • media.tsx  — sends media SHOW / HIDE events
 *   • audio.tsx  — starts / stops recording; receives TICK for synchronisation
 *
 * Architecture
 * ┌──────────────────────── Main Thread ──────────────────────────────────────┐
 * │ MediaRecorder  →  AUDIO_CHUNK  →  Worker  →  IndexedDB (STORE_AUDIO)     │
 * │ Konva strokes  →  RAW_STROKE   →  Worker  →  gzip → IndexedDB (STORE_CLASS│
 * │ Media events   →  MEDIA_SHOW/HIDE → Worker → manifest                    │
 * │ Worker TICK    →  stop recorder  (precise 10s boundary, no drift)         │
 * │ Worker MANIFEST_UPDATE → localStorage.currentBatches                      │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { setIsRecording, setSessionIdRef } from '@/store/class-action-slice';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionContextValue {
  isRecording:    boolean;
  startRecording: () => Promise<void>;
  stopRecording:  () => void;

  /** Send a completed pen / eraser stroke to the worker for compression + IDB write */
  sendStroke: (payload: StrokePayload) => void;

  /** Send a completed shape (rect / circle / etc.) to the worker */
  sendShape: (payload: ShapePayload) => void;

  /** Call when a media asset is displayed on the board */
  sendMediaShow: (media: MediaEventPayload) => void;

  /** Call when a media asset is removed from the board */
  sendMediaHide: (mediaId: string, timerDisplay: string, elapsedMs?: number) => void;

  /** Call when the user navigates to a different PDF page */
  sendPdfPage: (mediaId: string, page: number, timerDisplay: string, elapsedMs?: number) => void;

  /** Call when the media frame container is scrolled */
  sendMediaScroll: (mediaId: string, scrollRatio: number, timerDisplay: string, elapsedMs?: number) => void;
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
  const isRecordingRef   = useRef(isRecording);   // avoids stale closure in callbacks
  const sessionStartMsRef = useRef(0);

  // Keep ref in sync with Redux state
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

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
          break;

        case 'TICK':
          // Worker reached the 10-second boundary — stop the current audio batch.
          // onstop fires → sends AUDIO_CHUNK → starts next batch (precise chain).
          if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop();
          }
          break;

        case 'MANIFEST_UPDATE':
          // Workers cannot access localStorage — persist it here.
          try { localStorage.setItem('currentBatches', msg.manifest); } catch {}
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
   * The worker TICK message stops the recorder at the correct 10-second boundary,
   * ondataavailable sends the blob to the worker, and onstop chains the next batch.
   *
   * Event order guaranteed by the MediaRecorder spec:
   *   stop() → ondataavailable → onstop
   * We exploit this to send END to the worker only from onstop, ensuring
   * the AUDIO_CHUNK message always arrives at the worker BEFORE END.
   */
  function startAudioBatch(stream: MediaStream) {
    if (!stream.active) return;

    const recorder = new MediaRecorder(stream, {
      mimeType:           getSupportedMimeType(),
      audioBitsPerSecond: 128_000,
    });
    recorderRef.current = recorder;
    const batchStartMs  = Date.now();

    recorder.ondataavailable = (event) => {
      if (!event.data || event.data.size === 0) return;
      const duration = (Date.now() - batchStartMs) / 1000;

      // Structured-clone posts the Blob to the worker — no serialisation cost
      workerRef.current?.postMessage({
        type:       'AUDIO_CHUNK',
        blob:       event.data,
        batchIndex: batchIndexRef.current,
        duration,
      });
      batchIndexRef.current++;
    };

    recorder.onstop = () => {
      if (streamRef.current?.active && isRecordingRef.current) {
        // TICK-driven: session still running, start the next 10s batch
        startAudioBatch(stream);
      } else {
        // stopRecording() was called — clean up tracks and signal the worker.
        // This runs AFTER ondataavailable, so AUDIO_CHUNK is already queued
        // in the worker before END arrives. Guaranteed by MediaRecorder spec.
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        workerRef.current?.postMessage({ type: 'END' });
      }
    };

    recorder.start();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const sid           = crypto.randomUUID();
      sessionStartMsRef.current = Date.now();
      batchIndexRef.current     = 0;

      localStorage.setItem('sessionStartWallMs', String(sessionStartMsRef.current));
      localStorage.setItem('recordingStartTimerMs', String(Math.round(timerElapsedSeconds * 1000)));

      // Initialise worker — anchors the master clock
      workerRef.current?.postMessage({
        type:           'INIT',
        sessionId:      sid,
        sessionStartMs: sessionStartMsRef.current,
      });

      dispatch(setSessionIdRef(sid));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount:     1,
          sampleRate:       48_000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      startAudioBatch(stream);
      dispatch(setIsRecording(true));
      toast.success('Recording started');
    } catch {
      toast.error('Recording failed — check microphone permissions');
    }
  }, [dispatch, timerElapsedSeconds]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (recorderRef.current?.state === 'recording') {
      // stop() triggers: ondataavailable → onstop (in that order, guaranteed).
      // onstop handler sees isRecordingRef.current === false and sends END.
      // Tracks and END are cleaned up there — not here — to preserve ordering.
      recorderRef.current.stop();
    } else {
      // Recorder already inactive (e.g. class ended before recording started)
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      workerRef.current?.postMessage({ type: 'END' });
    }

    toast.success('Recording stopped');
  }, []);

  // React when Redux isRecording is turned off externally (e.g. EndClass)
  useEffect(() => {
    if (!isRecording && streamRef.current) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // ── Worker message senders ────────────────────────────────────────────────

  const sendStroke = useCallback((payload: StrokePayload) => {
    if (!isRecordingRef.current) return;
    workerRef.current?.postMessage({ type: 'RAW_STROKE', ...payload });
  }, []);

  const sendShape = useCallback((payload: ShapePayload) => {
    if (!isRecordingRef.current) return;
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

  return (
    <SessionContext.Provider value={{
      isRecording,
      startRecording,
      stopRecording,
      sendStroke,
      sendShape,
      sendMediaShow,
      sendMediaHide,
      sendPdfPage,
      sendMediaScroll,
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
