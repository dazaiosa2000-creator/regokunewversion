/**
 * WAGMI — Rengoku Special Drop · Order backend (Google Apps Script)
 * Records orders in the "WAGMI Orders" sheet and emails each order to NOTIFY_EMAIL.
 * See SETUP.md for deployment steps.
 */

const NOTIFY_EMAIL = 'dazaiosa2000@gmail.com';
const SHEET_NAME = 'WAGMI Orders';
const PRODUCT = 'Rengoku Special Drop Hoodie';
const UNIT_PRICE = 3800;
const HOME_SUPPLEMENT = 350;
const MAX_QTY = 10;
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const METHODS = { stopdesk: 'Stop Desk', home: 'Home Delivery' };
const TZ = 'Africa/Algiers';

// Stop Desk Classique base rates (DA). Must match RATES in the website.
const RATES = {
  'Sétif': 400, 'Alger': 450, 'Chlef': 450, 'Blida': 450, 'Bouira': 450, 'Tizi Ouzou': 450, 'Constantine': 450, 'Médéa': 450, 'Oran': 450, 'Bordj Bou Arréridj': 450, 'Boumerdès': 450, 'Tipaza': 450, 'Aïn Defla': 450,
  'Oum El Bouaghi': 500, 'Batna': 500, 'Béjaïa': 500, 'Tlemcen': 500, 'Tiaret': 500, 'Jijel': 500, 'Skikda': 500, 'Sidi Bel Abbès': 500, 'Annaba': 500, 'Mostaganem': 500, "M'Sila": 500, 'Tissemsilt': 500, 'Mila': 500, 'Relizane': 500,
  'Djelfa': 600, 'Saïda': 600, 'Guelma': 600, 'Mascara': 600, 'Khenchela': 600, 'Souk Ahras': 600, 'Biskra': 600, 'Tébessa': 600, 'El Tarf': 600,
  'Laghouat': 700, 'Ouled Djellal': 700,
  'Ouargla': 800, 'El Bayadh': 800, 'El Oued': 800, 'Naâma': 800, 'Ghardaïa': 800, 'Touggourt': 800, "El M'Ghair": 800,
  'El Meniaa': 1000, 'Adrar': 1100, 'Béchar': 1100, 'Timimoun': 1100, 'Beni Abbes': 1100, 'In Salah': 1100,
  'Tamanrasset': 1400, 'Tindouf': 1400, 'Illizi': 1700, 'Bordj Badji Mokhtar': 1700, 'In Guezzam': 1700, 'Djanet': 1700,
  'Aïn Témouchent': null // not in the supplied tariff — set a number to enable online orders for this wilaya
};

const HEADERS = ['Order ID', 'Order date and time', 'Customer full name', 'Phone number', 'Wilaya', 'Commune', 'Delivery method', 'Delivery address', 'Stop Desk location', 'Product', 'Size', 'Quantity', 'Unit price', 'Product subtotal', 'Base Stop Desk delivery rate', 'Home Delivery supplement', 'Final delivery fee', 'Final total', 'Customer notes', 'Order status'];

/** Run once from the editor to authorize the script and create the sheet. */
function setup() {
  getSheet_();
  Logger.log('Sheet ready. Now deploy as a Web App (see SETUP.md).');
}

function doGet() {
  return json_({ ok: true, service: 'WAGMI orders', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    let body;
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
    catch (err) { return json_({ ok: false, error: 'Invalid request.' }); }

    if (body.website) return json_({ ok: false, error: 'Order rejected.' }); // honeypot

    const v = validate_(body);
    if (v.error) return json_({ ok: false, error: v.error });
    const o = v.order;

    const cache = CacheService.getScriptCache();
    const tokenKey = 'tok_' + o.token;
    const dupKey = 'dup_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, [o.phone, o.size, o.quantity, o.wilaya, o.method, o.commune].join('|')));

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return json_({ ok: false, error: 'The server is busy. Please try again in a moment.' });
    try {
      const cached = cache.get(tokenKey) || cache.get(dupKey);
      if (cached) return json_({ ok: true, duplicate: true, order: JSON.parse(cached) });

      const now = new Date();
      o.id = 'WGM-' + Utilities.formatDate(now, TZ, 'yyMMdd') + '-' + randomId_(5);
      o.date = Utilities.formatDate(now, TZ, 'yyyy-MM-dd HH:mm');

      const sheet = getSheet_();
      sheet.appendRow([o.id, o.date, o.name, o.phone, o.wilaya, o.commune, o.methodLabel, o.address, o.stopDesk, PRODUCT, o.size, o.quantity, UNIT_PRICE, o.subtotal, o.base, o.supplement, o.fee, o.total, o.notes, 'New'].map(cell_));
      const row = sheet.getLastRow();
      SpreadsheetApp.flush();

      try { sendEmail_(o); }
      catch (mailErr) {
        sheet.getRange(row, HEADERS.length).setValue('New — email failed');
        console.error('Email failed for ' + o.id + ': ' + mailErr);
      }

      const response = { id: o.id, product: PRODUCT, size: o.size, quantity: o.quantity, wilaya: o.wilaya, commune: o.commune, method: o.methodLabel, subtotal: o.subtotal, deliveryFee: o.fee, total: o.total, date: o.date };
      cache.put(tokenKey, JSON.stringify(response), 21600); // 6 h — same browser session retrying
      cache.put(dupKey, JSON.stringify(response), 120);     // 2 min — identical order resubmitted
      return json_({ ok: true, order: response });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong on our side. Please try again or order via WhatsApp.' });
  }
}

function validate_(b) {
  const token = clean_(b.token, 64);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(token)) return { error: 'Invalid order session. Please refresh the page.' };

  const size = clean_(b.size, 4).toUpperCase();
  if (SIZES.indexOf(size) < 0) return { error: 'Please choose a valid size.' };

  const quantity = Number(b.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) return { error: 'Please choose a quantity between 1 and ' + MAX_QTY + '.' };

  const wilaya = clean_(b.wilaya, 40);
  if (!Object.prototype.hasOwnProperty.call(RATES, wilaya)) return { error: 'Please select a valid wilaya.' };
  const base = RATES[wilaya];
  if (typeof base !== 'number') return { error: 'Online delivery pricing for this wilaya is not available yet. Please order via WhatsApp.' };

  const method = clean_(b.method, 10);
  if (!METHODS[method]) return { error: 'Please choose Stop Desk or Home Delivery.' };

  const commune = clean_(b.commune, 80);
  if (commune.length < 2) return { error: 'Please enter your commune or city.' };

  const address = method === 'home' ? clean_(b.address, 250) : '';
  if (method === 'home' && address.length < 6) return { error: 'Please enter your full delivery address.' };
  const instructions = method === 'home' ? clean_(b.instructions, 200) : '';
  const stopDesk = method === 'stopdesk' ? clean_(b.stopDesk, 120) : '';

  const name = clean_(b.name, 80);
  if (name.length < 3) return { error: 'Please enter your full name.' };

  const m = String(b.phone || '').replace(/[\s.\-()]/g, '').match(/^(?:\+213|00213|213|0)([2-7]\d{8})$/);
  if (!m) return { error: 'Please enter a valid Algerian phone number.' };
  const phone = '0' + m[1];

  const notesRaw = clean_(b.notes, 500);
  const notes = [notesRaw, instructions ? 'Delivery instructions: ' + instructions : ''].filter(String).join(' | ');

  const supplement = method === 'home' ? HOME_SUPPLEMENT : 0;
  const fee = base + supplement;
  const subtotal = UNIT_PRICE * quantity;

  return { order: { token, size, quantity, wilaya, method, methodLabel: METHODS[method], commune, address, stopDesk, instructions, name, phone, notes, base, supplement, fee, subtotal, total: subtotal + fee } };
}

function sendEmail_(o) {
  const n = x => Number(x).toLocaleString('en-US') + ' DA';
  const where = o.method === 'home' ? ['Address', o.address] : ['Stop Desk location', o.stopDesk || 'Not specified'];
  const sections = [
    ['Customer', [['Full name', o.name], ['Phone', o.phone]]],
    ['Product', [['Product', PRODUCT], ['Size', o.size], ['Quantity', o.quantity], ['Unit price', n(UNIT_PRICE)], ['Product subtotal', n(o.subtotal)]]],
    ['Delivery', [['Wilaya', o.wilaya], ['Commune', o.commune], ['Delivery method', o.methodLabel], where, ['Base Stop Desk rate', n(o.base)], ['Home Delivery supplement', o.supplement ? n(o.supplement) : '—'], ['Final delivery fee', n(o.fee)]]]
  ];

  const rowsHtml = rows => rows.map(r => '<tr><td style="padding:6px 0;color:#6b6b6b;font-size:14px;vertical-align:top;width:45%">' + esc_(r[0]) + '</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111">' + esc_(String(r[1])) + '</td></tr>').join('');
  const html =
    '<div style="background:#f4f1ec;padding:16px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff">' +
    '<div style="background:#080808;color:#F5F0E8;padding:20px 22px"><div style="font-size:12px;letter-spacing:3px;color:#F5A623">WAGMI</div>' +
    '<div style="font-size:22px;font-weight:bold;margin-top:6px">NEW ORDER RECEIVED</div>' +
    '<div style="font-size:14px;margin-top:6px;color:#cfc8bd">Order ID: <b style="color:#F5F0E8">' + esc_(o.id) + '</b></div></div>' +
    '<div style="padding:8px 22px 4px">' +
    sections.map(s => '<h3 style="margin:18px 0 4px;font-size:12px;letter-spacing:2px;color:#C62828;text-transform:uppercase">' + s[0] + '</h3><table role="presentation" style="width:100%;border-collapse:collapse">' + rowsHtml(s[1]) + '</table>').join('') +
    '</div>' +
    '<div style="margin:18px 22px;padding:16px;background:#080808;color:#F5F0E8"><div style="font-size:12px;letter-spacing:2px">TOTAL TO COLLECT</div><div style="font-size:28px;font-weight:bold;color:#F5A623;margin-top:4px">' + n(o.total) + '</div></div>' +
    '<div style="padding:0 22px 22px;font-size:14px;color:#333"><h3 style="margin:0 0 4px;font-size:12px;letter-spacing:2px;color:#C62828">ADDITIONAL NOTES</h3><p style="margin:0 0 14px">' + esc_(o.notes || '—') + '</p>' +
    '<h3 style="margin:0 0 4px;font-size:12px;letter-spacing:2px;color:#C62828">ORDER DATE</h3><p style="margin:0">' + esc_(o.date) + ' (Algeria)</p></div>' +
    '</div></div>';

  const text = ['NEW ORDER RECEIVED', 'Order ID: ' + o.id, ''].concat(
    sections.reduce((acc, s) => acc.concat([s[0].toUpperCase()]).concat(s[1].map(r => '- ' + r[0] + ': ' + r[1])).concat(['']), []),
    ['TOTAL TO COLLECT: ' + n(o.total), '', 'Additional notes:', o.notes || '—', '', 'Order date:', o.date]
  ).join('\n');

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: 'NEW WAGMI ORDER — ' + o.id, body: text, htmlBody: html, name: 'WAGMI Orders' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#080808').setFontColor('#F5F0E8');
    sh.setFrozenRows(1);
    sh.getRange('D:D').setNumberFormat('@'); // keep leading 0 on phone numbers
  }
  return sh;
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
function cell_(v) { return (typeof v === 'string' && /^[=+\-@]/.test(v)) ? "'" + v : v; } // block formula injection
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function randomId_(len) { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < len; i++) s += c.charAt(Math.floor(Math.random() * c.length)); return s; }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
