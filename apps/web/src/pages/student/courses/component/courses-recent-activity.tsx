import type { StudentPublishedLesson } from "@/services/student";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString();
}

const CoursesRecentActivity = ({ lessons }: { lessons: StudentPublishedLesson[] }) => {
  const recent = [...lessons]
    .filter((l) => l.approvedAt)
    .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime())
    .slice(0, 4);

  return (
    <div className="bg-white border border-[#0000000D] rounded-[14px] px-3.5 pt-3.5 pb-2">

      {/* Header */}
      <div className="border-b border-[#E2E8F0] py-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">
          Recently published
        </h2>
      </div>

      {/* List */}
      {recent.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">No lessons published yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {recent.map((lesson) => (
            <div key={lesson.id} className="flex items-start justify-between border-b border-[#E2E8F0] pb-2 last:border-0">
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-2.5 h-2.5 mt-1 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-sm text-gray-700 leading-snug truncate">
                  {lesson.topicName} — {lesson.subTopic}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-3 shrink-0">
                {timeAgo(lesson.approvedAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesRecentActivity;
