import type { FacilityExpense, Invoice, Ticket } from "../types/index.ts";
import { revenueForPeriod } from "./revenueForPeriod.ts";

type CompletedTicket = Ticket & { completedAt?: string; parts?: { name: string; quantity: number; unitCost: number }[] };

export function expenseMonth(value: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const local = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const year = Number(iso?.[1] ?? local?.[3]);
  const month = Number(iso?.[2] ?? local?.[2]);
  const day = Number(iso?.[3] ?? local?.[1]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!Number.isInteger(year) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function completionMonth(value: string | undefined): string | null {
  if (!value || !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit" }).formatToParts(date);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

export function reportForPeriod(invoices: Invoice[], tickets: CompletedTicket[], expenses: FacilityExpense[], period: string): { revenue: number; repairs: number; facility: number; difference: number } | null {
  const revenue = revenueForPeriod(invoices, period);
  const completed = tickets.filter((ticket) => ticket.status === "Hoàn thành");
  if (!revenue || expenses.some((expense) => !expenseMonth(expense.expenseDate)) || completed.some((ticket) => !completionMonth(ticket.completedAt) || !ticket.parts || ticket.parts.some((part) => !Number.isSafeInteger(part.quantity) || part.quantity <= 0 || !Number.isSafeInteger(part.unitCost) || part.unitCost < 0))) return null;
  const facility = expenses.filter((expense) => expenseMonth(expense.expenseDate) === period).reduce((sum, expense) => sum + expense.amount, 0);
  const repairs = completed.filter((ticket) => completionMonth(ticket.completedAt) === period).reduce((sum, ticket) => sum + (ticket.parts ?? []).reduce((total, part) => total + part.quantity * part.unitCost, 0), 0);
  return { revenue: revenue.collected, repairs, facility, difference: revenue.collected - repairs - facility };
}
