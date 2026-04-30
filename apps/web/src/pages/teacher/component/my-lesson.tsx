import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  EllipsisVertical,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronR,
} from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bluethub/ui-kit";
import { lessonService, type LessonItem, type LessonSummary } from "@/services/lesson";
import { useAuthContext } from "@/contexts/auth-context";
import { ReviewModal, type RLesson } from "./review-modal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: "All lessons", value: "" },
  { label: "Pending",     value: "PendingApproval" },
  { label: "Approved",    value: "Approved" },
  { label: "Rejected",    value: "Rejected" },
  { label: "Published",   value: "Published" },
] as const;

type FilterValue = (typeof STATUS_FILTERS)[number]["value"];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return "—";
  }
}

function normaliseStatus(raw: string): "Pending" | "Approved" | "Rejected" {
  const s = raw?.toLowerCase() ?? "";
  if (s === "approved" || s === "published") return "Approved";
  if (s === "rejected") return "Rejected";
  return "Pending";
}

const STATUS_STYLE: Record<string, { dot: string; text: string; border: string; badge: string }> = {
  PendingApproval: { dot: "bg-orange-400",  text: "text-orange-500", border: "border-l-orange-300", badge: "bg-orange-50 text-orange-500" },
  Approved:        { dot: "bg-green-500",   text: "text-green-600",  border: "border-l-green-400",  badge: "bg-green-50 text-green-600"  },
  Rejected:        { dot: "bg-red-500",     text: "text-red-500",    border: "border-l-red-400",    badge: "bg-red-50 text-red-500"      },
  Published:       { dot: "bg-blue-500",    text: "text-blue-600",   border: "border-l-blue-400",   badge: "bg-blue-50 text-blue-600"    },
  Draft:           { dot: "bg-gray-400",    text: "text-gray-500",   border: "border-l-gray-300",   badge: "bg-gray-100 text-gray-500"   },
};
const DEFAULT_STYLE = STATUS_STYLE.PendingApproval;

function statusLabel(raw: string): string {
  if (raw === "PendingApproval") return "Pending";
  return raw ?? "Unknown";
}

function toRLesson(lesson: LessonItem, teacherName: string): RLesson {
  const norm = normaliseStatus(lesson.status);
  return {
    title:    lesson.subTopic || "—",
    teacher:  teacherName,
    subject:  "—",
    class:    "—",
    term:     "—",
    submittedOn: formatDate(lesson.createdAt),
    status:   norm,
    objectives:  lesson.aim,
    lessonNotes: lesson.description,
    approvedBy:  lesson.approvedBy ? "Head Teacher" : undefined,
    approvedAt:  formatDate(lesson.approvedAt),
    rejectionReason: lesson.rejectionReason ?? undefined,
    timeline: [
      { label: "Lesson submitted", date: formatDate(lesson.createdAt), done: true },
      ...(norm === "Approved"
        ? [{ label: "Approved",  date: formatDate(lesson.approvedAt), done: true }]
        : norm === "Rejected"
        ? [{ label: "Rejected",  date: formatDate(lesson.modifiedAt), done: false }]
        : [{ label: "Pending Review", date: "", done: false }]
      ),
    ],
  };
}

// ── Stat card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  count: number;
  label: string;
  sub: string;
  subColor?: string;
  highlight?: boolean;
}
function StatCard({ count, label, sub, subColor = "text-gray-400", highlight }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 transition hover:shadow-md ${
      highlight ? "bg-chestnut border border-chestnut" : "bg-white border border-[#D9D9D9]"
    }`}>
      <p className={`font-bold text-3xl leading-none tracking-tight text-center w-full ${highlight ? "text-white" : "text-[#0F0F0E]"}`}>
        {count}
      </p>
      <p className={`text-xs mt-2 text-center w-full ${highlight ? "text-white/70" : "text-[#3A3A3A80]"}`}>{label}</p>
      <p className={`text-[10px] font-bold italic mt-1 text-center w-full ${highlight ? "text-white/60" : subColor}`}>{sub}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const MyLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const teacherName = user ? `${user.firstName} ${user.lastName}`.trim() : "Teacher";

  // ── Filter + pagination state ──
  const [activeFilter, setActiveFilter] = useState<FilterValue>("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // ── API state ──
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [summary, setSummary] = useState<LessonSummary>({ total: 0, pendingApproval: 0, approved: 0, rejected: 0, published: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Modal ──
  const [reviewLesson, setReviewLesson] = useState<RLesson | null>(null);

  // ── Fetch ──
  const fetchLessons = (filter: FilterValue, pageNum: number) => {
    setLoading(true);
    setError(null);
    lessonService
      .getMyLessons({
        ...(filter ? { status: filter } : {}),
        pageNumber: pageNum,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        const raw = (res.data as any)?.data ?? res.data;
        const items: LessonItem[] = raw?.lessons ?? raw?.Lessons ?? [];
        const sum = raw?.summary ?? raw?.Summary ?? {};
        const total = raw?.totalCount ?? raw?.TotalCount ?? items.length;
        const pages = raw?.totalPages ?? raw?.TotalPages ?? 1;

        setLessons(items);
        setSummary({
          total:          sum?.total          ?? sum?.Total          ?? 0,
          pendingApproval: sum?.pendingApproval ?? sum?.PendingApproval ?? 0,
          approved:       sum?.approved       ?? sum?.Approved       ?? 0,
          rejected:       sum?.rejected       ?? sum?.Rejected       ?? 0,
          published:      sum?.published      ?? sum?.Published      ?? 0,
        });
        setTotalCount(total);
        setTotalPages(pages);
      })
      .catch((err) => {
        const msg = (err as any)?.response?.data?.responseMessage ?? "Could not load lessons";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLessons(activeFilter, page);
  }, [activeFilter, page]);

  const handleFilterChange = (f: FilterValue) => {
    setActiveFilter(f);
    setPage(1);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen">
        <div className="rounded-t-2xl overflow-hidden shadow-lg">

          {/* Header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-5 bg-chestnut">
            <h3 className="flex items-center gap-2 text-white font-semibold text-sm">
              <span className="text-white/60">Teaching</span>
              <ChevronRight size={16} />
              <span>My Lessons</span>
            </h3>
            <button className="text-white p-1 rounded hover:bg-white/10 transition">
              <EllipsisVertical size={18} />
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 space-y-5">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg leading-7 text-[#0F0F0E]">Lesson approvals</h2>
                <p className="text-[#666666] font-medium text-xs mt-0.5">
                  Track your submitted lessons and their approval status
                </p>
              </div>
              <Button
                onClick={() => navigate("/teacher/submit-lesson")}
                className="shrink-0 flex items-center gap-2 text-white bg-chestnut font-semibold text-xs px-4 py-2.5 rounded-lg hover:bg-chestnut/90 transition"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Submit New Lesson</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            </div>

            {/* Stat cards */}
            <div className={`grid gap-3 ${summary.published > 0 ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
              <StatCard highlight count={summary.total}           label="Total submissions"   sub="+this term" />
              <StatCard          count={summary.pendingApproval} label="Pending review"       sub="Processing"   subColor="text-orange-400" />
              <StatCard          count={summary.approved}         label="Approved"             sub="Completed"    subColor="text-green-500"  />
              <StatCard          count={summary.rejected}         label="Rejected"             sub="Needs revision" subColor="text-red-500" />
              {summary.published > 0 && (
                <StatCard        count={summary.published}        label="Published"            sub="Live"         subColor="text-blue-500"  />
              )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeFilter === f.value
                      ? "bg-chestnut text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Content area */}
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-chestnut/60">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading lessons…</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => fetchLessons(activeFilter, page)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-chestnut hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            ) : (
              <>
                {/* ── Desktop/tablet table ── */}
                <div className="hidden sm:block border border-[#E8E8E3] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F5F5F1] h-12 hover:bg-gray-50/80">
                          <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#29238280] px-5 w-1/3">
                            Lesson Title
                          </TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#29238280]">
                            Submitted
                          </TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#29238280]">
                            Status
                          </TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lessons.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="py-14 text-center text-xs text-gray-400">
                              No lessons found
                            </TableCell>
                          </TableRow>
                        ) : (
                          lessons.map((lesson) => {
                            const style = STATUS_STYLE[lesson.status] ?? DEFAULT_STYLE;
                            return (
                              <TableRow
                                key={lesson.id}
                                className={`hover:bg-gray-50/60 transition-colors border-l-[3px] ${style.border}`}
                              >
                                <TableCell className="px-5 py-3.5">
                                  <p className="text-[#0F0F0E] font-semibold text-sm leading-tight line-clamp-1">
                                    {lesson.subTopic || "Untitled"}
                                  </p>
                                  <p className="text-[#A8A8A4] text-[11px] mt-0.5 line-clamp-1">
                                    {lesson.aim}
                                  </p>
                                </TableCell>
                                <TableCell className="text-[#0F0F0E] text-xs font-medium">
                                  {formatDate(lesson.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full py-1 px-2.5 text-[11px] font-semibold ${style.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                    {statusLabel(lesson.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="pr-5 text-right">
                                  <button
                                    onClick={() => setReviewLesson(toRLesson(lesson, teacherName))}
                                    className="border border-[#E8E8E3] hover:border-chestnut/30 hover:text-chestnut
                                      text-[#0F0F0E] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Review
                                  </button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* ── Mobile card list ── */}
                <div className="sm:hidden space-y-3">
                  {lessons.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-10">No lessons found</p>
                  ) : (
                    lessons.map((lesson) => {
                      const style = STATUS_STYLE[lesson.status] ?? DEFAULT_STYLE;
                      return (
                        <div
                          key={lesson.id}
                          className={`bg-white rounded-2xl border border-[#E8E8E3] border-l-4 ${style.border} p-4 shadow-sm`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#0F0F0E] leading-tight line-clamp-2">
                                {lesson.subTopic || "Untitled"}
                              </p>
                              <p className="text-[11px] text-[#A8A8A4] mt-1 line-clamp-1">{lesson.aim}</p>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full py-0.5 px-2 text-[10px] font-semibold ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {statusLabel(lesson.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-gray-400">{formatDate(lesson.createdAt)}</span>
                            <button
                              onClick={() => setReviewLesson(toRLesson(lesson, teacherName))}
                              className="border border-[#E8E8E3] text-[#0F0F0E] text-xs font-medium px-3 py-1.5
                                rounded-lg hover:border-chestnut/30 hover:text-chestnut transition-colors"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">
                      Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                          text-gray-500 hover:border-chestnut/40 hover:text-chestnut transition-colors disabled:opacity-30"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                              p === page ? "bg-chestnut text-white" : "border border-gray-200 text-gray-500 hover:border-chestnut/40"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200
                          text-gray-500 hover:border-chestnut/40 hover:text-chestnut transition-colors disabled:opacity-30"
                      >
                        <ChevronR size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        open={!!reviewLesson}
        onOpenChange={(o) => !o && setReviewLesson(null)}
        lesson={reviewLesson}
      />
    </>
  );
};

export default MyLesson;
