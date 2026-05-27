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

export interface SubmitScanJobPayload {
  subjectId: string;
  classroomId?: string;
  fileUrl: string;
  filePublicId: string;
  fileName: string;
  fileType: "image" | "pdf";
  pageCount?: number;
}

// ── Questions by Job types ──────────────────────────────────────────────────
export interface QuestionOptionDto {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

export interface ExtractedQuestionDto {
  id: string;
  questionType: number;
  questionTypeName: string;
  questionHtml: string;
  contentParts: unknown;
  hasLatex: boolean;
  hasMedia: boolean;
  correctAnswer: string | null;
  difficultyLevel: number;
  marksAllocation: number;
  status: number;
  statusName: string;
  subTopicName: string;
  topicName: string;
  creationDate: string;
  options: QuestionOptionDto[];
}

export interface QuestionsByJobResponse {
  jobId: string;
  questionType: JobQuestionType;
  totalQuestions: number;
  questions: ExtractedQuestionDto[];
}


export interface SubmitJobResponseData {
  jobId: string;
  status: JobStatusEnum;
  estimatedCompletionTime?: string;
  queuePosition?: number;
}

export interface JobStatusesSummary {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface JobStatusItem {
  jobId: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  questionType: JobQuestionType;
  extractedCount: number;
  failureReason: string | null;
  attemptCount: number;
  createdAt: string;
  completedAt: string | null;
  subTopicName: string;
  topicName: string;
}

export interface JobStatusesResponseData {
  summary: JobStatusesSummary;
  jobs: JobStatusItem[];
}
const headers = { "X-Tenant-ID": X_Tenant_ID };

export const questionJobService = {

   // ── SUBMIT SCAN JOB ────────────────────────────────────────────────────────
  submitScanJob: (payload: SubmitScanJobPayload) =>
    API.post<TResponse<SubmitJobResponseData>>(
      "api/question-jobs/submit",
      payload,
      { headers }
    ),

  // POST api/questionjob/submit — multipart/form-data
  submitJob: (formData: FormData) =>
    API.post<TResponse<SubmitJobResponse>>("api/questionjob/submit", formData, {
      headers: { ...headers, "Content-Type": "multipart/form-data" },
    }),

  // GET api/questionjob/my-jobs
  getMyJobs: () =>
    API.get<JobListResponse>("api/questionjob/my-jobs", { headers }),

  // GET api/questionjob/jobs/status
  getJobStatuses: (params: {
    classroomId: string;
    subjectId: string;
    topicId?: string;
    subTopicId?: string;
  }) =>
    API.get<TResponse<JobStatusesResponseData>>("api/questionjob/jobs/status", {
      headers,
      params,
    }),

  // GET api/questionjob/{jobId}/preview
  // Fix the service return type
getJobPreview: (jobId: string) =>
  API.get<TResponse<JobPreviewResponseData>>(
    `api/questionjob/${jobId}/preview`,
    { headers }
  ),

  // POST api/questionjob/{jobId}/retry
  retryJob: (jobId: string) =>
    API.post<TResponse<unknown>>(`api/questionjob/${jobId}/retry`, {}, { headers }),

  // ── CANCEL JOB ─────────────────────────────────────────────────────────────
  cancelJob: (jobId: string) =>
    API.post<TResponse<null>>(
      `api/question-jobs/${jobId}/cancel`,
      {},
      { headers }
    ),

  // GET api/questionjob/jobs/{jobId}/questions
  getQuestionsByJobId: (jobId: string) =>
    API.get<TResponse<QuestionsByJobResponse>>(
      `api/questions/jobs/${jobId}/questions`,
      { headers }
    ),
};
