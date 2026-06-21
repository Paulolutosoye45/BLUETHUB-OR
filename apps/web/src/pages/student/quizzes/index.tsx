import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileQuestion,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import StudentAppBar from "../component/app-bar";
import QuizAttemptPanel from "../component/quiz-attempt-panel";
import studentService, { type StudentPublishedLesson } from "@/services/student";
import { isStudentRoleData, useAuthContext } from "@/contexts/auth-context";
import toast from "react-hot-toast";

interface LessonWithQuiz {
  lesson: StudentPublishedLesson;
  subjectName: string;
}

const StudentQuizzes = () => {
  const { user } = useAuthContext();
  const [lessons, setLessons] = useState<LessonWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const studentRoleData = user?.roleData && isStudentRoleData(user.roleData)
    ? user.roleData
    : null;

  // Gather all subjects (major + minor + fallback)
  const subjectIds = (() => {
    const ids = new Set<string>();
    (studentRoleData?.majorSubjects ?? []).forEach((s) => ids.add(s.subjectId));
    (studentRoleData?.minorSubjects ?? []).forEach((s) => ids.add(s.subjectId));
    (studentRoleData?.subjects ?? []).forEach((s) => ids.add(s.subjectId));
    return Array.from(ids);
  })();

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const allLessons: LessonWithQuiz[] = [];

        // Fetch lessons for each subject and keep only those with quizzes
        await Promise.all(
          subjectIds.map(async (subjectId) => {
            try {
              const res = await studentService.getLessonsBySubject(subjectId);
              const payload = res.data?.data as {
                lessons?: StudentPublishedLesson[];
                Lessons?: StudentPublishedLesson[];
              } | undefined;
              const list = payload?.lessons ?? payload?.Lessons ?? [];
              list.forEach((lesson) => {
                if (lesson.quizId) {
                  allLessons.push({ lesson, subjectName: lesson.subjectName });
                }
              });
            } catch {
              // silently skip failed subject loads
            }
          }),
        );

        setLessons(allLessons);
      } catch {
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };

    if (subjectIds.length > 0) {
      void loadQuizzes();
    } else {
      setLoading(false);
    }
  }, [subjectIds.join(",")]);

  const pendingCount = lessons.length; // All are pending until attempt API is wired
  const completedCount = 0; // Will come from student quiz history later

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col overflow-y-auto rounded-md border border-white/70 bg-white/55 p-3 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <StudentAppBar />

      {/* Header */}
      <section className="mt-6 rounded-[28px] border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(79,97,232,0.12),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f5f8ff_100%)] px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4F61E8]">My Quizzes</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">All Quizzes</h2>
            <p className="mt-1 text-sm text-slate-500">
              View and take quizzes attached to your lesson recordings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pending</p>
              <p className="text-lg font-semibold text-slate-900">{pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Completed</p>
              <p className="text-lg font-semibold text-slate-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz List */}
      <section className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading quizzes…</span>
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <FileQuestion className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No quizzes available</p>
            <p className="text-sm text-slate-500 max-w-sm">
              Your teachers haven&apos;t attached any quizzes to your lessons yet. Check back later.
            </p>
          </div>
        ) : (
          lessons.map(({ lesson }) => (
            <div
              key={lesson.id}
              className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-30px_rgba(79,97,232,0.5)]"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4255db]">
                  <BookOpen className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4255db]">
                      {lesson.subjectName}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      Quiz attached
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 truncate">{lesson.topicName}</h3>
                  <p className="text-sm text-slate-600 line-clamp-1">
                    {lesson.description || lesson.aim || "No description available."}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {lesson.approvedAt
                        ? new Date(lesson.approvedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {lesson.subTopic || "Sub-topic"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Teacher: {lesson.teacherName}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    onClick={() =>
                      setActiveLessonId(activeLessonId === lesson.id ? null : lesson.id)
                    }
                    className="rounded-full bg-[#4255db] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3447cc]"
                  >
                    <PlayCircle className="mr-1.5 h-4 w-4" />
                    {activeLessonId === lesson.id ? "Hide Quiz" : "Start Quiz"}
                  </Button>
                </div>
              </div>

              {/* Inline quiz panel */}
              {activeLessonId === lesson.id && (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-amber-800">Lesson Quiz</p>
                    <button
                      type="button"
                      onClick={() => setActiveLessonId(null)}
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <QuizAttemptPanel lessonId={lesson.id} onClose={() => setActiveLessonId(null)} />
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default StudentQuizzes;
