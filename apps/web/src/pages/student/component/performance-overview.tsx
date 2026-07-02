import { useEffect, useState } from "react";
import { performanceService, type StudentPerformanceDetailDto, type PerformanceAttemptDto } from "@/services/performance";
import { useAuthContext } from "@/contexts/auth-context";
import { BarChart3, CheckCircle2, Trophy } from "lucide-react";

const PerformanceOverview = () => {
  const { user } = useAuthContext();
  const [data, setData] = useState<StudentPerformanceDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      try {
        const res = await performanceService.getDashboard();
        const list = res.data?.data as StudentPerformanceDetailDto[] | undefined;
        if (!cancelled && list) {
          // pick the record matching current student (or first)
          const mine = list.find((s) => s.studentId === user?.id) ?? list[0] ?? null;
          setData(mine);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchDashboard();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        Loading performance data…
      </div>
    );
  }

  if (!data) return null;

  const avgScore = data.averageScorePercent ?? 0;
  const bestScore = data.bestScorePercent ?? 0;
  const passRate = data.passRate ?? 0;
  const recentAttempts = data.recentAttempts ?? [];

  const passRateColor = passRate >= 70 ? "text-emerald-600" : passRate >= 50 ? "text-amber-600" : "text-rose-600";
  const scoreColor = avgScore >= 70 ? "text-emerald-600" : avgScore >= 50 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="space-y-3">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StudentSummaryCard
          label="Total Attempts"
          value={data.totalAttempts ?? 0}
          icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
          bg="bg-blue-50"
        />
        <StudentSummaryCard
          label="Completed"
          value={data.completedAttempts ?? 0}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          bg="bg-emerald-50"
        />
        <StudentSummaryCard
          label="Avg Score"
          value={`${avgScore.toFixed(1)}%`}
          icon={<BarChart3 className={`h-4 w-4 ${scoreColor}`} />}
          bg="bg-amber-50"
        />
        <StudentSummaryCard
          label="Best Score"
          value={`${bestScore.toFixed(1)}%`}
          icon={<Trophy className="h-4 w-4 text-yellow-500" />}
          bg="bg-yellow-50"
        />
      </div>

      {/* Pass Rate bar */}
      <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-700">Overall Pass Rate</p>
          <p className={`text-sm font-bold ${passRateColor}`}>{passRate.toFixed(1)}%</p>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              passRate >= 70 ? "bg-emerald-500" : passRate >= 50 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${Math.min(passRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Recent attempts */}
      <section>
        <h3 className="mb-2 text-xs font-bold text-slate-700">Recent Attempts</h3>
        <div className="space-y-1.5">
          {recentAttempts.map((a) => (
            <AttemptCard key={a.attemptId} attempt={a} />
          ))}
          {recentAttempts.length === 0 && (
            <p className="text-xs text-slate-400">No attempts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const AttemptCard = ({ attempt }: { attempt: PerformanceAttemptDto }) => {
  const passed = attempt.isPassed;
  const isPending = attempt.status !== "FullyGraded" && attempt.status !== "Submitted";
  const scoreColor = passed ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-800 truncate">{attempt.lessonTitle}</p>
        <p className="text-[10px] text-slate-400">
          {attempt.subjectName} · {attempt.classroomName} · Attempt #{attempt.attemptNumber}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className={`text-xs font-bold ${scoreColor}`}>{attempt.finalScorePercent.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400">
            {isPending ? "Pending review" : passed ? "Passed" : "Failed"}
          </p>
        </div>
        {attempt.submittedAt && (
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-slate-400">{new Date(attempt.submittedAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentSummaryCard = ({ label, value, icon, bg }: { label: string; value: string | number; icon: React.ReactNode; bg: string }) => (
  <div className={`flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 shadow-sm ${bg}`}>
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">{icon}</div>
    <div className="min-w-0">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-sm font-bold text-slate-800">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

export default PerformanceOverview;
