import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService, type StartAttemptData } from "@/services/assessment";
import { useAuthContext } from "@/contexts/auth-context";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  FileQuestion,
  Pencil,
  Type,
} from "lucide-react";
import StudentAnswerBoard, { type AnswerBoardMeta, type BoardState } from "./student-answer-board";

const AttemptPage = () => {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [attemptData, setAttemptData] = useState<StartAttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Drawing board state ────────────────────────────────────────────────────
  const [drawModeByQuestion, setDrawModeByQuestion] = useState<Record<string, boolean>>({});
  const [questionBoardMeta, setQuestionBoardMeta] = useState<
    Record<string, AnswerBoardMeta[]>
  >({});
  const [boardDataByQuestion, setBoardDataByQuestion] = useState<
    Record<string, Record<number, BoardState>>
  >({});
  const [savingBoard, setSavingBoard] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    const state = (window.history.state?.usr as any)?.attemptData;
    if (state) {
      setAttemptData(state);
      if (state.timeLimitMinutes) {
        setTimeLeft(state.timeLimitMinutes * 60);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft == null || timeLeft <= 0 || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev == null || prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, submitted]);

  const studentId = user?.id ?? "unknown";
  const sessionId = assessmentId && studentId
    ? `${assessmentId}_${studentId}`
    : null;

  const questions = attemptData?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(() => {
    let count = 0;
    for (const q of questions) {
      if (q.options.length > 0) {
        if (selectedOptions[q.questionId]) count++;
      } else {
        const isDrawMode = drawModeByQuestion[q.questionId];
        const boardsMeta = questionBoardMeta[q.questionId] ?? [];
        const hasBoardAnswer = boardsMeta.length > 0;
        if (isDrawMode) {
          if (hasBoardAnswer || typedAnswers[q.questionId]?.trim()) count++;
        } else {
          if (typedAnswers[q.questionId]?.trim()) count++;
        }
      }
    }
    return count;
  }, [questions, selectedOptions, typedAnswers, drawModeByQuestion, questionBoardMeta]);

  const submitAnswer = useCallback(async (questionId: string) => {
    if (!attemptId) return;
    const q = questions.find((x) => x.questionId === questionId);
    if (!q) return;

    const isDrawMode = drawModeByQuestion[questionId];
    const boardsMeta = questionBoardMeta[questionId] ?? [];
    const hasBoardAnswer = boardsMeta.length > 0;

    const payload: any = {
      attemptId,
      questionId,
      selectedOptionId: q.options.length > 0 ? (selectedOptions[questionId] ?? null) : null,
      typedAnswer: q.options.length === 0 && !isDrawMode ? (typedAnswers[questionId] ?? null) : null,
      isSkipped: q.options.length > 0
        ? !selectedOptions[questionId]
        : isDrawMode
          ? !hasBoardAnswer && !typedAnswers[questionId]?.trim()
          : !typedAnswers[questionId]?.trim(),
    };

    if (isDrawMode && hasBoardAnswer) {
      payload.boards = boardsMeta;
      if (sessionId) payload.boardSessionId = `${sessionId}_${questionId}`;
    }

    try {
      await assessmentService.submitAnswer(payload);
    } catch {
      // silently fail
    }
  }, [attemptId, questions, selectedOptions, typedAnswers, drawModeByQuestion, questionBoardMeta, sessionId]);

  const handleSaveBoard = useCallback(async () => {
    setSavingBoard(true);
    await new Promise((r) => setTimeout(r, 200));
    setSavingBoard(false);
    toast.success("Board saved");
  }, []);

  const handleNext = async () => {
    if (currentQuestion) await submitAnswer(currentQuestion.questionId);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = async () => {
    if (currentQuestion) await submitAnswer(currentQuestion.questionId);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    if (currentQuestion) await submitAnswer(currentQuestion.questionId);
    try {
      const res = await assessmentService.submitAttempt(attemptId);
      setSubmitResult(res.data?.data ?? null);
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-[#4255db]" />
      </div>
    );
  }

  if (submitted && submitResult) {
    return (
      <div className="mx-auto max-w-[800px] p-6">
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Submitted</h2>
          <p className="text-sm text-slate-500 mt-1">Your attempt has been recorded.</p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Score</p>
              <p className={`text-xl font-bold ${submitResult.isPassed ? "text-emerald-600" : "text-red-500"}`}>
                {submitResult.finalScorePercent?.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Obtained</p>
              <p className="text-xl font-bold text-slate-800">{submitResult.marksObtained?.toFixed(0)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Total</p>
              <p className="text-xl font-bold text-slate-800">{submitResult.totalMarks?.toFixed(0)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Status</p>
              <p className={`text-xl font-bold ${submitResult.isPassed ? "text-emerald-600" : "text-red-500"}`}>
                {submitResult.isPassed ? "Passed" : "Failed"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/student/assessment/${assessmentId}/result/${attemptId}`)}
              className="rounded-full bg-[#4255db] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3447cc] transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => navigate("/student/assessment")}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attemptData || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-500">
        <AlertTriangle className="h-10 w-10" />
        <p className="text-sm">No questions available.</p>
        <button onClick={() => navigate("/student/assessment")} className="text-[#4255db] text-sm font-semibold">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] p-4 md:p-6">
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#292382] to-[#3D36A8] px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <FileQuestion className="w-4 h-4" />
              <span className="text-sm font-medium">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <span className="text-xs text-white/60">{answeredCount}/{questions.length} answered</span>
              {timeLeft != null && (
                <span className={`flex items-center gap-1 text-sm font-mono font-bold ${timeLeft < 60 ? "text-red-300 animate-pulse" : ""}`}>
                  <Clock className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/60 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex gap-2 mb-4">
            {questions.map((q, i) => {
              const isDrawMode = drawModeByQuestion[q.questionId];
              const boardsMeta = questionBoardMeta[q.questionId] ?? [];
              const hasBoardAnswer = boardsMeta.length > 0;
              const isAnswered = q.options.length > 0
                ? !!selectedOptions[q.questionId]
                : isDrawMode
                  ? hasBoardAnswer || !!typedAnswers[q.questionId]?.trim()
                  : !!typedAnswers[q.questionId]?.trim();
              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    i === currentIndex
                      ? "bg-[#4255db] text-white"
                      : isAnswered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

            <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                {currentQuestion.questionType === 4 ? "True / False" : currentQuestion.options.length > 0 ? "Objective" : "Theory"} Question
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {currentQuestion.marksAllocation} mark{currentQuestion.marksAllocation !== 1 ? "s" : ""}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mb-1">{currentQuestion.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{currentQuestion.textContent}</p>

            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Question image"
                  className="max-w-full max-h-64 rounded-xl border border-slate-200 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {currentQuestion.boardSnapshotUrl && (
              <div className="mb-4">
                <img
                  src={currentQuestion.boardSnapshotUrl}
                  alt="Board snapshot"
                  className="max-w-full max-h-64 rounded-xl border border-slate-200 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {currentQuestion.options.length > 0 || currentQuestion.questionType === 4 ? (
              <div className="space-y-2">
                {(currentQuestion.options.length > 0
                  ? currentQuestion.options
                  : [
                      { questionId: currentQuestion.questionId, optionId: "true", optionLabel: "A", optionText: "True" },
                      { questionId: currentQuestion.questionId, optionId: "false", optionLabel: "B", optionText: "False" },
                    ]
                ).map((opt: any) => {
                  const isSelected = selectedOptions[currentQuestion.questionId] === opt.optionId;
                  return (
                    <button
                      key={opt.optionId}
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [currentQuestion.questionId]: opt.optionId }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#4255db] bg-[#eef2ff] text-[#4255db]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-[#4255db] text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {opt.optionLabel}
                      </span>
                      <span className="text-sm">{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mode toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 w-fit">
                  <button
                    type="button"
                    onClick={() =>
                      setDrawModeByQuestion((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: false,
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      !drawModeByQuestion[currentQuestion.questionId]
                        ? "bg-[#4255db] text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    Type Answer
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDrawModeByQuestion((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: true,
                      }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      drawModeByQuestion[currentQuestion.questionId]
                        ? "bg-[#4255db] text-white"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Draw Answer
                  </button>
                </div>

                {!drawModeByQuestion[currentQuestion.questionId] ? (
                  <textarea
                    value={typedAnswers[currentQuestion.questionId] ?? ""}
                    onChange={(e) =>
                      setTypedAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: e.target.value,
                      }))
                    }
                    placeholder="Type your answer here..."
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-[#4255db] focus:ring-1 focus:ring-[#4255db]/30 resize-none"
                  />
                ) : (
                  <StudentAnswerBoard
                    key={currentQuestion.questionId}
                    questionId={currentQuestion.questionId}
                    sessionId={sessionId ? `${sessionId}_${currentQuestion.questionId}` : undefined}
                    initialBoards={boardDataByQuestion[currentQuestion.questionId] ?? null}
                    onBoardsChange={(meta) =>
                      setQuestionBoardMeta((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: meta,
                      }))
                    }
                    onStrokesChange={(strokes) =>
                      setBoardDataByQuestion((prev) => ({
                        ...prev,
                        [currentQuestion.questionId]: strokes,
                      }))
                    }
                    onSaveBoard={handleSaveBoard}
                    saving={savingBoard}
                  />
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Submitting…" : "Submit All"}
                </button>

                {currentIndex < questions.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#4255db] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3447cc] transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptPage;
