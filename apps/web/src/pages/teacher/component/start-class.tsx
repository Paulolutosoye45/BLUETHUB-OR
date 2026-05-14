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
} from "lucide-react";
import { lessonService, type LessonItem, type LessonForClassDto, type LessonMediaDto } from "@/services/lesson";
import PreClassModal from "./pre-class-modal";
import toast from "react-hot-toast";

const StartClass = () => {
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-class modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetails, setLessonDetails] = useState<LessonForClassDto | null>(null);
  const [lessonMedia, setLessonMedia] = useState<LessonMediaDto[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await lessonService.getMyLessons({ status: "Approved" });
      const data = (res.data as any)?.data;
      setLessons(data?.lessons ?? []);
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

  const handleStartClass = async (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setModalOpen(true);
    setLoadingDetails(true);
    setLessonDetails(null);
    setLessonMedia([]);

    try {
      const res = await lessonService.getLessonForClass(lessonId);
      const data = (res.data as any)?.data;
      setLessonDetails(data?.lesson ?? null);
      setLessonMedia(data?.media ?? []);
    } catch (err) {
      toast.error("Failed to load lesson details");
      setModalOpen(false);
      console.error(err);
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

  const approvedLessons = lessons.filter((l) => l.status === "Approved");

  return (
    <>
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 font-poppins">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
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
            <p className="text-3xl font-bold">{approvedLessons.length}</p>
            <p className="text-white/70 text-xs mt-1">Approved lessons ready to teach</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
            <p className="text-gray-400 text-xs mt-1">Total lessons</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Play size={18} className="text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
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
            {approvedLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all group"
              >
                {/* Green accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 size={22} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      Approved
                    </span>
                  </div>

                  {/* Topic */}
                  <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                    {lesson.subTopic || "Lesson Topic"}
                  </h3>

                  {/* Aim preview */}
                  {lesson.aim && (
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                      {lesson.aim}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <BookOpen size={12} />
                      Subject
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <GraduationCap size={12} />
                      Class
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Calendar size={12} />
                      {formatDate(lesson.approvedAt || lesson.createdAt)}
                    </span>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={() => handleStartClass(lesson.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-chestnut to-chestnut/90 text-white text-sm font-bold hover:from-chestnut/90 hover:to-chestnut/80 transition-all shadow-lg shadow-chestnut/20"
                  >
                    <Play size={16} />
                    Start Class
                  </button>
                </div>
              </div>
            ))}
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
      />
    </>
  );
};

export default StartClass;
