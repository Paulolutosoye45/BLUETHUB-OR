import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import type Konva from "konva";
import { Button, Input, Label, Textarea } from "@bluethub/ui-kit";
import {
  Check,
  Eraser,
  Loader2,
  Pen,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { lessonService } from "@/services/lesson";
import type { CreateOptionPayload } from "@/services/question";

// ── Types ──────────────────────────────────────────────────────────────────
type Tool = "pen" | "eraser";

interface BoardStroke {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  points: number[]; // flat [x1,y1,x2,y2,…] for Konva Line
}

interface OptionRow {
  key: string;
  value: string;
}

export interface BoardQuestionResult {
  boardSessionId: string;
  questionText: string;
  options: CreateOptionPayload[];
  correctAnswers: string[];
  difficultyLevel: number;
}

// ── Constants ─────────────────────────────────────────────────────────────
const COLORS = [
  "#1a1a1a", // near-black
  "#E8302C", // chestnut/red
  "#2563eb", // blue
  "#16a34a", // green
  "#f97316", // orange
  "#7c3aed", // purple
  "#ffffff", // white
];

const WIDTHS = [2, 4, 8, 14];

const DIFFICULTY_META = [
  { label: "Easy",   fill: "#10b981" },
  { label: "Medium", fill: "#fbbf24" },
  { label: "Hard",   fill: "#f97316" },
  { label: "Expert", fill: "#ef4444" },
];

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];

// ── StarPicker ─────────────────────────────────────────────────────────────
const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const meta = active ? DIFFICULTY_META[active - 1] : null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4].map((n) => {
          const m = DIFFICULTY_META[n - 1];
          const lit = n <= active;
          return (
            <button
              key={n}
              type="button"
              title={m.label}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHovered(n)}
              className="cursor-pointer p-0.5 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={24}
                strokeWidth={1.5}
                fill={lit ? m.fill : "none"}
                color={lit ? m.fill : "#cbd5e1"}
              />
            </button>
          );
        })}
      </div>
      {meta && (
        <span
          className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
          style={{ color: meta.fill, backgroundColor: `${meta.fill}18` }}
        >
          {meta.label}
        </span>
      )}
      {!meta && (
        <span className="text-sm text-slate-300 font-medium">Select difficulty</span>
      )}
    </div>
  );
};

// ── QuizBoard ──────────────────────────────────────────────────────────────
interface QuizBoardProps {
  onCancel: () => void;
  onSaved: (result: BoardQuestionResult) => void;
  isSubmitting: boolean;
}

const QuizBoard = ({ onCancel, onSaved, isSubmitting }: QuizBoardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [stageWidth, setStageWidth] = useState(600);
  const STAGE_HEIGHT = 340;

  // Drawing state
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const [strokes, setStrokes] = useState<BoardStroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<BoardStroke | null>(null);
  const isDrawing = useRef(false);

  // Board save state
  const [isSaving, setIsSaving] = useState(false);
  const [boardSessionId, setBoardSessionId] = useState<string | null>(null);

  // Optional text + options + difficulty
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<OptionRow[]>([
    { key: "A", value: "" },
    { key: "B", value: "" },
    { key: "C", value: "" },
    { key: "D", value: "" },
  ]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState(0);

  // ── Responsive width ────────────────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setStageWidth(containerRef.current.offsetWidth);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Drawing handlers ────────────────────────────────────────────────────
  const getPos = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    return pos ? [pos.x, pos.y] : null;
  };

  const handleMouseDown = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = getPos(stage);
    if (!pos) return;
    isDrawing.current = true;
    const stroke: BoardStroke = {
      id: crypto.randomUUID(),
      tool,
      color: tool === "eraser" ? "#ffffff" : color,
      width: tool === "eraser" ? width * 4 : width,
      points: pos,
    };
    setActiveStroke(stroke);
  }, [tool, color, width]);

  const handleMouseMove = useCallback(() => {
    if (!isDrawing.current || !activeStroke) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = getPos(stage);
    if (!pos) return;
    setActiveStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, ...pos] } : prev
    );
  }, [activeStroke]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current || !activeStroke) return;
    isDrawing.current = false;
    if (activeStroke.points.length >= 4) {
      setStrokes((prev) => [...prev, activeStroke]);
    }
    setActiveStroke(null);
  }, [activeStroke]);

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clearBoard = () => { setStrokes([]); setActiveStroke(null); };

  // ── Save board to backend ───────────────────────────────────────────────
  const handleSaveBoard = async () => {
    if (strokes.length === 0) {
      toast.error("Draw something on the board first.");
      return;
    }
    const sessionId = crypto.randomUUID();
    setIsSaving(true);
    try {
      await lessonService.submitManifest({
        sessionId,
        manifest: {
          totalDuration: 0,
          totalBatches: 1,
          batches: [
            {
              id: crypto.randomUUID(),
              startTime: "0",
              endTime: "0",
              hasAudio: false,
              hasBoard: true,
            },
          ],
        },
      });
      setBoardSessionId(sessionId);
      toast.success("Board saved. Now add options and publish.");
    } catch (err) {
      const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
      toast.error(e?.response?.data?.responseMessage ?? e?.message ?? "Failed to save board.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Options helpers ─────────────────────────────────────────────────────
  const updateOption = (key: string, val: string) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, value: val } : o)));

  const addOption = () => {
    const next = OPTION_KEYS[options.length];
    if (!next) return;
    setOptions((prev) => [...prev, { key: next, value: "" }]);
  };

  const removeOption = (key: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((o) => o.key !== key));
    setCorrectAnswers((prev) => prev.filter((k) => k !== key));
  };

  const toggleCorrect = (key: string) =>
    setCorrectAnswers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!boardSessionId) {
      toast.error("Save the board first.");
      return;
    }
    if (difficultyLevel === 0) {
      toast.error("Select a difficulty level.");
      return;
    }
    const filledOptions = options.filter((o) => o.value.trim());
    // If options are filled but no correct answer is ticked, warn
    if (filledOptions.length > 0 && correctAnswers.length === 0) {
      toast.error("Tick at least one correct answer, or clear all options.");
      return;
    }
    const payload: CreateOptionPayload[] = filledOptions.map((opt, idx) => ({
      optionLabel: opt.key,
      optionText: opt.value.trim(),
      isCorrect: correctAnswers.includes(opt.key),
      orderIndex: idx + 1,
    }));
    onSaved({
      boardSessionId,
      questionText: questionText.trim(),
      options: payload,
      correctAnswers,
      difficultyLevel,
    });
  };

  const boardLocked = !!boardSessionId;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Board canvas area ─────────────────────────────────────── */}
      <div className="border border-[#29238280] rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[#D9D9D9] bg-slate-50">
          {/* Tool */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTool("pen")}
              disabled={boardLocked}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                tool === "pen"
                  ? "bg-chestnut text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Pen size={13} />
              Pen
            </button>
            <button
              type="button"
              onClick={() => setTool("eraser")}
              disabled={boardLocked}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                tool === "eraser"
                  ? "bg-slate-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Eraser size={13} />
              Eraser
            </button>
          </div>

          {/* Colors */}
          {!boardLocked && (
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setColor(c); setTool("pen"); }}
                  className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shrink-0"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#6366f1" : "#e2e8f0",
                    boxShadow: color === c ? `0 0 0 2px #6366f180` : "none",
                  }}
                />
              ))}
            </div>
          )}

          {/* Stroke width */}
          {!boardLocked && (
            <div className="flex items-center gap-1.5">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWidth(w)}
                  className={`flex items-center justify-center w-7 h-7 rounded-md border transition-all cursor-pointer ${
                    width === w
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  title={`Width ${w}px`}
                >
                  <div
                    className="rounded-full bg-slate-600"
                    style={{ width: Math.min(w * 1.5, 16), height: Math.min(w * 1.5, 16) }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Undo / Clear */}
          {!boardLocked && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={undo}
                disabled={strokes.length === 0}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30 cursor-pointer px-2 py-1.5 rounded-md hover:bg-slate-100 transition-all"
              >
                <RotateCcw size={13} />
                Undo
              </button>
              <button
                type="button"
                onClick={clearBoard}
                disabled={strokes.length === 0}
                className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer px-2 py-1.5 rounded-md hover:bg-rose-50 transition-all"
              >
                <Trash2 size={13} />
                Clear
              </button>
            </div>
          )}

          {boardLocked && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                ✓ Board saved
              </span>
              <button
                type="button"
                onClick={() => { setBoardSessionId(null); setStrokes([]); setActiveStroke(null); }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition-all"
              >
                Re-draw
              </button>
            </div>
          )}
        </div>

        {/* Konva Stage */}
        <div
          ref={containerRef}
          className="bg-white"
          style={{ cursor: boardLocked ? "default" : tool === "eraser" ? "cell" : "crosshair" }}
        >
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={STAGE_HEIGHT}
            onMouseDown={boardLocked ? undefined : handleMouseDown}
            onMouseMove={boardLocked ? undefined : handleMouseMove}
            onMouseUp={boardLocked ? undefined : handleMouseUp}
            onTouchStart={boardLocked ? undefined : handleMouseDown}
            onTouchMove={boardLocked ? undefined : handleMouseMove}
            onTouchEnd={boardLocked ? undefined : handleMouseUp}
          >
            <Layer>
              {/* White background */}
              {strokes.map((s) => (
                <Line
                  key={s.id}
                  points={s.points}
                  stroke={s.color}
                  strokeWidth={s.width}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    s.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              ))}
              {activeStroke && (
                <Line
                  points={activeStroke.points}
                  stroke={activeStroke.color}
                  strokeWidth={activeStroke.width}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    activeStroke.tool === "eraser" ? "destination-out" : "source-over"
                  }
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Save Board button */}
        {!boardLocked && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#D9D9D9] bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">
              Draw your question on the board above
            </span>
            <Button
              onClick={handleSaveBoard}
              disabled={isSaving || strokes.length === 0}
              className="flex items-center gap-2 px-5 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-all text-white text-sm font-semibold"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Save size={14} className="shrink-0" />
              )}
              {isSaving ? "Saving…" : "Save Board"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Optional text + options + difficulty ───────────────────── */}
      <div className="border border-[#29238280] rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-[#D9D9D9] bg-white/60">
          <h3 className="font-semibold text-chestnut text-sm sm:text-base">
            Question Details <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">
            You can type question text and options now. Save board before adding to list.
          </p>
        </div>

        <div className="flex flex-col gap-5 p-4 sm:p-6">
            {/* Optional question text */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-chestnut">
                Question Text <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type the question text that goes with this board drawing..."
                rows={3}
                className="w-full px-4 py-3 text-sm text-slate-700 font-medium placeholder:text-slate-300 bg-white border border-black/15 rounded-xl resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-200"
              />
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-chestnut">Difficulty Level:</Label>
              <StarPicker value={difficultyLevel} onChange={setDifficultyLevel} />
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-chestnut">Options:</Label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Tick to mark correct answer(s)
                </span>
              </div>

              {options.map((opt) => {
                const isCorrect = correctAnswers.includes(opt.key);
                return (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-1 transition-all duration-200 ${
                      isCorrect ? "border-emerald-400 bg-emerald-50" : "border-black/10 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCorrect(opt.key)}
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                        isCorrect
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-slate-300 bg-white hover:border-emerald-400"
                      }`}
                    >
                      {isCorrect && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>

                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {opt.key}
                    </span>

                    <div className="flex-1 relative group">
                      <Input
                        value={opt.value}
                        onChange={(e) => updateOption(opt.key, e.target.value)}
                        placeholder={`Enter option ${opt.key}`}
                        className="w-full px-3 py-4 text-sm text-slate-700 font-medium placeholder:text-slate-300 border-0 bg-transparent focus:ring-0 outline-none pr-8"
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(opt.key)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {options.length < 6 && (
                <button
                  onClick={addOption}
                  className="self-start flex items-center gap-1.5 text-xs font-semibold text-chestnut mt-1 hover:text-chestnut/70 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  Add option
                </button>
              )}
            </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#D9D9D9]">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
              Cancel board question
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !boardSessionId}
              className="flex items-center justify-center gap-2 px-6 py-5 rounded-xl bg-chestnut hover:bg-chestnut/90 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />}
              <span className="text-white font-semibold text-sm">
                {isSubmitting ? "Adding…" : boardSessionId ? "Add to Question List" : "Save Board to Continue"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBoard;
