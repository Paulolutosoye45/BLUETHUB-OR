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
};

export default attendanceService;
