import { useState } from "react";
import { Button, Drawer, Icon } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import type { TenantNotification, PersonalViolation } from "./tenantConstants.tsx";

const violationLevelTone: Record<PersonalViolation["level"], "danger" | "warning" | "neutral"> = {
  "Phạt tiền": "danger",
  "Cảnh cáo": "warning",
  "Nhắc nhở": "neutral",
};

export function NotificationsDrawer({
  open,
  onClose,
  notifications,
  violations,
  onMarkAllRead,
}: {
  open: boolean;
  onClose: () => void;
  notifications: TenantNotification[];
  violations: PersonalViolation[];
  onMarkAllRead: () => void;
}) {
  const [tab, setTab] = useState<"notices" | "violations">("notices");
  const unreadNotices = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <Drawer
      title="Hộp thư thông báo & Kỷ luật"
      subtitle="Thông báo từ Ban Quản lý & Lịch sử vi phạm cá nhân (FR-27)"
      onClose={onClose}
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          className={`flex-1 border-b-2 py-3 text-center text-xs font-semibold transition-all ${
            tab === "notices"
              ? "border-brand-500 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setTab("notices")}
        >
          Thông báo chung
          {unreadNotices > 0 && (
            <span className="ml-1.5 rounded-full bg-danger-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {unreadNotices}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`flex-1 border-b-2 py-3 text-center text-xs font-semibold transition-all ${
            tab === "violations"
              ? "border-brand-500 text-brand-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setTab("violations")}
        >
          Biên bản vi phạm
          {violations.length > 0 && (
            <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
              {violations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Notices */}
      {tab === "notices" && (
        <div className="pt-4">
          {unreadNotices > 0 && (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                onClick={onMarkAllRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
          <ul className="divide-y divide-slate-100 rounded-sm border border-slate-200 bg-white">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-4 transition-colors ${
                  !n.read ? "bg-brand-50/40" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-brand-600 border border-brand-100">
                    <Icon
                      name={
                        n.type === "billing"
                          ? "invoice"
                          : n.type === "maintenance"
                            ? "tools"
                            : n.type === "contract"
                              ? "contract"
                              : "bell"
                      }
                      className="size-4"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-500 ring-2 ring-white" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {n.body}
                    </p>
                    <span className="mt-2 block font-mono text-[11px] text-slate-400">
                      {n.time}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="p-8 text-center text-xs text-slate-500">
                Hộp thư không có thông báo nào.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Tab 2: Violations */}
      {tab === "violations" && (
        <div className="pt-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">Quy định Kỷ luật & Nội quy KTX:</p>
            <p className="mt-0.5">
              Hồ sơ vi phạm được Ban Quản lý lập trực tiếp và lưu trữ trong lịch sử cư trú (BR-07 / FR-19). Tiền phạt (nếu có) được nộp trực tiếp ngoài thực tế và không gộp vào hóa đơn tiền phòng.
            </p>
          </div>

          <ul className="space-y-3">
            {violations.map((v) => {
              const tone = violationLevelTone[v.level];
              return (
                <li
                  key={v.id}
                  className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-brand-700">
                      {v.id}
                    </span>
                    <span
                      className={`status-label ${
                        tone === "danger"
                          ? "status-label-danger"
                          : tone === "warning"
                            ? "status-label-warning"
                            : "status-label-slate"
                      }`}
                    >
                      {v.level}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-900">
                    Vi phạm: {v.type}
                  </div>

                  <dl className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Ngày lập biên bản</dt>
                      <dd className="font-medium text-slate-800">{v.date}</dd>
                    </div>
                    {v.fine ? (
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Tiền phạt (thu ngoài đời)</dt>
                        <dd className="font-bold text-danger-600">
                          {money(v.fine)}
                        </dd>
                      </div>
                    ) : null}
                    <div className="pt-1">
                      <dt className="text-slate-500 mb-0.5">Chi tiết diễn biến</dt>
                      <dd className="rounded-sm bg-slate-50 p-2 text-slate-700 leading-relaxed border border-slate-100">
                        {v.note}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}

            {violations.length === 0 && (
              <li className="rounded-sm border border-dashed border-slate-200 bg-white p-8 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-sm bg-success-50 text-success-600">
                  <Icon name="check" className="size-5" />
                </span>
                <h4 className="mt-2.5 font-heading text-sm font-bold text-slate-900">
                  Lịch sử cư trú tốt
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Bạn không có bất kỳ biên bản vi phạm nội quy nào.
                </p>
              </li>
            )}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
