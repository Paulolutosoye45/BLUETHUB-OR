import { API } from './index';
import type { TResponse } from './index';
import { getTenantFromUrl } from '@/utils/subdomain';

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateQuizResponse {
  quizCode: string;
  questionCount: number;
  createdAt: string;
}

export interface QuizConfigPayload {
  allowRetakes: boolean;
  maxAttempts: number;
  passMarkPercent: number;
  timeLimitMinutes?: number | null;
  autoSubmitOnTimeout: boolean;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  allowAIAssistance: boolean;
  maxAIAssistancePerQuestion: number;
  starMarkEasy: number;
  starMarkMedium: number;
  starMarkHard: number;
  starMarkExpert: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSESSMENT SET DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface AssessmentSetSummaryDto {
  id: string;
  name: string;
  description?: string | null;
  questionCount: number;
  totalMarks: number;
  passMarkPercent: number;
  timeLimitMinutes: number | null;
  allowRetakes: boolean;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSetDto {
  id: string;
  name: string;
  description?: string | null;
  classroomId?: string | null;
  subjectId?: string | null;
  topicId?: string | null;
  subTopicId?: string | null;
  questionIds: string[];
  passMarkPercent: number;
  timeLimitMinutes: number | null;
  allowRetakes: boolean;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  allowAIAssistance: boolean;
  maxAIAssistancePerQuestion: number;
  starMarkEasy: number;
  starMarkMedium: number;
  starMarkHard: number;
  starMarkExpert: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentSetViewModel {
  name: string;
  description?: string | null;
  classroomId?: string | null;
  subjectId?: string | null;
  topicId?: string | null;
  subTopicId?: string | null;
  questionIds: string[];
  passMarkPercent?: number;
  timeLimitMinutes?: number | null;
  allowRetakes?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultImmediately?: boolean;
  showCorrectAnswers?: boolean;
  allowBoardAnswer?: boolean;
  allowAIAssistance?: boolean;
  maxAIAssistancePerQuestion?: number;
  starMarkEasy?: number;
  starMarkMedium?: number;
  starMarkHard?: number;
  starMarkExpert?: number;
}

export interface UpdateAssessmentSetViewModel {
  id: string;
  name?: string;
  description?: string | null;
  classroomId?: string | null;
  subjectId?: string | null;
  topicId?: string | null;
  subTopicId?: string | null;
  questionIds?: string[];
  passMarkPercent?: number;
  timeLimitMinutes?: number | null;
  allowRetakes?: boolean;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  showResultImmediately?: boolean;
  showCorrectAnswers?: boolean;
  allowBoardAnswer?: boolean;
  allowAIAssistance?: boolean;
  maxAIAssistancePerQuestion?: number;
  starMarkEasy?: number;
  starMarkMedium?: number;
  starMarkHard?: number;
  starMarkExpert?: number;
}
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/quiz/lesson/{lessonId} DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuizLessonQuestionDto {
  questionId: string;
  title: string;
  textContent: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  subjectName: string;
  topicName: string;
  displayOrder: number;
}

export interface QuizLessonResponse {
  lessonId: string;
  quizCode: string;
  questionCount: number;
  questions: QuizLessonQuestionDto[];
}

export interface QuizOptionDto {
  optionId: string;
  optionLabel: string;
  optionText: string;
}

export interface QuizQuestionDetailDto {
  questionId: string;
  title: string;
  textContent: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  subjectName: string;
  topicName: string;
  displayOrder: number;
  options: QuizOptionDto[];
  imageUrl: string | null;
  boardSnapshotUrl: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT QUIZ DISPLAY DTOs (GET /api/Quiz/student/lesson/{lessonId}/display)
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuizSettingsDisplayDto {
  allowRetakes: boolean;
  maxAttempts: number;
  passMarkPercent: number;
  timeLimitMinutes: number | null;
  autoSubmitOnTimeout: boolean;
  shuffleQuestions: boolean;
  showResultMode: string;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  easyMarks: number;
  mediumMarks: number;
  hardMarks: number;
  examLevelMarks: number;
}

export interface AttemptStatusDisplayDto {
  hasInProgressAttempt: boolean;
  inProgressAttemptId: string | null;
  completedAttempts: number;
  maxAttemptsReached: boolean;
  canStart: boolean;
}

export interface StudentQuizQuestionDto {
  questionId: string;
  title: string;
  textContent: string;
  questionType: number;
  questionTypeName: string;
  difficultyLevel: number;
  difficultyName: string;
  marksAllocation: number;
  resolvedMaxMarks: number;
  displayOrder: number;
  subjectName: string;
  topicName: string;
  options: QuizOptionDto[];
  imageUrl: string | null;
  boardSnapshotUrl: string | null;
}

export interface StudentQuizDisplayDto {
  lessonId: string;
  quizCode: string;
  totalQuestions: number;
  totalMarks: number;
  config: QuizSettingsDisplayDto;
  attemptStatus: AttemptStatusDisplayDto;
  questions: StudentQuizQuestionDto[];
}

export interface StartQuizPayload {
  lessonId: string;
}

export interface StartQuizResponse {
  attemptId: string;
  quizCode: string;
  attemptNumber: number;
  timeLimitMinutes: number | null;
  totalQuestions: number;
  questions: QuizQuestionDetailDto[];
}

export interface QuizAnswerSubmission {
  questionId: string;
  selectedOptionId?: string | null;
  typedAnswer?: string | null;
  boardSessionId?: string | null;
  audioUrl?: string | null;
  timeTakenMs?: number | null;
  isSkipped: boolean;
}

export interface SubmitQuizPayload {
  answers: QuizAnswerSubmission[];
  timeTakenSeconds?: number | null;
}

export interface QuizAnswerResultDto {
  questionId: string;
  questionType: number;
  maxMarks: number;
  marksObtained: number | null;
  isCorrect: boolean | null;
  typedAnswer: string | null;
  teacherFeedback: string | null;
  isSkipped: boolean;
}

export interface QuizResultDto {
  attemptId: string;
  quizCode: string;
  attemptNumber: number;
  totalMarks: number;
  autoMarksObtained: number;
  manualMarksObtained: number;
  finalScorePercent: number;
  isPassed: boolean | null;
  status: string;
  submittedAt: string | null;
  answers: QuizAnswerResultDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADING & ANALYTICS DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface GradeAnswerPayload {
  starCount?: number;
  manualMarksObtained?: number;
  teacherFeedback?: string;
}

export interface PendingGradeDto {
  answerId: string;
  attemptId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  quizCode: string;
  lessonTitle: string;
  questionType: number;
  typedAnswer: string | null;
  boardSessionId: string | null;
  audioUrl: string | null;
  maxMarks: number;
  submittedAt: string | null;
}

export interface GradingDetailDto {
  answerId: string;
  attemptId: string;
  questionId: string;
  studentId: string;
  studentName: string;
  quizCode: string;
  lessonTitle: string;
  questionType: number;
  typedAnswer: string | null;
  boardSessionId: string | null;
  audioUrl: string | null;
  maxMarks: number;
  submittedAt: string;
  difficultyLevel: number;
  questionTitle: string;
  questionTextContent: string;
  starMarkEasy: number;
  starMarkMedium: number;
  starMarkHard: number;
  starMarkExpert: number;
}

export interface LessonQuizResultDto {
  attemptId: string;
  studentId: string;
  studentName: string;
  attemptNumber: number;
  finalScorePercent: number;
  isPassed: boolean | null;
  status: string;
  submittedAt: string | null;
}

export interface QuestionAnalyticsDto {
  questionId: string;
  questionTitle: string;
  questionType: number;
  maxMarks: number;
  averageMarksObtained: number;
  successRate: number;
  totalAttempts: number;
}

export interface QuizAnalyticsDto {
  lessonId: string;
  quizCode: string;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  perQuestionStats: QuestionAnalyticsDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURE QUIZ DTOs (POST /api/quiz/configure)
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConfigureQuizPayload {
  quizCode: string;
  questionIds: string[];
  assessmentSetId?: string | null;
}

export interface QuizConfiguredDto {
  quizCode: string;
  assessmentSetId?: string | null;
  questionCount: number;
  modifiedAt: string;
}

export interface StudentQuizHistoryDto {
  attemptId: string;
  quizCode: string;
  lessonId: string;
  lessonTitle: string;
  attemptNumber: number;
  finalScorePercent: number;
  isPassed: boolean | null;
  status: string;
  submittedAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBJECT QUIZZES DTO (GET /api/quiz/subject/{subjectId})
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubjectQuizItemDto {
  quizCode: string;
  lessonTitle: string;
  totalQuestions: number;
  totalMarks: number;
  config: QuizSettingsDisplayDto;
  attemptStatus: AttemptStatusDisplayDto;
  bestScorePercent: number | null;
  bestIsPassed: boolean | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSESSMENT SET DTOs (from server)
// ═══════════════════════════════════════════════════════════════════════════════

export interface AssessmentSetServerDto {
  id: string;
  name: string;
  label: string;
  teacherId?: string;
  schoolId?: string;
  passMarkPercent?: number;
  timeLimitMinutes: number | null;
  allowRetakes: boolean;
  maxAttempts: number;
  showResultMode: string;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  easyMarks: number;
  mediumMarks: number;
  hardMarks: number;
  examLevelMarks: number;
  isActive: boolean;
  creationDate?: string;
  modifiedDate?: string;
}

export interface CreateAssessmentSetServerPayload {
  name: string;
  label: string;
  allowRetakes: boolean;
  maxAttempts: number;
  passMarkPercent: number;
  timeLimitMinutes: number | null;
  autoSubmitOnTimeout: boolean;
  shuffleQuestions: boolean;
  showResultMode: string;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  easyMarks: number;
  mediumMarks: number;
  hardMarks: number;
  examLevelMarks: number;
}

export interface LessonAssessmentConfigDto {
  assessmentSetId: string | null;
  assessmentSetName: string;
  allowRetakes: boolean;
  maxAttempts: number;
  passMarkPercent: number;
  timeLimitMinutes: number | null;
  autoSubmitOnTimeout: boolean;
  shuffleQuestions: boolean;
  showResultMode: string;
  showCorrectAnswers: boolean;
  allowBoardAnswer: boolean;
  easyMarks: number;
  mediumMarks: number;
  hardMarks: number;
  examLevelMarks: number;
  source: "lesson-assessment-set" | "teacher-default" | "system-default";
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSESSMENTS (CREATE QUIZ + ASSESSMENT SET)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateQuizAssessmentPayload {
  questionIds: string[];
  assessmentSetId: string | null;
  name: string | null;
}

export interface CreateQuizAssessmentResponse {
  quizCode: string;
  assessmentSetId: string | null;
  assessmentSetName: string;
  questionCount: number;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE — Per-lesson quiz stats for a classroom / subject
// ═══════════════════════════════════════════════════════════════════════════════

export interface ClassroomQuizPerformanceDto {
  lessonId: string;
  quizCode: string;
  lessonTitle: string;
  subjectName: string;
  classroomName: string;
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScorePercent: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
}

export interface SubjectQuizPerformanceDto {
  lessonId: string;
  quizCode: string;
  lessonTitle: string;
  subjectName: string;
  classroomName: string;
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScorePercent: number;
  passCount: number;
  failedCount: number;
  passRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE — Student aggregate + per-quiz breakdown
// ═══════════════════════════════════════════════════════════════════════════════

export interface StudentQuizPerformanceItemDto {
  attemptId: string;
  lessonId: string;
  quizCode: string;
  lessonTitle: string;
  classroomName: string;
  subjectName: string;
  attemptCount: number;
  bestScorePercent: number;
  bestAttemptId: string;
  isPassed: boolean;
  latestStatus: string;
  latestSubmittedAt: string;
}

export interface StudentQuizPerformanceDto {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScorePercent: number;
  passRate: number;
  bestScorePercent: number;
  quizzes: StudentQuizPerformanceItemDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE — Student quiz performance scoped to a subject or subtopic
// ═══════════════════════════════════════════════════════════════════════════════

export interface StudentQuizPerformanceScopedDto extends StudentQuizPerformanceDto {
  subjectId: string | null;
  subjectName: string;
  topicId: string | null;
  subTopicId: string | null;
  subTopicName: string;
}

const headers = { 'X-Tenant-ID': getTenantFromUrl() };

export const quizService = {
  // ── Teacher: Create Quiz ────────────────────────────────────────────────────
  createQuiz: (questionIds: string[]) =>
    API.post<TResponse<CreateQuizResponse>>(
      'api/Quiz/create',
      { questionIds },
      { headers },
    ),

  // ── Teacher: Attach Quiz to Lesson ──────────────────────────────────────────
  attachQuizToLesson: (lessonId: string, quizCode: string) =>
    API.patch<TResponse<null>>(
      `api/Quiz/lesson/${lessonId}/attach`,
      { quizCode },
      { headers },
    ),

  // ── Teacher / Student: Get Quiz by Lesson ───────────────────────────────────
  getQuizByLesson: (lessonId: string) =>
    API.get<TResponse<QuizLessonResponse>>(
      `api/Quiz/lesson/${lessonId}`,
      { headers },
    ),

  // ── Teacher: Configure Quiz (replace questions + assessment set) ────────────
  configureQuiz: (payload: ConfigureQuizPayload) =>
    API.post<TResponse<QuizConfiguredDto>>(
      'api/quiz/configure',
      payload,
      { headers },
    ),

  // ── Quiz Config ─────────────────────────────────────────────────────────────
  saveQuizConfig: (payload: QuizConfigPayload) =>
    API.post<TResponse<null>>('api/Quiz/config', payload, { headers }),

  getQuizConfig: () =>
    API.get<TResponse<QuizConfigPayload>>('api/Quiz/config', { headers }),

  // ── Student: Quiz Display (pre-start) ──────────────────────────────────────
  getStudentQuizDisplay: (lessonId: string) =>
    API.get<TResponse<StudentQuizDisplayDto>>(
      `api/Quiz/student/lesson/${lessonId}/display`,
      { headers },
    ),

  // ── Student: Quiz Display by Code (enter quiz code manually) ───────────────
  getStudentQuizDisplayByCode: (quizCode: string) =>
    API.get<TResponse<StudentQuizDisplayDto>>(
      `api/quiz/code/${quizCode}/display`,
      { headers },
    ),

  // ── Student: Quiz Attempt ───────────────────────────────────────────────────
  startQuizAttempt: (payload: StartQuizPayload) =>
    API.post<TResponse<StartQuizResponse>>(
      'api/Quiz/attempt/start',
      payload,
      { headers },
    ),

  submitQuizAttempt: (attemptId: string, payload: SubmitQuizPayload) =>
    API.post<TResponse<QuizResultDto | null>>(
      `api/Quiz/attempt/${attemptId}/submit`,
      payload,
      { headers },
    ),

  getQuizResult: (attemptId: string) =>
    API.get<TResponse<QuizResultDto>>(
      `api/Quiz/attempt/${attemptId}/result`,
      { headers },
    ),

  // ── Teacher: Grading ────────────────────────────────────────────────────────
    getPendingGrades: () =>
    API.get<TResponse<PendingGradeDto[]>>('api/Quiz/grading/pending', { headers }),

  getGradingDetail: () =>
    API.get<TResponse<GradingDetailDto[]>>('api/Quiz/grading/detail', { headers }),

  gradeAnswer: (answerId: string, payload: GradeAnswerPayload) =>
    API.post<TResponse<null>>(
      `api/Quiz/grading/${answerId}/grade`,
      payload,
      { headers },
    ),

  // ── Analytics ───────────────────────────────────────────────────────────────
  getLessonQuizResults: (lessonId: string) =>
    API.get<TResponse<LessonQuizResultDto[]>>(
      `api/Quiz/lesson/${lessonId}/results`,
      { headers },
    ),

  getLessonQuizAnalytics: (lessonId: string) =>
    API.get<TResponse<QuizAnalyticsDto>>(
      `api/Quiz/lesson/${lessonId}/analytics`,
      { headers },
    ),

  getStudentQuizHistory: (studentId: string) =>
    API.get<TResponse<StudentQuizHistoryDto[]>>(
      `api/Quiz/student/${studentId}/history`,
      { headers },
    ),

  // ── Student: Subject Quizzes ─────────────────────────────────────────────────
  getSubjectQuizzes: (subjectId: string) =>
    API.get<TResponse<SubjectQuizItemDto[]>>(
      `api/quiz/subject/${subjectId}`,
      { headers },
    ),

  // ── Student: Quiz Attempt Status by Code ──────────────────────────────────
  getQuizAttemptStatus: (quizCode: string) =>
    API.get<TResponse<AttemptStatusDisplayDto>>(
      `api/quiz/code/${quizCode}/attempt-status`,
      { headers },
    ),

  // ── Teacher: Create Quiz with Assessment ─────────────────────────────────────
  createAssessment: (payload: CreateQuizAssessmentPayload) =>
    API.post<TResponse<CreateQuizAssessmentResponse>>(
      'api/quiz/assessments',
      payload,
      { headers },
    ),

  // ── Assessment Sets ──────────────────────────────────────────────────────────
  getAssessmentSets: () =>
    API.get<TResponse<AssessmentSetServerDto[]>>(
      'api/quiz/assessment-sets',
      { headers },
    ),

  getAssessmentSet: (id: string) =>
    API.get<TResponse<AssessmentSetServerDto>>(
      `api/quiz/assessment-sets/${id}`,
      { headers },
    ),

  createAssessmentSet: (payload: CreateAssessmentSetServerPayload) =>
    API.post<TResponse<{ id: string }>>(
      'api/quiz/assessment-sets',
      payload,
      { headers },
    ),

  deleteAssessmentSet: (id: string) =>
    API.delete<TResponse<null>>(
      `api/quiz/assessment-sets/${id}`,
      { headers },
    ),

  // ── Lesson Assessment Config ─────────────────────────────────────────────────
  getLessonAssessmentConfig: (lessonId: string) =>
    API.get<TResponse<LessonAssessmentConfigDto>>(
      `api/quiz/lesson/${lessonId}/assessment-config`,
      { headers },
    ),

  // ── Performance: Classroom / Subject / Student quizzes ──────────────────────
  getClassroomQuizPerformance: (classroomId: string) =>
    API.get<TResponse<ClassroomQuizPerformanceDto[]>>(
      `api/quiz/classroom/${classroomId}/performance`,
      { headers },
    ),

  getSubjectQuizPerformance: (subjectId: string) =>
    API.get<TResponse<SubjectQuizPerformanceDto[]>>(
      `api/quiz/subject/${subjectId}/performance`,
      { headers },
    ),

  getStudentQuizPerformance: (studentId: string) =>
    API.get<TResponse<StudentQuizPerformanceDto>>(
      `api/quiz/student/${studentId}/performance`,
      { headers },
    ),

  getStudentQuizPerformanceBySubject: (studentId: string, subjectId: string) =>
    API.get<TResponse<StudentQuizPerformanceScopedDto>>(
      `api/quiz/student/${studentId}/subject/${subjectId}/performance`,
      { headers },
    ),

  getStudentQuizPerformanceBySubtopic: (studentId: string, subTopicId: string) =>
    API.get<TResponse<StudentQuizPerformanceScopedDto>>(
      `api/quiz/student/${studentId}/subtopic/${subTopicId}/performance`,
      { headers },
    ),
};

export default quizService;
