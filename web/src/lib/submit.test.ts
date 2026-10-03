import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, type OrderForm } from './order';
import { formSubmitPayload, orderId } from './submit';

const base: OrderForm = { ...EMPTY_FORM, size: 'L', qty: 2, wilaya: 'Sétif', commune: 'El Eulma', name: 'Amine Benali', phone: '0555123456' };
const when = new Date('2026-10-03T14:05:00Z');

describe('orderId', () => {
  it('is stable for a token, so retries keep the same ID', () => {
    expect(orderId('ab12c-9f-xyz', when)).toBe('WGM-261003-AB12C');
    expect(orderId('ab12c-9f-xyz', when)).toBe(orderId('ab12c-9f-xyz', when));
  });
});

describe('formSubmitPayload', () => {
  it('builds the order email for Stop Desk', () => {
    const p = formSubmitPayload({ ...base, method: 'stopdesk' }, 'WGM-261003-AB12C', when);
    expect(p._subject).toBe('NEW WAGMI ORDER — WGM-261003-AB12C');
    expect(p._template).toBe('table');
    expect(p['TOTAL TO COLLECT']).toBe('8,000 DA');
    expect(p['Final delivery fee']).toBe('400 DA');
    expect(p['Home Delivery supplement']).toBe('—');
    expect(p['Stop Desk location']).toBe('Not specified');
    expect(p).not.toHaveProperty('Delivery address');
    expect(p['Order date']).toContain('15:05');
  });

  it('adds the supplement and address for Home Delivery', () => {
    const p = formSubmitPayload({ ...base, method: 'home', address: '12 Rue Didouche' }, 'X', when);
    expect(p['Final delivery fee']).toBe('750 DA');
    expect(p['TOTAL TO COLLECT']).toBe('8,350 DA');
    expect(p['Delivery address']).toBe('12 Rue Didouche');
    expect(p).not.toHaveProperty('Stop Desk location');
  });

  it('passes the honeypot through so FormSubmit drops bot submissions', () => {
    expect(formSubmitPayload({ ...base, method: 'home', website: 'spam' }, 'X', when)._honey).toBe('spam');
  });

  it('refuses an order without a priced delivery', () => {
    expect(() => formSubmitPayload({ ...base, method: 'home', wilaya: 'Aïn Témouchent' }, 'X', when)).toThrow();
  });
});
