# WAGMI Rengoku Drop — Setup

The website is ready. To receive orders by email and in Google Sheets, connect the backend once (about 10 minutes, Google account required).

## 1. Create the order sheet
1. Sign in to Google with the account that should own the orders (e.g. dazaiosa2000@gmail.com).
2. Go to sheets.google.com → create a blank spreadsheet → name it **WAGMI Orders**.

## 2. Add the backend script
1. In the spreadsheet: **Extensions → Apps Script**.
2. Delete the sample code in `Code.gs`, paste the full contents of `backend/Code.gs`, and save.
3. Click **Project Settings** (gear icon) and set the time zone to **(GMT+01:00) Algeria**.
4. Back in the editor, select the `setup` function and click **Run**.
   Google will ask for permission (Sheets + send email as you). Approve. If it says "Google hasn't verified this app", click **Advanced → Go to project (unsafe)**. This is your own script.
   A tab called **WAGMI Orders** with column headers now exists in your spreadsheet.

## 3. Deploy as a Web App
1. **Deploy → New deployment** → type **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
4. Test it: open the URL in your browser. You should see `{"ok":true,"service":"WAGMI orders",...}`.

## 4. Connect the website
Copy `web/.env.example` to `web/.env` and paste the URL, then rebuild (`cd web && npm run build`):

```sh
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
VITE_INSTAGRAM_URL=https://instagram.com/yourhandle
```

Place a test order on the site. Check that a row appears in the sheet and an email titled `NEW WAGMI ORDER — WGM-…` arrives. Delete the test row afterwards.

## Updating the script later
Edit the code, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. This keeps the same URL. Creating a *new deployment* gives a new URL that you would have to put in `web/.env` again (and rebuild).

## Delivery rates
Rates live in two places that must match: `RATES` in `web/src/lib/order.ts` (website) and `RATES` in `backend/Code.gs` (server). The server recalculates every total and ignores any price sent by the browser.

**Aïn Témouchent (46) is missing from the supplied tariff.** It is listed on the site, but online orders for it are blocked until you set its rate (replace `null` with the price in both files and redeploy the script). Customers from that wilaya are asked to order via WhatsApp.

## Good to know
- Order status starts as `New`. Change it in the sheet as you process orders (e.g. Confirmed, Shipped, Delivered).
- Duplicate protection: a double-click or retry from the same page returns the original order ID instead of creating a second row. An identical order (same phone, size, quantity, wilaya, method, commune) within 2 minutes is also treated as a duplicate.
- If an email fails to send, the order is still recorded and its status reads `New — email failed`.
- A free Gmail account can send about 100 emails per day from Apps Script.
- The Apps Script URL is not a secret (it only accepts orders), so it is fine in the website build. No passwords or keys are stored in the website.
- WhatsApp orders open a prefilled chat to +213 556 01 12 90. They only arrive when the customer presses Send, and they are not recorded in the sheet.

## Building and hosting the website
The site lives in `web/` (Vite + React + TypeScript + Tailwind).

```sh
cd web
npm install
npm run dev      # local preview at http://localhost:5173
npm test         # pricing, wilaya table (also checks it matches backend/Code.gs), validation
npm run build    # static site in web/dist — upload to Netlify, Vercel, Cloudflare Pages, GitHub Pages…
```

- To preview the confirmation screen in dev, open `http://localhost:5173/?preview=confirmation`. It is marked "Design preview — not a real order" and is disabled in production builds.
- After you choose a domain, change `og:image` in `web/index.html` to a full URL (e.g. `https://yourdomain/assets/hoodie-back.jpg`) so social previews show the hoodie.
