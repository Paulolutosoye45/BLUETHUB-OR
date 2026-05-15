import { API, type TResponse } from ".";
import { X_Tenant_ID } from "@/utils/tenant";

// ── Request types ───────────────────────────────────────────────────────────
export type JobQuestionType = "Objective" | "Theory" | "TrueFalse";

export const JobStatusEnum = {
  Pending: 1,
  Processing: 2,
  Completed: 3,
  Failed: 4,
  PartiallyCompleted: 5,
} as const;
export type JobStatusEnum = typeof JobStatusEnum[keyof typeof JobStatusEnum];

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

// ── Response types ──────────────────────────────────────────────────────────
export interface SubmitJobResponse {
  jobId: string;
  responseMessage: string;
  responseCode: string;
  status: string;
}

export interface JobSummaryDto {
  jobId: string;
  questionType: JobQuestionType;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  questionId: string | null;
  failureReason: string;
  createdAt: string;
  completedAt: string;
}

export interface JobListResponse {
  jobs: JobSummaryDto[];
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  responseMessage: string;
  responseCode: string;
  status: string;
}

export interface OptionPreviewDto {
  id: string;
  optionLabel: string;
  optionText: string;
  optionHtml: string;
  contentParts: unknown;
  isCorrect: boolean;
  hasLatex: boolean;
  hasImages: boolean;
  orderIndex: number;
}

export interface QuestionPreviewResponse {
  questionId: string;
  jobId: string;
  questionType: JobQuestionType;
  questionHtml: string;
  contentParts: unknown;
  options: OptionPreviewDto[];
  hasLatex: boolean;
  hasImages: boolean;
  difficultyLevel: string;
  marksAllocation: number;
  status: string;
  responseMessage: string;
  responseCode: string;
}

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const questionJobService = {
  // POST api/questionjob/submit — multipart/form-data
  submitJob: (formData: FormData) =>
    API.post<TResponse<SubmitJobResponse>>("api/questionjob/submit", formData, {
      headers: { ...headers, "Content-Type": "multipart/form-data" },
    }),

  // GET api/questionjob/my-jobs
  getMyJobs: () =>
    API.get<JobListResponse>("api/questionjob/my-jobs", { headers }),

  // GET api/questionjob/{jobId}/preview
  getJobPreview: (jobId: string) =>
    API.get<TResponse<QuestionPreviewResponse>>(
      `api/questionjob/${jobId}/preview`,
      { headers }
    ),

  // POST api/questionjob/{jobId}/retry
  retryJob: (jobId: string) =>
    API.post<TResponse<unknown>>(`api/questionjob/${jobId}/retry`, {}, { headers }),
};
