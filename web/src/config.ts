// Build-time configuration. Set these in web/.env (see .env.example).
export const APPS_SCRIPT_URL = String(import.meta.env.VITE_APPS_SCRIPT_URL ?? '').trim();
// FormSubmit (https://formsubmit.co) emails each order here when no Apps Script URL is set.
// Use the address, or after activation the random alias FormSubmit sends you so the address isn't in the page source.
// Set VITE_FORMSUBMIT_EMAIL to "off" to disable.
const formSubmit = String(import.meta.env.VITE_FORMSUBMIT_EMAIL ?? '').trim() || 'dazaiosa2000@gmail.com';
export const FORMSUBMIT_TARGET = formSubmit === 'off' ? '' : formSubmit;
export const INSTAGRAM_URL = String(import.meta.env.VITE_INSTAGRAM_URL ?? '').trim();
// Dev-only: open the page with ?preview=confirmation to see the confirmation screen, clearly marked as a preview.
export const PREVIEW_CONFIRMATION = import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'confirmation';
