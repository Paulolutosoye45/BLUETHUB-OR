import { API, type TResponse } from ".";


import { X_Tenant_ID } from "@/utils/tenant";

export const QuestionTypeEnum = {
  MultipleChoice: 1,
  ShortAnswer: 2,
  Essay: 3,
  TrueOrFalse: 4,
  FillInTheBlank: 5,
  ImageBased: 6,
  BoardBased: 7,
  Mixed: 8,
} as const;

export const DifficultyLevelEnum = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Expert: 4,
} as const;

export const QuestionStatusEnum =  {
  Draft : 1,
  Published : 2,
  PendingReview : 3,
  Archived : 4,
} as const

export type ConflictResolutionEnum =  {
  KeepLocal : 1,
  KeepServer : 2,
  KeepMerged : 3,
  DiscardLocal : 4,
} 

// ═══════════════════════════════════════════════════════════════════════════════
// PAYLOADS (Request DTOs)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateOptionPayload {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateQuestionPayload {
  clientId: string;
  originDevice: string;
  createdAtDevice: string;
  subjectId: string;
  topicId?: string | null;
  topic?: string;
  subTopic: string;
  title: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  options: CreateOptionPayload[];
  boardSessionId?: string | null;
  scanSessionId?: string | null;
  isScanned: boolean;
  extractedQuestionIndex?: number | null;
  aiConfidenceScore?: string | null;
  classroomId?: string | null;
  imageUrl?: string | null;
}

export interface UpdateQuestionPayload {
  questionId: string;
  clientId?: string;
  title: string;
  subjectId: string;
  topicId?: string | null;
  topic?: string;
  subTopic?: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  options?: CreateOptionPayload[];
  boardSessionId?: string | null;
  lastKnownModifiedDate?: string;
}

export interface QuestionFilterPayload {
  page?: number;
  pageSize?: number;
  classroomId?: string;
  subjectId?: string;
  topicId?: string;
  subTopicId?: string;
  questionType?: number;
  difficultyLevel?: number;
  status?: number;
  searchText?: string;
  includePendingReview?: boolean;
  scanSessionId?: string;
}

export interface QuestionFilterPayloadV2 {
  page?: number;
  pageSize?: number;
  subjectId?: string;
  topicId?: string;
  subTopicIds?: string[];
  questionType?: number;
  difficultyLevel?: number;
  status?: number;
  searchText?: string;
  includePendingReview?: boolean;
  scanSessionId?: string;
}

export interface SyncQuestionPayload {
  clientId: string;
  serverId?: string;
  title: string;
  subjectId: string;
  topicId?: string | null;
  topic?: string;
  subTopic?: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  options?: CreateOptionPayload[];
  boardSessionId?: string | null;
  localModifiedAt: string;
  isNewQuestion: boolean;
}

export interface SyncQuestionsPayload {
  questions: SyncQuestionPayload[];
}

export interface ConflictCheckPayload {
  questions: Array<{
    clientId: string;
    serverId?: string;
    localModifiedAt: string;
  }>;
}

export interface ResolveConflictPayload {
  questionId: string;
  clientId?: string;
  resolution: ConflictResolutionEnum;
  mergedData?: UpdateQuestionPayload;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface CreateQuestionResponseData {
  questionId: string;
  clientId: string;
  isDuplicate: boolean;
}

export interface UpdateQuestionResponseData {
  questionId: string;
  clientId?: string;
  newModifiedDate: string;
  isConflict?: boolean;
  conflictDetail?: ConflictDetail;
}

export interface ConflictDetail {
  clientId?: string;
  serverId: string;
  reason: string;
  reasonDescription: string;
  serverModifiedAt: string;
  localModifiedAt: string;
  serverVersion?: QuestionDto;
}

export interface OptionDto {
  id: string;
  optionLabel: string;
  optionText: string;
  isCorrect?: boolean; // Hidden for students
  orderIndex: number;
}

export interface QuestionDto {
  id: string;
  clientId?: string;
  schoolId: string;
  subjectId: string;
  subjectName?: string;
  topicId?: string;
  topic?: string;
  subTopic?: string;
  createdBy: string;
  createdByName?: string;
  title: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  hasBoardSession: boolean;
  boardSessionId?: string;
  hasMedia: boolean;
  imageUrl?: string;
  hasAudio: boolean;
  isScanned: boolean;
  scanSessionId?: string;
  status: number;
  creationDate: string;
  modifiedDate?: string;
  options: OptionDto[];
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export interface QuestionSummaryDto {
  id: string;
  clientId?: string;
  title: string;
  topic?: string;
  topicName?: string;
  subTopicName?: string;
  className?: string | null;
  subjectName?: string;
  questionType: number;
  questionTypeName?: string;
  difficultyLevel: number;
  difficultyLevelName?: string;
  marksAllocation: number;
  hasBoardSession: boolean;
  hasMedia: boolean;
  hasAudio: boolean;
  isScanned: boolean;
  status: number;
  statusName?: string;
  creationDate: string;
}

export interface QuestionDetailResponseData {
  question: QuestionDto;
}

export interface QuestionListResponseData {
  questions: QuestionSummaryDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface StatusSummaryDto {
  draft: number;
  published: number;
  pendingReview: number;
}

export interface DifficultyBreakdownDto {
  difficultyLevel: number;
  difficultyLevelName: string;
  questionCount: number;
}

export interface TypeBreakdownDto {
  questionType: number;
  questionTypeName: string;
  questionCount: number;
}

export interface SubTopicSummaryDto {
  subTopicId: string;
  subTopicName: string;
  questionCount: number;
  draftCount: number;
  publishedCount: number;
  pendingReviewCount: number;
}

export interface TopicSummaryDto {
  topicId: string;
  topicName: string;
  questionCount: number;
  subTopics: SubTopicSummaryDto[];
}

export interface SubjectQuestionSummaryResponseData {
  classroomId: string;
  subjectId: string;
  totalQuestions: number;
  statusSummary: StatusSummaryDto;
  difficultyBreakdown: DifficultyBreakdownDto[];
  typeBreakdown: TypeBreakdownDto[];
  topics: TopicSummaryDto[];
}

export interface PendingReviewResponseData {
  scanSession: {
    id: string;
    originalFileUrl: string;
    fileName: string;
    uploadedAt: string;
  };
  questions: QuestionDto[];
  totalCount: number;
}

export interface SyncResultItem {
  clientId: string;
  serverId?: string;
  success: boolean;
  error?: string;
  isDuplicate?: boolean;
}

export interface SyncResponseData {
  results: SyncResultItem[];
  successCount: number;
  failedCount: number;
}

export interface ConflictCheckItem {
  clientId: string;
  serverId?: string;
  hasConflict: boolean;
  serverModifiedAt?: string;
}

export interface ConflictCheckResponseData {
  safeToSync: ConflictCheckItem[];
  conflicts: ConflictCheckItem[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

// const headers = { "X-Tenant-ID": X_Tenant_ID };dd

export const questionService = {
  // ── CREATE ─────────────────────────────────────────────────────────────────
  createQuestion: (payload: CreateQuestionPayload) =>
    API.post<TResponse<CreateQuestionResponseData>>(
      "https://techhubschmanagement.onrender.com/api/Questions/createquestions",
      payload,
      {
        headers: { "X-Tenant-ID": X_Tenant_ID },
      },
    ),

  // ── PUBLISH ───────────────────────────────────────────────────────────────
  publishQuestion: (questionId: string) =>
    API.post<TResponse<unknown>>(
      `api/questions/${questionId}/publish`,
      {},
      {
        headers: { "X-Tenant-ID": X_Tenant_ID },
      },
    ),

  // ── LIST ─────────────────────────────────────────────────────────────────
  getQuestions: (params: QuestionFilterPayload) =>
    API.get<TResponse<QuestionListResponseData>>("api/questions", {
      params,
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),

  getSubjectQuestionSummary: (
    classroomId: string,
    subjectId: string,
    subTopicId?: string,
  ) =>
    API.get<TResponse<SubjectQuestionSummaryResponseData>>(
      `api/questions/classroom/${classroomId}/subject/${subjectId}/summary`,
      {
        params: subTopicId ? { subTopicId } : undefined,
        headers: { "X-Tenant-ID": X_Tenant_ID },
      },
    ),

  getQuestionsByClassroom: (classroomId: string, payload: QuestionFilterPayloadV2) =>
    API.post<TResponse<QuestionListResponseData>>(
      `api/questions/classroom/${classroomId}/questions`,
      payload,
      {
        headers: { "X-Tenant-ID": X_Tenant_ID },
      },
    ),
};

export default questionService;
