import { Button, Drawer, Icon } from "../../components/common/index.ts";
import type { TenantNotification, PersonalViolation } from "./tenantConstants.tsx";

export function NotificationsDrawer({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  open: boolean;
  onClose: () => void;
  notifications: TenantNotification[];
  violations?: PersonalViolation[];
  onMarkAllRead: () => void;
}) {
  const unreadNotices = notifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <Drawer
      title="Hộp thư thông báo"
      subtitle="Thông báo tự động phát sinh từ hệ thống nghiệp vụ (FR-27)"
      onClose={onClose}
    >
      <div className="space-y-4">
        {unreadNotices > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Bạn có <strong className="text-brand-700">{unreadNotices}</strong> thông báo chưa đọc
            </span>
            <button
              type="button"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              onClick={onMarkAllRead}
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tất cả thông báo đã được đọc</span>
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
    </Drawer>
  );
}
