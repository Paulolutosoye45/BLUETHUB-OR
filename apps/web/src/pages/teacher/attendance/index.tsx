import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  CloudOff,
  Menu,
  RefreshCw,
  ScanLine,
  Square,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useAuthContext, isTeacherRoleData } from "@/contexts/auth-context";
import { UserRole } from "@/utils/validate";
import { attendanceService } from "@/services/attendance";
import { moduleService } from "@/services/module";
import { schoolService } from "@/services/school";
import {
  findOpenAttendanceSession,
  getAllAttendanceScans,
  getAttendanceScanByDedupe,
  getAttendanceScansBySession,
  putAttendanceScan,
  putAttendanceSession,
  updateAttendanceSession,
} from "@/utils/db";
import type {
  AttendanceScanRecord,
  AttendanceType,
  LocalAttendanceSession,
} from "@/utils/constant";
import { AttendanceType as AT } from "@/utils/constant";
import {
  buildDedupeKey,
  buildScopeKey,
  isoNow,
  parseQrValue,
  toDateKey,
} from "@/utils/attendance";
import { flushAttendanceSync, getUnsentAttendanceCount } from "@/utils/attendance-sync";
import QrScannerModal from "./qr-scanner-modal";

// ── Types & constants ────────────────────────────────────────────────────────

interface Option {
  id: string;
  name: string;
}

interface ClassroomOption extends Option {
  subjects: Option[];
}

const MODE_OPTIONS: Array<{
  value: AttendanceType;
  label: string;
  description: string;
}> = [
  { value: AT.CLASS, label: "By Class", description: "Student present at school today" },
  { value: AT.SUBJECT, label: "By Subject", description: "Student attended the subject class" },
  {
    value: AT.SUBTOPIC,
    label: "By Subtopic / Lesson",
    description: "Student attended the specific lesson",
  },
];

const MODE_LABEL: Record<AttendanceType, string> = {
  [AT.CLASS]: "Class",
  [AT.SUBJECT]: "Subject",
  [AT.SUBTOPIC]: "Subtopic / Lesson",
};

const SYNC_BADGE: Record<
  AttendanceScanRecord["syncStatus"],
  { label: string; className: string }
> = {
  pending: { label: "Queued", className: "bg-amber-50 text-amber-700" },
  uploading: { label: "Syncing…", className: "bg-blue-50 text-blue-700" },
  sent: { label: "Synced", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700" },
};

function mapOptions(items: any[]): Option[] {
  return (items ?? [])
    .map((it: any) => ({
      id: String(it.id ?? it.subTopicId ?? it.topicId ?? it.subjectId ?? ""),
      name: String(it.name ?? it.subTopicName ?? it.topicName ?? it.subjectName ?? ""),
    }))
    .filter((o) => o.id);
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TeacherAttendance = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const { user } = useAuthContext();

  // ── Sources (teacher classrooms / subjects) ─────────────────────────────
  const roleClasses = useMemo<ClassroomOption[]>(() => {
    const rd = user?.roleData;
    if (!rd || !isTeacherRoleData(rd)) return [];
    return rd.classrooms.map((c) => ({
      id: String(c.classroomId),
      name: c.className ?? "Class",
      subjects: (c.subjects ?? []).map((s) => ({
        id: String(s.subjectId),
        name: s.subjectName ?? "",
      })),
    }));
  }, [user]);

  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [topics, setTopics] = useState<Option[]>([]);
  const [curriculumTopics, setCurriculumTopics] = useState<
    Record<string, { id: string; name: string; subTopics: Option[] }>
  >({});

  const [mode, setMode] = useState<AttendanceType>(AT.CLASS);
  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subTopicId, setSubTopicId] = useState("");

  // ── Session / records ────────────────────────────────────────────────────
  const activeSessionRef = useRef<LocalAttendanceSession | null>(null);
  const [activeSession, setActiveSession] = useState<LocalAttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceScanRecord[]>([]);
  const [todayScans, setTodayScans] = useState<AttendanceScanRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // ── Connectivity / sync ──────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [syncing, setSyncing] = useState(false);
  const syncLockRef = useRef(false);
  const rosterMapRef = useRef<Record<string, string>>({});

  const [scannerOpen, setScannerOpen] = useState(false);

  // ── Access scope ─────────────────────────────────────────────────────────
  // Teachers may only take attendance for classes assigned to them (from their
  // role data). Only administrators / super administrators see every class.
  const isAdmin =
    user?.roleId === UserRole.Administrator ||
    user?.roleId === UserRole.SuperAdministrator;
  const hasAssignedClasses = roleClasses.length > 0;

  // Role-based scope: ClassTeacher → class only, SubjectTeacher → subject only,
  // HeadTeacher → class + subject, admins → everything (incl. subtopic).
  const allowedModes = useMemo<AttendanceType[]>(() => {
    if (isAdmin) return [AT.CLASS, AT.SUBJECT, AT.SUBTOPIC];
    switch (user?.roleId) {
      case UserRole.ClassTeacher:
        return [AT.CLASS];
      case UserRole.SubjectTeacher:
        return [AT.SUBJECT];
      case UserRole.HeadTeacher:
        return [AT.CLASS, AT.SUBJECT];
      default:
        return [AT.CLASS, AT.SUBJECT];
    }
  }, [isAdmin, user?.roleId]);

  const teacherId = user?.id;
  const teacherName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.userName
    : "";

  // Keep the selected mode within the teacher's allowed scope.
  useEffect(() => {
    if (!allowedModes.includes(mode)) {
      setMode(allowedModes[0] ?? AT.CLASS);
      setSubjectId("");
      setTopicId("");
      setSubTopicId("");
    }
  }, [allowedModes, mode]);

  // ── Derived labels ───────────────────────────────────────────────────────
  const classroomName = classrooms.find((c) => c.id === classroomId)?.name ?? "";
  const subjectName = subjects.find((s) => s.id === subjectId)?.name ?? "";
  const subTopicName = curriculumTopics[topicId]?.subTopics.find((s) => s.id === subTopicId)?.name ?? "";
  const subTopicOptions = curriculumTopics[topicId]?.subTopics ?? [];

  // ── Classroom list (role-scoped) ──────────────────────────────────────────
  // Teachers: always driven by their roleData (assigned classes only). The
  // roleData is fetched after auth, so keep the list in sync as it hydrates.
  useEffect(() => {
    if (isAdmin) return;
    setClassrooms(roleClasses);
    if (roleClasses.length === 0) {
      setClassroomId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, roleClasses]);

  // Admins: can see every class in the school.
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setClassroomsLoading(true);
    moduleService
      .getClassrooms({ pageNumber: 1, pageSize: 200 })
      .then((res) => {
        const payload = (res.data as any)?.data ?? res.data ?? {};
        const rows: any[] = payload.classrooms ?? payload.Classrooms ?? [];
        if (!cancelled && Array.isArray(rows)) {
          setClassrooms(
            rows
              .map((c) => ({
                id: String(c.id ?? c.classroomId ?? ""),
                name: String(c.name ?? c.className ?? ""),
                subjects: [] as Option[],
              }))
              .filter((c) => c.id),
          );
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load classrooms.");
      })
      .finally(() => {
        if (!cancelled) setClassroomsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ── Load subjects for the selected class (subject / subtopic mode) ───────
  useEffect(() => {
    if ((mode !== AT.SUBJECT && mode !== AT.SUBTOPIC) || !classroomId) {
      setSubjects([]);
      setSubjectId("");
      return;
    }
    setSubjectId("");
    const fromRole = classrooms.find((c) => c.id === classroomId)?.subjects ?? [];
    if (fromRole.length > 0) {
      setSubjects(fromRole);
      return;
    }
    schoolService
      .getSubjectsByClassroomId(classroomId)
      .then((res) => {
        const payload = (res as any).data?.data ?? (res as any).data ?? [];
        const mapped = (Array.isArray(payload) ? payload : [])
          .map((s: any) => ({
            id: String(s.id ?? s.subjectId ?? ""),
            name: String(s.name ?? s.subjectName ?? ""),
          }))
          .filter((o: Option) => o.id);
        setSubjects(mapped);
      })
      .catch(() => toast.error("Failed to load subjects."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, classroomId, classrooms]);

  // ── Load topics / subtopics for subtopic mode ────────────────────────────
  useEffect(() => {
    if (mode !== AT.SUBTOPIC || !subjectId || !classroomId) {
      setTopics([]);
      setCurriculumTopics({});
      setTopicId("");
      setSubTopicId("");
      return;
    }
    setTopics([]);
    setTopicId("");
    setSubTopicId("");
    schoolService
      .getSubjectCurriculum(subjectId, classroomId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const rawTopics: any[] = raw.Topics ?? raw.topics ?? [];
        const map: Record<string, { id: string; name: string; subTopics: Option[] }> = {};
        const list: Option[] = rawTopics
          .map((t: any) => {
            const id = String(t.Id ?? t.id ?? t.topicId ?? "");
            const subTopics = mapOptions(t.SubTopics ?? t.subTopics ?? []);
            if (id) map[id] = { id, name: String(t.Name ?? t.name ?? ""), subTopics };
            return { id, name: String(t.Name ?? t.name ?? "") };
          })
          .filter((t: Option) => t.id);
        setTopics(list);
        setCurriculumTopics(map);
      })
      .catch(() => toast.error("Failed to load topics."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subjectId, classroomId]);

  // ── Roster map for name enrichment ───────────────────────────────────────
  useEffect(() => {
    if (!classroomId) {
      rosterMapRef.current = {};
      return;
    }
    moduleService
      .getStudentsByClassroom(classroomId)
      .then((res) => {
        const payload = (res.data as any)?.data ?? [];
        const rows = Array.isArray(payload) ? payload : [];
        const map: Record<string, string> = {};
        for (const s of rows) {
          const key = String(s.id ?? s.userId ?? "");
          if (!key) continue;
          map[key] = [s.firstName, s.lastName].filter(Boolean).join(" ") || String(s.userName ?? key);
        }
        rosterMapRef.current = map;
      })
      .catch(() => {
        rosterMapRef.current = {};
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  // ── Data reload ──────────────────────────────────────────────────────────
  const reloadData = useCallback(async () => {
    const scans = await getAllAttendanceScans();
    setTodayScans(scans);
    setPendingCount(await getUnsentAttendanceCount());
    if (activeSessionRef.current) {
      setRecords(await getAttendanceScansBySession(activeSessionRef.current.id));
    }
  }, []);

  // ── Session management ───────────────────────────────────────────────────
  const ensureSession = useCallback(async (): Promise<LocalAttendanceSession | null> => {
    const scopeKey = buildScopeKey({
      attendanceType: mode,
      classroomId,
      subjectId: mode !== AT.CLASS ? subjectId : undefined,
      subTopicId: mode === AT.SUBTOPIC ? subTopicId : undefined,
    });
    const dateKey = toDateKey();
    let session = await findOpenAttendanceSession(dateKey, scopeKey);
    if (!session) {
      session = {
        id: uuidv4(),
        attendanceType: mode,
        teacherId: teacherId || undefined,
        teacherName: teacherName || undefined,
        classroomId: classroomId || undefined,
        classroomName,
        subjectId: mode !== AT.CLASS ? subjectId : undefined,
        subjectName: mode !== AT.CLASS ? subjectName : undefined,
        subTopicId: mode === AT.SUBTOPIC ? subTopicId : undefined,
        subTopicName: mode === AT.SUBTOPIC ? subTopicName : undefined,
        dateKey,
        scopeKey,
        backendSessionId: null,
        status: "open",
        startedAt: isoNow(),
        endSyncRequested: false,
        createdAt: isoNow(),
      };
      await putAttendanceSession(session);
    }

    // Open the backend session now when online so scans land immediately.
    if (!session.backendSessionId && navigator.onLine) {
      try {
        const { data } = await attendanceService.startSession({
          attendanceType: session.attendanceType,
          classroomId: session.classroomId,
          subjectId: session.subjectId,
          subTopicId: session.subTopicId,
        });
        const d = (data as any)?.data ?? data ?? {};
        const backendId = String(d.id ?? "");
        if (backendId) {
          const updated = { ...session, backendSessionId: backendId };
          await updateAttendanceSession(session.id, { backendSessionId: backendId });
          session = updated;
        }
      } catch {
        // Offline — the sync engine will open it when the network returns.
      }
    }

    activeSessionRef.current = session;
    setActiveSession(session);
    setRecords(await getAttendanceScansBySession(session.id));
    return session;
  }, [mode, classroomId, subjectId, subTopicId, classroomName, subjectName, subTopicName, teacherId, teacherName]);

  // ── Scan handling ────────────────────────────────────────────────────────
  const scanStudent = useCallback(
    async ({ decodedText }: { decodedText: string }) => {
      const parsed = parseQrValue(decodedText);
      if (!parsed.ok) {
        toast.error(parsed.reason);
        return;
      }
      const session = activeSessionRef.current ?? (await ensureSession());
      if (!session) {
        toast.error("Start a session by choosing a class / subtopic first.");
        return;
      }

      const dateKey = toDateKey();
      const dedupeKey = buildDedupeKey(dateKey, session.scopeKey, parsed.qrToken);
      const existing = await getAttendanceScanByDedupe(dedupeKey);
      if (existing) {
        toast(
          `${existing.studentName ? `${existing.studentName} — ` : ""}already marked present.`,
          { icon: "✋", id: dedupeKey },
        );
        return;
      }

      const record: AttendanceScanRecord = {
        id: uuidv4(),
        sessionId: session.id,
        backendSessionId: session.backendSessionId,
        qrToken: parsed.qrToken,
        studentName: rosterMapRef.current[parsed.qrToken],
        teacherId: teacherId || undefined,
        teacherName: teacherName || undefined,
        scannedAt: isoNow(),
        dateKey,
        scopeKey: session.scopeKey,
        dedupeKey,
        syncStatus: "pending",
        permanentlyFailed: false,
        attempts: 0,
      };

      await putAttendanceScan(record);
      toast.success(
        record.studentName ? `${record.studentName} marked present` : "Marked present ✔",
        { id: dedupeKey },
      );
      await reloadData();
      void runSync({ silent: true });
    },
    [ensureSession, reloadData, teacherId, teacherName],
  );

  // ── Sync engine wrapper ──────────────────────────────────────────────────
  const runSync = useCallback(async (opts?: { silent?: boolean }) => {
    if (syncLockRef.current) return;
    syncLockRef.current = true;
    setSyncing(true);
    try {
      const result = await flushAttendanceSync();
      await reloadData();
      if (!opts?.silent) {
        if (result.offline) {
          toast.error("You are offline — records saved and will sync automatically.");
        } else if (result.failed > 0) {
          toast.error(`Synced ${result.synced}, ${result.failed} still failing.`);
        } else if (result.synced > 0 || result.alreadyRecorded > 0) {
          const registered = result.synced + result.alreadyRecorded;
          toast.success(
            `Sync complete — ${registered} student${registered === 1 ? "" : "s"} registered.`,
            { duration: 4000 },
          );
        } else {
          toast("Nothing to sync.");
        }
      }
    } catch {
      if (!opts?.silent) toast.error("Sync failed — retrying later automatically.");
    } finally {
      syncLockRef.current = false;
      setSyncing(false);
    }
  }, [reloadData]);

  // ── Online / offline + auto sync ─────────────────────────────────────────
  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      void runSync({ silent: true });
    };
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void reloadData();
    const interval = window.setInterval(() => {
      void runSync({ silent: true });
    }, 45_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleStartScan = useCallback(async () => {
    if (mode === AT.CLASS && !classroomId) {
      toast.error("Choose a class before scanning.");
      return;
    }
    if (mode !== AT.CLASS && !subjectId) {
      toast.error("Choose a subject before scanning.");
      return;
    }
    if (mode === AT.SUBTOPIC && !subTopicId) {
      toast.error("Choose a subtopic before scanning.");
      return;
    }
    const session = await ensureSession();
    if (session) setScannerOpen(true);
  }, [mode, classroomId, subjectId, subTopicId, ensureSession]);

  const endSession = useCallback(async () => {
    const session = activeSessionRef.current;
    if (!session) return;
    await updateAttendanceSession(session.id, { status: "ended", endedAt: isoNow() });
    activeSessionRef.current = null;
    setActiveSession(null);
    toast.success("Session closed — records will sync when online.");
    void runSync({ silent: true });
  }, [runSync]);

  const handleCloseScanner = useCallback(() => setScannerOpen(false), []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const unique = new Set(todayScans.map((r) => r.dedupeKey)).size;
    const synced = todayScans.filter((r) => r.syncStatus === "sent").length;
    const failed = todayScans.filter((r) => r.syncStatus === "failed").length;
    const queued = todayScans.filter(
      (r) => r.syncStatus !== "sent" && !(r.syncStatus === "failed" && r.permanentlyFailed),
    ).length;
    return { unique, synced, failed, queued: Math.max(pendingCount, queued) };
  }, [todayScans, pendingCount]);

  const modeEligible =
    (mode === AT.CLASS && !!classroomId) ||
    (mode === AT.SUBJECT && !!classroomId && !!subjectId) ||
    (mode === AT.SUBTOPIC && !!classroomId && !!subjectId && !!subTopicId);

  return (
    <div className="md:px-3 font-poppins">
      <div className="lg:rounded-2xl border border-white/20 overflow-hidden bg-white/75 backdrop-blur-sm">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-30 bg-chestnut">
          <div className="flex items-center gap-2.5 min-w-0">
            <Menu className="lg:hidden text-white" onClick={openMobileNav} />
            <ScanLine className="w-5 h-5 hidden lg:inline text-white" />
            <span className="text-white font-semibold text-sm truncate">Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white">
                <Wifi className="h-3.5 w-3.5" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-400/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950">
                <WifiOff className="h-3.5 w-3.5" /> Offline — will queue
              </span>
            )}
          </div>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-xs font-medium text-amber-800">
            <CloudOff className="h-4 w-4 shrink-0" />
            No network right now. Every scan is saved on this device and pushed
            automatically when the network returns — no data is lost.
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* ── Mode selection ── */}
          <section>
            <h2 className="text-sm font-semibold text-[#12122A] mb-3">1 · Choose attendance type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODE_OPTIONS.filter((m) => allowedModes.includes(m.value)).map((m) => {
                const selected = mode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      setMode(m.value);
                      setSubjectId("");
                      setTopicId("");
                      setSubTopicId("");
                    }}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-chestnut/60 bg-chestnut/[0.06] ring-1 ring-chestnut/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#12122A]">{m.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Context pickers ── */}
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-[#12122A]">
                Select the {mode === AT.CLASS ? "class" : "class and lesson scope"} for this attendance
              </h3>
              {!isAdmin && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Only the classes assigned to you are listed here.
                </p>
              )}
            </div>

            {user && !isAdmin && !hasAssignedClasses ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No classes are assigned to your account yet.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Attendance can only be taken for classes assigned to you. Contact
                  an administrator if you think this is a mistake.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label="Class"
                  value={classroomId}
                  onChange={(v) => {
                    setClassroomId(v);
                    setSubjectId("");
                    setTopicId("");
                    setSubTopicId("");
                  }}
                  options={classrooms}
                  placeholder={
                    classrooms.length
                      ? "Choose a class…"
                      : classroomsLoading
                        ? "Loading classes…"
                        : "No classes available"
                  }
                />
                {mode !== AT.CLASS && (
                  <SelectField
                    label="Subject"
                    value={subjectId}
                    onChange={(v) => {
                      setSubjectId(v);
                      setTopicId("");
                      setSubTopicId("");
                    }}
                    options={subjects}
                    placeholder="Choose a subject…"
                  />
                )}
                {mode === AT.SUBTOPIC && (
                  <>
                    <SelectField
                      label="Topic"
                      value={topicId}
                      onChange={(v) => {
                        setTopicId(v);
                        setSubTopicId("");
                      }}
                      options={topics}
                      placeholder="Choose a topic…"
                    />
                    <SelectField
                      label="Subtopic / Lesson"
                      value={subTopicId}
                      onChange={setSubTopicId}
                      options={subTopicOptions}
                      placeholder="Choose a subtopic…"
                    />
                  </>
                )}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!modeEligible}
                onClick={() => void handleStartScan()}
                className="inline-flex items-center gap-2 rounded-lg bg-chestnut px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Camera className="h-4 w-4" />
                Scan students
              </button>
              <button
                type="button"
                disabled={!activeSession}
                onClick={() => void endSession()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Square className="h-3.5 w-3.5" />
                End session
              </button>
              <button
                type="button"
                onClick={() => void runSync({ silent: false })}
                disabled={syncing || stats.queued === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : stats.queued > 0 ? `Sync now (${stats.queued})` : "Sync now"}
              </button>
            </div>

            {!modeEligible && (
              <p className="mt-3 text-xs text-slate-400">
                {mode === AT.CLASS
                  ? "Pick a class to begin."
                  : mode === AT.SUBJECT
                    ? "Pick a class and subject to begin."
                    : "Pick a class, subject, topic and subtopic to begin."}
              </p>
            )}
          </section>

          {/* ── Active session ── */}
          {activeSession && (
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-semibold text-[#12122A]">
                      Session in progress · {MODE_LABEL[activeSession.attendanceType]}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {activeSession.classroomName ?? activeSession.classroomId}
                    {activeSession.subjectName && ` · ${activeSession.subjectName}`}
                    {activeSession.subTopicName && ` · ${activeSession.subTopicName}`}
                    {activeSession.teacherName && ` · by ${activeSession.teacherName}`}
                    {activeSession.backendSessionId
                      ? " · connected to server"
                      : isOnline
                        ? " · connecting…"
                        : " · will push when online"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {records.length} scanned
                </span>
              </div>

              {records.length > 0 && (
                <div className="mt-4 max-h-64 overflow-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
                  {records
                    .slice()
                    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {r.studentName || `Student ${r.qrToken.slice(0, 8)}`}
                            </p>
                            <p className="text-[11px] text-slate-400">{formatTime(r.scannedAt)}</p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SYNC_BADGE[r.syncStatus].className}`}
                        >
                          {SYNC_BADGE[r.syncStatus].label}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}

          {/* ── Summary ── */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<Users className="h-4 w-4 text-[#4255db]" />}
              label="Marked today"
              value={stats.unique}
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              label="Synced"
              value={stats.synced}
            />
            <StatCard
              icon={<Clock className="h-4 w-4 text-amber-600" />}
              label="Waiting to sync"
              value={stats.queued}
              highlight={stats.queued > 0}
            />
            <StatCard
              icon={<XCircle className="h-4 w-4 text-red-500" />}
              label="Failed"
              value={stats.failed}
              highlight={stats.failed > 0}
            />
          </section>

          {stats.failed > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Some records failed to sync
              </div>
              <p className="mt-1 text-xs text-red-600/80">
                Failed records are kept on this device and are never deleted. Ensure you are
                online and press “Sync now” to retry them.
              </p>
            </section>
          )}
        </div>
      </div>

      <QrScannerModal
        open={scannerOpen}
        onClose={handleCloseScanner}
        onDetected={scanStudent}
      />
    </div>
  );
};

// ── Small presentational helpers ─────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-[#12122A] font-medium focus:outline-none focus:ring-2 focus:ring-chestnut/30 focus:border-transparent disabled:opacity-50"
      >
        <option value="">{placeholder ?? "Select…"}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3 ${
        highlight ? "ring-1 ring-amber-300" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">{icon}</div>
      <p className="text-2xl font-bold text-[#12122A] leading-none">{value}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default TeacherAttendance;
