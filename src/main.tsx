import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * CRITICAL: Handle PKCE auth code in the URL BEFORE React mounts.
 *
 * With PKCE flow, Supabase redirects back with ?code=xxx in the URL.
 * Unlike hash fragments (#access_token=...), query params:
 * - Survive Lovable's email link tracker (which strips hashes)
 * - Don't conflict with HashRouter (which uses # for routes)
 *
 * We extract the code here, store it for AuthContext to exchange,
 * and clean the URL before React/HashRouter initialize.
 */
function handleAuthRedirectBeforeMount() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
        // Store the PKCE code for AuthContext to exchange for a session
        sessionStorage.setItem("__supabase_pkce_code", code);

        // Clean the URL: remove ?code= so it doesn't persist
        url.searchParams.delete("code");
        // Also remove any error params Supabase might send
        url.searchParams.delete("error");
        url.searchParams.delete("error_code");
        url.searchParams.delete("error_description");

        window.history.replaceState(null, "", url.pathname + url.search + (url.hash || "#/"));
    }

    // Also handle legacy implicit flow tokens in hash (fallback)
    const hash = window.location.hash;
    if (hash && !hash.startsWith("#/") && hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (accessToken) {
            sessionStorage.setItem("__supabase_auth_tokens", JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                type: type || "unknown",
            }));
        }

        if (type === "recovery") {
            window.history.replaceState(null, "", window.location.pathname + "#/auth?recovery=true");
        } else {
            window.history.replaceState(null, "", window.location.pathname + "#/");
        }
    }
}

handleAuthRedirectBeforeMount();

createRoot(document.getElementById("root")!).render(
    <App />
);
