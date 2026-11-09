import { useState } from "react";
import { Button, Drawer } from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { useDormData } from "../../../hooks/useDormData.ts";
import type { Invoice } from "../../../types/invoice.ts";
import { card, th, rowCls, Badge, type Toast } from "../common.tsx";

const floors = [
  { f: "Tầng 1", used: 34, total: 40 },
  { f: "Tầng 2", used: 38, total: 40 },
  { f: "Tầng 3", used: 36, total: 40 },
  { f: "Tầng 4", used: 27, total: 40 },
  { f: "Tầng 5", used: 22, total: 40 },
];


export function DashboardInsights({
  records,
  showToast,
}: Toast & { records: Invoice[] }) {
  const { tenants } = useDormData();
  const [debtor, setDebtor] = useState<Invoice | null>(null);
  const debtors = records.filter((invoice) => invoice.status !== "Đã thu");

  return (
    <>
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <section className={`${card} p-6`}>
          <h2 className="font-heading text-lg font-bold text-slate-950">
            Lấp đầy theo tầng
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Giường đang có người ở / tổng giường
          </p>
          <ul className="grid gap-4">
            {floors.map((f) => {
              const pct = Math.round((f.used / f.total) * 100);
              return (
                <li key={f.f}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{f.f}</span>
                    <span className="font-mono text-xs text-slate-500">
                      {f.used}/{f.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-slate-100">
                    <div
                      className={`h-full rounded-sm ${
                        pct >= 90
                          ? "bg-danger-500"
                          : pct >= 75
                            ? "bg-brand-500"
                            : "bg-success-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={`${card} xl:col-span-2`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Người thuê đang nợ
            </h2>
            <Badge tone="danger">{debtors.length} khách</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Phòng</th>
                  <th className={th}>Hóa đơn</th>
                  <th className={`${th} text-right`}>Tiền nợ</th>
                  <th className={th}>Hạn nộp</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map((d) => (
                  <tr
                    key={d.id}
                    className={`${rowCls} cursor-pointer`}
                    onClick={() => setDebtor(d)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {d.tenant}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tenants.find((tenant) => tenant.id === d.tenantId)?.phone ?? ""}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {d.room}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {d.id}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {money(d.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {d.due}{d.late ? ` (trễ ${d.late} ngày)` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {debtor && (
        <Drawer
          title={debtor.tenant}
          subtitle={`${debtor.id} · ${tenants.find((tenant) => tenant.id === debtor.tenantId)?.phone ?? ""}`}
          onClose={() => setDebtor(null)}
        >
          <Badge tone="danger">
            Nợ{debtor.late ? ` · trễ ${debtor.late} ngày` : ""}
          </Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Phòng / Giường", `${debtor.room} · ${debtor.bed}`],
              ["Khoản thu", debtor.kind ?? "Tiền phòng tháng 10"],
              ["Hạn thanh toán", debtor.due],
              ["Số tiền", money(debtor.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 bg-slate-50 px-4 py-4">
              <dt className="font-semibold text-slate-700">Tổng nợ</dt>
              <dd className="font-heading text-lg font-bold text-danger-600">
                {money(debtor.amount)}
              </dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-2">
            <Button
              label="Nhắc nợ"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                showToast(`Đã nhắc nợ ${debtor.tenant}`);
                setDebtor(null);
              }}
            >
              Gửi nhắc nợ
            </Button>
            <Button
              label="Đóng"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setDebtor(null)}
            >
              Đóng
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
