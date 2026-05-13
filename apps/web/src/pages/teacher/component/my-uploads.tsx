import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import katex from "katex";
import "katex/dist/katex.min.css";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import {
  CheckCircle2, Clock, Loader2, RefreshCw, XCircle, Eye, ChevronRight, X,
} from "lucide-react";
import {
  questionJobService,
  type JobSummaryDto,
  type QuestionPreviewResponse,
  type OptionPreviewDto,
} from "@/services/question-job";
import TitleBar from "@/shared/title-bar";

// ── KaTeX renderer ──────────────────────────────────────────────────────────
const renderKatex = (html: string): string => {
  // Replace block math: $$...$$ or \[...\]
  let out = html
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
      try { return katex.renderToString(expr, { displayMode: true, throwOnError: false }); }
      catch { return _; }
    })
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, expr) => {
      try { return katex.renderToString(expr, { displayMode: true, throwOnError: false }); }
      catch { return _; }
    });
  // Replace inline math: $...$ or \(...\)
  out = out
    .replace(/\$([^$\n]+?)\$/g, (_, expr) => {
      try { return katex.renderToString(expr, { displayMode: false, throwOnError: false }); }
      catch { return _; }
    })
    .replace(/\\\((.+?)\\\)/g, (_, expr) => {
      try { return katex.renderToString(expr, { displayMode: false, throwOnError: false }); }
      catch { return _; }
    });
  return out;
};

// ── RenderedHtml ─────────────────────────────────────────────────────────────
const RenderedHtml = ({ html, hasLatex, className = "" }: { html: string; hasLatex: boolean; className?: string }) => {
  const processed = hasLatex ? renderKatex(html) : html;
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
};

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: JobSummaryDto["status"] }) => {
  const map = {
    Pending:    { icon: <Clock size={12} />,        cls: "bg-amber-50 text-amber-600 border-amber-200" },
    Processing: { icon: <Loader2 size={12} className="animate-spin" />, cls: "bg-blue-50 text-blue-600 border-blue-200" },
    Completed:  { icon: <CheckCircle2 size={12} />, cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    Failed:     { icon: <XCircle size={12} />,      cls: "bg-red-50 text-red-500 border-red-200" },
  };
  const { icon, cls } = map[status] ?? map.Pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {icon} {status}
    </span>
  );
};

// ── Preview Modal ─────────────────────────────────────────────────────────────
const PreviewModal = ({
  preview,
  onClose,
}: {
  preview: QuestionPreviewResponse;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Modal header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Question Preview</h3>
            <p className="text-[11px] text-slate-400">
              {preview.questionType} · {preview.marksAllocation} mark{preview.marksAllocation !== 1 ? "s" : ""}
              {preview.difficultyLevel ? ` · ${preview.difficultyLevel}` : ""}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Modal body */}
      <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-5">
        {/* Question HTML */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Question</p>
          <RenderedHtml
            html={preview.questionHtml}
            hasLatex={preview.hasLatex}
            className="text-slate-800"
          />
        </div>

        {/* Options (Objective only) */}
        {preview.options && preview.options.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Options</p>
            {preview.options
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((opt: OptionPreviewDto) => (
                <div
                  key={opt.id}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    opt.isCorrect
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                      opt.isCorrect ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt.optionLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <RenderedHtml
                      html={opt.optionHtml || opt.optionText}
                      hasLatex={opt.hasLatex}
                      className="text-slate-700"
                    />
                  </div>
                  {opt.isCorrect && (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal footer */}
      <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg bg-chestnut text-white text-sm font-semibold hover:bg-chestnut/90 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── Job row ──────────────────────────────────────────────────────────────────
const JobRow = ({
  job,
  onPreview,
  onRetry,
  retrying,
}: {
  job: JobSummaryDto;
  onPreview: () => void;
  onRetry: () => void;
  retrying: boolean;
}) => {
  const createdAt = job.createdAt
    ? new Date(job.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 flex items-center gap-3 hover:border-slate-300 transition-colors">
      {/* Status icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
        job.status === "Completed" ? "bg-emerald-50" :
        job.status === "Failed" ? "bg-red-50" :
        job.status === "Processing" ? "bg-blue-50" : "bg-amber-50"
      }`}>
        {job.status === "Completed"  && <CheckCircle2 size={18} className="text-emerald-500" />}
        {job.status === "Failed"     && <XCircle      size={18} className="text-red-400" />}
        {job.status === "Processing" && <Loader2      size={18} className="text-blue-500 animate-spin" />}
        {job.status === "Pending"    && <Clock        size={18} className="text-amber-500" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={job.status} />
          <span className="text-xs text-slate-400 font-medium">{job.questionType}</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">{createdAt}</span>
        </div>
        {job.status === "Failed" && job.failureReason && (
          <p className="text-[11px] text-red-400 mt-0.5 truncate">{job.failureReason}</p>
        )}
        <p className="text-[10px] text-slate-300 font-mono mt-0.5 truncate">{job.jobId}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {job.status === "Completed" && (
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <Eye size={13} /> Preview
          </button>
        )}
        {job.status === "Failed" && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            {retrying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const MyUploads = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0, failed: 0 });
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<QuestionPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await questionJobService.getMyJobs();
      setJobs(data.jobs ?? []);
      setCounts({
        total: data.totalCount,
        pending: data.pendingCount,
        completed: data.completedCount,
        failed: data.failedCount,
      });
    } catch {
      if (!silent) toast.error("Failed to load jobs");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll every 8 seconds while pending/processing jobs exist
  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const hasPending = jobs.some(j => j.status === "Pending" || j.status === "Processing");
    if (hasPending) {
      pollRef.current = setInterval(() => fetchJobs(true), 8000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [jobs]);

  const handlePreview = async (job: JobSummaryDto) => {
    setPreviewLoading(true);
    try {
      const { data } = await questionJobService.getJobPreview(job.jobId);
      setPreview(data.data ?? (data as any));
    } catch (err) {
      const e = err as AxiosError<{ responseMessage?: string }>;
      toast.error(e.response?.data?.responseMessage ?? "Failed to load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await questionJobService.retryJob(jobId);
      toast.success("Job queued for retry");
      fetchJobs(true);
    } catch {
      toast.error("Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const filtered = jobs.filter(j =>
    j.questionType.toLowerCase().includes(search.toLowerCase()) ||
    j.status.toLowerCase().includes(search.toLowerCase()) ||
    j.jobId.includes(search)
  );

  return (
    <div className="p-3 sm:p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        <TitleBar title="My Uploads" hasVertical hasBackIcons />

        <div className="p-4 sm:p-6 lg:p-8 bg-white/70 backdrop-blur-sm flex flex-col gap-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">My Uploads</h1>
              <p className="text-sm text-slate-500 mt-0.5">AI question extraction history</p>
            </div>
            <button
              onClick={() => navigate("/teacher/assessment/upload-scan")}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-chestnut text-white text-sm font-semibold hover:bg-chestnut/90 transition-colors cursor-pointer"
            >
              + New Upload
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",      value: counts.total,     color: "text-slate-700",   bg: "bg-slate-50"   },
              { label: "Processing", value: counts.pending,   color: "text-amber-600",   bg: "bg-amber-50"   },
              { label: "Completed",  value: counts.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Failed",     value: counts.failed,    color: "text-red-500",     bg: "bg-red-50"     },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 flex flex-col`}>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                <span className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search + Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by type, status or job ID…"
                className="flex-1 text-sm text-slate-600 placeholder-slate-400 outline-none bg-transparent"
              />
            </div>
            <button
              onClick={() => fetchJobs()}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Job list */}
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-sm">Loading jobs…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-slate-300 font-medium text-sm">
                {search ? "No jobs match your search" : "No uploads yet"}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/teacher/assessment/upload-scan")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-chestnut hover:underline cursor-pointer"
                >
                  Upload your first question image <ChevronRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map(job => (
                <JobRow
                  key={job.jobId}
                  job={job}
                  onPreview={() => handlePreview(job)}
                  onRetry={() => handleRetry(job.jobId)}
                  retrying={retryingId === job.jobId}
                />
              ))}
              {counts.pending > 0 && (
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Refreshing automatically every 8 seconds while jobs are pending…
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview loading overlay */}
      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-3 shadow-xl">
            <Loader2 size={20} className="animate-spin text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">Loading preview…</span>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && <PreviewModal preview={preview} onClose={() => setPreview(null)} />}
    </div>
  );
};

export default MyUploads;
