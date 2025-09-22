 # Narsinha Sales • PWA

> **OFFLINE-ONLY MODE:** Cloud sync is disabled by default. Data is saved locally per device (browser/phone). Use **Export to Excel** for manual backups.



A lightweight sales-record PWA for **Narsinha Engineering Works**. Works offline, stores data in the browser (localStorage), lets you **search**, **add sales**, and **export to Excel** — matching the UI you shared.

## Features
- Dark UI with gold accents (as in screenshots)
- Add Sale modal with transformer & sale details
- Search all fields
- Export filtered table to **Excel** (uses `xlsx`)
- PWA: installable, offline cache via service worker
- GitHub Pages workflow ready

## Get Started (Local)
```bash
npm i
npm run dev
```
Visit `http://localhost:5173`.

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

**Option A — Actions (recommended)**

1. Create a **new GitHub repo** (e.g., `narsinha-sales-pwa`).
2. Push this project to that repo.
3. In `vite.config.ts`, set:
```ts
export default defineConfig({ base: '/<your-repo-name>/', plugins:[react()] })
```
For example if repo is `narsinha-sales-pwa`, set `base: '/narsinha-sales-pwa/'`.
4. Commit and push.
5. Enable Pages: **Settings → Pages → Source: GitHub Actions**.
6. Done. After workflow runs, your PWA is live at:
`https://<your-username>.github.io/<your-repo-name>/`

**Option B — manual**
- Build (`npm run build`), then publish the `dist/` folder using GitHub Pages.

## Data & Backup
- Data is stored in the browser `localStorage` under the key: `salesRecords`.
- To migrate/back up, open DevTools → Application → Local Storage, copy the JSON.

## Notes
- If you want role-based access or cloud sync later, we can add Supabase/Firebase.
- To change colors or branding, edit `src/styles.css`.

— Generated 2025-09-22


---

### Free Cloud Sync (Google Sheets)

Keep device data **local** (offline-first) but optionally push a copy to a Google Sheet.

This uses a **Google Apps Script Web App** (free) — no server, no paid plan.

#### 1) Create the Sheet
- Create a Google Sheet named **Narsinha Sales**.
- Add a first row (headers) like this:
  `Serial # | Customer | KVA | Invoice # | DC # | Date | Contact | Voltage Class | Manufacturer | GST No. | Sale Price | Warranty | Remarks`

#### 2) Create the Apps Script
- In the Sheet: **Extensions → Apps Script**.
- Paste this code and save:

```javascript
const SHEET_NAME = 'Sheet1'; // change if needed

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'appendRows' && Array.isArray(body.rows)) {
      const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      const rows = body.rows.map(r => [
        r.serial, r.customer, r.kva, r.invoiceNo, r.dcNo, r.date, r.contact,
        r.voltageClass, r.manufacturer, r.gstNo, r.salePrice, r.warranty, r.remarks
      ]);
      sh.getRange(sh.getLastRow()+1, 1, rows.length, rows[0].length).setValues(rows);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, appended: rows.length })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:'bad request' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok:false, error:String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### 3) Deploy as Web App
- Click **Deploy → New deployment**.
- Type: **Web app**.
- **Execute as:** Me
- **Who has access:** Anyone with the link (or restrict to your Google account and sign requests; for simple backup choose "Anyone").
- Click **Deploy** and copy the **Web app URL**.

#### 4) Configure the PWA
- Open `src/config.ts` and set:
```ts
export const CLOUD_SYNC = {
  enabled: true,
  webAppUrl: 'PASTE_YOUR_WEB_APP_URL_HERE'
}
```
- Run locally to test or push to GitHub.

#### How it works
- Clicking **“☁︎ Sync to Cloud”** sends the currently filtered records to the Apps Script which appends them as new rows in your Sheet.
- Your offline data **stays on the device**; cloud sheet is just a backup/export.

> **Tip:** If you want full two-way sync later (PC ↔ Mobile), consider Firebase Firestore (also free tier). This project keeps your current requirement: device-local data with optional cloud backup.
