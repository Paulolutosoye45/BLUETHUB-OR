import type {
  AttendanceScanRecord,
  AttendanceType,
  LocalAttendanceSession,
} from "./constant";

// ── Local date helpers ─────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

/** Local YYYY-MM-DD key. Attendance deduplication is per local calendar day. */
export function toDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isoNow(): string {
  return new Date().toISOString();
}

// ── Scope / dedupe keys ────────────────────────────────────────────────────────
// A student must never be recorded twice for the SAME record — i.e. the same
// class on the same date, or the same subtopic on the same day. Different
// students, different types, or different days are always independent records.

export function buildScopeKey(session: {
  attendanceType: AttendanceType;
  classroomId?: string;
  subjectId?: string;
  subTopicId?: string;
}): string {
  return [
    session.attendanceType,
    session.classroomId ?? "",
    session.subjectId ?? "",
    session.subTopicId ?? "",
  ].join("|");
}

export function buildScopeKeyParts(
  scopeKey: string,
): { attendanceType: AttendanceType; classroomId: string; subjectId: string; subTopicId: string } {
  const [attendanceType, classroomId, subjectId, subTopicId] = scopeKey.split("|");
  return {
    attendanceType: Number(attendanceType) as AttendanceType,
    classroomId: classroomId ?? "",
    subjectId: subjectId ?? "",
    subTopicId: subTopicId ?? "",
  };
}

export function buildDedupeKey(
  dateKey: string,
  scopeKey: string,
  qrToken: string,
): string {
  return `${dateKey}|${scopeKey}|${qrToken}`;
}

export function buildSessionScopeKey(session: LocalAttendanceSession): string {
  return buildScopeKey(session);
}

// ── QR payload ─────────────────────────────────────────────────────────────────

export const QR_PREFIX = "BLUETHUB";
export const QR_VERSION = "1";

/** The value encoded in a student's QR. Prefers the backend-issued attendance
 *  token (authoritative for POST /scan); falls back to the student id. */
export function buildQrValue(studentId: string, qrToken?: string | null): string {
  const token = qrToken && qrToken.length > 0 ? qrToken : studentId;
  return `${QR_PREFIX}|${QR_VERSION}|${token}`;
}

/** Validates a scanned value and extracts the raw QR token to send to /scan. */
export function parseQrValue(
  raw: string,
): { ok: true; qrToken: string } | { ok: false; reason: string } {
  const value = (raw ?? "").trim();
  if (!value) return { ok: false, reason: "Empty QR payload" };
  const parts = value.split("|");
  if (parts.length >= 3 && parts[0] === QR_PREFIX) {
    const qrToken = parts.slice(2).join("|");
    if (!qrToken) return { ok: false, reason: "QR payload is missing the token" };
    return { ok: true, qrToken };
  }
  // Tolerate raw student-id-style tokens (some printers/QRs may encode just the id).
  return { ok: true, qrToken: value };
}

// ── Sync error classification ────────────────────────────────────────────────────────────────────

/** Returns true when the error transiently retryable (offline / 5xx). */
export function isTransientSyncError(err: unknown): boolean {
  if (!err) return true;
  const anyErr = err as { response?: { status?: number }; message?: string; code?: string };
  const status = anyErr?.response?.status;
  // Network failures (no response, CORS, DNS, timeout) → retry.
  if (status == null) return true;
  if (status === 0) return true;
  // 5xx → transient. 409 → already recorded (handled as "already recorded" in caller).
  return status >= 500;
}

/** A 409 from /scan means the backend already has the student for this session —
 *  treat as "already recorded" instead of a failure. */
export function isAlreadyRecordedError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 409;
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const anyErr = err as {
    response?: { data?: { responseMessage?: string; message?: string } };
    message?: string;
  };
  return (
    anyErr?.response?.data?.responseMessage ??
    anyErr?.response?.data?.message ??
    anyErr?.message ??
    fallback
  );
}

// ── Student roster helpers ─────────────────────────────────────────────────────

export type StudentRosterMap = Record<string, string>;

/** Builds an {id → "First Last"} map used to enrich scanned records with names. */
export function buildStudentNameMap(
  students: Array<{ id?: string; userId?: string; firstName?: string; lastName?: string; name?: string }>,
): StudentRosterMap {
  const map: StudentRosterMap = {};
  for (const s of students) {
    const key = s.id ?? s.userId;
    if (!key) continue;
    const name =
      s.name ??
      [s.firstName, s.lastName].filter(Boolean).join(" ") ??
      String(key);
    map[String(key)] = name;
  }
  return map;
}

// ── Misc ───────────────────────────────────────────────────────────────────────

export type AttendanceRecordView = AttendanceScanRecord;

/** Uniq count of students marked today (dedupes across the same scope/day). */
export function countUnique(records: AttendanceScanRecord[]): number {
  return new Set(records.map((r) => r.dedupeKey)).size;
}