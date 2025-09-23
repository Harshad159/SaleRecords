import React, { useEffect, useMemo, useState } from 'react';
import AddSaleModal from './components/AddSaleModal';
import type { SaleRecord } from './types';
import { listSales, deleteSaleSecure } from './storage';

export default function App() {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<SaleRecord | null>(null);
  const [query, setQuery] = useState('');

  async function refresh() {
    try {
      setLoading(true);
      const data = await listSales();
      setRecords(data.sort((a, b) => (a.date < b.date ? 1 : -1)));
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError('Failed to load sales. Try clearing site data and reloading.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function openAdd() {
    setEditing(null);
    setIsAddOpen(true);
  }

  function openEdit(rec: SaleRecord) {
    setEditing(rec);
    setIsAddOpen(true);
  }

  async function onDelete(rec: SaleRecord) {
    const ok = window.confirm('Delete this record?');
    if (!ok) return;
    await deleteSaleSecure(rec.id);
    refresh();
  }

  // simple search across all fields (except manufacturer if you prefer to exclude)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const base =
        `${r.date} ${r.supplier} ${r.gstNumber} ${r.dcNumber} ${r.remarks}`.toLowerCase();
      const items = r.items.map(i => `${i.serialNumber} ${i.kva}`).join(' ').toLowerCase();
      // exclude manufacturer from search if needed:
      // const manufacturer = '';  // to exclude
      const manufacturer = r.manufacturer?.toLowerCase() ?? '';
      return (base + ' ' + manufacturer + ' ' + items).includes(q);
    });
  }, [records, query]);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Narsinha Sales</h1>
      </header>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAdd}>+ Add Dispatch</button>
        <input
          className="search"
          placeholder="Search (date, supplier, GST, DC, serial, KVA, remarks)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !filtered.length && !error && (
        <p className="muted">No records</p>
      )}

      {!loading && !!filtered.length && (
        <div className="table">
          <div className="thead">
            <div>Date</div>
            <div>Supplier</div>
            <div>GST</div>
            <div>DC No.</div>
            <div>Manufacturer</div>
            <div>Items</div>
            <div>Actions</div>
          </div>
          <div className="tbody">
            {filtered.map((r) => (
              <div className="tr" key={r.id}>
                <div>{r.date}</div>
                <div>{r.supplier}</div>
                <div>{r.gstNumber || '—'}</div>
                <div>{r.dcNumber}</div>
                <div>{r.manufacturer || '—'}</div>
                <div>
                  {r.items.map((it, i) => (
                    <span key={i} className="pill">
                      {it.serialNumber} • {it.kva} kVA
                    </span>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="btn btn-ghost" onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => onDelete(r)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddSaleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaved={refresh}
        editing={editing}
      />

      <footer className="footer-note">
        Data is stored locally on this device (IndexedDB). Works offline.
      </footer>
    </div>
  );
}
