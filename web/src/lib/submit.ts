// Order delivery channels. Apps Script (server-checked totals + Google Sheets) is used when configured;
// otherwise orders are emailed through FormSubmit (https://formsubmit.co).
import { HOME_SUPPLEMENT, METHODS, PRICE, PRODUCT, buildPayload, fmt, quote, type ConfirmedOrder, type OrderForm } from './order';

const TIMEOUT_MS = 30000;

export class SubmitError extends Error {}

async function postJson(url: string, init: RequestInit): Promise<unknown> {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, method: 'POST', signal: ctrl.signal });
    try { return await res.json(); } catch { throw new SubmitError('The order server sent an unexpected response.'); }
  } catch (err) {
    if (err instanceof SubmitError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') throw new SubmitError('The connection timed out. Check your internet connection and try again.');
    throw new SubmitError("We couldn't reach the order server. Check your internet connection and try again.");
  } finally { clearTimeout(timer); }
}

export async function submitAppsScript(url: string, f: OrderForm, token: string): Promise<ConfirmedOrder> {
  // text/plain avoids a CORS preflight, which Apps Script web apps don't answer.
  const data = await postJson(url, { headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(buildPayload(f, token)), redirect: 'follow' }) as { ok?: boolean; error?: string; order?: ConfirmedOrder };
  if (!data?.ok || !data.order) throw new SubmitError(data?.error || 'The order could not be confirmed.');
  return data.order;
}

// Order ID derived from the form session token, so a retry after a failed send keeps the same ID.
export function orderId(token: string, now = new Date()): string {
  const d = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `WGM-${d}-${token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()}`;
}

// Fields become rows in FormSubmit's table email, in this order. Keys starting with "_" are FormSubmit settings.
export function formSubmitPayload(f: OrderForm, id: string, now = new Date()): Record<string, string> {
  const q = quote(f);
  if (q.total == null || q.fee == null || !f.method) throw new SubmitError('Please select your wilaya and delivery method.');
  const home = f.method === 'home';
  const date = now.toLocaleString('en-GB', { timeZone: 'Africa/Algiers', dateStyle: 'medium', timeStyle: 'short' }) + ' (Algeria)';
  return {
    _subject: `NEW WAGMI ORDER — ${id}`,
    _template: 'table',
    _captcha: 'false',
    _honey: f.website,
    'Order ID': id,
    'TOTAL TO COLLECT': fmt(q.total),
    'Customer name': f.name.trim(),
    'Phone': f.phone.trim(),
    'Product': PRODUCT,
    'Size': f.size ?? '',
    'Quantity': String(f.qty),
    'Unit price': fmt(PRICE),
    'Product subtotal': fmt(q.subtotal),
    'Wilaya': f.wilaya,
    'Commune': f.commune.trim(),
    'Delivery method': METHODS[f.method],
    ...(home
      ? { 'Delivery address': f.address.trim(), 'Delivery instructions': f.instructions.trim() || '—' }
      : { 'Stop Desk location': f.stopDesk.trim() || 'Not specified' }),
    'Base Stop Desk rate': fmt(q.base as number),
    'Home Delivery supplement': home ? fmt(HOME_SUPPLEMENT) : '—',
    'Final delivery fee': fmt(q.fee),
    'Additional notes': f.notes.trim() || '—',
    'Order date': date
  };
}

export async function submitFormSubmit(target: string, f: OrderForm, token: string): Promise<ConfirmedOrder> {
  const id = orderId(token);
  const data = await postJson(`https://formsubmit.co/ajax/${encodeURIComponent(target)}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(formSubmitPayload(f, id))
  }) as { success?: string | boolean; message?: string };
  // FormSubmit answers success "true"/"false" as strings. Until the address is activated it answers "false" with an activation notice.
  if (String(data?.success) !== 'true') {
    console.error('FormSubmit rejected the order:', data?.message);
    throw new SubmitError("Online ordering isn't available right now. Please send your order on WhatsApp.");
  }
  const q = quote(f);
  return { id, size: f.size ?? '', quantity: f.qty, wilaya: f.wilaya, method: f.method ? METHODS[f.method] : '', total: q.total as number };
}
