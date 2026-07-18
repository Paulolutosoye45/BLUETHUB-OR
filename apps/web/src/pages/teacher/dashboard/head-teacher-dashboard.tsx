import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Menu, Users, BarChart3, ClipboardCheck, RefreshCw, Loader2, ChevronRight, CheckCircle2, School, Trophy, Eye, BookOpen, GraduationCap, Plus, Library } from "lucide-react";
import { performanceService, type TeacherPerformanceDashboardDto, type PerformanceClassroomDto } from "@/services/performance";
import { type ApprovalItemDto } from "@/services/lesson";
import { approvalService } from "@/services/approval";
import { useAuthContext, isTeacherRoleData } from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const scoreColor = (val: number | null | undefined) => {
  if (val == null) return "text-gray-400";
  return val >= 50 ? "text-green-600" : "text-red-600";
};

const fmtScore = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "---";
  return `${Math.round(val)}%`;
};

interface ClassroomAnalytics {
  classroomId: string;
  className: string;
  subjects: PerformanceClassroomDto[];
  avgScore: number;
  passRate: number;
  totalStudents: number;
  totalAttempts: number;
}

const buildClassroomAnalytics = (dashboard: TeacherPerformanceDashboardDto): ClassroomAnalytics[] => {
  const map = new Map<string, PerformanceClassroomDto[]>();
  for (const c of dashboard.classrooms ?? []) {
    const key = c.classroomId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.entries()).map(([id, subjects]) => {
    const totalStudents = Math.max(...subjects.map((s) => s.studentCount));
    const totalAttempts = subjects.reduce((a, s) => a + (s.totalAttempts ?? 0), 0);
    const avgScore = subjects.reduce((a, s) => a + (s.averageScorePercent ?? 0), 0) / subjects.length;
    const passRate = subjects.reduce((a, s) => a + (s.passRate ?? 0), 0) / subjects.length;
    return {
      classroomId: id,
      className: subjects[0]?.classroomName ?? "Unknown",
      subjects,
      avgScore,
      passRate,
      totalStudents,
      totalAttempts,
    };
  });
};

const ClassroomSection = ({ analytics }: { analytics: ClassroomAnalytics }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
    <div className="bg-gradient-to-r from-[#292382] to-[#3D36A8] px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <School className="w-4 h-4" />
            {analytics.className}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {analytics.totalStudents} students · {analytics.subjects.length} subjects · {analytics.totalAttempts} total attempts
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-blue-200 uppercase tracking-wider">Avg Score</p>
          <p className={`text-lg font-bold ${analytics.avgScore >= 50 ? "text-green-300" : "text-red-300"}`}>
            {fmtScore(analytics.avgScore)}
          </p>
        </div>
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <MiniStat label="Students" value={analytics.totalStudents} icon={<Users className="w-3.5 h-3.5" />} color="text-blue-600" bg="bg-blue-50" />
        <MiniStat label="Avg Score" value={fmtScore(analytics.avgScore)} icon={<BarChart3 className="w-3.5 h-3.5" />} color={scoreColor(analytics.avgScore)} bg={analytics.avgScore >= 50 ? "bg-green-50" : "bg-red-50"} />
        <MiniStat label="Pass Rate" value={fmtScore(analytics.passRate)} icon={<Trophy className="w-3.5 h-3.5" />} color={scoreColor(analytics.passRate)} bg={analytics.passRate >= 50 ? "bg-green-50" : "bg-red-50"} />
        <MiniStat label="Attempts" value={analytics.totalAttempts} icon={<BookOpen className="w-3.5 h-3.5" />} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject Breakdown</p>
        {analytics.subjects.map((subj) => (
          <SubjectRow key={subj.subjectId} subj={subj} />
        ))}
      </div>
    </div>
  </div>
);

const MiniStat = ({ label, value, icon, color, bg }: { label: string; value: string | number; icon: React.ReactNode; color: string; bg: string }) => (
  <div className={`${bg} rounded-xl p-3 text-center`}>
    <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
    <p className={`text-sm font-bold ${color}`}>{value}</p>
    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
  </div>
);

const SubjectRow = ({ subj }: { subj: PerformanceClassroomDto }) => {
  const [open, setOpen] = useState(false);
  const qb = subj.quizBreakdown ?? [];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="w-3.5 h-3.5 text-[#292382] shrink-0" />
          <span className="text-xs font-semibold text-gray-800 truncate">{subj.subjectName}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-[10px] text-gray-400">{subj.completedAttempts}/{subj.totalAttempts}</span>
          <span className={`text-xs font-bold ${scoreColor(subj.averageScorePercent)}`}>{fmtScore(subj.averageScorePercent)}</span>
          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-50 bg-gray-50/50 px-3 py-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Pass Rate</p>
              <p className={`text-xs font-bold ${scoreColor(subj.passRate)}`}>{fmtScore(subj.passRate)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Students</p>
              <p className="text-xs font-bold text-gray-800">{subj.studentCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">Last Activity</p>
              <p className="text-xs font-bold text-gray-800">
                {subj.lastActivityDate ? new Date(subj.lastActivityDate).toLocaleDateString() : "---"}
              </p>
            </div>
          </div>

          {qb.length > 0 && (
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Recent Quizzes</p>
              {qb.map((q) => (
                <div key={q.quizCode} className="flex items-center justify-between text-[11px] pl-1">
                  <span className="text-gray-600 truncate">{q.lessonTitle}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-gray-400">{q.attemptCount} attempts</span>
                    <span className={`font-semibold ${scoreColor(q.averageScore)}`}>{fmtScore(q.averageScore)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {qb.length === 0 && (
            <p className="text-[10px] text-gray-400 text-center">No quiz data yet</p>
          )}
        </div>
      )}
    </div>
  );
};

const HeadTeacherDashboard = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const assignedClassrooms = useMemo(() => {
    const rd = user?.roleData;
    if (rd && isTeacherRoleData(rd)) {
      return rd.classrooms.map((c) => ({ classroomId: c.classroomId, className: c.className }));
    }
    return [];
  }, [user]);

  const [dashboard, setDashboard] = useState<TeacherPerformanceDashboardDto | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItemDto[]>([]);
  const [navbar, setNavbar] = useState<{ pendingApprovalsCount?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [navRes, dashRes, apprRes] = await Promise.all([
        performanceService.getNavbar(),
        performanceService.getDashboard(),
        approvalService.getPendingApprovals(),
      ]);
      const navData = (navRes.data as any)?.data;
      setNavbar(navData ?? null);
      const dashData = (dashRes.data as any)?.data;
      setDashboard(dashData as TeacherPerformanceDashboardDto);
      const apprData = (apprRes.data as any)?.data;
      setApprovals(apprData?.items ?? []);
    } catch {
      toast.error("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await performanceService.refreshPerformance();
      toast.success("Performance data refreshed");
      await fetchAll();
    } catch {
      toast.error("Failed to refresh performance data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      await approvalService.respondToApproval(id, { approved, rejectionReason: approved ? undefined : "Rejected by Head Teacher" });
      toast.success(approved ? "Approved" : "Rejected");
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Failed to respond to approval");
    }
  };

  const classroomAnalytics = useMemo(() => {
    if (!dashboard) return [];

    const all = buildClassroomAnalytics(dashboard);

    if (assignedClassrooms.length === 0) return all;

    const assignedIds = new Set(assignedClassrooms.map((c) => c.classroomId));
    return all.filter((ca) => assignedIds.has(ca.classroomId));
  }, [dashboard, assignedClassrooms]);

  const pendingCount = navbar?.pendingApprovalsCount ?? dashboard?.pendingApprovalsCount ?? approvals.filter((a) => a.status === "Pending").length;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between px-1 py-2">
          <div className="flex gap-2 items-center">
            <Menu className="text-[#292382]" onClick={openMobileNav} />
            <span className="text-[#292382] font-semibold text-sm">Head Teacher Dashboard</span>
          </div>
        </div>

        {/* Assigned classrooms indicator */}
        {assignedClassrooms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <School className="w-4 h-4 text-[#292382]" />
            <span className="text-xs text-gray-500 font-medium">Your classrooms:</span>
            {assignedClassrooms.map((c) => (
              <span key={c.classroomId} className="text-[11px] bg-[#292382]/10 text-[#292382] font-semibold px-2.5 py-1 rounded-full">
                {c.className}
              </span>
            ))}
          </div>
        )}

        {assignedClassrooms.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-amber-800 font-medium">No classrooms assigned to you yet.</p>
            <p className="text-xs text-amber-600 mt-0.5">Contact your administrator to assign classrooms to your account.</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#292382]" />
            <span className="text-sm text-gray-400">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Header + Refresh */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#292382]">Head Teacher Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {dashboard?.teacherName
                    ? `Welcome back, ${dashboard.teacherName}`
                    : "Class performance at a glance"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/teacher/question-bank")}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#292382] bg-white border border-gray-200/80 rounded-xl px-3 sm:px-4 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <Library className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Question Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/teacher/submit-lesson")}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white bg-[#292382] border border-[#292382] rounded-xl px-3 sm:px-4 py-2 hover:bg-[#3D36A8] active:bg-[#1E1868] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Submit Lesson</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#292382] bg-white border border-gray-200/80 rounded-xl px-3 sm:px-4 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Pending approvals notification banner */}
            {pendingCount > 0 && (
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-rose-800">
                      {pendingCount} lesson{pendingCount !== 1 ? "s" : ""} awaiting approval
                    </p>
                    <p className="text-xs text-rose-600 truncate">
                      Review and approve or reject pending lesson submissions
                    </p>
                  </div>
                </div>
                <a
                  href="#pending-approvals"
                  className="shrink-0 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 px-4 py-2 rounded-xl transition-colors"
                >
                  Review
                </a>
              </div>
            )}

            {/* Global stat cards */}
            {dashboard && classroomAnalytics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Assigned Classes", value: classroomAnalytics.length, icon: School, color: "from-blue-500 to-blue-600" },
                  { label: "Total Students", value: classroomAnalytics.reduce((a, c) => a + c.totalStudents, 0), icon: Users, color: "from-purple-500 to-purple-600" },
                  { label: "Overall Avg", value: fmtScore(classroomAnalytics.reduce((a, c) => a + c.avgScore, 0) / classroomAnalytics.length), icon: BarChart3, color: "from-green-500 to-green-600" },
                  { label: "Pending Lessons", value: pendingCount, icon: ClipboardCheck, color: "from-rose-500 to-rose-600" },
                ].map((card) => (
                  <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0`}>
                      <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">{card.label}</p>
                      <p className="text-lg sm:text-xl font-bold text-[#292382]">{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Main grid */}
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
              {/* Left: Per-classroom analytics */}
              <div className="flex-1 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#292382] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Classroom Analytics
                </h2>

                {classroomAnalytics.length === 0 && dashboard && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No performance data for your assigned classrooms.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {classroomAnalytics.map((ca) => (
                    <ClassroomSection key={ca.classroomId} analytics={ca} />
                  ))}
                </div>
              </div>

              {/* Right: Pending Approvals */}
              <div id="pending-approvals" className="lg:w-[320px] shrink-0 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#292382] flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5" />
                  Pending Approvals
                  {pendingCount > 0 && (
                    <span className="text-[11px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                  )}
                </h2>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                  {approvals.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No pending approvals</p>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100">
                    {approvals.map((a) => (
                      <div key={a.id} className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Eye className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#292382] truncate">{a.requestedByName}</p>
                            <p className="text-[11px] text-gray-500">
                              {a.lesson?.subjectName ?? "Lesson"}
                              {a.lesson?.className ? ` · ${a.lesson.className}` : ""}
                            </p>
                            {a.lesson?.aim && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{a.lesson.aim}</p>
                            )}
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(a.createdAt).toLocaleDateString()} · {a.status}
                            </p>
                            {a.status === "Pending" && (
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => handleApproval(a.id, true)}
                                  className="flex-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg py-1.5 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproval(a.id, false)}
                                  className="flex-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg py-1.5 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {a.status !== "Pending" && (
                              <span className={`inline-block text-[10px] font-semibold mt-2 px-2 py-0.5 rounded-full ${
                                a.status === "Approved" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                              }`}>
                                {a.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeadTeacherDashboard;
