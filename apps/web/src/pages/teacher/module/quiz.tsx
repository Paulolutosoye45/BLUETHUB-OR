import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";
import { performanceService, type SubjectClassroomPerformanceDto } from "@/services/performance";
import { schoolService } from "@/services/school";
import { quizService, type StudentQuizHistoryDto } from "@/services/quiz";
import { moduleService, type ModuleStudent } from "@/services/module";
import { Loader2, ChevronDown, ChevronRight, Search, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface SubjectInfo {
  subjectId: string;
  subjectName: string;
  subjectCategory: string;
}

interface ClassroomInfo {
  classroomId: string;
  className: string;
  subjects: SubjectInfo[];
}

interface CurriculumTopic {
  id: string;
  name: string;
  subTopics: { id: string; name: string }[];
}

interface TopicScore {
  avgScore: number | null;
  subTopicScores: Record<string, number | null>;
}

type ViewMode = "classroom" | "topic" | "student";

const ModuleQuiz = () => {
  const { user } = useAuthContext();
  const roleData = user?.roleData;

  const classrooms = useMemo<ClassroomInfo[]>(() => {
    if (!roleData || !isTeacherRoleData(roleData)) return [];
    return (roleData.classrooms ?? []).map((c) => ({
      classroomId: c.classroomId,
      className: c.className,
      subjects: (c.subjects ?? []).map((s) => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        subjectCategory: s.subjectCategory,
      })),
    }));
  }, [roleData]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("classroom");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fetchedSubjects, setFetchedSubjects] = useState<SubjectInfo[]>([]);
  const [classroomsData, setClassroomsData] = useState<SubjectClassroomPerformanceDto[]>([]);
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>([]);
  const [topicScores, setTopicScores] = useState<Record<string, TopicScore>>({});

  const [students, setStudents] = useState<ModuleStudent[]>([]);
  const [studentQuizHistory, setStudentQuizHistory] = useState<Map<string, StudentQuizHistoryDto[]>>(new Map());
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const classroomIds = useMemo(() => new Set(classrooms.map((c) => c.classroomId)), [classrooms]);

  const allSubjects = useMemo(() => {
    const map = new Map<string, SubjectInfo>();
    classrooms.forEach((c) => c.subjects.forEach((s) => map.set(s.subjectId, s)));
    return Array.from(map.values());
  }, [classrooms]);

  const classroomSubjects = useMemo(() => {
    if (!selectedClassroomId) return allSubjects;
    const fromRoleData = classrooms.find((cls) => cls.classroomId === selectedClassroomId)?.subjects;
    if (fromRoleData && fromRoleData.length > 0) return fromRoleData;
    return fetchedSubjects;
  }, [classrooms, selectedClassroomId, allSubjects, fetchedSubjects]);

  useEffect(() => {
    if (classroomSubjects.length > 0 && !classroomSubjects.some((s) => s.subjectId === selectedSubjectId)) {
      setSelectedSubjectId(classroomSubjects[0].subjectId);
    }
  }, [classroomSubjects, selectedSubjectId]);

  useEffect(() => {
    if (allSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(allSubjects[0].subjectId);
    }
  }, [allSubjects]);

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].classroomId);
    } else if (classrooms.length > 0 && selectedClassroomId && !classrooms.some((c) => c.classroomId === selectedClassroomId)) {
      setSelectedClassroomId(classrooms[0].classroomId);
    }
  }, [classrooms, selectedClassroomId]);

  useEffect(() => {
    if (!selectedClassroomId) return;
    const hasRoleDataSubjects = classrooms.find((c) => c.classroomId === selectedClassroomId)?.subjects?.length;
    if (hasRoleDataSubjects) return;
    schoolService.getSubjectsByClassroomId(selectedClassroomId)
      .then((res) => {
        const obj = (res.data as any)?.data ?? {};
        const major: any[] = obj.majorSubjects ?? obj.MajorSubjects ?? [];
        const minor: any[] = obj.minorSubjects ?? obj.MinorSubjects ?? [];
        const all = [...major, ...minor];
        const mapped: SubjectInfo[] = all.map((s: any) => ({
          subjectId: String(s.id ?? s.subjectId ?? ""),
          subjectName: String(s.subject ?? s.subjectName ?? s.name ?? ""),
          subjectCategory: String(s.category ?? s.subjectCategory ?? ""),
        }));
        setFetchedSubjects(mapped);
      })
      .catch(() => setFetchedSubjects([]));
  }, [selectedClassroomId, classrooms]);

  useEffect(() => {
    if (!selectedSubjectId) return;

    setLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please check your connection and try again.");
    }, 20000);

    // Load classrooms performance
    performanceService.getSubjectClassrooms(selectedSubjectId)
      .then((res) => setClassroomsData(res.data.data ?? []))
      .catch((e) => { console.warn("getSubjectClassrooms failed", e); setClassroomsData([]); });

    // Load pre-computed topic & subtopic scores from performance snapshots
    performanceService.getSubjectTopicPerformance(selectedSubjectId)
      .then((res) => {
        const topics = res.data.data ?? [];
        const mappedTopics: CurriculumTopic[] = topics.map((t) => ({
          id: t.topicId,
          name: t.topicName,
          subTopics: t.subTopics.map((st) => ({ id: st.subTopicId, name: st.subTopicName })),
        }));
        setCurriculumTopics(mappedTopics);

        const scores: Record<string, TopicScore> = {};
        for (const t of topics) {
          const stScores: Record<string, number | null> = {};
          t.subTopics.forEach((st) => { stScores[st.subTopicName] = st.averageScore; });
          scores[t.topicId] = { avgScore: t.averageScore, subTopicScores: stScores };
        }
        setTopicScores(scores);
      })
      .catch((e) => { console.warn("getSubjectTopicPerformance failed", e); setCurriculumTopics([]); setTopicScores({}); });

    // Load students for "Per Student" view
    moduleService.getTeacherStudents()
      .then((res) => {
        const studentList = res.data.data ?? [];
        setStudents(studentList);

        if (studentList.length > 0) {
          setLoadingStudents(true);
          Promise.all(
            studentList.map((s) =>
              quizService.getStudentQuizHistory(s.id)
                .then((r) => ({ studentId: s.id, data: r.data.data ?? [] }))
                .catch(() => ({ studentId: s.id, data: [] }))
            )
          ).then((results) => {
            const historyMap = new Map<string, StudentQuizHistoryDto[]>();
            results.forEach((r) => historyMap.set(r.studentId, r.data));
            setStudentQuizHistory(historyMap);
          }).catch((e) => console.warn("load quiz history failed", e))
          .finally(() => setLoadingStudents(false));
        } else {
          setLoadingStudents(false);
        }
      })
      .catch((e) => { console.warn("getTeacherStudents failed", e); setStudents([]); })
      .finally(() => { clearTimeout(timeout); setLoading(false); });
  }, [selectedSubjectId, retryKey]);

  const selectedClassroom = classrooms.find((c) => c.classroomId === selectedClassroomId);
  const studentsInClass = useMemo(() => {
    if (!selectedClassroom) return students;
    return students.filter((s) => s.className === selectedClassroom.className);
  }, [students, selectedClassroom]);

  const filteredStudents = useMemo(() => {
    let list = studentsInClass;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [studentsInClass, search]);

  const handleSubjectChange = (id: string) => {
    setSelectedSubjectId(id);
    setSelectedClassroomId("");
    setExpandedTopic(null);
    setExpandedStudent(null);
  };

  const fmtScore = (val: number | null | undefined) => {
    if (val == null || isNaN(val)) return "---";
    return `${Math.round(val)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#292382]">Quiz Performance</h1>
            <p className="text-sm text-gray-500 mt-1">Track performance by classroom, topic, and per student</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Class:</span>
              <select
                value={selectedClassroomId}
                onChange={(e) => { setSelectedClassroomId(e.target.value); setExpandedStudent(null); setExpandedTopic(null); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#292382] font-medium focus:outline-none focus:ring-2 focus:ring-[#292382]/20"
              >
                {classrooms.map((c) => (
                  <option key={c.classroomId} value={c.classroomId}>{c.className}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#292382] font-medium focus:outline-none focus:ring-2 focus:ring-[#292382]/20"
              >
                {classroomSubjects.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data summary */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2">
          <span>Classrooms: <strong>{classroomsData.filter((c) => classroomIds.has(c.classroomId)).length}</strong></span>
          <span>Topics: <strong>{curriculumTopics.length}</strong></span>
          <span>Students: <strong>{studentsInClass.length}</strong></span>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1 w-fit">
          {(["classroom", "topic", "student"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                viewMode === mode ? "bg-[#292382] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {mode === "classroom" ? "By Classroom" : mode === "topic" ? "By Topic" : "Per Student"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#292382]" />
            <span className="ml-2 text-sm text-gray-500">Loading performance data...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* By Classroom View */}
            {viewMode === "classroom" && (
              <div className="space-y-3">
                {classroomsData.filter((c) => classroomIds.has(c.classroomId)).length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No classroom performance data for this subject.</p>
                  </div>
                )}
                {classroomsData.filter((c) => classroomIds.has(c.classroomId)).map((cls) => (
                  <div key={cls.classroomId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#292382]">{cls.classroomName}</p>
                        <p className="text-xs text-gray-500">{cls.studentCount} students</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <span className={`font-semibold ${cls.averageScorePercent >= 50 ? "text-green-600" : "text-red-600"}`}>
                          {Math.round(cls.averageScorePercent)}% avg
                        </span>
                        <span className={`font-semibold ${cls.passRate >= 50 ? "text-green-600" : "text-red-600"}`}>
                          {Math.round(cls.passRate)}% pass
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* By Topic View */}
            {viewMode === "topic" && (
              <div className="space-y-3">
                {curriculumTopics.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No curriculum topics for this subject.</p>
                  </div>
                )}
                {curriculumTopics.map((topic) => {
                  const isTopicOpen = expandedTopic === topic.id;
                  const score = topicScores[topic.id];
                  const avg = score?.avgScore ?? null;
                  const subs = topic.subTopics;

                  return (
                    <div key={topic.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Topic header */}
                      <button
                        type="button"
                        onClick={() => setExpandedTopic(isTopicOpen ? null : topic.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isTopicOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-[#292382]">{topic.name}</p>
                            <p className="text-xs text-gray-500">{subs.length} subtopics</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs shrink-0">
                            <span className={`font-semibold ${avg != null && avg >= 50 ? "text-green-600" : avg != null ? "text-red-600" : "text-gray-400"}`}>
                              {fmtScore(avg)}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Subtopic list */}
                      {isTopicOpen && (
                        <div className="border-t border-gray-100">
                          <div className="p-4 space-y-3">
                            {subs.length === 0 && (
                              <p className="text-xs text-gray-400 text-center">No subtopics for this topic.</p>
                            )}
                            {subs.map((st) => {
                              const stScore = score?.subTopicScores?.[st.name] ?? null;
                              return (
                                <div key={st.id || st.name} className="border border-gray-200 rounded-lg overflow-hidden">
                                  <div className="flex items-center justify-between p-3 bg-white">
                                    <p className="text-sm font-medium text-[#292382]">{st.name}</p>
                                    <span className={`text-xs font-semibold ${stScore != null && stScore >= 50 ? "text-green-600" : stScore != null ? "text-red-600" : "text-gray-400"}`}>
                                      {fmtScore(stScore)} avg
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Per Student View */}
            {viewMode === "student" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#292382]/20"
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 && !loadingStudents && (
                    <p className="text-sm text-gray-400 text-center py-8">No students found.</p>
                  )}
                  {loadingStudents && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-[#292382]" />
                      <span className="ml-2 text-xs text-gray-500">Loading student data...</span>
                    </div>
                  )}
                  {!loadingStudents && filteredStudents.map((student) => {
                    const history = studentQuizHistory.get(student.id) ?? [];
                    const isOpen = expandedStudent === student.id;
                    const avgScore = history.length > 0 ? Math.round(history.reduce((a, h) => a + (h.finalScorePercent ?? 0), 0) / history.length) : null;
                    return (
                      <div key={student.id}>
                        <button
                          type="button"
                          onClick={() => setExpandedStudent(isOpen ? null : student.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <div className="text-left">
                              <p className="text-sm font-semibold text-[#292382]">{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-gray-500">{student.className || student.userName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            {avgScore !== null && (
                              <span className={`font-semibold ${avgScore >= 50 ? "text-green-600" : "text-red-600"}`}>{avgScore}%</span>
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3">
                            {history.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-3">No quiz attempts yet.</p>
                            )}
                            {history.length > 0 && (
                              <div className="space-y-2">
                                {history.map((h, i) => (
                                  <div key={h.attemptId || i} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-[#292382] truncate">{h.lessonTitle || `Quiz ${h.quizCode}`}</p>
                                      <p className="text-xs text-gray-500">
                                        Attempt {h.attemptNumber} · {h.submittedAt ? new Date(h.submittedAt).toLocaleDateString() : "N/A"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className={`text-sm font-bold ${(h.finalScorePercent ?? 0) >= 50 ? "text-green-600" : "text-red-600"}`}>
                                        {h.finalScorePercent ?? 0}%
                                      </span>
                                      {h.isPassed === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                      {h.isPassed === false && <XCircle className="w-4 h-4 text-red-500" />}
                                      {h.isPassed === null && (
                                        <span className="text-xs text-amber-600 font-medium">Pending</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleQuiz;
