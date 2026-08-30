import type { CoursesTopic } from "./topic-card";
import TopicCard from "./topic-card";

function AllTopics({ topics, totalLessons }: {
    topics: CoursesTopic[];
    totalLessons: number;
}) {
    return (
        <div className="px-3 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">All Topics</h2>
                <span className="text-xs font-semibold text-[#4F61E8]">
                    {topics.length} Topics · {totalLessons} Lessons
                </span>
            </div>

            {/* Topic list */}
            {topics.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">No topics published for this subject yet.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {topics.map((topic) => (
                        <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllTopics;