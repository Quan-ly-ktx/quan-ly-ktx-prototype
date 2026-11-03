import { useState } from "react";
import { Button, Icon, Select } from "../../../components/common/index.ts";
import { DashboardKPIs } from "./DashboardKPIs.tsx";
import { DashboardCharts } from "./DashboardCharts.tsx";
import { DashboardInsights } from "./DashboardInsights.tsx";
import type { Invoice, QuickKind } from "../../../types/index.ts";
import type { IconName } from "../../../types/shared.ts";

const alerts = [
  {
    title: "Hóa đơn quá hạn trên 5 ngày",
    detail: "12 người thuê · 18.400.000 đ",
    time: "Cập nhật 10 phút trước",
    icon: "receipt" as IconName,
    tone: "danger",
  },
  {
    title: "Rò rỉ nước tại phòng P.401",
    detail: "Phiếu mới · Chưa phân công",
    time: "Đã chờ 35 phút",
    icon: "droplet" as IconName,
    tone: "warning",
  },
  {
    title: "5 vị trí thuê còn trống",
    detail: "Sẵn sàng gán cho người thuê mới",
    time: "Cập nhật hôm nay",
    icon: "clipboard" as IconName,
    tone: "brand",
  },
];

const quickActions: {
  kind?: QuickKind;
  nav?: string;
  label: string;
  helper: string;
  icon: IconName;
  tone: string;
}[] = [
  {
    nav: "Người thuê",
    label: "Thêm người thuê",
    helper: "Tạo hồ sơ và gán phòng",
    icon: "clipboard" as IconName,
    tone: "brand",
  },
  {
    kind: "dispatch" as QuickKind,
    label: "Phân công thợ",
    helper: "4 phiếu chờ xử lý",
    icon: "tools" as IconName,
    tone: "info",
  },
  {
    kind: "receipt" as QuickKind,
    label: "Tạo phiếu thu",
    helper: "Ghi nhận thanh toán",
    icon: "receipt" as IconName,
    tone: "success",
  },
  {
    kind: "report" as QuickKind,
    label: "Lập biên bản",
    helper: "Sự cố hoặc vi phạm",
    icon: "file" as IconName,
    tone: "warning",
  },
];

const recentPayments = [
  {
    name: "Nguyễn Minh Anh",
    room: "P.302 · G02",
    amount: "1.525.000 đ",
    status: "Đã thanh toán",
    time: "09:42",
  },
  {
    name: "Trần Quốc Bảo",
    room: "P.205 · G04",
    amount: "1.460.000 đ",
    status: "Đã thanh toán",
    time: "09:18",
  },
  {
    name: "Lê Hoàng Nam",
    room: "P.401 · G01",
    amount: "1.595.000 đ",
    status: "Chờ đối soát",
    time: "08:55",
  },
];

export function DashboardPage({
  invoices,
  onNavigate,
  onOpenQuick,
  showToast,
}: {
  invoices: Invoice[];
  onNavigate: (nav: string) => void;
  onOpenQuick: (kind: QuickKind) => void;
  showToast: (msg: string) => void;
}) {
  const [month, setMonth] = useState("Tháng 10/2026");
  const [floorFilter, setFloorFilter] = useState("Tất cả tầng");

  return (
    <>
      <section className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Tổng quan</span>
            <Icon name="chevron" className="size-3.5" />
            <span className="font-medium text-slate-700">Bảng điều khiển</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Chào buổi sáng, chị Lan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Đây là tình hình vận hành cơ sở cho thuê hôm nay, 24 tháng 10.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            label="Chọn thời gian báo cáo"
            value={month}
            options={["Tháng 10/2026", "Tháng 09/2026", "Tháng 08/2026"]}
            onChange={setMonth}
          />
          <Select
            label="Chọn tầng"
            value={floorFilter}
            options={["Tất cả tầng", "Tầng 1", "Tầng 2", "Tầng 3"]}
            onChange={setFloorFilter}
          />
          <Button
            className="flex h-10 items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => showToast("Đã xuất báo cáo tháng 10 (PDF)")}
          >
            <Icon name="report" className="size-4" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
        </div>
      </section>

      <DashboardKPIs />
      <DashboardCharts onNavigate={onNavigate} />

      <section className="mb-6 grid gap-6 xl:grid-cols-3">
        <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Cần xử lý hôm nay
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Các tác vụ cần chị ưu tiên theo dõi
              </p>
            </div>
            <Button
              className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
              onClick={() => onNavigate("Sự cố & kỷ luật")}
            >
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <Button
                key={alert.title}
                className="group flex w-full items-center gap-3 rounded-sm border border-transparent p-2.5 text-left hover:border-slate-200 hover:bg-slate-50"
                onClick={() =>
                  onNavigate(
                    alert.title.includes("Hóa đơn")
                      ? "Hóa đơn"
                      : alert.title.includes("Rò rỉ")
                        ? "Sự cố & kỷ luật"
                        : "Người thuê",
                  )
                }
              >
                <span className={`icon-box icon-box-${alert.tone} shrink-0`}>
                  <Icon name={alert.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    {alert.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {alert.detail}
                  </span>
                </span>
                <span className="hidden text-xs text-slate-400 md:block">
                  {alert.time}
                </span>
                <Icon
                  name="chevron"
                  className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                />
              </Button>
            ))}
          </div>
        </article>

        <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-heading text-lg font-bold text-slate-900">
            Thao tác nhanh
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Truy cập nghiệp vụ thường dùng
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                className="group rounded-sm border border-slate-200 p-3 text-left hover:border-brand-500 hover:bg-brand-50 active:translate-y-[1px] transition-all"
                onClick={() => {
                  if (action.nav) onNavigate(action.nav);
                  else if (action.kind) onOpenQuick(action.kind);
                }}
              >
                <span className={`icon-box icon-box-${action.tone} mb-3 size-9`}>
                  <Icon name={action.icon} className="size-4" />
                </span>
                <span className="block text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-700">
                  {action.label}
                </span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">
                  {action.helper}
                </span>
              </Button>
            ))}
          </div>
        </article>
      </section>

      <DashboardInsights records={invoices} showToast={showToast} />

      <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Thanh toán gần đây
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Giao dịch VietQR được ghi nhận trong hôm nay
            </p>
          </div>
          <Button
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            onClick={() => onNavigate("Hóa đơn")}
          >
            Xem hóa đơn
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Người thuê</th>
                <th className="px-6 py-3">Phòng / Giường</th>
                <th className="px-6 py-3">Số tiền</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.map((payment) => (
                <tr
                  className="transition-colors hover:bg-slate-50"
                  key={payment.name}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-sm bg-slate-100 font-mono text-xs font-semibold text-slate-700">
                        {payment.name
                          .split(" ")
                          .slice(-2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {payment.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-600">
                    {payment.room}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        payment.status === "Chờ đối soát"
                          ? "status-label status-label-warning"
                          : "status-label status-label-success"
                      }
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {payment.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
