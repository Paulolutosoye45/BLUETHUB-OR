import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cube from "@/assets/svg/cube.svg?react";
import My_course from "@/assets/svg/scourses.svg?react";
import Assignments from "@/assets/svg/assignment.svg?react";
import Play from "@/assets/svg/play.svg?react";
import { studentService, type StudentDashboardStats } from "@/services/student";
import { Loader2, BookOpen, ClipboardCheck, GraduationCap, Tv } from "lucide-react";
import { cn } from "@/lib/utils";

const ExtracurricularActivity = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await studentService.getDashboardStats();
        if (res.data.isSuccess) {
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
      <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
            <div className="h-6 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-4 bg-gray-100 rounded w-20" />
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
    <div className="my-6 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className={cn(
                "relative bg-white rounded-2xl p-4 text-left transition-all",
                "shadow-sm hover:shadow-md active:scale-[0.98]",
                "border border-gray-100",
                card.highlight && "ring-2 ring-amber-200"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                card.iconBg
              )}>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>

              {/* Value */}
              <p className={cn(
                "text-2xl font-bold",
                card.value > 0 ? "text-gray-900" : "text-gray-400"
              )}>
                {card.value}
              </p>

              {/* Labels */}
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {card.label}
              </p>
              <p className="text-xs text-gray-400">
                {card.sublabel}
              </p>

              {/* Badge for pending items */}
              {card.highlight && card.value > 0 && (
                <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Ongoing Class Banner */}
      {stats?.ongoingClass?.isLive && (
        <button
          onClick={() => navigate(`/student/live-class/${stats.ongoingClass?.lessonId}`)}
          className={cn(
            "w-full bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4",
            "flex items-center justify-between text-white",
            "shadow-lg shadow-red-500/30 active:scale-[0.99] transition-transform"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-base">Live Class Now</p>
              <p className="text-red-100 text-sm">
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
