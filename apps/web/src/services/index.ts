import axios from "axios";
import { token } from "@/utils";

// ── Single shared Axios instance ─────────────────────────────────────────────
// All service files import `API` from here — never create a second instance.
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const jwt = token.getToken();
  if (jwt) {
    config.headers.Authorization = `Bearer ${jwt}`;
  }
  return config;
});

// ── Shared response wrapper ──────────────────────────────────────────────────
export type TResponse<T> = {
  responseMessage: string;
  responseCode: string;
  status: string;
  data: T;
};

export type TNullable<T> = T | null;

// ── Shared domain types ──────────────────────────────────────────────────────
export type SchoolInfo = {
  id: string;
  schoolName: string;
  location: string;
  countryId: number;
  stateId: number;
  address: string;
  logoUrl: string;
};

// Legacy alias kept for files that import `schoolInfo` (lowercase)
export type schoolInfo = SchoolInfo;
