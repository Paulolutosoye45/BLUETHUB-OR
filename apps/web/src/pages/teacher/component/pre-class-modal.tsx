import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Volume2,
  PauseCircle,
  Clock,
  WifiOff,
  HardDrive,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  BookOpen,
  GraduationCap,
  User,
  Loader2,
} from "lucide-react";
import type { LessonForClassDto, LessonMediaDto } from "@/services/lesson";

interface PreClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: LessonForClassDto | null;
  media: LessonMediaDto[];
  isLoading?: boolean;
}

const RULES = [
  {
    icon: Volume2,
    title: "Quiet Environment",
    description: "Start your class in a very quiet place to ensure clear audio recording.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: PauseCircle,
    title: "Pause When Distracted",
    description: "If there's any distraction, pause the recording immediately to maintain lesson quality.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Clock,
    title: "Time Limit",
    description: "The lesson will automatically stop when the allocated time is reached.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Upload,
    title: "Save Recordings",
    description: "After recording, your class will be uploaded and saved online automatically.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    icon: WifiOff,
    title: "Offline Support",
    description: "No internet? Your class will be saved locally and uploaded when connection is restored.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: HardDrive,
    title: "Storage Management",
    description: "If device storage is low, the new recording may override previously saved local classes.",
    color: "text-red-400",
    bg: "bg-red-50",
  },
];

const PreClassModal = ({
  open,
  onOpenChange,
  lesson,
  media,
  isLoading = false,
}: PreClassModalProps) => {
  const navigate = useNavigate();
  const [understood, setUnderstood] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);

  // Pre-fetch media into browser cache when modal opens
  useEffect(() => {
    if (!open || media.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const cache = await caches.open("bluethub-lesson-media");
        for (let i = 0; i < media.length; i++) {
          if (cancelled) break;
          const url = media[i].cloudinaryUrl;
          if (url) {
            const cached = await cache.match(url);
            if (!cached) await cache.add(url).catch(() => {});
          }
          setCacheProgress(Math.round(((i + 1) / media.length) * 100));
        }
      } catch {
        // Cache API unavailable — proceed without caching
      }
    })();
    return () => { cancelled = true; };
  }, [open, media]);

  const handleClose = () => {
    setUnderstood(false);
    onOpenChange(false);
  };

  const handleStartClass = async () => {
    if (!understood || !lesson || caching) return;
    setCaching(true);

    // Ensure any remaining media is cached before navigating
    try {
      const cache = await caches.open("bluethub-lesson-media");
      await Promise.allSettled(
        media.map((m) => m.cloudinaryUrl ? cache.add(m.cloudinaryUrl).catch(() => {}) : Promise.resolve())
      );
    } catch { /* proceed if cache unavailable */ }

    sessionStorage.setItem("activeLesson", JSON.stringify({
      lesson,
      media,
      startedAt: new Date().toISOString(),
    }));

    navigate("/teacher/board", {
      state: { lessonId: lesson.id, lesson, media },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X size={14} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-chestnut via-chestnut/90 to-chestnut/80 px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Play size={26} className="text-white" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                Ready to Start
              </p>
              <h2 className="text-white font-bold text-xl leading-tight">
                Pre-Class Instructions
              </h2>
              <p className="text-white/60 text-sm mt-1">
                Please read carefully before starting your lesson
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-chestnut mb-3" />
              <p className="text-sm text-gray-500">Loading lesson details...</p>
            </div>
          ) : (
            <div className="px-6 py-5">
              {/* Lesson Info Card */}
              {lesson && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 mb-6 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-chestnut/10 flex items-center justify-center shrink-0">
                      <BookOpen size={20} className="text-chestnut" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-base">
                        {lesson.topicName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {lesson.subTopic}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {lesson.subjectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} />
                          {lesson.className || lesson.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {lesson.teacherName}
                        </span>
                      </div>

                      {/* Schedule info */}
                      {(lesson.accessDate || lesson.durationMinutes) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {lesson.accessDate && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1">
                              <Clock size={11} />
                              {new Date(lesson.accessDate).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                              {lesson.accessTime && ` · ${lesson.accessTime.slice(0, 5)}`}
                            </span>
                          )}
                          {lesson.durationMinutes && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-1">
                              <Clock size={11} />
                              {lesson.durationMinutes} min
                            </span>
                          )}
                          {lesson.accessEndsAt && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
                              Ends {new Date(lesson.accessEndsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {media.length > 0 && (
                      <div className="text-center shrink-0">
                        <p className="text-2xl font-bold text-chestnut">{media.length}</p>
                        <p className="text-[10px] text-gray-400 uppercase">Media Files</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rules Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                    Important Guidelines
                  </h3>
                </div>

                <div className="grid gap-3">
                  {RULES.map((rule, index) => {
                    const Icon = rule.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl ${rule.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className={rule.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">
                            {rule.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Acknowledgment Checkbox */}
              <div
                onClick={() => setUnderstood(!understood)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  understood
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    understood
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {understood && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${understood ? "text-emerald-700" : "text-gray-700"}`}>
                    I understand and agree to follow these guidelines
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Check this box to enable the Start Class button
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartClass}
            disabled={!understood || isLoading || !lesson || caching}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-all ${
              understood && !isLoading && lesson && !caching
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {caching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {cacheProgress < 100 ? `Preparing media ${cacheProgress}%…` : "Starting…"}
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
    </div>
  );
};

export default PreClassModal;
