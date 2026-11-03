export type PaymentRecord = {
  amount: number;
  method: "Trực tuyến" | "Tiền mặt";
  paidAt: string;
  confirmedBy: string;
};

export type InvoiceStatus = "Đã thu" | "Nợ" | "Chờ xác nhận";

export type PaymentProof = {
  fileName: string;
  submittedAt: string;
};

export type Invoice = {
  id: string;
  tenant: string;
  room: string;
  bed: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
  payment?: PaymentRecord;
  proof?: PaymentProof;
  late?: number;
  kind?: string;
};

export type TenantInvoice = {
  id: string;
  month: string;
  amount: number;
  dueDate: string;
  status: "Chưa thanh toán" | "Chờ xác nhận" | "Đã thanh toán";
  late?: number;
  rent: number;
  electric: { old: number; cur: number; used: number; amount: number };
  water: { old: number; cur: number; used: number; amount: number };
  service: number;
  proof?: { name: string; time: string };
};
