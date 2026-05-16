/**
 * Media Upload Service
 *
 * Handles direct-to-Cloudinary uploads using server-signed tokens.
 * This bypasses server bandwidth for large files (audio/video).
 *
 * WORKFLOW:
 * 1. Request upload token from backend (includes signed credentials)
 * 2. Upload file directly to Cloudinary using the token
 * 3. Confirm upload with backend (updates database)
 *
 * Used for:
 * - Lesson audio chunks
 * - Board stroke data (as JSON files)
 * - Lesson media attachments
 */

import { API } from './index';
import { X_Tenant_ID } from '@/utils/tenant';

// ── Types ─────────────────────────────────────────────────────────────────────

// Matches C# enum: Audio=1, Video=2, Document=3, Image=4
export const MediaType = {
  Audio: 1,
  Video: 2,
  Document: 3,
  Image: 4,
} as const;
export type MediaType = typeof MediaType[keyof typeof MediaType];

export interface RequestUploadTokenPayload {
  fileName: string;
  fileSize: number;
  mediaType: MediaType;
  mimeType: string;
  displayName?: string;
}

export interface UploadTokenResponse {
  responseCode: string;
  responseMessage: string;
  status: string;
  mediaId: string;
  uploadUrl: string;
  signature: string;
  timestamp: number;
  publicId: string;
  folder: string;
  apiKey: string;
  cloudName: string;
  expiresAt: string;
}

export interface ConfirmUploadPayload {
  mediaId: string;
  secureUrl: string;
  publicId: string;
  fileSize: number;
  duration?: number;
  thumbnailUrl?: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  duration?: number;
  thumbnail_url?: string;
  resource_type: string;
  format: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  mediaId?: string;
  cdnUrl?: string;
  publicId?: string;
  error?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const mediaUploadService = {
  /**
   * Request an upload token from the backend
   * This token allows direct upload to Cloudinary
   */
  async requestUploadToken(payload: RequestUploadTokenPayload): Promise<UploadTokenResponse> {
    const response = await API.post<UploadTokenResponse>('/api/Media/request-upload-token', payload, {
      headers: { 'X-Tenant-ID': X_Tenant_ID },
    });
    return response.data;
  },

  /**
   * Upload file directly to Cloudinary using the signed token
   * Returns Cloudinary's response with the CDN URL
   */
  async uploadToCloudinary(
    file: Blob,
    token: UploadTokenResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();

    // Required fields for signed upload
    formData.append('file', file);
    formData.append('api_key', token.apiKey);
    formData.append('timestamp', token.timestamp.toString());
    formData.append('signature', token.signature);
    formData.append('public_id', token.publicId);
    formData.append('folder', token.folder);

    // Cloudinary upload URL
    const uploadUrl = token.uploadUrl;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;
            resolve(response);
          } catch (e) {
            reject(new Error('Failed to parse Cloudinary response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  },

  /**
   * Confirm upload completion with the backend
   * Updates database with Cloudinary URLs and metadata
   */
  async confirmUpload(payload: ConfirmUploadPayload): Promise<{ success: boolean; message: string }> {
    try {
      const response = await API.post('/api/Media/confirm-upload', payload, {
        headers: { 'X-Tenant-ID': X_Tenant_ID },
      });
      return {
        success: response.data.responseCode === 'successful' || response.data.responseCode === '00',
        message: response.data.responseMessage,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { responseMessage?: string } } };
      return {
        success: false,
        message: err.response?.data?.responseMessage || 'Failed to confirm upload',
      };
    }
  },

  /**
   * Complete upload flow: token → upload → confirm
   * Use this for simple one-shot uploads
   */
  async upload(
    file: Blob,
    fileName: string,
    mediaType: MediaType,
    mimeType: string,
    displayName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Step 1: Request upload token
      const tokenResponse = await this.requestUploadToken({
        fileName,
        fileSize: file.size,
        mediaType,
        mimeType,
        displayName,
      });

      if (tokenResponse.status !== 'successful') {
        return {
          success: false,
          error: tokenResponse.responseMessage || 'Failed to get upload token',
        };
      }

      // Step 2: Upload to Cloudinary
      const cloudinaryResponse = await this.uploadToCloudinary(file, tokenResponse, onProgress);

      // Step 3: Confirm upload with backend
      const confirmResult = await this.confirmUpload({
        mediaId: tokenResponse.mediaId,
        secureUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        fileSize: cloudinaryResponse.bytes,
        duration: cloudinaryResponse.duration,
        thumbnailUrl: cloudinaryResponse.thumbnail_url,
      });

      if (!confirmResult.success) {
        return {
          success: false,
          error: confirmResult.message,
        };
      }

      return {
        success: true,
        mediaId: tokenResponse.mediaId,
        cdnUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[MediaUpload] Upload failed:', err);
      return {
        success: false,
        error: err.message || 'Upload failed',
      };
    }
  },

  /**
   * Upload audio blob (for lesson recordings)
   * Convenience method with audio-specific defaults
   */
  async uploadAudio(
    blob: Blob,
    sessionId: string,
    chunkIndex: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const fileName = `audio_${sessionId}_chunk_${chunkIndex}.webm`;
    const mimeType = blob.type || 'audio/webm';

    return this.upload(
      blob,
      fileName,
      MediaType.Audio,
      mimeType,
      `Audio chunk ${chunkIndex}`,
      onProgress
    );
  },

  /**
   * Upload stroke data as JSON (for lesson board recordings)
   * Converts stroke batch to JSON blob and uploads
   */
  async uploadStrokeData(
    strokeData: unknown,
    sessionId: string,
    batchIndex: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const jsonString = JSON.stringify(strokeData);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const fileName = `strokes_${sessionId}_batch_${batchIndex}.json`;

    return this.upload(
      blob,
      fileName,
      MediaType.Document,
      'application/json',
      `Stroke batch ${batchIndex}`,
      onProgress
    );
  },

  /**
   * Get upload status for a media file
   * Used to poll upload progress for server-side processing
   */
  async getUploadStatus(mediaId: string): Promise<{
    status: number;
    statusName: string;
    cdnUrl?: string;
    error?: string;
  }> {
    try {
      const response = await API.get(`/api/Media/status/${mediaId}`, {
        headers: { 'X-Tenant-ID': X_Tenant_ID },
      });
      return {
        status: response.data.uploadStatus,
        statusName: response.data.uploadStatusName,
        cdnUrl: response.data.cdnUrl,
        error: response.data.errorMessage,
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        status: -1,
        statusName: 'Error',
        error: err.message,
      };
    }
  },
};

export default mediaUploadService;
