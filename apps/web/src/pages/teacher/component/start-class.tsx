import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Play,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Inbox,
  AlertCircle,
  Menu,
} from "lucide-react";
import { lessonService, type LessonItem, type LessonForClassDto, type LessonMediaDto } from "@/services/lesson";
import PreClassModal from "./pre-class-modal";
import { useOutletContext } from "react-router-dom";

const StartClass = () => {
    const outletContext = useOutletContext<{ openMobileNav?: () => void } | null>();
  const openMobileNav = outletContext?.openMobileNav ?? (() => {});
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lessonMetaById, setLessonMetaById] = useState<Record<string, LessonForClassDto>>({});
  const [checkingLessonIds, setCheckingLessonIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-class modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetails, setLessonDetails] = useState<LessonForClassDto | null>(null);
  const [lessonMedia, setLessonMedia] = useState<LessonMediaDto[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lessonService.getMyLessons({ status: "Approved" });
      const data = (res.data as any)?.data;
      const fetchedLessons: LessonItem[] = data?.lessons ?? [];
      setLessons(fetchedLessons);

      const approvedIds = fetchedLessons
        .filter((lesson) => lesson.status === "Approved")
        .map((lesson) => lesson.id);

      if (approvedIds.length > 0) {
        setCheckingLessonIds((prev) => {
          const next = { ...prev };
          approvedIds.forEach((id) => {
            next[id] = true;
          });
          return next;
        });

        const nextMeta: Record<string, LessonForClassDto> = {};

        for (const lessonId of approvedIds) {
          try {
            const detailRes = await lessonService.getLessonForClass(lessonId);
            const detailData = (detailRes.data as any)?.data;
            if (detailData?.lesson) {
              nextMeta[lessonId] = detailData.lesson as LessonForClassDto;
            }
          } catch (detailErr) {
            console.error("Failed to load lesson details for start card", lessonId, detailErr);
          } finally {
            setCheckingLessonIds((prev) => ({ ...prev, [lessonId]: false }));
          }
        }

        setLessonMetaById(nextMeta);
      } else {
        setLessonMetaById({});
      }
    } catch (err) {
      setError("Failed to load your lessons. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

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
    durationMinutes: lesson.durationMinutes ?? null,
    accessEndsAt: lesson.accessEndsAt ?? null,
    isAccessOpen: true,
  });

  const handleStartClass = async (lesson: LessonItem) => {
    setSelectedLessonId(lesson.id);
    setModalOpen(true);
    setLoadingDetails(true);
    setLessonLoadError(null);
    setLessonDetails(null);
    setLessonMedia([]);

    try {
      const res = await lessonService.getLessonForClass(lesson.id);
      const data = (res.data as any)?.data;
      setLessonDetails(data?.lesson ?? null);
      setLessonMedia(data?.media ?? []);
    } catch (err) {
      // The API may reject the request if the student access window hasn't opened yet.
      // This restriction is for students watching the replay — teachers can always record.
      // Fall back to the LessonItem data we already have so the modal can open.
      console.warn("getLessonForClass failed (schedule gate?) — using LessonItem fallback", err);
      setLessonDetails(buildFallbackLessonDto(lesson));
      setLessonMedia([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Only show lessons that are fully approved (exclude drafts and all others)
  const approvedLessons = lessons.filter((l) => l.status === "Approved");

  const getLessonMeta = (lesson: LessonItem) => lessonMetaById[lesson.id];

  const buildLessonTitle = (lesson: LessonItem): string => {
    const lessonMeta = getLessonMeta(lesson);
    const parts = [
      lessonMeta?.subjectName ?? lesson.subjectName,
      lessonMeta?.topicName ?? lesson.topicName,
      lessonMeta?.subTopic ?? lesson.subTopicName ?? lesson.subTopic,
    ]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter((value) => value.length > 0);

    return parts.length > 0 ? parts.join(" - ") : "Lesson Topic";
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 p-3 font-poppins">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Menu className="lg:hidden  w-5 h-5 text-black inline" onClick={openMobileNav} />
              <h1 className="text-sm sm:text-xl font-bold text-gray-900 inline ml-3">
                Start a Class
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Select an approved lesson to begin your live class session
              </p>
            </div>
            <button
              onClick={fetchLessons}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                Ready
              </span>
            </div>
            <p className="md:text-2xl text-base  font-bold">{approvedLessons.length}</p>
            <p className="text-white/70 text-xs mt-1">Approved lessons ready to teach</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="md:text-2xl text-base font-bold text-gray-900">{lessons.length}</p>
            <p className="text-gray-400 text-xs mt-1">Total lessons</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Play size={18} className="text-purple-500" />
              </div>
            </div>
            <p className="md:text-2xl text-base font-bold text-gray-900">0</p>
            <p className="text-gray-400 text-xs mt-1">Classes taught this week</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-chestnut mb-3" />
            <p className="text-sm text-gray-500">Loading your lessons...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchLessons}
              className="px-4 py-2 rounded-xl bg-chestnut text-white text-sm font-medium hover:bg-chestnut/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : approvedLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Inbox size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">
              No approved lessons
            </p>
            <p className="text-sm text-gray-400 max-w-sm">
              Submit a lesson for approval first. Once approved, it will appear here ready to teach.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approvedLessons.map((lesson) => {
              const lessonMeta = getLessonMeta(lesson);
              const isChecking = checkingLessonIds[lesson.id] === true;

              return (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-emerald-200 overflow-hidden transition-all group"
              >
                {/* Green accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={22} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      Approved
                    </span>
                  </div>

                  {/* Topic */}
                  <h3 className="font-medium text-gray-900 text-base mb-2 line-clamp-2">
                    {buildLessonTitle(lesson)}
                  </h3>

                  {/* Aim preview */}
                  {lesson.aim && (
                    <p className="text-xs font-medium text-gray-400 mb-4 line-clamp-2">
                      {lesson.aim}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <BookOpen size={12} />
                      {lessonMeta?.subjectName || lesson.subjectName || "Subject"}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <GraduationCap size={12} />
                      {lessonMeta?.className || lesson.className || "Class"}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={12} />
                      {formatDate(lesson.approvedAt || lesson.createdAt)}
                    </span>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => handleStartClass(lesson)}
                    disabled={isChecking}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition-all ${
                      isChecking
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-chestnut to-chestnut/90 hover:from-chestnut/90 hover:to-chestnut/80 shadow-lg shadow-chestnut/20"
                    }`}
                  >
                    {isChecking ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start Class
                      </>
                    )}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pre-Class Modal */}
      <PreClassModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        lesson={lessonDetails}
        media={lessonMedia}
        isLoading={loadingDetails}
        errorMessage={lessonLoadError}
      />
    </>
  );
};

export default StartClass;
