import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assessmentService, type AssessmentDetail } from "@/services/assessment";
import {
  BookOpen,
  Clock,
  FileQuestion,
  Loader2,
  PlayCircle,
  Target,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

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
    } catch {
      // silently fail
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
              <span>Contains <strong>{detail.questionCount} questions</strong> worth <strong>{detail.totalMarks} marks</strong>.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#4255db] px-6 py-3 text-sm font-semibold text-white hover:bg-[#3447cc] transition-colors disabled:opacity-50"
        >
          {starting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          {starting ? "Starting…" : "Start Assessment"}
        </button>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;
