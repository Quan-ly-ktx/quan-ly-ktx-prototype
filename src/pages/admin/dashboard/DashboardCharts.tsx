import { Button } from "../../../components/common/Button.tsx";
import { Icon } from "../../../components/common/Icon.tsx";

export const revenue = [
  { month: "T5", value: "112", height: "bar-56" },
  { month: "T6", value: "120", height: "bar-62" },
  { month: "T7", value: "116", height: "bar-59" },
  { month: "T8", value: "132", height: "bar-72" },
  { month: "T9", value: "138", height: "bar-79" },
  { month: "T10", value: "145", height: "bar-88" },
];

export function DashboardCharts({ onNavigate }: { onNavigate: (nav: string) => void }) {
  return (
    <section className="mb-6 grid gap-6 xl:grid-cols-3">
      <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs xl:col-span-2">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Doanh thu 6 tháng gần nhất
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tổng thu từ tiền giường và dịch vụ
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-brand-600" />
            <span className="text-slate-500">Đơn vị: triệu đồng</span>
          </div>
        </div>

        <div className="chart-shell">
          <div className="chart-y-axis">
            <span>160</span>
            <span>120</span>
            <span>80</span>
            <span>40</span>
            <span>0</span>
          </div>
          <div className="chart-area">
            <div className="chart-grid" />
            <div className="chart-bars">
              {revenue.map((item, index) => (
                <div className="chart-column group/bar" key={item.month}>
                  <span className="chart-value">{item.value}</span>
                  <div
                    className={`chart-bar ${item.height} ${
                      index === revenue.length - 1 ? "chart-bar-active" : ""
                    }`}
                  />
                  <span className="chart-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Tổng 6 tháng
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              763,2 triệu
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">
              Tăng trưởng
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm font-bold text-success-600">
              <Icon name="trend" className="size-4" />
              8,4% so với kỳ trước
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">
              Mục tiêu tháng 10
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              145,2 / 160 triệu
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Tình trạng giường
            </h2>
            <p className="mt-1 text-sm text-slate-500">Toàn bộ hệ thống</p>
          </div>
          <Button
            label="Mở sơ đồ phòng"
            className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => onNavigate("Phòng & giường")}
          >
            <Icon name="more" />
          </Button>
        </div>

        <div className="flex justify-center py-2">
          <div
            aria-label="87,7 phần trăm giường đang được sử dụng"
            className="occupancy-ring"
            role="img"
          >
            <div className="occupancy-ring-inner">
              <span className="font-heading text-3xl font-bold text-slate-950">
                87,7%
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500">
                đã lấp đầy
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <span className="size-2.5 rounded-full bg-brand-600" />
              Đang sử dụng
            </span>
            <span className="text-sm font-bold text-slate-900">158 giường</span>
          </div>
          <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <span className="size-2.5 rounded-full bg-success-500" />
              Còn trống
            </span>
            <span className="text-sm font-bold text-slate-900">18 giường</span>
          </div>
          <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-slate-600">
              <span className="size-2.5 rounded-full bg-warning-500" />
              Bảo trì
            </span>
            <span className="text-sm font-bold text-slate-900">4 giường</span>
          </div>
        </div>
        <Button
          className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
          onClick={() => onNavigate("Phòng & giường")}
        >
          Xem sơ đồ phòng
          <Icon name="chevron" className="size-4" />
        </Button>
      </article>
    </section>
  );
}
