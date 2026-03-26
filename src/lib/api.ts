/**
 * Backend API base URL.
 * - Dev: default "" so requests go to the Vite dev server and are proxied to FastAPI (see vite.config.ts).
 * - Prod / preview without proxy: set VITE_API_BASE_URL or use default direct origin.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "" : "http://127.0.0.1:5000");
