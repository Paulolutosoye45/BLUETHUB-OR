import { API, type TResponse } from ".";
import { X_Tenant_ID } from "@/utils/tenant";
import type { AttendanceType } from "@/utils/constant";

const headers = { "X-Tenant-ID": X_Tenant_ID };

// ── Backend contract (POST/PUT/GET, Bearer + X-Tenant-ID) ─────────────────────
//   POST /api/Attendance/session/start          body: StartSessionPayload
//   POST /api/Attendance/session/{id}/scan      body: { qrToken }
//   POST /api/Attendance/session/{id}/end
//   GET  /api/Attendance/session/{id}/summary
//   GET  /api/Attendance/session/{id}
//   GET  /api/Attendance/sessions
//   GET  /api/Attendance/student/{studentId}/qrcode     (PNG)
//   GET  /api/Attendance/student/{studentId}/qr-token   (JSON)
//   GET  /api/Attendance/student/me/qrcode | qr-token   (own QR)
// ───────────────────────────────────────────────────────────────────────────────

export interface StartAttendanceSessionPayload {
  /** 0 = Class, 1 = Subject, 2 = SubTopic */
  attendanceType: AttendanceType;
  classroomId?: string;
  subjectId?: string;
  subTopicId?: string;
  classPreparationId?: string;
}

export interface AttendanceSessionDto {
  id: string;
  status: string;
  startedAt: string;
  presentCount: number;
}

export interface AttendanceSummaryDto {
  sessionId: string;
  rosterCount: number;
  presentCount: number;
  absentCount: number;
  present?: Array<{ studentId: string; studentName: string }>;
  absent?: Array<{ studentId: string; studentName: string }>;
}

// ── Attendance analytics (GET /api/Attendance/analytics) ──────────────────────

export interface AttendanceAnalyticsParams {
  /** 0=Daily, 1=Weekly, 2=Monthly, 3=MonthlyRange */
  period: number;
  /** yyyy-MM-dd — daily / weekly */
  date?: string;
  /** yyyy-MM — monthly */
  month?: string;
  /** yyyy-MM — monthly range (inclusive) */
  fromMonth?: string;
  toMonth?: string;
  /** 0=Class, 1=Subject, 2=SubTopic — narrow the kind of sessions counted */
  attendanceType?: number;
  classroomId?: string;
  subjectId?: string;
}

export interface AttendanceAnalyticsTotals {
  sessions: number;
  expected: number;
  present: number;
  absent: number;
  attendanceRate: number;
}

export interface AttendanceAnalyticsItem extends AttendanceAnalyticsTotals {
  id: string;
  name: string;
}

export interface AttendanceAnalyticsBucket {
  label: string;
  fromDate?: string;
  toDate?: string;
  byClass: AttendanceAnalyticsItem[];
  bySubject: AttendanceAnalyticsItem[];
  totals: AttendanceAnalyticsTotals;
}

export interface AttendanceAnalyticsData {
  period: string;
  periodLabel: string;
  fromDate?: string;
  toDate?: string;
  buckets: AttendanceAnalyticsBucket[];
  totals: AttendanceAnalyticsTotals;
}

// ── Absent students (GET /api/Attendance/absent-students) ──────────────────────

export interface AbsentStudentDto {
  studentId: string;
  studentName: string;
  sessions: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface AbsentStudentsData {
  attendanceType: number | null;
  attendanceTypeName: string | null;
  classroomId: string | null;
  classroomName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  period: string;
  periodLabel: string;
  fromDate?: string;
  toDate?: string;
  /** Full roster size for context (absent students are a subset). */
  totalStudents: number;
  sessions: number;
  students: AbsentStudentDto[];
  totals: {
    students: number;
    sessions: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  };
}

// ── Student stats (GET /api/Attendance/student/{id}/stats) ────────────────────

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  attendanceType: number;
  attendanceTypeName: string;
  classroomId: string | null;
  classroomName: string | null;
  subjectId: string | null;
  subjectName: string | null;
  period: string;
  periodLabel: string;
  fromDate?: string;
  toDate?: string;
  sessions: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export const attendanceService = {
  /** Start an attendance session for the chosen type (class / subject / subtopic). */
  startSession: (payload: StartAttendanceSessionPayload) =>
    API.post<TResponse<AttendanceSessionDto>>("/api/Attendance/session/start", payload, { headers }),

  /** Register one scanned student against an open session. */
  scan: (sessionId: string, qrToken: string) =>
    API.post<TResponse<AttendanceSessionDto>>(
      `/api/Attendance/session/${sessionId}/scan`,
      { qrToken },
      { headers },
    ),

  /** Close an open attendance session. */
  endSession: (sessionId: string) =>
    API.post<TResponse<null>>(`/api/Attendance/session/${sessionId}/end`, null, { headers }),

  getSession: (sessionId: string) =>
    API.get<TResponse<AttendanceSessionDto>>(`/api/Attendance/session/${sessionId}`, { headers }),

  getSummary: (sessionId: string) =>
    API.get<TResponse<AttendanceSummaryDto>>(`/api/Attendance/session/${sessionId}/summary`, { headers }),

  getSessions: (params: { attendanceType?: number; pageNumber?: number; pageSize?: number } = {}) =>
    API.get<TResponse<AttendanceSessionDto[]>>("/api/Attendance/sessions", {
      params: {
        attendanceType: params.attendanceType,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 20,
      },
      headers,
    }),

  /** A student's attendance history (self or staff). */
  getStudentAttendance: (studentId: string) =>
    API.get<TResponse<unknown>>(`/api/Attendance/student/${studentId}/attendance`, { headers }),

  /** Current user's attendance QR token (the value encoded in their QR). */
  getMyQrToken: () =>
    API.get<TResponse<unknown>>("/api/Attendance/student/me/qr-token", { headers }),

  /** Current user's QR as a PNG image. */
  getMyQrCode: () =>
    API.get<Blob>("/api/Attendance/student/me/qrcode", { headers, responseType: "blob" }),

  getQrToken: (studentId: string) =>
    API.get<TResponse<unknown>>(`/api/Attendance/student/${studentId}/qr-token`, { headers }),

  getQrCode: (studentId: string) =>
    API.get<Blob>(`/api/Attendance/student/${studentId}/qrcode`, { headers, responseType: "blob" }),

  /** Aggregated attendance analytics (admin / head teacher). */
  getAnalytics: (params: AttendanceAnalyticsParams) =>
    API.get<TResponse<AttendanceAnalyticsData>>("/api/Attendance/analytics", { params, headers }),

  /** Name-level list of absent students for a specific class or subject. */
  getAbsentStudents: (params: AttendanceAnalyticsParams) =>
    API.get<TResponse<AbsentStudentsData>>("/api/Attendance/absent-students", { params, headers }),

  /** A single student's attendance stats for a scope + period. */
  getStudentStats: (studentId: string, params: AttendanceAnalyticsParams) =>
    API.get<TResponse<StudentAttendanceStats>>(`/api/Attendance/student/${studentId}/stats`, { params, headers }),
};

export default attendanceService;
