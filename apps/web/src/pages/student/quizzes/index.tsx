import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FileQuestion,
  Flame,
  Loader2,
  PlayCircle,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import { useNavigate } from "react-router-dom";
import StudentAppBar from "../component/app-bar";
import {
  quizService,
  type SubjectQuizItemDto,
} from "@/services/quiz";
import { isStudentRoleData, useAuthContext } from "@/contexts/auth-context";

interface SubjectInfo {
  subjectId: string;
  subjectName: string;
}

const StudentQuizMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<SubjectQuizItemDto[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  const studentRoleData = user?.roleData && isStudentRoleData(user.roleData)
    ? user.roleData
    : null;

  const subjects: SubjectInfo[] = useMemo(() => {
    const seen = new Set<string>();
    const list: SubjectInfo[] = [];
    const add = (s: { subjectId: string; subjectName: string }) => {
      if (!seen.has(s.subjectId)) {
        seen.add(s.subjectId);
        list.push({ subjectId: s.subjectId, subjectName: s.subjectName });
      }
    };
    (studentRoleData?.majorSubjects ?? []).forEach(add);
    (studentRoleData?.minorSubjects ?? []).forEach(add);
    (studentRoleData?.subjects ?? []).forEach(add);
    return list;
  }, [studentRoleData]);

  useEffect(() => {
    if (!selectedSubject) {
      setQuizzes([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingQuizzes(true);
      setQuizzes([]);
      try {
        const res = await quizService.getSubjectQuizzes(selectedSubject);
        if (cancelled) return;
        setQuizzes(res.data?.data ?? []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoadingQuizzes(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [selectedSubject]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col overflow-y-auto rounded-md border border-white/70 bg-white/55 p-3 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <StudentAppBar />

      <section className="mt-6 rounded-[28px] border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(79,97,232,0.12),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f5f8ff_100%)] px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4F61E8]">
              Quiz Menu
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">My Quizzes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a subject to view and attempt your quizzes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Quizzes
              </p>
              <p className="text-lg font-semibold text-slate-900">{quizzes.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Completed
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {quizzes.filter((q) => q.attemptStatus.completedAttempts > 0).length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Select Subject</p>
        {subjects.length === 0 ? (
          <p className="text-sm text-slate-400">No subjects available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => (
              <button
                key={sub.subjectId}
                type="button"
                onClick={() => setSelectedSubject(sub.subjectId)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  selectedSubject === sub.subjectId
                    ? "border-[#4255db] bg-[#eef2ff] text-[#4255db] shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {sub.subjectName}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 flex-1">
        {!selectedSubject ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">Select a subject above</p>
            <p className="max-w-sm text-sm text-slate-500">
              Choose a subject to see all quizzes attached to your lessons.
            </p>
          </div>
        ) : loadingQuizzes ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading quizzes…</span>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <FileQuestion className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No quizzes available</p>
            <p className="max-w-sm text-sm text-slate-500">
              No quizzes have been attached to lessons in this subject yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {quizzes.map((q) => {
              const hasCompleted = q.attemptStatus.completedAttempts > 0;
              return (
                <div
                  key={q.quizCode}
                  className="group rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(79,97,232,0.5)]"
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {hasCompleted ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        Pending
                      </span>
                    )}
                    {!q.attemptStatus.canStart && q.attemptStatus.maxAttemptsReached && (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        Max Attempts
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {q.lessonTitle || q.quizCode}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                      {q.totalQuestions} question{q.totalQuestions !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-slate-400" />
                      {q.totalMarks} mark{q.totalMarks !== 1 ? "s" : ""}
                    </span>
                    {q.config.timeLimitMinutes && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-slate-400" />
                        {q.config.timeLimitMinutes} min
                      </span>
                    )}
                  </div>

                  {q.bestScorePercent !== null && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          Best: {q.bestScorePercent.toFixed(0)}%
                        </span>
                      </div>
                      {q.attemptStatus.completedAttempts > 0 && (
                        <div className="flex items-center gap-1 ml-auto">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {q.attemptStatus.completedAttempts} attempt
                            {q.attemptStatus.completedAttempts !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {q.attemptStatus.hasInProgressAttempt ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <PlayCircle className="h-3.5 w-3.5" />
                          In progress
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {q.attemptStatus.canStart ? "Ready" : "Unavailable"}
                        </span>
                      )}
                    </span>
                    <Button
                      onClick={() => navigate(`/student/quiz/${q.quizCode}`)}
                      disabled={!q.attemptStatus.canStart && !q.attemptStatus.hasInProgressAttempt}
                      className="rounded-full bg-[#4255db] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3447cc] disabled:opacity-50"
                    >
                      <PlayCircle className="mr-1 h-3.5 w-3.5" />
                      {q.attemptStatus.hasInProgressAttempt ? "Resume" : hasCompleted ? "Retake" : "Take Quiz"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentQuizMenu;
