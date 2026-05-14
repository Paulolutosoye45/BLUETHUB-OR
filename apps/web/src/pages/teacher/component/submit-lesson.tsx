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
  BookOpen,
  Layers,
  FolderOpen,
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

// ── Constants ────────────────────────────────────────────────────────────────

const UPLOAD_CONCURRENCY = 2;

// ── Types ─────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading" | "done" | "error";

interface UploadFile {
  uid: string;
  file?: File;
  displayName: string;
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

interface DraftFile {
  uid: string;
  name: string;
  size: number;
  mimeType: string;
  result: MediaFilePayload;
}

interface LessonDraft {
  savedAt: string;
  classroomId: string;
  classroomLabel: string;
  subjectId: string;
  subjectLabel: string;
  topicId: string;
  topicLabel: string;
  subTopicValue: string;
  aim: string;
  description: string;
  uploadedFiles: DraftFile[];
}

const draftKey = (userId: string) => `lesson_draft_${userId}`;

function relativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    return <FileVideo className="w-5 h-5 text-violet-500" />;
  if (mimeType.startsWith("audio/"))
    return <FileAudio className="w-5 h-5 text-blue-500" />;
  if (mimeType.startsWith("image/"))
    return <FileImage className="w-5 h-5 text-emerald-500" />;
  if (mimeType === "application/pdf")
    return <FileIcon className="w-5 h-5 text-red-400" />;
  return <FileIcon className="w-5 h-5 text-gray-400" />;
}

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
        await fn(item).catch(() => {});
      }
    }
  );
  await Promise.all(workers);
}

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

// ── FieldSelect Component ────────────────────────────────────────────────────

interface FieldSelectProps {
  label: string;
  placeholder: string;
  value: string;
  items: SelectItem[];
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
  icon?: React.ReactNode;
  onChange: (id: string, label: string) => void;
}

export function FieldSelect({
  label, placeholder, value, items, loading, disabled, required,
  emptyMessage = "No options available", icon, onChange,
}: FieldSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);
  const isDisabled = disabled || loading;

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          {icon}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <DropdownMenu onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild disabled={isDisabled}>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between rounded-xl text-sm transition-all h-12 px-4 border-2",
              selected
                ? "border-blue-200 text-gray-900 bg-blue-50/50"
                : "border-gray-200 text-gray-400 bg-white",
              "hover:border-blue-300 hover:bg-blue-50/30",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
              isDisabled && "opacity-50 cursor-not-allowed pointer-events-none bg-gray-50"
            )}
          >
            <span className={cn("truncate text-left", selected ? "text-gray-900 font-medium" : "text-gray-400")}>
              {loading ? "Loading…" : selected?.label ?? placeholder}
            </span>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
            ) : (
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                open && "rotate-180"
              )} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border border-gray-200 shadow-xl bg-white p-1.5 max-h-64 overflow-y-auto z-50"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            {items.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-400">{emptyMessage}</div>
            ) : (
              items.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className={cn(
                    "rounded-lg py-3 px-3 text-sm cursor-pointer transition-colors",
                    value === item.id
                      ? "bg-blue-600 text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => onChange(item.id, item.label)}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="truncate">{item.label}</span>
                    {value === item.id && <Check className="w-4 h-4 shrink-0" />}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── FileRow Component ────────────────────────────────────────────────────────

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

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "group flex items-center gap-3 rounded-xl border-2 bg-white p-3 transition-all select-none",
        isDragTarget && "border-blue-400 bg-blue-50 scale-[1.01] shadow-lg",
        !isDragTarget && status === "error" && "border-red-200 bg-red-50/50",
        !isDragTarget && status === "done" && "border-green-200 bg-green-50/30",
        !isDragTarget && status !== "error" && status !== "done" && "border-gray-200 hover:border-gray-300"
      )}
    >
      <GripVertical className="hidden md:block w-4 h-4 text-gray-300 group-hover:text-gray-400 cursor-grab shrink-0" />

      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
        status === "done" ? "bg-green-100" : status === "error" ? "bg-red-100" : "bg-gray-100"
      )}>
        {getFileIcon(displayMimeType)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
          <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
            {formatBytes(displaySize)}
          </span>
        </div>
        {status === "error" ? (
          <p className="text-xs text-red-600 truncate">{error}</p>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  status === "done" ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right shrink-0">
              {status === "done" ? "Done" : status === "idle" ? "Queued" : `${progress}%`}
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1">
        {status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        {status === "idle" && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
        {status === "done" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        {status === "error" && (
          <button
            onClick={() => onRetry(uid)}
            title="Retry"
            className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(uid)}
        disabled={status === "uploading"}
        title="Remove"
        className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}

// ── SetQuestionsModal Component ──────────────────────────────────────────────

interface SetQuestionsModalProps {
  open: boolean;
  subjectLabel: string;
  classroomLabel: string;
  onSkip: () => void;
  onConfirm: (quizId: string) => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

function SetQuestionsModal({
  open, subjectLabel, classroomLabel, onSkip, onConfirm, onDismiss, isSubmitting,
}: SetQuestionsModalProps) {
  const [quizId, setQuizId] = useState("");

  if (!open) return null;

  const abbr = subjectLabel
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-semibold text-white">Set Questions</span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                {abbr || "CL"}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Current Class</p>
                <p className="text-sm font-semibold text-gray-900">{subjectLabel || "—"}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-lg">
              {classroomLabel || "—"}
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add a Quiz?
            </h3>
            <p className="text-sm text-gray-500">
              Attach a quiz for students to complete after the lesson
            </p>
          </div>

          <button
            onClick={onSkip}
            disabled={isSubmitting}
            className="w-full text-sm text-gray-500 hover:text-blue-600 font-medium mb-6 transition-colors disabled:opacity-50"
          >
            Skip — submit without a quiz
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && quizId.trim() && onConfirm(quizId.trim())}
              placeholder="Enter quiz ID"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition"
            />
            <button
              onClick={() => quizId.trim() && onConfirm(quizId.trim())}
              disabled={!quizId.trim() || isSubmitting}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-semibold transition-all",
                quizId.trim() && !isSubmitting
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const SubmitLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isAdmin = user?.roleName === "SuperAdministrator" || user?.roleName === "Administrator";

  // ── Data State ──
  const [classrooms, setClassrooms] = useState<SelectItem[]>([]);
  const [subjects, setSubjects] = useState<SelectItem[]>([]);
  const [topics, setTopics] = useState<SelectItem[]>([]);
  const [subTopics, setSubTopics] = useState<SelectItem[]>([]);

  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);

  // ── Form State ──
  const [classroomId, setClassroomId] = useState("");
  const [classroomLabel, setClassroomLabel] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectLabel, setSubjectLabel] = useState("");
  const [topicId, setTopicId] = useState("");
  const [topicLabel, setTopicLabel] = useState("");
  const [subTopicValue, setSubTopicValue] = useState("");
  const [aim, setAim] = useState("");
  const [description, setDescription] = useState("");

  // ── Upload State ──
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemIdx = useRef<number | null>(null);
  const [dragTargetIdx, setDragTargetIdx] = useState<number | null>(null);

  // ── Draft State ──
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<LessonDraft | null>(null);
  const draftRestored = useRef(false);

  // ── Submission State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [serverDraftSaved, setServerDraftSaved] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // ── Draft Logic ──
  useEffect(() => {
    if (!user?.id || draftRestored.current) return;
    const saved = localData.retrieve<LessonDraft>(draftKey(user.id));
    if (saved && (saved.aim || saved.classroomId || saved.uploadedFiles?.length > 0)) {
      setPendingDraft(saved);
    }
  }, [user?.id]);

  const completedCount = uploadFiles.filter((f) => f.status === "done").length;

  useEffect(() => {
    if (!user?.id || !draftRestored.current) return;
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

  useEffect(() => {
    if (!user?.id) return;
    const saved = localData.retrieve<LessonDraft>(draftKey(user.id));
    if (!saved) draftRestored.current = true;
  }, [user?.id]);

  // ── Data Fetching ──
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

  // ── Upload Logic ──
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
      toast.error("Could not get upload credentials");
      return;
    }

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

  // ── Drag & Drop ──
  const handleDZDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDZDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDraggingOver(false);
  };
  const handleDZDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDraggingOver(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

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

  // ── Validation ──
  const allUploaded = uploadFiles.length > 0 && uploadFiles.every((f) => f.status === "done");
  const isUploading = uploadFiles.some((f) => f.status === "uploading" || f.status === "idle");
  const busy = isSubmitting || isSavingDraft;

  const formValid = !!classroomId && !!subjectId && !!topicId && subTopicValue.trim().length > 0 &&
    aim.trim().length > 0 && description.trim().length > 0;

  const canSaveDraft = formValid && !busy;
  const canSubmit = formValid && allUploaded && !busy;

  const step1Done = !!classroomId && !!subjectId && !!topicId && subTopicValue.trim().length > 0;
  const step2Done = aim.trim().length > 0 && description.trim().length > 0;
  const step3Done = allUploaded;

  const buildMediaPayload = (): MediaFilePayload[] =>
    uploadFiles
      .filter((f) => f.status === "done" && f.result)
      .map((f, idx) => ({ ...f.result!, displayOrder: idx + 1 }));

  // ── Submission ──
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
      toast.success("Draft saved to server");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { responseMessage?: string } }; message?: string };
      toast.error(e?.response?.data?.responseMessage ?? e?.message ?? "Could not save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

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

  // ── Render ──
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Submit Lesson</h1>
                  {(classroomLabel || subjectLabel) && (
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {[classroomLabel, subjectLabel].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {draftTimestamp && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Save className="w-3 h-3" />
                    {serverDraftSaved ? "Saved" : "Auto-saved"} {relativeTime(draftTimestamp)}
                  </span>
                )}
                {isAdmin && (
                  <span className="hidden md:flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                    <Info className="w-3 h-3" />
                    Admin View
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Draft Restore Banner */}
        {pendingDraft && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Unsaved draft found</p>
                    <p className="text-xs text-amber-700">
                      Saved {relativeTime(pendingDraft.savedAt)}
                      {pendingDraft.uploadedFiles.length > 0 && ` • ${pendingDraft.uploadedFiles.length} files`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={discardDraft}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => restoreDraft(pendingDraft)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 sm:pb-8">
          <div className="space-y-6">
              {/* Step 1: Class & Topic */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      step1Done ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                    )}>
                      {step1Done ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Class & Topic</h2>
                      <p className="text-xs text-gray-500">Select the class and topic for this lesson</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldSelect
                      label="Classroom"
                      placeholder="Select classroom"
                      value={classroomId}
                      items={classrooms}
                      loading={loadingClassrooms}
                      required
                      onChange={(id, label) => { setClassroomId(id); setClassroomLabel(label); draftRestored.current = true; }}
                    />
                    <FieldSelect
                      label="Subject"
                      placeholder={classroomId ? "Select subject" : "Select classroom first"}
                      value={subjectId}
                      items={subjects}
                      loading={loadingSubjects}
                      disabled={!classroomId}
                      required
                      onChange={(id, label) => { setSubjectId(id); setSubjectLabel(label); }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldSelect
                      label="Topic"
                      placeholder={subjectId ? "Select topic" : "Select subject first"}
                      value={topicId}
                      items={topics}
                      loading={loadingTopics}
                      disabled={!subjectId}
                      required
                      onChange={(id, label) => { setTopicId(id); setTopicLabel(label); }}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Sub-Topic <span className="text-red-500">*</span>
                      </Label>
                      {subTopics.length > 0 ? (
                        <FieldSelect
                          label=""
                          placeholder="Select sub-topic"
                          value={subTopics.find((s) => s.label === subTopicValue)?.id ?? ""}
                          items={subTopics}
                          loading={loadingSubTopics}
                          disabled={!topicId}
                          onChange={(_id, label) => setSubTopicValue(label)}
                        />
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            value={subTopicValue}
                            onChange={(e) => setSubTopicValue(e.target.value)}
                            placeholder={loadingSubTopics ? "Loading…" : topicId ? "Type sub-topic" : "Select topic first"}
                            disabled={!topicId || loadingSubTopics}
                            className={cn(
                              "w-full h-12 rounded-xl border-2 px-4 text-sm text-gray-900",
                              "border-gray-200 placeholder:text-gray-400",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all",
                              (!topicId || loadingSubTopics) && "opacity-50 cursor-not-allowed bg-gray-50"
                            )}
                          />
                          {loadingSubTopics && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {topicLabel && (
                    <p className="text-xs text-gray-500 flex items-center gap-2 pt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {[classroomLabel, subjectLabel, topicLabel].filter(Boolean).join(" → ")}
                    </p>
                  )}
                </div>
              </section>

              {/* Step 2: Lesson Content */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      step2Done ? "bg-green-500 text-white" : "bg-purple-500 text-white"
                    )}>
                      {step2Done ? <Check className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">Lesson Content</h2>
                      <p className="text-xs text-gray-500">Describe the lesson objectives and content</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Aim & Objectives <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      rows={3}
                      value={aim}
                      onChange={(e) => setAim(e.target.value)}
                      placeholder="e.g. Students will understand the role of photosynthesis in plant nutrition…"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Lesson Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a detailed overview of lesson content, activities, and expected outcomes…"
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Step 3: Media Files */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        step3Done ? "bg-green-500 text-white" : "bg-emerald-500 text-white"
                      )}>
                        {step3Done ? <Check className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">Media Files</h2>
                        <p className="text-xs text-gray-500">Upload lesson materials</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline text-xs text-gray-400">
                      Drag to reorder
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDZDragOver}
                    onDragLeave={handleDZDragLeave}
                    onDrop={handleDZDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 cursor-pointer transition-all",
                      isDraggingOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-gray-50/50 hover:border-blue-300 hover:bg-blue-50/30"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept="video/*,audio/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          processFiles(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      isDraggingOver ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"
                    )}>
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        {isDraggingOver ? "Drop files here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Video, Audio, Images, PDF, Documents
                      </p>
                    </div>
                  </div>

                  {/* File List */}
                  {uploadFiles.length > 0 && (
                    <div
                      className="space-y-2"
                      onDragEnd={() => { dragItemIdx.current = null; setDragTargetIdx(null); }}
                    >
                      {uploadFiles.map((entry, idx) => (
                        <FileRow
                          key={entry.uid}
                          entry={entry}
                          index={idx}
                          onRemove={handleRemove}
                          onRetry={handleRetry}
                          onDragStart={handleRowDragStart}
                          onDragOver={handleRowDragOver}
                          onDrop={handleRowDrop}
                          isDragTarget={dragTargetIdx === idx}
                        />
                      ))}
                    </div>
                  )}

                  {/* Status Banner */}
                  {uploadFiles.length > 0 && (
                    <div className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm",
                      allUploaded && "bg-green-50 text-green-700 border border-green-200",
                      isUploading && "bg-blue-50 text-blue-700 border border-blue-200",
                      !allUploaded && !isUploading && "bg-amber-50 text-amber-700 border border-amber-200"
                    )}>
                      {allUploaded && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                      {isUploading && <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
                      {!allUploaded && !isUploading && <AlertCircle className="w-5 h-5 shrink-0" />}
                      <span className="font-medium">
                        {allUploaded && `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} ready`}
                        {isUploading && "Uploading files..."}
                        {!allUploaded && !isUploading && "Some files failed. Retry or remove them."}
                      </span>
                    </div>
                  )}
                </div>
              </section>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                {!formValid && "Fill all required fields to continue"}
                {formValid && !allUploaded && "Add media files to submit"}
                {formValid && allUploaded && "Ready to submit for approval"}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={busy}
                  className="rounded-xl px-5 h-11 border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={!canSaveDraft}
                  className={cn(
                    "rounded-xl px-5 h-11 font-medium transition-all",
                    canSaveDraft
                      ? "bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isSavingDraft ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Draft
                    </span>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={cn(
                    "rounded-xl px-6 h-11 font-semibold text-white transition-all min-w-[160px]",
                    canSubmit
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2 safe-area-pb">
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={!canSaveDraft}
              className={cn(
                "flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border-2 transition-all",
                canSaveDraft
                  ? "border-blue-500 text-blue-600 bg-white active:bg-blue-50"
                  : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
              )}
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : serverDraftSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "flex-[2] h-12 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all",
                canSubmit
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 active:from-blue-700 active:to-blue-800 shadow-lg shadow-blue-500/25"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : !formValid ? (
                "Fill all fields"
              ) : !allUploaded ? (
                "Add media files"
              ) : (
                "Submit for Approval"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <SetQuestionsModal
        open={showQuizModal}
        subjectLabel={subjectLabel}
        classroomLabel={classroomLabel}
        onSkip={() => handleConfirmSubmit(null)}
        onConfirm={(id) => handleConfirmSubmit(id)}
        onDismiss={() => setShowQuizModal(false)}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default SubmitLesson;
