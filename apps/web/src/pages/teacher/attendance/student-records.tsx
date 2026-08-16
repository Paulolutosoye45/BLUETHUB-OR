import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Loader2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { attendanceService, type StudentAttendanceStats } from "@/services/attendance";
import { moduleService } from "@/services/module";
import { schoolService } from "@/services/school";
import { extractErrorMessage } from "@/utils/attendance";
import { AttendanceType as AT } from "@/utils/constant";
import { UserRole } from "@/utils/validate";

interface ClassroomOption {
  id: string;
  name: string;
  subjects: Option[];
}

interface Props {
  /** Role-scoped (teacher) or full (admin) list of classes to pick from. */
  classrooms: ClassroomOption[];
  classroomsLoading?: boolean;
  roleId?: number;
  /** Class selected on the "Take attendance" tab (prefill). */
  initialClassroomId?: string;
  /** Subject already chosen on the "Take attendance" tab (may be empty). */
  initialSubjectId?: string;
}

interface Option {
  id: string;
  name: string;
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

const StudentRecords = ({
  classrooms,
  classroomsLoading,
  roleId,
  initialClassroomId,
  initialSubjectId,
}: Props) => {
  // Scope rules by role:
  //  - SubjectTeacher → only "By subject" (they never see class-wide records).
  //  - ClassTeacher / HeadTeacher / Admin → "By class" AND "By subject"
  //    (a class teacher cannot TAKE subject attendance, but can VIEW subject records).
  const isSubjectTeacher = roleId === UserRole.SubjectTeacher;
  const canClassScope = !isSubjectTeacher;
  const canSubjectScope = true;

  // The class is chosen right here on this tab (not inherited from "Take attendance").
  const [classroomId, setClassroomId] = useState(initialClassroomId ?? "");

  const [students, setStudents] = useState<Option[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [fromMonth, setFromMonth] = useState(() => monthInput(5));
  const [toMonth, setToMonth] = useState(() => monthInput(0));

  const [scope, setScope] = useState<"class" | "subject">(isSubjectTeacher ? "subject" : "class");
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? "");

  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveScope: "class" | "subject" =
    scope === "subject" && canSubjectScope ? "subject" : "class";

  // Subject list for the "By subject" scope. Prefer the class's role-assigned
  // subjects; fall back to the API (admins, or role data that has not hydrated yet).
  useEffect(() => {
    const fromClass = classrooms.find((c) => c.id === classroomId)?.subjects ?? [];
    setSubjectOptions(fromClass);
    if (fromClass.length > 0 || !classroomId) return;
    let cancelled = false;
    setSubjectsLoading(true);
    schoolService
      .getSubjectsByClassroomId(classroomId)
      .then((res) => {
        if (cancelled) return;
        const payload = (res as any).data?.data ?? (res as any).data ?? [];
        const mapped = (Array.isArray(payload) ? payload : [])
          .map((s: any) => ({
            id: String(s.id ?? s.subjectId ?? ""),
            name: String(s.name ?? s.subjectName ?? ""),
          }))
          .filter((o: Option) => o.id);
        setSubjectOptions(mapped);
      })
      .catch(() => {
        /* leave subjects empty — student picker still works */
      })
      .finally(() => {
        if (!cancelled) setSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classroomId, classrooms]);

  // Keep the selected subject valid when the list changes.
  useEffect(() => {
    if (subjectId && !subjectOptions.some((s) => s.id === subjectId)) {
      setSubjectId("");
    }
  }, [subjectId, subjectOptions]);

  // Roster for the student picker.
  useEffect(() => {
    if (!classroomId) {
      setStudents([]);
      setStudentId("");
      return;
    }
    let cancelled = false;
    setStudentsLoading(true);
    setStudentsError(null);
    moduleService
      .getStudentsByClassroom(classroomId)
      .then((res) => {
        if (cancelled) return;
        const payload = (res.data as any)?.data ?? res.data ?? [];
        const rows = Array.isArray(payload) ? payload : [];
        setStudents(
          rows
            .map((s: any) => ({
              id: String(s.id ?? ""),
              name: [s.firstName, s.lastName].filter(Boolean).join(" ").trim() || String(s.userName ?? ""),
            }))
            .filter((o: Option) => o.id),
        );
      })
      .catch(() => {
        if (!cancelled) setStudentsError("Could not load this class's students.");
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [classroomId]);

  // Reset the student picker when the class changes.
  useEffect(() => {
    setStudentId("");
  }, [classroomId]);

  // Stats for the selected student + period + scope.
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

  const studentName = students.find((s) => s.id === studentId)?.name ?? "";
  const showScopeToggle = canClassScope && canSubjectScope;
  const showSubjectPicker = effectiveScope === "subject";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-[#4255db]" />
        <div>
          <h3 className="text-sm font-semibold text-[#12122A]">Student attendance records</h3>
          <p className="text-[11px] text-slate-500">
            View a student's attendance for a chosen period.
          </p>
        </div>
      </div>

      <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Class
            </label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className={inputCls}
            >
              <option value="">
                {classroomsLoading ? "Loading classes…" : "Choose a class…"}
              </option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Student
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={inputCls}
                disabled={!classroomId}
              >
                <option value="">
                  {!classroomId
                    ? "Choose a class first…"
                    : studentsLoading
                      ? "Loading students…"
                      : "Choose a student…"}
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {studentsError && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                  <AlertTriangle className="h-3 w-3" /> {studentsError}
                </p>
              )}
            </div>

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

          {!classroomId ? (
            <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
              Choose a class above to see a student's attendance records.
            </p>
          ) : !studentId ? (
            <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
              Choose a student above to see their attendance for the selected period.
            </p>
          ) : showSubjectPicker && !subjectId ? (
            <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
              Choose a subject above to see this student's attendance for it.
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
                <p className="text-sm font-semibold text-[#12122A]">{studentName}</p>
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
      </>
    </section>
  );
};

export default StudentRecords;