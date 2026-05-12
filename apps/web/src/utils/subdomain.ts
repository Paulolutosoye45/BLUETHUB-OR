export const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;

    // Dev — extract from ?tenant= query param
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        const params = new URLSearchParams(window.location.search);
        return params.get("tenant");
    }

    // Production — extract from subdomain
    const baseDomain = import.meta.env.VITE_APP_URL;
    if (hostname === baseDomain) return null;

    return hostname.replace(`.${baseDomain}`, "");
};