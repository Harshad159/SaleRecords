import React from 'react'
import type { SaleRecord } from '../types'

type Props = {
  data: SaleRecord[]
  onView: (rec: SaleRecord) => void
  onEdit: (rec: SaleRecord) => void
}

const SalesTable: React.FC<Props> = ({ data, onView, onEdit }) => {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="row header">
        <div>Serial #</div>
        <div>Customer</div>
        <div>KVA</div>
        <div>Invoice #</div>
        <div>DC #</div>
        <div>Date</div>
        <div>Contact</div>
        <div>Actions</div>
      </div>

      {data.map((r) => (
        <div key={r.id} className="row">
          <div>{r.serial}</div>
          <div>{r.customer}</div>
          <div>{r.kva}</div>
          <div>{r.invoiceNo}</div>
          <div>{r.dcNo}</div>
          <div>{r.date}</div>
          <div
            className="muted"
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={r.contact}
          >
            {r.contact}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn secondary" onClick={() => onView(r)} aria-label="View details">
              View
            </button>
            <button className="btn" onClick={() => onEdit(r)} aria-label="Edit row">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SalesTable
