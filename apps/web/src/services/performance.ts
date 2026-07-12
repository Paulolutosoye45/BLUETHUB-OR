import { API, type TResponse } from ".";
import { X_Tenant_ID } from "@/utils/tenant";

const headers = { "X-Tenant-ID": X_Tenant_ID };

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface AdminNavbarDto {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalAttempts: number;
  overallAverageScore: number;
  overallPassRate: number;
  pendingGradingItems: number;
}

export interface SubjectTeacherNavbarDto {
  classCount: number;
  subjectCount: number;
  totalStudents: number;
  overallAverageScore: number;
  overallPassRate: number;
  pendingGradingItems: number;
}

export interface ClassTeacherNavbarDto {
  classCount: number;
  totalStudents: number;
  overallAverageScore: number;
  overallPassRate: number;
  pendingGradingItems: number;
}

export interface StudentNavbarDto {
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  passRate: number;
  pendingQuizzes: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Shared breakdown DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuizBreakdownDto {
  quizCode: string;
  lessonTitle: string;
  lessonId: string;
  attemptCount: number;
  averageScore: number;
  passRate: number;
}

export interface PerformanceClassroomDto {
  classroomId: string;
  classroomName: string;
  subjectId: string | null;
  subjectName: string | null;
  studentCount: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  passRate: number;
  averageTimeTakenSeconds: number | null;
  lastActivityDate: string | null;
  computedAt: string;
  quizBreakdown: QuizBreakdownDto[];
}

export interface PerformanceSubjectDto {
  classroomId: string | null;
  classroomName: string | null;
  subjectId: string;
  subjectName: string;
  studentCount: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  passRate: number;
  averageTimeTakenSeconds: number | null;
  lastActivityDate: string | null;
  computedAt: string;
  quizBreakdown: QuizBreakdownDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Admin DTO
// ═══════════════════════════════════════════════════════════════════════════════

export interface SchoolPerformanceOverviewDto {
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  overallAverageScore: number;
  overallPassRate: number;
  classroomCount: number;
  subjectCount: number;
  computedAt: string;
  classroomBreakdown: PerformanceClassroomDto[];
  subjectBreakdown: PerformanceSubjectDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Teacher DTO
// ═══════════════════════════════════════════════════════════════════════════════

export interface TeacherPerformanceDashboardDto {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  overallAverageScore: number;
  overallPassRate: number;
  classrooms: PerformanceClassroomDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — Student DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface PerformanceAttemptDto {
  attemptId: string;
  quizCode: string;
  lessonTitle: string;
  classroomName: string;
  subjectName: string;
  attemptNumber: number;
  finalScorePercent: number;
  isPassed: boolean;
  status: string;
  submittedAt: string | null;
}

export interface StudentPerformanceDetailDto {
  studentId: string;
  studentName: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  passRate: number;
  bestScorePercent: number;
  recentAttempts: PerformanceAttemptDto[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT SUMMARY — Dashboard overview of pending items
// ═══════════════════════════════════════════════════════════════════════════════

export interface UnattemptedAssessmentDto {
  assessmentId: string;
  code: string;
  title: string;
}

export interface UnattemptedQuizDto {
  lessonId: string;
  lessonTitle: string;
  quizCode: string;
  subjectName: string;
}

export interface UnwatchedLessonDto {
  lessonId: string;
  lessonTitle: string;
  subjectName: string;
}

export interface StudentSummaryCountsDto {
  unattemptedAssessments: number;
  unattemptedQuizzes: number;
  unwatchedLessons: number;
}

export interface StudentSummaryDto {
  unattemptedAssessments: UnattemptedAssessmentDto[];
  unattemptedQuizzes: UnattemptedQuizDto[];
  unwatchedLessons: UnwatchedLessonDto[];
  counts: StudentSummaryCountsDto;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBJECT PERFORMANCE — Classroom breakdown
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubjectClassroomPerformanceDto {
  classroomId: string;
  classroomName: string;
  studentCount: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number;
  passRate: number;
  lastActivityDate: string | null;
  computedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

export const performanceService = {
  getNavbar: () =>
    API.get<TResponse<AdminNavbarDto | SubjectTeacherNavbarDto | ClassTeacherNavbarDto | StudentNavbarDto>>(
      "api/performance/navbar",
      { headers }
    ),

  getDashboard: () =>
    API.get<TResponse<SchoolPerformanceOverviewDto | TeacherPerformanceDashboardDto | StudentPerformanceDetailDto[]>>(
      "api/performance/dashboard",
      { headers }
    ),

  getClassroomPerformance: (classroomId: string) =>
    API.get<TResponse<PerformanceClassroomDto[]>>(
      `api/performance/classroom/${classroomId}`,
      { headers }
    ),

  getSubjectPerformance: (subjectId: string) =>
    API.get<TResponse<PerformanceSubjectDto[]>>(
      `api/performance/subject/${subjectId}`,
      { headers }
    ),

  refreshPerformance: () =>
    API.post<TResponse<null>>(
      "api/performance/refresh",
      null,
      { headers }
    ),

  getSubjectClassrooms: (subjectId: string) =>
    API.get<TResponse<SubjectClassroomPerformanceDto[]>>(
      `api/Performance/subject/${subjectId}/classrooms`,
      { headers }
    ),

  getStudentSummary: () =>
    API.get<TResponse<StudentSummaryDto>>(
      "api/performance/student-summary",
      { headers }
    ),
};
