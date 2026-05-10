/**
 * useSessionUpload Hook
 *
 * Handles uploading lesson recording data (audio + strokes) to Cloudinary.
 * Uses the token-based direct upload flow for better performance.
 *
 * Features:
 * - Parallel uploads with concurrency control
 * - Progress tracking per chunk
 * - Retry logic for failed uploads
 * - Status updates to IndexedDB
 */

import { useCallback, useRef, useState } from 'react';
import { mediaUploadService, type UploadProgress, MediaType } from '@/services/media-upload';
import {
  getAudioChunksBySession,
  getStrokeBatchesBySession,
  updateAudioChunkStatus,
  updateStrokeBatchStatus,
} from '@/utils/db';
import type { LocalAudioChunk, LocalStrokeBatch } from '@/utils/constant';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadState {
  isUploading: boolean;
  phase: 'idle' | 'audio' | 'strokes' | 'complete' | 'error';
  currentChunk: number;
  totalChunks: number;
  currentProgress: number;
  overallProgress: number;
  error: string | null;
  uploadedAudio: number;
  uploadedStrokes: number;
}

export interface UploadResults {
  audioUrls: Array<{ chunkIndex: number; url: string; mediaId: string }>;
  strokeUrls: Array<{ batchIndex: number; url: string; mediaId: string }>;
  success: boolean;
  errors: string[];
}

interface UploadOptions {
  concurrency?: number;
  retryAttempts?: number;
  onProgress?: (state: UploadState) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSessionUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    phase: 'idle',
    currentChunk: 0,
    totalChunks: 0,
    currentProgress: 0,
    overallProgress: 0,
    error: null,
    uploadedAudio: 0,
    uploadedStrokes: 0,
  });

  const abortRef = useRef(false);

  const updateState = useCallback((updates: Partial<UploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Upload a single audio chunk with retry logic
   */
  const uploadAudioChunk = useCallback(async (
    chunk: LocalAudioChunk,
    sessionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url?: string; mediaId?: string; error?: string }> => {
    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (abortRef.current) {
        return { success: false, error: 'Upload aborted' };
      }

      try {
        const result = await mediaUploadService.uploadAudio(
          chunk.blob,
          sessionId,
          chunk.chunkIndex,
          onProgress
        );

        if (result.success && result.cdnUrl && result.mediaId) {
          // Update local DB with success
          await updateAudioChunkStatus(chunk.id, 'sent', result.cdnUrl, result.mediaId);
          return { success: true, url: result.cdnUrl, mediaId: result.mediaId };
        }

        lastError = result.error || 'Upload failed';
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Update local DB with failure
    await updateAudioChunkStatus(chunk.id, 'failed', undefined, undefined, lastError);
    return { success: false, error: lastError };
  }, []);

  /**
   * Upload a single stroke batch with retry logic
   */
  const uploadStrokeBatch = useCallback(async (
    batch: LocalStrokeBatch,
    sessionId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url?: string; mediaId?: string; error?: string }> => {
    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (abortRef.current) {
        return { success: false, error: 'Upload aborted' };
      }

      try {
        const result = await mediaUploadService.uploadStrokeData(
          batch.strokes,
          sessionId,
          batch.batchIndex,
          onProgress
        );

        if (result.success && result.cdnUrl && result.mediaId) {
          // Update local DB with success
          await updateStrokeBatchStatus(batch.id, 'sent', result.cdnUrl, result.mediaId);
          return { success: true, url: result.cdnUrl, mediaId: result.mediaId };
        }

        lastError = result.error || 'Upload failed';
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
      }

      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Update local DB with failure
    await updateStrokeBatchStatus(batch.id, 'failed', undefined, undefined, lastError);
    return { success: false, error: lastError };
  }, []);

  /**
   * Upload all session data (audio + strokes) with progress tracking
   */
  const uploadSession = useCallback(async (
    sessionId: string,
    options: UploadOptions = {}
  ): Promise<UploadResults> => {
    const { concurrency = 2, onProgress } = options;
    abortRef.current = false;

    const results: UploadResults = {
      audioUrls: [],
      strokeUrls: [],
      success: true,
      errors: [],
    };

    try {
      // Get pending chunks from IndexedDB
      const audioChunks = await getAudioChunksBySession(sessionId);
      const strokeBatches = await getStrokeBatchesBySession(sessionId);

      // Filter to only pending items
      const pendingAudio = audioChunks.filter(c => c.syncStatus === 'pending');
      const pendingStrokes = strokeBatches.filter(b => b.syncStatus === 'pending');

      const totalChunks = pendingAudio.length + pendingStrokes.length;

      updateState({
        isUploading: true,
        phase: 'audio',
        totalChunks,
        currentChunk: 0,
        overallProgress: 0,
        error: null,
        uploadedAudio: 0,
        uploadedStrokes: 0,
      });

      if (onProgress) onProgress(state);

      // Upload audio chunks with concurrency control
      let uploadedAudio = 0;
      for (let i = 0; i < pendingAudio.length; i += concurrency) {
        if (abortRef.current) break;

        const batch = pendingAudio.slice(i, i + concurrency);
        const uploadPromises = batch.map((chunk, idx) =>
          uploadAudioChunk(chunk, sessionId, (progress) => {
            updateState({
              currentChunk: i + idx + 1,
              currentProgress: progress.percentage,
              overallProgress: Math.round(((i + idx + progress.percentage / 100) / totalChunks) * 100),
            });
          })
        );

        const batchResults = await Promise.all(uploadPromises);

        for (const result of batchResults) {
          if (result.success && result.url && result.mediaId) {
            results.audioUrls.push({
              chunkIndex: uploadedAudio,
              url: result.url,
              mediaId: result.mediaId,
            });
            uploadedAudio++;
          } else if (result.error) {
            results.errors.push(`Audio chunk ${uploadedAudio}: ${result.error}`);
            results.success = false;
          }
        }

        updateState({ uploadedAudio });
      }

      // Upload stroke batches
      updateState({ phase: 'strokes' });

      let uploadedStrokes = 0;
      for (let i = 0; i < pendingStrokes.length; i += concurrency) {
        if (abortRef.current) break;

        const batch = pendingStrokes.slice(i, i + concurrency);
        const uploadPromises = batch.map((strokeBatch, idx) =>
          uploadStrokeBatch(strokeBatch, sessionId, (progress) => {
            const audioOffset = pendingAudio.length;
            updateState({
              currentChunk: audioOffset + i + idx + 1,
              currentProgress: progress.percentage,
              overallProgress: Math.round(((audioOffset + i + idx + progress.percentage / 100) / totalChunks) * 100),
            });
          })
        );

        const batchResults = await Promise.all(uploadPromises);

        for (const result of batchResults) {
          if (result.success && result.url && result.mediaId) {
            results.strokeUrls.push({
              batchIndex: uploadedStrokes,
              url: result.url,
              mediaId: result.mediaId,
            });
            uploadedStrokes++;
          } else if (result.error) {
            results.errors.push(`Stroke batch ${uploadedStrokes}: ${result.error}`);
            results.success = false;
          }
        }

        updateState({ uploadedStrokes });
      }

      updateState({
        isUploading: false,
        phase: results.success ? 'complete' : 'error',
        overallProgress: 100,
        error: results.errors.length > 0 ? results.errors.join('; ') : null,
      });

      return results;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      updateState({
        isUploading: false,
        phase: 'error',
        error,
      });
      results.success = false;
      results.errors.push(error);
      return results;
    }
  }, [state, updateState, uploadAudioChunk, uploadStrokeBatch]);

  /**
   * Abort ongoing upload
   */
  const abort = useCallback(() => {
    abortRef.current = true;
    updateState({
      isUploading: false,
      phase: 'idle',
      error: 'Upload cancelled',
    });
  }, [updateState]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    abortRef.current = false;
    setState({
      isUploading: false,
      phase: 'idle',
      currentChunk: 0,
      totalChunks: 0,
      currentProgress: 0,
      overallProgress: 0,
      error: null,
      uploadedAudio: 0,
      uploadedStrokes: 0,
    });
  }, []);

  return {
    state,
    uploadSession,
    abort,
    reset,
  };
}

export default useSessionUpload;
