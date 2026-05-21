import { useState } from "react";
import {
  X,
  Clock,
  User,
  BookOpen,
  GraduationCap,
  Mail,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Target,
  FileCheck,
} from "lucide-react";
import type { ApprovalItemDto } from "@/services/lesson";

type ModalView = "review" | "reject" | "approved" | "rejected";

interface LessonReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: ApprovalItemDto;
  onApprove: (approvalId: string) => void;
  onReject: (approvalId: string, reason: string) => void;
  isLoading?: boolean;
}

const REJECTION_REASONS = [
  { id: "incomplete", label: "Incomplete Content", icon: FileText },
  { id: "unclear", label: "Unclear Objectives", icon: Target },
  { id: "curriculum", label: "Off-Curriculum", icon: BookOpen },
  { id: "media", label: "Wrong Media Files", icon: FileCheck },
  { id: "quality", label: "Low Content Quality", icon: AlertTriangle },
  { id: "other", label: "Other Reason", icon: Mail },
];

const buildLessonTitle = (approval: ApprovalItemDto): string => {
  const lesson = approval.lesson;
  if (!lesson) return "Lesson Submission";

  const parts = [
    lesson.subjectName,
    lesson.topicName,
    lesson.subTopic ?? lesson.subTopicName,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0);

  return parts.length > 0 ? parts.join(" - ") : "Lesson Submission";
};

const LessonReviewModal = ({
  open,
  onOpenChange,
  approval,
  onApprove,
  onReject,
  isLoading = false,
}: LessonReviewModalProps) => {
  const isPending = approval.status === "Pending";
  const isApproved = approval.status === "Approved";

  const initialView = (): ModalView => {
    if (isApproved) return "approved";
    if (approval.status === "Rejected") return "rejected";
    return "review";
  };

  const [view, setView] = useState<ModalView>(initialView);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setView(initialView());
      setSelectedReason("");
      setFeedback("");
    }, 300);
  };

  const handleApprove = () => {
    onApprove(approval.id);
  };

  const handleSendRejection = () => {
    const reasonLabel =
      REJECTION_REASONS.find((r) => r.id === selectedReason)?.label ?? "";
    const fullReason = feedback.trim()
      ? `${reasonLabel}: ${feedback.trim()}`
      : reasonLabel;
    onReject(approval.id, fullReason);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!open) return null;

  const lesson = approval.lesson;
  const lessonTitle = buildLessonTitle(approval);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X size={14} className="text-gray-500" />
        </button>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: REVIEW (Pending)                                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "review" && (
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-chestnut to-chestnut/80 px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                    Pending Review
                  </p>
                  <h2 className="text-white font-bold text-lg leading-tight truncate">
                    {lessonTitle}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Teacher info card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 mb-5">
                <div className="w-10 h-10 rounded-full bg-chestnut/10 flex items-center justify-center">
                  <User size={18} className="text-chestnut" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {approval.requestedByName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {approval.requestedByEmail}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Submitted
                  </p>
                  <p className="text-xs font-semibold text-gray-600">
                    {formatDate(approval.createdAt)}
                  </p>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <BookOpen size={16} className="mx-auto text-chestnut mb-1.5" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Subject
                  </p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {lesson?.subjectName ?? "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <GraduationCap
                    size={16}
                    className="mx-auto text-chestnut mb-1.5"
                  />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Class
                  </p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {lesson?.className ?? "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <FileText size={16} className="mx-auto text-chestnut mb-1.5" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Media
                  </p>
                  <p className="text-xs font-bold text-gray-800">
                    {lesson?.mediaCount ?? 0} files
                  </p>
                </div>
              </div>

              {/* Aim & Objectives */}
              {lesson?.aim && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-amber-600" />
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Aim & Objectives
                    </p>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {lesson.aim}
                  </p>
                </div>
              )}

              {/* Description */}
              {lesson?.description && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck size={14} className="text-gray-500" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Lesson Description
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {isPending && (
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setView("reject")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 border-2 border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve Lesson
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: REJECT FORM                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "reject" && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-400 px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <XCircle size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                    Reject Submission
                  </p>
                  <h2 className="text-white font-bold text-lg leading-tight truncate">
                    {lessonTitle}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Teacher mini card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 mb-5">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <User size={16} className="text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">
                    {approval.requestedByName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lesson?.subjectName} · {lesson?.className}
                  </p>
                </div>
              </div>

              {/* Rejection reasons */}
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Rejection Reason <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {REJECTION_REASONS.map((reason) => {
                    const active = selectedReason === reason.id;
                    const Icon = reason.icon;
                    return (
                      <button
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                          active
                            ? "border-chestnut bg-chestnut/5"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            active ? "bg-chestnut/10" : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            size={14}
                            className={active ? "text-chestnut" : "text-gray-400"}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            active ? "text-chestnut" : "text-gray-600"
                          }`}
                        >
                          {reason.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback textarea */}
              <div className="mb-5">
                <p className="text-sm font-bold text-gray-700 mb-2">
                  Feedback to Teacher <span className="text-red-500">*</span>
                </p>
                <div className="relative">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                    placeholder="Provide constructive feedback so the teacher knows what to improve..."
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 outline-none bg-gray-50 resize-none focus:border-chestnut/40 focus:bg-white transition-all"
                  />
                  <div className="flex items-center justify-between px-1 mt-1.5">
                    <span className="text-[10px] text-gray-400">
                      Be clear and constructive
                    </span>
                    <span
                      className={`text-[10px] ${
                        feedback.length > 450 ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {feedback.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* Email notification toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      Notify via email
                    </p>
                    <p className="text-[10px] text-blue-400">
                      Teacher will receive feedback by email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifyEmail((p) => !p)}
                  className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                  style={{ backgroundColor: notifyEmail ? "#292382" : "#d1d5db" }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                    style={{ left: notifyEmail ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setView("review")}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSendRejection}
                disabled={!selectedReason || !feedback.trim() || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Send Rejection
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: APPROVED (read-only)                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "approved" && (
          <>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                    Approved
                  </p>
                  <h2 className="text-white font-bold text-lg leading-tight truncate">
                    {lessonTitle}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Success banner */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 mb-5">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">
                    This lesson has been approved
                  </p>
                  <p className="text-xs text-emerald-500">
                    Approved on {formatDate(approval.createdAt)}
                  </p>
                </div>
              </div>

              {/* Info cards */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Teacher</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {approval.requestedByName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase">Subject</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {lesson?.subjectName ?? "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase">Class</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {lesson?.className ?? "—"}
                    </p>
                  </div>
                </div>

                {lesson?.aim && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">
                      Aim & Objectives
                    </p>
                    <p className="text-sm text-gray-600">{lesson.aim}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* VIEW: REJECTED (read-only)                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {view === "rejected" && (
          <>
            <div className="bg-gradient-to-r from-red-500 to-red-400 px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <XCircle size={22} className="text-white" />
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                    Rejected
                  </p>
                  <h2 className="text-white font-bold text-lg leading-tight truncate">
                    {lessonTitle}
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {/* Info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Teacher</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {approval.requestedByName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase">Subject</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {lesson?.subjectName ?? "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase">Class</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {lesson?.className ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection reason banner */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide">
                    Rejection Reason
                  </p>
                </div>
                <p className="text-sm text-red-700">
                  {approval.rejectionReason?.trim()
                    ? approval.rejectionReason
                    : "This submission was rejected. The teacher has been notified and can resubmit after making corrections."}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonReviewModal;
