import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface StudentDashboardStats {
  classesThisWeek: number;
  assessmentsThisWeek: number;
  quizzesThisWeek: number;
  pendingAssignments: number;
  activeCourses: number;
  ongoingClass: {
    isLive: boolean;
    lessonId?: string;
    subjectName?: string;
    teacherName?: string;
  } | null;
}

export interface StudentClassItem {
  id: string;
  lessonId: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  subTopic: string;
  teacherName: string;
  publishedAt: string;
  duration?: number;
  thumbnailUrl?: string;
  hasWatched: boolean;
  watchProgress?: number;
}

export interface StudentClassesResponse {
  classes: StudentClassItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface StudentQuizItem {
  id: string;
  title: string;
  subjectName: string;
  questionCount: number;
  durationMinutes: number;
  dueDate?: string;
  status: "pending" | "completed" | "expired";
  score?: number;
  maxScore?: number;
}

export interface StudentQuizzesResponse {
  quizzes: StudentQuizItem[];
  totalCount: number;
}

export interface StudentAssessmentItem {
  id: string;
  title: string;
  subjectName: string;
  type: string;
  dueDate?: string;
  status: "pending" | "submitted" | "graded";
  score?: number;
  maxScore?: number;
}

export interface StudentAssessmentsResponse {
  assessments: StudentAssessmentItem[];
  totalCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const studentService = {
  // ── DASHBOARD STATS ────────────────────────────────────────────────────────
  getDashboardStats: () =>
    API.get<TResponse<StudentDashboardStats>>(
      "api/student/dashboard/stats",
      { headers }
    ),

  // ── CLASSES (Recorded lessons) ─────────────────────────────────────────────
  getClasses: (params?: { subjectId?: string; page?: number; pageSize?: number }) =>
    API.get<TResponse<StudentClassesResponse>>(
      "api/student/classes",
      { headers, params }
    ),

  getRecentClasses: (limit: number = 10) =>
    API.get<TResponse<StudentClassesResponse>>(
      "api/student/classes/recent",
      { headers, params: { limit } }
    ),

  // ── QUIZZES ────────────────────────────────────────────────────────────────
  getQuizzes: (params?: { status?: string; page?: number; pageSize?: number }) =>
    API.get<TResponse<StudentQuizzesResponse>>(
      "api/student/quizzes",
      { headers, params }
    ),

  getPendingQuizzes: () =>
    API.get<TResponse<StudentQuizzesResponse>>(
      "api/student/quizzes/pending",
      { headers }
    ),

  // ── ASSESSMENTS ────────────────────────────────────────────────────────────
  getAssessments: (params?: { status?: string; page?: number; pageSize?: number }) =>
    API.get<TResponse<StudentAssessmentsResponse>>(
      "api/student/assessments",
      { headers, params }
    ),

  getPendingAssessments: () =>
    API.get<TResponse<StudentAssessmentsResponse>>(
      "api/student/assessments/pending",
      { headers }
    ),

  // ── MARK PROGRESS ──────────────────────────────────────────────────────────
  updateWatchProgress: (lessonId: string, progressPercent: number) =>
    API.post<TResponse<null>>(
      `api/student/classes/${lessonId}/progress`,
      { progressPercent },
      { headers }
    ),
};

export default studentService;
