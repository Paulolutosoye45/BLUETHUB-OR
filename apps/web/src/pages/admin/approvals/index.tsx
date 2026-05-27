import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  AlertCircle,
  User,
  GraduationCap,
  Menu,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import toast from "react-hot-toast";
import { approvalService, type Approval, type ApprovalPayload } from "@/services/approval";
import { useOutletContext } from "react-router-dom";

type Tab = "pending" | "responded";

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

const ApprovalCard = ({
  approval,
  onRespond,
  responding,
}: {
  approval: Approval;
  onRespond: (id: string, approved: boolean, reason?: string) => Promise<void>;
  responding: string | null;
}) => {
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
      {/* Card header */}
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

      {/* Expanded details */}
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

      {/* Actions — only for pending */}
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

const ApprovalsPage = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await approvalService.getPendingApprovals();
      const items = (res.data as any)?.data?.items;
      setApprovals(Array.isArray(items) ? items : []);
    } catch {
      toast.error("Could not load approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const handleRespond = async (id: string, approved: boolean, rejectionReason?: string) => {
    setResponding(id);
    try {
      const res = await approvalService.respondToApproval(id, { approved, rejectionReason });
      const ok = (res.data as any)?.status === "successful" || res.status === 200;
      if (ok) {
        toast.success(approved ? "Approval granted" : "Approval rejected");
        setApprovals((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status: approved ? "Approved" : "Rejected", respondedAt: new Date().toISOString() }
              : a
          )
        );
      } else {
        toast.error((res.data as any)?.responseMessage || "Response failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.responseMessage || "Failed to respond");
    } finally {
      setResponding(null);
    }
  };

  const pending = approvals.filter((a) => a.status?.toLowerCase() === "pending");
  const responded = approvals.filter((a) => a.status?.toLowerCase() !== "pending");
  const shown = activeTab === "pending" ? pending : responded;

  return (
    <div className="lg:p-6 font-poppins">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-chestnut">
          <div className="flex items-center gap-4">
            <Menu
              className="lg:hidden w-5 h-5 text-white cursor-pointer"
              onClick={openMobileNav}  // ✅ not onClick={() => openMobileNav()}
            />
            <div>
              <p className="text-white font-semibold text-sm">Approvals</p>
              <p className="text-white/60 text-[10px]">
                Review and respond to pending requests
              </p>
            </div>
          </div>

          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Body */}
        <div className="bg-white/70 backdrop-blur-sm  p-3 lg:p-6">
          <div className="max-w-3xl mx-auto">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total", value: approvals.length, color: "text-gray-900", bg: "bg-gray-50" },
                { label: "Pending", value: pending.length, color: "text-amber-700", bg: "bg-amber-50" },
                { label: "Responded", value: responded.length, color: "text-emerald-700", bg: "bg-emerald-50" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center border border-white`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
              {(["pending", "responded"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab} ({tab === "pending" ? pending.length : responded.length})
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-chestnut animate-spin" />
                <p className="text-sm text-gray-400">Loading approvals...</p>
              </div>
            ) : shown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <CheckCircle2 className="w-10 h-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-400">
                  {activeTab === "pending" ? "No pending approvals" : "No responded approvals yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {shown.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    onRespond={handleRespond}
                    responding={responding}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
