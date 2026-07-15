import { useEffect, useState } from "react";
import {
  Loader2,
  Trophy,
  BookOpen,
  ClipboardCheck,
  Users,
  Layers,
} from "lucide-react";
import { performanceService, type StudentSubtopicScoreDto } from "@/services/performance";
import StudentAppBar from "../component/app-bar";

const SubtopicScores = () => {
  const [scores, setScores] = useState<StudentSubtopicScoreDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await performanceService.getStudentSubtopicScores();
        if (!cancelled) setScores(res.data?.data ?? []);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const ordinalSuffix = (n: number) => {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-500";
  };

  const scoreBarColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-400";
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-4 overflow-y-auto rounded-md border border-white/70 bg-white/55 p-3 backdrop-blur-xl transition-all duration-300 md:p-5 lg:p-6">
      <StudentAppBar />

      <div className="flex items-center gap-2">
        <Layers className="size-5 text-student-chestnut" />
        <h2 className="text-lg font-bold text-slate-800">Subtopic Scores</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-student-chestnut" />
        </div>
      ) : scores.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Layers className="size-12" />
          <p className="text-sm font-medium">No subtopic scores available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scores.map((item, idx) => (
            <div
              key={item.subtopicId ?? `st-${idx}`}
              className="flex flex-col gap-3 rounded-xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-student-chestnut" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {item.subTopicName}
                    </h3>
                    <p className="text-[10px] text-slate-400">{item.subjectName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-student-chestnut/10 px-2.5 py-0.5 text-[10px] font-semibold text-student-chestnut">
                  <Trophy className="size-3" />
                  {item.position}{ordinalSuffix(item.position)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Average Score</span>
                  <span className={`font-bold ${scoreColor(item.averageScore)}`}>
                    {item.averageScore.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(item.averageScore)}`}
                    style={{ width: `${Math.min(item.averageScore, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <ClipboardCheck className="size-3.5" />
                  <span>{item.quizCount} quiz{item.quizCount === 1 ? "" : "zes"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span>{item.totalStudents} student{item.totalStudents === 1 ? "" : "s"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubtopicScores;
