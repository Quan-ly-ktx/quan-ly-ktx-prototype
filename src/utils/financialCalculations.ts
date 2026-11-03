import type { Invoice, Ticket } from "../types/index.ts";

export function calculateFinancialSummary(
  invoices: Invoice[],
  tickets: Ticket[],
) {
  const uniqueInvoices = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const collectedRevenue = [...uniqueInvoices.values()]
    .filter((invoice) => invoice.status === "Đã thu" && invoice.payment)
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0);

  const uniqueRepairs = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const repairExpenses = [...uniqueRepairs.values()]
    .filter((ticket) => ticket.status === "Hoàn thành")
    .reduce((total, ticket) => total + (ticket.cost ?? 0), 0);

  return {
    collectedRevenue,
    repairExpenses,
    profit: collectedRevenue - repairExpenses,
  };
}
