import { useEffect, useState } from "react";
import { performanceService, type SchoolPerformanceOverviewDto } from "@/services/performance";
import { BarChart3, ChevronDown, ChevronUp, Users, GraduationCap } from "lucide-react";

const PerformanceOverview = () => {
  const [data, setData] = useState<SchoolPerformanceOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedClassrooms, setExpandedClassrooms] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchDashboard = async () => {
      try {
        const res = await performanceService.getDashboard();
        const d = res.data?.data;
        if (!cancelled && d) setData(d as SchoolPerformanceOverviewDto);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const toggleClassroom = (id: string) => {
    setExpandedClassrooms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
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

  const classroomBreakdown = data.classroomBreakdown ?? [];
  const subjectBreakdown = data.subjectBreakdown ?? [];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Total Students" value={data.totalStudents ?? 0} icon={<Users className="h-5 w-5" />} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="Total Attempts" value={data.totalAttempts ?? 0} icon={<BarChart3 className="h-5 w-5" />} color="text-violet-600" bg="bg-violet-50" />
        <SummaryCard label="Completed" value={data.completedAttempts ?? 0} icon={<GraduationCap className="h-5 w-5" />} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="Avg Score" value={`${(data.overallAverageScore ?? 0).toFixed(1)}%`} icon={<BarChart3 className="h-5 w-5" />} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="Pass Rate" value={`${(data.overallPassRate ?? 0).toFixed(1)}%`} icon={<BarChart3 className="h-5 w-5" />} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Classroom Breakdown */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Performance by Classroom</h3>
        <p className="mb-2 text-xs text-slate-400">
          Overall quiz performance for each class across all subjects they offer.
        </p>
        <div className="space-y-2">
          {classroomBreakdown.map((cr) => {
            const open = expandedClassrooms.has(cr.classroomId);
            return (
              <div key={cr.classroomId} className="rounded-xl border border-slate-100 bg-white shadow-sm">
                <button
                  onClick={() => toggleClassroom(cr.classroomId)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{cr.classroomName}</p>
                    <p className="text-xs text-slate-400">
                      {cr.studentCount} students · {cr.totalAttempts} attempts · {cr.averageScorePercent.toFixed(1)}% avg score
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-slate-300">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-50 px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniStat label="Pass Rate" value={`${cr.passRate.toFixed(1)}%`} />
                      <MiniStat label="Completed" value={`${cr.completedAttempts}/${cr.totalAttempts}`} />
                      <MiniStat label="Avg Time" value={cr.averageTimeTakenSeconds ? `${Math.round(cr.averageTimeTakenSeconds / 60)}m` : "—"} />
                      <MiniStat label="Last Activity" value={cr.lastActivityDate ? new Date(cr.lastActivityDate).toLocaleDateString() : "—"} />
                    </div>
                    {cr.quizBreakdown.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-500">Quiz Breakdown</p>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400">
                              <th className="pb-1.5 font-semibold">Quiz</th>
                              <th className="pb-1.5 font-semibold">Attempts</th>
                              <th className="pb-1.5 font-semibold">Avg Score</th>
                              <th className="pb-1.5 font-semibold">Pass Rate</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-700">
                            {cr.quizBreakdown.map((q) => (
                              <tr key={q.quizCode} className="border-t border-slate-50">
                                <td className="py-1.5 pr-3 font-medium">{q.lessonTitle}</td>
                                <td className="py-1.5 pr-3">{q.attemptCount}</td>
                                <td className="py-1.5 pr-3">{q.averageScore.toFixed(1)}%</td>
                                <td className="py-1.5">{q.passRate.toFixed(1)}%</td>
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
          })}
          {classroomBreakdown.length === 0 && (
            <p className="text-sm text-slate-400">No classroom data available.</p>
          )}
        </div>
      </section>

      {/* Subject Breakdown */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Performance by Subject</h3>
        <p className="mb-2 text-xs text-slate-400">
          School-wide quiz performance for each subject, aggregating data across all classes.
        </p>
        <div className="space-y-2">
          {subjectBreakdown.map((sb) => {
            const key = sb.subjectId;
            const open = expandedSubjects.has(key);
            return (
              <div key={key} className="rounded-xl border border-slate-100 bg-white shadow-sm">
                <button
                  onClick={() => toggleSubject(key)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{sb.subjectName}</p>
                    <p className="text-xs text-slate-400">
                      {sb.studentCount} students · {sb.totalAttempts} attempts · {sb.averageScorePercent.toFixed(1)}% avg score
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-slate-300">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-50 px-4 py-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <MiniStat label="Pass Rate" value={`${sb.passRate.toFixed(1)}%`} />
                      <MiniStat label="Completed" value={`${sb.completedAttempts}/${sb.totalAttempts}`} />
                      <MiniStat label="Avg Time" value={sb.averageTimeTakenSeconds ? `${Math.round(sb.averageTimeTakenSeconds / 60)}m` : "—"} />
                      <MiniStat label="Last Activity" value={sb.lastActivityDate ? new Date(sb.lastActivityDate).toLocaleDateString() : "—"} />
                    </div>
                    {sb.quizBreakdown.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-500">Quiz Breakdown</p>
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400">
                              <th className="pb-1.5 font-semibold">Quiz</th>
                              <th className="pb-1.5 font-semibold">Attempts</th>
                              <th className="pb-1.5 font-semibold">Avg Score</th>
                              <th className="pb-1.5 font-semibold">Pass Rate</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-700">
                            {sb.quizBreakdown.map((q) => (
                              <tr key={q.quizCode} className="border-t border-slate-50">
                                <td className="py-1.5 pr-3 font-medium">{q.lessonTitle}</td>
                                <td className="py-1.5 pr-3">{q.attemptCount}</td>
                                <td className="py-1.5 pr-3">{q.averageScore.toFixed(1)}%</td>
                                <td className="py-1.5">{q.passRate.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {sb.quizBreakdown.length === 0 && (
                      <p className="text-xs text-slate-400">No quiz data for this subject.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {subjectBreakdown.length === 0 && (
            <p className="text-sm text-slate-400">No subject data available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color, bg }: { label: string; value: string | number; icon: React.ReactNode; color: string; bg: string }) => (
  <div className={`flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 shadow-sm ${bg}`}>
    <div className={`${color}`}>{icon}</div>
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
