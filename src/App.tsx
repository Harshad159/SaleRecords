import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import SalesTable from './components/SalesTable'
import AddSaleModal from './components/AddSaleModal'
import ViewModal from './components/ViewModal'
import Splash from './components/Splash'
import { loadRecords, saveRecords } from './storage'
import type { SaleRecord } from './types'
import { exportToExcel } from './utils/exportExcel'
import { CLOUD_SYNC } from './config'

const PASSWORD = 'Narsinha@123'

const App: React.FC = () => {
  const [records, setRecords] = useState<SaleRecord[]>(() => loadRecords())
  const [q, setQ] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const [viewing, setViewing] = useState<SaleRecord | null>(null)
  const [editing, setEditing] = useState<SaleRecord | null>(null)

  const [showSplash, setShowSplash] = useState(true)

  // Persist to localStorage
  useEffect(() => {
    saveRecords(records)
  }, [records])

  // Splash (cosmetic)
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1200)
    return () => clearTimeout(t)
  }, [])

  // 🔎 Search across all fields EXCEPT 'manufacturer'
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return records
    return records.filter((r) => {
      return [
        r.serial,
        r.customer,
        r.kva?.toString(),
        r.invoiceNo,
        r.dcNo,
        r.date,
        r.contact,
        r.voltageClass,
        // r.manufacturer,   <-- intentionally NOT searchable per your request
        r.gstNo,
        r.warranty,
        r.remarks,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    })
  }, [q, records])

  const addRecord = (rec: SaleRecord) => setRecords((prev) => [rec, ...prev])
  const saveEdited = (rec: SaleRecord) =>
    setRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)))

  const deleteRecord = (rec: SaleRecord) => {
    const ok = window.confirm(`Delete "${rec.serial}" for ${rec.customer}? This cannot be undone.`)
    if (!ok) return
    const pwd = window.prompt('Enter delete password:')
    if (pwd !== PASSWORD) {
      alert('Incorrect password.')
      return
    }
    setRecords((prev) => prev.filter((r) => r.id !== rec.id))
    alert('Record deleted.')
  }

  return (
    <div>
      {showSplash && <Splash />}

      <div className="brand">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#ffb400,#ffdd80)',
            display: 'grid',
            placeItems: 'center',
            color: '#0b1620',
            fontWeight: 900,
          }}
        >
          N
        </div>
        <div style={{ display: 'grid' }}>
          <h1>
            NARSINHA <span className="pill">power for all</span>
          </h1>
          <div className="muted" style={{ fontSize: 12, marginTop: -6 }}>
            Engineering Works
          </div>
        </div>
      </div>

      <div className="container">
        <div className="title">Sales Overview</div>

        <div className="toolbar" style={{ marginBottom: 16, justifyContent: 'space-between' }}>
          <div className="search" style={{ flex: 1, maxWidth: 520 }}>
            <span className="search-icon">🔎</span>
            <input
              placeholder="Search records by any field..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => setShowAdd(true)}>
              + Add Sale
            </button>
            <button className="btn secondary" onClick={() => exportToExcel(filtered, 'sales.xlsx')}>
              ⬇ Export to Excel
            </button>
            {CLOUD_SYNC.enabled && <button className="btn ghost">☁︎ Sync to Cloud</button>}
          </div>
        </div>

        <SalesTable
          data={filtered}
          onView={(rec) => setViewing(rec)}
          onEdit={(rec) => setEditing(rec)}
          onDelete={deleteRecord}
        />

        <div className="footer">
          Data is stored locally in your browser (localStorage). This is a PWA and works offline.
        </div>
      </div>

      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} onSave={addRecord} />}
      {viewing && <ViewModal record={viewing} onClose={() => setViewing(null)} />}
      {editing && (
        <AddSaleModal
          editOf={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdited}
          defaultDate={editing.date}
        />
      )}
    </div>
  )
}

export default App
