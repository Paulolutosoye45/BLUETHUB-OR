import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pencil,
  Eraser,
  Trash2,
  Undo2,
  Plus,
  Image as ImageIcon,
  Minus,
  Palette,
  X,
} from "lucide-react";
import { boardSessionService } from "@/services/board-session";

export interface AnswerBoardMeta {
  boardSessionId: string;
  boardIndex: number;
  boardLabel: string;
}

export interface BoardStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isEraser: boolean;
}

export interface BoardState {
  strokes: BoardStroke[];
  snapshot: string | null;
  sessionId: string;
  batchIndex: number;
}

const COLORS = ["#1e293b", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
const MAX_BOARDS = 6;
const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 400;

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface StudentAnswerBoardProps {
  questionId: string;
  onBoardsChange?: (boards: AnswerBoardMeta[]) => void;
}

const StudentAnswerBoard = ({ questionId, onBoardsChange }: StudentAnswerBoardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [boards, setBoards] = useState<Record<number, BoardState>>({
    0: { strokes: [], snapshot: null, sessionId: generateUUID(), batchIndex: 0 },
  });
  const [activeBoardIndex, setActiveBoardIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState(COLORS[0]);
  const [penWidth, setPenWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Ensure at least one board exists
  useEffect(() => {
    setBoards((prev) => {
      if (Object.keys(prev).length === 0) {
        return { 0: { strokes: [], snapshot: null, sessionId: generateUUID(), batchIndex: 0 } };
      }
      return prev;
    });
  }, []);

  // Redraw canvas when board changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid dots
    ctx.fillStyle = "#e2e8f0";
    for (let x = 20; x < CANVAS_WIDTH; x += 20) {
      for (let y = 20; y < CANVAS_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw strokes
    const board = boards[activeBoardIndex];
    if (!board) return;

    for (const stroke of board.strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = stroke.isEraser ? "#ffffff" : stroke.color;
      ctx.lineWidth = stroke.isEraser ? stroke.width * 3 : stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }, [boards, activeBoardIndex]);

  // Notify parent of board session metadata
  useEffect(() => {
    if (!onBoardsChange) return;
    const meta: AnswerBoardMeta[] = [];
    const sorted = Object.keys(boards)
      .map(Number)
      .sort((a, b) => a - b);
    for (const idx of sorted) {
      const board = boards[idx];
      if (!board) continue;
      meta.push({
        boardSessionId: board.sessionId,
        boardIndex: idx,
        boardLabel: `Board ${idx + 1}`,
      });
    }
    onBoardsChange(meta);
  }, [boards, onBoardsChange]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getPointerPos(e);
      setIsDrawing(true);
      setBoards((prev) => {
        const board = prev[activeBoardIndex];
        if (!board) return prev;
        const newStroke: BoardStroke = {
          points: [pos],
          color: penColor,
          width: penWidth,
          isEraser,
        };
        return {
          ...prev,
          [activeBoardIndex]: {
            ...board,
            strokes: [...board.strokes, newStroke],
            snapshot: null,
          },
        };
      });
    },
    [activeBoardIndex, penColor, penWidth, isEraser],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPointerPos(e);
      setBoards((prev) => {
        const board = prev[activeBoardIndex];
        if (!board) return prev;
        const strokes = [...board.strokes];
        const last = strokes[strokes.length - 1];
        if (last) {
          last.points.push(pos);
        }
        return {
          ...prev,
          [activeBoardIndex]: {
            ...board,
            strokes,
            snapshot: null,
          },
        };
      });
    },
    [isDrawing, activeBoardIndex],
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Capture snapshot
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = canvas.toDataURL("image/png");

    setBoards((prev) => {
      const board = prev[activeBoardIndex];
      if (!board) return prev;

      // Submit stroke batch to backend
      const lastStroke = board.strokes[board.strokes.length - 1];
      if (lastStroke && lastStroke.points.length >= 2) {
        const startMs = Date.now() - 5000; // approximate 5s stroke duration
        const endMs = Date.now();
        const compressedStrokes = board.strokes.map((s, i) => ({
          id: `${board.sessionId}_stroke_${i}`,
          sessionId: board.sessionId,
          data: JSON.stringify(s.points.map((p) => [Math.round(p.x), Math.round(p.y)])),
          color: s.isEraser ? "#ffffff" : s.color,
          width: s.isEraser ? s.width * 3 : s.width,
          type: s.isEraser ? "eraser" : "pen",
          currentBoard: activeBoardIndex,
          timestamp: startMs + i * 100,
          duration: 100,
          startTime: new Date(startMs + i * 100).toISOString(),
          endTime: new Date(startMs + i * 100 + 100).toISOString(),
        }));

        const payload = {
          sessionId: board.sessionId,
          lessonId: questionId,
          batchIndex: board.batchIndex,
          startMs,
          endMs,
          strokes: compressedStrokes,
          strokeCount: compressedStrokes.length,
          boardIndex: activeBoardIndex,
        };

        boardSessionService
          .submitBatch(board.sessionId, payload as any)
          .then(() => {
            // Batch sent successfully
          })
          .catch(() => {
            // Silently fail — strokes are still in local state
          });
      }

      return {
        ...prev,
        [activeBoardIndex]: {
          ...board,
          snapshot,
          batchIndex: board.batchIndex + 1,
        },
      };
    });
  }, [isDrawing, activeBoardIndex, questionId]);

  const undoLastStroke = () => {
    setBoards((prev) => {
      const board = prev[activeBoardIndex];
      if (!board || board.strokes.length === 0) return prev;
      return {
        ...prev,
        [activeBoardIndex]: {
          ...board,
          strokes: board.strokes.slice(0, -1),
          snapshot: null,
        },
      };
    });
  };

  const clearBoard = () => {
    if (!window.confirm("Clear this board? This cannot be undone.")) return;
    setBoards((prev) => ({
      ...prev,
      [activeBoardIndex]: { strokes: [], snapshot: null, sessionId: generateUUID(), batchIndex: 0 },
    }));
  };

  const addNewBoard = () => {
    const indices = Object.keys(boards).map(Number).sort((a, b) => a - b);
    const nextIndex = indices.length > 0 ? indices[indices.length - 1] + 1 : 0;
    if (indices.length >= MAX_BOARDS) {
      window.alert(`Maximum ${MAX_BOARDS} boards allowed.`);
      return;
    }
    setBoards((prev) => ({
      ...prev,
      [nextIndex]: { strokes: [], snapshot: null, sessionId: generateUUID(), batchIndex: 0 },
    }));
    setActiveBoardIndex(nextIndex);
  };

  const removeBoard = (index: number) => {
    if (Object.keys(boards).length <= 1) {
      window.alert("You must keep at least one board.");
      return;
    }
    if (!window.confirm(`Remove Board ${index + 1}?`)) return;
    setBoards((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    // switch to another board if removing active
    if (activeBoardIndex === index) {
      const remaining = Object.keys(boards)
        .map(Number)
        .filter((i) => i !== index)
        .sort((a, b) => a - b);
      setActiveBoardIndex(remaining[0] ?? 0);
    }
  };

  const boardCount = Object.keys(boards).length;
  const sortedIndices = Object.keys(boards)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Pen / Eraser toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              !isEraser ? "bg-[#4255db] text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            Pen
          </button>
          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isEraser ? "bg-[#4255db] text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            Eraser
          </button>
        </div>

        {/* Color picker */}
        {!isEraser && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span
                className="w-3.5 h-3.5 rounded-full border border-slate-200"
                style={{ backgroundColor: penColor }}
              />
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-9 z-20 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setPenColor(c);
                      setIsEraser(false);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      penColor === c ? "border-slate-800 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="ml-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Width */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
          <Minus className="w-3 h-3 text-slate-400" />
          <input
            type="range"
            min={1}
            max={12}
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            className="w-20 h-1 accent-[#4255db]"
          />
          <div
            className="rounded-full bg-slate-800"
            style={{ width: Math.max(4, penWidth), height: Math.max(4, penWidth) }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undoLastStroke}
            title="Undo last stroke"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={clearBoard}
            title="Clear board"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Board selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {sortedIndices.map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveBoardIndex(idx)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeBoardIndex === idx
                ? "bg-[#4255db] text-white border-[#4255db]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Board {idx + 1}
            {boards[idx]?.snapshot && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
            {sortedIndices.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeBoard(idx);
                }}
                className="ml-0.5 text-[10px] opacity-60 hover:opacity-100 hover:text-red-400"
                title="Remove board"
              >
                <X className="w-3 h-3" />
              </span>
            )}
          </button>
        ))}
        {boardCount < MAX_BOARDS && (
          <button
            type="button"
            onClick={addNewBoard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-chestnut hover:text-chestnut transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Board
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-auto cursor-crosshair touch-none"
          style={{ maxHeight: CANVAS_HEIGHT, aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-slate-400">
        Draw your answer above. You can use up to {MAX_BOARDS} boards per question. Your drawings are captured automatically.
      </p>
    </div>
  );
};

export default StudentAnswerBoard;
