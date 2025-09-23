import React, { useEffect, useMemo, useState } from 'react';
import type { SaleRecord, SaleItem } from '../types';
import { addSale, updateSale, getGSTBySupplier } from '../storage';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;     // call after save to refresh table
  editing?: SaleRecord | null; // if provided, we edit instead of add
};

const emptyItem = (): SaleItem => ({ serialNumber: '', kva: 0 });

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
      // defaults for new entry
      const today = new Date();
      const iso = today.toISOString().slice(0, 10);
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

  // Auto-fill GST when supplier matches existing records.
  // We only overwrite GST if the field is empty (so user can change it if needed).
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!supplier.trim()) return;
      if (gstNumber.trim()) return; // respect user-entered value
      const found = await getGSTBySupplier(supplier.trim());
      if (!alive) return;
      if (found) {
        setGstNumber(found);
        setAutoGSTApplied(true);
      } else {
        setAutoGSTApplied(false);
      }
    })();
    return () => {
      alive = false;
    };
    // include gstNumber so we don't override if user typed one
  }, [supplier, gstNumber]);

  const addItemRow = () => setItems(prev => [...prev, emptyItem()]);
  const removeItemRow = (idx: number) => {
    setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [emptyItem()]);
  };

  const updateItemField = (idx: number, field: keyof SaleItem, value: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? {
      ...it,
      [field]: field === 'kva' ? Number(value || 0) : value
    } : it));
  };

  const canSave = useMemo(() => {
    if (!date || !supplier || !dcNumber || !manufacturer) return false;
    if (!items.length) return false;
    // at least one item with serialNumber
    if (!items.some(it => String(it.serialNumber).trim().length > 0)) return false;
    return true;
  }, [date, supplier, dcNumber, manufacturer, items]);

  async function handleSave() {
    const record: SaleRecord = {
      id: editing?.id || uuidv4(),
      date: date.trim(),
      supplier: supplier.trim(),
      gstNumber: gstNumber.trim(),
      dcNumber: dcNumber.trim(),
      manufacturer: manufacturer.trim(),
      items: items
        .filter(it => String(it.serialNumber).trim().length > 0)
        .map(it => ({ serialNumber: String(it.serialNumber).trim(), kva: Number(it.kva || 0) })),
      remarks: remarks.trim(),
    };

    if (isEditing) {
      await updateSale(record);
    } else {
      await addSale(record);
    }
    onSaved();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{isEditing ? 'Edit Dispatch' : 'Add Dispatch'}</h2>

        <div className="form-grid">
          <label>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>

          <label>
            Supplier
            <input
              type="text"
              placeholder="Supplier name"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
            />
          </label>

          <label>
            GST Number {autoGSTApplied && <small className="hint"> (auto-filled)</small>}
            <input
              type="text"
              placeholder="GSTIN"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
            />
          </label>

          <label>
            DC Number
            <input
              type="text"
              placeholder="DC / Challan"
              value={dcNumber}
              onChange={e => setDcNumber(e.target.value)}
            />
          </label>

          <label>
            Manufacturer
            <input
              type="text"
              placeholder="Manufacturer"
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
            />
          </label>

          <label className="full">
            Remarks
            <textarea
              placeholder="Optional"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
            />
          </label>
        </div>

        {/* Dynamic Items */}
        <div className="items-block">
          <div className="items-header">
            <h3>Transformers in this DC</h3>
            <button className="btn" onClick={addItemRow} type="button">+ Add Row</button>
          </div>

          <div className="items-rows">
            {items.map((it, idx) => (
              <div className="item-row" key={idx}>
                <div className="item-field">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    placeholder="Serial number"
                    value={it.serialNumber}
                    onChange={e => updateItemField(idx, 'serialNumber', e.target.value)}
                  />
                </div>
                <div className="item-field">
                  <label>KVA</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    placeholder="e.g. 100"
                    value={it.kva ?? 0}
                    onChange={e => updateItemField(idx, 'kva', e.target.value)}
                  />
                </div>
                <div className="item-actions">
                  <button className="btn btn-danger" type="button" onClick={() => removeItemRow(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} type="button" disabled={!canSave}>
            {isEditing ? 'Save Changes' : 'Add Dispatch'}
          </button>
        </div>
      </div>
    </div>
  );
}
