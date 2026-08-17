export const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        const params = new URLSearchParams(window.location.search);
        return params.get("tenant");
    }

    const baseDomain = import.meta.env.VITE_APP_URL;
    if (hostname === baseDomain) return null;
    if (!hostname.endsWith(`.${baseDomain}`)) return null; // ← safety fix

    return hostname.replace(`.${baseDomain}`, "");
};


export function getTenantFromUrl(): string {
  const hostname = window.location.hostname;
  // localhost or netlify preview → use env fallback
  const isLocal    = hostname === 'localhost' || hostname === '127.0.0.1';
  const isNetlify  = hostname.endsWith('.netlify.app');

  if (isLocal || isNetlify) {
    return (import.meta.env.VITE_TENANT_ID as string) || 'green';
  }

  // production: extract subdomain
  // e.g. greenwood.bluethub.com → "greenwood"
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0]; // subdomain is the tenant
  }

  // fallback
  return (import.meta.env.VITE_TENANT_ID as string) || 'green';
}