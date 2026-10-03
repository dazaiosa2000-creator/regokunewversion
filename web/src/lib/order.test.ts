import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, RATES, WILAYA_ORDER, normPhone, quote, validate, whatsAppUrl } from './order';

describe('quote', () => {
  // Totals from the brief, for one hoodie.
  it.each([
    ['Alger', 'stopdesk', 4250], ['Alger', 'home', 4600],
    ['Sétif', 'stopdesk', 4200], ['Sétif', 'home', 4550],
    ['Oran', 'stopdesk', 4250], ['Oran', 'home', 4600],
    ['Tamanrasset', 'stopdesk', 5200], ['Tamanrasset', 'home', 5550]
  ] as const)('%s %s → %i DA', (wilaya, method, total) => {
    expect(quote({ wilaya, method, qty: 1 }).total).toBe(total);
  });

  it('multiplies the product, not the delivery fee', () => {
    const q = quote({ wilaya: 'Alger', method: 'home', qty: 3 });
    expect(q.subtotal).toBe(11400);
    expect(q.fee).toBe(800);
    expect(q.total).toBe(12200);
  });

  it('has no total until wilaya and method are chosen, or when the rate is missing', () => {
    expect(quote({ wilaya: '', method: 'home', qty: 1 }).total).toBeNull();
    expect(quote({ wilaya: 'Alger', method: null, qty: 1 }).total).toBeNull();
    expect(quote({ wilaya: 'Aïn Témouchent', method: 'stopdesk', qty: 1 }).total).toBeNull();
  });
});

describe('wilayas', () => {
  it('lists all 58 wilayas, each with an entry in RATES', () => {
    expect(WILAYA_ORDER).toHaveLength(58);
    expect(new Set(WILAYA_ORDER).size).toBe(58);
    expect(Object.keys(RATES).sort()).toEqual([...WILAYA_ORDER].sort());
  });

  it('matches the backend rate table', () => {
    const gs = readFileSync(new URL('../../../backend/Code.gs', import.meta.url), 'utf8');
    for (const [w, r] of Object.entries(RATES)) {
      const key = w.includes("'") ? `"${w}"` : `'${w}'`;
      expect(gs, w).toContain(`${key}: ${r === null ? 'null' : r}`);
    }
  });
});

describe('validate', () => {
  it('requires size, wilaya, method, commune, name and phone', () => {
    expect(Object.keys(validate(EMPTY_FORM)).sort()).toEqual(['commune', 'method', 'name', 'phone', 'size', 'wilaya']);
  });
  it('requires an address only for home delivery', () => {
    const f = { ...EMPTY_FORM, size: 'M' as const, wilaya: 'Alger', commune: 'Hydra', name: 'Amine B', phone: '0555123456' };
    expect(validate({ ...f, method: 'stopdesk' })).toEqual({});
    expect(Object.keys(validate({ ...f, method: 'home' }))).toEqual(['address']);
  });
});

describe('normPhone', () => {
  it.each([['05 55 12 34 56', '0555123456'], ['+213 661 23 45 67', '0661234567'], ['00213771234567', '0771234567']])('%s', (i, o) => expect(normPhone(i)).toBe(o));
  it.each(['0855123456', '055512345', 'abc'])('rejects %s', i => expect(normPhone(i)).toBeNull());
});

it('builds an encoded WhatsApp link', () => {
  const url = whatsAppUrl({ ...EMPTY_FORM, size: 'L', wilaya: 'Oran', method: 'stopdesk' });
  expect(url.startsWith('https://wa.me/213556011290?text=')).toBe(true);
  const text = decodeURIComponent(url.split('text=')[1]);
  expect(text).toContain('Size: L');
  expect(text).toContain('Total: 4,250 DA');
});
