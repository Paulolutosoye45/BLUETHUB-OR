import { useEffect, useRef, useState } from "react";
import type { PendingGradeBoard } from "@/services/assessment";
import { X, Loader2 } from "lucide-react";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 400;

interface BoardViewerModalProps {
  boards: PendingGradeBoard[];
  studentName: string;
  questionTitle: string;
  onClose: () => void;
}

const BoardViewerModal = ({ boards, studentName, questionTitle, onClose }: BoardViewerModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#292382] to-[#3D36A8] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Student Board Answer</h3>
            <p className="text-xs text-blue-200 mt-0.5">
              {studentName} · {questionTitle}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {boards.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No board data available.</p>
          ) : (
            boards.map((board) => (
              <BoardCanvas key={board.boardIndex} board={board} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface BoardCanvasProps {
  board: PendingGradeBoard;
}

const BoardCanvas = ({ board }: BoardCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "#e2e8f0";
    for (let x = 20; x < CANVAS_WIDTH; x += 20) {
      for (let y = 20; y < CANVAS_HEIGHT; y += 20) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const stroke of board.strokes) {
      let points: { x: number; y: number }[];
      try {
        points = JSON.parse(stroke.data);
      } catch {
        continue;
      }
      if (points.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = stroke.type === "eraser" ? "#ffffff" : stroke.color;
      ctx.lineWidth = stroke.type === "eraser" ? stroke.width * 3 : stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    setLoaded(true);
  }, [board]);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1.5">
        Board {board.boardIndex + 1}
        <span className="font-normal text-slate-400 ml-2">{board.strokeCount} stroke{board.strokeCount !== 1 ? "s" : ""}</span>
      </p>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {!loaded && (
          <div className="flex items-center justify-center" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full h-auto ${loaded ? "" : "hidden"}`}
          style={{ maxHeight: CANVAS_HEIGHT, aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
        />
      </div>
    </div>
  );
};

export default BoardViewerModal;