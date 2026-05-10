import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

interface ActiveLesson {
  lesson: {
    id: string;
    topic: string;
    subTopic?: string;
    aim?: string;
    subject?: {
      name: string;
    };
    classroom?: {
      name: string;
    };
  };
  startedAt: string;
}

const Topic = () => {
  const [lessonData, setLessonData] = useState<ActiveLesson | null>(null);

  useEffect(() => {
    // Try to get lesson data from sessionStorage
    const storedLesson = sessionStorage.getItem("activeLesson");
    if (storedLesson) {
      try {
        const parsed = JSON.parse(storedLesson) as ActiveLesson;
        setLessonData(parsed);
      } catch (e) {
        console.error("Failed to parse activeLesson:", e);
      }
    }
  }, []);

  const subjectName = lessonData?.lesson?.subject?.name || "Subject";
  const className = lessonData?.lesson?.classroom?.name || "Class";
  const topic = lessonData?.lesson?.topic || "New Lesson";

  return (
    <div className="flex items-center gap-4">
      {/* Subject & Class Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700">{subjectName}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">{className}</span>
        </div>
      </div>

      {/* Topic */}
      <div className="flex items-center gap-2">
        <div className="w-px h-6 bg-gray-200" />
        <h2 className="font-poppins font-semibold text-base text-gray-800 max-w-xs truncate">
          {topic}
        </h2>
      </div>
    </div>
  );
};

export default Topic;
