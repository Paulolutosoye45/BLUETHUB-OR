import { isTeacherRoleData, useAuthContext } from "@/contexts/auth-context";
import { performanceService, type SubjectClassroomPerformanceDto } from "@/services/performance";
import { schoolService } from "@/services/school";
import { studentService, type StudentPublishedLesson } from "@/services/student";
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

  const classrooms: ClassroomInfo[] = roleData && isTeacherRoleData(roleData)
    ? roleData.classrooms.map((c) => ({
        classroomId: c.classroomId,
        className: c.className,
        subjects: c.subjects.map((s) => ({
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          subjectCategory: s.subjectCategory,
        })),
      }))
    : [];

  const allSubjects = useMemo(() => {
    const map = new Map<string, SubjectInfo>();
    classrooms.forEach((c) => c.subjects.forEach((s) => map.set(s.subjectId, s)));
    return Array.from(map.values());
  }, [classrooms]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("classroom");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (allSubjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(allSubjects[0].subjectId);
    }
  }, [allSubjects]);

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

    // Load curriculum (topic/subtopic tree)
    schoolService.getSubjectCurriculum(selectedSubjectId)
      .then((res) => {
        const raw = (res.data as any)?.data ?? (res.data as any)?.Data ?? {};
        const topicsRaw: any[] = raw.Topics ?? raw.topics ?? [];
        const mapped: CurriculumTopic[] = topicsRaw.map((t: any) => ({
          id: String(t.Id ?? t.id ?? t.topicId ?? ""),
          name: String(t.Name ?? t.name ?? t.topicName ?? ""),
          subTopics: (t.SubTopics ?? t.subTopics ?? []).map((s: any) => ({
            id: String(s.Id ?? s.id ?? s.subTopicId ?? ""),
            name: String(s.Name ?? s.name ?? s.subTopicName ?? ""),
          })),
        }));
        setCurriculumTopics(mapped);
      })
      .catch((e) => { console.warn("getSubjectCurriculum failed", e); setCurriculumTopics([]); });

    // Load lessons by subject + student quiz history → compute per-topic scores
    Promise.all([
      studentService.getLessonsBySubject(selectedSubjectId).catch((e) => {
        console.warn("getLessonsBySubject failed", e);
        return { data: { data: { lessons: [] as StudentPublishedLesson[] } } };
      }),
      moduleService.getTeacherStudents().catch((e) => {
        console.warn("getTeacherStudents failed", e);
        return { data: { data: [] as ModuleStudent[] } };
      }),
    ]).then(([lessonsRes, studentsRes]) => {
      const lessons: StudentPublishedLesson[] = lessonsRes.data.data?.lessons ?? [];
      const studentList: ModuleStudent[] = studentsRes.data.data ?? [];
      setStudents(studentList);

      // Build quizCode → topicId/subTopic mapping from lessons
      const quizToTopic = new Map<string, { topicId: string; subTopic: string }>();
      const topicQuizCodes = new Map<string, Set<string>>();
      const subTopicQuizCodes = new Map<string, Set<string>>();

      for (const lesson of lessons) {
        const qc = lesson.quizCode;
        if (qc) {
          const tid = lesson.topicId || lesson.topicName;
          const st = lesson.subTopic;

          quizToTopic.set(qc, { topicId: tid, subTopic: st });

          if (!topicQuizCodes.has(tid)) topicQuizCodes.set(tid, new Set());
          topicQuizCodes.get(tid)!.add(qc);

          if (st) {
            const key = `${tid}::${st}`;
            if (!subTopicQuizCodes.has(key)) subTopicQuizCodes.set(key, new Set());
            subTopicQuizCodes.get(key)!.add(qc);
          }
        }
      }

      // Load quiz history for all students
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

          // Compute avg scores per quizCode
          const quizScores = new Map<string, number[]>();
          results.forEach((r) => {
            r.data.forEach((h) => {
              const qc = h.quizCode;
              const score = h.finalScorePercent;
              if (qc && score != null && quizToTopic.has(qc)) {
                if (!quizScores.has(qc)) quizScores.set(qc, []);
                quizScores.get(qc)!.push(score);
              }
            });
          });
          const quizAvg = new Map<string, number>();
          quizScores.forEach((scores, qc) => {
            quizAvg.set(qc, scores.reduce((a, b) => a + b, 0) / scores.length);
          });

          // Aggregate per topic / subtopic
          const scores: Record<string, TopicScore> = {};
          for (const [tid, qcodes] of topicQuizCodes) {
            const vals: number[] = [];
            qcodes.forEach((qc) => { const v = quizAvg.get(qc); if (v != null) vals.push(v); });
            scores[tid] = {
              avgScore: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
              subTopicScores: {},
            };
          }
          for (const [key, qcodes] of subTopicQuizCodes) {
            const vals: number[] = [];
            qcodes.forEach((qc) => { const v = quizAvg.get(qc); if (v != null) vals.push(v); });
            const [tid, stName] = key.split("::");
            if (!scores[tid]) scores[tid] = { avgScore: null, subTopicScores: {} };
            scores[tid].subTopicScores[stName] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          }
          setTopicScores(scores);
        }).catch((e) => console.warn("load quiz history failed", e))
        .finally(() => setLoadingStudents(false));
      } else {
        setLoadingStudents(false);
      }
    }).catch((e) => console.warn("load lessons/students failed", e))
    .finally(() => { clearTimeout(timeout); setLoading(false); });
  }, [selectedSubjectId, retryKey]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.userName.toLowerCase().includes(q)
    );
  }, [students, search]);

  const handleSubjectChange = (id: string) => {
    setSelectedSubjectId(id);
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-[#292382] font-medium focus:outline-none focus:ring-2 focus:ring-[#292382]/20"
            >
              {allSubjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data summary */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2">
          <span>Classrooms: <strong>{classroomsData.length}</strong></span>
          <span>Topics: <strong>{curriculumTopics.length}</strong></span>
          <span>Students: <strong>{students.length}</strong></span>
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
                {classroomsData.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No classroom performance data for this subject.</p>
                  </div>
                )}
                {classroomsData.map((cls) => (
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
