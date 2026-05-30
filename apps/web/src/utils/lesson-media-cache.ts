export const LESSON_MEDIA_CACHE = "bluethub-lesson-media";

// Keep a lesson-scoped cache key so entries can be traced/cleaned by lesson id.
export const buildLessonScopedCacheKey = (lessonId: string, mediaUrl: string): string =>
  `/__lesson_media__/${encodeURIComponent(lessonId)}/${encodeURIComponent(mediaUrl)}`;
