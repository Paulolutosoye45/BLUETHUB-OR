import TitleBar from "@/shared/title-bar";
import QuizBoard, { type BoardQuestionResult } from "./quiz-board";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Label,
  Input,
  Textarea,
} from "@bluethub/ui-kit";
import {
  Check,
  ChevronDown,
  ImagePlus,
  Loader2,
  PenTool,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  questionService,
  QuestionTypeEnum,
  type CreateOptionPayload,
} from "@/services/question";
import { schoolService } from "@/services/school";
import { lessonService, LessonMediaType } from "@/services/lesson";
import { useAuthContext } from "@/contexts/auth-context";
import { authService } from "@/services/auth";

// ── Types ──────────────────────────────────────────────────────────────────
type QuestionType = "Multiple Choice" | "Single Choice" | "True/False" | "Short Answer" | "Essay";

interface Option {
  key: string;
  value: string;
}

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

interface QuestionDraft {
  id: string;
  draftType: "text" | "board";
  questionType: QuestionType;
  question: string;
  options: Option[];
  correctAnswers: string[];
  difficultyLevel: number;
  imagePreview: string | null;
  imageFile: File | null;
  isSubmitting: boolean;
  isPublished: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────
const QUESTION_TYPES: QuestionType[] = [
  "Multiple Choice",
  "Single Choice",
  "True/False",
  "Short Answer",
  "Essay",
];

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const ADMIN_ROLES = ["SuperAdministrator", "Administrator"];

const DIFFICULTY_META = [
  { label: "Easy", color: "text-emerald-500", fill: "#10b981" },
  { label: "Medium", color: "text-amber-400", fill: "#fbbf24" },
  { label: "Hard", color: "text-orange-500", fill: "#f97316" },
  { label: "Expert", color: "text-red-500", fill: "#ef4444" },
];

const createDraft = (): QuestionDraft => ({
  id: crypto.randomUUID(),
  draftType: "text",
  questionType: "Multiple Choice",
  question: "",
  options: [
    { key: "A", value: "" },
    { key: "B", value: "" },
    { key: "C", value: "" },
    { key: "D", value: "" },
  ],
  correctAnswers: [],
  difficultyLevel: 0,
  imagePreview: null,
  imageFile: null,
  isSubmitting: false,
  isPublished: false,
});

const getCreateQuestionMeta = (res: unknown) => {
  const raw = (res as any) ?? {};
  const data = raw?.data ?? {};
  const questionId = raw?.questionId ?? raw?.id ?? data?.questionId ?? data?.id ?? null;
  const isDuplicate = !!(raw?.isDuplicate ?? data?.isDuplicate);
  const status = String(raw?.status ?? data?.status ?? "").toLowerCase();
  const responseCode = String(raw?.responseCode ?? data?.responseCode ?? "").toLowerCase();
  const responseMessage = raw?.responseMessage ?? data?.responseMessage ?? "";
  const isSuccessful = status === "successful" || responseCode === "successful" || !!questionId || isDuplicate;

  return {
    questionId,
    isDuplicate,
    status,
    responseCode,
    responseMessage,
    isSuccessful,
  };
};

// ── SelectDropdown ─────────────────────────────────────────────────────────
const SelectDropdown = ({
  value,
  options,
  placeholder,
  onSelect,
  className = "",
}: {
  value: string | undefined;
  options: string[];
  placeholder: string;
  onSelect: (v: string) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-between font-Poppins text-sm font-medium py-5 px-4 rounded-lg border border-black/20 hover:border-chestnut transition-all duration-200 ${value ? "text-chestnut" : "text-[#9A9A9A]"
            } ${className}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-300 ${open ? "rotate-180" : ""
              }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] rounded-lg border border-black/10 shadow-lg bg-white/95 backdrop-blur-sm p-1.5"
        align="start"
        sideOffset={6}
      >
        <DropdownMenuGroup className="space-y-0.5">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              className={`font-Poppins text-sm font-medium py-2.5 px-3.5 rounded-md cursor-pointer transition-all duration-150 ${value === opt
                  ? "bg-indigo-50 text-indigo-500"
                  : "text-slate-600 hover:bg-slate-50"
                }`}
              onClick={() => onSelect(opt)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{opt}</span>
                {value === opt && (
                  <Check className="w-3.5 h-3.5 ml-2 text-emerald-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── ApiDropdown ────────────────────────────────────────────────────────────
const ApiDropdown = ({
  value,
  items,
  placeholder,
  onSelect,
  loading = false,
  disabled = false,
  className = "",
}: {
  value: string | undefined;
  items: ApiItem[];
  placeholder: string;
  onSelect: (item: ApiItem) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);

  return (
    <DropdownMenu onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled || loading}>
        <Button
          variant="outline"
          className={`w-full justify-between font-Poppins text-sm font-medium py-5 px-4 rounded-lg border border-black/20 hover:border-chestnut transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selected ? "text-chestnut" : "text-[#9A9A9A]"
            } ${className}`}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading...
            </span>
          ) : (
            <span className="truncate">{selected?.name || placeholder}</span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-300 ${open ? "rotate-180" : ""
              }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto rounded-lg border border-black/10 shadow-lg bg-white/95 backdrop-blur-sm p-1.5"
        align="start"
        sideOffset={6}
      >
        <DropdownMenuGroup className="space-y-0.5">
          {items.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400 font-Poppins">
              No options available
            </div>
          ) : (
            items.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={`font-Poppins text-sm font-medium py-2.5 px-3.5 rounded-md cursor-pointer transition-all duration-150 ${value === item.id
                    ? "bg-indigo-50 text-indigo-500"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
                onClick={() => onSelect(item)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {value === item.id && (
                    <Check className="w-3.5 h-3.5 ml-2 text-emerald-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ── StarPicker ─────────────────────────────────────────────────────────────
const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (level: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const meta = active ? DIFFICULTY_META[active - 1] : null;

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-chestnut">Difficulty Level:</Label>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4].map((level) => {
            const lit = level <= active;
            const levelMeta = DIFFICULTY_META[level - 1];
            return (
              <button
                key={level}
                type="button"
                onClick={() => onChange(level)}
                onMouseEnter={() => setHovered(level)}
                title={levelMeta.label}
                className="cursor-pointer transition-transform duration-100 hover:scale-110 active:scale-95 p-0.5"
              >
                <Star
                  size={28}
                  strokeWidth={1.5}
                  fill={lit ? levelMeta.fill : "none"}
                  color={lit ? levelMeta.fill : "#cbd5e1"}
                />
              </button>
            );
          })}
        </div>

        {/* Label pill */}
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full transition-all duration-200 ${meta
              ? `${meta.color} bg-current/10`
              : "text-slate-300"
            }`}
          style={meta ? { backgroundColor: `${meta.fill}18` } : {}}
        >
          {meta ? meta.label : "Select difficulty"}
        </span>
      </div>
    </div>
  );
};

// ── QuestionCard ───────────────────────────────────────────────────────────
const QuestionCard = ({
  draft,
  index,
  canDelete,
  onDelete,
  onUpdate,
}: {
  draft: QuestionDraft;
  index: number;
  canDelete: boolean;
  onDelete: () => void;
  onUpdate: (updates: Partial<QuestionDraft>) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showOptions = draft.questionType === "Multiple Choice" || draft.questionType === "Single Choice";
  const singleChoiceMode = draft.questionType === "Single Choice";
  const showTrueFalse = draft.questionType === "True/False";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onUpdate({ imagePreview: reader.result as string, imageFile: file });
    reader.readAsDataURL(file);
    // reset so same file can be re-picked
    e.target.value = "";
  };

  const updateOption = (key: string, val: string) =>
    onUpdate({
      options: draft.options.map((o) => (o.key === key ? { ...o, value: val } : o)),
    });

  const addOption = () => {
    const keys = ["A", "B", "C", "D", "E", "F"];
    const next = keys[draft.options.length];
    if (!next) return;
    onUpdate({ options: [...draft.options, { key: next, value: "" }] });
  };

  const removeOption = (key: string) => {
    if (draft.options.length <= 2) return;
    onUpdate({
      options: draft.options.filter((o) => o.key !== key),
      correctAnswers: draft.correctAnswers.filter((k) => k !== key),
    });
  };

  const toggleCorrectAnswer = (key: string) =>
    onUpdate({
      correctAnswers: singleChoiceMode
        ? (draft.correctAnswers.includes(key) ? [] : [key])
        : (draft.correctAnswers.includes(key)
          ? draft.correctAnswers.filter((k) => k !== key)
          : [...draft.correctAnswers, key]),
    });

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${draft.isPublished
          ? "border-emerald-300 bg-emerald-50/30"
          : "border-[#29238280]"
        }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#D9D9D9] bg-white/60">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${draft.isPublished
                ? "bg-emerald-500 text-white"
                : "bg-chestnut/10 text-chestnut"
              }`}
          >
            {draft.isPublished ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : index + 1}
          </span>
          <h2 className="font-semibold text-chestnut text-sm sm:text-base tracking-tight">
            {draft.isPublished ? "Published" : `Question ${index + 1}`}
          </h2>
        </div>

        {/* Header actions */}
        {!draft.isPublished && canDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
          >
            <X size={14} />
            <span className="hidden sm:inline">Remove</span>
          </button>
        )}
        {draft.isPublished && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
            ✓ Saved
          </span>
        )}
      </div>

      {/* Card Body */}
      {!draft.isPublished && (
        <div className="flex flex-col gap-5 p-4 sm:p-6">
          {/* Question Type */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Label className="font-medium text-sm text-chestnut whitespace-nowrap sm:w-32 shrink-0">
              Question Type:
            </Label>
            <div className="w-full sm:w-52">
              <SelectDropdown
                value={draft.questionType}
                options={QUESTION_TYPES}
                placeholder="Select type"
                onSelect={(v) =>
                  onUpdate({ questionType: v as QuestionType, correctAnswers: [] })
                }
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-chestnut">Question:</Label>
            <Textarea
              value={draft.question}
              onChange={(e) => onUpdate({ question: e.target.value })}
              placeholder="Type your question here..."
              rows={3}
              className="w-full px-4 py-3 text-sm text-slate-700 font-medium placeholder:text-slate-300 bg-white border border-black/15 rounded-xl resize-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all duration-200"
            />
          </div>

          {/* ── Image upload (optional) ── */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <ImagePlus size={14} className="text-indigo-400 shrink-0" />
                <span className="text-sm font-semibold text-indigo-600">
                  Attach Image
                </span>
                <span className="text-[11px] text-indigo-300 font-medium">optional</span>
              </div>
              {draft.imagePreview && (
                <button
                  type="button"
                  onClick={() => onUpdate({ imagePreview: null, imageFile: null })}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-600 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <div className="p-3">
              {draft.imagePreview ? (
                <div
                  className="w-full rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden"
                  style={{ height: 200 }}
                >
                  <img
                    src={draft.imagePreview}
                    alt="Uploaded"
                    style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", display: "block" }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-lg border-2 border-dashed border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer"
                >
                  <ImagePlus size={28} className="text-indigo-300" />
                  <span className="text-sm font-semibold text-indigo-400">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</span>
                </button>
              )}
            </div>
          </div>

          {/* Difficulty */}
          <StarPicker
            value={draft.difficultyLevel}
            onChange={(level) => onUpdate({ difficultyLevel: level })}
          />

          {/* Options (optional for all types) */}
          {showOptions && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-chestnut">Options:</Label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {singleChoiceMode
                    ? "Select one correct answer"
                    : "Tick checkbox to mark correct answer(s)"}
                </span>
              </div>

              {draft.options.map((opt) => {
                const isCorrect = draft.correctAnswers.includes(opt.key);
                return (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-1 transition-all duration-200 ${isCorrect ? "border-emerald-400 bg-emerald-50" : "border-black/10 bg-white"
                      }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCorrectAnswer(opt.key)}
                      className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 cursor-pointer ${isCorrect
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-slate-300 bg-white hover:border-emerald-400"
                        }`}
                      title="Mark as correct"
                    >
                      {isCorrect && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </button>

                    {/* Key badge */}
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {opt.key}
                    </span>

                    {/* Input */}
                    <div className="flex-1 relative group">
                      <Input
                        value={opt.value}
                        onChange={(e) => updateOption(opt.key, e.target.value)}
                        placeholder={`Enter option ${opt.key}`}
                        className="w-full px-3 py-4 text-sm text-slate-700 font-medium placeholder:text-slate-300 border-0 bg-transparent focus:ring-0 outline-none pr-8"
                      />
                      {draft.options.length > 2 && (
                        <button
                          onClick={() => removeOption(opt.key)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all duration-150 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {draft.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="self-start flex items-center gap-1.5 text-xs font-semibold text-chestnut mt-1 hover:text-chestnut/70 transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  Add option
                </button>
              )}
            </div>
          )}

          {/* True/False */}
          {showTrueFalse && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-chestnut">
                Select correct answer:
              </Label>
              <div className="flex items-center gap-3">
                {["True", "False"].map((opt) => {
                  const isCorrect = draft.correctAnswers.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => onUpdate({ correctAnswers: [opt] })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 cursor-pointer ${isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                        }`}
                    >
                      {isCorrect && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// ── BoardDraftCard ─────────────────────────────────────────────────────────
const BoardDraftCard = ({
  draft,
  index,
  canDelete,
  onDelete,
  onBoardSaved,
  isSubmitting,
}: {
  draft: QuestionDraft;
  index: number;
  canDelete: boolean;
  onDelete: () => void;
  onBoardSaved: (result: BoardQuestionResult) => void;
  isSubmitting: boolean;
}) => (
  <div
    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      draft.isPublished
        ? "border-emerald-300 bg-emerald-50/30"
        : "border-emerald-500/40"
    }`}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-[#D9D9D9] bg-white/60">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
            draft.isPublished
              ? "bg-emerald-500 text-white"
              : "bg-emerald-600/10 text-emerald-700"
          }`}
        >
          {draft.isPublished ? (
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          ) : (
            <PenTool size={13} />
          )}
        </span>
        <div>
          <h2 className="font-semibold text-chestnut text-sm sm:text-base tracking-tight">
            {draft.isPublished ? "Board Question Saved" : `Board Question ${index + 1}`}
          </h2>
          {!draft.isPublished && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Draw on the canvas · set options · click Save
            </p>
          )}
        </div>
      </div>
      {!draft.isPublished && canDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
        >
          <X size={14} />
          <span className="hidden sm:inline">Remove</span>
        </button>
      )}
      {draft.isPublished && (
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
          ✓ Saved
        </span>
      )}
    </div>

    {!draft.isPublished && (
      <div className="p-4 sm:p-6">
        <QuizBoard
          onCancel={onDelete}
          onSaved={onBoardSaved}
          isSubmitting={isSubmitting}
        />
      </div>
    )}
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const CreateQuizQuestion = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const isAdmin = ADMIN_ROLES.includes(user?.roleName ?? "");

  // ── Multi-draft state ───────────────────────────────────────────────────
  const [drafts, setDrafts] = useState<QuestionDraft[]>([createDraft()]);
  const [isPublishingAll, setIsPublishingAll] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{ done: number; total: number } | null>(null);
  const [boardSubmitting, setBoardSubmitting] = useState(false);

  // ── Admin context state ─────────────────────────────────────────────────
  const [classrooms, setClassrooms] = useState<ApiItem[]>([]);
  const [subjects, setSubjects] = useState<ApiItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>();
  const [topics, setTopics] = useState<ApiItem[]>([]);
  const [subtopics, setSubtopics] = useState<ApiItem[]>([]);
  const [topicsData, setTopicsData] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>();
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string>();
  const [adminTopic, setAdminTopic] = useState("");
  const [adminTopicId, setAdminTopicId] = useState("");
  const [adminSubTopic, setAdminSubTopic] = useState("");
  const [classroomsLoading, setClassroomsLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);

  // ── URL params (teacher flow) ───────────────────────────────────────────
  const classIdParam = searchParams.get("classroomId") ?? "";
  const subjectIdParam = searchParams.get("subjectId") ?? "";
  const topicIdParam = searchParams.get("topicId") ?? "";
  const topicParam = searchParams.get("topic") ?? "";
  const subTopicParam = searchParams.get("subTopic") ?? EMPTY_GUID;
  const boardSessionId = searchParams.get("boardSessionId") ?? "";
  const scanSessionId = searchParams.get("scanSessionId") ?? "";

  const selectedTopicName = topics.find((t) => t.id === selectedTopicId)?.name;

  const effectiveSubjectId = selectedSubjectId ?? "";
  const effectiveTopicId = selectedTopicId ?? (isAdmin ? adminTopicId || null : topicIdParam || null);
  const effectiveTopic = selectedTopicName ?? (isAdmin ? adminTopic : topicParam);
  const resolvedTopicName =
    (effectiveTopic ||
      selectedTopicName ||
      topics.find((t) => t.id === effectiveTopicId)?.name ||
      topicParam ||
      adminTopic ||
      "")
      .trim();
  const effectiveSubTopic = selectedSubTopicId ?? (isAdmin ? adminSubTopic || EMPTY_GUID : subTopicParam);
  const hasSubTopicContext = !!effectiveSubTopic && effectiveSubTopic !== EMPTY_GUID;

  // ── Load teacher assignment pairs (non-admin flow) ──────────────────────
  useEffect(() => {
    if (isAdmin || !user?.id) return;

    setClassroomsLoading(true);
    setSubjectsLoading(true);

    authService
      .getUserById(user.id)
      .then((res) => {
        const roleData = (res.data as any)?.data?.roleData;
        const roleClassrooms: any[] = roleData?.classrooms ?? [];

        const pairs: TeacherAssignment[] = [];
        const uniqueClassrooms = new Map<string, ApiItem>();

        for (const [index, c] of roleClassrooms.entries()) {
          if (!c?.classroomId) continue;
          const classroomName = String(c.className ?? `Classroom ${index + 1}`);
          uniqueClassrooms.set(c.classroomId, { id: c.classroomId, name: classroomName });

          for (const s of c.subjects ?? []) {
            if (!s?.subjectId || !s?.subjectName) continue;
            pairs.push({
              classroomId: c.classroomId,
              className: classroomName,
              subjectId: s.subjectId,
              subjectName: s.subjectName,
            });
          }
        }

        setTeacherAssignments(pairs);
        setClassrooms(Array.from(uniqueClassrooms.values()));

        // Default class and subject from query params if available, else first assigned
        const classForSubject = subjectIdParam
          ? pairs.find((p) => p.subjectId === subjectIdParam)
          : undefined;

        const initialClassId = classIdParam || classForSubject?.classroomId || pairs[0]?.classroomId;
        const initialSubjectId =
          subjectIdParam ||
          pairs.find((p) => p.classroomId === initialClassId && p.subjectId === subjectIdParam)?.subjectId ||
          pairs.find((p) => p.classroomId === initialClassId)?.subjectId ||
          pairs[0]?.subjectId;

        if (initialClassId) setSelectedClassId(initialClassId);
        if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
      })
      .catch(() => toast.error("Failed to load your class/subject assignments"))
      .finally(() => {
        setClassroomsLoading(false);
        setSubjectsLoading(false);
      });
  }, [isAdmin, user?.id, classIdParam, subjectIdParam]);

  // ── Fetch classrooms for admin ──────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    setClassroomsLoading(true);
    schoolService
      .getAllClassRooms()
      .then((res) => {
        const raw: { id: string; name: string }[] =
          (res.data as any)?.data?.classrooms ?? [];
        const nextClassrooms = raw.map((c) => ({ id: c.id, name: c.name }));
        setClassrooms(nextClassrooms);

        if (classIdParam && nextClassrooms.some((c) => c.id === classIdParam)) {
          setSelectedClassId(classIdParam);
        }
      })
      .catch(() => toast.error("Failed to load classrooms"))
      .finally(() => setClassroomsLoading(false));
  }, [isAdmin, classIdParam]);

  // ── Fetch subjects when class changes ───────────────────────────────────
  useEffect(() => {
    if (!isAdmin || !selectedClassId) return;
    setSelectedSubjectId(undefined);
    setSubjects([]);
    setSubjectsLoading(true);
    schoolService
      .getSubjectsByClassroomId(selectedClassId)
      .then((res) => {
        const raw: { id: string; name: string }[] =
          (res.data as any)?.data?.subjects ??
          (res.data as any)?.data ??
          [];
        const nextSubjects = raw.map((s) => ({ id: s.id, name: s.name }));
        setSubjects(nextSubjects);

        if (subjectIdParam && nextSubjects.some((s) => s.id === subjectIdParam)) {
          setSelectedSubjectId(subjectIdParam);
        } else if (nextSubjects[0]) {
          setSelectedSubjectId(nextSubjects[0].id);
        }
      })
      .catch(() => toast.error("Failed to load subjects"))
      .finally(() => setSubjectsLoading(false));
  }, [isAdmin, selectedClassId, subjectIdParam]);

  // ── Fetch topics when subject changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([]);
      setSubtopics([]);
      setTopicsData([]);
      setSelectedTopicId(undefined);
      setSelectedSubTopicId(undefined);
      return;
    }

    setSelectedTopicId(undefined);
    setSelectedSubTopicId(undefined);
    setSubtopics([]);
    setTopicsData([]);
    setTopicsLoading(true);

    schoolService
      .getSubjectCurriculum(selectedSubjectId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const rawTopics: any[] = raw.Topics ?? raw.topics ?? [];
        const nextTopics: ApiItem[] = rawTopics.map((t: any) => ({
          id: String(t.Id ?? t.id ?? t.topicId),
          name: String(t.Name ?? t.name ?? t.topicName ?? ""),
        }));

        setTopicsData(rawTopics);
        setTopics(nextTopics);

        if (topicIdParam && nextTopics.some((t) => t.id === topicIdParam)) {
          setSelectedTopicId(topicIdParam);
        }
      })
      .catch(() => toast.error("Failed to load topics"))
      .finally(() => setTopicsLoading(false));
  }, [selectedSubjectId, topicIdParam]);

  // ── Populate subtopics from selected topic (submit-lesson pattern) ──────
  useEffect(() => {
    if (!selectedTopicId) {
      setSubtopics([]);
      setSelectedSubTopicId(undefined);
      return;
    }

    setSelectedSubTopicId(undefined);
    setSubtopicsLoading(true);

    const matchedTopic = topicsData.find(
      (t: any) => String(t.Id ?? t.id ?? t.topicId) === selectedTopicId,
    );
    const nextSubtopics: ApiItem[] = (matchedTopic?.SubTopics ?? matchedTopic?.subTopics ?? []).map((s: any) => ({
      id: String(s.Id ?? s.id ?? s.subTopicId),
      name: String(s.Name ?? s.name ?? s.subTopicName ?? ""),
    }));

    setSubtopics(nextSubtopics);
    if (subTopicParam && nextSubtopics.some((s) => s.id === subTopicParam)) {
      setSelectedSubTopicId(subTopicParam);
    }
    setSubtopicsLoading(false);
  }, [selectedTopicId, subTopicParam, topicsData]);

  // ── Filter subjects by selected class for teacher flow ──────────────────
  useEffect(() => {
    if (isAdmin || !selectedClassId) return;

    const classSubjects = teacherAssignments
      .filter((a) => a.classroomId === selectedClassId)
      .reduce<ApiItem[]>((acc, a) => {
        if (!acc.some((x) => x.id === a.subjectId)) {
          acc.push({ id: a.subjectId, name: a.subjectName });
        }
        return acc;
      }, []);

    setSubjects(classSubjects);

    if (!classSubjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(classSubjects[0]?.id);
    }
  }, [isAdmin, selectedClassId, teacherAssignments, selectedSubjectId]);

  // ── Draft helpers ───────────────────────────────────────────────────────
  const updateDraft = (id: string, updates: Partial<QuestionDraft>) =>
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );

  const addDraft = () => setDrafts((prev) => [...prev, createDraft()]);

  const addBoardDraft = () =>
    setDrafts((prev) => [...prev, { ...createDraft(), id: crypto.randomUUID(), draftType: "board" }]);

  const deleteDraft = (id: string) =>
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      return next.length > 0 ? next : [createDraft()];
    });

  // ── Board question saved for a specific draft ────────────────────────────
  const handleBoardDraftSaved = async (draftId: string, result: BoardQuestionResult) => {
    if (!selectedClassId) { toast.error("Please select a class."); return; }
    if (!effectiveSubjectId) { toast.error("Please select a subject."); return; }
    if (!hasSubTopicContext) { toast.error("Please select a sub-topic."); return; }
    if (!resolvedTopicName) { toast.error("Please select a topic."); return; }

    setBoardSubmitting(true);
    try {
      const res = await questionService.createQuestion({
        clientId: crypto.randomUUID(),
        originDevice: "web",
        createdAtDevice: new Date().toISOString(),
        subjectId: effectiveSubjectId,
        topicId: effectiveTopicId,
        topic: resolvedTopicName,
        subTopic: effectiveSubTopic,
        title: result.questionText || "Board Question",
        textContent: result.questionText || "",
        questionType: QuestionTypeEnum.ImageBased,
        difficultyLevel: result.difficultyLevel,
        marksAllocation: 1,
        correctAnswer: null,
        options: result.options,
        snapshotUrl: result.imageUrl ?? null,
        snapshotPublicId: null,
        imageUrl: result.imageUrl,
        imagePublicId: null,
        boardSessionId: result.boardSessionId,
        scanSessionId: scanSessionId || null,
        isScanned: false,
        extractedQuestionIndex: null,
        aiConfidenceScore: null,
        classroomId: selectedClassId,
      });

      const meta = getCreateQuestionMeta(res.data);
      if (!meta.isSuccessful) {
        throw new Error(meta.responseMessage || "Question creation failed.");
      }

      if (!meta.isDuplicate) toast.success("Board question saved.");
      // Mark the board draft published; auto-remove after a moment
      updateDraft(draftId, { isPublished: true });
      setTimeout(() => {
        setDrafts((prev) => {
          const next = prev.filter((d) => d.id !== draftId);
          return next.length > 0 ? next : [createDraft()];
        });
      }, 1500);
    } catch (err) {
      const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
      toast.error(e?.response?.data?.responseMessage ?? e?.message ?? "Failed to publish board question.");
    } finally {
      setBoardSubmitting(false);
    }
  };
  // ── Helpers shared by publish flow ─────────────────────────────────────
  const toQuestionTypeEnum = (qt: QuestionType): number => {
    switch (qt) {
      case "Multiple Choice": return QuestionTypeEnum.MultipleChoice;
      case "Single Choice": return QuestionTypeEnum.MultipleChoice;
      case "True/False": return QuestionTypeEnum.TrueOrFalse;
      case "Short Answer": return QuestionTypeEnum.ShortAnswer;
      case "Essay": return QuestionTypeEnum.Essay;
      default: return QuestionTypeEnum.ShortAnswer;
    }
  };

  const buildOptionsPayload = (draft: QuestionDraft): CreateOptionPayload[] => {
    if (draft.questionType === "True/False") {
      return [
        { optionLabel: "A", optionText: "True", isCorrect: draft.correctAnswers.includes("True"), orderIndex: 1 },
        { optionLabel: "B", optionText: "False", isCorrect: draft.correctAnswers.includes("False"), orderIndex: 2 },
      ];
    }
    if (draft.questionType !== "Multiple Choice" && draft.questionType !== "Single Choice") return [];
    return draft.options.map((opt, idx) => ({
      optionLabel: opt.key,
      optionText: opt.value.trim(),
      isCorrect: draft.correctAnswers.includes(opt.key),
      orderIndex: idx + 1,
    }));
  };

  const validateDraft = (draft: QuestionDraft, num: number): string | null => {
    if (!draft.question.trim() && !draft.imagePreview)
      return `Question ${num}: Add a question or upload an image.`;
    const filledOptions = draft.options.filter((o) => o.value.trim());
    if (filledOptions.length > 0 && draft.correctAnswers.length === 0 && draft.questionType !== "True/False")
      return `Question ${num}: Tick at least one correct answer.`;
    if (draft.questionType === "Single Choice" && draft.correctAnswers.length > 1)
      return `Question ${num}: Single Choice allows only one correct answer.`;
    if (draft.questionType === "True/False" && draft.correctAnswers.length === 0)
      return `Question ${num}: Select True or False.`;
    if (draft.difficultyLevel === 0)
      return `Question ${num}: Select a difficulty level.`;
    return null;
  };

  // ── Cloudinary image upload ─────────────────────────────────────────────
  const uploadImage = async (file: File): Promise<string> => {
    const { data } = await lessonService.getUploadSignature(LessonMediaType.Image);
    const sig = data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    if (sig.uploadPreset) form.append("upload_preset", sig.uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) throw new Error("Image upload failed");
    const json = await res.json();
    return json.secure_url as string;
  };

  // ── Publish all unpublished drafts at once ──────────────────────────────
  const handlePublishAll = async () => {
    // Validate context
    if (!selectedClassId) {
      toast.error("Please select a class.");
      return;
    }

    if (!effectiveSubjectId) {
      toast.error("Please select a subject.");
      return;
    }

    if (!hasSubTopicContext) {
      toast.error("Please select a sub-topic.");
      return;
    }

    if (!resolvedTopicName) {
      toast.error("Please select a topic.");
      return;
    }

    const pending = drafts.filter((d) => !d.isPublished && d.draftType === "text");

    // Validate all drafts upfront
    for (let i = 0; i < pending.length; i++) {
      const err = validateDraft(pending[i], drafts.indexOf(pending[i]) + 1);
      if (err) { toast.error(err); return; }
    }

    setIsPublishingAll(true);
    setPublishProgress({ done: 0, total: pending.length });

    let successfulSaves = 0;
    const failedQuestionNumbers: number[] = [];

    for (let i = 0; i < pending.length; i++) {
      const draft = pending[i];
      updateDraft(draft.id, { isSubmitting: true });

      try {
        // Upload image first if present
        let imageUrl: string | null = null;
        if (draft.imageFile) {
          try {
            imageUrl = await uploadImage(draft.imageFile);
          } catch {
            toast.error(`Q${drafts.indexOf(draft) + 1}: Image upload failed — question skipped.`);
            failedQuestionNumbers.push(drafts.indexOf(draft) + 1);
            updateDraft(draft.id, { isSubmitting: false });
            setPublishProgress({ done: i + 1, total: pending.length });
            continue;
          }
        }

        const res = await questionService.createQuestion({
          clientId: crypto.randomUUID(),
          originDevice: "web",
          createdAtDevice: new Date().toISOString(),
          subjectId: effectiveSubjectId,
          topicId: effectiveTopicId,
          topic: resolvedTopicName,
          subTopic: effectiveSubTopic,
          title: draft.question.trim() || "Image Question",
          textContent: draft.question.trim(),
          questionType: draft.imagePreview
            ? QuestionTypeEnum.ImageBased
            : toQuestionTypeEnum(draft.questionType),
          difficultyLevel: draft.difficultyLevel,
          marksAllocation: 1,
          correctAnswer: null,
          options: buildOptionsPayload(draft),
          boardSessionId: boardSessionId || null,
          snapshotUrl: null,
          snapshotPublicId: null,
          scanSessionId: scanSessionId || null,
          isScanned: !!scanSessionId,
          extractedQuestionIndex: null,
          aiConfidenceScore: null,
          classroomId: selectedClassId,
          imageUrl,
          imagePublicId: null,
        });

        const meta = getCreateQuestionMeta(res.data);
        if (!meta.isSuccessful) {
          throw new Error(
            `Q${drafts.indexOf(draft) + 1}: ${meta.responseMessage || "Question creation failed."}`,
          );
        }

        const duplicate = meta.isDuplicate;
        updateDraft(draft.id, { isPublished: true, isSubmitting: false });
        // Count both new and duplicate responses as successful saves.
        successfulSaves++;
        if (duplicate) {
          toast.success(`Q${drafts.indexOf(draft) + 1}: already existed on server (linked successfully).`);
        }
      } catch (err) {
        const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
        failedQuestionNumbers.push(drafts.indexOf(draft) + 1);
        toast.error(
          `Q${drafts.indexOf(draft) + 1}: ${e?.response?.data?.responseMessage ?? e?.message ?? "Failed"}`
        );
        updateDraft(draft.id, { isSubmitting: false });
      }

      setPublishProgress({ done: i + 1, total: pending.length });
    }

    setIsPublishingAll(false);
    setPublishProgress(null);

    const failedCount = pending.length - successfulSaves;

    if (successfulSaves > 0) {
      // Remove published items from the list and keep only pending/failed drafts.
      setDrafts((prev) => {
        const remaining = prev.filter((d) => !d.isPublished);
        return remaining.length > 0 ? remaining : [createDraft()];
      });
    }

    if (successfulSaves > 0 && failedCount === 0) {
      toast.success("Questions created successfully");
    } else if (successfulSaves > 0 && failedCount > 0) {
      toast.success(`${successfulSaves} question${successfulSaves !== 1 ? "s" : ""} saved successfully.`);
      const failedList = failedQuestionNumbers.length > 0
        ? ` (Q${failedQuestionNumbers.join(", Q")})`
        : "";
      toast.error(
        `${failedCount} question${failedCount !== 1 ? "s were" : " was"} not saved successfully${failedList}. Data for failed question${failedCount !== 1 ? "s has" : " has"} been kept.`,
      );
    } else {
      toast.error("No question was saved successfully. Please fix and retry.");
    }
  };

  // ── Derived label ───────────────────────────────────────────────────────
  const selectedSubjectName = subjects.find((s) => s.id === selectedSubjectId)?.name;
  const selectedClassName = classrooms.find((c) => c.id === selectedClassId)?.name;
  const contextLabel =
    selectedSubjectName
      ? `${selectedClassName ? `${selectedClassName} — ` : ""}${selectedSubjectName}${adminTopic ? `: ${adminTopic}` : ""}`
      : topicParam || "Create Quiz Question";

  const unpublishedCount = drafts.filter((d) => !d.isPublished && d.draftType === "text").length;
  const canPublish = !!selectedClassId && !!effectiveSubjectId && hasSubTopicContext;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className=" sm:p-6 font-poppins">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden">
        <TitleBar title="question" hasVertical hasBackIcons onBack={() => navigate(-1)} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-white/70 backdrop-blur-sm">

          {/* ── Page Header ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <h1 className="text-chestnut font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                {contextLabel}
              </h1>
              <p className="text-[13px] text-[#7B7FA8] mt-1 font-normal">
                Upload questions to the Teacher&apos;s portal
              </p>
            </div>
            <Link
              to="/teacher/assessment/questionlist"
              className="inline-flex items-center justify-center self-start sm:self-auto bg-chestnut text-white text-sm font-semibold rounded-lg px-5 py-2.5 shadow-sm hover:-translate-y-0.5 transition-transform duration-150 whitespace-nowrap"
            >
              View Past Questions
            </Link>
          </div>

          <div className="h-px bg-[#29238280] w-full mb-5" />

          {/* ── Context Panel ── */}
              <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/40 overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 sm:px-5 py-3 border-b border-indigo-100 bg-indigo-50">
                  <div className="w-1 h-4 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-xs text-indigo-600 uppercase tracking-widest">
                    {isAdmin ? "Admin Context" : "Teaching Context"}
                  </h3>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        Class <span className="text-red-400">*</span>
                      </Label>
                      <ApiDropdown
                        value={selectedClassId}
                        items={classrooms}
                        placeholder="Select class"
                        onSelect={(item) => setSelectedClassId(item.id)}
                        loading={classroomsLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        Subject <span className="text-red-400">*</span>
                      </Label>
                      <ApiDropdown
                        value={selectedSubjectId}
                        items={subjects}
                        placeholder={selectedClassId ? "Select subject" : "Select class first"}
                        onSelect={(item) => setSelectedSubjectId(item.id)}
                        loading={subjectsLoading}
                        disabled={!selectedClassId}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        Topic <span className="text-red-400">*</span>
                      </Label>
                      <ApiDropdown
                        value={selectedTopicId}
                        items={topics}
                        placeholder={selectedSubjectId ? "Select topic" : "Select subject first"}
                        onSelect={(item) => setSelectedTopicId(item.id)}
                        loading={topicsLoading}
                        disabled={!selectedSubjectId}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                        Sub-topic <span className="text-red-400">*</span>
                      </Label>
                      <ApiDropdown
                        value={selectedSubTopicId}
                        items={subtopics}
                        placeholder={selectedTopicId ? "Select sub-topic" : "Select topic first"}
                        onSelect={(item) => setSelectedSubTopicId(item.id)}
                        loading={subtopicsLoading}
                        disabled={!selectedTopicId}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                            Topic
                          </Label>
                          <Input
                            value={adminTopic}
                            onChange={(e) => setAdminTopic(e.target.value)}
                            placeholder="e.g. Cells & their functions"
                            className="h-10 px-3 text-sm border border-black/15 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                            Sub-topic
                          </Label>
                          <Input
                            value={adminSubTopic}
                            onChange={(e) => setAdminSubTopic(e.target.value)}
                            placeholder="e.g. Cell Properties and Functions"
                            className="h-10 px-3 text-sm border border-black/15 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          Topic ID{" "}
                          <span className="text-slate-300 normal-case font-normal tracking-normal">
                            — optional
                          </span>
                        </Label>
                        <Input
                          value={adminTopicId}
                          onChange={(e) => setAdminTopicId(e.target.value)}
                          placeholder="Paste topic UUID if available"
                          className="h-10 px-3 text-sm border border-black/15 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all sm:max-w-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

          {/* ── Unified Draft List ── */}
          <div className="flex flex-col gap-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                {unpublishedCount} text question{unpublishedCount !== 1 ? "s" : ""} pending
              </span>
              <Button
                onClick={addBoardDraft}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
              >
                <PenTool size={14} className="shrink-0" />
                <span className="hidden sm:inline">Add Board Question</span>
              </Button>
            </div>

            {/* Draft cards — text or board */}
            {drafts.map((draft, index) =>
              draft.draftType === "board" ? (
                <BoardDraftCard
                  key={draft.id}
                  draft={draft}
                  index={index}
                  canDelete={drafts.length > 1}
                  onDelete={() => deleteDraft(draft.id)}
                  onBoardSaved={(result) => void handleBoardDraftSaved(draft.id, result)}
                  isSubmitting={boardSubmitting}
                />
              ) : (
                <QuestionCard
                  key={draft.id}
                  draft={draft}
                  index={index}
                  canDelete={drafts.length > 1}
                  onDelete={() => deleteDraft(draft.id)}
                  onUpdate={(updates) => updateDraft(draft.id, updates)}
                />
              )
            )}

            {/* Add Text Question */}
            <button
              onClick={addDraft}
              disabled={isPublishingAll}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-chestnut/30 text-chestnut font-semibold text-sm hover:border-chestnut/60 hover:bg-chestnut/5 transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              <Plus size={16} className="shrink-0" />
              Add Text Question
            </button>

            {/* Publish All (text drafts only) */}
            {unpublishedCount > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#D9D9D9]">
                {!canPublish && (
                  <p className="text-xs text-amber-500 font-medium">
                    Select a class, subject and sub-topic before publishing.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-slate-500 font-medium">
                    {publishProgress
                      ? `Publishing ${publishProgress.done} of ${publishProgress.total}…`
                      : `${unpublishedCount} question${unpublishedCount !== 1 ? "s" : ""} ready to publish`}
                  </div>
                  <Button
                    onClick={handlePublishAll}
                    disabled={isPublishingAll || !canPublish}
                    className="flex items-center justify-center gap-2 px-8 py-5 rounded-xl cursor-pointer bg-chestnut hover:bg-chestnut/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-chestnut/20 w-full sm:w-auto"
                  >
                    {isPublishingAll ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                        <span className="text-white font-semibold text-sm">
                          Publishing {publishProgress?.done ?? 0}/{publishProgress?.total ?? unpublishedCount}…
                        </span>
                      </>
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        Publish {unpublishedCount} Question{unpublishedCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizQuestion;

