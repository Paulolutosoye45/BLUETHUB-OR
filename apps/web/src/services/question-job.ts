import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";

// ── Request types ───────────────────────────────────────────────────────────
export type JobQuestionType = "Objective" | "Theory" | "TrueFalse";

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
