/**
 * Question Preview Modal - Mobile-first design
 * Full screen on mobile for better review experience
 */

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Label,
} from "@bluethub/ui-kit";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pencil,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  type JobPreviewResponseData,
  type ExtractedQuestionPreview,
} from "@/services/question-job";
import { questionScanService } from "@/services/question-scan";
import {
  QuestionTypeEnum,
  DifficultyLevelEnum,
} from "@/services/question";

// ── Types ────────────────────────────────────────────────────────────────────

interface QuestionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  data: JobPreviewResponseData | null;
  loading: boolean;
}

interface QuestionState {
  status: "pending" | "approved" | "rejected" | "editing";
  edits?: Partial<ExtractedQuestionPreview>;
  rejectReason?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getQuestionTypeName(type: number): string {
  switch (type) {
    case QuestionTypeEnum.MultipleChoice:
      return "MCQ";
    case QuestionTypeEnum.ShortAnswer:
      return "Short";
    case QuestionTypeEnum.Essay:
      return "Essay";
    case QuestionTypeEnum.TrueOrFalse:
      return "T/F";
    case QuestionTypeEnum.FillInTheBlank:
      return "Fill";
    default:
      return "Other";
  }
}

function getDifficultyConfig(level: number) {
  switch (level) {
    case DifficultyLevelEnum.Easy:
      return { label: "Easy", color: "text-green-600", bg: "bg-green-100" };
    case DifficultyLevelEnum.Medium:
      return { label: "Medium", color: "text-amber-600", bg: "bg-amber-100" };
    case DifficultyLevelEnum.Hard:
      return { label: "Hard", color: "text-red-600", bg: "bg-red-100" };
    default:
      return { label: "?", color: "text-gray-600", bg: "bg-gray-100" };
  }
}

// ── Question Card Component ──────────────────────────────────────────────────

interface QuestionCardProps {
  question: ExtractedQuestionPreview;
  questionNumber: number;
  totalQuestions: number;
  state: QuestionState;
  isEditing: boolean;
  onEdit: () => void;
  onSaveEdit: (edits: Partial<ExtractedQuestionPreview>) => void;
  onCancelEdit: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  processing: boolean;
}

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  state,
  isEditing,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onApprove,
  onReject,
  processing,
}: QuestionCardProps) {
  const [editData, setEditData] = useState<Partial<ExtractedQuestionPreview>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const diffConfig = getDifficultyConfig(question.difficultyLevel);

  // Initialize edit data when entering edit mode
  const startEditing = () => {
    setEditData({
      title: question.title,
      textContent: question.textContent,
      questionType: question.questionType,
      difficultyLevel: question.difficultyLevel,
      marksAllocation: question.marksAllocation,
      options: [...question.options],
    });
    onEdit();
  };

  // Handle option edit
  const updateOption = (index: number, field: string, value: string | boolean) => {
    const newOptions = [...(editData.options || question.options)];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setEditData({ ...editData, options: newOptions });
  };

  // Render based on status
  if (state.status === "approved") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <p className="font-semibold text-gray-900 text-lg">Approved!</p>
        <p className="text-gray-500 text-sm mt-1">Added to question bank</p>
      </div>
    );
  }

  if (state.status === "rejected") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <p className="font-semibold text-gray-900 text-lg">Rejected</p>
        {state.rejectReason && (
          <p className="text-gray-500 text-sm mt-1 text-center px-4">
            "{state.rejectReason}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Question Header */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <Sparkles className={cn(
              "w-4 h-4",
              question.aiConfidenceScore >= 0.9 ? "text-green-500" :
              question.aiConfidenceScore >= 0.7 ? "text-amber-500" : "text-red-500"
            )} />
            <span className="text-xs font-medium text-gray-600">
              {Math.round(question.aiConfidenceScore * 100)}% confident
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", diffConfig.bg, diffConfig.color)}>
            {diffConfig.label}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-600">
            {getQuestionTypeName(question.questionType)}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-600">
            {question.marksAllocation} mark{question.marksAllocation !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-5 space-y-5">
        {/* Question Title */}
        {isEditing ? (
          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Question</Label>
            <Textarea
              value={editData.title || question.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="min-h-[100px] text-base rounded-xl"
              placeholder="Enter question text..."
            />
          </div>
        ) : (
          <div>
            <p className="text-base font-medium text-gray-900 leading-relaxed">
              {question.title}
            </p>
            {question.textContent && (
              <p className="text-sm text-gray-600 mt-2">{question.textContent}</p>
            )}
          </div>
        )}

        {/* Options (for MCQ) */}
        {question.questionType === QuestionTypeEnum.MultipleChoice && question.options.length > 0 && (
          <div className="space-y-2.5">
            <Label className="text-xs font-medium text-gray-500 block">Options</Label>
            {(isEditing ? editData.options || question.options : question.options).map((opt, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border-2 transition-colors",
                  opt.isCorrect
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white"
                )}
              >
                {isEditing ? (
                  <>
                    <Checkbox
                      checked={opt.isCorrect}
                      onCheckedChange={(checked) => updateOption(idx, "isCorrect", !!checked)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={opt.optionText}
                        onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                        placeholder="Option text"
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      opt.isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {opt.optionLabel}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 pt-0.5">{opt.optionText}</span>
                    {opt.isCorrect && (
                      <Check className="w-5 h-5 text-green-600 shrink-0" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Edit Mode Controls */}
        {isEditing && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</Label>
              <Select
                value={String(editData.questionType || question.questionType)}
                onValueChange={(v) => setEditData({ ...editData, questionType: parseInt(v) })}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">MCQ</SelectItem>
                  <SelectItem value="2">Short</SelectItem>
                  <SelectItem value="3">Essay</SelectItem>
                  <SelectItem value="4">T/F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Difficulty</Label>
              <Select
                value={String(editData.difficultyLevel || question.difficultyLevel)}
                onValueChange={(v) => setEditData({ ...editData, difficultyLevel: parseInt(v) })}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Marks</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={editData.marksAllocation || question.marksAllocation}
                onChange={(e) => setEditData({ ...editData, marksAllocation: parseInt(e.target.value) || 1 })}
                className="h-10 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {/* Reject Reason Input */}
        {showRejectInput && (
          <div className="space-y-3 p-4 bg-red-50 rounded-xl">
            <Label className="text-sm font-medium text-red-700">Why reject this question?</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incorrect answer marked, unclear question text..."
              className="min-h-[80px] rounded-xl bg-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onReject(rejectReason);
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                disabled={!rejectReason.trim() || processing}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700"
              >
                Confirm Reject
              </Button>
              <Button
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
                variant="outline"
                className="h-10 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions - Sticky Bottom */}
      {!showRejectInput && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 space-y-3">
          {isEditing ? (
            <div className="flex gap-3">
              <Button
                onClick={onCancelEdit}
                variant="outline"
                disabled={processing}
                className="flex-1 h-12 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSaveEdit(editData)}
                disabled={processing}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700"
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Save & Approve
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowRejectInput(true)}
                  variant="outline"
                  disabled={processing}
                  className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-5 h-5 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={startEditing}
                  variant="outline"
                  disabled={processing}
                  className="flex-1 h-12 rounded-xl"
                >
                  <Pencil className="w-5 h-5 mr-1" />
                  Edit
                </Button>
              </div>
              <Button
                onClick={onApprove}
                disabled={processing}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg font-bold shadow-lg shadow-green-500/30"
              >
                {processing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Check className="w-6 h-6 mr-2" />
                    Approve Question
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function QuestionPreviewModal({
  open,
  onClose,
  jobId,
  data,
  loading,
}: QuestionPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Map<number, QuestionState>>(new Map());
  const [processing, setProcessing] = useState(false);

  // Get current question state
  const getQuestionState = (index: number): QuestionState => {
    return questionStates.get(index) || { status: "pending" };
  };

  // Update question state
  const updateQuestionState = (index: number, state: QuestionState) => {
    setQuestionStates((prev) => new Map(prev).set(index, state));
  };

  // Navigation
  const goNext = () => {
    if (data && currentIndex < data.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Handle approve
  const handleApprove = async (index: number, edits?: Partial<ExtractedQuestionPreview>) => {
    if (!data) return;

    setProcessing(true);
    try {
      const result = await questionScanService.confirmQuestion({
        scanSessionId: data.scanSessionId,
        questionIndex: index,
        edits: edits
          ? {
              title: edits.title,
              textContent: edits.textContent,
              questionType: edits.questionType,
              difficultyLevel: edits.difficultyLevel,
              marksAllocation: edits.marksAllocation,
              options: edits.options,
            }
          : undefined,
      });

      if (result.data.isSuccess) {
        updateQuestionState(index, { status: "approved" });
        toast.success("Question approved!");

        // Auto-advance after a short delay
        setTimeout(() => {
          const nextPending = data.questions.findIndex(
            (_, i) => i > index && getQuestionState(i).status === "pending"
          );
          if (nextPending !== -1) {
            setCurrentIndex(nextPending);
          }
        }, 1000);
      } else {
        toast.error("Failed to approve question");
      }
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Failed to approve question");
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async (index: number, reason: string) => {
    if (!data) return;

    setProcessing(true);
    try {
      const result = await questionScanService.rejectQuestion({
        scanSessionId: data.scanSessionId,
        questionIndex: index,
        reason,
      });

      if (result.data.isSuccess) {
        updateQuestionState(index, { status: "rejected", rejectReason: reason });
        toast.success("Question rejected");

        // Auto-advance after a short delay
        setTimeout(() => {
          const nextPending = data.questions.findIndex(
            (_, i) => i > index && getQuestionState(i).status === "pending"
          );
          if (nextPending !== -1) {
            setCurrentIndex(nextPending);
          }
        }, 1000);
      } else {
        toast.error("Failed to reject question");
      }
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Failed to reject question");
    } finally {
      setProcessing(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, approved: 0, rejected: 0, pending: 0 };

    let approved = 0;
    let rejected = 0;
    let pending = 0;

    data.questions.forEach((_, index) => {
      const state = getQuestionState(index);
      if (state.status === "approved") approved++;
      else if (state.status === "rejected") rejected++;
      else pending++;
    });

    return { total: data.questions.length, approved, rejected, pending };
  }, [data, questionStates]);

  // Current question
  const currentQuestion = data?.questions[currentIndex];
  const currentState = getQuestionState(currentIndex);

  // Handle complete session
  const handleComplete = async () => {
    if (!data) return;

    try {
      await questionScanService.completeSession(data.scanSessionId);
      toast.success("Review complete!");
      onClose();
    } catch (err) {
      console.error("Complete error:", err);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 flex flex-col",
          // Mobile: full screen
          "fixed inset-0 translate-x-0 translate-y-0 max-w-full rounded-none",
          // Desktop: large modal
          "sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
          "sm:max-w-lg sm:max-h-[90vh] sm:rounded-3xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
          <button
            onClick={handleComplete}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Review Questions</span>
          </div>

          {data?.fileUrl && (
            <a
              href={data.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
            >
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </a>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-500">Loading questions...</p>
          </div>
        ) : !data || data.questions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">No questions found in this scan</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {stats.approved}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {stats.rejected}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    {stats.pending}
                  </span>
                </div>
                <span className="text-gray-500">
                  {stats.approved + stats.rejected} / {stats.total} reviewed
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1">
                {data.questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "flex-1 h-1.5 rounded-full transition-colors",
                      idx === currentIndex
                        ? "bg-purple-600"
                        : getQuestionState(idx).status === "approved"
                        ? "bg-green-400"
                        : getQuestionState(idx).status === "rejected"
                        ? "bg-red-400"
                        : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={data.questions.length}
                state={currentState}
                isEditing={currentState.status === "editing"}
                onEdit={() => updateQuestionState(currentIndex, { status: "editing" })}
                onSaveEdit={(edits) => handleApprove(currentIndex, edits)}
                onCancelEdit={() => updateQuestionState(currentIndex, { status: "pending" })}
                onApprove={() => handleApprove(currentIndex)}
                onReject={(reason) => handleReject(currentIndex, reason)}
                processing={processing}
              />
            )}

            {/* Navigation Arrows */}
            {currentState.status !== "editing" && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 sm:left-4"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}
                {currentIndex < data.questions.length - 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 sm:right-4"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </>
            )}

            {/* Done Button (when all reviewed) */}
            {stats.pending === 0 && (
              <div className="p-4 border-t border-gray-100 shrink-0">
                <Button
                  onClick={handleComplete}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-lg font-bold"
                >
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  Done - {stats.approved} Added to Bank
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
