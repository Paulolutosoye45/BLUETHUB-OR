import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════════

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
export type QuestionTypeEnum = typeof QuestionTypeEnum[keyof typeof QuestionTypeEnum];

export const DifficultyLevelEnum = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
} as const;
export type DifficultyLevelEnum = typeof DifficultyLevelEnum[keyof typeof DifficultyLevelEnum];

export const QuestionStatusEnum = {
  Draft: 1,
  Published: 2,
  PendingReview: 3,
  Archived: 4,
} as const;
export type QuestionStatusEnum = typeof QuestionStatusEnum[keyof typeof QuestionStatusEnum];

export const ConflictResolutionEnum = {
  KeepLocal: 1,
  KeepServer: 2,
  KeepMerged: 3,
  DiscardLocal: 4,
} as const;
export type ConflictResolutionEnum = typeof ConflictResolutionEnum[keyof typeof ConflictResolutionEnum];

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
  imageUrl?: string | null;
  imagePublicId?: string | null;
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
  subjectName?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  hasBoardSession: boolean;
  hasMedia: boolean;
  hasAudio: boolean;
  isScanned: boolean;
  status: number;
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

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const questionService = {
  // ── CREATE ─────────────────────────────────────────────────────────────────
  createQuestion: (payload: CreateQuestionPayload) =>
    API.post<TResponse<CreateQuestionResponseData>>(
      "api/questions/createquestions",
      payload,
      { headers }
    ),

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  updateQuestion: (payload: UpdateQuestionPayload) =>
    API.put<TResponse<UpdateQuestionResponseData>>(
      "api/questions",
      payload,
      { headers }
    ),

  // ── GET SINGLE ─────────────────────────────────────────────────────────────
  getQuestion: (questionId: string) =>
    API.get<TResponse<QuestionDetailResponseData>>(
      `api/questions/${questionId}`,
      { headers }
    ),

  // ── GET BY SUBJECT (Paginated) ─────────────────────────────────────────────
  getSubjectQuestions: (subjectId: string, filter?: QuestionFilterPayload) =>
    API.get<TResponse<QuestionListResponseData>>(
      `api/questions/subjects/${subjectId}`,
      { headers, params: filter }
    ),

  // ── DELETE ─────────────────────────────────────────────────────────────────
  deleteQuestion: (questionId: string) =>
    API.delete<TResponse<null>>(
      `api/questions/${questionId}`,
      { headers }
    ),

  // ── PUBLISH ────────────────────────────────────────────────────────────────
  publishQuestion: (questionId: string) =>
    API.post<TResponse<null>>(
      `api/questions/${questionId}/publish`,
      {},
      { headers }
    ),

  // ── CONFIRM (Scan Review) ──────────────────────────────────────────────────
  confirmQuestion: (questionId: string) =>
    API.post<TResponse<null>>(
      `api/questions/${questionId}/confirm`,
      {},
      { headers }
    ),

  // ── REJECT (Scan Review) ───────────────────────────────────────────────────
  rejectQuestion: (questionId: string) =>
    API.post<TResponse<null>>(
      `api/questions/${questionId}/reject`,
      {},
      { headers }
    ),

  // ── GET PENDING REVIEW ─────────────────────────────────────────────────────
  getPendingReviewQuestions: (scanSessionId: string) =>
    API.get<TResponse<PendingReviewResponseData>>(
      `api/questions/scan-sessions/${scanSessionId}/review`,
      { headers }
    ),

  // ── SYNC (Batch) ───────────────────────────────────────────────────────────
  syncQuestions: (payload: SyncQuestionsPayload) =>
    API.post<TResponse<SyncResponseData>>(
      "api/questions/sync",
      payload,
      { headers }
    ),

  // ── CHECK CONFLICTS ────────────────────────────────────────────────────────
  checkConflicts: (payload: ConflictCheckPayload) =>
    API.post<TResponse<ConflictCheckResponseData>>(
      "api/questions/sync/conflicts/check",
      payload,
      { headers }
    ),

  // ── RESOLVE CONFLICT ───────────────────────────────────────────────────────
  resolveConflict: (payload: ResolveConflictPayload) =>
    API.post<TResponse<null>>(
      "api/questions/sync/conflicts/resolve",
      payload,
      { headers }
    ),
};

export default questionService;
