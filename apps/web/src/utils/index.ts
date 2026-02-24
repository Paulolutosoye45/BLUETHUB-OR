import { deciveType, type IActions, type IBatch } from "./constant";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import { v4 as uuidv4 } from "uuid";

export const token = {
  getToken() {
    return localStorage.getItem("token");
  },
  isAuthenticated() {
    return !!this.getToken();
  },
  login(token: string) {
    localStorage.setItem("token", token);
  },
  logout() {
    // Clear all auth-related localStorage items
    localStorage.removeItem("token");
  },
  clearAll() {
    // Clear all auth-related localStorage items
    this.logout();
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
//class Hashing {
// static async hashPassword(password: string) {
//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password, salt);
//     return hash;
// }
// static async comparePassword(password: string, hash: string) {
//     return await bcrypt.compare(password, hash);
// }

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
}) => {
  const { totalDuration, hasAudio, startTime, hasBoard, endTime } = data;
  const newBatch: IBatch = {
    id: uuidv4(),
    startTime,
    endTime,
    hasAudio,
    hasBoard,
  };

  let actions: IActions;
  const batchesStr = localStorage.getItem("currentBatches");

  if (batchesStr) {
    actions = JSON.parse(batchesStr);
  } else {
    actions = {
      totalDuration,
      totalBatches: 0,
      batches: [],
    };
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
    current += 10;
    return result;
  };
})();

export const SEND_INTERVAL = 1000;

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
