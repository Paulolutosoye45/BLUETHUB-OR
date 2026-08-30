import { FileQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StudentPublishedLesson } from "@/services/student";

interface CourseAssessmentsProps {
  subjectId: string;
  lessons: StudentPublishedLesson[];
}

const CourseAssessments = ({ subjectId, lessons }: CourseAssessmentsProps) => {
  const navigate = useNavigate();
  const quizLessons = lessons.filter((l) => !!l.quizId);

  // Quiz-taking itself already lives in the recorded-class lesson flow —
  // send the student there instead of duplicating that UI here.
  const goToLessons = () => navigate("/student/recorded-class", { state: { subjectId } });

  return (
    <div className="px-3 py-4 flex flex-col gap-4 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Assessments &amp; Quizzes</h2>
        <span className="text-xs font-semibold text-[#4F61E8]">{quizLessons.length} Total</span>
      </div>

      {quizLessons.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <FileQuestion className="w-8 h-8 text-gray-300" />
          <p className="text-sm font-semibold text-gray-500">No quizzes attached yet</p>
          <p className="text-xs text-gray-400">Your teacher hasn't attached a quiz to any lesson in this subject.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quizLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                📝
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {lesson.topicName} — {lesson.subTopic}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Quiz code: {lesson.quizCode ?? "—"}</p>
              </div>
              <button
                type="button"
                onClick={goToLessons}
                className="text-xs font-bold bg-[#4F61E8] text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors shrink-0"
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseAssessments;
