// Pricing, delivery rates and validation for the Rengoku Special Drop.
// RATES must stay in sync with RATES in backend/Code.gs (the server recalculates every total).

export const PRICE = 3800;
export const HOME_SUPPLEMENT = 350;
export const MAX_QTY = 10;
export const WA_NUMBER = '213556011290';
export const PRODUCT = 'Rengoku Special Drop Hoodie';

// Stop Desk Classique base rates (DA).
export const RATES: Record<string, number | null> = {
  'Sétif': 400, 'Alger': 450, 'Chlef': 450, 'Blida': 450, 'Bouira': 450, 'Tizi Ouzou': 450, 'Constantine': 450, 'Médéa': 450, 'Oran': 450, 'Bordj Bou Arréridj': 450, 'Boumerdès': 450, 'Tipaza': 450, 'Aïn Defla': 450,
  'Oum El Bouaghi': 500, 'Batna': 500, 'Béjaïa': 500, 'Tlemcen': 500, 'Tiaret': 500, 'Jijel': 500, 'Skikda': 500, 'Sidi Bel Abbès': 500, 'Annaba': 500, 'Mostaganem': 500, "M'Sila": 500, 'Tissemsilt': 500, 'Mila': 500, 'Relizane': 500,
  'Djelfa': 600, 'Saïda': 600, 'Guelma': 600, 'Mascara': 600, 'Khenchela': 600, 'Souk Ahras': 600, 'Biskra': 600, 'Tébessa': 600, 'El Tarf': 600,
  'Laghouat': 700, 'Ouled Djellal': 700,
  'Ouargla': 800, 'El Bayadh': 800, 'El Oued': 800, 'Naâma': 800, 'Ghardaïa': 800, 'Touggourt': 800, "El M'Ghair": 800,
  'El Meniaa': 1000, 'Adrar': 1100, 'Béchar': 1100, 'Timimoun': 1100, 'Beni Abbes': 1100, 'In Salah': 1100,
  'Tamanrasset': 1400, 'Tindouf': 1400, 'Illizi': 1700, 'Bordj Badji Mokhtar': 1700, 'In Guezzam': 1700, 'Djanet': 1700,
  'Aïn Témouchent': null // not in the supplied tariff — set the rate here and in Code.gs
};

// Official wilaya order (codes 01–58).
export const WILAYA_ORDER = ['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Beni Abbes', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa'];

export const SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export type Size = (typeof SIZES)[number];
export type Method = 'stopdesk' | 'home';
export const METHODS: Record<Method, string> = { stopdesk: 'Stop Desk', home: 'Home Delivery' };

export interface OrderForm {
  size: Size | null;
  qty: number;
  wilaya: string;
  method: Method | null;
  commune: string;
  stopDesk: string;
  address: string;
  instructions: string;
  name: string;
  phone: string;
  notes: string;
  website: string; // honeypot
}

export const EMPTY_FORM: OrderForm = { size: null, qty: 1, wilaya: '', method: null, commune: '', stopDesk: '', address: '', instructions: '', name: '', phone: '', notes: '', website: '' };

export type FieldKey = 'size' | 'wilaya' | 'method' | 'commune' | 'address' | 'name' | 'phone';
export type Errors = Partial<Record<FieldKey, string>>;

// Field order for focusing the first error, with the element id to focus.
export const FIELD_FOCUS: [FieldKey, string][] = [['size', 'f-size-S'], ['wilaya', 'f-wilaya'], ['method', 'f-method-stopdesk'], ['commune', 'f-commune'], ['address', 'f-address'], ['name', 'f-name'], ['phone', 'f-phone']];

export const fmt = (n: number) => n.toLocaleString('en-US') + ' DA';
export const pad2 = (n: number) => String(n).padStart(2, '0');

export function normPhone(p: string): string | null {
  const m = String(p || '').replace(/[\s.\-()]/g, '').match(/^(?:\+213|00213|213|0)([2-7]\d{8})$/);
  return m ? '0' + m[1] : null;
}

export interface Quote { base: number | null | undefined; hasBase: boolean; sup: number; fee: number | null; subtotal: number; total: number | null }

export function quote(f: Pick<OrderForm, 'wilaya' | 'method' | 'qty'>): Quote {
  const base = f.wilaya ? RATES[f.wilaya] : undefined;
  const hasBase = typeof base === 'number';
  const sup = f.method === 'home' ? HOME_SUPPLEMENT : 0;
  const fee = hasBase && f.method ? (base as number) + sup : null;
  const subtotal = PRICE * f.qty;
  return { base, hasBase, sup, fee, subtotal, total: fee != null ? subtotal + fee : null };
}

export function validate(f: OrderForm): Errors {
  const e: Errors = {};
  if (!f.size) e.size = 'Please choose your size.';
  if (!f.wilaya) e.wilaya = 'Please select your wilaya.';
  else if (typeof RATES[f.wilaya] !== 'number') e.wilaya = "Online delivery pricing for this wilaya isn't available yet. Please order via WhatsApp and we will confirm the delivery fee.";
  if (!f.method) e.method = 'Please choose Stop Desk or Home Delivery.';
  if (f.commune.trim().length < 2) e.commune = 'Please enter your commune or city.';
  if (f.method === 'home' && f.address.trim().length < 6) e.address = 'Please enter your full delivery address.';
  if (f.name.trim().length < 3) e.name = 'Please enter your full name.';
  if (!normPhone(f.phone)) e.phone = 'Please enter a valid Algerian phone number, e.g. 05 55 12 34 56.';
  return e;
}

export function buildPayload(f: OrderForm, token: string) {
  return {
    token, size: f.size, quantity: f.qty, wilaya: f.wilaya, method: f.method, commune: f.commune.trim(),
    stopDesk: f.method === 'stopdesk' ? f.stopDesk.trim() : '',
    address: f.method === 'home' ? f.address.trim() : '',
    instructions: f.method === 'home' ? f.instructions.trim() : '',
    name: f.name.trim(), phone: normPhone(f.phone), notes: f.notes.trim(), website: f.website
  };
}

export function whatsAppUrl(f: OrderForm): string {
  const q = quote(f), d = '—';
  const L = ['Hello WAGMI, I would like to order:', '', `Product: ${PRODUCT}`, `Size: ${f.size || d}`, `Quantity: ${f.qty}`, '',
    `Name: ${f.name.trim() || d}`, `Phone: ${f.phone.trim() || d}`, `Wilaya: ${f.wilaya || d}`, `Commune: ${f.commune.trim() || d}`, `Delivery method: ${(f.method && METHODS[f.method]) || d}`];
  if (f.method === 'home') { L.push(`Address: ${f.address.trim() || d}`); if (f.instructions.trim()) L.push(`Delivery instructions: ${f.instructions.trim()}`); }
  if (f.method === 'stopdesk') L.push(`Stop Desk location: ${f.stopDesk.trim() || 'To confirm'}`);
  L.push('', `Product subtotal: ${fmt(q.subtotal)}`, `Delivery fee: ${q.fee != null ? fmt(q.fee) : 'To confirm'}`, `Total: ${q.total != null ? fmt(q.total) : 'To confirm'}`);
  if (f.notes.trim()) L.push('', `Notes: ${f.notes.trim()}`);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(L.join('\n'))}`;
}

export const newToken = () => (globalThis.crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);

export interface ConfirmedOrder { id: string; size: string; quantity: number; wilaya: string; method: string; total: number }
