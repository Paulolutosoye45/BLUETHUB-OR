import { API, type TResponse } from ".";

import { X_Tenant_ID } from "@/utils/tenant";

export const AI_IMAGE_FEATURE_KEY = "ai_image_generation";

// ── Request payload (POST api/image-generation/lesson/{lessonId}/generate) ──
// All fields optional — omit entirely to auto-build the prompt from lesson aim + objectives.
export interface GenerateLessonImageRequest {
  prompt?: string;
  style?: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

export interface GenerateLessonImageResponse {
  promptId: string;
  mediaId: string;
  imageUrl: string;
  publicId: string;
  prompt: string;
  agentType: string;
  modelUsed: string;
}

// Shared row shape returned by prompt/history endpoints
export interface LessonImageGenerationRow {
  id: string;
  schoolId: string;
  lessonId: string;
  createdBy: string;
  promptText: string;
  teacherPrompt: string | null;
  agentType: string;
  style: string | null;
  status: string;
  mediaId: string;
  imageUrl: string;
  imagePublicId: string;
  errorMessage: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface GenerationHistoryResponse {
  lessonId: string;
  count: number;
  generations: LessonImageGenerationRow[];
}

export interface SchoolFeatureCheckResponse {
  isEnabled: boolean;
}

// POST api/lessons/submit carries the request fields:
//   shouldGenerateImage, imageMaterialWords (max 2000), imageCount (1–5)
// Progress is tracked via the status endpoint and results via images.

export interface GenerationStatusResponse {
  lessonId: string;
  status: string; // e.g. "Pending" | "Generating" | "Completed" | "Failed"
  totalImages?: number | null;
  completedImages?: number | null;
  failedImages?: number | null;
  errorMessage?: string | null;
  updatedAt?: string | null;
}

export interface GeneratedLessonImage {
  id: string;
  lessonId: string;
  mediaId: string;
  imageUrl: string;
  imagePublicId: string;
  promptText: string;
  status: string;
  createdAt: string;
  isActive: boolean;
}

export interface GenerationImagesResponse {
  lessonId: string;
  count: number;
  images: GeneratedLessonImage[];
}

export const imageGenerationService = {
  // POST api/image-generation/lesson/{lessonId}/generate
  generate: (lessonId: string, payload: GenerateLessonImageRequest = {}) =>
    API.post<TResponse<GenerateLessonImageResponse>>(
      `api/image-generation/lesson/${lessonId}/generate`,
      payload,
      { headers: { "X-Tenant-ID": X_Tenant_ID, "Content-Type": "application/json" } }
    ),

  // GET api/image-generation/lesson/{lessonId}/prompt
  getLastPrompt: (lessonId: string) =>
    API.get<TResponse<LessonImageGenerationRow | null>>(
      `api/image-generation/lesson/${lessonId}/prompt`,
      { headers: { "X-Tenant-ID": X_Tenant_ID } }
    ),

  // GET api/image-generation/lesson/{lessonId}/history
  getHistory: (lessonId: string) =>
    API.get<TResponse<GenerationHistoryResponse>>(
      `api/image-generation/lesson/${lessonId}/history`,
      { headers: { "X-Tenant-ID": X_Tenant_ID } }
    ),

  // GET api/image-generation/lesson/{lessonId}/status
  getStatus: (lessonId: string) =>
    API.get<TResponse<GenerationStatusResponse>>(
      `api/image-generation/lesson/${lessonId}/status`,
      { headers: { "X-Tenant-ID": X_Tenant_ID } }
    ),

  // GET api/image-generation/lesson/{lessonId}/images
  getImages: (lessonId: string) =>
    API.get<TResponse<GenerationImagesResponse>>(
      `api/image-generation/lesson/${lessonId}/images`,
      { headers: { "X-Tenant-ID": X_Tenant_ID } }
    ),

  // GET api/school-features/check?featureKey=...  (omit schoolId for own school)
  checkFeature: (featureKey: string) =>
    API.get<TResponse<SchoolFeatureCheckResponse>>("api/school-features/check", {
      headers: { "X-Tenant-ID": X_Tenant_ID },
      params: { featureKey },
    }),
};
