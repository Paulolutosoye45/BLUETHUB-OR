import { ChevronRight } from "lucide-react"

type Lesson = {
  id: string
  initials: string
  title: string
  teacher: string
  subject: string
  class: string
  status: "Pending" | "Approved" | "Rejected"
  date: string
}

const lessons: Lesson[] = [
  {
    id: "1",
    initials: "MA",
    title: "Photosynthesis and plant nutrition",
    teacher: "Mrs. Adaeze Okafor",
    subject: "Basic Science",
    class: "JSS 2A",
    status: "Pending",
    date: "12 Apr 2026",
  },
  {
    id: "2",
    initials: "MT",
    title: "Solving quadratic equations",
    teacher: "Mr. Tunde Fashola",
    subject: "Mathematics",
    class: "SSS 2B",
    status: "Pending",
    date: "11 Apr 2026",
  },
  {
    id: "3",
    initials: "MC",
    title: "Supply and demand curves",
    teacher: "Mrs. Chioma Eze",
    subject: "Economics",
    class: "SSS 2B",
    status: "Pending",
    date: "10 Apr 2026",
  },
  {
    id: "4",
    initials: "MB",
    title: "The causes of World War I",
    teacher: "Mr. Biodun Alabi",
    subject: "Social Studies",
    class: "JSS 3B",
    status: "Pending",
    date: "7 Apr 2026",
  },
]

const avatarColors: Record<string, string> = {
  MA: "bg-amber-500",
  MT: "bg-[#292382]",
  MC: "bg-[#292382]",
  MB: "bg-amber-500",
}

const statusStyles = {
  Pending: "text-amber-600",
  Approved: "text-green-600",
  Rejected: "text-red-500",
}

const statusDot = {
  Pending: "bg-amber-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
}

export function PendingLessonApprovals() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Pending lesson approvals
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Lessons awaiting your review
          </p>
        </div>
        <button className="text-xs text-[#292382] font-medium flex items-center gap-0.5 hover:underline">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            {/* Left — avatar + info */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${
                  avatarColors[lesson.initials] ?? "bg-gray-400"
                }`}
              >
                {lesson.initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {lesson.teacher} · {lesson.subject} · {lesson.class}
                </p>
              </div>
            </div>

            {/* Right — status + date */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`flex items-center gap-1 text-xs font-medium ${statusStyles[lesson.status]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusDot[lesson.status]}`}
                />
                {lesson.status}
              </span>
              <span className="text-xs text-gray-400">{lesson.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}