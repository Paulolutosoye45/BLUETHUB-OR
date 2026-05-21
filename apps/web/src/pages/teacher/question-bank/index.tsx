/**
 * Question Bank - Scan Questions Page
 * Mobile-first responsive design
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  FileImage,
  FileText,
  RefreshCw,
  Eye,
  Sparkles,
  Zap,
  XCircle,
  ScanLine,
  Plus,
} from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { questionJobService, JobStatusEnum, type JobListItem, type JobPreviewResponseData, type JobSummaryDto } from "@/services/question-job";
import { questionScanService, type ScanQuotaResponseData } from "@/services/question-scan";
import ScanUploadModal from "./components/scan-upload-modal";
import QuestionPreviewModal from "./components/question-preview-modal";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getStatusConfig(status: JobStatusEnum) {
  switch (status) {
    case JobStatusEnum.Pending:
      return {
        icon: Clock,
        label: "Queued",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    case JobStatusEnum.Processing:
      return {
        icon: Loader2,
        label: "Processing",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
        animate: true,
      };
    case JobStatusEnum.Completed:
      return {
        icon: CheckCircle2,
        label: "Ready",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case JobStatusEnum.PartiallyCompleted:
      return {
        icon: CheckCircle2,
        label: "Partial",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    case JobStatusEnum.Failed:
      return {
        icon: XCircle,
        label: "Failed",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        icon: Clock,
        label: "Unknown",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        dot: "bg-gray-500",
      };
  }
}

// ── Job Card Component ───────────────────────────────────────────────────────

interface JobCardProps {
  job: JobListItem;
  onPreview: () => void;
  onRetry: () => void;
}

function JobCard({ job, onPreview, onRetry }: JobCardProps) {
  const config = getStatusConfig(job.status);
  const isPreviewable = job.status === JobStatusEnum.Completed || job.status === JobStatusEnum.PartiallyCompleted;
  const isRetryable = job.status === JobStatusEnum.Failed;
  const isProcessing = job.status === JobStatusEnum.Processing;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border overflow-hidden transition-all active:scale-[0.98] md:hover:shadow-md md:hover:-translate-y-0.5",
        config.border,
        isPreviewable && "shadow-sm"
      )}
      onClick={isPreviewable ? onPreview : undefined}
    >
      <div className="p-4">
        {/* Top Row */}
        <div className="flex items-start gap-3">
          {/* File Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            config.bg
          )}>
            {job.fileType === "pdf" ? (
              <FileText className={cn("w-6 h-6", config.color)} />
            ) : (
              <FileImage className={cn("w-6 h-6", config.color)} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base truncate pr-2">
              {job.fileName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {job.subjectName}
            </p>

            {/* Status Row */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  config.dot,
                  isProcessing && "animate-pulse"
                )} />
                <span className={cn("text-xs font-medium", config.color)}>
                  {config.label}
                </span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400">
                {formatDate(job.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isPreviewable && (
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
              )}>
                <Eye className="w-5 h-5 text-white" />
              </div>
            )}
            {isRetryable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 active:bg-red-200"
              >
                <RefreshCw className="w-5 h-5 text-red-600" />
              </button>
            )}
            {isProcessing && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Questions Extracted Badge */}
        {job.questionsExtracted !== undefined && job.questionsExtracted > 0 && (
          <div className={cn(
            "mt-3 flex items-center gap-2 px-3 py-2 rounded-xl",
            config.bg
          )}>
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">
              {job.questionsExtracted} question{job.questionsExtracted !== 1 ? "s" : ""} extracted
            </span>
            {isPreviewable && (
              <span className="ml-auto text-xs font-semibold text-purple-600">
                Tap to review →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center sm:py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mb-5">
        <ScanLine className="w-10 h-10 text-purple-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        No scans yet
      </h2>
      <p className="text-gray-500 text-sm max-w-[320px] mb-6">
        Upload an image or PDF of your questions and let AI extract them automatically
      </p>
      <Button
        onClick={onUpload}
        className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-lg shadow-purple-500/30"
      >
        <Upload className="w-5 h-5 mr-2" />
        Upload Your First Scan
      </Button>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

const QuestionBankScan = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [quota, setQuota] = useState<ScanQuotaResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewJobId, setPreviewJobId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<JobPreviewResponseData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load jobs and quota
  const loadData = useCallback(async () => {
    try {
      const [jobsRes, quotaRes] = await Promise.all([
        questionJobService.getMyJobs(),
        questionScanService.getQuota(),
      ]);

      if (jobsRes.data.status === "successful") {
        setJobs(
          jobsRes.data.jobs.map((job: JobSummaryDto): JobListItem => ({
            jobId: job.jobId,
            fileName: "",
            fileType: "",
            status: job.status as unknown as JobStatusEnum,
            statusText: job.status,
            questionsExtracted: undefined,
            createdAt: job.createdAt,
            completedAt: job.completedAt || undefined,
            subjectId: "",
            subjectName: undefined,
          }))
        );
      }
      if (quotaRes.data.status === "successful") {
        setQuota(quotaRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll for job status updates
  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (j) => j.status === JobStatusEnum.Pending || j.status === JobStatusEnum.Processing
    );

    if (!hasActiveJobs) return;

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [jobs, loadData]);

  // Handle preview
  const handlePreview = async (jobId: string) => {
    setPreviewJobId(jobId);
    setLoadingPreview(true);
    try {
      const res = await questionJobService.getJobPreview(jobId);
      if (res.data.status === "successful") {
        setPreviewData(res.data.data);
      } else {
        toast.error("Failed to load preview");
        setPreviewJobId(null);
      }
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Failed to load preview");
      setPreviewJobId(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle retry
  const handleRetry = async (jobId: string) => {
    try {
      const res = await questionJobService.retryJob(jobId);
      if (res.data.status === "successful") {
        toast.success("Job resubmitted");
        loadData();
      } else {
        toast.error("Failed to retry job");
      }
    } catch (err) {
      console.error("Retry error:", err);
      toast.error("Failed to retry job");
    }
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    setShowUploadModal(false);
    loadData();
    toast.success("Scan submitted! We'll notify you when ready.");
  };

  // Handle preview close
  const handlePreviewClose = () => {
    setPreviewJobId(null);
    setPreviewData(null);
    loadData();
  };

  // Categorize jobs
  const activeJobs = jobs.filter(
    (j) => j.status === JobStatusEnum.Pending || j.status === JobStatusEnum.Processing
  );
  const completedJobs = jobs.filter(
    (j) => j.status === JobStatusEnum.Completed || j.status === JobStatusEnum.PartiallyCompleted
  );
  const failedJobs = jobs.filter((j) => j.status === JobStatusEnum.Failed);

  const hasJobs = jobs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Question Bank</h1>
          </div>

          {/* Quota Pill */}
          {quota && (
            <div className="flex items-center gap-1.5 bg-purple-50 pl-2 pr-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">
                {quota.remaining}/{quota.dailyLimit}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Hero Card */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-3xl p-5 sm:p-6 md:p-7 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-44 md:h-44 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 md:w-36 md:h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ScanLine className="w-5 h-5" />
              <span className="text-sm font-medium text-purple-200">AI-Powered</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Scan Questions</h2>
            <p className="text-purple-200 text-sm sm:text-base mb-4 max-w-xl">
              Upload photos of questions and let AI extract them instantly
            </p>

            <Button
              onClick={() => setShowUploadModal(true)}
              disabled={quota?.remaining === 0}
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload File
            </Button>

            {quota?.remaining === 0 && (
              <p className="text-center text-purple-200 text-xs mt-3">
                Daily limit reached. Resets at midnight.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-5 sm:py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <p className="text-gray-500 text-sm">Loading your scans...</p>
          </div>
        ) : !hasJobs ? (
          <EmptyState onUpload={() => setShowUploadModal(true)} />
        ) : (
          <div className="space-y-6">
            <section className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold">Processing</p>
                <p className="text-xl font-bold text-blue-900 mt-0.5">{activeJobs.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-600 font-semibold">Ready</p>
                <p className="text-xl font-bold text-emerald-900 mt-0.5">{completedJobs.length}</p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-red-600 font-semibold">Failed</p>
                <p className="text-xl font-bold text-red-900 mt-0.5">{failedJobs.length}</p>
              </div>
            </section>

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Processing ({activeJobs.length})
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {activeJobs.map((job) => (
                    <JobCard
                      key={job.jobId}
                      job={job}
                      onPreview={() => handlePreview(job.jobId)}
                      onRetry={() => handleRetry(job.jobId)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Ready for Review */}
            {completedJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Ready for Review ({completedJobs.length})
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {completedJobs.map((job) => (
                    <JobCard
                      key={job.jobId}
                      job={job}
                      onPreview={() => handlePreview(job.jobId)}
                      onRetry={() => handleRetry(job.jobId)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Failed Jobs */}
            {failedJobs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Failed ({failedJobs.length})
                  </h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {failedJobs.map((job) => (
                    <JobCard
                      key={job.jobId}
                      job={job}
                      onPreview={() => handlePreview(job.jobId)}
                      onRetry={() => handleRetry(job.jobId)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FAB - Upload Button (mobile) */}
      {hasJobs && (
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={quota?.remaining === 0}
          className={cn(
            "fixed bottom-6 right-4 w-14 h-14 rounded-full flex items-center justify-center sm:hidden",
            "bg-gradient-to-br from-purple-600 to-purple-700 shadow-xl shadow-purple-500/40",
            "active:scale-95 transition-transform z-50",
            quota?.remaining === 0 && "opacity-50"
          )}
        >
          <Plus className="w-7 h-7 text-white" />
        </button>
      )}

      {/* Upload Modal */}
      <ScanUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onComplete={handleUploadComplete}
        remainingScans={quota?.remaining ?? 0}
      />

      {/* Preview Modal */}
      {previewJobId && (
        <QuestionPreviewModal
          open={!!previewJobId}
          onClose={handlePreviewClose}
          jobId={previewJobId}
          data={previewData}
          loading={loadingPreview}
        />
      )}
    </div>
  );
};

export default QuestionBankScan;