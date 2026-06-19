import TitleBar from "@/shared/title-bar";
import { Button, Dialog, DialogContent, DialogTitle, Label } from "@bluethub/ui-kit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, CheckSquare, ClipboardCopy, Loader2, Square } from "lucide-react";
import { schoolService } from "@/services/school";
import {
  questionService,
  type SubjectQuestionSummaryResponseData,
  type QuestionSummaryDto,
} from "@/services/question";
import { quizService, type CreateQuizResponse } from "@/services/quiz";
import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";

interface ApiItem {
  id: string;
  name: string;
}

interface TeacherAssignment {
  classroomId: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

interface SubTopicChip {
  id: string;
  name: string;
  topicId: string;
  topicName: string;
  questionCount: number;
}

const ADMIN_ROLES = ["SuperAdministrator", "Administrator"];

const SelectField = ({
  label,
  value,
  items,
  placeholder,
  onChange,
  disabled,
  loading,
}: {
  label: string;
  value?: string;
  items: ApiItem[];
  placeholder: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
      {label}
    </Label>
    <select
      value={value ?? ""}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-chestnut/15 focus:border-chestnut disabled:opacity-50"
    >
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

const GenerateQuiz = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading, refreshUser } = useAuthContext();
  const isAdmin = ADMIN_ROLES.includes(user?.roleName ?? "");

  // ── filters ────────────────────────────────────────────────────────────────
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(
    searchParams.get("classroomId") ?? undefined,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(
    searchParams.get("subjectId") ?? undefined,
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(
    searchParams.get("topicId") ?? undefined,
  );
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | undefined>(
    searchParams.get("subTopicId") ?? undefined,
  );

  // ── data ───────────────────────────────────────────────────────────────────
  const [classrooms, setClassrooms] = useState<ApiItem[]>([]);
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [subjects, setSubjects] = useState<ApiItem[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [summary, setSummary] = useState<SubjectQuestionSummaryResponseData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionSummaryDto[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // ── selection ──────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── quiz generation ────────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [quizResult, setQuizResult] = useState<CreateQuizResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // ── derived ────────────────────────────────────────────────────────────────
  const selectedSubjectName = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId)?.name,
    [subjects, selectedSubjectId],
  );
  const selectedClassName = useMemo(
    () => classrooms.find((c) => c.id === selectedClassId)?.name,
    [classrooms, selectedClassId],
  );
  const topics = useMemo(() => summary?.topics ?? [], [summary]);
  const subtopics = useMemo<SubTopicChip[]>(() => {
    const filtered = selectedTopicId
      ? topics.filter((t) => t.topicId === selectedTopicId)
      : topics;
    return filtered.flatMap((t) =>
      (t.subTopics ?? []).map((s) => ({
        id: s.subTopicId,
        name: s.subTopicName,
        topicId: t.topicId,
        topicName: t.topicName,
        questionCount: s.questionCount,
      })),
    );
  }, [topics, selectedTopicId]);

  // ── fetch questions ────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(
    (cId: string, sId: string, tId?: string, stId?: string) => {
      if (!tId) {
        setQuestions([]);
        return;
      }
      setQuestionsLoading(true);
      setSelectedIds(new Set());
      questionService
        .getQuestionsByClassroomSubjectTopic(cId, sId, tId, {
          page: 1,
          pageSize: 100,
          subTopicIds: stId ? [stId] : [],
        })
        .then((res) => {
          const raw = res.data as any;
          const payload = raw.data ?? raw.dat ?? raw;
          const items =
            (raw.questions ?? raw.dat?.questions ?? payload?.questions ?? []) as QuestionSummaryDto[];
          setQuestions(items);
        })
        .catch(() => {
          setQuestions([]);
          toast.error("Failed to fetch questions");
        })
        .finally(() => setQuestionsLoading(false));
    },
    [],
  );

  // ── load user / classrooms ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAdmin) void refreshUser();
  }, [authLoading, isAdmin]);

  useEffect(() => {
    if (!user?.id) return;
    if (isAdmin) {
      setClassroomsLoading(true);
      schoolService
        .getAllClassRooms()
        .then((res) => {
          const raw = (res.data as any)?.data?.classrooms ?? [];
          const next: ApiItem[] = raw.map((c: any) => ({ id: String(c.id), name: String(c.name) }));
          setClassrooms(next);
          setSelectedClassId((prev) => {
            if (prev && next.some((c) => c.id === prev)) return prev;
            return next[0]?.id;
          });
        })
        .catch(() => toast.error("Failed to load classrooms"))
        .finally(() => setClassroomsLoading(false));
      return;
    }

    setClassroomsLoading(true);
    const roleData = user?.roleData;
    const roleClassrooms = roleData && isTeacherRoleData(roleData) ? roleData.classrooms : [];
    const pairs: TeacherAssignment[] = [];
    const uniqueClassrooms = new Map<string, ApiItem>();
    for (const [i, c] of (roleClassrooms ?? []).entries()) {
      if (!c?.classroomId) continue;
      const cName = String(c.className ?? `Classroom ${i + 1}`);
      uniqueClassrooms.set(String(c.classroomId), { id: String(c.classroomId), name: cName });
      for (const s of c.subjects ?? []) {
        if (!s?.subjectId || !s?.subjectName) continue;
        pairs.push({ classroomId: String(c.classroomId), className: cName, subjectId: String(s.subjectId), subjectName: String(s.subjectName) });
      }
    }
    const next = Array.from(uniqueClassrooms.values());
    setTeacherAssignments(pairs);
    setClassrooms(next);
    setSelectedClassId((prev) => {
      if (prev && next.some((c) => c.id === prev)) return prev;
      return next[0]?.id;
    });
    setClassroomsLoading(false);
  }, [isAdmin, user?.id, user?.roleData]);

  // ── load subjects when classroom changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      setSelectedSubjectId(undefined);
      setSummary(null);
      setQuestions([]);
      return;
    }
    setSelectedTopicId(undefined);
    setSelectedSubTopicId(undefined);
    setSummary(null);
    setQuestions([]);
    setSubjectsLoading(true);

    if (isAdmin) {
      schoolService
        .getSubjectsByClassroomId(selectedClassId)
        .then((res) => {
          const data = (res.data as any)?.data;
          const flat = [...(data?.majorSubjects ?? []), ...(data?.minorSubjects ?? [])];
          const next: ApiItem[] = flat.map((s: any) => ({
            id: String(s.subjectId ?? s.id),
            name: String(s.subjectName ?? s.name),
          }));
          setSubjects(next);
          setSelectedSubjectId((prev) => {
            if (prev && next.some((s) => s.id === prev)) return prev;
            return next[0]?.id;
          });
        })
        .catch(() => toast.error("Failed to load subjects"))
        .finally(() => setSubjectsLoading(false));
      return;
    }

    const classSubjects = teacherAssignments
      .filter((a) => a.classroomId === selectedClassId)
      .reduce<ApiItem[]>((acc, item) => {
        if (!acc.some((x) => x.id === item.subjectId))
          acc.push({ id: item.subjectId, name: item.subjectName });
        return acc;
      }, []);
    setSubjects(classSubjects);
    setSelectedSubjectId((prev) => {
      if (prev && classSubjects.some((s) => s.id === prev)) return prev;
      return classSubjects[0]?.id;
    });
    setSubjectsLoading(false);
  }, [isAdmin, selectedClassId, teacherAssignments]);

  // ── load summary when subject changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) { setSummary(null); return; }
    setSummaryLoading(true);
    questionService
      .getSubjectQuestionSummary(selectedClassId, selectedSubjectId)
      .then((res) => {
        const raw = res.data as any;
        setSummary(raw?.data ?? raw?.dat ?? null);
      })
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, [selectedClassId, selectedSubjectId]);

  // ── fetch questions when filters change ────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId || !selectedSubjectId) { setQuestions([]); return; }
    fetchQuestions(selectedClassId, selectedSubjectId, selectedTopicId, selectedSubTopicId);
  }, [selectedClassId, selectedSubjectId, selectedTopicId, selectedSubTopicId, fetchQuestions]);

  // ── selection helpers ──────────────────────────────────────────────────────
  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)));
    }
  };

  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  // ── generate quiz ──────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one question");
      return;
    }
    setGenerating(true);
    try {
      const res = await quizService.createQuiz(Array.from(selectedIds));
      const raw = res.data as any;
      const data = raw?.data ?? raw?.dat ?? raw;
      setQuizResult({
        quizCode: data?.quizCode ?? data?.QuizCode ?? "",
        questionCount: data?.questionCount ?? data?.QuestionCount ?? selectedIds.size,
        createdAt: data?.createdAt ?? data?.CreatedAt ?? new Date().toISOString(),
      });
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!quizResult?.quizCode) return;
    try {
      await navigator.clipboard.writeText(quizResult.quizCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="sm:p-5 font-poppins">
      <div className="lg:rounded-2xl border border-white/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <TitleBar title="Generate Quiz" hasVertical hasBackIcons onBack={() => navigate(-1)} />

        <div className="p-3 sm:p-5 lg:p-7 space-y-4 sm:space-y-5">

          {/* ── Header card ── */}
          <div className="rounded-2xl bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] border border-[#f3dccb] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-chestnut leading-tight">
                  {selectedSubjectName ?? "Generate Quiz"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {selectedClassName
                    ? `${selectedClassName} — select questions then generate a quiz code`
                    : "Select a class and subject to browse questions"}
                </p>
              </div>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  disabled={generating}
                  onClick={handleGenerate}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-chestnut px-4 py-2.5 text-sm font-semibold text-white hover:bg-chestnut/90 disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Generate Quiz ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Class"
              value={selectedClassId}
              items={classrooms}
              placeholder="Select class"
              onChange={setSelectedClassId}
              loading={classroomsLoading}
            />
            <SelectField
              label="Subject"
              value={selectedSubjectId}
              items={subjects}
              placeholder={selectedClassId ? "Select subject" : "Select class first"}
              onChange={setSelectedSubjectId}
              disabled={!selectedClassId}
              loading={subjectsLoading}
            />
          </div>

          {/* ── Topic chips ── */}
          {topics.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-slate-700">Topics</h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedTopicId(undefined); setSelectedSubTopicId(undefined); }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${!selectedTopicId ? "bg-chestnut text-white border-chestnut" : "bg-white text-slate-600 border-slate-200 hover:border-chestnut/40"}`}
                  >
                    All topics
                  </button>
                  {topics.map((t) => (
                    <button
                      key={t.topicId}
                      type="button"
                      onClick={() => { setSelectedTopicId(t.topicId); setSelectedSubTopicId(undefined); }}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${selectedTopicId === t.topicId ? "bg-chestnut text-white border-chestnut" : "bg-white text-slate-600 border-slate-200 hover:border-chestnut/40"}`}
                    >
                      {t.topicName} ({t.questionCount})
                    </button>
                  ))}
                </div>
              </div>

              {subtopics.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-slate-700">Subtopics</h2>
                    {summaryLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSubTopicId(undefined)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${!selectedSubTopicId ? "bg-chestnut text-white border-chestnut" : "bg-white text-slate-600 border-slate-200 hover:border-chestnut/40"}`}
                    >
                      All
                    </button>
                    {subtopics.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSubTopicId(s.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${selectedSubTopicId === s.id ? "bg-chestnut text-white border-chestnut" : "bg-white text-slate-600 border-slate-200 hover:border-chestnut/40"}`}
                      >
                        {s.name} ({s.questionCount})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Questions list ── */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={questions.length === 0}
                  className="text-slate-500 hover:text-chestnut disabled:opacity-30 transition-colors"
                  title={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <CheckSquare className="w-5 h-5 text-chestnut" />
                  ) : someSelected ? (
                    <CheckSquare className="w-5 h-5 text-chestnut/50" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <h3 className="text-sm font-semibold text-slate-700">
                  Questions
                  {questions.length > 0 && (
                    <span className="ml-1.5 text-slate-400 font-normal">({questions.length})</span>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <span className="text-xs font-semibold text-chestnut bg-chestnut/10 px-2.5 py-1 rounded-full">
                    {selectedIds.size} selected
                  </span>
                )}
                {questionsLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
            </div>

            {!questionsLoading && !selectedClassId && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                Select a class and subject to load questions.
              </div>
            )}

            {!questionsLoading && selectedClassId && selectedSubjectId && !selectedTopicId && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                Select a topic above to load questions.
              </div>
            )}

            {!questionsLoading && selectedTopicId && questions.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No saved questions found for this selection.
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {questions.map((question, idx) => {
                const isSelected = selectedIds.has(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => toggleQuestion(question.id)}
                    className={`w-full text-left px-4 py-3 sm:py-4 transition-colors flex items-start gap-3 ${isSelected ? "bg-chestnut/5" : "hover:bg-slate-50"}`}
                  >
                    <span className="mt-0.5 shrink-0 text-chestnut">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400 font-medium">#{idx + 1}</p>
                          <p className="text-sm font-semibold text-slate-700 leading-5 mt-0.5 line-clamp-2">
                            {question.title || "Untitled question"}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {question.topicName || question.topic || "No topic"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {question.questionTypeName || `Type ${question.questionType}`}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                            {question.difficultyLevelName || `Level ${question.difficultyLevel}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Mobile generate button ── */}
          {selectedIds.size > 0 && (
            <div className="sm:hidden">
              <Button
                type="button"
                disabled={generating}
                onClick={handleGenerate}
                className="w-full h-11 rounded-xl bg-chestnut hover:bg-chestnut/90 text-white font-semibold"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Generate Quiz ({selectedIds.size} questions)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Success dialog ── */}
      <Dialog open={!!quizResult} onOpenChange={(open) => { if (!open) setQuizResult(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff]">
            <DialogTitle className="text-base font-semibold text-slate-800">Quiz Created!</DialogTitle>
          </div>

          {quizResult && (
            <div className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
                  Quiz Code
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-bold tracking-[0.2em] text-chestnut font-mono">
                    {quizResult.quizCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-chestnut transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ClipboardCopy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 text-center">
                {quizResult.questionCount} question{quizResult.questionCount !== 1 ? "s" : ""} included.
                Share this code with students to start the quiz.
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 h-10 rounded-xl border border-chestnut text-chestnut bg-white hover:bg-chestnut/5 font-semibold text-sm"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setQuizResult(null)}
                  className="flex-1 h-10 rounded-xl bg-chestnut hover:bg-chestnut/90 text-white font-semibold text-sm"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenerateQuiz;
