/**
 * Backend API base URL.
 * - Dev: default "" so requests go to the Vite dev server and are proxied to FastAPI (see vite.config.ts).
 * - Prod / preview without proxy: set VITE_API_BASE_URL or use default direct origin.
 */
const PROD_FALLBACK_API = "https://podcast-pal-backend.onrender.com";
const envApiBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const resolvedApiBase = envApiBase || (import.meta.env.DEV ? "" : PROD_FALLBACK_API);

// #region agent log
fetch("http://127.0.0.1:7834/ingest/e70bfa47-b8c9-42cc-82af-74e47d9233d1", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "4b09f5",
  },
  body: JSON.stringify({
    sessionId: "4b09f5",
    runId: "api-base-resolution",
    hypothesisId: "H1",
    location: "src/lib/api.ts:base_resolution",
    message: "Resolved API base URL",
    data: {
      envApiBase: envApiBase || "(empty)",
      isDev: import.meta.env.DEV,
      resolvedApiBase,
      pageOrigin: typeof window !== "undefined" ? window.location.origin : "(no-window)",
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const API_BASE = resolvedApiBase;
