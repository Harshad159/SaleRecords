import React from 'react';
import type { SaleRecord } from '../types';

type Props = {
  isOpen: boolean;
  record: SaleRecord | null;
  onClose: () => void;
};

export default function ViewModal({ isOpen, record, onClose }: Props) {
  if (!isOpen || !record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Dispatch Details</h2>

        <div className="view-grid">
          <div>
            <label>Date</label>
            <div>{record.date || '-'}</div>
          </div>

          <div>
            <label>Supplier</label>
            <div>{record.supplier || '-'}</div>
          </div>

          <div>
            <label>GST Number</label>
            <div>{record.gstNumber || '-'}</div>
          </div>

          <div>
            <label>DC Number</label>
            <div>{record.dcNumber || '-'}</div>
          </div>

          <div>
            <label>Manufacturer</label>
            <div>{record.manufacturer || '-'}</div>
          </div>

          <div className="full">
            <label>Remarks</label>
            <div style={{ whiteSpace: 'pre-wrap' }}>{record.remarks || '-'}</div>
          </div>
        </div>

        <div className="items-block">
          <h3>Transformers in this DC</h3>
          {record.items?.length ? (
            <table className="sales-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Serial Number</th>
                  <th>KVA</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{it.serialNumber || '-'}</td>
                    <td>{it.kva ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ opacity: 0.7 }}>No items</div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
