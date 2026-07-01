import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  AlertCircle,
  User,
  GraduationCap,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import toast from "react-hot-toast";
import { type Approval, type ApprovalPayload } from "@/services/approval";

const getPayload = (raw: ApprovalPayload | string | null): Record<string, any> => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw as Record<string, any>;
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  if (s === "approved")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
};

interface ApprovalCardProps {
  approval: Approval;
  onRespond: (id: string, approved: boolean, reason?: string) => Promise<void>;
  responding: string | null;
}

export const ApprovalCard = ({
  approval,
  onRespond,
  responding,
}: ApprovalCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const payload = getPayload(approval.payload);
  const isPending = approval.status?.toLowerCase() === "pending";
  const isResponding = responding === approval.id;

  const handleApprove = () => onRespond(approval.id, true);
  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    await onRespond(approval.id, false, reason.trim());
    setShowReject(false);
    setReason("");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-chestnut/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-chestnut" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {payload.Title || approval.entityType}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              {payload.SubjectName && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen className="w-3 h-3" />
                  {payload.SubjectName}
                </span>
              )}
              {payload.ClassName && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <GraduationCap className="w-3 h-3" />
                  {payload.ClassName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />
              {approval.requestedByName} · {approval.operationType} · {formatDate(approval.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={approval.status} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {payload.Description && (
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
              <span className="font-medium text-gray-700">Description: </span>
              {payload.Description}
            </p>
          )}
          {payload.Term && (
            <p className="text-[11px] text-gray-400">Term: {payload.Term}</p>
          )}
          {payload.ExamDate && (
            <p className="text-[11px] text-gray-400">Exam date: {formatDate(payload.ExamDate)}</p>
          )}
          {payload.TotalMarks != null && (
            <p className="text-[11px] text-gray-400">Total marks: {payload.TotalMarks}</p>
          )}
          {approval.requestedByEmail && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {approval.requestedByName} ({approval.requestedByEmail})
            </p>
          )}
          {approval.rejectionReason && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span><span className="font-medium">Rejection reason:</span> {approval.rejectionReason}</span>
            </div>
          )}
          {approval.expiresAt && isPending && (
            <p className="text-[11px] text-gray-400">
              Expires: {formatDate(approval.expiresAt)}
            </p>
          )}
          {approval.respondedAt && (
            <p className="text-[11px] text-gray-400">
              Responded: {formatDate(approval.respondedAt)}
            </p>
          )}

          <div className="mt-2">
            <p className="text-[11px] font-medium text-gray-500 mb-1">Payload (JSON)</p>
            <pre className="text-[10px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
              {(() => { try { return JSON.stringify(typeof approval.payload === "string" ? JSON.parse(approval.payload) : approval.payload, null, 2); } catch { return String(approval.payload); } })()}
            </pre>
          </div>
        </div>
      )}

      {isPending && (
        <div className="px-4 pb-4 space-y-2">
          {showReject ? (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection (required)"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut outline-none resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={isResponding}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50"
                >
                  {isResponding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Confirm Reject
                </Button>
                <Button
                  onClick={() => { setShowReject(false); setReason(""); }}
                  disabled={isResponding}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={isResponding}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
              >
                {isResponding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve
              </Button>
              <Button
                onClick={() => setShowReject(true)}
                disabled={isResponding}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
