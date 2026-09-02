import { Play } from "lucide-react"
import { useNavigate } from "react-router-dom"
import CoursesRecentActivity from "./courses-recent-activity"
import type { StudentPublishedLesson } from "@/services/student";

interface CourseOverviewProps {
  subjectId: string;
  lessons: StudentPublishedLesson[];
  topicsCount: number;
  quizzesCount: number;
  category?: string;
  subjectType?: string;
  classroomName?: string;
}

const badgeStyles: Record<string, string> = {
  indigo: "bg-[#4F61E81A] text-[#4F61E8]",
  teal: "bg-[#00BFA51F] text-[#00BFA5]",
  amber: "bg-[#FF8F001F] text-[#FF8F00]",
};

const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <h4 className={`inline rounded-[15px] px-[10px] py-[4px] font-medium uppercase text-[10px] ${badgeStyles[color]}`}>
    {children}
  </h4>
);

const CourseOverview = ({ subjectId, lessons, topicsCount, quizzesCount, category, subjectType, classroomName }: CourseOverviewProps) => {
  const navigate = useNavigate();
  const latest = [...lessons].sort(
    (a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime()
  )[0];

  const goToLessons = () => navigate("/student/recorded-class", { state: { subjectId } });

  return (
    <div className="min-h-screen">
      {/* Latest lesson banner */}
      {latest ? (
        <button
          type="button"
          onClick={goToLessons}
          className="w-[calc(100%-1.5rem)] mx-3 bg-[#4F61E8] rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Play size={18} className="text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
              Latest lesson
            </p>
            <p className="text-white font-bold text-sm truncate">
              {latest.topicName} — {latest.subTopic}
            </p>
            <p className="text-white/60 text-xs">
              {latest.teacherName}
              {latest.durationMinutes ? ` · ${latest.durationMinutes} min` : ""}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Play size={14} className="text-white fill-white" />
          </div>
        </button>
      ) : (
        <div className="mx-3 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-slate-500">No lessons published for this subject yet.</p>
        </div>
      )}

      <div className="drop-shadow-[#0000000D] bg-white p-4 my-4 rounded-[14px] space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
            <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">{topicsCount}</h2>
            <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Topics</p>
          </div>
          <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
            <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">{lessons.length}</h2>
            <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Lessons</p>
          </div>
          <div className="bg-[#F0F2FA] py-2.5 px-2 rounded-[10px] flex items-center justify-center space-y-[3px] flex-col">
            <h2 className="text-[#4F61E8] font-extrabold text-[22px] leading-[22px]">{quizzesCount}</h2>
            <p className="capitalize text-[#94A3B8] font-medium text-[10px]">Quizzes</p>
          </div>
        </div>

        {(classroomName || category || subjectType) && (
          <div className="flex items-center gap-[3px] flex-wrap">
            {classroomName && <Badge color="indigo">{classroomName}</Badge>}
            {category && <Badge color="teal">{category}</Badge>}
            {subjectType && <Badge color="amber">{subjectType}</Badge>}
          </div>
        )}
      </div>

      <div className="mt-[20px] px-3">
        <CoursesRecentActivity lessons={lessons} />
      </div>
    </div>
  )
}

export default CourseOverview
