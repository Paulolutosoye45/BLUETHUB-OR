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