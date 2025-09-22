import * as XLSX from 'xlsx'
import type { SaleRecord } from '../types'
import { loadRecords } from '../storage'

/**
 * Export sales to an Excel file.
 * - If `data` is provided (e.g., filtered array from UI), it uses that.
 * - If `data` is empty/undefined, it will fetch **all** records from IndexedDB.
 */
export async function exportToExcel(
  data: SaleRecord[] | undefined | null,
  filename: string = 'sales.xlsx'
) {
  let rows: SaleRecord[] = Array.isArray(data) && data.length ? data : await loadRecords()

  // Normalize rows (avoid undefined values in sheet)
  const safe = rows.map((r) => ({
    id: r.id,
    serial: r.serial ?? '',
    customer: r.customer ?? '',
    kva: r.kva ?? '',
    voltageClass: r.voltageClass ?? '',
    manufacturer: r.manufacturer ?? '',
    date: r.date ?? '',
    invoiceNo: r.invoiceNo ?? '',
    dcNo: r.dcNo ?? '',
    contact: r.contact ?? '',
    gstNo: r.gstNo ?? '',
    salePrice: r.salePrice ?? '',
    warranty: r.warranty ?? '',
    remarks: r.remarks ?? ''
  }))

  // Optional: choose column order & headers
  const headers = [
    ['ID', 'Serial #', 'Customer', 'KVA', 'Voltage Class', 'Manufacturer', 'Date', 'Invoice #', 'DC #', 'Contact', 'GST No.', 'Sale Price', 'Warranty', 'Remarks']
  ]
  const body = safe.map((r) => [
    r.id,
    r.serial,
    r.customer,
    r.kva,
    r.voltageClass,
    r.manufacturer,
    r.date,
    r.invoiceNo,
    r.dcNo,
    r.contact,
    r.gstNo,
    r.salePrice,
    r.warranty,
    r.remarks
  ])

  const ws = XLSX.utils.aoa_to_sheet([...headers, ...body])

  // Column widths (optional fine-tuning)
  ws['!cols'] = [
    { wch: 26 }, // ID
    { wch: 16 }, // Serial
    { wch: 24 }, // Customer
    { wch: 8 },  // KVA
    { wch: 16 }, // Voltage Class
    { wch: 18 }, // Manufacturer
    { wch: 12 }, // Date
    { wch: 14 }, // Invoice #
    { wch: 12 }, // DC #
    { wch: 24 }, // Contact
    { wch: 18 }, // GST No.
    { wch: 12 }, // Sale Price
    { wch: 14 }, // Warranty
    { wch: 30 }  // Remarks
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sales')

  XLSX.writeFile(wb, filename)
}
