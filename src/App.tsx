import React, { useEffect, useState } from 'react';
import AddSaleModal from './components/AddSaleModal';
import SalesTable from './components/SalesTable';
import { getAllSales, addSale, updateSale, deleteSale, migrateFromLocalStorage } from './storage';
import type { SaleRecord } from './types';
import './styles.css';

export default function App() {
  const [rows, setRows] = useState<SaleRecord[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SaleRecord | null>(null);

  // Load (and migrate once) on first render
  useEffect(() => {
    (async () => {
      // Try migrating legacy localStorage data (safe no-op if none)
      await migrateFromLocalStorage();
      const all = await getAllSales();
      setRows(all);
    })();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSaved = async () => {
    const all = await getAllSales();
    setRows(all);
  };

  const handleEdit = (rec: SaleRecord) => {
    setEditing(rec);
    setModalOpen(true);
  };

  const handleDelete = async (rec: SaleRecord) => {
    const pwd = prompt('Enter password to delete:');
    if (pwd !== 'Narsinha@123') {
      alert('Wrong password. Delete cancelled.');
      return;
    }
    await deleteSale(rec.id);
    const all = await getAllSales();
    setRows(all);
  };

  const handleView = (rec: SaleRecord) => {
    // Simple quick view — you may already have a separate modal; hook it here if needed
    const lines = [
      `Date: ${rec.date}`,
      `Supplier: ${rec.supplier}`,
      `GST: ${rec.gstNumber}`,
      `DC No: ${rec.dcNumber}`,
      `Manufacturer: ${rec.manufacturer}`,
      `Items:`,
      ...(rec.items || []).map((it, i) => `  ${i + 1}. ${it.serialNumber} — ${it.kva} KVA`),
      rec.remarks ? `Remarks: ${rec.remarks}` : ''
    ].filter(Boolean);
    alert(lines.join('\n'));
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Narsinha Sales</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Dispatch</button>
        </div>
      </header>

      <SalesTable
        rows={rows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <AddSaleModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editing={editing}
      />
    </div>
  );
}
