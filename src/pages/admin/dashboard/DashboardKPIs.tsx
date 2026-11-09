import type { Invoice, RoomRecord, TenantRecord, Ticket } from "../../../types/index.ts";
import { useDormData } from "../../../hooks/useDormData.ts";
import { getRoomOccupancy } from "../../../utils/roomCalculations.ts";
import { money } from "../../../utils/formatters.ts";
import { revenueForPeriod } from "../../../utils/revenueForPeriod.ts";

function dateKey(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
    ? `${year}-${month}-${day}` : null;
}

export function DashboardKPIs({ invoices, rooms, tenants, tickets, period }: {
  invoices: Invoice[]; rooms: RoomRecord[]; tenants: TenantRecord[]; tickets: Ticket[]; period: string;
}) {
  const { contracts } = useDormData();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const occupancy = rooms.filter((room) => !room.deletedAt).map((room) => getRoomOccupancy(room, tenants, contracts));
  const total = occupancy.reduce((sum, item) => sum + item.total, 0);
  const occupied = occupancy.reduce((sum, item) => sum + item.occupied, 0);
  const debts = invoices.filter((invoice) => invoice.status === "Nợ");
  const invalidDates = debts.filter((invoice) => !dateKey(invoice.due)).length;
  const overdue = debts.filter((invoice) => { const due = dateKey(invoice.due); return due !== null && due < today; });
  const open = tickets.filter((ticket) => ticket.status !== "Hoàn thành").length;
  const revenue = revenueForPeriod(invoices, period);
  const cards = [
    { label: "Doanh thu kỳ vọng / đã thu", value: revenue ? `${money(revenue.expected)} / ${money(revenue.collected)}` : "Chưa đủ dữ liệu", detail: revenue ? `Kỳ hóa đơn ${period}` : `Kỳ ${period || "chưa chọn"}: hóa đơn thiếu kỳ hợp lệ.` },
    { label: "Tỷ lệ lấp đầy", value: total ? `${(occupied / total * 100).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%` : "Chưa có giường", detail: `${occupied}/${total} giường · hiện tại, gồm giường bảo trì trong mẫu số` },
    { label: "Công nợ quá hạn", value: invalidDates ? "Chưa đủ dữ liệu" : money(overdue.reduce((sum, invoice) => sum + invoice.amount, 0)), detail: invalidDates ? `${invalidDates} hóa đơn nợ thiếu ngày hạn hợp lệ · hiện tại` : `${overdue.length} hóa đơn nợ · hiện tại, không gồm chờ xác nhận` },
    { label: "Sự cố đang mở", value: String(open), detail: "Phiếu chưa hoàn thành · hiện tại" },
  ];
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <article key={card.label} className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs"><h2 className="text-sm font-semibold text-slate-600">{card.label}</h2><p className="mt-3 text-xl font-bold tabular-nums text-slate-950">{card.value}</p><p className="mt-2 text-xs text-slate-500">{card.detail}</p></article>)}</section>;
}
