import { CalendarDays, Clock, Signal } from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import Play from '@/assets/svg/play.svg?react'
import { useNavigate } from "react-router-dom";
import type { StudentPublishedLesson } from "@/services/student";
import enginerring from "@/assets/png/engineering.png";
import { useMemo, useState } from "react";

interface VideoLessonCardProps {
    lesson: StudentPublishedLesson;
}

const VideoLessonCard = ({
    lesson,
}: VideoLessonCardProps) => {

    const navigate = useNavigate()
    const [showMediaPanel, setShowMediaPanel] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    const mediaFiles = useMemo(
        () => [...(lesson.media ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
        [lesson.media],
    );

    const activeMedia = mediaFiles[activeMediaIndex] ?? null;
    const approvedDate = (lesson.approvedAt || lesson.createdAt)
        ? new Date(lesson.approvedAt || lesson.createdAt || "").toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "N/A";

    const expiryDate = lesson.accessEndsAt
        ? new Date(lesson.accessEndsAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
        : "No expiry";

    const durationLabel = `${Math.max(1, lesson.mediaCount)} file${lesson.mediaCount === 1 ? "" : "s"}`;
    const lessonDuration = lesson.durationMinutes ? `${lesson.durationMinutes} min` : "Flexible";

    const activeMediaType = (activeMedia?.mediaType ?? "").toLowerCase();
    const activeMediaExtension = (activeMedia?.fileExtension ?? "").toLowerCase();

    const renderMediaPreview = () => {
        if (!activeMedia) {
            return (
                <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    Select a lesson media file to preview.
                </div>
            );
        }

        if (activeMediaType.includes("video") || activeMediaExtension === "mp4" || activeMediaExtension === "webm") {
            return (
                <video
                    controls
                    className="h-64 w-full rounded-xl bg-black"
                    src={activeMedia.url}
                />
            );
        }

        if (activeMediaType.includes("image") || ["jpg", "jpeg", "png", "webp", "gif"].includes(activeMediaExtension)) {
            return (
                <img
                    src={activeMedia.url}
                    alt={activeMedia.mediaName}
                    className="h-64 w-full rounded-xl object-cover"
                />
            );
        }

        if (activeMediaType.includes("pdf") || activeMediaExtension === "pdf") {
            return (
                <iframe
                    src={activeMedia.url}
                    title={activeMedia.mediaName}
                    className="h-72 w-full rounded-xl border border-slate-200 bg-white"
                />
            );
        }

        return (
            <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                <div>
                    <p className="text-sm font-semibold text-slate-700">Preview not available</p>
                    <a href={activeMedia.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-medium text-[#4255db] underline">
                        Open {activeMedia.mediaName}
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="group rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f9fbff_100%)] px-4 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-34px_rgba(79,97,232,0.65)]">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative h-28 w-full overflow-hidden rounded-[14px] md:h-24 md:w-38">
                    <img
                        src={enginerring}
                        alt={lesson.topicName}
                        className="h-full w-full rounded-[14px] object-cover"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-medium text-white">
                        {durationLabel}
                    </span>
                </div>

                <div className="flex-1 space-y-1 capitalize">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4255db]">
                            {lesson.status ?? "Approved"}
                        </span>
                        {lesson.approvedByName && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                Approved by {lesson.approvedByName}
                            </span>
                        )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">
                        {lesson.topicName}
                    </h3>
                    <p className="text-sm leading-6 text-slate-600">
                        {lesson.description || lesson.aim || "No description available."}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>{approvedDate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.subTopic || "Sub-topic"}</span>
                </div>

                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        Duration: {lessonDuration}
                    </div>

                    <div className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
                        Expires: {expiryDate}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                        <Signal className="w-4 h-4 text-[#f0b429]" />
                        <span>{lesson.teacherName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate(`/student/recorded-class/${lesson.id}/watch`)} className="rounded-full bg-student-chestnut px-4 py-2 text-sm font-semibold text-white hover:bg-[#4052D6]">
                        <Play className="text-white" /> <span>Watch</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowMediaPanel((prev) => !prev);
                            setActiveMediaIndex(0);
                        }}
                        className="rounded-full border border-student-chestnut/30 bg-[#F3F4FF] px-4 py-2 text-sm font-medium text-student-chestnut hover:bg-[#E8EAFF]"
                    >
                        Lesson media files
                    </Button>
                </div>
            </div>

            {showMediaPanel && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">Lesson media files ({mediaFiles.length})</p>
                        <button
                            type="button"
                            onClick={() => setShowMediaPanel(false)}
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-700"
                        >
                            Close
                        </button>
                    </div>

                    {mediaFiles.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">
                            No media files attached to this lesson.
                        </p>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <div className="space-y-2">
                                {mediaFiles.map((media, index) => (
                                    <button
                                        key={media.mediaId ?? `${media.mediaName}-${index}`}
                                        type="button"
                                        onClick={() => setActiveMediaIndex(index)}
                                        className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                                            activeMediaIndex === index
                                                ? "border-[#4255db] bg-[#eef2ff]"
                                                : "border-slate-200 bg-white hover:bg-slate-50"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold text-slate-800">{media.mediaName}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {(media.mediaType ?? media.fileExtension ?? "File")} {media.fileSizeBytes ? `• ${(media.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : ""}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-700">{activeMedia?.mediaName ?? "Media preview"}</p>
                                {renderMediaPreview()}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoLessonCard;
