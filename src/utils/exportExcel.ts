// Export sales to Excel (XLSX) using the NEW schema with items[].
// Requires the 'xlsx' package: npm i xlsx
// Columns: Date, Supplier, GST Number, DC Number, Manufacturer, Serial Number, KVA, Remarks

import * as XLSX from 'xlsx';
import type { SaleRecord } from '../types';

type ExportRow = {
  Date: string;
  Supplier: string;
  'GST Number': string;
  'DC Number': string;
  Manufacturer: string;
  'Serial Number': string;
  KVA: number | '';
  Remarks: string;
};

function makeRows(data: SaleRecord[]): ExportRow[] {
  const rows: ExportRow[] = [];

  for (const rec of data) {
    const base = {
      Date: rec.date || '',
      Supplier: rec.supplier || '',
      'GST Number': rec.gstNumber || '',
      'DC Number': rec.dcNumber || '',
      Manufacturer: rec.manufacturer || '',
      Remarks: rec.remarks || '',
    };

    const items = Array.isArray(rec.items) ? rec.items : [];

    if (items.length === 0) {
      rows.push({
        ...base,
        'Serial Number': '',
        KVA: '',
      });
    } else {
      for (const it of items) {
        rows.push({
          ...base,
          'Serial Number': it.serialNumber || '',
          KVA: typeof it.kva === 'number' ? it.kva : Number(it.kva || 0),
        });
      }
    }
  }

  return rows;
}

export function exportToExcel(sales: SaleRecord[]) {
  const rows = makeRows(sales);

  // Build worksheet & workbook
  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales');

  // Optional: set column widths for readability
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 24 }, // Supplier
    { wch: 18 }, // GST Number
    { wch: 14 }, // DC Number
    { wch: 18 }, // Manufacturer
    { wch: 18 }, // Serial Number
    { wch: 8 },  // KVA
    { wch: 30 }, // Remarks
  ];
  (ws['!cols'] as any) = colWidths;

  // File name: Sales_YYYY-MM-DD.xlsx
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `Sales_${today}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
