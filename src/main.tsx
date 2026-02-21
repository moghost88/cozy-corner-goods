import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * CRITICAL: Handle OAuth/Recovery tokens in the URL hash BEFORE React mounts.
 * 
 * Problem: We use HashRouter (#/route), but Supabase OAuth/recovery redirects
 * put tokens in the hash: #access_token=...&refresh_token=...
 * HashRouter would interpret this as a route and show NotFound.
 * 
 * Solution: Before React renders, check if the hash contains auth tokens.
 * If yes, store them in sessionStorage for AuthContext to pick up,
 * then clean the hash so HashRouter sees "#/" (home route).
 */
function handleAuthRedirectBeforeMount() {
    const hash = window.location.hash;

    // No hash or normal HashRouter route (starts with #/)
    if (!hash || hash.startsWith("#/")) return;

    // Check if the hash contains Supabase auth tokens
    if (hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type"); // 'recovery', 'signup', etc.

        if (accessToken) {
            // Store tokens for AuthContext to consume
            sessionStorage.setItem("__supabase_auth_tokens", JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                type: type || "unknown",
            }));
        }

        // Clean the hash so HashRouter works normally
        // If it's a recovery flow, redirect to #/auth so the reset form shows
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
