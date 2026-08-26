import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { AlertTriangle, CalendarDays, CheckCircle2, GraduationCap, Loader2, XCircle } from "lucide-react";
import { useParentChildren } from "@/contexts/parent-children-context";
import { attendanceService, type AttendanceHistoryItem } from "@/services/attendance";
import { schoolService } from "@/services/school";
import AttendanceStatsPanel from "@/component/attendance-stats-panel";

interface Option {
  id: string;
  name: string;
}

const ParentAttendance = () => {
  const {
    children: childList,
    loading: childrenLoading,
    error: childrenError,
    selectedChildId,
    setSelectedChildId,
    selectedChild,
  } = useParentChildren();

  const [subjectOptions, setSubjectOptions] = useState<Option[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  useEffect(() => {
    if (!selectedChild?.classroomId) {
      setSubjectOptions([]);
      return;
    }
    let cancelled = false;
    setSubjectsLoading(true);
    schoolService
      .getSubjectsByClassroomId(selectedChild.classroomId)
      .then((res) => {
        if (cancelled) return;
        const data = (res.data as any)?.data;
        const major: any[] = data?.majorSubjects ?? [];
        const minor: any[] = data?.minorSubjects ?? [];
        setSubjectOptions(
          [...major, ...minor].map((s: any) => ({
            id: String(s.id ?? s.subjectId ?? ""),
            name: String(s.subject ?? s.subjectName ?? s.name ?? ""),
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setSubjectOptions([]);
      })
      .finally(() => {
        if (!cancelled) setSubjectsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChild?.classroomId]);

  // ── Raw history ────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedChildId) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    attendanceService
      .getStudentAttendance(selectedChildId)
      .then((res) => {
        if (!cancelled) setHistory(res.data?.data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err instanceof AxiosError
            ? err.response?.data?.responseMessage ?? err.response?.data?.message ?? err.message
            : (err as Error).message;
        setHistoryError(msg || "Failed to load attendance history.");
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedChildId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6">
        <h1 className="text-lg sm:text-2xl font-bold text-[#12122A]">Attendance</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          View attendance rate and history for a chosen period.
        </p>

        {childList.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {childList.map((c) => {
              const active = c.studentId === selectedChildId;
              return (
                <button
                  key={c.studentId}
                  type="button"
                  onClick={() => setSelectedChildId(c.studentId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    active
                      ? "bg-chestnut text-white border-chestnut"
                      : "bg-white text-slate-600 border-slate-200 hover:border-chestnut/40"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {c.firstName} {c.lastName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {childrenLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading your children...</span>
        </div>
      ) : childrenError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium">{childrenError}</p>
        </div>
      ) : !selectedChild ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-10 text-center">
          <p className="text-sm text-slate-500">No children linked to your account yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-4 sm:p-6">
            <AttendanceStatsPanel
              studentId={selectedChild.studentId}
              studentName={`${selectedChild.firstName} ${selectedChild.lastName}`}
              classroomId={selectedChild.classroomId}
              subjectOptions={subjectOptions}
              subjectsLoading={subjectsLoading}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-[#12122A]">Full history</h2>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading history...</span>
              </div>
            ) : historyError ? (
              <div className="p-5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{historyError}</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No attendance recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto">
                {history.map((item) => (
                  <div key={item.sessionId} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#12122A] truncate">
                        {item.subjectName || item.subTopicName || item.classroomName || item.attendanceTypeName}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.attendanceTypeName}
                        {item.classroomName ? ` · ${item.classroomName}` : ""}
                        {item.startedAt ? ` · ${new Date(item.startedAt).toLocaleString()}` : ""}
                      </p>
                    </div>
                    {item.isPresent ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Present
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Absent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentAttendance;
