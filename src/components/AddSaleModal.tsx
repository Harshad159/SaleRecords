import React, { useEffect, useMemo, useState } from 'react';
import type { SaleRecord, SaleItem } from '../types';
import { addSale, updateSale, getGSTBySupplier } from '../storage';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: SaleRecord | null;
};

const emptyItem = (): SaleItem => ({ serialNumber: '', kva: 0 });
const genId = () =>
  (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
    ? (crypto as any).randomUUID()
    : String(Date.now() + Math.random());

export default function AddSaleModal({ isOpen, onClose, onSaved, editing }: Props) {
  const isEditing = !!editing;

  const [date, setDate] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [dcNumber, setDcNumber] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [items, setItems] = useState<SaleItem[]>([emptyItem()]);
  const [remarks, setRemarks] = useState<string>('');
  const [autoGSTApplied, setAutoGSTApplied] = useState<boolean>(false);

  // Load values when opening / editing
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setDate(editing.date || '');
      setSupplier(editing.supplier || '');
      setGstNumber(editing.gstNumber || '');
      setDcNumber(editing.dcNumber || '');
      setManufacturer(editing.manufacturer || '');
      setItems(editing.items && editing.items.length ? editing.items : [emptyItem()]);
      setRemarks(editing.remarks || '');
      setAutoGSTApplied(false);
    } else {
      const iso = new Date().toISOString().slice(0, 10);
      setDate(iso);
      setSupplier('');
      setGstNumber('');
      setDcNumber('');
      setManufacturer('');
      setItems([emptyItem()]);
      setRemarks('');
      setAutoGSTApplied(false);
    }
  }, [isOpen, editing]);

  // Auto-fill GST for known supplier (if GST is blank)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supplier.trim()) return;
      if (gstNumber.trim()) return;
      const found = await getGSTBySupplier(supplier.trim());
      if (!alive) return;
      if (found) {
        setGstNumber(found);
        setAutoGSTApplied(true);
      } else {
        setAutoGSTApplied(false);
      }
    })();
    return () => { alive = false; };
  }, [supplier, gstNumber]);

  // Items (multiple rows)
  const addItemRow = () => setItems(prev => [...prev, emptyItem()]);
  const removeItemRow = (idx: number) =>
    setItems(prev => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyItem()]));
  const updateItemField = (idx: number, field: keyof SaleItem, value: string) =>
    setItems(prev =>
      prev.map((it, i) =>
        i === idx
          ? { ...it, [field]: field === 'kva' ? Number(value || 0) : value }
          : it
      )
    );

  const canSave = useMemo(() => {
    if (!date || !supplier.trim() || !dcNumber.trim()) return false;
    if (!items.length) return false;
    return items.every(it => it.serialNumber.trim() && it.kva >= 0);
  }, [date, supplier, dcNumber, items]);

  const handleSave = async () => {
    if (!canSave) return;

    const record: SaleRecord = {
      id: editing?.id ?? genId(),
      date,
      supplier: supplier.trim(),
      gstNumber: gstNumber.trim(),
      dcNumber: dcNumber.trim(),
      manufacturer: manufacturer.trim(),
      items: items.map(i => ({
        serialNumber: i.serialNumber.trim(),
        kva: Number(i.kva || 0),
      })),
      remarks: remarks.trim(),
    };

    if (isEditing) await updateSale(record);
    else await addSale(record);

    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{isEditing ? 'Edit Dispatch' : 'Add New Sales Record'}</h2>

        <div className="form-grid">
          <div className="full">
            <label>Sale Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label>DC No.</label>
            <input
              placeholder="e.g., DC-2025-001"
              value={dcNumber}
              onChange={(e) => setDcNumber(e.target.value)}
            />
          </div>

          <div>
            <label>Customer / Supplier</label>
            <input
              placeholder="e.g., Global Tech Inc."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          <div>
            <label>GST No. {autoGSTApplied && <span className="hint">(auto-filled)</span>}</label>
            <input
              placeholder="e.g., 29ABCDE1234F1Z5"
              value={gstNumber}
              onChange={(e) => { setGstNumber(e.target.value); setAutoGSTApplied(false); }}
            />
          </div>

          <div>
            <label>Manufacturer</label>
            <input
              placeholder="e.g., Narsinha Engineering Works"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
          </div>

          <div className="full">
            <label>Remarks</label>
            <textarea
              rows={3}
              placeholder="Optional notes…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* MULTI-ITEM BLOCK */}
        <div className="items-block">
          <div className="items-header">
            <h3>Transformers in this DC</h3>
            <button className="btn btn-primary" type="button" onClick={addItemRow}>
              + Add Row
            </button>
          </div>

          <div className="items-rows">
            {items.map((it, idx) => (
              <div className="item-row" key={idx}>
                <div className="item-field">
                  <label>Serial Number</label>
                  <input
                    placeholder="e.g., T-12345"
                    value={it.serialNumber}
                    onChange={(e) => updateItemField(idx, 'serialNumber', e.target.value)}
                  />
                </div>

                <div className="item-field">
                  <label>KVA Rating</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={Number(it.kva) || 0}
                    onChange={(e) => updateItemField(idx, 'kva', e.target.value)}
                  />
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    title="Remove this row"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Add Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
