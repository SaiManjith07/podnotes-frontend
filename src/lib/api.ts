/**
 * Backend API base URL.
 * - Dev: default "" so requests go to the Vite dev server and are proxied to FastAPI (see vite.config.ts).
 * - Prod / preview without proxy: set VITE_API_BASE_URL or use default direct origin.
 */
const PROD_FALLBACK_API = "https://podcast-pal-backend.onrender.com";
const envApiBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
const resolvedApiBase = envApiBase || (import.meta.env.DEV ? "" : PROD_FALLBACK_API);

export const API_BASE = resolvedApiBase;
