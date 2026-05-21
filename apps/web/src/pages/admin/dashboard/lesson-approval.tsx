import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  BookOpen,
  GraduationCap,
  Loader2,
  RefreshCw,
  ChevronRight,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { lessonService, type ApprovalItemDto } from "@/services/lesson";
import LessonReviewModal from "./lesson-review-modal";
import toast from "react-hot-toast";

type FilterTab = "all" | "pending" | "approved" | "rejected";

const buildApprovalLessonTitle = (approval: ApprovalItemDto): string => {
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

const LessonApproval = () => {
  const [approvals, setApprovals] = useState<ApprovalItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItemDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lessonService.getPendingApprovals();
      const data = (res.data as any)?.data;
      setApprovals(data?.items ?? []);
    } catch (err) {
      setError("Failed to load approvals. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  // Stats
  const pending = approvals.filter((a) => a.status === "Pending").length;
  const approved = approvals.filter((a) => a.status === "Approved").length;
  const rejected = approvals.filter((a) => a.status === "Rejected").length;

  // Filtered list
  const visible = approvals.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return a.status === "Pending";
    if (filter === "approved") return a.status === "Approved";
    if (filter === "rejected") return a.status === "Rejected";
    return true;
  });

  const handleReview = (approval: ApprovalItemDto) => {
    setSelectedApproval(approval);
    setReviewOpen(true);
  };

  const handleApprove = async (approvalId: string) => {
    setActionLoading(true);
    try {
      await lessonService.respondToApproval(approvalId, { approved: true });
      toast.success("Lesson approved successfully");
      setReviewOpen(false);
      fetchApprovals();
    } catch (err) {
      toast.error("Failed to approve lesson");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (approvalId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await lessonService.respondToApproval(approvalId, {
        approved: false,
        rejectionReason: reason,
      });
      toast.success("Lesson rejected");
      setReviewOpen(false);
      fetchApprovals();
    } catch (err) {
      toast.error("Failed to reject lesson");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getTimeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pending },
    { key: "approved", label: "Approved", count: approved },
    { key: "rejected", label: "Rejected", count: rejected },
    { key: "all", label: "All", count: approvals.length },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 font-poppins">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Lesson Approvals
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and approve teacher lesson submissions
              </p>
            </div>
            <button
              onClick={fetchApprovals}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-chestnut to-chestnut/80 rounded-2xl p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText size={18} />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold">{approvals.length}</p>
            <p className="text-white/70 text-xs mt-1">Total submissions</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={18} className="text-amber-500" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pending}</p>
            <p className="text-gray-400 text-xs mt-1">Awaiting review</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                Approved
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{approved}</p>
            <p className="text-gray-400 text-xs mt-1">Approved lessons</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <XCircle size={18} className="text-red-400" />
              </div>
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                Rejected
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{rejected}</p>
            <p className="text-gray-400 text-xs mt-1">Requires revision</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? "bg-chestnut text-white shadow-lg shadow-chestnut/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-chestnut/30"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md ${
                  filter === tab.key
                    ? "bg-white/20"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-chestnut mb-3" />
            <p className="text-sm text-gray-500">Loading approvals...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchApprovals}
              className="px-4 py-2 rounded-xl bg-chestnut text-white text-sm font-medium hover:bg-chestnut/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              No {filter !== "all" ? filter : ""} approvals
            </p>
            <p className="text-sm text-gray-400">
              {filter === "pending"
                ? "All caught up! No lessons waiting for your review."
                : "No lessons found in this category."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {visible.map((approval) => {
              const isPending = approval.status === "Pending";
              const isApproved = approval.status === "Approved";
              const isRejected = approval.status === "Rejected";

              return (
                <div
                  key={approval.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
                    isPending
                      ? "border-amber-200 hover:border-amber-300"
                      : isApproved
                      ? "border-emerald-200"
                      : "border-red-200"
                  }`}
                >
                  {/* Status accent bar */}
                  <div
                    className={`h-1 ${
                      isPending
                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : isApproved
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                  />

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Lesson info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isPending
                                ? "bg-amber-50"
                                : isApproved
                                ? "bg-emerald-50"
                                : "bg-red-50"
                            }`}
                          >
                            {isPending && (
                              <Clock size={20} className="text-amber-500" />
                            )}
                            {isApproved && (
                              <CheckCircle2
                                size={20}
                                className="text-emerald-500"
                              />
                            )}
                            {isRejected && (
                              <XCircle size={20} className="text-red-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Topic / Title */}
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                              {buildApprovalLessonTitle(approval)}
                            </h3>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {approval.requestedByName}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                {approval.lesson?.subjectName ?? "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap size={12} />
                                {approval.lesson?.className ?? "—"}
                              </span>
                            </div>

                            {/* Aim preview */}
                            {approval.lesson?.aim && (
                              <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                <span className="font-semibold text-gray-500">
                                  Aim:
                                </span>{" "}
                                {approval.lesson.aim}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        {/* Date & Media count */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{getTimeAgo(approval.createdAt)}</span>
                          {(approval.lesson?.mediaCount ?? 0) > 0 && (
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                              <FileText size={10} />
                              {approval.lesson?.mediaCount} files
                            </span>
                          )}
                        </div>

                        {/* Action button */}
                        {isPending ? (
                          <button
                            onClick={() => handleReview(approval)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-chestnut text-white text-sm font-semibold hover:bg-chestnut/90 transition-colors shadow-sm"
                          >
                            Review
                            <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReview(approval)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            View Details
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApproval && (
        <LessonReviewModal
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          approval={selectedApproval}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={actionLoading}
        />
      )}
    </>
  );
};

export default LessonApproval;
