// src/utils/cloudSync.ts
// Offline stub so builds don't break. Uses the NEW schema.

import type { SaleRecord } from '../types';

export function normalizeForCloud(rec: SaleRecord) {
  return {
    id: rec.id,
    date: rec.date,
    supplier: rec.supplier,
    gstNumber: rec.gstNumber,
    dcNumber: rec.dcNumber,
    manufacturer: rec.manufacturer,
    items: (rec.items || []).map(i => ({
      serialNumber: i.serialNumber,
      kva: Number(i.kva || 0),
    })),
    remarks: rec.remarks ?? '',
  };
}

// No-ops for now — return shapes that keep callers happy.
export async function pushAllToCloud(_records: SaleRecord[]) {
  return { ok: true, uploaded: 0 };
}

export async function pullAllFromCloud(): Promise<SaleRecord[]> {
  return [];
}

export async function resolveConflicts(local: SaleRecord[], _remote: SaleRecord[]) {
  // For now, prefer local.
  return local;
}
