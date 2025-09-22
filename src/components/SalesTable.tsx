import React from 'react'
import type { SaleRecord } from '../types'

type Props = {
  data: SaleRecord[]
}

const SalesTable: React.FC<Props> = ({ data }) => {
  return (
    <div style={{display:'grid', gap:8}}>
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
      {data.map(r => (
        <div key={r.id} className="row">
          <div>{r.serial}</div>
          <div>{r.customer}</div>
          <div>{r.kva}</div>
          <div>{r.invoiceNo}</div>
          <div>{r.dcNo}</div>
          <div>{r.date}</div>
          <div className="muted" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.contact}</div>
          <div><span className="badge">View</span></div>
        </div>
      ))}
    </div>
  )
}

export default SalesTable
