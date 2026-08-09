import { useEffect, useState } from "react";
import { Loader2, UserCheck, UserX, X, CalendarDays, TrendingUp } from "lucide-react";
import { attendanceService, type StudentAttendanceStats } from "@/services/attendance";
import type { AttendanceAnalyticsParams } from "@/services/attendance";
import { extractErrorMessage } from "@/utils/attendance";

interface Props {
  open: boolean;
  studentId: string;
  studentName: string;
  /** 0 = Class scope, 1 = Subject scope — required by the backend. */
  attendanceType: number;
  classroomId?: string;
  subjectId?: string;
  /** Period fields shared with the analytics report. */
  periodParams: Omit<AttendanceAnalyticsParams, "attendanceType" | "classroomId" | "subjectId">;
  onClose: () => void;
}

const StudentStatsModal = ({
  open,
  studentId,
  studentName,
  attendanceType,
  classroomId,
  subjectId,
  periodParams,
  onClose,
}: Props) => {
  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !studentId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStats(null);
    attendanceService
      .getStudentStats(studentId, {
        ...periodParams,
        attendanceType,
        classroomId: attendanceType === 0 ? classroomId : undefined,
        subjectId: attendanceType === 1 ? subjectId : undefined,
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
  }, [open, studentId, attendanceType, classroomId, subjectId, periodParams]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{studentName || "Student"}</p>
            <p className="text-[11px] text-slate-500">Attendance stats · {stats?.periodLabel ?? "loading…"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#4255db]" />
              <p className="text-xs text-slate-500">Loading stats…</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-red-600">Could not load stats</p>
              <p className="mt-1 text-xs text-slate-500">{error}</p>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-800">{stats.attendanceRate}%</span>
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
                  <p className="mt-1 text-lg font-bold text-slate-800">{stats.sessions}</p>
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
          ) : (
            <div className="py-10 text-center text-sm text-slate-400">No data.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentStatsModal;
