import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService, type AssessmentDetail } from "@/services/assessment";
import toast from "react-hot-toast";
import {
  BookOpen,
  Clock,
  FileQuestion,
  Loader2,
  PlayCircle,
  Target,
  AlertCircle,
  ArrowLeft,
  TimerOff,
  Sparkles,
} from "lucide-react";

const DIFFICULTY_META = [
  { label: "Easy", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Hard", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Expert", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

const AssessmentDetailPage = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!assessmentId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await assessmentService.getDetail(assessmentId);
        if (!cancelled) setDetail(res.data?.data ?? null);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [assessmentId]);

  const isExpired = detail?.expiresAt ? new Date(detail.expiresAt) < new Date() : false;

  const difficultyBreakdown = useMemo(() => {
    if (!detail?.questions?.length) return [];
    const groups: Record<number, { count: number; totalMarks: number }> = {};
    for (const q of detail.questions) {
      if (!groups[q.difficultyLevel]) groups[q.difficultyLevel] = { count: 0, totalMarks: 0 };
      groups[q.difficultyLevel].count++;
      groups[q.difficultyLevel].totalMarks += q.marksAllocation;
    }
    return Object.entries(groups)
      .map(([level, data]) => ({
        level: Number(level),
        meta: DIFFICULTY_META[Number(level) - 1] ?? { label: `Level ${level}`, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
        ...data,
      }))
      .sort((a, b) => a.level - b.level);
  }, [detail?.questions]);

  const handleStart = async () => {
    if (!assessmentId) return;
    setStarting(true);
    try {
      const res = await assessmentService.startAttempt(assessmentId);
      const data = res.data?.data;
      if (data) {
        navigate(`/student/assessment/${assessmentId}/attempt/${data.attemptId}`, {
          state: { attemptData: data },
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.responseMessage ?? err?.message ?? "";
      if (msg.includes("expired") || msg.includes("Expired")) {
        toast.error("This assessment has expired and can no longer be attempted.");
      } else {
        toast.error(msg || "Failed to start assessment.");
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-[#4255db]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-500">
        <AlertCircle className="h-10 w-10" />
        <p className="text-sm">Assessment not found.</p>
        <button onClick={() => navigate("/student/assessment")} className="text-[#4255db] text-sm font-semibold">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[800px] flex-col overflow-y-auto rounded-md border border-white/70 bg-white/55 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6">
      <button
        onClick={() => navigate("/student/assessment")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assessments
      </button>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono text-slate-400">{detail.code}</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mt-1">{detail.title}</h1>

        {detail.description && (
          <p className="text-sm text-slate-500 mt-2">{detail.description}</p>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3.5">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Questions</p>
                <p className="text-lg font-bold text-slate-800">{detail.questionCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Time Limit</p>
                <p className="text-lg font-bold text-slate-800">{detail.timeLimitMinutes} min</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Pass Mark</p>
                <p className="text-lg font-bold text-slate-800">{detail.passMarkPercent}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-purple-50 border border-purple-100 p-3.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total Marks</p>
                <p className="text-lg font-bold text-slate-800">{detail.totalMarks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Instructions</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-slate-300 mt-0.5">•</span>
              <span>You have <strong>{detail.timeLimitMinutes} minutes</strong> to complete this assessment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-300 mt-0.5">•</span>
              <span>The pass mark is <strong>{detail.passMarkPercent}%</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-300 mt-0.5">•</span>
              <span>{detail.shuffleQuestions ? "Questions are shuffled." : "Questions are in order."}</span>
            </li>
            {detail.showResultImmediately && (
              <li className="flex items-start gap-2">
                <span className="text-slate-300 mt-0.5">•</span>
                <span>Results will be shown immediately after submission.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-slate-300 mt-0.5">•</span>
              <span><strong>{detail.questionCount} questions</strong> · <strong>{detail.totalMarks} marks total</strong></span>
            </li>
          </ul>

          {difficultyBreakdown.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Marks by Difficulty</p>
              {difficultyBreakdown.map(({ level, meta, count, totalMarks }) => (
                <div key={level} className={`flex items-center justify-between rounded-lg border ${meta.border} ${meta.bg} px-3 py-1.5`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className={`size-3 ${meta.color}`} />
                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  </div>
                  <span className="text-xs text-slate-600">
                    {count} question{count > 1 ? "s" : ""} × {totalMarks / count} mark{(totalMarks / count) > 1 ? "s" : ""} = <strong>{totalMarks} marks</strong>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isExpired && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <TimerOff className="w-5 h-5 shrink-0" />
            <span>This assessment has expired and can no longer be attempted.</span>
          </div>
        )}

        {detail.expiresAt && !isExpired && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            <Clock className="w-5 h-5 shrink-0" />
            <span>Expires {new Date(detail.expiresAt).toLocaleString()}</span>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={starting || isExpired}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#4255db] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3447cc] transition-colors disabled:opacity-50"
        >
          {starting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          {starting ? "Starting…" : isExpired ? "Expired" : "Start Assessment"}
        </button>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
