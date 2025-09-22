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
        <div className="actions-cell">Actions</div>
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

          <div className="actions-cell">
            <button
              className="btn-icon"
              onClick={() => onView(r)}
              aria-label="View details"
              title="View"
            >
              <img src="icons/view.png" alt="View" />
            </button>

            <button
              className="btn-icon warn"
              onClick={() => onEdit(r)}
              aria-label="Edit row"
              title="Edit"
            >
              <img src="icons/edit.png" alt="Edit" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SalesTable
