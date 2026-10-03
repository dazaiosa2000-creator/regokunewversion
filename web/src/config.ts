// Build-time configuration. Set these in web/.env (see .env.example).
export const APPS_SCRIPT_URL = String(import.meta.env.VITE_APPS_SCRIPT_URL ?? '').trim();
export const INSTAGRAM_URL = String(import.meta.env.VITE_INSTAGRAM_URL ?? '').trim();
// Dev-only: open the page with ?preview=confirmation to see the confirmation screen, clearly marked as a preview.
export const PREVIEW_CONFIRMATION = import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'confirmation';
