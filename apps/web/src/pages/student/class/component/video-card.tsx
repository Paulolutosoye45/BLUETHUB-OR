import { CalendarDays, CheckCircle2, Clock, Loader2, Signal, XCircle } from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import Play from '@/assets/svg/play.svg?react'
import { useNavigate } from "react-router-dom";
import type { StudentPublishedLesson } from "@/services/student";
import enginerring from "@/assets/png/engineering.png";
import { useMemo, useState } from "react";
import { quizService, type QuizAnswerPayload, type StudentQuizData, type StudentQuizQuestion } from "@/services/quiz";
import toast from "react-hot-toast";

interface VideoLessonCardProps {
    lesson: StudentPublishedLesson;
}

// ── Quiz panel ────────────────────────────────────────────────────────────────

interface QuizAttemptPanelProps {
    quizId: string;
    onClose: () => void;
}

const QuizAttemptPanel = ({ quizId, onClose }: QuizAttemptPanelProps) => {
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quiz, setQuiz] = useState<StudentQuizData | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; totalMarks: number; percentageScore: number; passed: boolean; feedback?: string } | null>(null);

    const fetchQuiz = async () => {
        try {
            setLoadingQuiz(true);
            const res = await quizService.getStudentQuiz(quizId);
            const data = res.data?.data;
            if (data) {
                setQuiz(data);
                setLoaded(true);
            } else {
                toast.error("Quiz not found");
            }
        } catch {
            toast.error("Failed to load quiz. Please try again.");
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        const unanswered = quiz.questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
            toast.error(`Please answer all questions (${unanswered.length} remaining)`);
            return;
        }

        const payload: QuizAnswerPayload[] = quiz.questions.map((q) => ({
            questionId: q.id,
            selectedOptionId: answers[q.id] ?? null,
        }));

        try {
            setSubmitting(true);
            const res = await quizService.submitQuizAttempt(quizId, payload);
            const attemptResult = res.data?.data;
            if (attemptResult) {
                setResult(attemptResult);
            } else {
                toast.error("Failed to get quiz results");
            }
        } catch {
            toast.error("Failed to submit quiz. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Start screen
    if (!loaded && !loadingQuiz) {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="rounded-full bg-[#eef2ff] p-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#4255db]" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800">Quiz attached to this lesson</p>
                    <p className="mt-1 text-xs text-slate-500">Complete the lesson material before attempting the quiz</p>
                </div>
                <Button
                    onClick={() => void fetchQuiz()}
                    className="rounded-full bg-[#4255db] px-6 py-2 text-sm font-semibold text-white hover:bg-[#3447cc]"
                >
                    Start Quiz
                </Button>
            </div>
        );
    }

    if (loadingQuiz) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading quiz…</span>
            </div>
        );
    }

    // Results screen
    if (result) {
        const passed = result.passed;
        return (
            <div className="flex flex-col items-center gap-5 py-6 text-center">
                {passed ? (
                    <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                ) : (
                    <XCircle className="h-14 w-14 text-rose-500" />
                )}
                <div>
                    <p className={`text-2xl font-bold ${passed ? "text-emerald-600" : "text-rose-600"}`}>
                        {result.percentageScore.toFixed(0)}%
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                        {result.score} / {result.totalMarks} marks
                    </p>
                    <p className={`mt-2 text-sm font-semibold ${passed ? "text-emerald-600" : "text-rose-500"}`}>
                        {passed ? "Well done — you passed!" : "Better luck next time!"}
                    </p>
                    {result.feedback && (
                        <p className="mt-2 text-xs text-slate-500">{result.feedback}</p>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full border-slate-300 px-6 text-sm text-slate-600"
                >
                    Close
                </Button>
            </div>
        );
    }

    if (!quiz) return null;

    const answeredCount = Object.keys(answers).length;
    const totalCount = quiz.questions.length;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-800">
                        Quiz — {totalCount} question{totalCount !== 1 ? "s" : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {answeredCount} of {totalCount} answered
                    </p>
                </div>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-[#4255db] transition-all"
                        style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {quiz.questions.map((question: StudentQuizQuestion, qIdx: number) => (
                    <div key={question.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-800">
                            <span className="mr-2 text-[#4255db]">Q{qIdx + 1}.</span>
                            {question.title}
                        </p>
                        {question.textContent && (
                            <p className="mt-1.5 text-sm text-slate-600">{question.textContent}</p>
                        )}
                        {question.imageUrl && (
                            <img
                                src={question.imageUrl}
                                alt="Question illustration"
                                className="mt-2 max-h-48 rounded-lg object-contain"
                            />
                        )}
                        <div className="mt-3 space-y-2">
                            {question.options.map((option) => {
                                const selected = answers[question.id] === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelectOption(question.id, option.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                                            selected
                                                ? "border-[#4255db] bg-[#eef2ff] font-semibold text-[#4255db]"
                                                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                                        }`}
                                    >
                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                                            selected ? "border-[#4255db] bg-[#4255db] text-white" : "border-slate-300 bg-white text-slate-500"
                                        }`}>
                                            {option.optionLabel}
                                        </span>
                                        {option.optionText}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-right text-[11px] text-slate-400">{question.marksAllocation} mark{question.marksAllocation !== 1 ? "s" : ""}</p>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full border-slate-300 px-5 text-sm text-slate-600"
                    disabled={submitting}
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => void handleSubmit()}
                    disabled={submitting || answeredCount < totalCount}
                    className="rounded-full bg-[#4255db] px-6 text-sm font-semibold text-white hover:bg-[#3447cc] disabled:opacity-50"
                >
                    {submitting ? (
                        <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Submitting…</>
                    ) : (
                        `Submit Quiz (${answeredCount}/${totalCount})`
                    )}
                </Button>
            </div>
        </div>
    );
};

// ── Main card ─────────────────────────────────────────────────────────────────

const VideoLessonCard = ({
    lesson,
}: VideoLessonCardProps) => {

    const navigate = useNavigate()
    const [showMediaPanel, setShowMediaPanel] = useState(false);
    const [showQuizPanel, setShowQuizPanel] = useState(false);
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
                        {lesson.quizId && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                Quiz attached
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

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={() =>
                            navigate(`/student/recorded-class/${lesson.id}/watch`, {
                                state: { lesson },
                            })
                        }
                        className="rounded-full bg-student-chestnut px-4 py-2 text-sm font-semibold text-white hover:bg-[#4052D6]"
                    >
                        <Play className="text-white" /> <span>Watch</span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowMediaPanel((prev) => !prev);
                            if (showQuizPanel) setShowQuizPanel(false);
                            setActiveMediaIndex(0);
                        }}
                        className="rounded-full border border-student-chestnut/30 bg-[#F3F4FF] px-4 py-2 text-sm font-medium text-student-chestnut hover:bg-[#E8EAFF]"
                    >
                        Lesson media files
                    </Button>

                    {lesson.quizId && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowQuizPanel((prev) => !prev);
                                if (showMediaPanel) setShowMediaPanel(false);
                            }}
                            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                        >
                            {showQuizPanel ? "Hide Quiz" : "Take Quiz"}
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Media files panel ─────────────────────────────────────────── */}
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

            {/* ── Quiz attempt panel ────────────────────────────────────────── */}
            {showQuizPanel && lesson.quizId && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-amber-800">Lesson Quiz</p>
                        <button
                            type="button"
                            onClick={() => setShowQuizPanel(false)}
                            className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 hover:text-slate-700"
                        >
                            Close
                        </button>
                    </div>
                    <QuizAttemptPanel quizId={lesson.quizId} onClose={() => setShowQuizPanel(false)} />
                </div>
            )}
        </div>
    );
};

export default VideoLessonCard;


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
                    <Button
                        onClick={() =>
                            navigate(`/student/recorded-class/${lesson.id}/watch`, {
                                state: { lesson },
                            })
                        }
                        className="rounded-full bg-student-chestnut px-4 py-2 text-sm font-semibold text-white hover:bg-[#4052D6]"
                    >
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
