import { useState } from "react";
import { Button } from "../../../components/common/index.ts";
import { useDormData } from "../../../hooks/index.ts";
import type { Invoice, QuickKind } from "../../../types/index.ts";
import { DashboardKPIs } from "./DashboardKPIs.tsx";

export function DashboardPage({ invoices, onNavigate }: {
  invoices: Invoice[];
  onNavigate: (nav: string) => void;
  onOpenQuick: (kind: QuickKind) => void;
  showToast: (msg: string) => void;
}) {
  const { rooms, tenants, tickets, loading } = useDormData();
  const [period, setPeriod] = useState(() => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit",
  }).format(new Date()));

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Bảng điều khiển</h1>
          <p className="mt-2 text-sm text-slate-500">Tổng quan dữ liệu hiện có tại thời điểm xem.</p>
        </div>
        <label className="text-sm font-semibold">Kỳ doanh thu
          <input className="ml-2 rounded border border-slate-300 p-2" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
        </label>
      </header>
      {loading ? <p>Đang tải dữ liệu…</p> : <DashboardKPIs invoices={invoices} rooms={rooms} tenants={tenants} tickets={tickets} period={period} />}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="rounded border border-slate-300 px-4 py-2" onClick={() => onNavigate("Hóa đơn")}>Xem hóa đơn</Button>
        <Button className="rounded border border-slate-300 px-4 py-2" onClick={() => onNavigate("Sự cố & kỷ luật")}>Xem sự cố</Button>
        <Button className="rounded border border-slate-300 px-4 py-2" onClick={() => onNavigate("Tài chính")}>Xem tài chính</Button>
      </div>
    </>
  );
}
