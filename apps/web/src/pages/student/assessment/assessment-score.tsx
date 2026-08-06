import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentService, type StudentAssessmentScoreDto } from "@/services/assessment";
import {
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Clock,
  ChevronRight,
  Target,
  Timer,
  Hourglass,
} from "lucide-react";
import StudentAppBar from "../component/app-bar";

const scoreStatusLabel: Record<string, string> = {
  Submitted: "Pending Grading",
  PartiallyGraded: "Partially Graded",
  FullyGraded: "Completed",
};

const scorableStatuses = new Set(["Submitted", "PartiallyGraded", "FullyGraded"]);

const AssessmentScore = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<StudentAssessmentScoreDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await assessmentService.getStudentScores();
        if (!cancelled) setScores(res.data?.data ?? []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const attempted = scores.filter((a) => scorableStatuses.has(a.status));
  const averageScore = attempted.length
    ? attempted.reduce((sum, a) => sum + (a.finalScorePercent ?? 0), 0) / attempted.length
    : 0;
  const passed = attempted.filter((a) => a.isPassed === true).length;
  const failed = attempted.filter((a) => a.isPassed === false).length;

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-500";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-400";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col gap-4 overflow-y-auto rounded-md border border-white/70 bg-white/55 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6">
      <StudentAppBar />

      <section className="border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(79,97,232,0.12),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f5f8ff_100%)] px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#4F61E8]">
              Assessment Scores
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">My Scores</h2>
            <p className="mt-1 text-sm text-slate-500">
              View your scores across all assessments you've attempted.
            </p>
          </div>
          {attempted.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="rounded-2xl flex border border-slate-200 bg-white px-4 py-2 items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Average</p>
                <p className={`text-lg font-semibold ${scoreColor(averageScore)}`}>{averageScore.toFixed(0)}%</p>
              </div>
              <div className="rounded-2xl flex border border-emerald-200 bg-emerald-50 px-4 py-2 items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">Passed</p>
                <p className="text-lg font-semibold text-emerald-600">{passed}</p>
              </div>
              <div className="rounded-2xl flex border border-red-200 bg-red-50 px-4 py-2 items-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-500">Failed</p>
                <p className="text-lg font-semibold text-red-500">{failed}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading scores…</span>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No assessments found</p>
            <p className="max-w-sm text-sm text-slate-500">
              You haven't been assigned any assessments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {scores.map((a) => {
              const hasScore = scorableStatuses.has(a.status);
              return (
                <div
                  key={a.assessmentId}
                  className="group rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(79,97,232,0.5)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {hasScore && a.isPassed != null ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${a.isPassed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {a.isPassed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {a.isPassed ? "Passed" : "Failed"}
                          </span>
                        ) : hasScore ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-700">
                            <Hourglass className="size-3 mr-1" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-500">
                            {a.status === "NotStarted" ? "Not Started" : "In Progress"}
                          </span>
                        )}
                        {a.status !== "NotStarted" && (
                          <span className="text-[10px] font-medium text-slate-400">{scoreStatusLabel[a.status] ?? a.status}</span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">{a.code}</span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 truncate">{a.title}</h3>

                      {a.description && (
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{a.description}</p>
                      )}

                      {hasScore && a.finalScorePercent != null ? (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Score</span>
                            <span className={`font-bold ${scoreColor(a.finalScorePercent)}`}>
                              {a.finalScorePercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(a.finalScorePercent)}`}
                              style={{ width: `${Math.min(a.finalScorePercent, 100)}%` }}
                            />
                          </div>
                          {(a.autoMarksObtained != null || a.manualMarksObtained != null) && (
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                              {a.autoMarksObtained != null && <span>Auto: {a.autoMarksObtained.toFixed(0)}/{a.totalMarks.toFixed(0)}</span>}
                              {a.manualMarksObtained != null && a.manualMarksObtained > 0 && <span>Manual: +{a.manualMarksObtained.toFixed(0)}</span>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-slate-400">
                          {a.status === "NotStarted" ? "Not yet attempted" : "Awaiting results..."}
                        </div>
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
                            <Target className="h-3.5 w-3.5 text-slate-400" />
                            Attempt {a.attemptNumber}
                          </span>
                        )}
                        {a.timeTakenSeconds != null && (
                          <span className="flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5 text-slate-400" />
                            {formatTime(a.timeTakenSeconds)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {a.status === "NotStarted" ? (
                        <button
                          onClick={() => navigate(`/student/assessment/${a.assessmentId}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-[#4255db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3447cc] transition-colors"
                        >
                          Start
                        </button>
                      ) : a.status === "InProgress" ? (
                        <button
                          onClick={() => navigate(`/student/assessment/${a.assessmentId}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          Resume
                        </button>
                      ) : a.attemptId ? (
                        <button
                          onClick={() => navigate(`/student/assessment/${a.assessmentId}/result/${a.attemptId}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-[#4255db] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3447cc] transition-colors"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
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

export default AssessmentScore;
