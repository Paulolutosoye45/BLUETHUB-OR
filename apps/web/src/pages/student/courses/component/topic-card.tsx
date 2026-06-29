import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type SubtopicType = "Video" | "Reading" | "PDF";
type TopicStatus = "Completed" | "In Progress" | "Not Started";

interface CoursesSubtopic {
  id: string;
  title: string;
  type: SubtopicType;
  done?: boolean;
}

export interface CoursesTopic {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  subtopicCount: number;
  status: TopicStatus;
  progress: number; // 0–100
  subtopics?: CoursesSubtopic[];
}



const STATUS_STYLES: Record<TopicStatus, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  "Not Started": "text-gray-400",
};

const TYPE_STYLES: Record<SubtopicType, string> = {
  Video: "bg-indigo-100 text-indigo-600",
  Reading: "bg-green-100 text-green-700",
  PDF: "bg-orange-100 text-orange-600",
};

const PROGRESS_COLOR: Record<TopicStatus, string> = {
  Completed: "bg-green-500",
  "In Progress": "bg-[#4F61E8]",
  "Not Started": "bg-gray-200",
};

function TopicCard({ topic }: { topic: CoursesTopic }) {
  const [open, setOpen] = useState(topic.status === "Completed");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${topic.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
          {topic.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{topic.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{topic.subtopicCount} subtopics</span>
            {topic.status !== "Not Started" ? (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[topic.status]}`}>
                {topic.status}
              </span>
            ) : (
              <span className="text-xs text-gray-400">· Not Started ·</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div className="text-gray-400 flex-shrink-0">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 mx-4 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR[topic.status]}`}
          style={{ width: `${topic.progress}%` }}
        />
      </div>

      {/* Subtopics */}
      {open && topic.subtopics && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-2 border-t border-gray-50 mt-2">
          {topic.subtopics.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.done ? "bg-green-400" : "bg-gray-300"}`} />
                <span className={`text-xs ${sub.done ? "line-through text-gray-400" : "text-gray-600"} truncate`}>
                  {sub.title}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_STYLES[sub.type]}`}>
                {sub.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default TopicCard