import { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
// import type Konva from 'konva';
import {
  PlayCircle,
  StopCircle,
  Trash,
  Edit3,
  Volume2,
  Clock,
  Circle,
  Loader,
} from 'lucide-react';
import type { AudioBatch, CompressedStroke, Stroke } from '@/utils/constant';
import { clearAudio, clearClass, getAudio, getClass } from '@/services/class';
import { base64ToUint8 } from '@/utils';
import { gzipDecompress } from '@/utils/gzip';

// ─── local helper — converts "MM:SS" or "HH:MM:SS" → milliseconds ────────────
// This lives here so we are 100% sure of the unit: always returns MS.
// stroke.startTime "00:11" → 11000ms
// stroke.startTime "01:05" → 65000ms
const timeToMs = (time: string): number => {
  const parts = time.split(':').map(Number);
  if (parts.length === 2) {
    const [m, s] = parts;
    return (m * 60 + s) * 1000;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return (h * 3600 + m * 60 + s) * 1000;
  }
  return 0;
};

export default function Replay() {

  // ── UI state ──────────────────────────────────────────────────────────────
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [strokesList, setStrokesList] = useState<CompressedStroke[]>([]);
  const [audioList, setAudioList] = useState<AudioBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [_renderTick, setRenderTick] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────

  // Fully decompressed strokes cached here before play() is ever called.
  // play() reads this synchronously — zero async wait.
  const preloadedStrokesRef = useRef<Stroke[]>([]);

  // Drawn strokes live here — mutated directly by RAF, never causes re-renders.
  // setRenderTick triggers React to re-read this ref and repaint.
  const drawnMapRef = useRef<Map<string, Stroke>>(new Map());

  // Per-stroke cursor: how many flat [x,y,...] indices are currently drawn.
  const strokeCursorsRef = useRef<Map<string, number>>(new Map());

  // RAF handle
  const rafRef = useRef<number | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // THE SYNC ANCHOR
  //
  // batchStartMsRef = where in the session timeline the CURRENT audio batch
  // started, in milliseconds.
  //
  // Combined with audio.currentTime (how far into the current batch we are),
  // this gives us the true session position at any moment:
  //
  //   sessionMs = batchStartMsRef.current + audio.currentTime * 1000
  //
  // This is the ONLY clock the RAF uses. It is driven by the audio element
  // itself, so board and audio are physically incapable of drifting apart.
  //
  // Why NOT performance.now():
  //   performance.now() keeps ticking during the gap between audio batches
  //   (blob creation, src assignment, .play() call — ~20-100ms per gap).
  //   Over 10 batches that's up to 1 second of accumulated drift.
  //
  // Why NOT timer.elapsedSecondsRef:
  //   It updates every 200ms (setInterval) and returns SECONDS not MS,
  //   causing up to 200ms over-sleep per stroke and unit mismatch bugs.
  // ─────────────────────────────────────────────────────────────────────────
  const batchStartMsRef = useRef<number>(0);

  const stopRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  // const __trRef = useRef<Konva.Transformer | null>(null);
  // const _rectRef = useRef(null);

  // Snapshot of drawnMapRef for Konva — re-evaluated each time renderTick ticks
  const drawn = Array.from(drawnMapRef.current.values());

  // Timer is only used for the display clock in the header, NOT for sync
  const timer = useGlobalTimer({ onTargetReached: () => { } });

  // ── Resize observer ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(r.width - 14, 400),
        height: Math.max(r.height - 14, 400),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  // ── Step 1: Load raw data from IndexedDB ──────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [classData, audioData] = await Promise.all([getClass(), getAudio()]);
        if (!mounted) return;
        setStrokesList(classData);
        setAudioList(audioData);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ── Step 2: Parallel decompress + cache in ref ────────────────────────────
  //
  // OLD: sequential for-loop → 50 strokes × 20ms = ~1000ms before play() works
  // NEW: Promise.allSettled fires all at once → ~20ms total (slowest single stroke)
  //
  // Result goes into preloadedStrokesRef (a ref, not state) so play() reads
  // it synchronously with zero React render-cycle delay.
  //
  useEffect(() => {
    if (strokesList.length === 0) return;
    (async () => {
      try {
        setIsPreloading(true);

        const results = await Promise.allSettled(
          strokesList.map(async (comp): Promise<Stroke> => {
            const binary = base64ToUint8(comp.data);
            const json = await gzipDecompress(binary);
            const points = JSON.parse(json) as number[];
            return {
              id: comp.id,
              points,
              color: comp.color,
              width: comp.width,
              duration: comp.duration ?? 600,
              timestamp: comp.timestamp ?? Date.now(),
              startTime: comp.startTime,  // "MM:SS" string
              endTime: comp.endTime,    // "MM:SS" string
              type: comp.type,
            };
          })
        );

        const decompressed: Stroke[] = [];
        for (const r of results) {
          if (r.status === 'fulfilled') decompressed.push(r.value);
          else console.error('Decompress failed:', r.reason);
        }

        const sorted = decompressed.sort(
          (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0)
        );

        preloadedStrokesRef.current = sorted;
        setStrokes(sorted); // for UI count display only

      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsPreloading(false);
      }
    })();
  }, [strokesList]);

  // ── Step 3: RAF sliding window — audio-driven ─────────────────────────────
  //
  // ONE loop replaces N per-stroke async polling loops.
  //
  // Each frame (~16ms):
  //   sessionMs = batchStartMsRef + audio.currentTime * 1000
  //   For each stroke: if sessionMs >= stroke.startMs → advance its points
  //   proportionally based on how far into its draw window we are.
  //   One setRenderTick fires ONE React repaint for all strokes that advanced.
  //
  const startRaf = useCallback((allStrokes: Stroke[]) => {
    const timelines = allStrokes.map(s => {
      const startMs = timeToMs(s.startTime);   // always MS — no unit ambiguity
      const endMs = timeToMs(s.endTime);
      const drawWindow = Math.max(endMs - startMs, 50); // min 50ms to avoid /0
      return {
        stroke: s,
        startMs,
        drawWindow,
        totalPoints: s.points.length,
      };
    });

    strokeCursorsRef.current = new Map(timelines.map(t => [t.stroke.id, 0]));

    const frame = () => {
      if (stopRef.current) return;

      // ✅ Session position derived from audio's own clock — never drifts
      const sessionMs = batchStartMsRef.current +
        (audioRef.current?.currentTime ?? 0) * 1000;

      let dirty = false;

      for (const { stroke, startMs, drawWindow, totalPoints } of timelines) {
        const cursor = strokeCursorsRef.current.get(stroke.id) ?? 0;

        // Not started yet or already complete
        if (sessionMs < startMs || cursor >= totalPoints) continue;

        // How far into this stroke's own draw window
        const strokeElapsed = Math.min(sessionMs - startMs, drawWindow);

        // Proportional cursor — always even to keep x/y pairs aligned
        const targetCursor = Math.min(
          totalPoints,
          Math.round((strokeElapsed / drawWindow) * (totalPoints / 2)) * 2
        );

        if (targetCursor > cursor) {
          strokeCursorsRef.current.set(stroke.id, targetCursor);
          drawnMapRef.current.set(stroke.id, {
            ...stroke,
            points: stroke.points.slice(0, targetCursor),
          });
          dirty = true;
        }
      }

      // One repaint for everything that changed this frame
      if (dirty) setRenderTick(t => t + 1);

      const allDone = timelines.every(
        ({ stroke, totalPoints }) =>
          (strokeCursorsRef.current.get(stroke.id) ?? 0) >= totalPoints
      );
      if (!allDone) rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // ── Audio batch player ────────────────────────────────────────────────────
  //
  // Before each batch plays, batchStartMsRef is updated by summing the actual
  // durations of all previous batches. This keeps the RAF's sessionMs formula
  // accurate regardless of gaps between batches.
  //
  const playAudioBatch = useCallback(async (
    batchIndex: number,
    sortedBatches: AudioBatch[],
  ): Promise<void> => {
    if (batchIndex >= sortedBatches.length || stopRef.current) return;

    const batch = sortedBatches[batchIndex];

    // Sum actual recorded durations of all previous batches (no hardcoded 10s)
    const batchStartMs = sortedBatches
      .slice(0, batchIndex)
      .reduce((sum, b) => sum + (b.duration ?? 10) * 1000, 0);

    // ✅ Tell the RAF where in the session timeline we now are
    batchStartMsRef.current = batchStartMs;

    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    const blobUrl = URL.createObjectURL(batch.blob);
    currentBlobUrlRef.current = blobUrl;
    if (!audioRef.current) throw new Error('Audio element missing');
    audioRef.current.src = blobUrl;
    setCurrentBatch(batchIndex);

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        audioRef.current?.removeEventListener('ended', onEnded);
        audioRef.current?.removeEventListener('error', onError);
      };
      const onEnded = () => { cleanup(); resolve(); };
      const onError = () => {
        cleanup();
        reject(new Error(`Batch ${batch.batchId} failed`));
      };
      audioRef.current?.addEventListener('ended', onEnded);
      audioRef.current?.addEventListener('error', onError);
      audioRef.current?.play().catch(e => { cleanup(); reject(e); });
    });
  }, []);

  // ── Play ──────────────────────────────────────────────────────────────────
  const play = async () => {
    if (isPlaying || isPreloading) return;

    const readyStrokes = preloadedStrokesRef.current;
    const hasStrokes = readyStrokes.length > 0;
    const hasAudio = audioList.length > 0;
    if (!hasStrokes && !hasAudio) return;

    stopRef.current = false;
    batchStartMsRef.current = 0;
    drawnMapRef.current = new Map();
    strokeCursorsRef.current = new Map();
    setRenderTick(0);
    setCurrentBatch(0);
    setIsPlaying(true);
    timer.start();

    const sortedAudio = [...audioList].sort((a, b) => a.batchId - b.batchId);

    if (hasAudio && hasStrokes) {
      // Normal case: board slaved to audio clock
      startRaf(readyStrokes);
      for (let i = 0; i < sortedAudio.length; i++) {
        if (stopRef.current) break;
        try { await playAudioBatch(i, sortedAudio); } catch (_) { }
      }
      stopRaf();

    } else if (hasAudio && !hasStrokes) {
      // Audio only — no RAF needed
      for (let i = 0; i < sortedAudio.length; i++) {
        if (stopRef.current) break;
        try { await playAudioBatch(i, sortedAudio); } catch (_) { }
      }

    } else if (hasStrokes && !hasAudio) {
      // Board only — feed performance.now() into batchStartMsRef each frame
      // so the RAF formula still works: sessionMs = batchStartMs + 0 = elapsed
      const wallStart = performance.now();
      const driveRef = () => {
        if (stopRef.current) return;
        batchStartMsRef.current = performance.now() - wallStart;
        rafRef.current = requestAnimationFrame(driveRef);
      };
      startRaf(readyStrokes);
      driveRef();
      const totalDurationMs = Math.max(...readyStrokes.map(s => timeToMs(s.endTime)));
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (stopRef.current || (performance.now() - wallStart) >= totalDurationMs) {
            clearInterval(check);
            resolve();
          }
        }, 200);
      });
      stopRaf();
    }

    timer.stop();
    if (!stopRef.current) setIsPlaying(false);
  };

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stop = () => {
    stopRef.current = true;
    stopRaf();
    timer.stop();
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const Cleardata = async () => {
    setIsClearing(true);
    try {
      await clearAudio();
      await clearClass();
      localStorage.removeItem('currentBatches');
      setStrokesList([]);
      setAudioList([]);
      setStrokes([]);
      preloadedStrokesRef.current = [];
      drawnMapRef.current = new Map();
      setRenderTick(0);
    } catch (err) {
      console.error('❌ Clear failed:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <div className="p-6 text-center">Loading replay data...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;
  if (isClearing) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4 text-sm text-gray-600">Clearing db...</p>
      </div>
    </div>
  );
  if (strokes.length === 0 && audioList.length === 0) return (
    <div className="p-6 text-center text-gray-500 font-bold font-poppins text-3xl flex items-center justify-center min-h-screen">
      No replay data available
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-gray-50 to-gray-100">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">

            <button
              onClick={play}
              disabled={isPlaying || isPreloading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${isPlaying || isPreloading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
              {isPreloading
                ? <><Loader className="w-5 h-5 animate-spin" /><span>Preparing...</span></>
                : <><PlayCircle className="w-5 h-5" /><span>Play</span></>
              }
            </button>

            <button
              onClick={stop}
              disabled={!isPlaying}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${!isPlaying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop</span>
            </button>

            <button
              disabled={isPlaying || isClearing || isPreloading}
              onClick={Cleardata}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${isPlaying || isClearing || isPreloading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
              <Trash className="w-5 h-5" />
              <span>{isClearing ? 'Clearing...' : 'Clear DB'}</span>
            </button>

            <div className="h-8 w-px bg-gray-300 mx-2" />

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Edit3 className="w-4 h-4" />
                <span className="font-semibold">{strokes.length}</span>
                <span className="text-gray-500">strokes</span>
                {isPreloading && (
                  <span className="text-xs text-blue-500 animate-pulse ml-1">preparing...</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span className="font-semibold">{audioList.length}</span>
                <span className="text-gray-500">audio</span>
              </div>
            </div>
          </div>


          <div className='font-medium'>s</div>

          {isPlaying && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Circle className="w-2 h-2 fill-blue-500 text-blue-500 animate-pulse" />
              <div className="text-sm font-medium text-blue-700">
                Audio: {currentBatch + 1}/{audioList.length} • Strokes: {drawn.length}/{strokes.length}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
            <Clock className="w-5 h-5 text-gray-600" />
            <div className="font-mono text-2xl font-bold text-gray-800">
              {timer.timerDisplay}
            </div>
          </div>
        </div>
      </div>

      <audio ref={audioRef} />

      {/* ── Canvas ── */}
      <div className="flex-1 p-4 overflow-hidden">
        <div
          ref={parentRef}
          className="h-full bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden"
        >
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            style={{ background: 'white' }}
          >
            {/* Static background — listening:false skips hit detection on every frame */}
            <Layer listening={false}>
              <Rect x={0} y={0} width={dimensions.width} height={dimensions.height} fill="white" />
            </Layer>

            {/* Drawing layer — repaints only when renderTick increments */}
            <Layer listening={false}>
              {drawn.map((stroke) => (
                <Line
                  key={stroke.id}
                  points={stroke.points}
                  stroke={stroke.type === 'eraser' ? 'white' : stroke.color}
                  strokeWidth={stroke.type === 'eraser' ? 20 : 5}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.4}
                  opacity={stroke.type === 'eraser' ? 1 : 0.9}
                  globalCompositeOperation={
                    stroke.type === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}