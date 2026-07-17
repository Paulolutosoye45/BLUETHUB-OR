import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Menu, Users, BarChart3, ClipboardCheck, RefreshCw, Loader2, ChevronDown, ChevronRight, CheckCircle2, School, Trophy, Eye } from "lucide-react";
import { performanceService, type ClassTeacherNavbarDto, type TeacherPerformanceDashboardDto, type PerformanceClassroomDto } from "@/services/performance";
import { type ApprovalItemDto } from "@/services/lesson";
import { approvalService } from "@/services/approval";
import toast from "react-hot-toast";

const scoreColor = (val: number | null | undefined) => {
  if (val == null) return "text-gray-400";
  return val >= 50 ? "text-green-600" : "text-red-600";
};

const fmtScore = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "---";
  return `${Math.round(val)}%`;
};

const HeadTeacherDashboard = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();

  // ── Navbar stats ──
  const [navbar, setNavbar] = useState<ClassTeacherNavbarDto | null>(null);
  const [dashboard, setDashboard] = useState<TeacherPerformanceDashboardDto | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Expandable classroom ──
  const [expandedClassroom, setExpandedClassroom] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [navRes, dashRes, apprRes] = await Promise.all([
        performanceService.getNavbar(),
        performanceService.getDashboard(),
        approvalService.getPendingApprovals(),
      ]);
      const navData = (navRes.data as any)?.data;
      const dashData = (dashRes.data as any)?.data;
      setNavbar(navData as ClassTeacherNavbarDto);
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

  // ── Group classrooms by name for display ──
  const classroomsMap = new Map<string, PerformanceClassroomDto[]>();
  for (const c of dashboard?.classrooms ?? []) {
    const key = c.classroomId;
    if (!classroomsMap.has(key)) classroomsMap.set(key, []);
    classroomsMap.get(key)!.push(c);
  }
  const classroomEntries = Array.from(classroomsMap.entries());

  const pendingCount = dashboard?.pendingApprovalsCount ?? approvals.filter((a) => a.status === "Pending").length;

  return (
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between px-1 py-2">
          <div className="flex gap-2 items-center">
            <Menu className="text-[#292382]" onClick={openMobileNav} />
            <span className="text-[#292382] font-semibold text-sm">Head Teacher Dashboard</span>
          </div>
        </div>

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
                  Welcome back, {dashboard?.teacherName ?? "Head Teacher"}
                </p>
              </div>
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

            {/* Stats cards */}
            {navbar && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                {[
                  { label: "Classes", value: navbar.classCount, icon: School, color: "from-blue-500 to-blue-600" },
                  { label: "Students", value: navbar.totalStudents, icon: Users, color: "from-purple-500 to-purple-600" },
                  { label: "Avg Score", value: fmtScore(navbar.overallAverageScore), icon: BarChart3, color: "from-green-500 to-green-600" },
                  { label: "Pass Rate", value: fmtScore(navbar.overallPassRate), icon: Trophy, color: "from-amber-500 to-amber-600" },
                  { label: "Pending", value: navbar.pendingGradingItems, icon: ClipboardCheck, color: "from-rose-500 to-rose-600" },
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
              {/* Left: Classroom Performance */}
              <div className="flex-1 space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#292382] flex items-center gap-2">
                  <School className="w-5 h-5" />
                  Classroom Performance
                </h2>

                {classroomEntries.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No performance data available.</p>
                  </div>
                )}

                <div className="space-y-3">
                  {classroomEntries.map(([classroomId, subjects]) => {
                    const isOpen = expandedClassroom === classroomId;
                    const classroomName = subjects[0]?.classroomName ?? "Unknown";
                    const classAvg = subjects.reduce((a, s) => a + (s.averageScorePercent ?? 0), 0) / subjects.length;
                    const totalStudents = subjects.reduce((a, s) => a + s.studentCount, 0) / subjects.length;

                    return (
                      <div key={classroomId} className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedClassroom(isOpen ? null : classroomId)}
                          className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-gray-50/80 active:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#292382] to-[#3D36A8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {classroomName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="text-sm font-semibold text-[#292382] truncate">{classroomName}</p>
                              <p className="text-[11px] text-gray-400">{Math.round(totalStudents)} students · {subjects.length} subjects</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className={`text-sm font-bold ${scoreColor(classAvg)}`}>{fmtScore(classAvg)}</span>
                            {isOpen ? <ChevronDown className="w-4 h-4 text-[#292382]" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="border-t border-gray-50 bg-gray-50/50 px-4 sm:px-5 py-4 space-y-2">
                            {subjects.map((subj) => {
                              const qb = subj.quizBreakdown ?? [];
                              return (
                                <div key={`${subj.classroomId}-${subj.subjectId}`} className="bg-white rounded-xl border border-gray-200/80 p-3.5 sm:p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-[#292382]">{subj.subjectName}</p>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-400">{subj.completedAttempts}/{subj.totalAttempts} attempts</span>
                                      <span className={`text-sm font-bold ${scoreColor(subj.averageScorePercent)}`}>{fmtScore(subj.averageScorePercent)}</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 mb-2">
                                    <div className="text-center">
                                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Pass Rate</p>
                                      <p className={`text-xs font-bold ${scoreColor(subj.passRate)}`}>{fmtScore(subj.passRate)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Students</p>
                                      <p className="text-xs font-bold text-[#292382]">{subj.studentCount}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Last Activity</p>
                                      <p className="text-xs font-bold text-[#292382]">
                                        {subj.lastActivityDate ? new Date(subj.lastActivityDate).toLocaleDateString() : "---"}
                                      </p>
                                    </div>
                                  </div>
                                  {qb.length > 0 && (
                                    <div className="border-t border-gray-100 pt-2 mt-1 space-y-1.5">
                                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Recent Quizzes</p>
                                      {qb.map((q) => (
                                        <div key={q.quizCode} className="flex items-center justify-between text-xs">
                                          <span className="text-gray-600 truncate">{q.lessonTitle}</span>
                                          <div className="flex items-center gap-2 shrink-0 ml-2">
                                            <span className="text-gray-400">{q.attemptCount} attempts</span>
                                            <span className={`font-semibold ${scoreColor(q.averageScore)}`}>{fmtScore(q.averageScore)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Pending Approvals */}
              <div className="lg:w-[320px] shrink-0 space-y-4">
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
