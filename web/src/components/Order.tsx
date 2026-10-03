import { forwardRef, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Eyebrow } from './Decor';
import { APPS_SCRIPT_URL, FORMSUBMIT_TARGET, PREVIEW_CONFIRMATION } from '../config';
import { submitAppsScript, submitFormSubmit } from '../lib/submit';
import {
  EMPTY_FORM, FIELD_FOCUS, HOME_SUPPLEMENT, MAX_QTY, METHODS, PRICE, PRODUCT, RATES, SIZES, WILAYA_ORDER,
  fmt, newToken, pad2, quote, validate, whatsAppUrl,
  type ConfirmedOrder, type FieldKey, type Method, type OrderForm
} from '../lib/order';
import { scrollToId, scrollToTop } from '../lib/scroll';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type TextField = 'wilaya' | 'commune' | 'stopDesk' | 'address' | 'instructions' | 'name' | 'phone' | 'notes' | 'website';

const PREVIEW_ORDER: ConfirmedOrder = { id: 'WGM-261003-PREV', size: 'M', quantity: 1, wilaya: 'Alger', method: 'Home Delivery', total: 4600 };

const inputCls = 'min-h-[52px] w-full rounded-[2px] border bg-field px-4 py-3.5 text-base text-off';
const labelCls = 'text-[13px] font-semibold uppercase tracking-[.08em] text-label';
const Req = () => <span className="text-gold" aria-hidden="true"> *</span>;
const Opt = ({ children }: { children: ReactNode }) => <span className="font-normal normal-case tracking-normal text-muted">{children}</span>;
const ErrText = ({ id, show, children }: { id: string; show: boolean; children: ReactNode }) =>
  show ? <p id={id} className="m-0 text-sm leading-[1.45] text-err">{children}</p> : null;

function Step({ n, title, titleId, children }: { n: string; title: ReactNode; titleId?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 border-t border-off/12 p-0 pt-7">
      <legend className="float-left m-0 mb-5 flex w-full items-baseline gap-3.5 p-0">
        <span className="font-display text-[15px] tracking-[.1em] text-flame">{n}</span>
        <span id={titleId} className="font-display text-[28px] uppercase tracking-[.02em]">{title}</span>
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Rows({ rows }: { rows: { k: string; v: string; set?: boolean }[] }) {
  return (
    <dl className="m-0 flex flex-col gap-2.5 border-t border-off/10 pt-[18px]">
      {rows.map(r => (
        <div key={r.k} className="flex justify-between gap-4 text-[15px]">
          <dt className="text-muted">{r.k}</dt>
          <dd className={`m-0 text-right font-semibold ${r.set === false ? 'text-dim' : 'text-off'}`}>{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export const OrderSection = forwardRef<HTMLElement>(function OrderSection(_, ref) {
  const [f, setF] = useState<OrderForm>(EMPTY_FORM);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState('');
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [token, setToken] = useState(newToken);
  const inFlight = useRef(false);
  const confirmRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => setF(p => ({ ...p, [k]: v }));
  // Editing after a failed submit clears the error banner; the form itself is never cleared on failure.
  const onText = (k: TextField) => (e: { target: { value: string } }) => { set(k, e.target.value); if (status === 'error') setStatus('idle'); };

  const q = quote(f);
  const errs = validate(f);
  const rateMissing = !!f.wilaya && !q.hasBase;
  const shows = (k: FieldKey) => !!errs[k] && (attempted || (k === 'wilaya' && rateMissing));
  const bd = (k: FieldKey) => shows(k) ? 'border-err' : 'border-off/22';
  const aria = (k: FieldKey) => ({ 'aria-invalid': shows(k), 'aria-describedby': 'e-' + k });

  const preview = PREVIEW_CONFIRMATION && status !== 'success';
  const confirmed = preview ? PREVIEW_ORDER : order;
  const showConfirm = status === 'success' || preview;
  const submitting = status === 'submitting';

  useEffect(() => {
    if (status !== 'success' || !confirmRef.current) return;
    scrollToId('order');
    confirmRef.current.focus({ preventScroll: true });
  }, [status]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    const first = FIELD_FOCUS.find(([k]) => errs[k]);
    if (first) { setAttempted(true); document.getElementById(first[1])?.focus(); return; }
    if (f.website) return; // honeypot
    if (!APPS_SCRIPT_URL && !FORMSUBMIT_TARGET) { setStatus('error'); setSubmitError("Online ordering isn't connected yet. Please send your order on WhatsApp for now."); return; }

    inFlight.current = true;
    setStatus('submitting');
    setSubmitError('');
    try {
      setOrder(APPS_SCRIPT_URL ? await submitAppsScript(APPS_SCRIPT_URL, f, token) : await submitFormSubmit(FORMSUBMIT_TARGET, f, token));
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setSubmitError((err as Error).message);
    } finally { inFlight.current = false; }
  };

  const backToWagmi = () => { setF(EMPTY_FORM); setAttempted(false); setStatus('idle'); setSubmitError(''); setOrder(null); setToken(newToken()); scrollToTop(); };

  const deliveryRows = [
    { k: 'Wilaya', v: f.wilaya || 'Not selected', set: !!f.wilaya },
    { k: 'Delivery method', v: (f.method && METHODS[f.method]) || 'Not selected', set: !!f.method },
    { k: 'Base Stop Desk rate', v: q.hasBase ? fmt(q.base as number) : '—', set: q.hasBase },
    ...(f.method === 'home' ? [{ k: 'Home Delivery supplement', v: '+' + fmt(HOME_SUPPLEMENT) }] : []),
    { k: 'Delivery fee', v: q.fee != null ? fmt(q.fee) : '—', set: q.fee != null }
  ];

  return (
    <section id="order" ref={ref} aria-labelledby={showConfirm ? 'confirm-title' : 'order-title'} className="border-t border-off/8 bg-panel">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,40px)] py-[clamp(72px,9vw,128px)]">
        {!showConfirm && <>
          <div className="mb-[clamp(36px,4vw,56px)] flex max-w-[720px] flex-col gap-[18px]">
            <Eyebrow kanji="伍">Order</Eyebrow>
            <h2 id="order-title" className="m-0 font-display text-[clamp(44px,6vw,88px)] font-normal uppercase leading-[.92]">Order your hoodie.</h2>
            <p className="m-0 text-[17px] leading-[1.6] text-pretty text-soft">Choose your size, select your wilaya and delivery method, and check your total before you confirm.</p>
          </div>
          <form onSubmit={submit} noValidate className="flex flex-wrap items-start gap-[clamp(28px,4vw,64px)]">
            <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-11">

              <Step n="01" titleId="lbl-size" title={<>Size<Req /></>}>
                <div role="radiogroup" aria-labelledby="lbl-size" aria-describedby="e-size" className="flex flex-wrap gap-2.5">
                  {SIZES.map(z => {
                    const sel = f.size === z;
                    return (
                      <button key={z} type="button" role="radio" id={'f-size-' + z} aria-checked={sel} onClick={() => set('size', z)}
                        className={`h-14 min-w-[68px] rounded-[2px] border px-4 text-base font-bold tracking-[.08em] transition-colors duration-200 ${sel ? 'border-off bg-off text-ink' : `${shows('size') ? 'border-err' : 'border-off/22'} bg-transparent text-off`}`}>{z}</button>
                    );
                  })}
                </div>
                {shows('size') && <p id="e-size" className="mt-3 mb-0 text-sm text-err">{errs.size}</p>}
              </Step>

              <Step n="02" title="Quantity">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
                  <div className="flex items-center rounded-[2px] border border-off/22">
                    <button type="button" onClick={() => set('qty', Math.max(1, f.qty - 1))} disabled={f.qty <= 1} aria-label="Decrease quantity" aria-controls="f-qty" className="size-[52px] border-0 bg-transparent text-[22px] text-off disabled:opacity-35">−</button>
                    <output id="f-qty" aria-live="polite" aria-label="Quantity" className="min-w-[52px] text-center font-display text-[22px]">{f.qty}</output>
                    <button type="button" onClick={() => set('qty', Math.min(MAX_QTY, f.qty + 1))} disabled={f.qty >= MAX_QTY} aria-label="Increase quantity" aria-controls="f-qty" className="size-[52px] border-0 bg-transparent text-[22px] text-off disabled:opacity-35">+</button>
                  </div>
                  <span className="text-sm text-muted">3,800 DA each</span>
                </div>
              </Step>

              <Step n="03" title="Delivery">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-wilaya" className={labelCls}>Wilaya<Req /></label>
                    <div className="relative">
                      <select id="f-wilaya" name="wilaya" value={f.wilaya} onChange={onText('wilaya')} autoComplete="address-level1" {...aria('wilaya')} className={`${inputCls} ${bd('wilaya')} cursor-pointer appearance-none pr-11`}>
                        <option value="">Select your wilaya</option>
                        {WILAYA_ORDER.map((w, i) => <option key={w} value={w}>{pad2(i + 1)} — {w}{RATES[w] == null ? ' (contact us)' : ''}</option>)}
                      </select>
                      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-[18px] -translate-y-1/2 text-[11px] text-muted">▼</span>
                    </div>
                    <ErrText id="e-wilaya" show={shows('wilaya')}>{errs.wilaya}</ErrText>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span id="lbl-method" className={labelCls}>Delivery method<Req /></span>
                    <div role="radiogroup" aria-labelledby="lbl-method" aria-describedby="e-method" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-3">
                      {(['stopdesk', 'home'] as Method[]).map(k => {
                        const sel = f.method === k;
                        const price = q.hasBase ? fmt((q.base as number) + (k === 'home' ? HOME_SUPPLEMENT : 0)) : (k === 'home' ? '+350 DA' : '');
                        return (
                          <button key={k} type="button" role="radio" id={'f-method-' + k} aria-checked={sel} onClick={() => set('method', k)}
                            className={`flex min-h-[100px] flex-col gap-2 rounded-[2px] border p-[18px] text-left text-off transition-colors duration-200 ${sel ? 'border-flame bg-flame/12' : `${shows('method') ? 'border-err' : 'border-off/22'} bg-transparent`}`}>
                            <span className="flex w-full items-center justify-between gap-3">
                              <span className="flex items-center gap-2.5">
                                <span aria-hidden="true" className={`grid size-[18px] flex-none place-items-center rounded-full border-[1.5px] ${sel ? 'border-flame' : 'border-off/40'}`}><span className={`size-2 rounded-full ${sel ? 'bg-flame' : 'bg-transparent'}`} /></span>
                                <span className="text-[15px] font-bold uppercase tracking-[.08em]">{METHODS[k]}</span>
                              </span>
                              <span className="whitespace-nowrap font-display text-xl text-gold">{price}</span>
                            </span>
                            <span className="pl-7 text-sm leading-[1.45] text-soft-2">{k === 'home' ? 'Delivered to your address. Stop Desk rate + 350 DA.' : 'Collect your order from the delivery office.'}</span>
                          </button>
                        );
                      })}
                    </div>
                    <ErrText id="e-method" show={shows('method')}>{errs.method}</ErrText>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-commune" className={labelCls}>Commune / city<Req /></label>
                    <input id="f-commune" name="commune" type="text" autoComplete="address-level2" maxLength={80} value={f.commune} onChange={onText('commune')} {...aria('commune')} className={`${inputCls} ${bd('commune')}`} />
                    <ErrText id="e-commune" show={shows('commune')}>{errs.commune}</ErrText>
                  </div>

                  {f.method === 'stopdesk' && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="f-stopdesk" className={labelCls}>Stop Desk location <Opt>(if you know it)</Opt></label>
                      <input id="f-stopdesk" name="stopDesk" type="text" maxLength={120} value={f.stopDesk} onChange={onText('stopDesk')} placeholder="Preferred delivery office" className={`${inputCls} border-off/22`} />
                    </div>
                  )}

                  {f.method === 'home' && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="f-address" className={labelCls}>Full delivery address<Req /></label>
                        <textarea id="f-address" name="address" rows={2} maxLength={250} autoComplete="street-address" value={f.address} onChange={onText('address')} {...aria('address')} placeholder="Street, building, floor" className={`${inputCls} ${bd('address')} min-h-20 resize-y leading-[1.5]`} />
                        <ErrText id="e-address" show={shows('address')}>{errs.address}</ErrText>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="f-instructions" className={labelCls}>Delivery instructions <Opt>(optional)</Opt></label>
                        <input id="f-instructions" name="instructions" type="text" maxLength={200} value={f.instructions} onChange={onText('instructions')} placeholder="Landmark, best time to call…" className={`${inputCls} border-off/22`} />
                      </div>
                    </div>
                  )}
                </div>
              </Step>

              <Step n="04" title="Your details">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-name" className={labelCls}>Full name<Req /></label>
                    <input id="f-name" name="name" type="text" autoComplete="name" maxLength={80} value={f.name} onChange={onText('name')} {...aria('name')} className={`${inputCls} ${bd('name')}`} />
                    <ErrText id="e-name" show={shows('name')}>{errs.name}</ErrText>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-phone" className={labelCls}>Phone number<Req /></label>
                    <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={f.phone} onChange={onText('phone')} {...aria('phone')} placeholder="05 55 12 34 56" className={`${inputCls} ${bd('phone')}`} />
                    <ErrText id="e-phone" show={shows('phone')}>{errs.phone}</ErrText>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <label htmlFor="f-notes" className={labelCls}>Additional notes <Opt>(optional)</Opt></label>
                  <textarea id="f-notes" name="notes" rows={3} maxLength={500} value={f.notes} onChange={onText('notes')} className={`${inputCls} min-h-24 resize-y border-off/22 leading-[1.5]`} />
                </div>
                <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
                  <label htmlFor="f-website">Website</label>
                  <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={onText('website')} />
                </div>
              </Step>
            </div>

            <aside aria-label="Order summary" className="sticky top-[88px] flex min-w-0 flex-[1_1_340px] flex-col gap-[22px] border border-off/10 bg-charcoal p-[clamp(20px,2.4vw,32px)]">
              <div className="flex items-center gap-4">
                <div className="h-20 w-16 flex-none overflow-hidden bg-panel bg-[radial-gradient(ellipse_at_50%_60%,rgba(198,40,40,.35),transparent_75%)]"><img src="/assets/cut-back.webp" alt="" className="block size-full object-contain p-1" /></div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-muted">WAGMI — Special Drop</span>
                  <span className="font-display text-[22px] uppercase leading-[1.05]">{PRODUCT}</span>
                </div>
              </div>
              <Rows rows={[
                { k: 'Size', v: f.size || 'Not selected', set: !!f.size },
                { k: 'Quantity', v: String(f.qty) },
                { k: 'Unit price', v: fmt(PRICE) },
                { k: 'Product subtotal', v: fmt(q.subtotal) }
              ]} />
              <Rows rows={deliveryRows} />
              <div className="flex flex-col gap-1.5 border-t border-off/18 pt-[18px]">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] font-bold uppercase tracking-[.16em]">Total to pay</span>
                  <span aria-live="polite" className="whitespace-nowrap font-display text-[clamp(36px,4vw,46px)] leading-none text-gold">{q.total != null ? fmt(q.total) : '—'}</span>
                </div>
                <span className="text-right text-[13px] leading-[1.5] text-muted">
                  {q.total != null ? `${fmt(q.subtotal)} + ${fmt(q.fee as number)} delivery` : rateMissing ? 'Delivery fee to confirm on WhatsApp.' : 'Select your wilaya and delivery method to see your total.'}
                </span>
              </div>

              {attempted && Object.keys(errs).length > 0 && <p role="alert" className="m-0 text-sm leading-[1.5] text-err">Please complete the highlighted fields.</p>}
              {status === 'error' && (
                <div role="alert" className="flex flex-col gap-2 border border-err bg-err/7 p-4">
                  <p className="m-0 text-[15px] font-bold">Your order was not sent.</p>
                  <p className="m-0 text-sm leading-[1.5] text-label">{submitError}</p>
                  <p className="m-0 text-[13px] leading-[1.5] text-soft-2">Your details are kept. Try again, or send your order on WhatsApp.</p>
                </div>
              )}

              <button type="submit" disabled={submitting} aria-busy={submitting} className="flex min-h-[60px] w-full items-center justify-center gap-3 border-0 bg-flame text-[15px] font-extrabold uppercase tracking-[.16em] text-off transition-colors duration-200 hover:bg-flame-dark disabled:opacity-75">
                {submitting && <span aria-hidden="true" className="size-4 flex-none animate-spin-fast rounded-full border-2 border-off/35 border-t-off" />}
                {submitting ? 'Sending your order…' : 'Confirm my order'}
              </button>

              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.2em] text-dim-2"><span className="h-px flex-1 bg-off/12" />or<span className="h-px flex-1 bg-off/12" /></div>
              <button type="button" onClick={() => window.open(whatsAppUrl(f), '_blank', 'noopener')} className="flex min-h-[52px] w-full items-center justify-center gap-2.5 border border-off/30 bg-transparent text-[13px] font-bold uppercase tracking-[.16em] text-off transition-colors duration-200 hover:border-off">
                <span aria-hidden="true" className="size-2 rounded-full bg-[#25D366]" />Order via WhatsApp
              </button>
              <p className="m-0 -mt-2 text-[13px] leading-[1.5] text-muted">Opens WhatsApp with your order details filled in. The order is only sent once you press Send in WhatsApp.</p>
            </aside>
          </form>
        </>}

        {showConfirm && confirmed && (
          <div ref={confirmRef} tabIndex={-1} className="mx-auto flex max-w-[760px] flex-col items-center gap-[26px] text-center outline-none">
            {preview && <span className="border border-dashed border-gold px-3 py-[7px] text-xs font-bold uppercase tracking-[.16em] text-gold">Design preview — not a real order</span>}
            <span aria-hidden="true" className="font-jp text-[64px] font-bold leading-none text-flame [text-shadow:0_0_40px_rgba(198,40,40,.6)]">炎</span>
            <h2 id="confirm-title" className="m-0 font-display text-[clamp(48px,8vw,104px)] font-normal uppercase leading-[.92]">Your flame is on its way.</h2>
            <p className="m-0 max-w-[520px] text-lg leading-[1.6] text-pretty text-soft">Thank you for choosing WAGMI. Your Rengoku Special Drop order has been received.</p>
            <div className="flex w-full max-w-[520px] flex-col gap-3 border border-off/10 bg-charcoal p-[clamp(20px,3vw,28px)] text-left">
              <dl className="m-0 flex flex-col gap-2.5">
                {[['Order ID', confirmed.id], ['Product', PRODUCT], ['Size', confirmed.size], ['Quantity', String(confirmed.quantity)], ['Wilaya', confirmed.wilaya], ['Delivery method', confirmed.method]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-[15px]"><dt className="text-muted">{k}</dt><dd className="m-0 text-right font-semibold">{v}</dd></div>
                ))}
              </dl>
              <div className="flex items-baseline justify-between gap-4 border-t border-off/16 pt-3.5">
                <span className="text-[13px] font-bold uppercase tracking-[.16em]">Total</span>
                <span className="font-display text-4xl leading-none text-gold">{fmt(Number(confirmed.total))}</span>
              </div>
            </div>
            <button type="button" onClick={backToWagmi} className="min-h-14 border-0 bg-off px-8 text-sm font-extrabold uppercase tracking-[.16em] text-ink transition-colors duration-200 hover:bg-gold">Back to WAGMI</button>
          </div>
        )}
      </div>
    </section>
  );
});
