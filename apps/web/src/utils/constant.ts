export const deciveType = {
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
  TABLET: "Tablet",
} as const;

export interface Position {
  x: number;
  y: number;
}

export type MediaType = "video" | "pdf" | "image";

export interface IMedia {
  id: string;
  name: string;
  type: MediaType;
  url: string;
}

export type deciveType = (typeof deciveType)[keyof typeof deciveType];

export type DeviceType = keyof typeof deciveType;

export const SubjectType = {
  Major: 1,
  Minor: 2, // whatever your values are
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

export const ClassCategory = {
  Primary: 1,
  Secondary: 2,
  Colleges: 3,
} as const;

export type ClassCategory = (typeof ClassCategory)[keyof typeof ClassCategory];

export interface course {
  category: SubjectType;
  subject: string;
  isActive: boolean;
  classCategory: ClassCategory;
}

export const schoolType = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  HEADTEACHER: "Head Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
  STUDENT: "Student",
} as const;




export type schoolType = (typeof schoolType)[keyof typeof schoolType];

export const schoolStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  DELETED: "Deleted",
} as const;
export type schoolStatus = (typeof schoolStatus)[keyof typeof schoolStatus];

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

export const ResponseMessage = {
  SUCCESS: "Success",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Conflict occurred",
  UNPROCESSABLE_ENTITY: "Unprocessable entity",
  SERVER_ERROR: "Internal server error",
  SERVICE_UNAVAILABLE: "Service unavailable",
} as const;
export type ResponseMessage =
  (typeof ResponseMessage)[keyof typeof ResponseMessage];

/* ================= TYPES ================= */
export type ImageObject = {
  id: string;
  name: string;
  url: string;
  type?: "image" | "mp3";
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type LoadedImage = ImageObject & {
  imageElement: HTMLImageElement;
};

export const imageData: ImageObject[] = [
  {
    id: "urijfurjue",
    name: "My Image",
    url: "https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?cs=srgb&dl=pexels-jonaskakaroto-736230.jpg&fm=jpg",
    type: "image",
    x: 95,
    y: 44,
    width: 300,
    height: 400,
  },
];

export interface MediaInstance {
  id: string;
  assetId: string;
  showTime: string;
  hideTime: string;

  initialState: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    rotation: number;
    zIndex: number;
  };

  stateChanges: Array<{
    timestamp: string;
    type: "move" | "resize" | "rotate";
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    rotation?: number;
  }>;

  overlayStrokes: Array<{
    id: string;
    points: number[];
    color: string;
    width: number;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
}

export interface TrackedImage extends LoadedImage {
  scaleX: number;
  scaleY: number;
  rotation: number;
  mediaInstance: MediaInstance;
  transformStartTime: number | null;
  transformStartScale: { x: number; y: number } | null;
  transformStartRotation: number | null;
  dragStartTime: number | null;
  dragStartPosition: { x: number; y: number } | null;
}

export interface ReplayEvent {
  type: "show" | "hide" | "move" | "resize" | "rotate" | "stroke";
  timestamp: string;
  imageId: string;
  data: any;
  absoluteTime: number;
}

export type Stroke = {
  id: string;
  points: number[];
  color: string;
  width: number;
  type: string;
  currentBoard?: number;
  timestamp?: number;
  duration?: number;
  startTime: string;
  endTime: string;
};

export interface IBatch {
  id: string;
  startTime: string;
  endTime: string;
  hasAudio: boolean;
  hasBoard: boolean;
  mediaAction?: IActiveMedia[];
}

export interface IActions {
  totalDuration: number;
  totalBatches: number;
  batches: IBatch[];
}

export const MEDIA_STORAGE_KEY = "MEDIA_INSTANCES";

export const DB_NAME = "BluethubClassroom";
export const DB_VERSION = 7;
export const STORE_CLASS = "CLASS";
export const STORE_AUDIO = "Audio";
export const STORE_SESSIONS = "Sessions";
export const STORE_AUDIO_CHUNKS = "AudioChunks";
export const STORE_STROKE_BATCHES = "StrokeBatches";

// ── Sync Status Types ─────────────────────────────────────────────────────────

export type SyncStatus = "pending" | "uploading" | "sent" | "failed";

export type SessionStatus = "recording" | "paused" | "completed" | "draft" | "publishing" | "published" | "failed";

export type CompressedStroke = {
  id: string;
  sessionId: string | null;
  data: string;
  color: string;
  width: number;
  type: string;
  currentBoard: number;
  timestamp: number;
  duration: number;
  startTime: string;
  endTime: string;
};

export type AudioBatch = {
  id: string;
  type: "audio";
  sessionId: string;
  batchId: number;
  timestamp: number;
  blob: Blob;
  duration: number;
  size: number;
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEW SYNC ARCHITECTURE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Local Session Record ──────────────────────────────────────────────────────

export interface LocalSession {
  id: string;
  lessonId: string;
  schoolId: string;

  status: SessionStatus;
  uploadRequested?: boolean;

  teacher: {
    id: string;
    name: string;
    email: string;
  };

  lesson: {
    topic: string;
    subTopic: string;
    aim: string;
    subjectId: string;
    subjectName: string;
    classroomId: string;
    className: string;
  };

  recording: {
    startedAt: string;
    endedAt: string | null;
    totalDurationMs: number;
    pausedDurationMs: number;
    deviceType: string;
    screenWidth: number;
    screenHeight: number;
  };

  totalAudioChunks: number;
  totalStrokeBatches: number;

  syncProgress: {
    audioSent: number;
    audioFailed: number;
    strokesSent: number;
    strokesFailed: number;
    manifestSent: boolean;
  };

  adjustments: {
    trimStartMs: number;
    trimEndMs: number;
    deletedSections: Array<{ startMs: number; endMs: number }>;
    chapters: Array<{ timestampMs: number; label: string }>;
  };

  mediaEvents: IActiveMedia[];
  boardEvents: Array<{
    id: string;
    type: "switch";
    timestampMs: number;
    fromBoard: number;
    toBoard: number;
  }>;

  createdAt: string;
  modifiedAt: string;
}

// ── Audio Chunk with Sync Status ──────────────────────────────────────────────

export interface LocalAudioChunk {
  id: string;
  sessionId: string;
  lessonId: string;

  chunkIndex: number;        // Local 10s chunk index (0, 1, 2, 3, 4, 5, 6, ...)
  uploadBatchIndex: number;  // 60s upload batch index (0, 0, 0, 0, 0, 0, 1, ...)

  startMs: number;
  endMs: number;
  durationMs: number;

  blob: Blob;
  mimeType: string;
  sizeBytes: number;

  syncStatus: SyncStatus;
  cloudinaryUrl: string | null;
  cloudinaryPublicId: string | null;

  uploadAttempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;

  isDeleted: boolean;

  createdAt: string;
  sentAt: string | null;
}

// ── Stroke Batch with Sync Status ─────────────────────────────────────────────

export interface LocalStrokeBatch {
  id: string;
  sessionId: string;
  lessonId: string;

  batchIndex: number;

  startMs: number;
  endMs: number;

  strokes: CompressedStroke[];
  strokeCount: number;
  sizeBytes: number;

  syncStatus: SyncStatus;

  uploadAttempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;

  createdAt: string;
  sentAt: string | null;

  // Backend stroke batch identifier: sessionId_batchIndex
  indexKey?: string;
}

// ── Session Manifest (for upload to backend) ──────────────────────────────────

export interface SessionManifest {
  version: string;

  session: {
    id: string;
    lessonId: string;
    schoolId: string;
    recordedAt: string;
    publishedAt: string;
    teacher: { id: string; name: string };
  };

  lesson: {
    topic: string;
    subTopic: string;
    aim: string;
    subject: { id: string; name: string };
    classroom: { id: string; name: string };
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
      sizeBytes: number;
      durationMs: number;
    };
    strokes: {
      count: number;
      sizeBytes: number;
    } | null;
    events: Array<{
      type: string;
      timestampMs: number;
      [key: string]: unknown;
    }>;
  }>;

  mediaAssets: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;

  boards: Array<{
    index: number;
    dimensions: { width: number; height: number };
    strokeCount: number;
  }>;

  chapters: Array<{
    timestampMs: number;
    label: string;
  }>;
}

// ── Cloudinary Config ─────────────────────────────────────────────────────────

export interface CloudinaryUploadConfig {
  resourceType: string;
  cloudName: string;
  apiKey: string;
  signature: string;
  timestamp: number;
  folder: string;
  uploadPreset?: string | null;
}

export interface IPdfPageEvent {
  page: number;
  timerDisplay: string;
  elapsedMs?: number;
}

export interface IPdfScrollEvent {
  scrollRatio: number;
  timerDisplay: string;
  elapsedMs?: number;
}

export interface IMediaPlaybackEvent {
  state: 'play' | 'pause';
  timerDisplay: string;
  elapsedMs?: number;
}

export interface IActiveMedia extends IMedia {
  show: string | null;
  closed: string | null;
  showMs?: number;
  closedMs?: number;
  pause?: string;
  play?: string;
  frameIndex?: 0 | 1;
  pdfPages?: IPdfPageEvent[];
  pdfScrollEvents?: IPdfScrollEvent[];
  playbackEvents?: IMediaPlaybackEvent[];
}
