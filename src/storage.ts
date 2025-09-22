import type { SaleRecord } from './types'

const KEY = 'salesRecords'

export function loadRecords(): SaleRecord[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return sampleData
  try {
    const arr = JSON.parse(raw) as SaleRecord[]
    return arr
  } catch {
    return sampleData
  }
}

export function saveRecords(recs: SaleRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(recs))
}

// Sample data similar to the screenshot
const sampleData: SaleRecord[] = [
  {
    id: cryptoRandom(),
    serial: 'T-12345',
    customer: 'Global Tech Inc.',
    kva: 500,
    invoiceNo: 'INV-2024-001',
    dcNo: 'DC-2024-001',
    date: '2024-07-28',
    voltageClass: '11kV/415V',
    manufacturer: 'Narsinha Engineering Works',
    contact: 'contact@globaltech.com',
    salePrice: 0,
    warranty: '24 Months',
    remarks: ''
  },
  {
    id: cryptoRandom(),
    serial: 'T-67890',
    customer: 'Apex Industries',
    kva: 750,
    invoiceNo: 'INV-2024-002',
    dcNo: 'DC-2024-002',
    date: '2024-07-29',
    voltageClass: '11kV/415V',
    manufacturer: 'Narsinha Engineering Works',
    contact: 'purchasing@apex.com',
    salePrice: 0,
    warranty: '24 Months',
    remarks: ''
  },
  {
    id: cryptoRandom(),
    serial: 'T-54321',
    customer: 'Downtown Mall',
    kva: 300,
    invoiceNo: 'INV-2024-003',
    dcNo: 'DC-2024-003',
    date: '2024-07-30',
    voltageClass: '11kV/415V',
    manufacturer: 'Narsinha Engineering Works',
    contact: 'manager@downtownmall.com',
    salePrice: 0,
    warranty: '24 Months',
    remarks: ''
  }
]

function cryptoRandom() {
  // Simple random id; in browser we have crypto.randomUUID
  return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))
}
