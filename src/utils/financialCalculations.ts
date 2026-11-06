import type { Invoice, Ticket, FacilityExpense } from "../types/index.ts";

export function calculateFinancialSummary(
  invoices: Invoice[],
  tickets: Ticket[],
  facilityExpenses: FacilityExpense[] = [],
) {
  const uniqueInvoices = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const collectedRevenue = [...uniqueInvoices.values()]
    .filter((invoice) => invoice.status === "Đã thu" && invoice.payment)
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0);

  const uniqueRepairs = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const repairExpenses = [...uniqueRepairs.values()]
    .filter((ticket) => ticket.status === "Hoàn thành")
    .reduce((total, ticket) => total + (ticket.cost ?? 0), 0);

  const uniqueFacilityExpenses = new Map(facilityExpenses.map((exp) => [exp.id, exp]));
  const facilityTotal = [...uniqueFacilityExpenses.values()]
    .reduce((total, exp) => total + (exp.amount ?? 0), 0);

  const netProfit = collectedRevenue - repairExpenses - facilityTotal;

  return {
    collectedRevenue,
    repairExpenses,
    facilityTotal,
    profit: netProfit,
    netProfit,
  };
}
