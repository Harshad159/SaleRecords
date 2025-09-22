import { openDB } from 'idb'
import type { SaleRecord } from './types'

const DB_NAME = 'narsinha-sales'
const STORE = 'records'

// Init DB
async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    },
  })
}

// Load all records
export async function loadRecords(): Promise<SaleRecord[]> {
  const db = await getDB()
  return (await db.getAll(STORE)) as SaleRecord[]
}

// Add new record
export async function addRecord(rec: SaleRecord) {
  const db = await getDB()
  await db.put(STORE, rec)
}

// Update existing
export async function updateRecord(rec: SaleRecord) {
  const db = await getDB()
  await db.put(STORE, rec)
}

// Delete record
export async function deleteRecord(id: string) {
  const db = await getDB()
  await db.delete(STORE, id)
}

// ===== Migration: move from localStorage → IndexedDB (runs once) =====
export async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem('sales-records')
    if (!raw) return
    const parsed: SaleRecord[] = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return

    const db = await getDB()
    for (const rec of parsed) {
      await db.put(STORE, rec)
    }

    // clear old localStorage
    localStorage.removeItem('sales-records')
    console.log(`✅ Migrated ${parsed.length} records to IndexedDB.`)
  } catch (err) {
    console.error('Migration failed', err)
  }
}
