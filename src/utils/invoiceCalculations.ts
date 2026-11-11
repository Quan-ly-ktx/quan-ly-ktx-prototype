import type { Invoice } from "../types/index.ts";

export function totalInvoiceDue(invoice: Invoice): number {
  return invoice.amount;
}
export function parseDueDate(due: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(due);
  if (!match) return /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function calculateOverdueDays(due: string, status: Invoice["status"], todayStr?: string): number {
  if (status !== "Nợ") return 0;
  const dueDateStr = parseDueDate(due);
  if (!dueDateStr) return 0;
  const today = todayStr ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (dueDateStr >= today) return 0;
  const dueTime = new Date(dueDateStr).getTime();
  const todayTime = new Date(today).getTime();
  return Math.max(1, Math.floor((todayTime - dueTime) / 86400000));
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
