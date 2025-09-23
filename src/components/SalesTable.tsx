import React, { useMemo, useState } from 'react';
import type { SaleRecord } from '../types';

type Props = {
  rows: SaleRecord[];
  onEdit: (rec: SaleRecord) => void;
  onDelete: (rec: SaleRecord) => void;
  onView?: (rec: SaleRecord) => void; // optional: if you have a view modal
};

export default function SalesTable({ rows, onEdit, onDelete, onView }: Props) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    // Search by any field EXCEPT manufacturer (as requested earlier)
    return rows.filter(r => {
      const hay = [
        r.date,
        r.supplier,
        r.gstNumber,
        r.dcNumber,
        r.remarks,
        ...(r.items || []).map(i => i.serialNumber),
        ...(r.items || []).map(i => String(i.kva)),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const manuf = (r.manufacturer || '').toLowerCase();
      return hay.includes(needle) && !manuf.includes(needle);
    });
  }, [rows, q]);

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <input
          className="search"
          placeholder="Search (date, supplier, GST, DC, serial, KVA, remarks)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="table-scroll">
        <table className="sales-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Supplier</th>
              <th>GST</th>
              <th>DC No.</th>
              <th>Manufacturer</th>
              <th>Items</th>
              <th style={{width: 160}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.supplier}</td>
                <td>{r.gstNumber}</td>
                <td>{r.dcNumber}</td>
                <td>{r.manufacturer}</td>
                <td>
                  {r.items?.length || 0} item(s)
                  {r.items?.length ? (
                    <details>
                      <summary>view</summary>
                      <ul className="items-list">
                        {r.items.map((it, i) => (
                          <li key={i}>
                            <strong>{it.serialNumber}</strong> — {it.kva} KVA
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-secondary" onClick={() => onEdit(r)}>Edit</button>
                    {onView ? (
                      <button className="btn" onClick={() => onView(r)}>View</button>
                    ) : null}
                    <button className="btn btn-danger" onClick={() => onDelete(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', opacity: 0.7 }}>
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
