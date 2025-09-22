import React from 'react'
import type { SaleRecord } from '../types'

type Props = {
  record: SaleRecord
  onClose: () => void
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12, padding: '6px 0' }}>
    <div className="muted">{k}</div>
    <div>{v}</div>
  </div>
)

const ViewModal: React.FC<Props> = ({ record, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={(e) => (e.target === e.currentTarget ? onClose() : null)}>
      <div className="modal">
        <header>
          <h2 style={{ margin: 0 }}>Record Details</h2>
        </header>
        <div style={{ padding: 16 }}>
          <Row k="Serial #" v={record.serial} />
          <Row k="Customer" v={record.customer} />
          <Row k="KVA" v={record.kva} />
          <Row k="Invoice #" v={record.invoiceNo} />
          <Row k="DC #" v={record.dcNo} />
          <Row k="Date" v={record.date} />
          <Row k="Contact" v={record.contact} />
          <Row k="Voltage Class" v={record.voltageClass} />
          <Row k="Manufacturer" v={record.manufacturer} />
          <Row k="GST No." v={record.gstNo || '—'} />
          <Row k="Sale Price" v={record.salePrice ?? '—'} />
          <Row k="Warranty" v={record.warranty || '—'} />
          <Row k="Remarks" v={record.remarks || '—'} />
        </div>
        <div className="actions">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewModal
