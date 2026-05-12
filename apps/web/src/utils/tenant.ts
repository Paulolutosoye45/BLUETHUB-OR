const FALLBACK_TENANT = import.meta.env.VITE_TENANT_ID || "pearl";

export function getTenantId(): string {
  const hostname = window.location.hostname;

  // Production: extract from subdomain (e.g., green.techhubschmanagement.onrender.com)
  // Local with hosts file: extract from subdomain (e.g., green.localhost)
  const parts = hostname.split(".");

  // Check if we have a subdomain
  // For "green.techhubschmanagement.onrender.com" → parts = ["green", "techhubschmanagement", "onrender", "com"]
  // For "green.localhost" → parts = ["green", "localhost"]
  // For "localhost" → parts = ["localhost"]
  // For "127.0.0.1" → parts = ["127", "0", "0", "1"]

  if (parts.length >= 2) {
    const potentialTenant = parts[0];

    // Skip if it's an IP address or common non-tenant prefixes
    if (
      potentialTenant !== "www" &&
      potentialTenant !== "127" &&
      potentialTenant !== "192" &&
      potentialTenant !== "10" &&
      !/^\d+$/.test(potentialTenant) // Not purely numeric
    ) {
      // For localhost with subdomain (green.localhost)
      if (parts[1] === "localhost" || parts.length > 2) {
        return potentialTenant;
      }
    }
  }

  // Fallback: check URL query param for local testing (?tenant=green)
  const urlParams = new URLSearchParams(window.location.search);
  const queryTenant = urlParams.get("tenant");
  if (queryTenant) {
    return queryTenant;
  }

  // Fallback: check localStorage (can be set via dev tools)
  const storedTenant = localStorage.getItem("X-Tenant-ID");
  if (storedTenant) {
    return storedTenant;
  }

  // Final fallback: environment variable or default
  return FALLBACK_TENANT;
}

export const X_Tenant_ID = getTenantId();
