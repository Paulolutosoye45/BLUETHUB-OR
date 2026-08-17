import { saveImage } from "@/services/class-media";
import type { MediaType } from "./constant";
import { token,  } from "./index";
import { getTenantFromUrl } from "./subdomain";

const X_Tenant_ID = getTenantFromUrl()

const buildMediaAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {};
  const accessToken = token.getToken();

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (X_Tenant_ID) {
    headers["X-Tenant-ID"] = X_Tenant_ID;
  }

  return headers;
};

export const fetchMediaWithAuthFallback = async (url: string): Promise<Response> => {
  const firstTry = await fetch(url, { mode: "cors" });
  if (firstTry.ok || (firstTry.status !== 401 && firstTry.status !== 403)) {
    return firstTry;
  }

  // Do NOT attach Bearer token to external media URLs.
  const isExternal = /^https?:\/\//i.test(url);
  if (isExternal) {
    return firstTry;
  }

  const authHeaders = buildMediaAuthHeaders();
  if (Object.keys(authHeaders).length === 0) {
    return firstTry;
  }

  return fetch(url, {
    mode: "cors",
    headers: authHeaders,
  });
};

// From a URL
export const fetchImageAsBlob = async (
  url: string,
  id: string,
  type: MediaType,
  name: string,
): Promise<void> => {
  const response = await fetchMediaWithAuthFallback(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status}`);
  }
  const blob = await response.blob();

  await saveImage(id, blob, type, name, url);
};

// Load PDF from public folder
export const loadPdfAsBlob = async (
  fileName: string,
  id: string,
  name: string,
): Promise<void> => {
  const url = `/${fileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load PDF: ${response.statusText}`);
  }
  const blob = await response.blob();
  await saveImage(id, blob, "pdf", name, url);
};
