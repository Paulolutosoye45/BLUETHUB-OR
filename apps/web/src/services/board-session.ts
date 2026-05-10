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

import { API, type TResponse } from './index';
import { X_Tenant_ID } from './school';
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
    chunkDurationMs: number;
    totalAudioSizeBytes: number;
    totalStrokeCount: number;
    boardCount: number;
  };
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
    strokes: {
      url: string;
      mediaId: string;
      count: number;
      sizeBytes: number;
    } | null;
    events: unknown[];
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
};

export default boardSessionService;
