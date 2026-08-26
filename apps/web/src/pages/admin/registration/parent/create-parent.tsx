import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Trash2,
  User,
  UserPlus,
  UserX,
} from "lucide-react";
import { moduleService, type ModuleStudent } from "@/services/module";
import { parentService, type CreateParentData } from "@/services/parent";

const MAX_STUDENTS = 10;

// GetUsersByRole doesn't return a flat ModuleStudent[] — className/subjects
// live under roleData with inconsistent casing, same shape gap fixed
// elsewhere for getTeacherStudents (see pages/module/index.tsx's normalizeStudent).
function normalizeStudent(s: any): ModuleStudent {
  return {
    id: String(s?.id ?? s?.Id ?? ""),
    firstName: String(s?.firstName ?? s?.FirstName ?? ""),
    lastName: String(s?.lastName ?? s?.LastName ?? ""),
    userName: String(s?.userName ?? s?.UserName ?? ""),
    emailAddress: String(s?.emailAddress ?? s?.EmailAddress ?? ""),
    className: (() => {
      const c =
        s?.roleData?.classroom ??
        s?.roleData?.Classroom ??
        s?.roleData?.classrooms?.[0] ??
        s?.roleData?.Classrooms?.[0] ??
        null;
      return String(c?.className ?? c?.ClassName ?? c?.name ?? c?.Name ?? "");
    })(),
    subjectNames: (() => {
      const raw = s?.roleData?.majorSubjects ?? s?.roleData?.MinorSubjects ?? s?.roleData?.subjects ?? [];
      return (Array.isArray(raw) ? raw : [])
        .map((sub: any) => sub.subjectName ?? sub.SubjectName ?? "")
        .filter(Boolean)
        .join(", ");
    })(),
    isActive: Boolean(s?.isActive ?? s?.IsActive ?? false),
  };
}

const inputCls =
  "w-full ring-2 ring-chestnut/15 focus:ring-chestnut/40 border-0 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none bg-white";

function extractMsg(err: unknown, fallback: string): string {
  return err instanceof AxiosError
    ? err.response?.data?.responseMessage ?? err.response?.data?.message ?? err.message ?? fallback
    : (err as Error).message ?? fallback;
}

const CreateParentPage = () => {
  // ── Student roster ──────────────────────────────────────────────────────
  const [students, setStudents] = useState<ModuleStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    setStudentsLoading(true);
    moduleService
      .getAllStudents()
      .then((res) => {
        const payload = (res.data as any)?.data ?? (res.data as any)?.Data ?? [];
        const rows = Array.isArray(payload) ? payload : [];
        setStudents(rows.map(normalizeStudent).filter((s) => !!s.id));
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  }, []);

  const classOptions = useMemo(() => {
    const names = new Set(students.map((s) => s.className).filter(Boolean));
    return Array.from(names).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (classFilter !== "all" && s.className !== classFilter) return false;
      if (!q) return true;
      return [s.firstName, s.lastName, s.userName, s.className].join(" ").toLowerCase().includes(q);
    });
  }, [students, studentSearch, classFilter]);

  // ── Form ─────────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_STUDENTS) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidStudentIds, setInvalidStudentIds] = useState<string[]>([]);
  const [result, setResult] = useState<CreateParentData | null>(null);

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && selectedStudentIds.size > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg("");
    setInvalidStudentIds([]);
    setResult(null);
    try {
      const res = await parentService.createParent({
        parentFirstName: firstName.trim(),
        parentLastName: lastName.trim(),
        parentEmail: email.trim(),
        studentIds: Array.from(selectedStudentIds),
      });
      setResult(res.data.data);
      setManageParentId(res.data.data.parentId);
      // Reset the form so the admin can register another parent right away.
      setFirstName("");
      setLastName("");
      setEmail("");
      setSelectedStudentIds(new Set());
    } catch (err) {
      const anyErr = err as AxiosError<{ data?: { invalidStudentIds?: string[] } }>;
      setInvalidStudentIds(anyErr.response?.data?.data?.invalidStudentIds ?? []);
      setErrorMsg(extractMsg(err, "Failed to create parent."));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Manage an existing parent (unlink student / deactivate) ───────────────
  // There's no "list parents" endpoint, so this operates on a parentId either
  // just returned by creation above, or entered manually if already known.
  const [manageParentId, setManageParentId] = useState("");
  const [unlinkStudentId, setUnlinkStudentId] = useState("");
  const [unlinking, setUnlinking] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [manageMsg, setManageMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleUnlink = async () => {
    if (!manageParentId.trim() || !unlinkStudentId.trim()) return;
    setUnlinking(true);
    setManageMsg(null);
    try {
      await parentService.removeStudentParent({
        parentId: manageParentId.trim(),
        studentId: unlinkStudentId.trim(),
      });
      setManageMsg({ ok: true, text: "Student unlinked from this parent." });
      setUnlinkStudentId("");
    } catch (err) {
      setManageMsg({ ok: false, text: extractMsg(err, "Failed to unlink student.") });
    } finally {
      setUnlinking(false);
    }
  };

  const handleDeactivate = async () => {
    if (!manageParentId.trim()) return;
    setDeactivating(true);
    setManageMsg(null);
    try {
      await parentService.deactivateParent(manageParentId.trim());
      setManageMsg({ ok: true, text: "Parent account deactivated — they can no longer log in." });
    } catch (err) {
      setManageMsg({ ok: false, text: extractMsg(err, "Failed to deactivate parent.") });
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="font-poppins min-h-screen">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden bg-white/70">
        <div className="bg-gradient-to-r from-chestnut to-chestnut/90 px-4 sm:px-6 py-4 sm:py-5 lg:rounded-t-lg">
          <h2 className="font-semibold text-base text-white leading-none">Register Parent</h2>
          <p className="text-white/60 text-[11px] mt-1">Create a parent account and link it to their children</p>
        </div>

        <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
          {/* ── Result banner ── */}
          {result && (
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm text-emerald-700">
                <p className="font-semibold">
                  {result.parentCreated
                    ? "New parent account created — credentials emailed to them."
                    : "Added to existing parent account — no email sent."}
                </p>
                {result.parentCreated && result.username && (
                  <p className="mt-0.5 text-xs">
                    Username: <span className="font-mono font-semibold">{result.username}</span>
                  </p>
                )}
                <p className="mt-0.5 text-xs">
                  {result.linkedStudentIds.length} student(s) newly linked
                  {result.alreadyLinkedStudentIds.length > 0 &&
                    ` · ${result.alreadyLinkedStudentIds.length} already linked`}
                </p>
                <p className="mt-0.5 text-[11px] font-mono text-emerald-600/80">Parent ID: {result.parentId}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm text-red-600">
                <p>{errorMsg}</p>
                {invalidStudentIds.length > 0 && (
                  <p className="mt-0.5 text-xs">Invalid student ids: {invalidStudentIds.join(", ")}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Form ── */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> First Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Adaeze"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Funmi"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                className={inputCls}
              />
              <p className="text-[10px] text-gray-400">
                If this email already belongs to a parent in this school, the students below are linked to that
                existing account instead of creating a new one.
              </p>
            </div>

            {/* ── Student multi-select ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">
                  Students <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-semibold ${selectedStudentIds.size >= MAX_STUDENTS ? "text-amber-600" : "text-gray-400"}`}>
                  {selectedStudentIds.size}/{MAX_STUDENTS} selected
                </span>
              </div>

              {selectedStudentIds.size > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {Array.from(selectedStudentIds).map((id) => {
                    const s = students.find((st) => st.id === id);
                    if (!s) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 bg-chestnut/10 text-chestnut text-xs font-semibold px-2.5 py-1 rounded-full border border-chestnut/20"
                      >
                        {s.firstName} {s.lastName}
                        <button type="button" onClick={() => toggleStudent(id)} className="hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students by name..."
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-chestnut/20"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-chestnut/20 bg-white sm:w-48"
                >
                  <option value="all">All classes</option>
                  {classOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-100 rounded-xl max-h-64 overflow-y-auto divide-y divide-gray-50">
                {studentsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Loading students...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8">No students found.</p>
                ) : (
                  filteredStudents.map((s) => {
                    const checked = selectedStudentIds.has(s.id);
                    const capped = !checked && selectedStudentIds.size >= MAX_STUDENTS;
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                          capped ? "opacity-40 cursor-not-allowed" : "hover:bg-chestnut/5"
                        }`}
                      >
                        <div
                          onClick={() => !capped && toggleStudent(s.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            checked ? "bg-chestnut border-chestnut" : "border-gray-300"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div
                          className="min-w-0 flex-1"
                          onClick={() => !capped && toggleStudent(s.id)}
                        >
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{s.className || s.userName}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                Up to 10 active students per parent (existing links on the account count toward the cap).
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-chestnut hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? "Creating..." : "Create / Link Parent"}
            </button>
          </section>

          {/* ── Manage existing parent ── */}
          <section className="border-t border-gray-100 pt-6 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Manage an existing parent</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                There's no parent directory yet — use a Parent ID from a creation above, or one you already have.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Parent ID</label>
              <input
                value={manageParentId}
                onChange={(e) => setManageParentId(e.target.value)}
                placeholder="Paste a parent id"
                className={inputCls}
              />
            </div>

            {manageMsg && (
              <div
                className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs ${
                  manageMsg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {manageMsg.ok ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                {manageMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Student ID to unlink</label>
                <input
                  value={unlinkStudentId}
                  onChange={(e) => setUnlinkStudentId(e.target.value)}
                  placeholder="Paste a student id"
                  className={inputCls}
                />
              </div>
              <button
                type="button"
                onClick={handleUnlink}
                disabled={!manageParentId.trim() || !unlinkStudentId.trim() || unlinking}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {unlinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                Unlink
              </button>
            </div>

            <button
              type="button"
              onClick={handleDeactivate}
              disabled={!manageParentId.trim() || deactivating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
              Deactivate this parent
            </button>
            <p className="text-[10px] text-gray-400">
              Blocks login. Student links are left intact — there is no reactivate endpoint yet.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreateParentPage;
