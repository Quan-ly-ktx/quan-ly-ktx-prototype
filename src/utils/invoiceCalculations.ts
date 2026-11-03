import type { Invoice } from "../types/index.ts";

export function totalInvoiceDue(invoice: Invoice): number {
  return invoice.amount + (invoice.late ? invoice.late * 5000 : 0);
}

export function confirmCashPayment(
  invoice: Invoice,
  manager: string,
  paidAt: string,
): Invoice {
  if (invoice.status === "Đã thu" || invoice.payment) {
    throw new Error("Hóa đơn đã được xác nhận thanh toán");
  }
  if (!manager.trim()) {
    throw new Error("Thiếu người xác nhận thanh toán");
  }
  return {
    ...invoice,
    status: "Đã thu",
    payment: {
      amount: totalInvoiceDue(invoice),
      method: "Tiền mặt",
      paidAt,
      confirmedBy: manager.trim(),
    },
  };
}
