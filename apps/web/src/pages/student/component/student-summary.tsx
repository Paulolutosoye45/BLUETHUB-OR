import { useEffect, useState } from "react";
import { performanceService, type StudentSummaryDto } from "@/services/performance";
import { useNavigate } from "react-router-dom";
import { FileQuestion, HelpCircle, BookOpen } from "lucide-react";

const StudentSummary = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await performanceService.getStudentSummary();
        if (!cancelled) setData(res.data?.data ?? null);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetch();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-100 bg-white p-4 text-center text-xs text-slate-400">
        Loading summary…
      </div>
    );
  }

  if (!data) return null;

  const { counts, unattemptedQuizzes } = data;
  const firstQuizSubject = unattemptedQuizzes.length > 0 ? unattemptedQuizzes[0].subjectName : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => navigate("/student/assessment")}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:bg-rose-50 transition-all"
      >
        <FileQuestion className="h-6 w-6 text-rose-500" />
        <span className="text-xl font-bold text-slate-800">{counts.unattemptedAssessments}</span>
        <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight">Pending<br />Assessments</span>
      </button>
      <button
        type="button"
        onClick={() => navigate(firstQuizSubject ? `/student/Quizzes?subject=${encodeURIComponent(firstQuizSubject)}` : "/student/Quizzes")}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:bg-amber-50 transition-all"
      >
        <HelpCircle className="h-6 w-6 text-amber-500" />
        <span className="text-xl font-bold text-slate-800">{counts.unattemptedQuizzes}</span>
        <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight">Pending<br />Quizzes</span>
      </button>
      <button
        type="button"
        onClick={() => navigate("/student/recorded-class")}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:bg-blue-50 transition-all"
      >
        <BookOpen className="h-6 w-6 text-blue-500" />
        <span className="text-xl font-bold text-slate-800">{counts.unwatchedLessons}</span>
        <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight">Unwatched<br />Lessons</span>
      </button>
    </div>
  );
};

export default StudentSummary;
