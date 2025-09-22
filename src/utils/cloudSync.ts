import type { SaleRecord } from '../types'
import { CLOUD_SYNC } from '../config'

export async function syncToGoogleSheet(records: SaleRecord[]) {
  if (!CLOUD_SYNC.enabled) throw new Error('Cloud sync is disabled')
  if (!CLOUD_SYNC.webAppUrl) throw new Error('Missing webAppUrl in config.ts')

  const payload = {
    action: 'appendRows',
    rows: records.map(r => ({
      serial: r.serial,
      customer: r.customer,
      kva: r.kva,
      invoiceNo: r.invoiceNo,
      dcNo: r.dcNo,
      date: r.date,
      contact: r.contact,
      voltageClass: r.voltageClass,
      manufacturer: r.manufacturer,
      gstNo: r.gstNo || '',
      salePrice: r.salePrice ?? '',
      warranty: r.warranty || '',
      remarks: r.remarks || ''
    }))
  }

  const res = await fetch(CLOUD_SYNC.webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text().catch(()=> '')
    throw new Error('Sync failed: ' + res.status + ' ' + text)
  }
  return res.json().catch(()=> ({}))
}
