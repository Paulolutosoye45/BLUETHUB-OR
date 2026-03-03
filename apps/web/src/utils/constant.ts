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

export type SubjectType = "MAJOR" | "MINOR";

export interface course {
  category: SubjectType;
  subject: string;
  status: boolean;
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
}

export interface IActions {
  totalDuration: number;
  totalBatches: number;
  batches: IBatch[];
}

export const MEDIA_STORAGE_KEY = "MEDIA_INSTANCES";

export const DB_NAME = "MyDB";
export const DB_VERSION = 4; // Incremented to create both stores
export const STORE_CLASS = "CLASS";
export const STORE_AUDIO = "Audio";

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
