import axios from "axios";
import { token, } from "@/utils";
import { getTenantFromUrl } from "@/utils/subdomain";

// ── Single shared Axios instance ─────────────────────────────────────────────
// All service files import `API` from here — never create a second instance.
export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isExternal = /^https?:\/\//i.test(url);

  if (!isExternal) {
    config.headers["X-Tenant-ID"] = getTenantFromUrl();
    const jwt = token.getToken();
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/User/refresh-token`,
            { refreshToken },
          );

          const newToken: string = data.token;
          const expiresAt = Date.now() + (data.tokenExpiresIn ?? 3600) * 1000;

          localStorage.setItem("token", newToken);
          localStorage.setItem("refreshToken", data.refreshToken ?? refreshToken);
          localStorage.setItem("accessTokenExpiresAt", String(expiresAt));

          API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return API(originalRequest); // retry original request with new token
        }
      } catch {
        // refresh failed, fall through to clear tokens below
      }

      token.clearTokens();
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("schoolInfo");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

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
