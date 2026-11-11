import { useState } from "react";
import { env } from "../../../config/env.ts";
import { money } from "../../../utils/formatters.ts";
import {
  DEMO_BED_DISTRIBUTION,
  DEMO_DASHBOARD_DATA,
  DEMO_YEARS,
} from "./dashboardDemoData.ts";

export function DashboardCharts() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  if (!env.USE_MOCK) {
    return (
      <section className="mb-6 rounded-sm border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="font-heading text-lg font-bold text-slate-900">
          Biểu đồ phân tích Dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Dữ liệu biểu đồ phân tích chưa được tích hợp với Backend API thật.
        </p>
      </section>
    );
  }

  const yearData = DEMO_DASHBOARD_DATA[selectedYear];

  return (
    <section className="mb-6 space-y-6">
      {/* Chart Section Header with Prototype Demo Tag and Year Picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Biểu đồ phân tích vận hành & tài chính
            </h2>
            <span className="rounded-sm bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs font-semibold text-brand-700">
              Dữ liệu biểu đồ minh họa (Prototype)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Theo quy định SRS v3.4.1 (FR-20), biểu đồ sử dụng bộ số liệu minh họa độc lập và không làm thay đổi bốn KPI nghiệp vụ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Năm thống kê:
          </label>
          <select
            className="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-brand-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {DEMO_YEARS.map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
            <option value={2024}>Năm 2024</option>
          </select>
        </div>
      </div>

      {!yearData ? (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Không có dữ liệu thống kê minh họa cho năm {selectedYear}.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Vui lòng chọn năm 2025 hoặc 2026 để xem biểu đồ phân tích 12 tháng.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* C1.1. Line Chart — Người vào ở và rời đi */}
          <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Biến động lưu trú (Vào ở & Rời đi) — Năm {selectedYear}
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-brand-500" />
                    <span className="text-slate-600 font-medium">Vào ở</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-danger-500" />
                    <span className="text-slate-600 font-medium">Rời đi</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Số lượt khách tiếp nhận mới và trả phòng theo từng tháng trong năm {selectedYear} (Đơn vị: người).
              </p>
            </div>

            <div className="relative w-full overflow-x-auto pt-2">
              <svg
                viewBox="0 0 520 220"
                className="w-full min-w-105 h-56 text-xs select-none"
                aria-label={`Biểu đồ đường biến động lưu trú năm ${selectedYear}`}
              >
                {/* Horizontal Grid Lines */}
                {[0, 10, 20, 30, 40].map((val, idx) => {
                  const y = 180 - idx * 40;
                  return (
                    <g key={val}>
                      <line
                        x1="35"
                        y1={y}
                        x2="510"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="28"
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 font-mono text-[10px]"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Movements Line: Move In (Brand) */}
                <polyline
                  fill="none"
                  stroke="#007BFF"
                  strokeWidth="2.5"
                  points={yearData.movements
                    .map((m, i) => `${45 + i * 40},${180 - (m.moveIn / 40) * 160}`)
                    .join(" ")}
                />

                {/* Movements Line: Move Out (Danger) */}
                <polyline
                  fill="none"
                  stroke="#DC3545"
                  strokeWidth="2.5"
                  points={yearData.movements
                    .map((m, i) => `${45 + i * 40},${180 - (m.moveOut / 40) * 160}`)
                    .join(" ")}
                />

                {/* Data Points & X-Labels */}
                {yearData.movements.map((m, i) => {
                  const x = 45 + i * 40;
                  const yIn = 180 - (m.moveIn / 40) * 160;
                  const yOut = 180 - (m.moveOut / 40) * 160;
                  return (
                    <g key={m.month}>
                      <circle
                        cx={x}
                        cy={yIn}
                        r="4"
                        fill="#007BFF"
                        className="cursor-pointer transition-transform hover:scale-150"
                        onMouseEnter={() =>
                          setActiveTooltip({
                            text: `T${m.month}: ${m.moveIn} vào ở`,
                            x,
                            y: yIn,
                          })
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      <circle
                        cx={x}
                        cy={yOut}
                        r="4"
                        fill="#DC3545"
                        className="cursor-pointer transition-transform hover:scale-150"
                        onMouseEnter={() =>
                          setActiveTooltip({
                            text: `T${m.month}: ${m.moveOut} rời đi`,
                            x,
                            y: yOut,
                          })
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      <text
                        x={x}
                        y="200"
                        textAnchor="middle"
                        className="fill-slate-500 font-mono text-[10px]"
                      >
                        T{m.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>

          {/* C1.2. Donut Chart — Phân bố trạng thái giường */}
          <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Phân bố giường minh họa
                </h3>
                <span className="font-mono text-xs text-slate-500">Tổng 56 giường</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tỷ lệ phân bổ trạng thái giường cơ sở mẫu (OCCUPIED, AVAILABLE, MAINTENANCE).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
              {/* SVG Donut */}
              <div className="relative size-44 shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="size-full -rotate-90 select-none"
                  aria-label="Biểu đồ tròn phân bố trạng thái giường"
                >
                  {/* Total circle circum = 2 * PI * 38 ≈ 238.76 */}
                  {/* Segment 1: OCCUPIED (75%) -> 179.07 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#007BFF"
                    strokeWidth="16"
                    strokeDasharray="179.07 238.76"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: AVAILABLE (18%) -> 42.98 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#28A745"
                    strokeWidth="16"
                    strokeDasharray="42.98 238.76"
                    strokeDashoffset="-179.07"
                  />
                  {/* Segment 3: MAINTENANCE (7%) -> 16.71 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#FFC107"
                    strokeWidth="16"
                    strokeDasharray="16.71 238.76"
                    strokeDashoffset="-222.05"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-xl font-bold text-slate-900">75%</span>
                  <span className="text-[10px] text-slate-500">Đang ở</span>
                </div>
              </div>

              {/* Legend with exact count and percentage */}
              <div className="space-y-3 w-full sm:w-auto text-xs">
                {DEMO_BED_DISTRIBUTION.map((item) => {
                  const color =
                    item.status === "OCCUPIED"
                      ? "bg-brand-500 text-brand-700"
                      : item.status === "AVAILABLE"
                        ? "bg-success-500 text-success-700"
                        : "bg-warning-500 text-warning-700";
                  return (
                    <div
                      key={item.status}
                      className="flex items-center justify-between sm:justify-start gap-3 rounded-sm bg-slate-50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`size-3 rounded-xs ${color.split(" ")[0]}`} />
                        <span className="font-medium text-slate-800">{item.label}</span>
                      </div>
                      <div className="font-mono text-slate-600 font-semibold">
                        {item.count} giường ({item.percentage}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          {/* C1.3. Bar Chart — Doanh thu (Kỳ vọng & Đã thu) */}
          <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Doanh thu 12 tháng (Kỳ vọng vs Đã thu) — Năm {selectedYear}
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-xs bg-slate-300" />
                    <span className="text-slate-600 font-medium">Kỳ vọng</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-xs bg-brand-500" />
                    <span className="text-slate-600 font-medium">Đã thu</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                So sánh số tiền kỳ vọng và thực tế đã đối soát theo từng tháng trong năm {selectedYear} (Đơn vị: triệu VNĐ).
              </p>
            </div>

            <div className="relative w-full overflow-x-auto pt-2">
              <svg
                viewBox="0 0 520 220"
                className="w-full min-w-105 h-56 text-xs select-none"
                aria-label={`Biểu đồ cột doanh thu 12 tháng năm ${selectedYear}`}
              >
                {/* Horizontal Grid Lines */}
                {[0, 30, 60, 90].map((mil, idx) => {
                  const y = 180 - idx * 55;
                  return (
                    <g key={mil}>
                      <line
                        x1="35"
                        y1={y}
                        x2="510"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="28"
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 font-mono text-[10px]"
                      >
                        {mil}M
                      </text>
                    </g>
                  );
                })}

                {/* Bars for 12 months */}
                {yearData.revenues.map((r, i) => {
                  const x = 40 + i * 39;
                  const hExpected = (r.expected / 100000000) * 165;
                  const hCollected = (r.collected / 100000000) * 165;
                  return (
                    <g key={r.month} className="group">
                      {/* Expected Bar */}
                      <rect
                        x={x}
                        y={180 - hExpected}
                        width="14"
                        height={hExpected}
                        fill="#CBD5E1"
                        rx="2"
                        className="cursor-pointer hover:opacity-80"
                        onMouseEnter={() =>
                          setActiveTooltip({
                            text: `T${r.month}: Kỳ vọng ${money(r.expected)}`,
                            x: x + 7,
                            y: 180 - hExpected,
                          })
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {/* Collected Bar */}
                      <rect
                        x={x + 16}
                        y={180 - hCollected}
                        width="14"
                        height={hCollected}
                        fill="#007BFF"
                        rx="2"
                        className="cursor-pointer hover:opacity-80"
                        onMouseEnter={() =>
                          setActiveTooltip({
                            text: `T${r.month}: Đã thu ${money(r.collected)}`,
                            x: x + 23,
                            y: 180 - hCollected,
                          })
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      {/* X Label */}
                      <text
                        x={x + 15}
                        y="200"
                        textAnchor="middle"
                        className="fill-slate-500 font-mono text-[10px]"
                      >
                        T{r.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>

          {/* C1.4. Bar Chart — Chi phí phát sinh */}
          <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Tổng chi phí phát sinh — Năm {selectedYear}
                </h3>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="size-2.5 rounded-xs bg-warning-500" />
                  <span className="text-slate-600 font-medium">Chi phí cơ sở & vận hành</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tổng chi phí tiện ích, lương nhân viên và bảo trì theo từng tháng trong năm {selectedYear} (Đơn vị: triệu VNĐ).
              </p>
            </div>

            <div className="relative w-full overflow-x-auto pt-2">
              <svg
                viewBox="0 0 520 220"
                className="w-full min-w-105 h-56 text-xs select-none"
                aria-label={`Biểu đồ cột chi phí phát sinh năm ${selectedYear}`}
              >
                {/* Horizontal Grid Lines */}
                {[0, 10, 20, 30, 40].map((mil, idx) => {
                  const y = 180 - idx * 40;
                  return (
                    <g key={mil}>
                      <line
                        x1="35"
                        y1={y}
                        x2="510"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                      />
                      <text
                        x="28"
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 font-mono text-[10px]"
                      >
                        {mil}M
                      </text>
                    </g>
                  );
                })}

                {/* Bars for 12 months */}
                {yearData.expenses.map((e, i) => {
                  const x = 45 + i * 39;
                  const h = (e.amount / 40000000) * 160;
                  return (
                    <g key={e.month} className="group">
                      <rect
                        x={x}
                        y={180 - h}
                        width="24"
                        height={h}
                        fill="#F59E0B"
                        rx="2"
                        className="cursor-pointer hover:opacity-80"
                        onMouseEnter={() =>
                          setActiveTooltip({
                            text: `T${e.month}: Chi phí ${money(e.amount)}`,
                            x: x + 12,
                            y: 180 - h,
                          })
                        }
                        onMouseLeave={() => setActiveTooltip(null)}
                      />
                      <text
                        x={x + 12}
                        y="200"
                        textAnchor="middle"
                        className="fill-slate-500 font-mono text-[10px]"
                      >
                        T{e.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>
        </div>
      )}

      {/* Interactive Tooltip Overlay */}
      {activeTooltip && (
        <div
          className="pointer-events-none fixed z-tooltip rounded-sm bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-md transition-opacity"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y - 30}px`,
            transform: "translateX(-50%)",
          }}
        >
          {activeTooltip.text}
        </div>
      )}
    </section>
  );
}
