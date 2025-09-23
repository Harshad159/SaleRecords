// src/storage.ts
import { openDB, type IDBPDatabase } from 'idb';
import type { SaleRecord, SaleItem } from './types';

const DB_NAME = 'narsinha-sales-db';
const DB_VERSION = 1;
const STORE_SALES = 'sales';
const STORE_SUPPLIERS = 'suppliers'; // supplier -> gst

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_SALES)) {
          const s = db.createObjectStore(STORE_SALES, { keyPath: 'id' });
          s.createIndex('by_date', 'date');
          s.createIndex('by_supplier', 'supplier');
          s.createIndex('by_dc', 'dcNumber');
        }
        if (!db.objectStoreNames.contains(STORE_SUPPLIERS)) {
          db.createObjectStore(STORE_SUPPLIERS, { keyPath: 'supplier' });
        }
      },
    });
  }
  return dbPromise!;
}

/** Create: add sale record */
export async function addSale(rec: SaleRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_SALES, rec);
  // keep supplier->GST for autofill
  if (rec.supplier && rec.gstNumber) {
    await db.put(STORE_SUPPLIERS, { supplier: rec.supplier, gstNumber: rec.gstNumber });
  }
}

/** Read all */
export async function listSales(): Promise<SaleRecord[]> {
  const db = await getDB();
  return await db.getAll(STORE_SALES);
}

/** Update */
export async function updateSale(rec: SaleRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_SALES, rec);
  if (rec.supplier && rec.gstNumber) {
    await db.put(STORE_SUPPLIERS, { supplier: rec.supplier, gstNumber: rec.gstNumber });
  }
}

/** Delete with the password gate in the UI (simple) */
export async function deleteSale(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_SALES, id);
}

/** UI helper: check password and then delete */
export async function deleteSaleSecure(id: string, password: string): Promise<void> {
  if (password !== 'Narsinha@123') {
    throw new Error('Wrong password');
  }
  await deleteSale(id);
}

/** GST autofill */
export async function getGSTBySupplier(supplier: string): Promise<string | null> {
  const db = await getDB();
  const row = await db.get(STORE_SUPPLIERS, supplier);
  return row?.gstNumber ?? null;
}

/** Optional: simple migration from localStorage once */
export async function migrateFromLocalStorage(): Promise<void> {
  const legacy = localStorage.getItem('sales');
  if (!legacy) return;
  try {
    const parsed: any[] = JSON.parse(legacy);
    if (Array.isArray(parsed)) {
      const db = await getDB();
      const tx = db.transaction([STORE_SALES, STORE_SUPPLIERS], 'readwrite');
      for (const r of parsed) {
        // tolerate old shapes; keep id if present or create one
        const id = r.id || crypto.randomUUID();
        const items: SaleItem[] = r.items || (r.serial ? [{ serialNumber: r.serial, kva: +r.kva || 0 }] : []);
        const rec: SaleRecord = {
          id,
          date: r.date || '',
          supplier: r.customer || r.supplier || '',
          gstNumber: r.gstNo || r.gstNumber || '',
          dcNumber: r.dcNo || r.dcNumber || '',
          manufacturer: r.manufacturer || '',
          remarks: r.remarks || '',
          items,
        };
        await tx.store.put(rec);
        if (rec.supplier && rec.gstNumber) {
          await tx.db.put(STORE_SUPPLIERS, { supplier: rec.supplier, gstNumber: rec.gstNumber });
        }
      }
      await tx.done;
    }
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('sales');
  }
}
