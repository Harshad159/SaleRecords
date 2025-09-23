// storage.ts — IndexedDB storage with migration + compat wrappers
import { openDB, IDBPDatabase } from 'idb';
import type { SaleRecord } from './types';

const DB_NAME = 'narsinha-sales-db';
const STORE = 'sales';
const DB_VERSION = 3; // bump if schema changes

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('supplier', 'supplier', { unique: false });
        } else {
          const store = db.transaction.objectStore(STORE);
          if (!store.indexNames.contains('date')) {
            store.createIndex('date', 'date', { unique: false });
          }
          if (!store.indexNames.contains('supplier')) {
            store.createIndex('supplier', 'supplier', { unique: false });
          }
        }
      },
    });
  }
  return dbPromise!;
}

// ---- Core API ----
export async function addSale(rec: SaleRecord) {
  const db = await getDB();
  await db.put(STORE, rec);
}
export async function updateSale(rec: SaleRecord) {
  const db = await getDB();
  await db.put(STORE, rec);
}
export async function deleteSale(id: string) {
  const db = await getDB();
  await db.delete(STORE, id);
}
export async function getAllSales(): Promise<SaleRecord[]> {
  const db = await getDB();
  return await db.getAll(STORE);
}

// GST auto-fill helper
export async function getGSTBySupplier(supplier: string): Promise<string | null> {
  if (!supplier.trim()) return null;
  const db = await getDB();
  const tx = db.transaction(STORE, 'readonly');
  const idx = tx.store.index('supplier');
  const out: SaleRecord[] = [];
  let cursor = await idx.openCursor(IDBKeyRange.only(supplier));
  while (cursor) {
    out.push(cursor.value as SaleRecord);
    cursor = await cursor.continue();
  }
  await tx.done;
  if (!out.length) return null;
  out.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const found = out.find(r => r.gstNumber && r.gstNumber.trim().length > 0);
  return found ? found.gstNumber.trim() : null;
}

// ---- Migration from legacy localStorage (call once on app start) ----
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    // Adjust this key if your old app used a different one.
    const raw = localStorage.getItem('sales') || localStorage.getItem('records') || '';
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const db = await getDB();
    const existing = await db.getAll(STORE);
    if (existing && existing.length > 0) {
      // Already migrated previously; skip
      return;
    }

    // Map legacy fields to the new schema
    // Old fields we saw in your errors: serial, customer, kva, invoiceNo, dcNo
    // We'll place serial+kva into items[0], and map names accordingly.
    const mapped: SaleRecord[] = parsed.map((r: any) => {
      return {
        id: r.id || crypto.randomUUID?.() || String(Date.now() + Math.random()),
        date: r.date || r.createdAt || '',
        supplier: r.supplier || r.customer || '',
        gstNumber: r.gstNumber || r.gst || '',
        dcNumber: r.dcNumber || r.dcNo || r.invoiceNo || '',
        manufacturer: r.manufacturer || '',
        items: [
          {
            serialNumber: r.serial || r.serialNumber || '',
            kva: Number(r.kva || r.capacity || 0),
          },
        ].filter(it => String(it.serialNumber).trim().length > 0),
        remarks: r.remarks || r.note || '',
      } as SaleRecord;
    });

    const tx = db.transaction(STORE, 'readwrite');
    for (const rec of mapped) {
      await tx.store.put(rec);
    }
    await tx.done;

    // Optional: remove old localStorage to avoid re-migrating
    // localStorage.removeItem('sales');
    // localStorage.removeItem('records');
  } catch {
    // best-effort migration; ignore errors
  }
}

// ---- Compatibility wrappers (so older imports still work) ----
export const loadRecords = getAllSales;
export const addRecord = addSale;
export const updateRecord = updateSale;
export const deleteRecord = deleteSale;
