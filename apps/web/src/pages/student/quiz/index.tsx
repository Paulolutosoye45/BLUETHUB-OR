import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import QuizAttemptPanel from "../component/quiz-attempt-panel";

const StudentQuizPage = () => {
  const { quizCode } = useParams<{ quizCode: string }>();
  const navigate = useNavigate();

  if (!quizCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">No quiz code provided</p>
          <button onClick={() => navigate("/student/recorded-class")} className="mt-2 text-sm text-[#4255db] underline">
            Back to Recorded Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">Lesson Quiz — {quizCode}</h1>
          </div>
          <QuizAttemptPanel quizCode={quizCode} onClose={() => navigate("/student/recorded-class")} />
        </div>
      </div>
    </div>
  );
};

export default StudentQuizPage;
