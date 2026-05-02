import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";
import type { IActions } from "@/utils/constant";

export interface CloudinarySignature {
  signature: string;
  apiKey: string;
  cloudName: string;
  timestamp: number;
  folder: string;
}

export interface MediaFilePayload {
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  cloudinaryUrl: string;
  publicId: string;
  fileSizeBytes: number;
  duration?: number;
  displayOrder: number;
}

export interface SubmitLessonPayload {
  classroomId: string;
  subjectId: string;
  topicId: string;
  subTopic: string;
  aim: string;
  description: string;
  mediaFiles: MediaFilePayload[];
  quizId?: string | null;
}

// Draft: all metadata fields required, media optional (backend has [Required] commented out)
export type DraftLessonPayload = Omit<SubmitLessonPayload, "mediaFiles"> & {
  mediaFiles?: MediaFilePayload[];
};

export interface LessonTopic {
  id: string;
  name: string;
}

export interface LessonSubTopic {
  id: string;
  name: string;
}

export interface SubmitLessonResponse {
  lessonId: string;
  status: string;
  mediaCount: number;
  approvalId?: string;
}

export interface LessonItem {
  id: string;
  schoolId: string;
  classroomId: string;
  subjectId: string;
  topicId: string;
  subTopic: string;
  aim: string;
  description: string;
  status: string;
  createdBy: string;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  modifiedAt: string;
  approvedAt: string | null;
  quizId?: string | null;
}

export interface LessonSummary {
  total: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  published: number;
}

export interface MyLessonsData {
  summary: LessonSummary;
  lessons: LessonItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  filteredBy: string;
}

export interface SubmitManifestPayload {
  sessionId: string;
  manifest: IActions;
}

export interface SubmitManifestResponse {
  sessionId: string;
  status: string;
}

export const lessonService = {
  getUploadSignature: () =>
    API.get<TResponse<CloudinarySignature>>("api/lessons/upload-signature", {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  submitLesson: (payload: SubmitLessonPayload) =>
    API.post<TResponse<SubmitLessonResponse>>("api/lessons/submit", payload, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  // POST api/lessons/draft — backend sets IsDraft=true, BypassApproval=false
  saveDraft: (payload: DraftLessonPayload) =>
    API.post<TResponse<SubmitLessonResponse>>("api/lessons/draft", payload, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  // GET api/lessons/my-lessons
  getMyLessons: (params?: { status?: string; pageNumber?: number; pageSize?: number }) =>
    API.get<TResponse<MyLessonsData>>("api/lessons/my-lessons", {
      params,
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  // GET api/School/topics/{subjectId}
  getTopicsBySubject: (subjectId: string) =>
    API.get<TResponse<LessonTopic[]>>(`api/School/topics/${subjectId}`, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  // GET api/School/subtopics/{topicId}
  getSubTopicsByTopic: (topicId: string) =>
    API.get<TResponse<LessonSubTopic[]>>(`api/School/subtopics/${topicId}`, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  // POST api/sessions/manifest — submits the full session manifest for replay
  submitManifest: (payload: SubmitManifestPayload) =>
    API.post<TResponse<SubmitManifestResponse>>("api/sessions/manifest", payload, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),
};
