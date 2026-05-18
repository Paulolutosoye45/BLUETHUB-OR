// import { X_Tenant_ID } from "@/utils";
import { API, type TResponse } from ".";

const X_Tenant_ID = import.meta.env.VITE_DEFAULT_TENANT


// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScanQuotaResponseData {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  resetsAt: string;
}

export interface ScanTokenResponseData {
  uploadToken: string;
  uploadUrl: string;
  expiresAt: string;
  maxFileSize: number;
  allowedTypes: string[];
}

export interface ConfirmQuestionPayload {
  scanSessionId: string;
  questionIndex: number;
  edits?: {
    title?: string;
    textContent?: string;
    questionType?: number;
    difficultyLevel?: number;
    marksAllocation?: number;
    topic?: string;
    subTopic?: string;
    options?: Array<{
      optionLabel: string;
      optionText: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
  };
}

export interface RejectQuestionPayload {
  scanSessionId: string;
  questionIndex: number;
  reason: string;
}

export interface BulkConfirmPayload {
  scanSessionId: string;
  questionIndices: number[];
}

export interface BulkRejectPayload {
  scanSessionId: string;
  questionIndices: number[];
  reason: string;
}

export interface ConfirmResponseData {
  questionId: string;
  clientId: string;
  status: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

const headers = { "X-Tenant-ID": X_Tenant_ID };

export const questionScanService = {
  // ── GET SCAN QUOTA ─────────────────────────────────────────────────────────
  getQuota: () =>
    API.get<TResponse<ScanQuotaResponseData>>(
      "api/question-scans/quota",
      { headers }
    ),

  // ── REQUEST UPLOAD TOKEN ───────────────────────────────────────────────────
  requestUploadToken: () =>
    API.post<TResponse<ScanTokenResponseData>>(
      "api/question-scans/token",
      {},
      { headers }
    ),

  // ── CONFIRM SINGLE QUESTION ────────────────────────────────────────────────
  confirmQuestion: (payload: ConfirmQuestionPayload) =>
    API.post<TResponse<ConfirmResponseData>>(
      "api/question-scans/confirm",
      payload,
      { headers }
    ),

  // ── REJECT SINGLE QUESTION ─────────────────────────────────────────────────
  rejectQuestion: (payload: RejectQuestionPayload) =>
    API.post<TResponse<null>>(
      "api/question-scans/reject",
      payload,
      { headers }
    ),

  // ── BULK CONFIRM ───────────────────────────────────────────────────────────
  bulkConfirm: (payload: BulkConfirmPayload) =>
    API.post<TResponse<{ confirmed: number; failed: number }>>(
      "api/question-scans/bulk-confirm",
      payload,
      { headers }
    ),

  // ── BULK REJECT ────────────────────────────────────────────────────────────
  bulkReject: (payload: BulkRejectPayload) =>
    API.post<TResponse<{ rejected: number }>>(
      "api/question-scans/bulk-reject",
      payload,
      { headers }
    ),

  // ── COMPLETE SCAN SESSION ──────────────────────────────────────────────────
  completeSession: (scanSessionId: string) =>
    API.post<TResponse<null>>(
      `api/question-scans/sessions/${scanSessionId}/complete`,
      {},
      { headers }
    ),
};

export default questionScanService;
