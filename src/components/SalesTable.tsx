import React from 'react'
import type { SaleRecord } from '../types'

type Props = {
  data: SaleRecord[]
  onView: (rec: SaleRecord) => void
  onEdit: (rec: SaleRecord) => void
  onDelete: (rec: SaleRecord) => void
}

const SalesTable: React.FC<Props> = ({ data, onView, onEdit, onDelete }) => {
  return (
    <div className="records">
      {/* Desktop table header */}
      <div className="row header desktop-only">
        <div>Serial #</div>
        <div>Customer</div>
        <div>KVA</div>
        <div>Invoice #</div>
        <div>DC #</div>
        <div>Date</div>
        <div>Contact</div>
        <div className="actions-cell">Actions</div>
      </div>

      {data.map((r) => (
        <div key={r.id} className="row responsive-card">
          {/* ===== Phone card header ===== */}
          <div className="card-head mobile-only">
            <div className="card-title">
              <span className="serial">{r.serial}</span>
              {r.kva ? <span className="badge kvabadge">{r.kva} kVA</span> : null}
            </div>
            <div className="customer">{r.customer}</div>
          </div>

          {/* ===== Desktop cells (hidden on phone) ===== */}
          <div className="cell desktop-only">{r.serial}</div>
          <div className="cell desktop-only">{r.customer}</div>
          <div className="cell desktop-only">{r.kva}</div>
          <div className="cell desktop-only">{r.invoiceNo}</div>
          <div className="cell desktop-only">{r.dcNo}</div>
          <div className="cell desktop-only">{r.date}</div>
          <div className="cell desktop-only muted" title={r.contact}>
            {r.contact}
          </div>

          {/* ===== Phone card body ===== */}
          <div className="card-body mobile-only">
            <div className="pair"><span>Invoice #</span><strong>{r.invoiceNo || '—'}</strong></div>
            <div className="pair"><span>DC #</span><strong>{r.dcNo || '—'}</strong></div>
            <div className="pair"><span>Date</span><strong>{r.date || '—'}</strong></div>
            <div className="pair"><span>Contact</span><strong className="ellipsis">{r.contact || '—'}</strong></div>
          </div>

          {/* ===== Actions ===== */}
          <div className="actions-cell">
            <button className="btn-small" onClick={() => onView(r)} aria-label="View">View</button>
            <button className="btn-small warn" onClick={() => onEdit(r)} aria-label="Edit">Edit</button>
            <button className="btn-small danger" onClick={() => onDelete(r)} aria-label="Delete">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SalesTable
