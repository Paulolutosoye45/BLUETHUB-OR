import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  EllipsisVertical,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronR,
  Play,
  Menu,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@bluethub/ui-kit";
import { lessonService, type LessonItem, type LessonSummary, type LessonForClassDto, type LessonMediaDto } from "@/services/lesson";
import { imageGenerationService, type GeneratedLessonImage } from "@/services/image-generation";
import { useAuthContext } from "@/contexts/auth-context";
import { ReviewModal, type RLesson } from "./review-modal";
import PreClassModal from "./pre-class-modal";
import toast from "react-hot-toast";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: "All lessons", value: "" },
  { label: "Pending", value: "PendingApproval" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Published", value: "Published" },
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
  PendingApproval: { dot: "bg-orange-400", text: "text-orange-500", border: "border-l-orange-300", badge: "bg-orange-50 text-orange-500" },
  Approved: { dot: "bg-green-500", text: "text-green-600", border: "border-l-green-400", badge: "bg-green-50 text-green-600" },
  Rejected: { dot: "bg-red-500", text: "text-red-500", border: "border-l-red-400", badge: "bg-red-50 text-red-500" },
  Published: { dot: "bg-blue-500", text: "text-blue-600", border: "border-l-blue-400", badge: "bg-blue-50 text-blue-600" },
  Draft: { dot: "bg-gray-400", text: "text-gray-500", border: "border-l-gray-300", badge: "bg-gray-100 text-gray-500" },
};
const DEFAULT_STYLE = STATUS_STYLE.PendingApproval;

function statusLabel(raw: string): string {
  if (raw === "PendingApproval") return "Pending";
  return raw ?? "Unknown";
}

function toRLesson(lesson: LessonItem, teacherName: string): RLesson {
  const norm = normaliseStatus(lesson.status);
  return {
    title: lesson.topicName || "—",
    teacher: teacherName,
    subject: lesson.subjectName || "—",
    class: lesson.className || "—",
    submittedOn: formatDate(lesson.createdAt),
    status: norm,
    objectives: lesson.aim,
    lessonNotes: lesson.description,
    approvedBy: lesson.approvedBy ? "Head Teacher" : undefined,
    approvedAt: formatDate(lesson.approvedAt),
    rejectionReason: lesson.rejectionReason ?? undefined,
    timeline: [
      { label: "Lesson submitted", date: formatDate(lesson.createdAt), done: true },
      ...(norm === "Approved"
        ? [{ label: "Approved", date: formatDate(lesson.approvedAt), done: true }]
        : norm === "Rejected"
          ? [{ label: "Rejected", date: formatDate(lesson.modifiedAt), done: false }]
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
    <div className={`rounded-2xl p-5 transition hover:shadow-md ${highlight ? "bg-chestnut border border-chestnut" : "bg-white border border-[#D9D9D9]"
      }`}>
      <p className={`font-semibold text-xl leading-none tracking-tight text-center w-full ${highlight ? "text-white" : "text-[#0F0F0E]"}`}>
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
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
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

  // ── Lesson meta for start-class block-check ──
  const [lessonMetaById, setLessonMetaById] = useState<Record<string, LessonForClassDto>>({});
  const [checkingLessonIds, setCheckingLessonIds] = useState<Record<string, boolean>>({});

  // ── Review Modal ──
  const [reviewLesson, setReviewLesson] = useState<RLesson | null>(null);

  // ── AI Generated Images Modal ──
  const [aiImagesLesson, setAiImagesLesson] = useState<LessonItem | null>(null);
  const [aiImages, setAiImages] = useState<GeneratedLessonImage[]>([]);
  const [aiImagesLoading, setAiImagesLoading] = useState(false);
  const [aiImagesError, setAiImagesError] = useState<string | null>(null);

  const openAiImages = async (lesson: LessonItem) => {
    setAiImagesLesson(lesson);
    setAiImages([]);
    setAiImagesError(null);
    setAiImagesLoading(true);
    try {
      const res = await imageGenerationService.getImages(lesson.id);
      setAiImages(res.data?.data?.images ?? []);
    } catch (err: any) {
      setAiImagesError(err?.response?.data?.responseMessage ?? "Could not load AI images");
    } finally {
      setAiImagesLoading(false);
    }
  };

  // ── Pre-Class Modal (for starting approved lessons) ──
  const [preClassModalOpen, setPreClassModalOpen] = useState(false);
  const [selectedLessonForClass, setSelectedLessonForClass] = useState<LessonForClassDto | null>(null);
  const [lessonMedia, setLessonMedia] = useState<LessonMediaDto[]>([]);
  const [loadingLessonDetails, setLoadingLessonDetails] = useState(false);
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);

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
          total: sum?.total ?? sum?.Total ?? 0,
          pendingApproval: sum?.pendingApproval ?? sum?.PendingApproval ?? 0,
          approved: sum?.approved ?? sum?.Approved ?? 0,
          rejected: sum?.rejected ?? sum?.Rejected ?? 0,
          published: sum?.published ?? sum?.Published ?? 0,
        });
        setTotalCount(total);
        setTotalPages(pages);

        // Background-fetch lesson meta for approved lessons to enable block-check
        const approvedIds = items
          .filter((l) => l.status === "Approved")
          .map((l) => l.id);
        if (approvedIds.length > 0) {
          setCheckingLessonIds((prev) => {
            const next = { ...prev };
            approvedIds.forEach((id) => { next[id] = true; });
            return next;
          });
          const nextMeta: Record<string, LessonForClassDto> = {};
          Promise.allSettled(
            approvedIds.map((id) =>
              lessonService.getLessonForClass(id)
                .then((r) => {
                  const d = (r.data as any)?.data;
                  if (d?.lesson) nextMeta[id] = d.lesson as LessonForClassDto;
                })
                .finally(() => setCheckingLessonIds((prev) => ({ ...prev, [id]: false })))
            )
          ).then(() => setLessonMetaById((prev) => ({ ...prev, ...nextMeta })));
        }
      })
      .catch((err) => {
        const msg = (err as any)?.response?.data?.responseMessage ?? "Could not load lessons";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  // ── Start-class helpers ──
  const buildFallbackLessonDto = (lesson: LessonItem): LessonForClassDto => ({
    id: lesson.id,
    aim: lesson.aim ?? "",
    description: lesson.description ?? "",
    status: lesson.status,
    createdAt: lesson.createdAt,
    approvedAt: lesson.approvedAt ?? null,
    subTopic: lesson.subTopicName ?? lesson.subTopic ?? "",
    subTopicId: "",
    classroomId: lesson.classroomId ?? "",
    name: lesson.subTopic ?? lesson.subTopicName ?? "",
    className: lesson.className ?? "",
    subjectId: lesson.subjectId ?? "",
    subjectName: lesson.subjectName ?? "",
    topicId: lesson.topicId ?? "",
    topicName: lesson.topicName ?? "",
    teacherId: "",
    teacherName: "",
    teacherEmail: "",
    approvedByName: null,
    accessDate: lesson.accessDate ?? null,
    accessTime: lesson.accessTime ?? null,
    durationMinutes: null,
    accessEndsAt: lesson.accessEndsAt ?? null,
    isAccessOpen: true,
  });

  const buildLessonTitle = (lesson: LessonItem): string => {
    const meta = lessonMetaById[lesson.id];
    const parts = [
      meta?.subjectName ?? lesson.subjectName,
      meta?.topicName ?? lesson.topicName,
      meta?.subTopic ?? lesson.subTopicName ?? lesson.subTopic,
    ]
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
    return parts.length > 0 ? parts.join(" › ") : "Untitled Lesson";
  };

  useEffect(() => {
    fetchLessons(activeFilter, page);
  }, [activeFilter, page]);

  const handleFilterChange = (f: FilterValue) => {
    setActiveFilter(f);
    setPage(1);
  };

  // ── Start Class handler ──
  const handleStartClass = async (lesson: LessonItem) => {
    setPreClassModalOpen(true);
    setLoadingLessonDetails(true);
    setLessonLoadError(null);
    setSelectedLessonForClass(null);
    setLessonMedia([]);

    try {
      const res = await lessonService.getLessonForClass(lesson.id);
      const data = (res.data as any)?.data;
      setSelectedLessonForClass(data?.lesson ?? data?.Lesson ?? null);
      setLessonMedia(data?.media ?? data?.Media ?? []);
    } catch (err: any) {
      // The API may reject the request if the student access window hasn't opened yet.
      // This restriction is for students watching the replay — teachers can always record.
      // Fall back to the LessonItem data we already have so the modal can open.
      console.warn("getLessonForClass failed (schedule gate?) — using LessonItem fallback", err);
      setSelectedLessonForClass(buildFallbackLessonDto(lesson));
      setLessonMedia([]);
    } finally {
      setLoadingLessonDetails(false);
    }
  };

  const handleStartClassWithChecks = (lesson: LessonItem) => {
    if (checkingLessonIds[lesson.id] === true) {
      toast("Loading lesson info, please wait a moment...");
      return;
    }
    handleStartClass(lesson);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="md:p-3 min-h-screen">
        <div className="lg:rounded-t-2xl overflow-hidden shadow-lg">

          {/* Header bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-5 bg-chestnut">
            <h3 className="flex items-center gap-2 text-white font-semibold text-sm">
              <Menu className="lg:hidden  w-5 h-5 text-white " onClick={openMobileNav} />
              <span className="text-sm">My Lessons</span>
            </h3>
            <button className="text-white p-1 rounded hover:bg-white/10 transition">
              <EllipsisVertical size={18} />
            </button>
          </div>

          <div className="bg-white p-4 sm:p-6 space-y-5">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-base leading-7 text-[#0F0F0E]">Lesson approvals</h2>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard highlight count={summary.total} label="Total submissions" sub="+this term" />
              <StatCard count={summary.pendingApproval} label="Pending review" sub="Processing" subColor="text-orange-400" />
              <StatCard count={summary.approved} label="Approved" sub="Completed" subColor="text-green-500" />
              <StatCard count={summary.rejected} label="Rejected" sub="Needs revision" subColor="text-red-500" />
              {summary.published > 0 && (
                <StatCard count={summary.published} label="Published" sub="Live" subColor="text-blue-500" />
              )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-4 py-1.5 rounded-full text-xs font-med transition-all ${activeFilter === f.value
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
                                  <p className="text-[#0F0F0E] font-medium text-sm leading-tight line-clamp-1">
                                    {buildLessonTitle(lesson)}
                                  </p>
                                  {lesson.subjectName && (
                                    <p className="text-[11px] font-medium text-chestnut/70 mt-0.5">
                                      {lesson.subjectName}
                                    </p>
                                  )}
                                  <p className="text-[#A8A8A4] text-[11px] mt-1 leading-relaxed whitespace-pre-wrap break-words">
                                    {lesson.aim}
                                  </p>
                                </TableCell>
                                <TableCell className="text-[#0F0F0E] text-xs font-medium">
                                  {formatDate(lesson.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center gap-1.5 rounded-full py-1 px-2.5 text-[11px] font-medium ${style.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                    {statusLabel(lesson.status)}
                                  </span>
                                </TableCell>
                                <TableCell className="pr-5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {lesson.status === "Approved" && (() => {
                                      const isChecking = checkingLessonIds[lesson.id] === true;
                                      return (
                                        <button
                                          onClick={() => handleStartClassWithChecks(lesson)}
                                          disabled={isChecking}
                                          className={`flex items-center gap-1.5 text-white text-xs font-medium
                                            px-3 py-1.5 rounded-lg transition-all shadow-sm ${isChecking
                                              ? "bg-gray-300 cursor-not-allowed"
                                              : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                                            }`}
                                        >
                                          {isChecking ? (
                                            <Loader2 size={12} className="animate-spin" />
                                          ) : (
                                            <Play size={12} />
                                          )}
                                          {isChecking ? "Loading…" : "Start Class"}
                                        </button>
                                      );
                                    })()}
                                    <button
                                      onClick={() => openAiImages(lesson)}
                                      className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600
                                        hover:from-violet-700 hover:to-fuchsia-700 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                      title="View generated materials"
                                    >
                                      <Sparkles size={12} />
                                      Images
                                    </button>
                                    <button
                                      onClick={() => setReviewLesson(toRLesson(lesson, teacherName))}
                                      className="border border-[#E8E8E3] hover:border-chestnut/30 hover:text-chestnut
                                        text-[#0F0F0E] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      Review
                                    </button>
                                  </div>
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
                                {buildLessonTitle(lesson)}
                              </p>
                              {lesson.subjectName && (
                                <p className="text-[10px] font-semibold text-chestnut/70 mt-0.5">{lesson.subjectName}</p>
                              )}
                              <p className="text-[11px] text-[#A8A8A4] mt-1 leading-relaxed whitespace-pre-wrap break-words">
                                {lesson.aim}
                              </p>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full py-0.5 px-2 text-[10px] font-semibold ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {statusLabel(lesson.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[11px] text-gray-400">{formatDate(lesson.createdAt)}</span>
                            <div className="flex items-center gap-2">
                              {lesson.status === "Approved" && (() => {
                                const isChecking = checkingLessonIds[lesson.id] === true;
                                return (
                                  <button
                                    onClick={() => handleStartClassWithChecks(lesson)}
                                    disabled={isChecking}
                                    className={`flex items-center gap-1 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${isChecking
                                      ? "bg-gray-300 cursor-not-allowed"
                                      : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                      }`}
                                  >
                                    {isChecking ? (
                                      <Loader2 size={10} className="animate-spin" />
                                    ) : (
                                      <Play size={10} />
                                    )}
                                    {isChecking ? "…" : "Start"}
                                  </button>
                                );
                              })()}
                              <button
                                onClick={() => openAiImages(lesson)}
                                className="flex items-center gap-1 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg
                                  bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                title="View generated materials"
                              >
                                <Sparkles size={10} />
                                Images
                              </button>
                              <button
                                onClick={() => setReviewLesson(toRLesson(lesson, teacherName))}
                                className="border border-[#E8E8E3] text-[#0F0F0E] text-xs font-medium px-3 py-1.5
                                  rounded-lg hover:border-chestnut/30 hover:text-chestnut transition-colors"
                              >
                                Review
                              </button>
                            </div>
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
                    <div className="flex items-center md:gap-1">
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
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-chestnut text-white" : "border border-gray-200 text-gray-500 hover:border-chestnut/40"
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

      <PreClassModal
        open={preClassModalOpen}
        onOpenChange={setPreClassModalOpen}
        lesson={selectedLessonForClass}
        media={lessonMedia}
        isLoading={loadingLessonDetails}
        errorMessage={lessonLoadError}
      />

      {/* AI Generated Images Modal */}
      {aiImagesLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-base font-semibold text-white">Lesson Materials</span>
                  <p className="text-xs text-white/70 truncate">
                    {buildLessonTitle(aiImagesLesson)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiImagesLesson(null)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {aiImagesLoading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-violet-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading materials…</span>
                </div>
              ) : aiImagesError ? (
                <div className="text-center py-10 space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                  <p className="text-sm text-gray-500">{aiImagesError}</p>
                </div>
              ) : aiImages.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Sparkles className="w-8 h-8 text-violet-300 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">No materials yet</p>
                  <p className="text-xs text-gray-400">
                    If you requested images with this lesson, they'll appear here once generated.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    {aiImages.length} image{aiImages.length > 1 ? "s" : ""} generated
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {aiImages.map((img) => (
                      <a
                        key={img.id}
                        href={img.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl overflow-hidden border-2 border-violet-200 bg-white transition-all hover:border-violet-400 hover:shadow-md"
                      >
                        <img src={img.imageUrl} alt={img.promptText} className="w-full h-28 object-cover" />
                        <p className="text-[10px] text-gray-500 px-2 py-1.5 line-clamp-2">{img.promptText}</p>
                      </a>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => openAiImages(aiImagesLesson)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 mt-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyLesson;
