import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

export const JobStatusEnum = {
  Pending: 1,
  Processing: 2,
  Completed: 3,
  Failed: 4,
  PartiallyCompleted: 5,
} as const;
export type JobStatusEnum = typeof JobStatusEnum[keyof typeof JobStatusEnum];

export const JobTypeEnum = {
  QuestionScan: 1,
  BulkImport: 2,
} as const;
export type JobTypeEnum = typeof JobTypeEnum[keyof typeof JobTypeEnum];

// ═══════════════════════════════════════════════════════════════════════════════
// PAYLOADS (Request DTOs)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubmitScanJobPayload {
  subjectId: string;
  fileUrl: string;
  filePublicId: string;
  fileName: string;
  fileType: "image" | "pdf";
  pageCount?: number;
}

export interface RetryJobPayload {
  jobId: string;
  reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubmitJobResponseData {
  jobId: string;
  status: JobStatusEnum;
  estimatedCompletionTime?: string;
  queuePosition?: number;
}

export interface JobStatusResponseData {
  jobId: string;
  status: JobStatusEnum;
  statusText: string;
  progress?: number;
  questionsExtracted?: number;
  errorMessage?: string;
  completedAt?: string;
  createdAt: string;
}

export interface JobListItem {
  jobId: string;
  fileName: string;
  fileType: string;
  status: JobStatusEnum;
  statusText: string;
  questionsExtracted?: number;
  createdAt: string;
  completedAt?: string;
  subjectId: string;
  subjectName?: string;
}

export interface MyJobsResponseData {
  jobs: JobListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ExtractedQuestionPreview {
  index: number;
  title: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  topic?: string;
  subTopic?: string;
  options: Array<{
    optionLabel: string;
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  aiConfidenceScore: number;
  imageRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber?: number;
  };
}

export interface JobPreviewResponseData {
  jobId: string;
  scanSessionId: string;
  fileName: string;
  fileUrl: string;
  questions: ExtractedQuestionPreview[];
  totalExtracted: number;
  processingTime: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const questionJobService = {
  // ── SUBMIT SCAN JOB ────────────────────────────────────────────────────────
  submitScanJob: (payload: SubmitScanJobPayload) =>
    API.post<TResponse<SubmitJobResponseData>>(
      "api/question-jobs/submit",
      payload,
      { headers }
    ),

  // ── GET JOB STATUS ─────────────────────────────────────────────────────────
  getJobStatus: (jobId: string) =>
    API.get<TResponse<JobStatusResponseData>>(
      `api/question-jobs/${jobId}/status`,
      { headers }
    ),

  // ── GET MY JOBS (Paginated) ────────────────────────────────────────────────
  getMyJobs: (params?: { page?: number; pageSize?: number; status?: JobStatusEnum }) =>
    API.get<TResponse<MyJobsResponseData>>(
      "api/question-jobs/my-jobs",
      { headers, params }
    ),

  // ── RETRY FAILED JOB ───────────────────────────────────────────────────────
  retryJob: (payload: RetryJobPayload) =>
    API.post<TResponse<SubmitJobResponseData>>(
      `api/question-jobs/${payload.jobId}/retry`,
      { reason: payload.reason },
      { headers }
    ),

  // ── PREVIEW EXTRACTED QUESTIONS ────────────────────────────────────────────
  getJobPreview: (jobId: string) =>
    API.get<TResponse<JobPreviewResponseData>>(
      `api/question-jobs/${jobId}/preview`,
      { headers }
    ),

  // ── CANCEL JOB ─────────────────────────────────────────────────────────────
  cancelJob: (jobId: string) =>
    API.post<TResponse<null>>(
      `api/question-jobs/${jobId}/cancel`,
      {},
      { headers }
    ),
};

export default questionJobService;
