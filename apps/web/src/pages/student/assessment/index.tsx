import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentService, type StudentAssessmentItem } from "@/services/assessment";
import toast from "react-hot-toast";
import {
  BookOpen,
  FileQuestion,
  Loader2,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import StudentAppBar from "../component/app-bar";

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  NotStarted: { label: "Not Started", bg: "bg-slate-100", text: "text-slate-600", icon: "○" },
  InProgress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700", icon: "◐" },
  Completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", icon: "●" },
};

const StudentAssessmentList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<StudentAssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await assessmentService.getStudentList();
        if (!cancelled) setAssessments(res.data?.data ?? []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const handleViewResult = async (assessment: StudentAssessmentItem) => {
    try {
      const res = await assessmentService.getHistory(assessment.assessmentId);
      const attempts = res.data?.data ?? [];
      const latest = attempts.sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
      if (latest?.attemptId) {
        navigate(`/student/assessment/${assessment.assessmentId}/result/${latest.attemptId}`);
      } else {
        toast.error("No attempt found for this assessment.");
      }
    } catch {
      toast.error("Failed to load attempt details.");
    }
  };

  const totalAssessments = assessments.length;
  const completedCount = assessments.filter((a) => a.status === "Completed").length;
  const inProgressCount = assessments.filter((a) => a.status === "InProgress").length;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col overflow-y-auto rounded-md border border-white/70 bg-white/55 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <StudentAppBar />

      <section className="mt-6 border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(79,97,232,0.12),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f5f8ff_100%)] px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#4F61E8]">
              Assessment
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">My Assessments</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and attempt your assigned assessments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl flex border border-slate-200 bg-white px-4 py-2 items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
              <p className="text-lg font-semibold text-slate-900">{totalAssessments}</p>
            </div>
            <div className="rounded-2xl flex border border-slate-200 bg-white px-4 py-2 items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">In Progress</p>
              <p className="text-lg font-semibold text-amber-600">{inProgressCount}</p>
            </div>
            <div className="rounded-2xl flex border border-slate-200 bg-white px-4 py-2 items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Completed</p>
              <p className="text-lg font-semibold text-emerald-600">{completedCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 flex-1 px-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading assessments…</span>
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No assessments assigned</p>
            <p className="max-w-sm text-sm text-slate-500">
              You haven't been assigned any assessments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => {
              const status = statusConfig[a.status] ?? statusConfig.NotStarted;
              const hasCompleted = a.status === "Completed";

              return (
                <div
                  key={a.assessmentId}
                  className="group rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(79,97,232,0.5)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{a.code}</span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 truncate">{a.title}</h3>

                      {a.description && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{a.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                          {a.questionCount} question{a.questionCount !== 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {a.timeLimitMinutes} min
                        </span>
                        {a.attemptNumber != null && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                            Attempt {a.attemptNumber}
                          </span>
                        )}
                        {hasCompleted && a.finalScorePercent != null && (
                          <span className={`flex items-center gap-1 font-semibold ${a.isPassed ? "text-emerald-600" : "text-red-500"}`}>
                            {a.isPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {a.finalScorePercent.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {a.status === "Completed" ? (
                        <button
                          onClick={() => handleViewResult(a)}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          View Result
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : a.status === "InProgress" ? (
                        <button
                          onClick={() => navigate(`/student/assessment/${a.assessmentId}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/student/assessment/${a.assessmentId}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-[#4255db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3447cc] transition-colors"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentAssessmentList;
