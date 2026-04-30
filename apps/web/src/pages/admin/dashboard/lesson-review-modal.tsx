import { useState, type ReactElement } from "react";
import { X, Check, Download, Mail } from "lucide-react";

// const BRAND = "#292382";

type LessonStatus = "Awaiting" | "Approved" | "Rejected" | "Pending";
type ModalView = "review" | "reject" | "approved" | "rejected";

interface MediaFile {
    name: string;
    url?: string;
}

export interface LessonData {
    id: number;
    title: string;
    teacher: string;
    subject: string;
    className: string;
    term: string;
    submitted: string;
    status: LessonStatus;
    objectives?: string;
    notes?: string;
    mediaFiles?: MediaFile[];
    approvedBy?: string;
    approvedDate?: string;
    previousRejectionReason?: string;
}

interface LessonReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson: LessonData;
    onApprove?: (id: number) => void;
    onReject?: (id: number, reason: string, feedback: string) => void;
}

const REJECTION_REASONS = [
    "Incomplete Content",
    "Unclear Objectives",
    "Off - Curriculum",
    "Wrong Media Files",
    "Low Content Quality",
    "Others",
];

const statusIcon: Record<LessonStatus, { bg: string; border: string; icon: ReactElement }> = {
    Awaiting: {
        bg: "#FEF3C7", border: "#FDE68A",
        icon: <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    },
    Pending: {
        bg: "#FEF3C7", border: "#FDE68A",
        icon: <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    },
    Approved: {
        bg: "#D1FAE5", border: "#6EE7B7",
        icon: <Check className="w-4 h-4 text-emerald-500" />,
    },
    Rejected: {
        bg: "#FFE4E6", border: "#FECDD3",
        icon: <X className="w-4 h-4 text-red-400" />,
    },
};

const LessonReviewModal = ({
    open,
    onOpenChange,
    lesson,
    onApprove,
    onReject,
}: LessonReviewModalProps) => {
    // Determine initial view from status
    const initialView = (): ModalView => {
        if (lesson.status === "Approved")  return "approved";
        if (lesson.status === "Rejected")  return "rejected";
        return "review"; // Awaiting or Pending
    };

    const [view, setView] = useState<ModalView>(initialView);
    const [selectedReason, setSelectedReason] = useState<string>("");
    const [feedback, setFeedback] = useState("");
    const [notifyEmail, setNotifyEmail] = useState(true);

    const iconCfg = statusIcon[lesson.status];

    const handleClose = () => {
        onOpenChange(false);
        // reset rejection form
        setTimeout(() => {
            setView(initialView());
            setSelectedReason("");
            setFeedback("");
        }, 300);
    };

    const handleApprove = () => {
        onApprove?.(lesson.id);
        handleClose();
    };

    const handleSendRejection = () => {
        if (!selectedReason || !feedback.trim()) return;
        onReject?.(lesson.id, selectedReason, feedback);
        handleClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">

                {/* ── Close button ──────────────────────────────────────── */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                >
                    <X size={13} className="text-gray-500" />
                </button>

                {/* ══════════════════════════════════════════════════════ */}
                {/* VIEW: REVIEW (Awaiting / Pending)                      */}
                {/* ══════════════════════════════════════════════════════ */}
                {view === "review" && (
                    <>
                        <div className="px-5 pt-5 pb-4">
                            {/* Lesson header card */}
                            <div
                                className="flex items-start gap-3 p-3 rounded-xl border mb-5"
                                style={{ backgroundColor: iconCfg.bg, borderColor: iconCfg.border }}
                            >
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    {iconCfg.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{lesson.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {lesson.teacher} · {lesson.subject} · {lesson.className} · {lesson.term}
                                    </p>
                                </div>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Teacher</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.teacher}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Subject</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.subject}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Class</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.className}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Submitted</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.submitted}</p>
                                </div>
                            </div>

                            {/* Media files */}
                            {lesson.mediaFiles && lesson.mediaFiles.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-700 mb-2">
                                        Upload Media({lesson.mediaFiles.length} Files)
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {lesson.mediaFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg border border-red-100 bg-red-50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                                        <path d="M14 2v6h6"/>
                                                    </svg>
                                                    <span className="text-xs text-gray-600 font-medium truncate max-w-45">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                    <Download size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lesson objectives */}
                            {lesson.objectives && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Lesson objectives
                                    </p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.objectives}</p>
                                </div>
                            )}

                            {/* Lesson notes */}
                            {lesson.notes && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Lesson Notes
                                    </p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setView("reject")}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#16a34a" }}
                            >
                                <Check size={12} />
                                Approve
                            </button>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════════════ */}
                {/* VIEW: REJECT FORM                                      */}
                {/* ══════════════════════════════════════════════════════ */}
                {view === "reject" && (
                    <>
                        <div className="px-5 pt-5 pb-4">
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">Reject lesson submission</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Provide a reason and feedback for the teacher</p>
                                </div>
                            </div>

                            {/* Lesson mini card */}
                            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700 leading-tight">{lesson.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {lesson.teacher} · {lesson.subject} · {lesson.className} · {lesson.term}
                                    </p>
                                </div>
                            </div>

                            {/* Rejection reasons */}
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-700 mb-2.5">
                                    Rejection reason <span className="text-red-500">*</span>
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {REJECTION_REASONS.map(reason => {
                                        const active = selectedReason === reason;
                                        return (
                                            <button
                                                key={reason}
                                                onClick={() => setSelectedReason(reason)}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all"
                                                style={{
                                                    borderColor: active ? "#292382" : "#e5e7eb",
                                                    backgroundColor: active ? "#f5f5f5" : "#fff",
                                                    color: active ? "#292382" : "#4b5563",
                                                }}
                                            >
                                                <span
                                                    className="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center"
                                                    style={{ borderColor: active ? "#292382" : "#d1d5db" }}
                                                >
                                                    {active && (
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full bg-chestnut"
                                                        />
                                                    )}
                                                </span>
                                                {reason}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Feedback textarea */}
                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-700 mb-1.5">
                                    Feedback To Teacher <span className="text-red-500">*</span>
                                </p>
                                <div className="relative">
                                    <textarea
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value.slice(0, 300))}
                                        placeholder="Write a specific feedback to the teacher he/she can know what to fix and resubmit"
                                        rows={4}
                                        className="w-full ring-2 ring-gray-100 focus:ring-chestnut/30 border-0 rounded-xl px-3 py-2.5 text-xs text-gray-700 placeholder:text-gray-300 outline-none bg-gray-50 resize-none font-medium"
                                    />
                                    <div className="flex items-center justify-between px-1 mt-1">
                                        <span className="text-[10px] text-gray-400">Be clear and constructive</span>
                                        <span className="text-[10px] text-gray-400">{feedback.length}/300</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notify toggle */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
                                <div>
                                    <p className="text-xs font-bold text-blue-700">Notify teacher via email</p>
                                    <p className="text-[10px] text-blue-400 mt-0.5">
                                        {lesson.teacher} will receive this feedback by email
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setNotifyEmail(p => !p)}
                                        className="relative w-10 h-5 rounded-full transition-colors shrink-0"
                                        style={{ backgroundColor: notifyEmail ? "#292382" : "#d1d5db" }}
                                    >
                                        <span
                                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
                                            style={{ left: notifyEmail ? "calc(100% - 18px)" : "2px" }}
                                        />
                                    </button>
                                    <Mail size={14} className="text-blue-400" />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
                            <button
                                onClick={() => setView("review")}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendRejection}
                                disabled={!selectedReason || !feedback.trim()}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#ef4444" }}
                            >
                                <X size={12} />
                                Send Rejection
                            </button>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════════════ */}
                {/* VIEW: APPROVED (read-only)                             */}
                {/* ══════════════════════════════════════════════════════ */}
                {view === "approved" && (
                    <>
                        <div className="px-5 pt-5 pb-4">
                            {/* Header card — green */}
                            <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{lesson.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {lesson.teacher} · {lesson.subject} · {lesson.className} · {lesson.term}
                                    </p>
                                </div>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Teacher</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.teacher}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Subject</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.subject}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Class</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.className}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Submitted</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.submitted}</p>
                                </div>
                            </div>

                            {/* Approved banner */}
                            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4">
                                <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-600">Approved</p>
                                    {lesson.approvedBy && lesson.approvedDate && (
                                        <p className="text-[10px] text-emerald-500 mt-0.5">
                                            Approved by {lesson.approvedBy} on {lesson.approvedDate}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Media files */}
                            {lesson.mediaFiles && lesson.mediaFiles.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-700 mb-2">
                                        Upload Media({lesson.mediaFiles.length} Files)
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                        {lesson.mediaFiles.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-red-100 bg-red-50">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                                        <path d="M14 2v6h6"/>
                                                    </svg>
                                                    <span className="text-xs text-gray-600 font-medium truncate max-w-45">{file.name}</span>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600"><Download size={13} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {lesson.objectives && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lesson objectives</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.objectives}</p>
                                </div>
                            )}
                            {lesson.notes && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lesson Notes</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end px-5 py-4 border-t border-gray-100">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════════════ */}
                {/* VIEW: REJECTED (read-only)                             */}
                {/* ══════════════════════════════════════════════════════ */}
                {view === "rejected" && (
                    <>
                        <div className="px-5 pt-5 pb-4">
                            {/* Header card — red */}
                            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-100 bg-red-50 mb-5">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <X className="w-4 h-4 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">{lesson.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {lesson.teacher} · {lesson.subject} · {lesson.className} · {lesson.term}
                                    </p>
                                </div>
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Teacher</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.teacher}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Subject</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.subject}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Class</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.className}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Submitted</p>
                                    <p className="text-sm font-bold text-gray-800">{lesson.submitted}</p>
                                </div>
                            </div>

                            {lesson.objectives && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lesson objectives</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.objectives}</p>
                                </div>
                            )}
                            {lesson.notes && (
                                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lesson Notes</p>
                                    <p className="text-xs text-gray-600 leading-relaxed">{lesson.notes}</p>
                                </div>
                            )}

                            {/* Previous rejection reason */}
                            {lesson.previousRejectionReason && (
                                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1.5">
                                        Previous rejection reason
                                    </p>
                                    <p className="text-xs text-red-500 leading-relaxed">
                                        {lesson.previousRejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end px-5 py-4 border-t border-gray-100">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
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