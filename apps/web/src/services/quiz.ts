import { API } from './index';
import { X_Tenant_ID } from './school';
import type { TResponse } from './index';

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
  manualMarksObtained: number;
  teacherFeedback?: string | null;
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
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const headers = { 'X-Tenant-ID': X_Tenant_ID };

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
    API.get<TResponse<unknown>>(
      `api/Quiz/lesson/${lessonId}`,
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
};

export default quizService;
