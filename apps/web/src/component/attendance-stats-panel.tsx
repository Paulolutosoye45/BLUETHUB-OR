import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Loader2,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import { attendanceService, type StudentAttendanceStats } from "@/services/attendance";
import { extractErrorMessage } from "@/utils/attendance";
import { AttendanceType as AT } from "@/utils/constant";

interface Option {
  id: string;
  name: string;
}

export interface AttendanceStatsPanelProps {
  /** The student to show stats for — the panel fetches as soon as this is set. */
  studentId: string;
  studentName?: string;
  /** Classroom scope — required even in "By subject" mode (the stats endpoint scopes by class either way). */
  classroomId: string;
  subjectOptions: Option[];
  subjectsLoading?: boolean;
  /** false forces "By subject" only — used for SubjectTeacher, who never sees class-wide records. */
  canClassScope?: boolean;
  /** Prefills the subject picker (e.g. carried over from another tab); doesn't force the scope open. */
  initialSubjectId?: string;
}

const inputCls =
  "mt-1 w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-[#12122A] font-medium focus:outline-none focus:ring-2 focus:ring-chestnut/30 focus:border-transparent disabled:opacity-50";

/** yyyy-MM for `offset` months before the current one (offset 0 = this month). */
function monthInput(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Filterable attendance-rate view for a single student (period range + class/subject
 * scope + stats card grid). Shared between the teacher "Student records" tab and the
 * parent attendance screen — both just feed it a studentId + classroomId.
 */
const AttendanceStatsPanel = ({
  studentId,
  studentName,
  classroomId,
  subjectOptions,
  subjectsLoading,
  canClassScope = true,
  initialSubjectId,
}: AttendanceStatsPanelProps) => {
  const [fromMonth, setFromMonth] = useState(() => monthInput(5));
  const [toMonth, setToMonth] = useState(() => monthInput(0));
  const [scope, setScope] = useState<"class" | "subject">(canClassScope ? "class" : "subject");
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");

  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveScope: "class" | "subject" = scope === "subject" || !canClassScope ? "subject" : "class";
  const showScopeToggle = canClassScope;
  const showSubjectPicker = effectiveScope === "subject";

  // Keep the selected subject valid when the list changes.
  useEffect(() => {
    if (subjectId && !subjectOptions.some((s) => s.id === subjectId)) {
      setSubjectId("");
    }
  }, [subjectId, subjectOptions]);

  useEffect(() => {
    const needsSubject = effectiveScope === "subject";
    if (!studentId || !classroomId || !fromMonth || !toMonth || (needsSubject && !subjectId)) {
      setStats(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStats(null);
    attendanceService
      .getStudentStats(studentId, {
        period: 3,
        month: toMonth,
        fromMonth,
        toMonth,
        attendanceType: needsSubject ? AT.SUBJECT : AT.CLASS,
        classroomId,
        subjectId: needsSubject ? subjectId : undefined,
      })
      .then((res) => {
        if (!cancelled) setStats(res.data?.data ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, "Failed to load this student's attendance."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, classroomId, fromMonth, toMonth, effectiveScope, subjectId]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            From month
          </label>
          <input
            type="month"
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            To month
          </label>
          <input
            type="month"
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {showScopeToggle ? (
          <div className="flex items-center gap-2">
            <span className="font-medium">Scope:</span>
            <button
              type="button"
              onClick={() => setScope("class")}
              className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                effectiveScope === "class"
                  ? "bg-chestnut/10 text-chestnut ring-1 ring-chestnut/30"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              By class
            </button>
            <button
              type="button"
              onClick={() => setScope("subject")}
              className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                effectiveScope === "subject"
                  ? "bg-chestnut/10 text-chestnut ring-1 ring-chestnut/30"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              By subject
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-chestnut/10 px-3 py-1 font-semibold text-chestnut ring-1 ring-chestnut/30">
            <BookOpen className="h-3.5 w-3.5" />
            Subject scope
          </div>
        )}

        {showSubjectPicker && classroomId && (
          <div className="min-w-[200px] flex-1 sm:max-w-[260px]">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#12122A] focus:outline-none focus:ring-2 focus:ring-chestnut/30"
            >
              <option value="">
                {subjectsLoading ? "Loading subjects…" : "Choose a subject…"}
              </option>
              {subjectOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!studentId || !classroomId ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
          Choose a student to see attendance for the selected period.
        </p>
      ) : showSubjectPicker && !subjectId ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
          Choose a subject above to see attendance for it.
        </p>
      ) : loading ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#4255db]" />
          <p className="text-xs text-slate-500">Loading attendance…</p>
        </div>
      ) : error ? (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">Could not load stats</p>
            <p className="mt-0.5 text-xs text-red-600/80">{error}</p>
          </div>
        </div>
      ) : stats ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#12122A]">{studentName ?? stats.studentName}</p>
            <p className="text-[11px] text-slate-500">{stats.periodLabel}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-[#12122A]">{stats.attendanceRate}%</span>
              <TrendingUp className="h-5 w-5 text-[#4255db]" />
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">Attendance rate</p>
            <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#4255db]"
                style={{ width: `${Math.max(0, Math.min(100, stats.attendanceRate))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-100 bg-white p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-lg font-bold text-[#12122A]">{stats.sessions}</p>
              <p className="text-[10px] font-medium text-slate-500">Sessions</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-500">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-lg font-bold text-emerald-600">{stats.presentCount}</p>
              <p className="text-[10px] font-medium text-slate-500">Present</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-rose-500">
                <UserX className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-lg font-bold text-rose-500">{stats.absentCount}</p>
              <p className="text-[10px] font-medium text-slate-500">Absent</p>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            {stats.attendanceTypeName} · {stats.classroomName ?? stats.subjectName ?? "—"}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default AttendanceStatsPanel;
