import StudentAppBar from "../component/app-bar";
import ClassView from "./class-view";
import SelectSubject from "./component/select-subject";
import SelectTopic from "./component/select-topic";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import studentService, { type StudentPublishedLesson, type StudentSubjectItem } from "@/services/student";
import toast from "react-hot-toast";
import { isStudentRoleData, useAuthContext } from "@/contexts/auth-context";

const SELECTED_SUBJECT_STORAGE_KEY = "student.recordedClass.subjectId";

interface RecordedClassLocationState {
  subjectId?: string;
}

interface LessonSummary {
  total: number;
  approved: number;
  pendingApproval: number;
  rejected: number;
  published: number;
}

const ClassLayout = () => {
  const { user } = useAuthContext();
  const location = useLocation();
  const locationState = (location.state as RecordedClassLocationState | null) ?? null;
  const stateSubjectId = locationState?.subjectId ?? "";
  const cachedSubjectId = sessionStorage.getItem(SELECTED_SUBJECT_STORAGE_KEY) ?? "";
  const preferredSubjectId = stateSubjectId || cachedSubjectId;

  const [subjects, setSubjects] = useState<StudentSubjectItem[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(preferredSubjectId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [lessons, setLessons] = useState<StudentPublishedLesson[]>([]);
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const studentRoleData = user?.roleData && isStudentRoleData(user.roleData)
    ? user.roleData
    : null;

  const roleBasedSubjects = useMemo<StudentSubjectItem[]>(() => {
    if (!studentRoleData) return [];

    const major = (studentRoleData.majorSubjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: "Major" as const,
    }));

    const minor = (studentRoleData.minorSubjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: "Minor" as const,
    }));

    if (major.length + minor.length > 0) {
      const byId = new Map<string, StudentSubjectItem>();
      [...major, ...minor].forEach((subject) => {
        if (!byId.has(subject.subjectId)) byId.set(subject.subjectId, subject);
      });
      return Array.from(byId.values());
    }

    return (studentRoleData.subjects ?? []).map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      category: subject.subjectCategory,
      subjectType: "Major" as const,
    }));
  }, [studentRoleData]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        if (roleBasedSubjects.length > 0) {
          setSubjects(roleBasedSubjects);

          if (roleBasedSubjects.length === 0) {
            setSelectedSubjectId("");
            return;
          }

          const requestedSubject = preferredSubjectId && roleBasedSubjects.some((item) => item.subjectId === preferredSubjectId);
          const fallbackSubjectId = roleBasedSubjects[0].subjectId;
          const nextSubjectId = requestedSubject ? preferredSubjectId : fallbackSubjectId;

          setSelectedSubjectId(nextSubjectId);
          sessionStorage.setItem(SELECTED_SUBJECT_STORAGE_KEY, nextSubjectId);

          return;
        }

        const response = await studentService.getRegisteredSubjects();
        const data = response?.data?.data;
        const merged = [...(data?.major ?? []), ...(data?.minor ?? [])];
        setSubjects(merged);

        if (merged.length === 0) {
          setSelectedSubjectId("");
          return;
        }

        const requestedSubject = preferredSubjectId && merged.some((item) => item.subjectId === preferredSubjectId);
        const fallbackSubjectId = merged[0].subjectId;
        const nextSubjectId = requestedSubject ? preferredSubjectId : fallbackSubjectId;

        setSelectedSubjectId(nextSubjectId);
        sessionStorage.setItem(SELECTED_SUBJECT_STORAGE_KEY, nextSubjectId);
      } catch (error) {
        console.error("Failed to load student subjects:", error);
        setSubjects(roleBasedSubjects);
        if (roleBasedSubjects.length === 0) {
          toast.error("Unable to load your subjects");
        }
      } finally {
        setLoadingSubjects(false);
      }
    };

    void loadSubjects();
  }, [preferredSubjectId, roleBasedSubjects]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setLessons([]);
      setSummary(null);
      return;
    }

    const loadLessons = async () => {
      try {
        setLoadingLessons(true);
        const response = await studentService.getLessonsBySubject(selectedSubjectId);
        const payload = response?.data?.data as {
          lessons?: StudentPublishedLesson[];
          Lessons?: StudentPublishedLesson[];
          summary?: LessonSummary;
          Summary?: LessonSummary;
        } | undefined;
        setLessons(payload?.lessons ?? payload?.Lessons ?? []);
        setSummary(payload?.summary ?? payload?.Summary ?? null);
      } catch (error) {
        console.error("Failed to load lessons for subject:", error);
        toast.error("Unable to load lessons for this subject");
        setLessons([]);
        setSummary(null);
      } finally {
        setLoadingLessons(false);
      }
    };

    void loadLessons();
  }, [selectedSubjectId]);

  const subjectOptions = useMemo(
    () => subjects.map((subject) => ({ label: subject.subjectName, value: subject.subjectId })),
    [subjects]
  );

  const topicOptions = useMemo(() => {
    const uniqueTopics = new Map<string, string>();
    lessons.forEach((lesson) => {
      if (!uniqueTopics.has(lesson.topicId)) {
        uniqueTopics.set(lesson.topicId, lesson.topicName);
      }
    });
    return Array.from(uniqueTopics.entries()).map(([value, label]) => ({ value, label }));
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    if (selectedTopicId) {
      filtered = filtered.filter((lesson) => lesson.topicId === selectedTopicId);
    }

    return filtered;
  }, [lessons, selectedSubjectId, selectedTopicId]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId("");
    sessionStorage.setItem(SELECTED_SUBJECT_STORAGE_KEY, subjectId);
  };

  const selectedSubjectLabel = useMemo(
    () => subjectOptions.find((subject) => subject.value === selectedSubjectId)?.label ?? "Recorded Classes",
    [subjectOptions, selectedSubjectId],
  );

  const uniqueTopicCount = useMemo(
    () => new Set(filteredLessons.map((lesson) => lesson.topicId)).size,
    [filteredLessons],
  );

  return (
    <div
      className="px-3 md:px-7 h-screen transition-all duration-300 border-none 
      overflow-y-auto 
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar]:h-2.5 
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-400
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
    >
      {/* App Bar */}
      <StudentAppBar />

      <section className="mt-6 rounded-[28px] border border-white/70 bg-[radial-gradient(circle_at_top_right,_rgba(79,97,232,0.15),_transparent_48%),linear-gradient(180deg,_#ffffff_0%,_#f5f8ff_100%)] px-5 py-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.42)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4F61E8]">Recorded classes</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{selectedSubjectLabel}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse approved class recordings, then filter by topic to find exactly what you need.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Lessons</p>
              <p className="text-lg font-semibold text-slate-900">{filteredLessons.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Topics</p>
              <p className="text-lg font-semibold text-slate-900">{uniqueTopicCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="grid grid-cols-1 xl:grid-cols-[330px_minmax(0,1fr)] gap-5 mt-6 justify-center">
        {/* Left Sidebar */}
        <section className="flex flex-col gap-6">
          <SelectSubject
            options={subjectOptions}
            value={selectedSubjectId}
            onChange={handleSubjectChange}
          />
          <SelectTopic
            options={topicOptions}
            value={selectedTopicId}
            onChange={setSelectedTopicId}
          />
        </section>

        {/* Right Content Area */}
        <section className="w-full">
          <ClassView
            lessons={filteredLessons}
            loading={loadingSubjects || loadingLessons}
            selectedSubjectLabel={selectedSubjectLabel}
            selectedTopicLabel={topicOptions.find((topic) => topic.value === selectedTopicId)?.label}
            summary={summary}
          />
        </section>
      </section>
    </div>
  );
};

export default ClassLayout;
