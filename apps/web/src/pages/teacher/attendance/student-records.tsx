import { useEffect, useState } from "react";
import { AlertTriangle, Users } from "lucide-react";
import { moduleService } from "@/services/module";
import { schoolService } from "@/services/school";
import { UserRole } from "@/utils/validate";
import AttendanceStatsPanel from "@/component/attendance-stats-panel";

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

  // The class is chosen right here on this tab (not inherited from "Take attendance").
  const [classroomId, setClassroomId] = useState(initialClassroomId ?? "");

  const [students, setStudents] = useState<Option[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");

  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

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

  const studentName = students.find((s) => s.id === studentId)?.name ?? "";

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
      </div>

      {!classroomId ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
          Choose a class above to see a student's attendance records.
        </p>
      ) : !studentId ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
          Choose a student above to see their attendance for the selected period.
        </p>
      ) : (
        <AttendanceStatsPanel
          studentId={studentId}
          studentName={studentName}
          classroomId={classroomId}
          subjectOptions={subjectOptions}
          subjectsLoading={subjectsLoading}
          canClassScope={canClassScope}
          initialSubjectId={initialSubjectId}
        />
      )}
    </section>
  );
};

export default StudentRecords;
