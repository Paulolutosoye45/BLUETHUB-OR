import { API, type TResponse } from ".";


import { X_Tenant_ID } from "@/utils/tenant";

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface TeacherDashboardStats {
  totalStudents: number;
  activeClasses: number;
  newAssessments: number;
  attendanceRate: number;
  lessonsThisWeek: number;
  pendingApprovals: number;
  classesToday: number;
}

export interface TodayClassItem {
  id: string;
  lessonId: string;
  subjectName: string;
  className: string;
  topic: string;
  scheduledTime: string;
  status: "scheduled" | "ongoing" | "completed";
}

export interface TodayClassesResponse {
  classes: TodayClassItem[];
  totalCount: number;
}

export interface AssessmentSubmissionItem {
  id: string;
  studentName: string;
  studentAvatar?: string;
  assessmentTitle: string;
  subjectName: string;
  submittedAt: string;
  status: "pending" | "graded";
  score?: number;
  maxScore?: number;
}

export interface AssessmentSubmissionsResponse {
  submissions: AssessmentSubmissionItem[];
  totalCount: number;
  pendingCount: number;
}

export interface PendingReviewItem {
  id: string;
  type: "lesson" | "assessment" | "quiz";
  title: string;
  subjectName: string;
  submittedAt: string;
  status: string;
}

export interface PendingReviewsResponse {
  items: PendingReviewItem[];
  totalCount: number;
}

export interface RecordedClassItem {
  id: string;
  lessonId: string;
  subjectName: string;
  className: string;
  topic: string;
  recordedAt: string;
  duration: number;
  views: number;
  thumbnailUrl?: string;
}

export interface RecordedClassesResponse {
  classes: RecordedClassItem[];
  totalCount: number;
}

export interface UpcomingDeadlineItem {
  id: string;
  type: "assignment" | "quiz" | "exam";
  title: string;
  className: string;
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
}

export interface UpcomingDeadlinesResponse {
  deadlines: UpcomingDeadlineItem[];
  totalCount: number;
}

export interface TeacherClassroom {
  id: string;
  name: string;
  studentCount: number;
  subjectCount: number;
}

export interface TeacherSubject {
  id: string;
  name: string;
  classroomId: string;
  classroomName: string;
}

export interface TeacherProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  classrooms: TeacherClassroom[];
  subjects: TeacherSubject[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const teacherService = {
  // ── DASHBOARD STATS ────────────────────────────────────────────────────────
  getDashboardStats: () =>
    API.get<TResponse<TeacherDashboardStats>>(
      "api/teacher/dashboard/stats",
      { headers }
    ),

  // ── TODAY'S CLASSES ────────────────────────────────────────────────────────
  getTodayClasses: () =>
    API.get<TResponse<TodayClassesResponse>>(
      "api/teacher/classes/today",
      { headers }
    ),

  // ── ASSESSMENT SUBMISSIONS ─────────────────────────────────────────────────
  getRecentSubmissions: (params?: { limit?: number }) =>
    API.get<TResponse<AssessmentSubmissionsResponse>>(
      "api/teacher/assessments/submissions/recent",
      { headers, params }
    ),

  // ── PENDING REVIEWS ────────────────────────────────────────────────────────
  getPendingReviews: () =>
    API.get<TResponse<PendingReviewsResponse>>(
      "api/teacher/pending-reviews",
      { headers }
    ),

  // ── RECORDED CLASSES ───────────────────────────────────────────────────────
  getRecordedClasses: (params?: { limit?: number; page?: number }) =>
    API.get<TResponse<RecordedClassesResponse>>(
      "api/teacher/classes/recorded",
      { headers, params }
    ),

  // ── UPCOMING DEADLINES ─────────────────────────────────────────────────────
  getUpcomingDeadlines: (params?: { limit?: number }) =>
    API.get<TResponse<UpcomingDeadlinesResponse>>(
      "api/teacher/deadlines/upcoming",
      { headers, params }
    ),

  // ── TEACHER PROFILE ────────────────────────────────────────────────────────
  getProfile: () =>
    API.get<TResponse<TeacherProfileData>>(
      "api/teacher/profile",
      { headers }
    ),

  // ── CLASSROOMS & SUBJECTS ──────────────────────────────────────────────────
  getMyClassrooms: () =>
    API.get<TResponse<TeacherClassroom[]>>(
      "api/teacher/classrooms",
      { headers }
    ),

  getMySubjects: () =>
    API.get<TResponse<TeacherSubject[]>>(
      "api/teacher/subjects",
      { headers }
    ),
};

export default teacherService;
