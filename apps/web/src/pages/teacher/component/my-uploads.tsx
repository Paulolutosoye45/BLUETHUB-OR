import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import katex from "katex";
import "katex/dist/katex.min.css";
import TitleBar from "@/shared/title-bar";
import { Button, Dialog, DialogContent, DialogTitle } from "@bluethub/ui-kit";
import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";
import { schoolService } from "@/services/school";
import { questionService, type CreateOptionPayload } from "@/services/question";
import {
  questionJobService,
  type ExtractedQuestionDto,
  type JobStatusItem,
  type JobStatusesSummary,
} from "@/services/question-job";
import { useOutletContext } from "react-router-dom";

type SelectItem = { id: string; name: string };
type QuestionContentPart = {
  type?: string;
  value?: string;
  display?: string;
};

type UploadedOption = {
  optionLabel?: string;
  optionText?: string;
  label?: string;
  plainText?: string;
  html?: string;
  contentParts?: unknown;
  isCorrect?: boolean;
  orderIndex?: number;
};

type UploadedQuestion = Omit<ExtractedQuestionDto, "options"> & {
  questionNumber?: number;
  hasLatex?: boolean;
  hasImages?: boolean;
  options?: UploadedOption[];
};

type ImageBound = {
  key: string;
};

type EditableOption = {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
};

type EditableQuestion = Omit<UploadedQuestion, "options"> & {
  localId: string;
  questionText: string;
  options: EditableOption[];
};

const QUESTION_TYPE_CHOICES = [
  { value: 1, label: "Multiple Choice" },
  { value: 2, label: "Short Answer" },
  { value: 3, label: "Essay" },
  { value: 4, label: "True/False" },
] as const;

const isOptionQuestionType = (questionType: number) => questionType === 1 || questionType === 4;

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const sanitizePlainTextInput = (value: string) => stripHtml(value).replace(/\s+/g, " ").trim();

const sanitizeQuestionTextForSave = (value: string) =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .trim();

const nextOptionLabel = (index: number) => String.fromCharCode(65 + index);

const parseContentParts = (contentParts: unknown): QuestionContentPart[] => {
  if (Array.isArray(contentParts)) {
    return contentParts as QuestionContentPart[];
  }

  if (typeof contentParts === "string") {
    try {
      const parsed = JSON.parse(contentParts);
      return Array.isArray(parsed) ? (parsed as QuestionContentPart[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const renderLatex = (value: string, displayMode = false) => {
  try {
    return katex.renderToString(value, {
      throwOnError: false,
      displayMode,
      strict: "ignore",
    });
  } catch {
    return value;
  }
};

const deriveImageKeyFromUrl = (url: string): string => {
  const file = url.split("/").pop() ?? "";
  return file.replace(/\.[a-zA-Z0-9]+$/, "");
};

const latexInlineSpanRegex = /<span[^>]*class=['\"][^'\"]*th-math-inline[^'\"]*['\"][^>]*>\\\(([\s\S]*?)\\\)<\/span>/g;
const imagePlaceholderRegex = /\{\{image:([^}]+)\}\}/g;

const buildImageMap = (parts: QuestionContentPart[], imageBounds: ImageBound[]) => {
  const map = new Map<string, string>();

  parts
    .filter((part) => part.type === "image" && typeof part.value === "string" && /^https?:\/\//i.test(part.value))
    .forEach((part) => {
      const url = part.value as string;
      const key = deriveImageKeyFromUrl(url);
      if (!map.has(key)) map.set(key, url);
    });

  imageBounds.forEach((bound) => {
    if (map.has(bound.key)) return;
    const matched = Array.from(map.entries()).find(([k]) => k.includes(bound.key) || bound.key.includes(k));
    if (matched) map.set(bound.key, matched[1]);
  });

  return map;
};

const renderHtmlWithEnhancements = (
  html: string,
  parts: QuestionContentPart[],
  imageBounds: ImageBound[],
) => {
  const imageMap = buildImageMap(parts, imageBounds);

  const withMath = html.replace(latexInlineSpanRegex, (_match, expr: string) =>
    renderLatex(expr, false),
  );

  const withImages = withMath.replace(imagePlaceholderRegex, (_match, key: string) => {
    const url = imageMap.get(key.trim());
    if (!url) {
      return `<span class="text-xs italic text-slate-400">[Image: ${key}]</span>`;
    }
    return `<img src="${url}" alt="${key}" class="my-3 rounded-lg border border-slate-200 max-h-64 w-auto" />`;
  });

  return withImages;
};

const normalizeQuestionText = (q: UploadedQuestion) => {
  const raw = q.questionHtml || "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\\\(|\\\)|\{\{image:[^}]+\}\}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const questionRichnessScore = (q: UploadedQuestion) => {
  let score = 0;
  if (q.hasLatex) score += 3;
  if (q.hasImages) score += 2;
  if (parseContentParts(q.contentParts).some((p) => p.type === "latex")) score += 3;
  if (parseContentParts(q.contentParts).some((p) => p.type === "image")) score += 2;
  if ((q.questionHtml || "").includes("th-math-inline")) score += 2;
  score += (q.questionHtml || "").length / 1000;
  return score;
};

const normalizeOptionText = (option: UploadedOption) =>
  sanitizePlainTextInput(option.optionText ?? option.plainText ?? stripHtml(option.html ?? "") ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const normalizeOptionsSignature = (q: UploadedQuestion) =>
  (q.options ?? [])
    .map((option) => `${(option.optionLabel ?? option.label ?? "").toLowerCase()}:${normalizeOptionText(option)}`)
    .join("|");

const dedupeQuestions = (questions: UploadedQuestion[]) => {
  const kept: UploadedQuestion[] = [];
  const keyToIndex = new Map<string, number>();

  const chooseBetter = (a: UploadedQuestion, b: UploadedQuestion) =>
    questionRichnessScore(a) >= questionRichnessScore(b) ? a : b;

  questions.forEach((q) => {
    const normalizedText = normalizeQuestionText(q);
    const optionsSig = normalizeOptionsSignature(q);
    const keys = [
      q.id ? `id:${q.id}` : "",
      `sig:${q.questionType}|${normalizedText.slice(0, 260)}|${optionsSig}`,
      normalizedText ? `text:${normalizedText.slice(0, 260)}` : "",
    ].filter(Boolean);

    const existingIndex = keys
      .map((key) => keyToIndex.get(key))
      .find((index) => index !== undefined);

    if (existingIndex === undefined) {
      const nextIndex = kept.length;
      kept.push(q);
      keys.forEach((key) => keyToIndex.set(key, nextIndex));
      return;
    }

    const better = chooseBetter(kept[existingIndex], q);
    kept[existingIndex] = better;
    keys.forEach((key) => keyToIndex.set(key, existingIndex));
  });

  return kept;
};

const renderDifficultyStars = (difficulty: number) => {
  const clamped = Math.min(4, Math.max(1, Number.isFinite(difficulty) ? Math.round(difficulty) : 1));
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: 4 }).map((_, index) => {
        const active = index < clamped;
        return (
          <Star
            key={`${difficulty}-${index}`}
            className={`h-3.5 w-3.5 ${active ? "fill-amber-400 text-amber-500" : "text-slate-300"}`}
          />
        );
      })}
    </span>
  );
};

const DifficultyPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const clamped = Math.min(4, Math.max(1, Number.isFinite(value) ? Math.round(value) : 1));
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 h-10">
      {Array.from({ length: 4 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= clamped;
        return (
          <button
            key={`difficulty-${starValue}`}
            type="button"
            onClick={() => onChange(starValue)}
            className="inline-flex items-center justify-center"
            title={`Set difficulty ${starValue}`}
          >
            <Star
              className={`h-4 w-4 ${active ? "fill-amber-400 text-amber-500" : "text-slate-300"}`}
            />
          </button>
        );
      })}
    </div>
  );
};

const buildConfirmEndpointCandidates = (jobId: string) => {
  const base = (import.meta.env.VITE_API_BASE_URL || "https://techhubschmanagement.onrender.com").replace(/\/$/, "");
  return [
    `${base}/api/questionjob/jobs/${jobId}/confirm`,
    `${base}/api/question-jobs/jobs/${jobId}/confirm`,
    `${base}/api/questions/jobs/${jobId}/confirm`,
  ];
};

const confirmProcessedJobDirect = async (jobId: string) => {
  const jwt = localStorage.getItem("token");
  const tenant = import.meta.env.VITE_DEFAULT_TENANT;
  const endpoints = buildConfirmEndpointCandidates(jobId);

  let lastError = "";

  for (const endpoint of endpoints) {
    try {
      console.info("[MyUploads] Calling confirm endpoint", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          ...(tenant ? { "X-Tenant-ID": tenant } : {}),
        },
        body: "{}",
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const responseCode = String(payload?.responseCode ?? payload?.data?.responseCode ?? "").toLowerCase();
      const status = String(payload?.status ?? payload?.data?.status ?? "").toLowerCase();
      const okByPayload = responseCode === "successful" || status === "successful";

      if (response.ok && (okByPayload || payload == null)) {
        console.info("[MyUploads] Confirm endpoint succeeded", endpoint);
        return;
      }

      lastError =
        payload?.responseMessage ??
        payload?.data?.responseMessage ??
        `${response.status} ${response.statusText}`;
    } catch (error) {
      const err = error as { message?: string };
      lastError = err?.message ?? "Unknown network error";
    }
  }

  throw new Error(lastError || "Failed to update job status to processed.");
};

const statusPillClass = (status: JobStatusItem["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "Processing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "pending" | "processing" | "completed" | "failed";
}) => {
  const toneClass =
    tone === "completed"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : tone === "failed"
      ? "bg-red-50 border-red-200 text-red-700"
      : tone === "processing"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : tone === "pending"
      ? "bg-sky-50 border-sky-200 text-sky-700"
      : "bg-white border-slate-200 text-slate-700";

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

const MyUploads = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();

  const { user, isLoading: authLoading, refreshUser } = useAuthContext();

  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subTopicId, setSubTopicId] = useState("");

  const [topics, setTopics] = useState<SelectItem[]>([]);
  const [subTopics, setSubTopics] = useState<SelectItem[]>([]);
  const [topicsData, setTopicsData] = useState<any[]>([]);

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [summary, setSummary] = useState<JobStatusesSummary>({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [jobs, setJobs] = useState<JobStatusItem[]>([]);
  const [previewJob, setPreviewJob] = useState<JobStatusItem | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<EditableQuestion[]>([]);
  const [previewImageBounds, setPreviewImageBounds] = useState<ImageBound[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingEditedQuestions, setIsSavingEditedQuestions] = useState(false);
  const [previewScanSessionId, setPreviewScanSessionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toEditableQuestion = (question: UploadedQuestion, index: number): EditableQuestion => {
    const parts = parseContentParts(question.contentParts);
    const fromParts = parts
      .filter((part) => part.type === "text" || part.type === "latex")
      .map((part) => {
        if (part.type === "latex") return `$${part.value ?? ""}$`;
        return part.value ?? "";
      })
      .join("")
      .trim();

    const questionText = fromParts || stripHtml(question.questionHtml || "") || "";

    const mappedOptions = (question.options ?? []).map((option, optionIndex) => ({
      id: crypto.randomUUID(),
      label: option.optionLabel ?? option.label ?? nextOptionLabel(optionIndex),
      text: sanitizePlainTextInput(
        option.optionText ??
        option.plainText ??
        stripHtml(option.html ?? "") ??
        "",
      ),
      isCorrect: !!option.isCorrect,
    }));

    const options =
      question.questionType === 4
        ? [
            { id: crypto.randomUUID(), label: "A", text: "True", isCorrect: mappedOptions[0]?.isCorrect ?? false },
            { id: crypto.randomUUID(), label: "B", text: "False", isCorrect: mappedOptions[1]?.isCorrect ?? false },
          ]
        : mappedOptions;

    return {
      ...question,
      localId: crypto.randomUUID(),
      questionNumber: question.questionNumber ?? index + 1,
      questionText,
      options,
    };
  };

  const renumberQuestions = (questions: EditableQuestion[]) =>
    questions.map((question, index) => ({
      ...question,
      questionNumber: index + 1,
      options: question.options.map((option, optionIndex) => ({
        ...option,
        label: nextOptionLabel(optionIndex),
      })),
    }));

  const updateQuestion = (localId: string, updates: Partial<EditableQuestion>) => {
    setEditableQuestions((prev) =>
      prev.map((question) => (question.localId === localId ? { ...question, ...updates } : question)),
    );
  };

  const updateQuestionType = (localId: string, questionType: number) => {
    setEditableQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question;

        if (questionType === 4) {
          return {
            ...question,
            questionType,
            questionTypeName: "TrueFalse",
            options: [
              { id: crypto.randomUUID(), label: "A", text: "True", isCorrect: question.options[0]?.isCorrect ?? false },
              { id: crypto.randomUUID(), label: "B", text: "False", isCorrect: question.options[1]?.isCorrect ?? false },
            ],
          };
        }

        if (questionType === 1) {
          const base = question.options.length >= 2 ? question.options : [
            { id: crypto.randomUUID(), label: "A", text: "", isCorrect: false },
            { id: crypto.randomUUID(), label: "B", text: "", isCorrect: false },
          ];
          return {
            ...question,
            questionType,
            questionTypeName: "MultipleChoice",
            options: base.map((option, index) => ({ ...option, label: nextOptionLabel(index) })),
          };
        }

        return {
          ...question,
          questionType,
          questionTypeName:
            questionType === 2 ? "ShortAnswer" : questionType === 3 ? "Essay" : question.questionTypeName,
          options: [],
        };
      }),
    );
  };

  const updateOption = (localId: string, optionId: string, text: string) => {
    setEditableQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question;
        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId ? { ...option, text: sanitizePlainTextInput(text) } : option,
          ),
        };
      }),
    );
  };

  const setCorrectOption = (localId: string, optionId: string) => {
    setEditableQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question;
        return {
          ...question,
          options: question.options.map((option) => ({
            ...option,
            isCorrect: option.id === optionId,
          })),
        };
      }),
    );
  };

  const addOption = (localId: string) => {
    setEditableQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question;
        const nextOptions = [
          ...question.options,
          {
            id: crypto.randomUUID(),
            label: nextOptionLabel(question.options.length),
            text: "",
            isCorrect: false,
          },
        ];
        return { ...question, options: nextOptions };
      }),
    );
  };

  const removeOption = (localId: string, optionId: string) => {
    setEditableQuestions((prev) =>
      prev.map((question) => {
        if (question.localId !== localId) return question;
        const filtered = question.options.filter((option) => option.id !== optionId);
        return {
          ...question,
          options: filtered.map((option, index) => ({ ...option, label: nextOptionLabel(index) })),
        };
      }),
    );
  };

  const addQuestion = () => {
    setEditableQuestions((prev) =>
      renumberQuestions([
        ...prev,
        {
          localId: crypto.randomUUID(),
          id: "",
          questionNumber: prev.length + 1,
          questionType: 1,
          questionTypeName: "MultipleChoice",
          questionHtml: "",
          questionText: "",
          contentParts: [],
          hasLatex: false,
          hasImages: false,
          hasMedia: false,
          correctAnswer: null,
          difficultyLevel: 1,
          marksAllocation: 1,
          status: 0,
          statusName: "Draft",
          subTopicName: prev[0]?.subTopicName ?? "",
          topicName: prev[0]?.topicName ?? "",
          creationDate: new Date().toISOString(),
          options: [
            { id: crypto.randomUUID(), label: "A", text: "", isCorrect: false },
            { id: crypto.randomUUID(), label: "B", text: "", isCorrect: false },
          ],
        },
      ]),
    );
  };

  const removeQuestion = (localId: string) => {
    setEditableQuestions((prev) => {
      const next = prev.filter((question) => question.localId !== localId);
      return renumberQuestions(next);
    });
  };

  const buildOptionsPayload = (question: EditableQuestion): CreateOptionPayload[] => {
    if (!isOptionQuestionType(question.questionType)) return [];
    return question.options.map((option, index) => ({
      optionLabel: option.label || nextOptionLabel(index),
      optionText: sanitizePlainTextInput(option.text),
      isCorrect: !!option.isCorrect,
      orderIndex: index + 1,
    }));
  };

  const validateQuestionForSave = (question: EditableQuestion, index: number): string | null => {
    if (!sanitizePlainTextInput(question.questionText)) {
      return `Question ${index + 1}: question text is required.`;
    }

    if ((question.marksAllocation ?? 0) <= 0) {
      return `Question ${index + 1}: marks must be greater than zero.`;
    }

    if (isOptionQuestionType(question.questionType)) {
      const nonEmptyOptions = question.options.filter((option) => sanitizePlainTextInput(option.text));
      if (nonEmptyOptions.length < 2) {
        return `Question ${index + 1}: add at least 2 options.`;
      }

      const correctCount = nonEmptyOptions.filter((option) => option.isCorrect).length;
      if (correctCount !== 1) {
        return `Question ${index + 1}: select exactly one correct answer.`;
      }
    }

    return null;
  };

  const normalizeName = (value?: string | null) => (value ?? "").trim().toLowerCase();

  const resolveTopicIdByName = (name?: string | null) => {
    const target = normalizeName(name);
    if (!target) return "";
    const found = topics.find((topic) => normalizeName(topic.name) === target);
    return found?.id ?? "";
  };

  const resolveSubTopicIdByName = (name?: string | null) => {
    const target = normalizeName(name);
    if (!target) return "";

    for (const topic of topicsData) {
      const nested = (topic?.SubTopics ?? topic?.subTopics ?? []) as any[];
      const found = nested.find((sub) => normalizeName(String(sub?.Name ?? sub?.name ?? sub?.subTopicName ?? "")) === target);
      if (found) {
        return String(found?.Id ?? found?.id ?? found?.subTopicId ?? "");
      }
    }

    const foundFlat = subTopics.find((sub) => normalizeName(sub.name) === target);
    return foundFlat?.id ?? "";
  };

  const handleSaveEditedQuestions = async () => {
    setSaveError(null);

    if (!previewJob) {
      const message = "No active upload job selected.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    if (!classroomId) {
      const message = "Select a classroom before saving.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    if (!subjectId) {
      const message = "Select a subject before saving.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    const resolvedTopicId = topicId || resolveTopicIdByName(previewJob.topicName);
    const resolvedSubTopicId =
      subTopicId ||
      resolveSubTopicIdByName(previewJob.subTopicName) ||
      resolveSubTopicIdByName(editableQuestions[0]?.subTopicName);

    if (!resolvedSubTopicId || resolvedSubTopicId === EMPTY_GUID) {
      const message = "Could not resolve sub-topic for this job. Select a sub-topic, then save again.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    if (editableQuestions.length === 0) {
      const message = "No questions to save.";
      setSaveError(message);
      toast.error(message);
      return;
    }

    for (let i = 0; i < editableQuestions.length; i++) {
      const validationError = validateQuestionForSave(editableQuestions[i], i);
      if (validationError) {
        setSaveError(validationError);
        toast.error(validationError);
        return;
      }
    }

    const selectedTopicName = topics.find((topic) => topic.id === resolvedTopicId)?.name ?? previewJob.topicName ?? "";

    setIsSavingEditedQuestions(true);
    let successfulSaves = 0;

    try {
      for (let index = 0; index < editableQuestions.length; index++) {
        const question = editableQuestions[index];
        const plainText = sanitizeQuestionTextForSave(question.questionText);
        const firstImageUrl = parseContentParts(question.contentParts)
          .find((part) => part.type === "image" && typeof part.value === "string" && /^https?:\/\//i.test(part.value ?? ""))
          ?.value;

        const payload = {
          clientId: `upload-${previewJob.jobId}-${question.localId}`,
          originDevice: "web",
          createdAtDevice: new Date().toISOString(),
          subjectId,
          topicId: resolvedTopicId || null,
          topic: [selectedTopicName, question.topicName, previewJob.topicName]
            .map((value) => (value ?? "").trim())
            .find((value) => value.length > 0) ?? "General",
          subTopic: resolvedSubTopicId,
          classroomId,
          title: plainText || `Question ${index + 1}`,
          textContent: plainText,
          questionType: question.questionType,
          difficultyLevel: Math.max(1, Math.min(4, Number(question.difficultyLevel) || 1)),
          marksAllocation: Math.max(1, Math.min(4, Number(question.marksAllocation || question.difficultyLevel) || 1)),
          options: buildOptionsPayload(question),
          boardSessionId: null,
          scanSessionId: previewScanSessionId,
          isScanned: true,
          extractedQuestionIndex: (question.questionNumber ?? index + 1) - 1,
          aiConfidenceScore: null,
          imageUrl: typeof firstImageUrl === "string" ? firstImageUrl : null,
        };

        const response = await questionService.createQuestion(payload);
        const rawResponse = response.data as any;
        const nested = rawResponse?.data ?? {};
        const responseCode = String(rawResponse?.responseCode ?? nested?.responseCode ?? "").toLowerCase();
        const responseStatus = String(rawResponse?.status ?? nested?.status ?? "").toLowerCase();
        const isDuplicate = !!(rawResponse?.isDuplicate ?? nested?.isDuplicate);
        const hasQuestionId = !!(rawResponse?.questionId ?? nested?.questionId);
        const isSuccessful =
          responseStatus === "successful" ||
          responseCode === "successful" ||
          hasQuestionId ||
          isDuplicate;

        if (isSuccessful) {
          successfulSaves += 1;
        } else {
          throw new Error(rawResponse?.responseMessage ?? nested?.responseMessage ?? "Create question failed");
        }
      }

      if (successfulSaves !== editableQuestions.length) {
        toast.error("Some questions could not be saved. Please retry.");
        return;
      }

      const savedJobId = previewJob.jobId;
      // Update backend job status before finalizing UI success flow.
      console.info("[MyUploads] Confirming processed job", savedJobId);
      await confirmProcessedJobDirect(savedJobId);

      console.info("[MyUploads] Job status updated", savedJobId);

      // Finalize UI after both create and confirm succeed.
      setJobs((prev) => prev.filter((job) => job.jobId !== savedJobId));
      setIsEditMode(false);
      setPreviewJob(null);
      setSaveError(null);
      toast.success("Questions saved and job processed.");

      void fetchStatuses();

      // Force a full page refresh so processed jobs are reloaded from server state.
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } }; message?: string };
      const message = err?.response?.data?.responseMessage ?? err?.message ?? "Failed to save edited questions.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSavingEditedQuestions(false);
    }
  };

 const classrooms = useMemo<SelectItem[]>(() => {
  const roleData = user?.roleData;
  if (!roleData || !isTeacherRoleData(roleData)) return [];
  return roleData.classrooms.map((c) => ({
    id: String(c.classroomId),
    name: String(c.className),
  }));
}, [user?.roleData]);

const subjects = useMemo<SelectItem[]>(() => {
  const roleData = user?.roleData;
  if (!roleData || !isTeacherRoleData(roleData)) return [];
  const selectedClassroom = roleData.classrooms.find(
    (c) => String(c.classroomId) === classroomId
  );
  return (selectedClassroom?.subjects ?? []).map((s) => ({
    id: String(s.subjectId),
    name: String(s.subjectName),
  }));
}, [user?.roleData, classroomId]);

  useEffect(() => {
    if (!authLoading) {
      void refreshUser();
    }
  }, [authLoading]);

  useEffect(() => {
    if (classroomId && !classrooms.some((c) => c.id === classroomId)) {
      setClassroomId("");
      setSubjectId("");
      setTopicId("");
      setSubTopicId("");
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
    }
  }, [classroomId, classrooms]);

  useEffect(() => {
    if (subjectId && !subjects.some((s) => s.id === subjectId)) {
      setSubjectId("");
      setTopicId("");
      setSubTopicId("");
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
    }
  }, [subjectId, subjects]);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setSubTopics([]);
      setTopicsData([]);
      return;
    }

    setLoadingTopics(true);
    setTopicId("");
    setSubTopicId("");
    setTopics([]);
    setSubTopics([]);
    setTopicsData([]);

    schoolService
      .getSubjectCurriculum(subjectId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const nextTopics: any[] = raw.Topics ?? raw.topics ?? [];

        setTopicsData(nextTopics);
        setTopics(
          nextTopics.map((t: any) => ({
            id: String(t.Id ?? t.id ?? t.topicId ?? ""),
            name: String(t.Name ?? t.name ?? t.topicName ?? ""),
          }))
        );
      })
      .catch(() => {
        setTopics([]);
        toast.error("Could not load topics");
      })
      .finally(() => setLoadingTopics(false));
  }, [subjectId]);

  useEffect(() => {
    if (!topicId) {
      setSubTopics([]);
      return;
    }

    const matched = topicsData.find(
      (t: any) => String(t.Id ?? t.id ?? t.topicId) === topicId
    );

    const nextSubTopics: SelectItem[] = (matched?.SubTopics ?? matched?.subTopics ?? []).map((s: any) => ({
      id: String(s.Id ?? s.id ?? s.subTopicId ?? ""),
      name: String(s.Name ?? s.name ?? s.subTopicName ?? ""),
    }));

    setSubTopicId("");
    setSubTopics(nextSubTopics);
  }, [topicId, topicsData]);

  const fetchStatuses = async () => {
    if (!classroomId || !subjectId) {
      setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setJobs([]);
      return;
    }

    setLoadingJobs(true);
    try {
      const { data } = await questionJobService.getJobStatuses({
        classroomId,
        subjectId,
        topicId: topicId || undefined,
        subTopicId: subTopicId || undefined,
      });

      const payload = (data as any)?.data ?? {};
      setSummary(
        payload.summary ?? {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
        }
      );
      setJobs(payload.jobs ?? []);
    } catch {
      setSummary({ total: 0, pending: 0, processing: 0, completed: 0, failed: 0 });
      setJobs([]);
      toast.error("Failed to load upload statuses");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    void fetchStatuses();
  }, [classroomId, subjectId, topicId, subTopicId]);

  const handleOpenJobPreview = async (job: JobStatusItem) => {
    setPreviewJob(job);
    setEditableQuestions([]);
    setPreviewImageBounds([]);
    setPreviewScanSessionId(null);
    setSaveError(null);
    setIsEditMode(false);
    setPreviewLoading(true);

    try {
      const { data } = await questionJobService.getQuestionsByJobId(job.jobId);
      const raw = data as any;
      const payload = raw?.data ?? raw?.dat ?? raw;
      const questions = (payload?.questions ?? []) as UploadedQuestion[];
      const deduped = dedupeQuestions(questions);
      setEditableQuestions(deduped.map(toEditableQuestion));
      setPreviewImageBounds((payload?.imageBounds ?? []) as ImageBound[]);
      setPreviewScanSessionId((payload?.scanSessionId ?? payload?.scanSession?.id ?? null) as string | null);
    } catch {
      setEditableQuestions([]);
      setPreviewImageBounds([]);
      setPreviewScanSessionId(null);
      toast.error("Failed to load questions for this upload job");
    } finally {
      setPreviewLoading(false);
    }
  };

  const FilterSelect = ({
    label,
    value,
    options,
    placeholder,
    onChange,
    disabled,
    loading,
  }: {
    label: string;
    value: string;
    options: SelectItem[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <select
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-chestnut/15 focus:border-chestnut disabled:opacity-50"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className=" sm:p-5 font-poppins">
      <div className="lg:rounded-2xl border border-white/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <TitleBar title="My Uploads" hasVertical  hasMenu={openMobileNav} />

        <div className="p-3 sm:p-5 lg:p-7 space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] border border-[#f3dccb] p-4 sm:p-5">
            <h1 className="text-lg sm:text-xl font-bold text-chestnut leading-tight">Question Upload Status</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track pending, processing, completed and failed question extraction jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FilterSelect
              label="Classroom"
              value={classroomId}
              options={classrooms}
              placeholder="Select classroom"
              onChange={(v) => {
                setClassroomId(v);
                setSubjectId("");
                setTopicId("");
                setSubTopicId("");
              }}
              loading={authLoading}
            />
            <FilterSelect
              label="Subject"
              value={subjectId}
              options={subjects}
              placeholder={classroomId ? "Select subject" : "Select classroom first"}
              onChange={(v) => {
                setSubjectId(v);
                setTopicId("");
                setSubTopicId("");
              }}
              disabled={!classroomId}
              loading={authLoading}
            />
            <FilterSelect
              label="Topic"
              value={topicId}
              options={topics}
              placeholder={subjectId ? "Select topic (optional)" : "Select subject first"}
              onChange={(v) => {
                setTopicId(v);
                setSubTopicId("");
              }}
              disabled={!subjectId}
              loading={loadingTopics}
            />
            <FilterSelect
              label="Sub-topic"
              value={subTopicId}
              options={subTopics}
              placeholder={topicId ? "Select sub-topic (optional)" : "Select topic first"}
              onChange={setSubTopicId}
              disabled={!topicId}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard label="Total" value={summary.total} tone="default" />
            <SummaryCard label="Pending" value={summary.pending} tone="pending" />
            <SummaryCard label="Processing" value={summary.processing} tone="processing" />
            <SummaryCard label="Completed" value={summary.completed} tone="completed" />
            <SummaryCard label="Failed" value={summary.failed} tone="failed" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Jobs</h2>
              {loadingJobs && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {!loadingJobs && jobs.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No upload jobs found for the selected filters.
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const canViewQuestions = job.status === "Completed";

                return (
                <article
                  key={job.jobId}
                  className="px-4 py-3 sm:py-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {job.topicName} • {job.subTopicName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Type: {job.questionType} • Extracted: {job.extractedCount} • Attempts: {job.attemptCount}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Created: {job.createdAt}</p>
                      {job.completedAt && (
                        <p className="text-xs text-slate-400">Completed: {job.completedAt}</p>
                      )}
                      {job.failureReason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {job.failureReason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusPillClass(job.status)}`}>
                        {job.status}
                      </span>
                      <Button
                        type="button"
                        onClick={() => void handleOpenJobPreview(job)}
                        disabled={!canViewQuestions}
                        className="h-8 rounded-lg bg-chestnut hover:bg-chestnut/90 text-white text-xs font-semibold px-3 disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        View Questions
                      </Button>
                    </div>
                  </div>
                  {!canViewQuestions && (
                    <p className="text-[11px] text-slate-400 mt-2">
                      Questions can be viewed after this job is completed.
                    </p>
                  )}
                </article>
              )})}
            </div>
          </div>

          <Dialog open={!!previewJob} onOpenChange={(open) => !open && setPreviewJob(null)}>
            <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff]">
                <DialogTitle className="text-base font-semibold text-slate-800">Uploaded Job Questions</DialogTitle>
                {previewJob && (
                  <p className="text-xs text-slate-500 mt-1">
                    {previewJob.topicName} • {previewJob.subTopicName} • {previewJob.questionType}
                  </p>
                )}
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {previewLoading && (
                  <div className="py-10 flex items-center justify-center text-slate-500 text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading questions...
                  </div>
                )}

                {!previewLoading && editableQuestions.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No questions returned for this job.
                  </div>
                )}

                {!previewLoading && editableQuestions.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {saveError && (
                      <p className="text-xs text-rose-600 font-medium">{saveError}</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-600 font-medium">
                      {editableQuestions.length} question{editableQuestions.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => setIsEditMode((prev) => !prev)}
                        className={`h-8 rounded-lg border px-3 text-xs font-semibold ${isEditMode ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-700"}`}
                      >
                        {isEditMode ? "Done Editing" : "Edit Questions"}
                      </Button>
                      {isEditMode && (
                        <Button
                          type="button"
                          onClick={addQuestion}
                          className="h-8 rounded-lg bg-chestnut hover:bg-chestnut/90 text-white px-3 text-xs font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Add Question
                        </Button>
                      )}
                      {isEditMode && (
                        <Button
                          type="button"
                          onClick={() => void handleSaveEditedQuestions()}
                          disabled={isSavingEditedQuestions}
                          className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 text-xs font-semibold disabled:bg-slate-300 disabled:text-slate-500"
                        >
                          {isSavingEditedQuestions ? (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      )}
                    </div>
                    </div>
                  </div>
                )}

                {!previewLoading && editableQuestions.map((question, index) => (
                  <article key={question.localId} className="rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-800 leading-6 w-full">
                        <p>{question.questionNumber ?? index + 1}.</p>

                        {!isEditMode && !!question.questionHtml?.trim() && parseContentParts(question.contentParts).length > 0 ? (
                          <div
                            className="mt-1 prose prose-sm max-w-none text-slate-700"
                            dangerouslySetInnerHTML={{
                              __html: renderHtmlWithEnhancements(
                                question.questionHtml,
                                parseContentParts(question.contentParts),
                                previewImageBounds,
                              ),
                            }}
                          />
                        ) : !isEditMode ? (
                          <div className="mt-1 space-y-2 text-slate-700 font-normal">
                            {parseContentParts(question.contentParts).length === 0 ? (
                              <p>{question.questionText || stripHtml(question.questionHtml || "")}</p>
                            ) : parseContentParts(question.contentParts).map((part, partIndex) => {
                              const key = `${question.id}-${partIndex}`;
                              if (part.type === "latex") {
                                const isBlock = part.display === "block";
                                return (
                                  <span
                                    key={key}
                                    className={isBlock ? "block my-2" : "inline"}
                                    dangerouslySetInnerHTML={{ __html: renderLatex(part.value ?? "", isBlock) }}
                                  />
                                );
                              }

                              if (part.type === "image") {
                                const src = part.value ?? "";
                                if (/^https?:\/\//i.test(src)) {
                                  return (
                                    <img
                                      key={key}
                                      src={src}
                                      alt="Question visual"
                                      className="my-2 rounded-lg border border-slate-200 max-h-64 w-auto"
                                      loading="lazy"
                                    />
                                  );
                                }
                                return (
                                  <p key={key} className="text-xs italic text-slate-500">
                                    [Image placeholder: {part.value ?? "image"}]
                                  </p>
                                );
                              }

                              return <p key={key}>{part.value ?? ""}</p>;
                            })}
                          </div>
                        ) : (
                          <div className="space-y-3 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <select
                                value={question.questionType}
                                onChange={(e) => updateQuestionType(question.localId, Number(e.target.value))}
                                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                              >
                                {QUESTION_TYPE_CHOICES.map((choice) => (
                                  <option key={choice.value} value={choice.value}>{choice.label}</option>
                                ))}
                              </select>

                              <DifficultyPicker
                                value={question.marksAllocation || question.difficultyLevel}
                                onChange={(nextDifficulty) =>
                                  updateQuestion(question.localId, {
                                    difficultyLevel: Math.max(1, Math.min(4, nextDifficulty)),
                                    marksAllocation: Math.max(1, Math.min(4, nextDifficulty)),
                                  })
                                }
                              />
                            </div>

                            <textarea
                              rows={4}
                              value={question.questionText}
                              onChange={(e) => {
                                const safeText = sanitizePlainTextInput(e.target.value);
                                updateQuestion(question.localId, {
                                  questionText: safeText,
                                  // Keep edited content as plain text; do not store KaTeX-rendered/HTML question markup.
                                  questionHtml: "",
                                  contentParts: [],
                                });
                              }}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                              placeholder="Edit question text"
                            />

                            {isOptionQuestionType(question.questionType) && (
                              <div className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Options</p>

                                {question.options.map((option) => (
                                  <div key={option.id} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setCorrectOption(question.localId, option.id)}
                                      className={`h-8 w-8 rounded-full border text-xs font-bold ${option.isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 text-slate-500"}`}
                                      title="Mark as correct"
                                    >
                                      {option.label}
                                    </button>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => updateOption(question.localId, option.id, e.target.value)}
                                      className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                                      placeholder={`Option ${option.label}`}
                                    />
                                    {question.questionType !== 4 && question.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(question.localId, option.id)}
                                        className="h-8 w-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50"
                                        title="Remove option"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                      </button>
                                    )}
                                  </div>
                                ))}

                                {question.questionType !== 4 && (
                                  <button
                                    type="button"
                                    onClick={() => addOption(question.localId)}
                                    className="h-8 rounded-lg border border-slate-300 bg-white text-slate-600 px-3 text-xs font-semibold"
                                  >
                                    <Plus className="w-3.5 h-3.5 inline mr-1" />
                                    Add Option
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 inline-flex max-w-full whitespace-normal break-words text-center leading-tight">
                          {question.questionTypeName || `Type ${question.questionType}`}
                        </span>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.localId)}
                            className="h-8 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 px-2 text-xs font-semibold"
                            title="Remove question"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600 inline-flex items-center gap-1.5">
                        Marks: {renderDifficultyStars(question.marksAllocation || question.difficultyLevel)}
                        <span className="text-slate-500">({question.marksAllocation || question.difficultyLevel})</span>
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">
                        Status: {question.statusName || question.status}
                      </span>
                    </div>

                    {!isEditMode && question.options?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.options.map((option) => (
                          <div key={`${question.localId}-${option.id}`} className="text-xs text-slate-600">
                            <span className="font-semibold mr-1">{option.label}.</span>
                            <span>{option.text}</span>
                            {option.isCorrect && (
                              <span className="ml-2 text-emerald-600 font-semibold">(Correct)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}

                <div className="pt-2 flex justify-end gap-2">
                  {isEditMode && editableQuestions.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => void handleSaveEditedQuestions()}
                      disabled={isSavingEditedQuestions}
                      className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {isSavingEditedQuestions ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => setPreviewJob(null)}
                    className="h-10 rounded-xl bg-chestnut hover:bg-chestnut/90 text-white px-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MyUploads;
