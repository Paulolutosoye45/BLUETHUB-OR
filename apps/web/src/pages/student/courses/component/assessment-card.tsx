import { Clock, FileText, Lock } from "lucide-react";

type QuizStatus = "pass" | "fail" | "available" | "locked" | "prerequisite";

export interface Assessment {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  duration: number;
  questions: number;
  topic?: string;
  topicIcon?: string;
  status: QuizStatus;
  score?: number;
  prerequisite?: string;
}

export const AVAILABLE: Assessment[] = [
  {
    id: "a1",
    title: "Topic 1 — End of Topic Quiz",
    icon: "🌍",
    iconBg: "bg-blue-100",
    duration: 15,
    questions: 20,
    topic: "Living Things",
    topicIcon: "🌿",
    status: "pass",
    score: 85,
  },
  {
    id: "a2",
    title: "Topic 2 — Mid-Topic Check",
    icon: "🌍",
    iconBg: "bg-blue-100",
    duration: 10,
    questions: 15,
    topic: "Solar System",
    topicIcon: "🌍",
    status: "available",
  },
  {
    id: "a3",
    title: "Topic 1 — Mid-Topic Check",
    icon: "✏️",
    iconBg: "bg-red-50",
    duration: 10,
    questions: 15,
    topic: "Solar System",
    topicIcon: "🌍",
    status: "fail",
    score: 48,
  },
];

export const LOCKED: Assessment[] = [
  {
    id: "b1",
    title: "Topic 2 — End of Topic Quiz",
    icon: "🔒",
    iconBg: "bg-gray-100",
    duration: 15,
    questions: 20,
    status: "prerequisite",
    prerequisite: "Complete Topic 2 first",
  },
  {
    id: "b2",
    title: "Topic 3 — Matter Quiz",
    icon: "🔒",
    iconBg: "bg-gray-100",
    duration: 15,
    questions: 20,
    status: "locked",
  },
  {
    id: "b3",
    title: "Mid-Term Examination",
    icon: "🔒",
    iconBg: "bg-gray-100",
    duration: 45,
    questions: 50,
    topic: "All topics",
    status: "locked",
  },
  {
    id: "b4",
    title: "End of Term Exam",
    icon: "🔒",
    iconBg: "bg-gray-100",
    duration: 60,
    questions: 60,
    topic: "All topics",
    status: "locked",
  },
];

const ScoreBadge = ({ score, status }: { score: number; status: "pass" | "fail" }) => (
  <span
    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      status === "pass"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-500"
    }`}
  >
    {score}% · {status === "pass" ? "Pass ✓" : "Fail"}
  </span>
);

const StatusPill = ({ label, color }: { label: string; color: string }) => (
  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
    {label}
  </span>
);

function AssessmentCard({ item, locked = false }: { item: Assessment; locked?: boolean }) {
  return (
    <div className={`bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 ${locked ? "opacity-80" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
          {locked ? <Lock size={18} className="text-gray-400" /> : item.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${locked ? "text-gray-400" : "text-gray-800"}`}>
            {item.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center  flex-wrap gap-x-3 gap-y-1 mb-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} /> {item.duration} mins
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <FileText size={11} /> {item.questions} questions
            </span>
            {item.topic && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                {item.topicIcon && <span>{item.topicIcon}</span>}
                {item.topic}
              </span>
            )}
          </div>

          {/* Status pill */}
          {item.status === "pass" && item.score !== undefined && (
            <ScoreBadge score={item.score} status="pass" />
          )}
          {item.status === "fail" && item.score !== undefined && (
            <ScoreBadge score={item.score} status="fail" />
          )}
          {item.status === "available" && (
            <StatusPill label="Available Now" color="bg-indigo-100 text-indigo-600" />
          )}
          {item.status === "prerequisite" && item.prerequisite && (
            <StatusPill label={item.prerequisite} color="bg-gray-100 text-gray-500" />
          )}
          {item.status === "locked" && (
            <StatusPill label="Locked" color="bg-gray-100 text-gray-400" />
          )}
        </div>

        {/* Action button */}
        <div className="flex-shrink-0 self-center">
          {item.status === "pass" && (
            <button className="text-xs font-semibold text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              Review
            </button>
          )}
          {item.status === "available" && (
            <button className="text-xs font-bold bg-[#4F61E8] text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors">
              Start Quiz
            </button>
          )}
          {item.status === "fail" && (
            <button className="text-xs font-semibold text-red-400 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssessmentCard