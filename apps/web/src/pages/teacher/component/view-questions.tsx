import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { authService } from "@/services/auth";
import { schoolService } from "@/services/school";
import { questionService, type QuestionSummaryDto } from "@/services/question";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Label,
} from "@bluethub/ui-kit";
import {
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Layers,
  Loader2,
  Menu,
  Search,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface TeacherAssignment {
  classroomId: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

interface CurriculumTopic {
  id: string;
  name: string;
  subTopics: { id: string; name: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Star difficulty display
// ═══════════════════════════════════════════════════════════════════════════════
const DIFFICULTY_META = [
  { label: "Easy", fill: "#10b981" },
  { label: "Medium", fill: "#fbbf24" },
  { label: "Hard", fill: "#f97316" },
  { label: "Expert", fill: "#ef4444" },
];

const DifficultyBadge = ({ level }: { level: number }) => {
  const meta = DIFFICULTY_META[level - 1];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: meta.fill, backgroundColor: `${meta.fill}18` }}
    >
      <Star size={9} fill={meta.fill} strokeWidth={0} />
      {meta.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Mobile filter drawer
// ═══════════════════════════════════════════════════════════════════════════════
const FilterDrawer = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-[85vw] max-w-sm bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-800">Filters</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

const ViewQuestions = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();

  // ── Teacher context ───────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [contextLoading, setContextLoading] = useState(true);

  // ── Curriculum data ───────────────────────────────────────────────────────
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<Set<string>>(new Set());

  // ── Questions ─────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<QuestionSummaryDto[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const [searchText, setSearchText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionSummaryDto | null>(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(questionsTotal / PAGE_SIZE);

  // ── Load teacher assignments on mount ─────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    setContextLoading(true);
    authService
      .getUserById(user.id)
      .then((res) => {
        const roleData = (res.data as any)?.data?.roleData;
        const roleClassrooms: any[] = roleData?.classrooms ?? [];
        const pairs: TeacherAssignment[] = [];
        for (const c of roleClassrooms) {
          if (!c?.classroomId) continue;
          for (const s of c.subjects ?? []) {
            if (!s?.subjectId || !s?.subjectName) continue;
            pairs.push({
              classroomId: c.classroomId,
              className: String(c.className ?? ""),
              subjectId: s.subjectId,
              subjectName: s.subjectName,
            });
          }
        }
        setAssignments(pairs);
        if (pairs.length > 0) {
          setSelectedClassId(pairs[0].classroomId);
          setSelectedSubjectId(pairs[0].subjectId);
        }
      })
      .catch(() => toast.error("Failed to load your assignments"))
      .finally(() => setContextLoading(false));
  }, [user?.id]);

  // ── Fetch curriculum topics when subject changes ──────────────────────────
  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSelectedTopicIds(new Set());
      setSelectedSubtopicIds(new Set());
      return;
    }
    setTopicsLoading(true);
    schoolService
      .getSubjectCurriculum(selectedSubjectId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const rawTopics: any[] = raw.Topics ?? raw.topics ?? [];
        const mapped: CurriculumTopic[] = rawTopics.map((t: any) => ({
          id: String(t.Id ?? t.id ?? t.topicId),
          name: String(t.Name ?? t.name ?? t.topicName ?? ""),
          subTopics: (t.SubTopics ?? t.subTopics ?? []).map((s: any) => ({
            id: String(s.Id ?? s.id ?? s.subTopicId),
            name: String(s.Name ?? s.name ?? s.subTopicName ?? ""),
          })),
        }));
        setTopics(mapped);
        // Auto-select first topic if only one
        if (mapped.length === 1) {
          setSelectedTopicIds(new Set([mapped[0].id]));
        } else {
          setSelectedTopicIds(new Set());
        }
        setSelectedSubtopicIds(new Set());
      })
      .catch(() => toast.error("Failed to load topics"))
      .finally(() => setTopicsLoading(false));
  }, [selectedSubjectId]);

  // ── Fetch questions when filters change ───────────────────────────────────
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) return;

    const topicIds = Array.from(selectedTopicIds);
    const subtopicIds = Array.from(selectedSubtopicIds);

    setQuestionsLoading(true);
    questionService
      .getQuestionsByClassroom(selectedClassId, {
        page,
        pageSize: PAGE_SIZE,
        subjectId: selectedSubjectId,
        topicId: topicIds.length === 1 ? topicIds[0] : undefined,
        subTopicIds: subtopicIds.length > 0 ? subtopicIds : undefined,
        searchText: searchText.trim() || undefined,
      })
      .then((res) => {
        const data = (res.data as any)?.data;
        setQuestions(data?.questions ?? []);
        setQuestionsTotal(data?.totalCount ?? 0);
      })
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setQuestionsLoading(false));
  }, [selectedClassId, selectedSubjectId, selectedTopicIds, selectedSubtopicIds, page, searchText]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const currentSubject = assignments.find((a) => a.subjectId === selectedSubjectId);

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Also clear subtopics for this topic
        const topic = topics.find((t) => t.id === id);
        if (topic) {
          setSelectedSubtopicIds((sprev) => {
            const snext = new Set(sprev);
            for (const st of topic.subTopics) snext.delete(st.id);
            return snext;
          });
        }
      } else {
        next.add(id);
      }
      setPage(1);
      return next;
    });
  };

  const toggleSubtopic = (id: string) => {
    setSelectedSubtopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setPage(1);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedTopicIds(new Set());
    setSelectedSubtopicIds(new Set());
    setSearchText("");
    setPage(1);
  };

  // ── Filter panel content (shared between desktop sidebar & mobile drawer)
  const filtersContent = (
    <div className="flex flex-col gap-5">
      {/* Subject Selector */}
      <div className="flex flex-col gap-2">
        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          Subject
        </Label>
        <div className="relative">
          <button
            onClick={() => setSubjectDropdownOpen((p) => !p)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-300 transition-all"
          >
            <span className="truncate">
              {currentSubject ? `${currentSubject.subjectName} (${currentSubject.className})` : "Select subject"}
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 shrink-0 transition-transform ${subjectDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
          {subjectDropdownOpen && (
            <div className="absolute z-40 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
              {assignments.map((a) => (
                <button
                  key={`${a.classroomId}-${a.subjectId}`}
                  onClick={() => {
                    setSelectedClassId(a.classroomId);
                    setSelectedSubjectId(a.subjectId);
                    setSubjectDropdownOpen(false);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    selectedClassId === a.classroomId && selectedSubjectId === a.subjectId
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    {a.subjectName} <span className="text-slate-400">· {a.className}</span>
                  </span>
                  {selectedClassId === a.classroomId && selectedSubjectId === a.subjectId && (
                    <Check size={14} className="text-indigo-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Topics
          </Label>
          {selectedTopicIds.size > 0 && (
            <button
              onClick={() => { setSelectedTopicIds(new Set()); setSelectedSubtopicIds(new Set()); setPage(1); }}
              className="text-[10px] font-semibold text-rose-500 hover:text-rose-600"
            >
              Clear
            </button>
          )}
        </div>
        {topicsLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Loading topics…
          </div>
        ) : topics.length === 0 ? (
          <p className="text-sm text-slate-400 py-2">No topics found.</p>
        ) : (
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto">
            {topics.map((topic) => {
              const active = selectedTopicIds.has(topic.id);
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-indigo-500 border-indigo-500" : "border-slate-300 bg-white"
                    }`}
                  >
                    {active && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtopics */}
      {selectedTopicIds.size > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Subtopics
            </Label>
            {selectedSubtopicIds.size > 0 && (
              <button
                onClick={() => { setSelectedSubtopicIds(new Set()); setPage(1); }}
                className="text-[10px] font-semibold text-rose-500 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topics
              .filter((t) => selectedTopicIds.has(t.id))
              .flatMap((t) => t.subTopics)
              .map((st) => {
                const active = selectedSubtopicIds.has(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => toggleSubtopic(st.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                      active
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {st.name}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="sm:p-4 lg:p-6 font-poppins min-h-screen">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden bg-white/70">
        {/* Header */}
        <div className="bg-gradient-to-r from-chestnut to-chestnut/90 px-4 sm:px-6 py-4 sm:py-5 lg:rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Menu className="lg:hidden w-5 h-5 text-white" onClick={openMobileNav} />
            <h2 className="font-semibold text-lg text-white leading-none">Question Bank</h2>
          </div>
          <button
            onClick={() => navigate("/teacher/assessment")}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* ── Left Sidebar (desktop) ── */}
          <aside className="hidden lg:flex w-80 shrink-0 flex-col gap-5 p-5 border-r border-slate-100 bg-slate-50/50 h-[calc(100vh-8rem)] overflow-y-auto sticky top-0">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Filter size={15} className="text-indigo-500" />
              <span className="text-sm font-bold text-slate-800">Filters</span>
            </div>
            {contextLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-400">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : (
              filtersContent
            )}
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 flex flex-col min-h-[calc(100vh-8rem)]">
            {/* Toolbar */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                  placeholder="Search questions…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                />
                {searchText && (
                  <button
                    onClick={() => { setSearchText(""); setPage(1); searchRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile filter button + Active filters summary */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-indigo-300 transition-all"
                >
                  <Filter size={14} />
                  Filters
                  {(selectedTopicIds.size > 0 || selectedSubtopicIds.size > 0) && (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {selectedTopicIds.size + selectedSubtopicIds.size}
                    </span>
                  )}
                </button>

                {(selectedTopicIds.size > 0 || selectedSubtopicIds.size > 0 || searchText) && (
                  <button
                    onClick={clearFilters}
                    className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 transition-all"
                  >
                    <X size={12} />
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Active filter chips (desktop) */}
            <div className="hidden lg:flex flex-wrap items-center gap-1.5 px-6 py-2 border-b border-slate-50">
              {currentSubject && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  <BookOpen size={10} />
                  {currentSubject.subjectName}
                </span>
              )}
              {Array.from(selectedTopicIds).map((tid) => {
                const t = topics.find((x) => x.id === tid);
                return t ? (
                  <span
                    key={tid}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600"
                  >
                    <Layers size={10} />
                    {t.name}
                    <button onClick={() => toggleTopic(tid)} className="hover:text-rose-500">
                      <X size={10} />
                    </button>
                  </span>
                ) : null;
              })}
              {Array.from(selectedSubtopicIds).map((sid) => {
                const st = topics.flatMap((t) => t.subTopics).find((x) => x.id === sid);
                return st ? (
                  <span
                    key={sid}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700"
                  >
                    {st.name}
                    <button onClick={() => toggleSubtopic(sid)} className="hover:text-rose-500">
                      <X size={10} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>

            {/* Questions grid */}
            <div className="flex-1 p-4 sm:p-6">
              {questionsLoading && questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={32} className="text-indigo-300 animate-spin" />
                  <p className="text-sm text-slate-400 font-medium">Loading questions…</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Brain size={48} className="text-slate-200" />
                  <p className="text-sm text-slate-400 font-medium text-center">
                    {selectedTopicIds.size === 0
                      ? "Select a topic to view questions."
                      : "No questions found for the selected filters."}
                  </p>
                  {selectedTopicIds.size > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                      {questionsTotal} question{questionsTotal !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  {/* Responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setSelectedQuestion(q)}
                        className="text-left group rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                      >
                        {/* Image / Snapshot */}
                        {(q.imageUrl || q.boardSnapshotUrl) ? (
                          <div className="relative h-36 bg-slate-100 overflow-hidden">
                            <img
                              src={q.imageUrl || q.boardSnapshotUrl || ""}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute top-2 right-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                                {q.imageUrl ? "Image" : "Board"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center">
                            <Layers size={24} className="text-indigo-200" />
                          </div>
                        )}

                        {/* Card body */}
                        <div className="p-3.5 flex flex-col gap-2 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1">
                              {q.title || "Untitled question"}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <DifficultyBadge level={q.difficultyLevel} />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                              {q.questionTypeName || `Type ${q.questionType}`}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              {q.marksAllocation} mark{q.marksAllocation !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate">{q.topicName || q.topic || "No topic"}</span>
                            <span className="shrink-0">{q.statusName || `Status ${q.status}`}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-medium text-slate-600 px-2">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}>
        {filtersContent}
      </FilterDrawer>

      {/* Question detail dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
        <DialogContent className="max-w-xl sm:max-w-2xl rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-slate-800">Question Details</DialogTitle>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {selectedQuestion && (
            <div className="p-5 space-y-4">
              {/* Image / Snapshot */}
              {(selectedQuestion.imageUrl || selectedQuestion.boardSnapshotUrl) && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <p className="text-[11px] font-semibold text-slate-500 px-3 py-2 border-b border-slate-100 bg-white">
                    {selectedQuestion.imageUrl ? "Attached Image" : "Board Snapshot"}
                  </p>
                  <div className="flex items-center justify-center p-3">
                    <img
                      src={selectedQuestion.imageUrl || selectedQuestion.boardSnapshotUrl || ""}
                      alt="Question media"
                      className="max-w-full rounded-lg object-contain"
                      style={{ maxHeight: 320 }}
                    />
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Question</p>
                <p className="mt-2 text-sm text-slate-700 leading-6 font-medium">
                  {selectedQuestion.title || "Untitled question"}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 flex items-center gap-1.5">
                  <Layers size={11} />
                  {selectedQuestion.questionTypeName || `Type ${selectedQuestion.questionType}`}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 flex items-center gap-1.5">
                  <Star size={11} />
                  {selectedQuestion.difficultyLevelName || `Level ${selectedQuestion.difficultyLevel}`}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 flex items-center gap-1.5">
                  <BookOpen size={11} />
                  {selectedQuestion.topicName || selectedQuestion.topic || "No topic"}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600">
                  Status: {selectedQuestion.statusName || `Status ${selectedQuestion.status}`}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600">
                  Marks: {selectedQuestion.marksAllocation}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-600">
                  {selectedQuestion.creationDate}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedQuestion(null)}
                  className="h-10 rounded-xl px-4"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedQuestion(null);
                    navigate(`/teacher/assessment/questionlist?subjectId=${selectedSubjectId}&topicId=${selectedQuestion.id}`);
                  }}
                  className="h-10 rounded-xl bg-chestnut hover:bg-chestnut/90 text-white px-4 flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  View in List
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewQuestions;
