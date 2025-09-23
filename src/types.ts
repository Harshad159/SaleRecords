export interface SaleItem {
  serialNumber: string;
  kva: number; // use number; we’ll parse on input
}

export interface SaleRecord {
  id: string;
  date: string;              // ISO date string (YYYY-MM-DD)
  supplier: string;
  gstNumber: string;
  dcNumber: string;
  manufacturer: string;
  items: SaleItem[];         // NEW: list of transformers for the DC
  remarks?: string;
}
