/**
 * Board Session Service
 *
 * Handles board session batch and manifest submission to the backend.
 * Uses the /api/board endpoints for live class recording.
 *
 * Endpoints:
 * - POST /api/board/session/{sessionId}/batch - Submit board batch during class
 * - POST /api/board/session/{sessionId}/manifest - Submit manifest when class ends
 * - GET /api/board/session/{sessionId} - Get session (for debugging)
 */

import { API } from './index';
import { X_Tenant_ID } from "@/utils/tenant";
import type { CompressedStroke } from '@/utils/constant';

// ── Types matching backend ViewModels ────────────────────────────────────────

export interface BoardBatchPayload {
  sessionId: string;
  lessonId: string;
  batchIndex: number;
  startMs: number;
  endMs: number;
  strokes: CompressedStroke[];
  strokeCount: number;
  boardIndex: number;
  audioChunkUrls?: string[];
}

export interface SessionManifestPayload {
  version: string;
  session: {
    id: string;
    lessonId: string;
    schoolId: string;
    recordedAt: string;
    publishedAt: string;
    teacher: {
      id: string;
      name: string;
    };
  };
  lesson: {
    topic: string;
    subTopic: string;
    aim: string;
    subject: {
      id: string;
      name: string;
    };
    classroom: {
      id: string;
      name: string;
    };
  };
  stats: {
    totalDurationMs: number;
    totalDurationFormatted: string;
    chunkCount: number;
    chunkDurationMs: number;          // Upload batch size (60s)
    seekGranularityMs: number;        // Seeking granularity (10s) for player skip controls
    totalAudioSizeBytes: number;
    totalStrokeCount: number;
    boardCount: number;
    strokeBatchCount: number;
  };
  // Audio chunks (uploaded to Cloudinary)
  chunks: Array<{
    index: number;
    startMs: number;
    endMs: number;
    audio: {
      url: string;
      mediaId: string;
      sizeBytes: number;
      durationMs: number;
    };
    events: unknown[];
  }>;
  // Stroke batches are stored separately in MongoDB via submitBatch endpoint
  // The manifest references them by explicit id and index key
  strokeBatches: Array<{
    id: string;       // sessionId_batchIndex
    batchIndex: number;
    indexKey: string; // sessionId_batchIndex
    startMs: number;
    endMs: number;
    strokeCount: number;
    sizeBytes: number;
  }>;
  mediaAssets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  boards: Array<{
    index: number;
    dimensions: {
      width: number;
      height: number;
    };
    strokeCount: number;
  }>;
  chapters: Array<{
    title: string;
    startMs: number;
    endMs: number;
  }>;
}

export interface BoardSessionResponse {
  responseCode: string;
  responseMessage: string;
  status: string;
  data?: unknown;
}

// ── Service ──────────────────────────────────────────────────────────────────

// Response type for fetched stroke batches
export interface FetchedStrokeBatch {
  batchIndex: number;
  startMs: number;
  endMs: number;
  strokes: CompressedStroke[];
  strokeCount: number;
  boardIndex: number;
}

export const boardSessionService = {
  /**
   * Submit a board batch during live class
   * Publishes to RabbitMQ queue and returns immediately (204 No Content)
   */
  submitBatch: async (sessionId: string, payload: BoardBatchPayload): Promise<void> => {
    await API.post(`api/board/session/${sessionId}/batch`, payload, {
      headers: { 'X-Tenant-ID': X_Tenant_ID },
      validateStatus: (status) => status === 204 || status === 200,
    });
  },

  /**
   * Submit session manifest when class ends
   * Called once to finalize the recording session
   */
  submitManifest: async (
    sessionId: string,
    manifest: SessionManifestPayload
  ): Promise<BoardSessionResponse> => {
    const response = await API.post<BoardSessionResponse>(
      `api/board/session/${sessionId}/manifest`,
      manifest,
      { headers: { 'X-Tenant-ID': X_Tenant_ID } }
    );
    return response.data;
  },

  /**
   * Get session details (for debugging/admin)
   */
  getSession: async (sessionId: string): Promise<BoardSessionResponse> => {
    const response = await API.get<BoardSessionResponse>(
      `api/board/session/${sessionId}`,
      { headers: { 'X-Tenant-ID': X_Tenant_ID } }
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLAYBACK ENDPOINTS - For fetching recorded session data
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all stroke batches for a session (for replay)
   * Returns batches sorted by batchIndex
   */
  getBatches: async (sessionId: string): Promise<FetchedStrokeBatch[]> => {
    const response = await API.get<{ data: FetchedStrokeBatch[] }>(
      `api/board/session/${sessionId}/batches`,
      { headers: { 'X-Tenant-ID': X_Tenant_ID } }
    );
    return response.data.data ?? [];
  },

  /**
    * Get a single stroke batch by index key (sessionId_batchIndex)
   * Used for on-demand loading during playback
   */
  getBatchByIndexKey: async (indexKey: string): Promise<FetchedStrokeBatch | null> => {
    const response = await API.get<{ data: FetchedStrokeBatch }>(
      `api/board/batch/${indexKey}`,
      { headers: { 'X-Tenant-ID': X_Tenant_ID } }
    );
    return response.data.data ?? null;
  },

  /**
   * Get session manifest for replay
   * Contains audio URLs, stroke batch references, and metadata
   */
  getManifest: async (sessionId: string): Promise<SessionManifestPayload | null> => {
    const response = await API.get<{ data: SessionManifestPayload }>(
      `api/board/session/${sessionId}/manifest`,
      { headers: { 'X-Tenant-ID': X_Tenant_ID } }
    );
    return response.data.data ?? null;
  },
};

export default boardSessionService;
