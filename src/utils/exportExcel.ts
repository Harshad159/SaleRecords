import * as XLSX from 'xlsx'
import type { SaleRecord } from '../types'

export function exportToExcel(records: SaleRecord[], filename = 'sales.xlsx') {
  const rows = records.map(r => ({
    'Serial #': r.serial,
    Customer: r.customer,
    KVA: r.kva,
    'Invoice #': r.invoiceNo,
    'DC #': r.dcNo,
    Date: r.date,
    Contact: r.contact,
    'Voltage Class': r.voltageClass,
    Manufacturer: r.manufacturer,
    'GST No.': r.gstNo || '',
    'Sale Price': r.salePrice ?? '',
    'Warranty': r.warranty || '',
    Remarks: r.remarks || ''
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sales')
  XLSX.writeFile(wb, filename)
}
