import { useEffect, useState } from "react";
import {
  performanceService,
  type AdminNavbarDto,
  type SubjectTeacherNavbarDto,
  type ClassTeacherNavbarDto,
  type StudentNavbarDto,
} from "@/services/performance";
import { useAuthContext } from "@/contexts/auth-context";
import { Users, GraduationCap, Building2, BarChart3, CheckCircle2, Clock, BookOpen, AlertTriangle } from "lucide-react";

type Role = "Admin" | "SuperAdministrator" | "Administrator" | "HeadTeacher" | "SubjectTeacher" | "ClassTeacher" | "Student";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const statCardClass =
  "flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm min-w-0";

const StatCard = ({ label, value, icon, color }: StatItem) => (
  <div className={statCardClass}>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="truncate text-base font-bold text-slate-800">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

const NavbarStats = () => {
  const { user } = useAuthContext();
  const role = user?.roleName as Role | undefined;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchNavbar = async () => {
      try {
        const res = await performanceService.getNavbar();
        const d = res.data?.data;
        if (!cancelled && d) setData(d as Record<string, any>);
      } catch {
        // silently fail — non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchNavbar();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data || !role) return null;

  const adminRoles: Role[] = ["Admin", "SuperAdministrator", "Administrator"];

  let items: StatItem[] = [];

  if (adminRoles.includes(role)) {
    const d = data as AdminNavbarDto;
    items = [
      { label: "Students", value: d.totalStudents, icon: <Users className="h-5 w-5 text-white" />, color: "bg-blue-500" },
      { label: "Teachers", value: d.totalTeachers, icon: <GraduationCap className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Classrooms", value: d.totalClassrooms, icon: <Building2 className="h-5 w-5 text-white" />, color: "bg-violet-500" },
      { label: "Avg Score", value: `${d.overallAverageScore.toFixed(1)}%`, icon: <BarChart3 className="h-5 w-5 text-white" />, color: "bg-amber-500" },
      { label: "Pass Rate", value: `${d.overallPassRate.toFixed(1)}%`, icon: <CheckCircle2 className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Pending Grading", value: d.pendingGradingItems, icon: <AlertTriangle className="h-5 w-5 text-white" />, color: d.pendingGradingItems > 0 ? "bg-rose-500" : "bg-slate-400" },
    ];
  } else if (role === "SubjectTeacher") {
    const d = data as SubjectTeacherNavbarDto;
    items = [
      { label: "Classes", value: d.classCount, icon: <Building2 className="h-5 w-5 text-white" />, color: "bg-violet-500" },
      { label: "Subjects", value: d.subjectCount, icon: <BookOpen className="h-5 w-5 text-white" />, color: "bg-blue-500" },
      { label: "Students", value: d.totalStudents, icon: <Users className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Avg Score", value: `${d.overallAverageScore.toFixed(1)}%`, icon: <BarChart3 className="h-5 w-5 text-white" />, color: "bg-amber-500" },
      { label: "Pass Rate", value: `${d.overallPassRate.toFixed(1)}%`, icon: <CheckCircle2 className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Pending Grading", value: d.pendingGradingItems, icon: <AlertTriangle className="h-5 w-5 text-white" />, color: d.pendingGradingItems > 0 ? "bg-rose-500" : "bg-slate-400" },
    ];
  } else if (role === "ClassTeacher" || role === "HeadTeacher") {
    const d = data as ClassTeacherNavbarDto;
    items = [
      { label: "Classes", value: d.classCount, icon: <Building2 className="h-5 w-5 text-white" />, color: "bg-violet-500" },
      { label: "Students", value: d.totalStudents, icon: <Users className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Avg Score", value: `${d.overallAverageScore.toFixed(1)}%`, icon: <BarChart3 className="h-5 w-5 text-white" />, color: "bg-amber-500" },
      { label: "Pass Rate", value: `${d.overallPassRate.toFixed(1)}%`, icon: <CheckCircle2 className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Pending Grading", value: d.pendingGradingItems, icon: <AlertTriangle className="h-5 w-5 text-white" />, color: d.pendingGradingItems > 0 ? "bg-rose-500" : "bg-slate-400" },
    ];
  } else if (role === "Student") {
    const d = data as StudentNavbarDto;
    items = [
      { label: "Total Attempts", value: d.totalAttempts, icon: <BarChart3 className="h-5 w-5 text-white" />, color: "bg-blue-500" },
      { label: "Completed", value: d.completedAttempts, icon: <CheckCircle2 className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Avg Score", value: `${d.averageScorePercent.toFixed(1)}%`, icon: <BarChart3 className="h-5 w-5 text-white" />, color: "bg-amber-500" },
      { label: "Pass Rate", value: `${d.passRate.toFixed(1)}%`, icon: <CheckCircle2 className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
      { label: "Pending Quizzes", value: d.pendingQuizzes, icon: <Clock className="h-5 w-5 text-white" />, color: d.pendingQuizzes > 0 ? "bg-rose-500" : "bg-slate-400" },
    ];
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
};

export default NavbarStats;
