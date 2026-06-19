import { API } from './index';
import { X_Tenant_ID } from './school';
import type { TResponse } from './index';

export interface CreateQuizResponse {
  quizCode: string;
  questionCount: number;
  createdAt: string;
}

// ── Student quiz types ───────────────────────────────────────────────────────

export interface StudentQuizOption {
  id: string;
  optionLabel: string;
  optionText: string;
  orderIndex: number;
}

export interface StudentQuizQuestion {
  id: string;
  title: string;
  textContent?: string;
  questionType: number;
  marksAllocation: number;
  imageUrl?: string | null;
  options: StudentQuizOption[];
}

export interface StudentQuizData {
  id: string;
  quizCode: string;
  questionCount: number;
  totalMarks: number;
  createdAt: string;
  questions: StudentQuizQuestion[];
}

export interface QuizAnswerPayload {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
}

export interface QuizAttemptResult {
  attemptId: string;
  score: number;
  totalMarks: number;
  percentageScore: number;
  passed: boolean;
  feedback?: string;
  results?: Array<{
    questionId: string;
    isCorrect: boolean;
    marksEarned: number;
    correctOptionId?: string;
  }>;
}

const headers = { 'X-Tenant-ID': X_Tenant_ID };

export const quizService = {
  // ── Teacher ────────────────────────────────────────────────────────────────
  createQuiz: (questionIds: string[]) =>
    API.post<TResponse<CreateQuizResponse>>(
      'api/Quiz/create',
      { questionIds },
      { headers },
    ),

  // ── Student ────────────────────────────────────────────────────────────────
  getStudentQuiz: (quizId: string) =>
    API.get<TResponse<StudentQuizData>>(
      `api/Quiz/${quizId}`,
      { headers },
    ),

  submitQuizAttempt: (quizId: string, answers: QuizAnswerPayload[]) =>
    API.post<TResponse<QuizAttemptResult>>(
      `api/Quiz/${quizId}/attempt`,
      { answers },
      { headers },
    ),
};

export default quizService;
