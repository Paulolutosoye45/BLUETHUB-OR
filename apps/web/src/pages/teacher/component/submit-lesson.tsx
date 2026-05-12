import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  Loader2,
  Upload,
  X,
  FileVideo,
  FileAudio,
  FileImage,
  File as FileIcon,
  RefreshCw,
  Info,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  Button,
  Label,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@bluethub/ui-kit";
import { cn } from "@/lib/utils";
import {
  lessonService,
  type CloudinarySignature,
  type MediaFilePayload,
  type DraftLessonPayload,
} from "@/services/lesson";
import { schoolService } from "@/services/school";
import { useAuthContext } from "@/contexts/auth-context";
import { localData } from "@/utils";
import toast from "react-hot-toast";

// ── Constants ────────────���──────────────────────��─────────────────────────────

/** Max simultaneous Cloudinary XHR uploads */
const UPLOAD_CONCURRENCY = 2;

// ── Types ─────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading" | "done" | "error";

interface UploadFile {
  uid: string;
  file?: File;            // undefined for draft-restored entries
  displayName: string;   // always present
  displaySize: number;
  displayMimeType: string;
  status: UploadStatus;
  progress: number;
  result?: MediaFilePayload;
  error?: string;
}

interface SelectItem {
  id: string;
  label: string;
}

// ── Draft schema (localStorage) ─────────────��─────────────────────────────────

interface DraftFile {
  uid: string;
  name: string;
  size: number;
  mimeType: string;
  result: MediaFilePayload;
}

interface LessonDraft {
  savedAt: string;           // ISO timestamp — shown in "Draft saved X ago"
  classroomId: string;
  classroomLabel: string;
  subjectId: string;
  subjectLabel: string;
  topicId: string;
  topicLabel: string;
  subTopicValue: string;
  aim: string;
  description: string;
  uploadedFiles: DraftFile[]; // only "done" files with Cloudinary data
}

const draftKey = (userId: string) => `lesson_draft_${userId}`;

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Helpers ──────────────────────────────────────────��────────────────────────

export const extractLabel = (item: Record<string, unknown>): string =>
  String(
    item.name ?? item.subjectName ?? item.subject ?? item.className ??
    item.topicName ?? item.subTopicName ?? item.title ?? ""
  );

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("video/"))
    return <FileVideo className="w-5 h-5 text-violet-500 shrink-0" />;
  if (mimeType.startsWith("audio/"))
    return <FileAudio className="w-5 h-5 text-blue-500 shrink-0" />;
  if (mimeType.startsWith("image/"))
    return <FileImage className="w-5 h-5 text-emerald-500 shrink-0" />;
  if (mimeType === "application/pdf")
    return <FileIcon className="w-5 h-5 text-red-400 shrink-0" />;
  return <FileIcon className="w-5 h-5 text-gray-400 shrink-0" />;
}

// ── Worker-pool concurrency limiter ──────────────────────────────────────────
// Runs `fn` on each item, but never more than `limit` at once.
// Uses a shared queue: each worker dequeues and processes until empty.

async function runConcurrent<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift()!;
        await fn(item).catch(() => {}); // errors are handled inside fn
      }
    }
  );
  await Promise.all(workers);
}

// ── Cloudinary XHR upload ──────────────���──────────────────────────────────────
// XHR is the only browser API that exposes upload progress events.
// xhr.send() hands I/O to the browser networking thread — the JS main
// thread stays free and the UI remains responsive regardless of file size.

function uploadToCloudinary(
  file: File,
  sig: CloudinarySignature,
  onProgress: (pct: number) => void
): Promise<{
  public_id: string;
  secure_url: string;
  bytes: number;
  duration?: number;
  format: string;
  original_filename: string;
}> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.min(95, Math.round((e.loaded / e.total) * 95)));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        onProgress(100);
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body?.error?.message ?? `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error — check your connection"));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.send(fd);
  });
}

// ── FieldSelect ────────────���──────────────────────────────────────────────────

interface FieldSelectProps {
  label: string;
  placeholder: string;
  value: string;
  items: SelectItem[];
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
  onChange: (id: string, label: string) => void;
}

export function FieldSelect({
  label, placeholder, value, items, loading, disabled, required,
  emptyMessage = "No options available", onChange,
}: FieldSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);
  const isDisabled = disabled || loading;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-semibold text-chestnut">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={isDisabled}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between rounded-xl text-sm transition-all ring-2 min-h-[46px] px-4",
              selected ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                       : "ring-chestnut/20 text-chestnut/50 bg-white",
              "hover:ring-chestnut/40 hover:bg-chestnut/5",
              isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <span className={cn("truncate text-left text-sm",
              selected ? "text-chestnut font-semibold" : "text-chestnut/50")}>
              {loading ? "Loading…" : selected?.label ?? placeholder}
            </span>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin text-chestnut/50 shrink-0 ml-2" />
              : <ChevronDown className={cn("w-4 h-4 text-chestnut/60 shrink-0 ml-2 transition-transform duration-200", open && "rotate-180")} />
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border border-chestnut/10 shadow-xl bg-white p-1.5 max-h-56 overflow-y-auto z-50"
          align="start" sideOffset={6}
        >
          <DropdownMenuGroup>
            {items.length === 0
              ? <div className="px-3 py-5 text-center text-xs text-gray-400">{emptyMessage}</div>
              : items.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className={cn(
                      "rounded-lg py-3 px-3 text-sm font-medium cursor-pointer transition-colors",
                      value === item.id ? "bg-chestnut text-white" : "text-chestnut hover:bg-chestnut/8"
                    )}
                    onClick={() => onChange(item.id, item.label)}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="truncate">{item.label}</span>
                      {value === item.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </DropdownMenuItem>
                ))
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── FileRow ────────────────────────────────��──────────────────────────────────

interface FileRowProps {
  entry: UploadFile;
  index: number;
  onRemove: (uid: string) => void;
  onRetry: (uid: string) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, idx: number) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>, idx: number) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, idx: number) => void;
  isDragTarget: boolean;
}

function FileRow({ entry, index, onRemove, onRetry, onDragStart, onDragOver, onDrop, isDragTarget }: FileRowProps) {
  const { uid, displayName, displaySize, displayMimeType, status, progress, error } = entry;
  const barColor = status === "done" ? "bg-green-500" : status === "error" ? "bg-red-400" : "bg-chestnut";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-3 transition-all select-none",
        isDragTarget ? "border-chestnut/50 bg-chestnut/5 scale-[1.01] shadow-md" : "border-gray-200 shadow-sm",
        status === "error" && "border-red-200 bg-red-50/40"
      )}
    >
      <GripVertical className="hidden sm:block w-4 h-4 text-gray-300 group-hover:text-chestnut/40 cursor-grab shrink-0" />
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 shrink-0">
        {getFileIcon(displayMimeType)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="truncate text-sm font-semibold text-[#0F0F0E]">{displayName}</p>
          <span className="text-[11px] text-gray-400 shrink-0 hidden sm:inline">
            {formatBytes(displaySize)}
          </span>
        </div>
        {status === "error"
          ? <p className="text-[11px] text-red-500 truncate">{error}</p>
          : <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-300", barColor)} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] text-gray-400 w-8 text-right shrink-0">
                {status === "done" ? "Done" : status === "idle" ? "Queued" : `${progress}%`}
              </span>
            </div>
        }
      </div>

      <div className="shrink-0 w-5 flex justify-center">
        {status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-chestnut" />}
        {status === "idle" && <div className="w-2 h-2 rounded-full bg-gray-300" title="Queued" />}
        {status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {status === "error" && (
          <button onClick={() => onRetry(uid)} title="Retry" className="p-1 rounded-md hover:bg-red-100 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(uid)}
        disabled={status === "uploading"}
        title="Remove"
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
      >
        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
      </button>
    </div>
  );
}

// ── StepBadge ──────────���──────────────────────────────────────────────────────

function StepBadge({ n, done }: { n: number; done: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 transition-colors",
      done ? "bg-green-500 text-white" : "bg-chestnut/15 text-chestnut"
    )}>
      {done ? <Check className="w-3.5 h-3.5" /> : n}
    </span>
  );
}

// ── SetQuestionsModal ─────────────────────────────────────────────────────────

interface SetQuestionsModalProps {
  open: boolean;
  subjectLabel: string;
  classroomLabel: string;
  onSkip: () => void;       // submit without quiz
  onConfirm: (quizId: string) => void; // submit with quiz ID
  onDismiss: () => void;    // close without submitting
  isSubmitting: boolean;
}

function SetQuestionsModal({
  open, subjectLabel, classroomLabel, onSkip, onConfirm, onDismiss, isSubmitting,
}: SetQuestionsModalProps) {
  const [quizId, setQuizId] = useState("");

  if (!open) return null;

  // Two-letter abbreviation from subject label
  const abbr = subjectLabel
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleSend = () => {
    if (quizId.trim()) onConfirm(quizId.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(30, 27, 75, 0.65)", backdropFilter: "blur(2px)" }}>
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-chestnut px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FileIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Set Questions</span>
          </div>
          <button onClick={onDismiss}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-7 flex flex-col items-center text-center">

          {/* Class info banner */}
          <div className="w-full bg-chestnut/5 border border-chestnut/10 rounded-2xl px-4 py-3.5
            flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chestnut/20 rounded-xl flex items-center justify-center
                text-chestnut font-bold text-xs shrink-0">
                {abbr || "CL"}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Current Class</p>
                <p className="text-sm font-bold text-gray-800 leading-tight">{subjectLabel || "—"}</p>
              </div>
            </div>
            <span className="text-chestnut font-bold text-xs bg-chestnut/10 px-2.5 py-1 rounded-lg">
              {classroomLabel || "—"}
            </span>
          </div>

          {/* Book illustration */}
          <div className="w-28 h-28 relative mx-auto mb-6 select-none">
            {/* Shadow book */}
            <div className="absolute inset-0 bg-chestnut/80 rounded-xl shadow-lg"
              style={{ transform: "rotate(-10deg) translate(-3px, 3px)" }} />
            {/* Back cover */}
            <div className="absolute inset-0 bg-chestnut rounded-xl shadow-md" />
            {/* Pages side effect */}
            <div className="absolute top-2 right-2 bottom-2 w-1.5 bg-white/20 rounded-full" />
            <div className="absolute top-2 right-4 bottom-2 w-0.5 bg-white/10 rounded-full" />
            {/* Lines on cover */}
            <div className="absolute inset-x-4 top-5 space-y-1.5">
              <div className="h-1 bg-white/30 rounded-full" />
              <div className="h-1 bg-white/20 rounded-full w-3/4" />
              <div className="h-1 bg-white/20 rounded-full w-1/2" />
            </div>
            {/* Bookmark ribbon */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-pink-400 rounded-t-sm"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)" }} />
          </div>

          <h3 className="text-base font-bold text-gray-800 mb-1.5">
            Do you want to set a question?
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Attach a quiz to this lesson — students will see it after class
          </p>

          <button onClick={onSkip} disabled={isSubmitting}
            className="text-xs text-gray-400 underline decoration-gray-300 underline-offset-4
              font-medium mb-7 hover:text-chestnut transition-colors disabled:opacity-50">
            Skip — submit without a quiz
          </button>

          {/* Quiz ID input */}
          <div className="w-full flex gap-2">
            <input
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Enter quiz ID"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:ring-2 focus:ring-chestnut/40 focus:border-chestnut/40 outline-none transition"
            />
            <button
              onClick={handleSend}
              disabled={!quizId.trim() || isSubmitting}
              className={cn(
                "px-5 py-3 rounded-xl text-sm font-bold transition-all",
                quizId.trim() && !isSubmitting
                  ? "bg-chestnut/10 text-chestnut hover:bg-chestnut/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
            </button>
          </div>

          <button onClick={onDismiss}
            className="mt-5 text-xs text-chestnut/50 font-medium hover:text-chestnut transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const SubmitLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isAdmin = user?.roleName === "SuperAdministrator" || user?.roleName === "Administrator";

  // ── Cascade data ──
  const [classrooms, setClassrooms] = useState<SelectItem[]>([]);
  const [subjects, setSubjects] = useState<SelectItem[]>([]);
  const [topics, setTopics] = useState<SelectItem[]>([]);
  const [subTopics, setSubTopics] = useState<SelectItem[]>([]);

  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);

  // ── Form ──
  const [classroomId, setClassroomId] = useState("");
  const [classroomLabel, setClassroomLabel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectLabel, setSubjectLabel] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topicLabel, setTopicLabel] = useState("");
  const [subTopicValue, setSubTopicValue] = useState("");
  const [aim, setAim] = useState("");
  const [description, setDescription] = useState("");

  // ── Files ──
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemIdx = useRef<number | null>(null);
  const [dragTargetIdx, setDragTargetIdx] = useState<number | null>(null);

  // ── Draft ──
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<LessonDraft | null>(null);
  const draftRestored = useRef(false);

  // ── Submission ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [serverDraftSaved, setServerDraftSaved] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // ── On mount: check for saved draft ──────────────────────────────────────
  useEffect(() => {
    if (!user?.id || draftRestored.current) return;
    const saved = localData.retrieve<LessonDraft>(draftKey(user.id));
    if (saved && (saved.aim || saved.classroomId || saved.uploadedFiles?.length > 0)) {
      setPendingDraft(saved);
    }
  }, [user?.id]);

  // ── Auto-save draft whenever stable form state changes ───────────────────
  // Only fires when a file finishes (not on every progress tick) because
  // completedCount only increments when status flips to "done".
  const completedCount = uploadFiles.filter((f) => f.status === "done").length;

  useEffect(() => {
    if (!user?.id || !draftRestored.current) return;
    // Don't save an empty draft
    if (!classroomId && !aim && !description && completedCount === 0) return;

    const draft: LessonDraft = {
      savedAt: new Date().toISOString(),
      classroomId, classroomLabel,
      subjectId, subjectLabel,
      topicId, topicLabel,
      subTopicValue, aim, description,
      uploadedFiles: uploadFiles
        .filter((f) => f.status === "done" && f.result)
        .map((f) => ({
          uid: f.uid,
          name: f.displayName,
          size: f.displaySize,
          mimeType: f.displayMimeType,
          result: f.result!,
        })),
    };

    localData.save(draftKey(user.id), draft);
    setDraftTimestamp(draft.savedAt);
  }, [classroomId, subjectId, topicId, subTopicValue, aim, description, completedCount]);

  const restoreDraft = (draft: LessonDraft) => {
    setClassroomId(draft.classroomId);
    setClassroomLabel(draft.classroomLabel);
    setSubjectId(draft.subjectId);
    setSubjectLabel(draft.subjectLabel);
    setTopicId(draft.topicId);
    setTopicLabel(draft.topicLabel);
    setSubTopicValue(draft.subTopicValue);
    setAim(draft.aim);
    setDescription(draft.description);

    if (draft.uploadedFiles.length > 0) {
      const restored: UploadFile[] = draft.uploadedFiles.map((f) => ({
        uid: f.uid,
        displayName: f.name,
        displaySize: f.size,
        displayMimeType: f.mimeType,
        status: "done" as const,
        progress: 100,
        result: f.result,
      }));
      setUploadFiles(restored);
    }

    setDraftTimestamp(draft.savedAt);
    setPendingDraft(null);
    draftRestored.current = true;
    toast.success("Draft restored");
  };

  const discardDraft = () => {
    if (user?.id) localData.remove(draftKey(user.id));
    setPendingDraft(null);
    setDraftTimestamp(null);
    draftRestored.current = true;
  };

  const clearDraftAndReset = () => {
    if (user?.id) localData.remove(draftKey(user.id));
    setDraftTimestamp(null);
    setClassroomId(""); setClassroomLabel("");
    setSubjectId(""); setSubjectLabel("");
    setTopicId(""); setTopicLabel("");
    setSubTopicValue(""); setAim(""); setDescription("");
    setUploadFiles([]);
    toast("Draft cleared");
  };

  // Mark as restored immediately if no draft (so auto-save works on fresh sessions)
  useEffect(() => {
    if (!user?.id) return;
    const saved = localData.retrieve<LessonDraft>(draftKey(user.id));
    if (!saved) draftRestored.current = true;
  }, [user?.id]);

  // ── Cascade: classrooms ───────────────────────────────────────────────────
  useEffect(() => {
    schoolService.getAllClassRooms()
      .then((res) => {
        const raw: Record<string, unknown>[] =
          (res.data as any)?.data?.classrooms ?? (res.data as any)?.data ?? [];
        setClassrooms(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
      })
      .catch(() => toast.error("Could not load classrooms"))
      .finally(() => setLoadingClassrooms(false));
  }, []);

  // ── Cascade: classroom → subjects ─────────────────────────────────────────
  useEffect(() => {
    if (!classroomId) return;
    setSubjectId(""); setSubjectLabel("");
    setTopicId(""); setTopicLabel("");
    setSubTopicValue("");
    setSubjects([]); setTopics([]); setSubTopics([]);
    setLoadingSubjects(true);

    schoolService.getSubjectsByClassroomId(classroomId)
      .then((res) => {
        const raw: Record<string, unknown>[] = (res.data as any)?.data ?? [];
        setSubjects(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
      })
      .catch(() => toast.error("Could not load subjects"))
      .finally(() => setLoadingSubjects(false));
  }, [classroomId]);

  // ── Cascade: subject ��� topics ─────────────────────��───────────────────────
  useEffect(() => {
    if (!subjectId) return;
    setTopicId(""); setTopicLabel("");
    setSubTopicValue("");
    setTopics([]); setSubTopics([]);
    setLoadingTopics(true);

    lessonService.getTopicsBySubject(subjectId)
      .then((res) => {
        const raw: Record<string, unknown>[] = (res.data as any)?.data ?? [];
        setTopics(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
      })
      .catch(() => { setTopics([]); toast.error("Could not load topics"); })
      .finally(() => setLoadingTopics(false));
  }, [subjectId]);

  // ── Cascade: topic → subtopics ───────────────────────────────────────��────
  useEffect(() => {
    if (!topicId) return;
    setSubTopicValue("");
    setSubTopics([]);
    setLoadingSubTopics(true);

    lessonService.getSubTopicsByTopic(topicId)
      .then((res) => {
        const raw: Record<string, unknown>[] = (res.data as any)?.data ?? [];
        setSubTopics(raw.map((r) => ({ id: String(r.id), label: extractLabel(r) })));
      })
      .catch(() => setSubTopics([]))
      .finally(() => setLoadingSubTopics(false));
  }, [topicId]);

  // ── Upload logic ─────────────��────────────────────────────────────────────

  const runUpload = useCallback(async (uid: string, file: File, sig: CloudinarySignature) => {
    setUploadFiles((p) => p.map((f) => f.uid === uid ? { ...f, status: "uploading" } : f));
    try {
      const res = await uploadToCloudinary(file, sig, (pct) =>
        setUploadFiles((p) => p.map((f) => f.uid === uid ? { ...f, progress: pct } : f))
      );
      const ext = res.format || file.name.split(".").pop() || "";
      const result: MediaFilePayload = {
        fileName: `${res.original_filename}.${ext}`,
        originalFileName: file.name,
        fileExtension: ext,
        cloudinaryUrl: res.secure_url,
        publicId: res.public_id,
        fileSizeBytes: res.bytes,
        displayOrder: 0,
        ...(res.duration != null ? { duration: res.duration } : {}),
      };
      setUploadFiles((p) =>
        p.map((f) => f.uid === uid ? { ...f, status: "done", progress: 100, result } : f)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadFiles((p) =>
        p.map((f) => f.uid === uid ? { ...f, status: "error", error: msg, progress: 0 } : f)
      );
    }
  }, []);

  const processFiles = useCallback(async (fileList: FileList) => {
    const incoming: UploadFile[] = Array.from(fileList).map((file) => ({
      uid: uuidv4(),
      file,
      displayName: file.name,
      displaySize: file.size,
      displayMimeType: file.type,
      status: "idle" as const,
      progress: 0,
    }));

    setUploadFiles((p) => [...p, ...incoming]);

    let sig: CloudinarySignature;
    try {
      const r = await lessonService.getUploadSignature();
      sig = (r.data as any).data as CloudinarySignature;
    } catch {
      const uids = new Set(incoming.map((f) => f.uid));
      setUploadFiles((p) =>
        p.map((f) => uids.has(f.uid) ? { ...f, status: "error", error: "Could not get upload credentials" } : f)
      );
      toast.error("Could not get upload credentials from server");
      return;
    }

    // Worker-pool: max UPLOAD_CONCURRENCY at once
    await runConcurrent(incoming, UPLOAD_CONCURRENCY, ({ uid, file }) =>
      runUpload(uid, file!, sig)
    );
  }, [runUpload]);

  const handleRetry = useCallback(async (uid: string) => {
    const entry = uploadFiles.find((f) => f.uid === uid);
    if (!entry?.file) return;
    let sig: CloudinarySignature;
    try {
      const r = await lessonService.getUploadSignature();
      sig = (r.data as any).data as CloudinarySignature;
    } catch {
      toast.error("Could not get upload credentials");
      return;
    }
    await runUpload(uid, entry.file, sig);
  }, [uploadFiles, runUpload]);

  const handleRemove = useCallback((uid: string) =>
    setUploadFiles((p) => p.filter((f) => f.uid !== uid)), []);

  // ── Drop zone ──
  const handleDZDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDZDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDraggingOver(false);
  };
  const handleDZDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDraggingOver(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  // ── Row reorder ──
  const handleRowDragStart = (e: DragEvent<HTMLDivElement>, idx: number) => {
    dragItemIdx.current = idx; e.dataTransfer.effectAllowed = "move";
  };
  const handleRowDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragTargetIdx(idx);
  };
  const handleRowDrop = (e: DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault(); setDragTargetIdx(null);
    if (dragItemIdx.current === null || dragItemIdx.current === idx) return;
    setUploadFiles((p) => {
      const arr = [...p];
      const [moved] = arr.splice(dragItemIdx.current!, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    dragItemIdx.current = null;
  };

  // ── Submit / draft ────────────────────────────────────────────────────────
  const allUploaded = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "done");
  const isUploading = uploadFiles.some((f) => f.status === "uploading" || f.status === "idle");
  const busy = isSubmitting || isSavingDraft;

  const formValid = !!classroomId && !!subjectId && !!topicId && subTopicValue.trim().length > 0 &&
    aim.trim().length > 0 && description.trim().length > 0;

  // Draft: all text fields required, media optional
  const canSaveDraft = formValid && !busy;
  // Submit: text fields + at least one uploaded file
  const canSubmit = formValid && allUploaded && !busy;

  const buildMediaPayload = (): MediaFilePayload[] =>
    uploadFiles
      .filter((f) => f.status === "done" && f.result)
      .map((f, idx) => ({ ...f.result!, displayOrder: idx + 1 }));

  const handleSaveDraft = async () => {
    if (!canSaveDraft) return;
    setIsSavingDraft(true);
    setServerDraftSaved(false);

    const mediaFiles = buildMediaPayload();
    const payload: DraftLessonPayload = {
      classroomId, subjectId, topicId,
      subTopic: subTopicValue.trim(),
      aim: aim.trim(),
      description: description.trim(),
      ...(mediaFiles.length > 0 ? { mediaFiles } : {}),
    };

    try {
      await lessonService.saveDraft(payload);
      setServerDraftSaved(true);
      setDraftTimestamp(new Date().toISOString());
      toast.success("Draft saved");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
      toast.error(e?.response?.data?.responseMessage ?? e?.message ?? "Could not save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Opens the quiz modal — actual API call happens in handleConfirmSubmit
  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowQuizModal(true);
  };

  const handleConfirmSubmit = async (quizId: string | null) => {
    setShowQuizModal(false);
    setIsSubmitting(true);
    try {
      await lessonService.submitLesson({
        classroomId, subjectId, topicId,
        subTopic: subTopicValue.trim(),
        aim: aim.trim(),
        description: description.trim(),
        mediaFiles: buildMediaPayload(),
        ...(quizId ? { quizId } : { quizId: null }),
      });
      if (user?.id) localData.remove(draftKey(user.id));
      toast.success("Lesson submitted for approval");
      navigate(-1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
      toast.error(e?.response?.data?.responseMessage ?? e?.message ?? "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step done indicators ──
  const step1Done = !!classroomId && !!subjectId && !!topicId && subTopicValue.trim().length > 0;
  const step2Done = aim.trim().length > 0 && description.trim().length > 0;
  const step3Done = allUploaded;

  // ── Render ───────────────��────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-[#F7F7FB] pb-36 sm:pb-8">

        {/* ── Mobile sticky top bar ─────────────────────────────────────── */}
        <div className="sticky top-0 z-30 sm:hidden bg-chestnut flex items-center gap-3 px-4 py-3.5 shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-base leading-tight truncate">Submit Lesson</h1>
            {(classroomLabel || subjectLabel) && (
              <p className="text-white/60 text-[11px] truncate mt-0.5">
                {[classroomLabel, subjectLabel].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {draftTimestamp && (
              <span className="flex items-center gap-1 text-[10px] text-white/60">
                <Save size={10} />
                {relativeTime(draftTimestamp)}
              </span>
            )}
            <div className="flex gap-1">
              {[step1Done, step2Done, step3Done].map((done, i) => (
                <span key={i} className={cn("w-2 h-2 rounded-full transition-colors", done ? "bg-green-400" : "bg-white/30")} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop back button ───────────────────────────────────────── */}
        <div className="hidden sm:block max-w-3xl mx-auto px-4 pt-6 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-chestnut/60 hover:text-chestnut transition-colors mb-4"
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>

        <div className="max-w-3xl mx-auto sm:px-4">
          <div className="bg-white sm:rounded-2xl sm:shadow-md overflow-hidden">

            {/* Desktop title bar */}
            <div className="hidden sm:flex items-center justify-between bg-gradient-to-r from-chestnut to-chestnut/90 px-6 py-5">
              <h1 className="text-white font-semibold text-lg">Submit Lesson</h1>
              <div className="flex items-center gap-3">
                {serverDraftSaved && draftTimestamp && (
                  <span className="flex items-center gap-1.5 text-xs text-green-300 bg-white/10 px-2.5 py-1.5 rounded-full">
                    <CheckCircle2 size={12} /> Saved to server {relativeTime(draftTimestamp)}
                  </span>
                )}
                {!serverDraftSaved && draftTimestamp && (
                  <span className="flex items-center gap-1.5 text-xs text-white/60">
                    <Save size={12} /> Auto-saved {relativeTime(draftTimestamp)}
                  </span>
                )}
                {isAdmin && (
                  <span className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
                    <Info size={12} /> Admin — all classrooms visible
                  </span>
                )}
              </div>
            </div>

            {/* ── Draft restore banner ─────────────────────────────────── */}
            {pendingDraft && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-start gap-2.5 min-w-0">
                  <RotateCcw size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-800">You have an unsaved draft</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Saved {relativeTime(pendingDraft.savedAt)}
                      {pendingDraft.classroomLabel && ` · ${pendingDraft.classroomLabel}`}
                      {pendingDraft.uploadedFiles.length > 0 &&
                        ` · ${pendingDraft.uploadedFiles.length} file${pendingDraft.uploadedFiles.length > 1 ? "s" : ""} attached`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => discardDraft()}
                    className="flex-1 sm:flex-none text-xs font-medium text-amber-700 hover:text-amber-900 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => restoreDraft(pendingDraft)}
                    className="flex-1 sm:flex-none text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Restore Draft
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-100">

              {/* ══ SECTION 1: Class & Topic ══════════════════════════════ */}
              <section className="px-4 sm:px-6 py-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <StepBadge n={1} done={step1Done} />
                  <h2 className="font-semibold text-sm text-chestnut uppercase tracking-wide">Class &amp; Topic</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldSelect label="Classroom" placeholder="Select classroom" value={classroomId}
                    items={classrooms} loading={loadingClassrooms} required emptyMessage="No classrooms found"
                    onChange={(id, label) => { setClassroomId(id); setClassroomLabel(label); draftRestored.current = true; }} />
                  <FieldSelect label="Subject" placeholder={classroomId ? "Select subject" : "Select a classroom first"}
                    value={subjectId} items={subjects} loading={loadingSubjects} disabled={!classroomId}
                    required emptyMessage="No subjects for this classroom"
                    onChange={(id, label) => { setSubjectId(id); setSubjectLabel(label); }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldSelect label="Topic" placeholder={subjectId ? "Select topic" : "Select a subject first"}
                    value={topicId} items={topics} loading={loadingTopics} disabled={!subjectId}
                    required emptyMessage="No topics for this subject"
                    onChange={(id, label) => { setTopicId(id); setTopicLabel(label); }} />

                  {/* Sub-topic */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-chestnut">
                      Sub-Topic <span className="text-red-500">*</span>
                    </Label>
                    {subTopics.length > 0 ? (
                      <FieldSelect label="" placeholder="Select sub-topic"
                        value={subTopics.find((s) => s.label === subTopicValue)?.id ?? ""}
                        items={subTopics} loading={loadingSubTopics} disabled={!topicId}
                        emptyMessage="No sub-topics for this topic"
                        onChange={(_id, label) => setSubTopicValue(label)} />
                    ) : (
                      <div className="relative">
                        <input type="text" value={subTopicValue}
                          onChange={(e) => setSubTopicValue(e.target.value)}
                          placeholder={loadingSubTopics ? "Loading…" : topicId ? "Type sub-topic" : "Select a topic first"}
                          disabled={!topicId || loadingSubTopics}
                          className={cn(
                            "w-full min-h-[46px] rounded-xl border px-4 text-sm text-[#0F0F0E]",
                            "ring-2 ring-chestnut/20 placeholder:text-chestnut/40",
                            "focus:outline-none focus:ring-chestnut/50 transition-all",
                            (!topicId || loadingSubTopics) && "opacity-50 cursor-not-allowed bg-gray-50"
                          )}
                        />
                        {loadingSubTopics && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-chestnut/50" />}
                      </div>
                    )}
                  </div>
                </div>

                {topicLabel && (
                  <p className="text-[11px] text-chestnut/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-chestnut/30 inline-block" />
                    {[classroomLabel, subjectLabel, topicLabel].filter(Boolean).join(" → ")}
                  </p>
                )}
              </section>

              {/* ══ SECTION 2: Lesson content ═════════════════════════════ */}
              <section className="px-4 sm:px-6 py-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <StepBadge n={2} done={step2Done} />
                  <h2 className="font-semibold text-sm text-chestnut uppercase tracking-wide">Lesson Content</h2>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-chestnut">
                    Aim &amp; Objectives <span className="text-red-500">*</span>
                  </Label>
                  <textarea rows={3} value={aim} onChange={(e) => setAim(e.target.value)}
                    placeholder="e.g. Students will understand the role of photosynthesis in plant nutrition…"
                    className="w-full rounded-xl border border-gray-200 ring-2 ring-chestnut/20 px-4 py-3 text-sm text-[#0F0F0E] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-chestnut/50 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-chestnut">
                    Lesson Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed overview of lesson content, activities, and expected outcomes…"
                    className="w-full rounded-xl border border-gray-200 ring-2 ring-chestnut/20 px-4 py-3 text-sm text-[#0F0F0E] placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-chestnut/50 transition-all" />
                </div>
              </section>

              {/* ══ SECTION 3: Media files ════════════════════════════════ */}
              <section className="px-4 sm:px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <StepBadge n={3} done={step3Done} />
                    <h2 className="font-semibold text-sm text-chestnut uppercase tracking-wide">Lesson Media</h2>
                  </div>
                  <span className="text-[11px] text-gray-400 hidden sm:inline">
                    Max {UPLOAD_CONCURRENCY} uploads at once · drag rows to reorder
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={handleDZDragOver} onDragLeave={handleDZDragLeave} onDrop={handleDZDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button" tabIndex={0} aria-label="Upload files"
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 sm:py-10 cursor-pointer transition-all select-none",
                    isDraggingOver ? "border-chestnut bg-chestnut/5" : "border-gray-200 bg-gray-50/60 hover:border-chestnut/40 hover:bg-chestnut/3"
                  )}
                >
                  <input ref={fileInputRef} type="file" multiple className="hidden"
                    accept="video/*,audio/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={(e) => { if (e.target.files?.length) { processFiles(e.target.files); e.target.value = ""; } }} />
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                    isDraggingOver ? "bg-chestnut text-white" : "bg-chestnut/10 text-chestnut")}>
                    <Upload size={20} />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-semibold text-chestnut">{isDraggingOver ? "Drop to upload" : "Tap to upload"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Video · Audio · PDF · Images</p>
                  </div>
                </div>

                {/* File list */}
                {uploadFiles.length > 0 && (
                  <div className="space-y-2" onDragEnd={() => { dragItemIdx.current = null; setDragTargetIdx(null); }}>
                    {uploadFiles.map((entry, idx) => (
                      <FileRow key={entry.uid} entry={entry} index={idx}
                        onRemove={handleRemove} onRetry={handleRetry}
                        onDragStart={handleRowDragStart} onDragOver={handleRowDragOver} onDrop={handleRowDrop}
                        isDragTarget={dragTargetIdx === idx} />
                    ))}
                  </div>
                )}

                {/* Status banner */}
                {uploadFiles.length > 0 && (
                  <div className={cn("flex items-start gap-2 rounded-xl px-3.5 py-3 text-xs font-medium",
                    allUploaded ? "bg-green-50 text-green-700 border border-green-200"
                    : isUploading ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200")}>
                    {allUploaded
                      ? <><CheckCircle2 size={14} className="mt-0.5 shrink-0" /><span>{uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""} uploaded — ready to submit.</span></>
                      : isUploading
                      ? <><Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" /><span>Uploading ({UPLOAD_CONCURRENCY} at a time) — please wait.</span></>
                      : <><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>Some files failed. Retry or remove them to continue.</span></>
                    }
                  </div>
                )}
              </section>

              {/* ══ Desktop action row ════════════════════════════════════ */}
              <div className="hidden sm:flex items-center justify-between px-6 py-4 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400">
                    {!formValid ? "Fill all required fields to save or submit"
                      : !allUploaded ? "Add media files to submit (draft can be saved now)"
                      : "Ready to submit for approval"}
                  </p>
                  {draftTimestamp && (
                    <button onClick={clearDraftAndReset}
                      className="text-[11px] text-gray-400 hover:text-red-500 transition-colors underline">
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(-1)} disabled={busy}
                    className="border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl px-4 text-sm font-medium">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDraft} disabled={!canSaveDraft}
                    className={cn(
                      "rounded-xl px-4 text-sm font-semibold border transition-all",
                      canSaveDraft
                        ? "border-chestnut text-chestnut bg-white hover:bg-chestnut/5"
                        : "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
                    )}>
                    {isSavingDraft
                      ? <span className="flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" />Saving…</span>
                      : <span className="flex items-center gap-1.5"><Save size={13} />Save Draft</span>}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!canSubmit}
                    className={cn("rounded-xl px-5 text-sm font-semibold text-white min-w-[150px] transition-all",
                      canSubmit ? "bg-chestnut hover:bg-chestnut/90 shadow-sm" : "bg-gray-300 cursor-not-allowed")}>
                    {isSubmitting
                      ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Submitting…</span>
                      : "Submit for Approval"}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ══ Quiz modal ═══════════════════════════════════════════════════════ */}
      <SetQuestionsModal
        open={showQuizModal}
        subjectLabel={subjectLabel}
        classroomLabel={classroomLabel}
        onSkip={() => handleConfirmSubmit(null)}
        onConfirm={(id) => handleConfirmSubmit(id)}
        onDismiss={() => setShowQuizModal(false)}
        isSubmitting={isSubmitting}
      />

      {/* ══ Mobile sticky bottom bar ══════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
        {/* Save Draft row */}
        <button
          onClick={handleSaveDraft}
          disabled={!canSaveDraft}
          className={cn(
            "w-full min-h-[44px] rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all",
            canSaveDraft
              ? "border-chestnut text-chestnut bg-white active:bg-chestnut/5"
              : "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
          )}
        >
          {isSavingDraft
            ? <><Loader2 size={15} className="animate-spin" />Saving Draft…</>
            : serverDraftSaved
            ? <><CheckCircle2 size={15} className="text-green-500" />Draft Saved</>
            : <><Save size={15} />Save Draft</>}
        </button>

        {/* Submit row */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full min-h-[50px] rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all",
            canSubmit
              ? "bg-chestnut active:bg-chestnut/90 shadow-lg shadow-chestnut/25"
              : "bg-gray-300 cursor-not-allowed"
          )}
        >
          {isSubmitting
            ? <><Loader2 size={16} className="animate-spin" />Submitting…</>
            : !formValid ? "Fill all required fields"
            : !allUploaded ? "Add media to submit"
            : "Submit for Approval"}
        </button>
      </div>
    </>
  );
};

export default SubmitLesson;
