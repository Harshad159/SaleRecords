// Minimal IndexedDB helper with migration that adds an index on 'supplier'.
// Store name: 'sales' (key: id). We keep items[] directly on the record.

import { openDB, IDBPDatabase } from 'idb';
import type { SaleRecord } from './types';

const DB_NAME = 'narsinha-sales-db';
const STORE = 'sales';
const DB_VERSION = 3; // bump when schema changes

let dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v1: base store
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('supplier', 'supplier', { unique: false }); // create now even at v1
        } else {
          const store = db.transaction.objectStore(STORE);
          // v2+: ensure indexes exist
          if (!store.indexNames.contains('date')) {
            store.createIndex('date', 'date', { unique: false });
          }
          if (!store.indexNames.contains('supplier')) {
            store.createIndex('supplier', 'supplier', { unique: false });
          }
        }
        // v3 reserved: no breaking change; we just ensure supplier index exists
      },
    });
  }
  return dbPromise!;
}

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

export async function getGSTBySupplier(supplier: string): Promise<string | null> {
  if (!supplier.trim()) return null;
  const db = await getDB();
  // Use the 'supplier' index to fetch any record for this supplier.
  // We’ll return the most recent non-empty GST (by date, if available).
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.store.index('supplier');

  const results: SaleRecord[] = [];
  let cursor = await index.openCursor(IDBKeyRange.only(supplier));
  while (cursor) {
    const value = cursor.value as SaleRecord;
    results.push(value);
    cursor = await cursor.continue();
  }
  await tx.done;

  if (results.length === 0) return null;

  // Sort by date desc, prefer the latest GST that is non-empty
  results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const found = results.find(r => r.gstNumber && r.gstNumber.trim().length > 0);
  return found ? found.gstNumber.trim() : null;
}
