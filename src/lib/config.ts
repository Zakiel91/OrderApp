// Single source of truth for the API origin.
// Override per-environment with VITE_API_BASE; the production worker is the default.
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  'https://innovation-diamonds-api.innovation-diamonds.workers.dev'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
