import React, { useState } from 'react'
import type { SaleRecord } from '../types'

type Props = {
  onClose: () => void
  onSave: (rec: SaleRecord) => void
  defaultDate?: string
}

const AddSaleModal: React.FC<Props> = ({ onClose, onSave, defaultDate }) => {
  const [form, setForm] = useState({
    serial: '',
    kva: 0,
    voltageClass: '11kV/415V',
    manufacturer: '',
    date: defaultDate || new Date().toISOString().slice(0,10),
    invoiceNo: '',
    dcNo: '',
    customer: '',
    contact: '',
    gstNo: '',
    salePrice: 0,
    warranty: '24 Months',
    remarks: ''
  })

  const update = (k: string, v: any) => setForm(prev => ({...prev, [k]: v}))

  const submit = () => {
    if (!form.serial || !form.customer) { alert('Serial and Customer are required'); return }
    const rec: SaleRecord = { id: cryptoRandom(), ...form, kva: Number(form.kva), salePrice: Number(form.salePrice) }
    onSave(rec)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={(e)=>{ if(e.target===e.currentTarget) onClose() }}>
      <div className="modal">
        <header>
          <h2 style={{margin:0}}>Add New Sales Record</h2>
        </header>
        <div style={{padding:16}}>
          <h3 className="muted" style={{marginBottom:8}}>Transformer Details</h3>
          <div className="grid">
            <div className="field">
              <label className="label">Serial Number</label>
              <input value={form.serial} onChange={e=>update('serial', e.target.value)} placeholder="e.g., T-12345" />
            </div>
            <div className="field">
              <label className="label">KVA Rating</label>
              <input type="number" value={form.kva} onChange={e=>update('kva', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Voltage Class</label>
              <input value={form.voltageClass} onChange={e=>update('voltageClass', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Manufacturer</label>
              <input value={form.manufacturer} onChange={e=>update('manufacturer', e.target.value)} />
            </div>
          </div>
          <h3 className="muted" style={{margin:'18px 0 8px'}}>Sale Details</h3>
          <div className="grid">
            <div className="field">
              <label className="label">Sale Date</label>
              <input type="date" value={form.date} onChange={e=>update('date', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Invoice Number</label>
              <input value={form.invoiceNo} onChange={e=>update('invoiceNo', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">DC No.</label>
              <input value={form.dcNo} onChange={e=>update('dcNo', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Customer Name</label>
              <input value={form.customer} onChange={e=>update('customer', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Customer Contact</label>
              <input value={form.contact} onChange={e=>update('contact', e.target.value)} placeholder="Email or Phone" />
            </div>
            <div className="field">
              <label className="label">GST No.</label>
              <input value={form.gstNo} onChange={e=>update('gstNo', e.target.value)} placeholder="e.g., 29ABCDE1234F1Z5" />
            </div>
            <div className="field">
              <label className="label">Sale Price</label>
              <input type="number" value={form.salePrice} onChange={e=>update('salePrice', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Warranty Period</label>
              <select value={form.warranty} onChange={e=>update('warranty', e.target.value)}>
                <option>12 Months</option>
                <option>18 Months</option>
                <option>24 Months</option>
                <option>36 Months</option>
              </select>
            </div>
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label className="label">Remarks</label>
              <textarea rows={4} value={form.remarks} onChange={e=>update('remarks', e.target.value)} placeholder="Any notes..." />
            </div>
          </div>
        </div>
        <div className="actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={submit}>Add Record</button>
        </div>
      </div>
    </div>
  )
}

function cryptoRandom() {
  return (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))
}

export default AddSaleModal
