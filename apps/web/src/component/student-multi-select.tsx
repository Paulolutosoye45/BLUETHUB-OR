import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Search, Trash2 } from "lucide-react";
import { moduleService, type ModuleStudent } from "@/services/module";

interface ClassOption {
  id: string;
  name: string;
}

const selectCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium outline-none focus:ring-2 focus:ring-chestnut/20 bg-white disabled:bg-gray-50 disabled:text-gray-400";

export interface StudentMultiSelectProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  /** Total cap on the selection itself — the backend may enforce a lower
   *  effective cap once existing links are counted (surfaced via its own error). */
  maxStudents?: number;
  label?: string;
  hint?: string;
}

const StudentMultiSelect = ({
  selectedIds,
  onToggle,
  maxStudents = 10,
  label = "Students",
  hint = "Choose a class, then pick students from it. Up to 10 active students per parent (existing links on the account count toward the cap).",
}: StudentMultiSelectProps) => {
  // ── Class list ──────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    setClassesLoading(true);
    moduleService
      .getClassrooms({ pageNumber: 1, pageSize: 200 })
      .then((res) => {
        // This endpoint sometimes wraps the list in { classrooms: [...] }
        // instead of returning it flat — handle both.
        const payload = (res.data as any)?.data ?? {};
        const rows: any[] = Array.isArray(payload) ? payload : (payload.classrooms ?? payload.Classrooms ?? []);
        setClasses(
          rows
            .map((c) => ({ id: String(c.id ?? c.Id ?? ""), name: String(c.name ?? c.Name ?? c.className ?? "") }))
            .filter((c) => c.id),
        );
      })
      .catch(() => setClasses([]))
      .finally(() => setClassesLoading(false));
  }, []);

  // ── Students in the selected class ─────────────────────────────────────
  const [classStudents, setClassStudents] = useState<ModuleStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  // Selections can span multiple classes — remember every student we've
  // seen so chips for a previously-picked class still render a name.
  const [knownStudents, setKnownStudents] = useState<Record<string, ModuleStudent>>({});

  useEffect(() => {
    setStudentSearch("");
    if (!selectedClassId) {
      setClassStudents([]);
      return;
    }
    let cancelled = false;
    setStudentsLoading(true);
    moduleService
      .getStudentsByClassroom(selectedClassId)
      .then((res) => {
        if (cancelled) return;
        const payload = (res.data as any)?.data ?? [];
        const rows: ModuleStudent[] = Array.isArray(payload) ? payload : [];
        setClassStudents(rows.filter((s) => !!s.id));
        setKnownStudents((prev) => {
          const next = { ...prev };
          rows.forEach((s) => {
            if (s.id) next[s.id] = s;
          });
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) setClassStudents([]);
      })
      .finally(() => {
        if (!cancelled) setStudentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter((s) =>
      [s.firstName, s.lastName, s.userName].join(" ").toLowerCase().includes(q),
    );
  }, [classStudents, studentSearch]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700">
          {label} <span className="text-red-500">*</span>
        </label>
        <span className={`text-[11px] font-semibold ${selectedIds.size >= maxStudents ? "text-amber-600" : "text-gray-400"}`}>
          {selectedIds.size}/{maxStudents} selected
        </span>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {Array.from(selectedIds).map((id) => {
            const s = knownStudents[id];
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 bg-chestnut/10 text-chestnut text-xs font-semibold px-2.5 py-1 rounded-full border border-chestnut/20"
              >
                {s ? `${s.firstName} ${s.lastName}` : id}
                <button type="button" onClick={() => onToggle(id)} className="hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          disabled={classesLoading}
          className={selectCls}
        >
          <option value="">{classesLoading ? "Loading classes..." : "Choose a class..."}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Filter students in this class..."
            disabled={!selectedClassId}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-chestnut/20 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl max-h-64 overflow-y-auto divide-y divide-gray-50">
        {!selectedClassId ? (
          <p className="text-center text-xs text-gray-400 py-8">Choose a class above to see its students.</p>
        ) : studentsLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">No students found in this class.</p>
        ) : (
          filteredStudents.map((s) => {
            const checked = selectedIds.has(s.id);
            const capped = !checked && selectedIds.size >= maxStudents;
            return (
              <label
                key={s.id}
                className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                  capped ? "opacity-40 cursor-not-allowed" : "hover:bg-chestnut/5"
                }`}
              >
                <div
                  onClick={() => !capped && onToggle(s.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    checked ? "bg-chestnut border-chestnut" : "border-gray-300"
                  }`}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="min-w-0 flex-1" onClick={() => !capped && onToggle(s.id)}>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{s.userName}</p>
                </div>
              </label>
            );
          })
        )}
      </div>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
    </div>
  );
};

export default StudentMultiSelect;
