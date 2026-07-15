import {
  deciveType,
  type IActions,
  type IActiveMedia,
  type IBatch,
} from "./constant";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import { v4 as uuidv4 } from "uuid";

export { getTenantId, X_Tenant_ID } from "./tenant";

const KEYS = {
  token: "token",
  refresh: "refreshToken",
  expiry: "token_expiry",
  schoolInfo: "schoolInfo",
  user: "user",
  school: "school",
} as const;

export const token = {
  // ── Access token ───────────────────────────────────────────────
  getToken(): string | null {
    return (
      localStorage.getItem(KEYS.token) ?? sessionStorage.getItem(KEYS.token)
    );
  },

  isAuthenticated(): boolean {
    if (this.isExpired()) {
      this.clearAll();
      return false;
    }
    return !!this.getToken();
  },

  // ── Login ──────────────────────────────────────────────────────
  login(accessToken: string, refreshToken: string, keepSignedIn = false) {
    if (keepSignedIn) {
      localStorage.setItem(KEYS.token, accessToken);
      localStorage.setItem(KEYS.refresh, refreshToken);

      // 30 days expiry
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(KEYS.expiry, String(expiry));
    } else {
      // cleared when tab closes
      sessionStorage.setItem(KEYS.token, accessToken);
      sessionStorage.setItem(KEYS.refresh, refreshToken);
    }
  },

  // ── Expiry ─────────────────────────────────────────────────────
  isExpired(): boolean {
    const expiry = localStorage.getItem(KEYS.expiry);
    if (!expiry) return false;
    return Date.now() > Number(expiry);
  },

  // ── Refresh token ──────────────────────────────────────────────
  getRefreshToken(): string | null {
    return (
      localStorage.getItem(KEYS.refresh) ?? sessionStorage.getItem(KEYS.refresh)
    );
  },

  setTokens(accessToken: string, refreshToken: string) {
    // preserves whichever storage was originally used
    if (localStorage.getItem(KEYS.token)) {
      localStorage.setItem(KEYS.token, accessToken);
      localStorage.setItem(KEYS.refresh, refreshToken);
    } else {
      sessionStorage.setItem(KEYS.token, accessToken);
      sessionStorage.setItem(KEYS.refresh, refreshToken);
    }
  },

  // ── Logout / clear ─────────────────────────────────────────────
  logout() {
    // clear both storages
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(KEYS.token);
      s.removeItem(KEYS.refresh);
    });
    localStorage.removeItem(KEYS.expiry);
    localStorage.removeItem(KEYS.schoolInfo);
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.school);
  },

  clearAll() {
    this.logout();
  },

  clearTokens() {
    this.logout();
  },
};

export const localData = {
  save<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  retrieve<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

//hash password
export async function Hashing(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  const bytes = new TextEncoder().encode(plainPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
// const result = await hashPassword("hello");
// console.log(result);

//device type utility
export function getDeviceType(): deciveType {
  if (isMobile) return deciveType.MOBILE;
  if (isTablet) return deciveType.TABLET;
  if (isDesktop) return deciveType.DESKTOP;
  return deciveType.DESKTOP; // fallback/default
}

export async function getDeviceIp() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch (error) {
    return "Unavailable";
  }
}

//michaelsmith
//StrongP@ssw0rd!
//BluethubTestPass6$

export const timeToSeconds = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60;
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${
      s < 10 ? "0" : ""
    }${s}`;
  }
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
};

export const parseTime = (time: string): number => {
  const parts = time.split(":").map((num) => parseInt(num, 10));
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else if (parts.length === 1) {
    [seconds] = parts;
  }

  return hours * 3600 + minutes * 60 + seconds;
};

export const saveActions = (data: {
  totalDuration: number;
  hasAudio: boolean;
  startTime: string;
  hasBoard: boolean;
  endTime: string;
  mediaAction?: IActiveMedia[];
}) => {
  const { totalDuration, hasAudio, startTime, hasBoard, endTime, mediaAction } =
    data;

  const newBatch: IBatch = {
    id: uuidv4(),
    startTime,
    endTime,
    hasAudio,
    hasBoard,
    mediaAction: mediaAction ?? [], // ← store media interactions in the batch
  };

  let actions: IActions;
  const batchesStr = localStorage.getItem("currentBatches");

  if (batchesStr) {
    actions = JSON.parse(batchesStr);
  } else {
    actions = { totalDuration, totalBatches: 0, batches: [] };
  }

  actions.batches.push(newBatch);
  actions.totalBatches = actions.batches.length;
  actions.totalDuration = totalDuration * actions.batches.length;

  localStorage.setItem("currentBatches", JSON.stringify(actions));
};

export const nextTime = (() => {
  let current = 0;
  return () => {
    const result = current;
    current += 10; // 10-second local batches for fine-grained seeking
    return result;
  };
})();

// ── Batch Configuration ───────────────────────────────────────────────────────
// LOCAL_BATCH_MS: Local recording/replay interval (10s for fine seeking)
// UPLOAD_BATCH_MS: Upload interval (60s for efficiency, configurable)
export const LOCAL_BATCH_MS = 10_000; // 10s - seeking granularity
export const UPLOAD_BATCH_MS = 60_000; // 60s - upload efficiency
export const SEND_INTERVAL = LOCAL_BATCH_MS; // Local timer uses 10s

/* ================= HELPERS ================= */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const base64ToUint8 = (b64: string) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export const timeStringToMs = (time: string) => {
  const parts = time.split(":").map(Number);
  return parts.length === 2
    ? (parts[0] * 60 + parts[1]) * 1000
    : (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
};

export const timerToMs = (displayTime: string) => timeStringToMs(displayTime);
