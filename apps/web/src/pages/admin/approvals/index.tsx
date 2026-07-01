import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  RefreshCw,
  Loader2,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";
import { approvalService, type Approval } from "@/services/approval";
import { useOutletContext } from "react-router-dom";
import { ApprovalCard } from "./approval-card";

type Tab = "pending" | "responded";

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
              onClick={openMobileNav}
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
