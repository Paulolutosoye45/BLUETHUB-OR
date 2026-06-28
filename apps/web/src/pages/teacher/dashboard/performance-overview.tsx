import { useEffect, useState } from "react";
import { performanceService, type TeacherPerformanceDashboardDto, type PerformanceClassroomDto } from "@/services/performance";
import { ChevronDown, ChevronUp, Users, BarChart3 } from "lucide-react";

const PerformanceOverview = () => {
  const [data, setData] = useState<TeacherPerformanceDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      try {
        const res = await performanceService.getDashboard();
        const d = res.data?.data;
        if (!cancelled && d) setData(d as TeacherPerformanceDashboardDto);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        Loading performance data…
      </div>
    );
  }

  if (!data) return null;

  const classrooms = data.classrooms ?? [];

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TeacherSummaryCard label="Total Students" value={data.totalStudents ?? 0} color="text-blue-600" bg="bg-blue-50" />
        <TeacherSummaryCard label="Avg Score" value={`${(data.overallAverageScore ?? 0).toFixed(1)}%`} color="text-amber-600" bg="bg-amber-50" />
        <TeacherSummaryCard label="Pass Rate" value={`${(data.overallPassRate ?? 0).toFixed(1)}%`} color="text-emerald-600" bg="bg-emerald-50" />
        <TeacherSummaryCard label="Classes" value={classrooms.length} color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* Per-classroom breakdown */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Your Performance by Subject &amp; Class</h3>
        <p className="mb-2 text-xs text-slate-400">
          Quiz performance for your subject in each class you teach.
        </p>
        <div className="space-y-2">
          {classrooms.map((cr) => (
            <ClassroomCard key={`${cr.classroomId}-${cr.subjectId}`} cr={cr} open={expanded.has(`${cr.classroomId}-${cr.subjectId}`)} onToggle={() => toggle(`${cr.classroomId}-${cr.subjectId}`)} />
          ))}
          {classrooms.length === 0 && (
            <p className="text-sm text-slate-400">No classroom data available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const ClassroomCard = ({ cr, open, onToggle }: { cr: PerformanceClassroomDto; open: boolean; onToggle: () => void }) => (
  <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
    <button onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">
          {cr.subjectName ?? "Subject"} <span className="text-xs font-normal text-slate-400">— {cr.classroomName}</span>
        </p>
        <p className="text-xs text-slate-400">
          {cr.studentCount} students · {cr.totalAttempts} attempts · {cr.averageScorePercent.toFixed(1)}% avg score
        </p>
      </div>
      <div className="ml-3 shrink-0 text-slate-300">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
    </button>

    {open && (
      <div className="border-t border-slate-50 px-4 py-3 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat label="Pass Rate" value={`${cr.passRate.toFixed(1)}%`} />
          <MiniStat label="Completed" value={`${cr.completedAttempts}/${cr.totalAttempts}`} />
          <MiniStat label="Avg Time" value={cr.averageTimeTakenSeconds ? `${Math.round(cr.averageTimeTakenSeconds / 60)}m` : "—"} />
          <MiniStat label="Last Activity" value={cr.lastActivityDate ? new Date(cr.lastActivityDate).toLocaleDateString() : "—"} />
        </div>

        {/* Quiz breakdown */}
        {cr.quizBreakdown.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">Quiz Breakdown</p>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="pb-1 font-semibold">Quiz</th>
                  <th className="pb-1 font-semibold">Attempts</th>
                  <th className="pb-1 font-semibold">Avg Score</th>
                  <th className="pb-1 font-semibold">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {cr.quizBreakdown.map((q) => (
                  <tr key={q.quizCode} className="border-t border-slate-50">
                    <td className="py-1 pr-3 font-medium">{q.lessonTitle}</td>
                    <td className="py-1 pr-3">{q.attemptCount}</td>
                    <td className="py-1 pr-3">{q.averageScore.toFixed(1)}%</td>
                    <td className="py-1">{q.passRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {cr.quizBreakdown.length === 0 && (
          <p className="text-xs text-slate-400">No quiz data for this classroom.</p>
        )}
      </div>
    )}
  </div>
);

const TeacherSummaryCard = ({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) => (
  <div className={`flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 shadow-sm ${bg}`}>
    <div className={`${color}`}>
      {label === "Total Students" ? <Users className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
    </div>
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-base font-bold text-slate-800">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);

export default PerformanceOverview;
