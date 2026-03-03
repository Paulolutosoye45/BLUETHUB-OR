import { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
import type Konva from 'konva';
import {
  PlayCircle,
  StopCircle,
  Trash,
  Edit3,
  Volume2,
  Clock,
  Circle,
} from 'lucide-react';
import type { AudioBatch, CompressedStroke, Position, Stroke } from '@/utils/constant';
import { clearAudio, clearClass, getAudio, getClass } from '@/services/class';
import { base64ToUint8, sleep, timeStringToMs } from '@/utils';
import { gzipDecompress } from '@/utils/gzip';
import Time from '@/pages/teacher/note-board/app-bar/time';


export default function Replay() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // ✅ FIX 1: Use a Map keyed by stroke id for O(1) lookup + update
  //    instead of filtering the entire array on every point.
  const [drawnMap, setDrawnMap] = useState<Map<string, Stroke>>(new Map());

  const [isPlaying, setIsPlaying] = useState(false);
  const [strokesList, setStrokesList] = useState<CompressedStroke[]>([]);
  const [audioList, setAudioList] = useState<AudioBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [_, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const stopRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef(null);

  // ✅ FIX 2: Derive the drawn array for rendering from the Map only once per render
  //    Konva only sees this stable array — no extra allocations inside the loop.
  const drawn = Array.from(drawnMap.values());

  const timer = useGlobalTimer({
    onTargetReached: () => { },
  });

  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      setDimensions({
        width: Math.max(rect.width - 14, 400),
        height: Math.max(rect.height - 14, 400),
      });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const isOverDrawingArea =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (isOverDrawingArea) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    if (trRef.current && rectRef.current) {
      trRef.current.nodes([rectRef.current]);
    }

    window.addEventListener("mousemove", handleMouseMove);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [loading]);

  /* ========== LOAD FROM INDEXEDDB ========== */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
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
    };

    load();
    return () => { mounted = false; };
  }, []);

  /* ========== DECOMPRESS & SORT STROKES ========== */
  useEffect(() => {
    if (strokesList.length === 0) return;

    (async () => {
      try {
        const decompressed: Stroke[] = [];

        for (const comp of strokesList) {
          try {
            const binary = base64ToUint8(comp.data);
            const json = await gzipDecompress(binary);
            const points = JSON.parse(json) as number[];

            decompressed.push({
              id: comp.id,
              points,
              color: comp.color,
              width: comp.width,
              duration: comp.duration ?? 600,
              timestamp: comp.timestamp ?? Date.now(),
              startTime: comp.startTime,
              endTime: comp.endTime,
              type: comp.type,
            });
          } catch (err) {
            console.error(`Failed to decompress stroke ${comp.id}:`, err);
          }
        }

        const sorted = decompressed.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
        setStrokes(sorted);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    })();
  }, [strokesList]);

  /* ========== PLAY SINGLE AUDIO BATCH ========== */
  const playAudioBatch = useCallback(async (batchIndex: number): Promise<void> => {
    if (batchIndex >= audioList.length || stopRef.current) return;

    const batch = audioList[batchIndex];

    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    const blobUrl = URL.createObjectURL(batch.blob);
    currentBlobUrlRef.current = blobUrl;

    if (!audioRef.current) throw new Error('Audio element ref missing');
    audioRef.current.src = blobUrl;
    setCurrentBatch(batchIndex);

    return new Promise((resolve, reject) => {
      const onEnded = () => { cleanup(); resolve(); };
      const onError = (e: Event) => {
        cleanup();
        console.error(`Audio error in batch ${batch.batchId}:`, e);
        reject(new Error(`Audio playback failed for batch ${batch.batchId}`));
      };
      const cleanup = () => {
        audioRef.current?.removeEventListener('ended', onEnded);
        audioRef.current?.removeEventListener('error', onError);
      };

      audioRef.current?.addEventListener('ended', onEnded);
      audioRef.current?.addEventListener('error', onError);
      audioRef.current?.play().catch((err) => { cleanup(); reject(err); });
    });
  }, [audioList]);

  /* ========== MAIN PLAYBACK FUNCTION ========== */
  const play = async () => {
    if (isPlaying) return;

    stopRef.current = false;
    timer.start();
    setIsPlaying(true);
    setDrawnMap(new Map());   // ✅ clear drawn map
    setCurrentBatch(0);

    const sortedAudio = [...audioList].sort((a, b) => a.batchId - b.batchId);

    const audioTask = (async () => {
      for (let i = 0; i < sortedAudio.length; i++) {
        if (stopRef.current) break;
        try {
          await playAudioBatch(i);
        } catch (_) { }
      }
    })();

    const drawingTask = (async () => {
      if (!strokes.length) return;

      for (const stroke of strokes) {
        if (stopRef.current) return;

        const startMs = timeStringToMs(stroke.startTime);

        // Wait until stroke.startTime
        while (timer.elapsedSecondsRef.current * 1000 < startMs) {
          if (stopRef.current) return;
          await sleep(16);
        }

        const pointCount = stroke.points.length / 2;
        const pointDelay = pointCount > 0
          ? Math.max(6, (stroke.duration ?? 600) / pointCount)
          : 0;

        // ✅ FIX 3: Accumulate points locally, batch React updates every N points
        //    instead of calling setDrawn for every single point.
        const BATCH_SIZE = 8; // update canvas every 8 points (~50ms at 6ms/pt)
        const localPoints: number[] = [];

        for (let i = 0; i < stroke.points.length; i += 2) {
          if (stopRef.current) return;

          localPoints.push(stroke.points[i], stroke.points[i + 1]);

          const isLastPoint = i >= stroke.points.length - 2;
          const isBatchBoundary = ((i / 2) + 1) % BATCH_SIZE === 0;

          if (isBatchBoundary || isLastPoint) {
            // ✅ O(1) map update — no filter scan over all strokes
            const snapshot = localPoints.slice();
            setDrawnMap(prev => {
              const next = new Map(prev);
              next.set(stroke.id, { ...stroke, points: snapshot });
              return next;
            });
          }

          if (pointDelay > 0) await sleep(pointDelay);
        }
      }
    })();

    await Promise.all([audioTask, drawingTask]);
    timer.stop();

    if (!stopRef.current) {
      setIsPlaying(false);
    }
  };

  /* ========== STOP PLAYBACK ========== */
  const stop = () => {
    stopRef.current = true;
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

  const Cleardata = async () => {
    setIsClearing(true);
    try {
      await clearAudio();
      await clearClass();
      localStorage.removeItem('currentBatches');
      setStrokesList([]);
      setAudioList([]);
      setStrokes([]);
      setDrawnMap(new Map());
    } catch (error) {
      console.error('❌ Clear failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) return <div className="p-6 text-center">Loading replay data...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  if (strokes.length === 0 && audioList.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 font-bold font-poppins text-3xl flex items-center justify-center min-h-screen">
        No replay data available
      </div>
    );
  }

  if (isClearing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">clearing db....</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-4 p-4">
          {/* Left: Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={play}
              disabled={isPlaying}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${isPlaying
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
            >
              <PlayCircle className="w-5 h-5" />
              <span>Play</span>
            </button>



            <button
              onClick={stop}
              disabled={!isPlaying}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${!isPlaying
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
            >
              <StopCircle className="w-5 h-5" />
              <span>Stop</span>
            </button>

            <button
              disabled={isPlaying || isClearing}
              onClick={Cleardata}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${isPlaying || isClearing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg active:scale-95"
                }`}
            >
              <Trash className="w-5 h-5" />
              <span>{isClearing ? "Clearing..." : "Clear DB"}</span>
            </button>

            <div className="h-8 w-px bg-gray-300 mx-2" />

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Edit3 className="w-4 h-4" />
                <span className="font-semibold">{strokes.length}</span>
                <span className="text-gray-500">strokes</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span className="font-semibold">{audioList.length}</span>
                <span className="text-gray-500">audio</span>
              </div>
            </div>
          </div>

          {/* Center: Playback Status */}
          {isPlaying && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Circle className="w-2 h-2 fill-blue-500 text-blue-500 animate-pulse" />
              <div className="text-sm font-medium text-blue-700">
                Audio: {currentBatch + 1}/{audioList.length} • Strokes: {drawn.length}/{strokes.length}
              </div>
            </div>
          )}


          {/* Right: Timer */}
          <div className='flex items-center gap-4'>
            <Time />
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
              <Clock className="w-5 h-5 text-gray-600" />
              <div className="font-mono text-2xl font-bold text-gray-800">
                {timer.displayTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio player */}
      <audio ref={audioRef} />

      {/* Canvas Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <div
          ref={parentRef}
          className="h-full bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden"
        >
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            style={{ background: "white" }}
          >
            {/* Layer 1: static white background */}
            <Layer>
              <Rect
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                fill="white"
              />
            </Layer>

            {/* Layer 2: drawing strokes + eraser strokes */}
            <Layer>
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