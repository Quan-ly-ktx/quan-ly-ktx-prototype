export type PaymentRecord = {
  amount: number;
  method: "Trực tuyến" | "Tiền mặt";
  paidAt: string;
  confirmedBy: string;
  confirmedByStaffId?: string;
};

export type InvoiceStatus = "Đã thu" | "Nợ" | "Chờ xác nhận";

export type PaymentProof = {
  fileName: string;
  submittedAt: string;
  dataUrl?: string;
};

export type Invoice = {
  id: string;
  tenantId?: string;
  contractId: string;
  billingPeriod: string;
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

export type FacilityExpenseCategory = "Điện EVN" | "Nước" | "Internet" | "Lương nhân viên" | "Khác";

export type FacilityExpense = {
  id: string;
  category: FacilityExpenseCategory;
  title: string;
  amount: number;
  expenseDate: string;
  invoiceCode?: string;
  receiptImage?: string;
  note?: string;
  createdAt?: string;
};
