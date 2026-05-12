import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Plus,
  Users,
  UserRound,
  BookOpen,
  TrendingUp,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { teacherService, type TeacherDashboardStats } from "@/services/teacher";

const quickActions = [
  { label: "Submit lesson", description: "Send to admin for review", icon: <Plus className="text-chestnut size-4" />, path: "/teacher/submit-lesson" },
  { label: "New assessment", description: "Create & assign to class", icon: <ClipboardList className="text-chestnut size-4" />, path: "/teacher/assessment" },
  { label: "Question Bank", description: "Scan & manage questions", icon: <BookOpen className="text-chestnut size-4" />, path: "/teacher/question-bank" },
  { label: "My Lessons", description: "View submitted lessons", icon: <CalendarDays className="text-chestnut size-4" />, path: "/teacher/my-lessons" },
];

const Activity = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await teacherService.getDashboardStats();
        if (res.data.isSuccess) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        // Fallback to zeros if API fails
        setStats({
          totalStudents: 0,
          activeClasses: 0,
          newAssessments: 0,
          attendanceRate: 0,
          lessonsThisWeek: 0,
          pendingApprovals: 0,
          classesToday: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardData = [
    {
      label: "Total Students",
      count: stats?.totalStudents ?? 0,
      change: "Across all classes",
      icon: <Users className="text-chestnut" />,
    },
    {
      label: "Active Classes",
      count: stats?.activeClasses ?? 0,
      change: "Assigned to you",
      icon: <GraduationCap className="text-chestnut" />,
    },
    {
      label: "Lessons This Week",
      count: stats?.lessonsThisWeek ?? 0,
      change: "Recorded classes",
      icon: <BookOpen className="text-chestnut" />,
    },
    {
      label: "Pending Approvals",
      count: stats?.pendingApprovals ?? 0,
      change: "Awaiting review",
      icon: <ClipboardList className="text-chestnut" />,
    },
    {
      label: "Today's Classes",
      count: stats?.classesToday ?? 0,
      change: "Scheduled today",
      icon: <CalendarDays className="text-chestnut" />,
    },
  ];

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="flex gap-3 overflow-x-auto py-2 px-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[13px] border border-[#D9D9D9] px-5 py-4 min-w-55 max-w-55 shrink-0 animate-pulse"
            >
              <div className="h-9 w-9 bg-gray-200 rounded-[9px]" />
              <div className="h-8 bg-gray-200 rounded w-16 mt-3" />
              <div className="h-4 bg-gray-100 rounded w-24 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none snap-x snap-mandatory scroll-smooth py-2 px-1">
        {cardData.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[13px] border border-[#D9D9D9] px-5 py-4 min-w-55 max-w-55 snap-start shrink-0 transition hover:shadow-md"
          >
            <div className="h-9 w-9 bg-[#EEF1FB] rounded-[9px] flex items-center justify-center">
              {card.icon}
            </div>
            <h4 className="font-semibold text-[28px] leading-tight text-[#0F0F0E] pt-3">
              {card.count}
            </h4>
            <h3 className="font-normal text-xs text-[#3A3A3A80] capitalize pt-1">
              {card.label}
            </h3>
            <p className="text-chestnut font-normal text-sm pt-1">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <div
            key={action.label}
            onClick={() => navigate(action.path)}
            className="group border border-[#E8E8E3] py-3.5 px-5 rounded-[12px] bg-white flex items-center gap-3.5 cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-chestnut/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="bg-[#EEF1FB] size-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-chestnut/10 transition-all duration-300">
              {action.icon}
            </div>

            <div className="space-y-0.5 relative">
              <h3 className="text-[#0F0F0E] font-semibold text-xs group-hover:text-chestnut transition-colors duration-300">
                {action.label}
              </h3>
              <p className="text-[#A8A8A4] text-[11px] font-normal leading-tight">
                {action.description}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-chestnut/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activity;
