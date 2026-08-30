import CourseHero from "./course-hero"
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import CourseOverview from "./course-overview";
import CourseTopics from "./course-topics";
import CourseAssessments from "./course-assessments";
import CoursePDFs from "./course-pdfs";
import { getSubjectStyle } from "./course";
import studentService, { type StudentPublishedLesson } from "@/services/student";
import { isStudentRoleData, useAuthContext } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

type Tab = "Overview" | "Topics" | "Assessments" | "PDFs";

interface SubjectLocationState {
    subjectName?: string;
    category?: string;
    subjectType?: string;
}

const SubjectList = () => {
    const { subjectId = "" } = useParams<{ subjectId: string }>();
    const location = useLocation();
    const locationState = (location.state as SubjectLocationState | null) ?? null;
    const { user } = useAuthContext();

    const roleData = user?.roleData;
    const classroomName = roleData && isStudentRoleData(roleData) ? roleData.classroom?.className ?? undefined : undefined;

    const TABS: Tab[] = ["Overview", "Topics", "Assessments", "PDFs"];
    const [activeTab, setActiveTab] = useState<Tab>("Overview");

    const [lessons, setLessons] = useState<StudentPublishedLesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!subjectId) return;
        let cancelled = false;
        setLoading(true);
        studentService
            .getLessonsBySubject(subjectId)
            .then((res) => {
                if (cancelled) return;
                const payload = (res.data as any)?.data as
                    | { lessons?: StudentPublishedLesson[]; Lessons?: StudentPublishedLesson[] }
                    | undefined;
                setLessons(payload?.lessons ?? payload?.Lessons ?? []);
            })
            .catch(() => {
                if (!cancelled) setLessons([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [subjectId]);

    const subjectName = locationState?.subjectName || lessons[0]?.subjectName || "Subject";
    const style = useMemo(() => getSubjectStyle(subjectName), [subjectName]);
    const teacher = lessons[0]?.teacherName ?? "";

    const topicsCount = useMemo(() => new Set(lessons.map((l) => l.topicId)).size, [lessons]);
    const quizzesCount = useMemo(() => lessons.filter((l) => !!l.quizId).length, [lessons]);
    const pdfsCount = useMemo(
        () =>
            lessons.reduce(
                (acc, l) =>
                    acc + (l.media ?? []).filter((m) => /pdf/i.test(m.mediaType ?? "") || /pdf/i.test(m.fileExtension ?? "")).length,
                0,
            ),
        [lessons],
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <CourseHero
                department={locationState?.category}
                title={subjectName}
                teacher={teacher}
                icon={style.icon}
                topics={topicsCount}
                lessons={lessons.length}
                pdfs={pdfsCount}
                quizzes={quizzesCount}
            />

            <div className="mx-3 my-[11px]">
                {/* Tab Bar */}
                <div className="bg-white drop-shadow-sm p-[4px] rounded-[10px] flex items-center gap-1 mb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-[8px] text-sm font-semibold transition-all duration-150 ${activeTab === tab
                                ? "bg-[#4F61E8] text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading subject...
                </div>
            ) : (
                <>
                    {activeTab === "Overview" && (
                        <CourseOverview
                            subjectId={subjectId}
                            lessons={lessons}
                            topicsCount={topicsCount}
                            quizzesCount={quizzesCount}
                            category={locationState?.category}
                            subjectType={locationState?.subjectType}
                            classroomName={classroomName}
                        />
                    )}
                    {activeTab === "Topics" && <CourseTopics lessons={lessons} />}
                    {activeTab === "Assessments" && <CourseAssessments subjectId={subjectId} lessons={lessons} />}
                    {activeTab === "PDFs" && <CoursePDFs lessons={lessons} />}
                </>
            )}

        </div>
    )
}

export default SubjectList
