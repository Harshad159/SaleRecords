export type SaleRecord = {
  id: string;
  serial: string;
  kva: number;
  voltageClass: string;
  manufacturer: string;
  date: string; // ISO
  invoiceNo: string;
  dcNo: string;
  customer: string;
  contact: string;
  gstNo?: string;
  salePrice?: number;
  warranty?: string;
  remarks?: string;
};
