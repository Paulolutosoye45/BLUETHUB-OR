import { attendanceService, type StartAttendanceSessionPayload } from "@/services/attendance";
import {
  getPendingAttendanceScans,
  getAttendanceScansBySession,
  getAllAttendanceSessions,
  updateAttendanceScan,
  updateAttendanceSession,
} from "@/utils/db";
import type { AttendanceScanRecord, LocalAttendanceSession } from "@/utils/constant";
import {
  isoNow,
  isAlreadyRecordedError,
  isTransientSyncError,
  extractErrorMessage,
} from "./attendance";

// ── Offline-first push queue ───────────────────────────────────────────────────
// Every scan is persisted to IndexedDB immediately (never lost on poor network).
// This engine replays the queue whenever the app is online: it lazily opens a
// backend session (POST /session/start) per local session, pushes each pending
// scan (POST /session/{id}/scan), and finally closes sessions the teacher ended
// (POST /session/{id}/end).

let syncRunning = false;

export function isSyncRunning(): boolean {
  return syncRunning;
}

export interface AttendanceSyncResult {
  startedSessions: number;
  synced: number;
  alreadyRecorded: number;
  failed: number;
  pending: number;
  offline: boolean;
  /** Sessions whose backend counterpart could not be opened (e.g. API error). */
  startFailures: number;
  /** Human-readable reason for the first start failure, if any. */
  lastStartError?: string;
}

function isRetryable(record: AttendanceScanRecord): boolean {
  return (
    record.syncStatus === "pending" ||
    (record.syncStatus === "failed" && !record.permanentlyFailed)
  );
}

async function pendingScansFor(session: LocalAttendanceSession): Promise<AttendanceScanRecord[]> {
  const scans = await getAttendanceScansBySession(session.id);
  return scans
    .filter(isRetryable)
    .sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
}

function buildStartPayload(session: LocalAttendanceSession): StartAttendanceSessionPayload {
  return {
    attendanceType: session.attendanceType,
    classroomId: session.classroomId || undefined,
    subjectId: session.subjectId || undefined,
    subTopicId: session.subTopicId || undefined,
  };
}

/** Lazily open the backend session for a local session. Returns backend id or
 *  throws with a human-readable reason so the caller can surface it. */
async function ensureBackendSession(session: LocalAttendanceSession): Promise<string> {
  if (session.backendSessionId) return session.backendSessionId;
  const { data } = await attendanceService.startSession(buildStartPayload(session));
  const d = (data as any)?.data ?? data ?? {};
  const backendId = String(d.id ?? d.sessionId ?? d.attendanceSessionId ?? "");
  if (!backendId) throw new Error("Server started a session but returned no session id.");
  await updateAttendanceSession(session.id, { backendSessionId: backendId });
  return backendId;
}

type PushOutcome = "synced" | "already-recorded";

async function pushScan(backendId: string, scan: AttendanceScanRecord): Promise<PushOutcome> {
  try {
    await attendanceService.scan(backendId, scan.qrToken);
    await updateAttendanceScan(scan.id, {
      syncStatus: "sent",
      backendSessionId: backendId,
      lastError: undefined,
      lastAttemptAt: isoNow(),
    });
    return "synced";
  } catch (err) {
    if (isAlreadyRecordedError(err)) {
      // Backend already holds the record — treat as recorded, never retry as failure.
      await updateAttendanceScan(scan.id, {
        syncStatus: "sent",
        attempts: scan.attempts + 1,
        lastError: undefined,
        lastAttemptAt: isoNow(),
      });
      return "already-recorded";
    }
    await updateAttendanceScan(scan.id, {
      syncStatus: isTransientSyncError(err) ? "pending" : "failed",
      permanentlyFailed: !isTransientSyncError(err),
      attempts: scan.attempts + 1,
      lastError: extractErrorMessage(err, "Sync failed"),
      lastAttemptAt: isoNow(),
    });
    throw err;
  }
}

/** Flush every pending attendance record to the backend. Safe to call often. */
export async function flushAttendanceSync(): Promise<AttendanceSyncResult> {
  const base: AttendanceSyncResult = {
    startedSessions: 0,
    synced: 0,
    alreadyRecorded: 0,
    failed: 0,
    pending: 0,
    offline: false,
    startFailures: 0,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    base.offline = true;
    return base;
  }
  if (syncRunning) return base;

  syncRunning = true;
  try {
    const sessions = (await getAllAttendanceSessions()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const session of sessions) {
      const pendingScans = await pendingScansFor(session);
      if (pendingScans.length === 0) continue;

      let backendId: string;
      try {
        backendId = await ensureBackendSession(session);
      } catch (err) {
        // Can't open the backend session (offline, auth, or API error). Keep the
        // scans retryable but record the reason so the UI can show why sync is
        // blocked instead of silently retrying forever.
        base.startFailures += 1;
        const reason = extractErrorMessage(err, "Could not open the attendance session on the server.");
        if (!base.lastStartError) base.lastStartError = reason;
        for (const scan of pendingScans) {
          await updateAttendanceScan(scan.id, {
            lastError: reason,
            lastAttemptAt: isoNow(),
          });
        }
        base.pending += pendingScans.length;
        continue;
      }

      base.startedSessions += 1;

      for (const scan of pendingScans) {
        try {
          await updateAttendanceScan(scan.id, { syncStatus: "uploading", lastAttemptAt: isoNow() });
          const outcome = await pushScan(backendId, scan);
          if (outcome === "synced") base.synced += 1;
          else base.alreadyRecorded += 1;
        } catch {
          base.failed += 1;
        }
      }

      // Close sessions the teacher ended once nothing is left to push.
      if (session.status === "ended" && !session.endSyncRequested && backendId) {
        const remaining = await pendingScansFor(session);
        if (remaining.length === 0) {
          try {
            await attendanceService.endSession(backendId);
            await updateAttendanceSession(session.id, {
              endSyncRequested: true,
              endedAt: session.endedAt ?? isoNow(),
            });
          } catch {
            // end is retried on the next flush.
          }
        }
      }
    }

    base.pending = (await getPendingAttendanceScans()).length;
    return base;
  } finally {
    syncRunning = false;
  }
}

/** Count of scans not yet confirmed on the backend (used by the UI header). */
export async function getUnsentAttendanceCount(): Promise<number> {
  return (await getPendingAttendanceScans()).length;
}