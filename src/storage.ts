// src/storage.ts — IndexedDB storage with migration + compat wrappers
import { openDB, IDBPDatabase } from 'idb';
import type { SaleRecord } from './types';

const DB_NAME = 'narsinha-sales-db';
const STORE = 'sales';
const DB_VERSION = 3; // bump if schema changes

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      // NOTE: upgrade signature has (db, oldVersion, newVersion, tx)
      upgrade(db, _oldVersion, _newVersion, tx) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('supplier', 'supplier', { unique: false });
        } else {
          // Use the transaction provided by idb during upgrade
          const store = tx.objectStore(STORE);
          const names = Array.from(store.indexNames as any as string[]);
          if (!names.includes('date')) {
            store.createIndex('date', 'date', { unique: false });
          }
          if (!names.includes('supplier')) {
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
    // Adjust keys if your old app used different ones.
    const raw =
      localStorage.getItem('sales') ??
      localStorage.getItem('records') ??
      '';

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
    const mapped: SaleRecord[] = parsed.map((r: any) => ({
      id: r.id || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now() + Math.random())),
      date: r.date || r.createdAt || '',
      supplier: r.supplier || r.customer || '',
      gstNumber: r.gstNumber || r.gst || r.gstNo || '',
      dcNumber: r.dcNumber || r.dcNo || r.invoiceNo || '',
      manufacturer: r.manufacturer || '',
      items: [
        {
          serialNumber: r.serial || r.serialNumber || '',
          kva: Number(r.kva || r.capacity || 0),
        },
      ].filter((it: any) => String(it.serialNumber).trim().length > 0),
      remarks: r.remarks || r.note || '',
    }));

    const tx = db.transaction(STORE, 'readwrite');
    for (const rec of mapped) {
      await tx.store.put(rec);
    }
    await tx.done;

    // Optionally clear old LS:
    // localStorage.removeItem('sales');
    // localStorage.removeItem('records');
  } catch {
    // best-effort; ignore migration errors
  }
}

// ---- Compatibility wrappers (so older imports still work) ----
export const loadRecords = getAllSales;
export const addRecord = addSale;
export const updateRecord = updateSale;
export const deleteRecord = deleteSale;
