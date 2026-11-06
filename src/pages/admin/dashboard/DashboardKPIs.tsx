import { Icon } from "../../../components/common/Icon.tsx";
import type { IconName } from "../../../types/shared.ts";

export const kpis = [
  {
    label: "Tỷ lệ lấp đầy",
    value: "87,7%",
    detail: "158 / 180 giường",
    change: "+3,2%",
    icon: "bed" as IconName,
    tone: "brand",
  },
  {
    label: "Doanh thu tháng 10",
    value: "145,2 tr",
    detail: "Đã thu 94,4 triệu",
    change: "+8,4%",
    icon: "wallet" as IconName,
    tone: "success",
  },
  {
    label: "Công nợ quá hạn",
    value: "18,4 tr",
    detail: "12 người thuê",
    change: "Cần xử lý",
    icon: "receipt" as IconName,
    tone: "danger",
  },
  {
    label: "Sự cố chờ xử lý",
    value: "4 phiếu",
    detail: "2 phiếu mới hôm nay",
    change: "Mới hôm nay",
    icon: "tools" as IconName,
    tone: "warning",
  },
];

export function DashboardKPIs() {
  return (
    <section
      aria-label="Chỉ số vận hành"
      className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {kpis.map((kpi) => (
        <article
          className="group rounded-sm border border-slate-200 bg-white p-4.5 shadow-xs transition-all hover:border-slate-300"
          key={kpi.label}
        >
          <div className="mb-5 flex items-start justify-between">
            <span className={`icon-box icon-box-${kpi.tone}`}>
              <Icon name={kpi.icon} />
            </span>
            <span className={`status-label status-label-${kpi.tone}`}>
              {kpi.tone === "brand" || kpi.tone === "success" ? (
                <Icon name="trend" className="size-3.5" />
              ) : null}
              {kpi.change}
            </span>
          </div>
          <div className="text-sm font-medium text-slate-500">{kpi.label}</div>
          <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900">
            {kpi.value}
          </div>
          <div className="mt-2 text-sm text-slate-500">{kpi.detail}</div>
        </article>
      ))}
    </section>
  );
}
