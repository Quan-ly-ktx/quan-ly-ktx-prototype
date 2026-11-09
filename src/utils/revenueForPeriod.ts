import type { Invoice } from "../types/invoice.ts";

export function revenueForPeriod(invoices: Invoice[], period: string): { expected: number; collected: number } | null {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
  if (invoices.some((invoice) => !invoice.billingPeriod || !/^\d{4}-(0[1-9]|1[0-2])-01$/.test(invoice.billingPeriod))) return null;
  return invoices.filter((invoice) => invoice.billingPeriod === `${period}-01`).reduce(
    (totals, invoice) => ({
      expected: totals.expected + invoice.amount,
      collected: totals.collected + (invoice.status === "Đã thu" ? invoice.amount : 0),
    }),
    { expected: 0, collected: 0 },
  );
}
