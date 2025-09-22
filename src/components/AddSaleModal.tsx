import React, { useEffect, useState } from 'react'
import type { SaleRecord } from '../types'

type Props = {
  onClose: () => void
  onSave: (rec: SaleRecord) => void
  defaultDate?: string
  // if provided → we are editing this record
  editOf?: SaleRecord | null
}

const AddSaleModal: React.FC<Props> = ({ onClose, onSave, defaultDate, editOf }) => {
  const isEdit = !!editOf

  const [form, setForm] = useState({
    serial: '',
    kva: 0,
    voltageClass: '11kV/415V',
    manufacturer: '',
    date: defaultDate || new Date().toISOString().slice(0, 10),
    invoiceNo: '',
    dcNo: '',
    customer: '',
    contact: '',
    gstNo: '',
    salePrice: 0,
    warranty: '24 Months',
    remarks: '',
  })

  useEffect(() => {
    if (editOf) {
      setForm({
        serial: editOf.serial || '',
        kva: Number(editOf.kva) || 0,
        voltageClass: editOf.voltageClass || '11kV/415V',
        manufacturer: editOf.manufacturer || '',
        date: editOf.date || new Date().toISOString().slice(0, 10),
        invoiceNo: editOf.invoiceNo || '',
        dcNo: editOf.dcNo || '',
        customer: editOf.customer || '',
        contact: editOf.contact || '',
        gstNo: editOf.gstNo || '',
        salePrice: Number(editOf.salePrice ?? 0),
        warranty: editOf.warranty || '24 Months',
        remarks: editOf.remarks || '',
      })
    }
  }, [editOf])

  const update = (k: string, v: any) => setForm((prev) => ({ ...prev, [k]: v }))

  const submit = () => {
    if (!form.serial || !form.customer) {
      alert('Serial and Customer are required')
      return
    }
    const base = {
      ...form,
      kva: Number(form.kva),
      salePrice: Number(form.salePrice),
    }

    const rec: SaleRecord = isEdit
      ? { ...(editOf as SaleRecord), ...base }
      : { id: cryptoRandom(), ...base }

    onSave(rec)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={(e) => (e.target === e.currentTarget ? onClose() : null)}>
      <div className="modal">
        <header>
          <h2 style={{ margin: 0 }}>{isEdit ? 'Edit Sales Record' : 'Add New Sales Record'}</h2>
        </header>

        <div style={{ padding: 16 }}>
          <h3 className="muted" style={{ marginBottom: 8 }}>
            Transformer Details
          </h3>
          <div className="grid">
            <Field label="Serial Number">
              <input value={form.serial} onChange={(e) => update('serial', e.target.value)} placeholder="e.g., T-12345" />
            </Field>
            <Field label="KVA Rating">
              <input type="number" value={form.kva} onChange={(e) => update('kva', e.target.value)} />
            </Field>
            <Field label="Voltage Class">
              <input value={form.voltageClass} onChange={(e) => update('voltageClass', e.target.value)} />
            </Field>
            <Field label="Manufacturer">
              <input value={form.manufacturer} onChange={(e) => update('manufacturer', e.target.value)} />
            </Field>
          </div>

          <h3 className="muted" style={{ margin: '18px 0 8px' }}>
            Sale Details
          </h3>
          <div className="grid">
            <Field label="Sale Date">
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
            </Field>
            <Field label="Invoice Number">
              <input value={form.invoiceNo} onChange={(e) => update('invoiceNo', e.target.value)} />
            </Field>
            <Field label="DC No.">
              <input value={form.dcNo} onChange={(e) => update('dcNo', e.target.value)} />
            </Field>
            <Field label="Customer Name">
              <input value={form.customer} onChange={(e) => update('customer', e.target.value)} />
            </Field>
            <Field label="Customer Contact">
              <input value={form.contact} onChange={(e) => update('contact', e.target.value)} placeholder="Email or Phone" />
            </Field>
            <Field label="GST No.">
              <input value={form.gstNo} onChange={(e) => update('gstNo', e.target.value)} placeholder="e.g., 29ABCDE1234F1Z5" />
            </Field>
            <Field label="Sale Price">
              <input type="number" value={form.salePrice} onChange={(e) => update('salePrice', e.target.value)} />
            </Field>
            <Field label="Warranty Period">
              <select value={form.warranty} onChange={(e) => update('warranty', e.target.value)}>
                <option>12 Months</option>
                <option>18 Months</option>
                <option>24 Months</option>
                <option>36 Months</option>
              </select>
            </Field>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Remarks</label>
              <textarea rows={4} value={form.remarks} onChange={(e) => update('remarks', e.target.value)} placeholder="Any notes..." />
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={submit}>
            {isEdit ? 'Save Changes' : 'Add Record'}
          </button>
        </div>
      </div>
    </div>
  )
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="field">
    <label className="label">{label}</label>
    {children}
  </div>
)

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export default AddSaleModal
