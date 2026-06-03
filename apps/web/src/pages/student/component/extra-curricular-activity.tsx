import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Play from "@/assets/svg/play.svg?react";
import { studentService, type StudentDashboardStats } from "@/services/student";
import { BookOpen, ClipboardCheck, GraduationCap, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

const ExtracurricularActivity = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await studentService.getDashboardStats();
        if (res.data.status === "successful") {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Set fallback data for development/when API is not ready
        setStats({
          classesThisWeek: 0,
          assessmentsThisWeek: 0,
          quizzesThisWeek: 0,
          pendingAssignments: 0,
          activeCourses: 0,
          ongoingClass: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm"
          >
            <div className="mb-3 h-11 w-11 rounded-2xl bg-slate-200" />
            <div className="mb-2 h-6 w-12 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Classes",
      sublabel: "This week",
      value: stats?.classesThisWeek ?? 0,
      icon: Tv,
      color: "text-purple-600",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      onClick: () => navigate("/student/recorded-class"),
    },
    {
      label: "Quizzes",
      sublabel: "This week",
      value: stats?.quizzesThisWeek ?? 0,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      onClick: () => navigate("/student/quizzes"),
    },
    {
      label: "Assessments",
      sublabel: "This week",
      value: stats?.assessmentsThisWeek ?? 0,
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      onClick: () => navigate("/student/assessments"),
    },
    {
      label: "Pending",
      sublabel: "Assignments",
      value: stats?.pendingAssignments ?? 0,
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      highlight: (stats?.pendingAssignments ?? 0) > 0,
      onClick: () => navigate("/student/assignments"),
    },
  ];

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className={cn(
                "group relative overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300",
                "border-white/80 bg-white/80 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.3)] hover:-translate-y-1 hover:shadow-[0_26px_55px_-30px_rgba(53,70,160,0.45)] active:scale-[0.99]",
                card.highlight && "ring-2 ring-amber-200"
              )}
            >
              <div className={cn(
                "absolute inset-x-0 top-0 h-1 opacity-80",
                card.label === "Classes" && "bg-[#7d8eff]",
                card.label === "Quizzes" && "bg-[#76b7ff]",
                card.label === "Assessments" && "bg-[#6ee7b7]",
                card.label === "Pending" && "bg-[#fbbf24]"
              )} />

              <div className={cn(
                "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
                card.iconBg
              )}>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>

              <p className={cn(
                "text-3xl font-semibold tracking-tight",
                card.value > 0 ? "text-slate-900" : "text-slate-400"
              )}>
                {card.value}
              </p>

              <p className="mt-3 text-sm font-semibold leading-tight text-slate-800">
                {card.label}
              </p>
              <p className="text-xs text-slate-500">
                {card.sublabel}
              </p>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                Open panel
              </p>

              {card.highlight && card.value > 0 && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {stats?.ongoingClass?.isLive && (
        <button
          onClick={() => navigate(`/student/live-class/${stats.ongoingClass?.lessonId}`)}
          className={cn(
            "flex w-full items-center justify-between rounded-[26px] bg-gradient-to-r from-[#f2485b] via-[#f65a63] to-[#ff7b59] p-5 text-white",
            "shadow-[0_22px_45px_-24px_rgba(242,72,91,0.7)] transition-transform active:scale-[0.99]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-base font-bold">Live Class Now</p>
              <p className="text-sm text-red-100">
                {stats.ongoingClass.subjectName} • {stats.ongoingClass.teacherName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <span className="font-semibold text-sm">Join</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ExtracurricularActivity;
