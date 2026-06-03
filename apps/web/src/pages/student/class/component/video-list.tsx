import VideoLessonCard from "./video-card";
import type { StudentPublishedLesson } from "@/services/student";

interface VideoLessonListProps {
    lessons: StudentPublishedLesson[];
    loading: boolean;
}

const VideoLessonList = ({ lessons, loading }: VideoLessonListProps) => {
    if (loading) {
        return (
            <div className="space-y-3 px-1 py-3">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-[22px] border border-slate-100 bg-slate-100/70" />
                ))}
            </div>
        );
    }

    if (lessons.length === 0) {
        return (
            <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
                <p className="text-base font-semibold text-slate-700">No recorded lessons found</p>
                <p className="mt-1 text-sm text-slate-500">Try a different topic or subject to see available recordings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-7">
            {lessons.map((lesson) => (
                <VideoLessonCard key={lesson.id} lesson={lesson} />
            ))}
        </div>
    );
};

export default VideoLessonList;
