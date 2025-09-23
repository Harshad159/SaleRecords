// Canonical data model (multi-transformer per DC)

export type SaleItem = {
  /** Transformer serial number, e.g. "T-12345" */
  serialNumber: string;
  /** KVA rating for this transformer */
  kva: number;
};

export type SaleRecord = {
  /** Stable unique id (uuid) */
  id: string;
  /** ISO date string: "YYYY-MM-DD" */
  date: string;
  /** Customer / Supplier name */
  supplier: string;
  /** GST number for the supplier (if known) */
  gstNumber: string;
  /** Delivery Challan / DC number (or internal dispatch number) */
  dcNumber: string;
  /** Manufacturer for this dispatch (textbox in the form) */
  manufacturer: string;
  /** One DC may dispatch multiple transformers */
  items: SaleItem[];
  /** Optional remarks shown in View and exported to Excel */
  remarks?: string;
};

/* ---------- Optional helpers ---------- */

/** Runtime guard to check if a value is a SaleItem */
export function isSaleItem(x: any): x is SaleItem {
  return x && typeof x === 'object'
    && 'serialNumber' in x
    && 'kva' in x;
}

/** Runtime guard to check if a value is a SaleRecord */
export function isSaleRecord(x: any): x is SaleRecord {
  return x && typeof x === 'object'
    && 'id' in x && 'date' in x && 'supplier' in x
    && 'dcNumber' in x && Array.isArray((x as any).items);
}
