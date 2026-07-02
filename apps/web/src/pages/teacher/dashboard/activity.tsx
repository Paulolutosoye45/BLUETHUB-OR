import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Plus,
  Users,
  BookOpen,
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
        if (res.data.status === "successful") {
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
            className="bg-white rounded-[11px] border border-[#D9D9D9] px-4 py-3 min-w-48 max-w-48 shrink-0 animate-pulse"
          >
            <div className="h-8 w-8 bg-gray-200 rounded-[8px]" />
            <div className="h-7 bg-gray-200 rounded w-14 mt-2" />
            <div className="h-3 bg-gray-100 rounded w-20 mt-1.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-none snap-x snap-mandatory scroll-smooth py-1 px-0">
        {cardData.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[11px] border border-[#D9D9D9] px-4 py-3 md:min-w-[190px] md:max-w-[190px] snap-start shrink-0 transition hover:shadow-md"
          >
            <div className="h-8 w-8 bg-[#EEF1FB] rounded-[8px] flex items-center justify-center">
              {card.icon}
            </div>
            <h4 className="font-semibold text-2xl leading-tight text-[#0F0F0E] pt-2">
              {card.count}
            </h4>
            <h3 className="font-normal text-[11px] text-[#3A3A3A80] capitalize pt-0.5">
              {card.label}
            </h3>
            <p className="text-chestnut font-normal text-xs pt-0.5">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <div
            key={action.label}
            onClick={() => navigate(action.path)}
            className="group border border-[#E8E8E3] p-1.5 md:py-2.5 md:px-3 rounded-[10px] bg-white flex items-center gap-2 cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-chestnut/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="bg-[#EEF1FB] size-7 md:size-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-chestnut/10 transition-all duration-300">
              {action.icon}
            </div>

            <div className="space-y-0 relative">
              <h3 className="text-[#0F0F0E] font-medium text-[11px] group-hover:text-chestnut transition-colors duration-300">
                {action.label}
              </h3>
              <p className="text-[#A8A8A4] text-[10px] font-normal leading-tight">
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
