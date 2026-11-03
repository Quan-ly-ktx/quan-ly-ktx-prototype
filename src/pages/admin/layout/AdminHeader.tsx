import { useState } from "react";
import { Button, Icon } from "../../../components/common/index.ts";
import { GlobalSearch } from "../quick/GlobalSearch.tsx";
import type { Invoice } from "../../../types/index.ts";
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
];

export function AdminHeader({
  onOpenSidebar,
  onNavigate,
  onLogout,
  onOpenPassword,
  invoices,
}: {
  onOpenSidebar: () => void;
  onNavigate: (label: string) => void;
  onLogout: () => void;
  onOpenPassword: () => void;
  invoices?: Invoice[];
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-sticky flex h-18 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
      <Button
        label="Mở menu"
        className="grid size-9 shrink-0 place-items-center rounded-sm text-slate-600 hover:bg-slate-100 lg:hidden"
        onClick={onOpenSidebar}
      >
        <Icon name="menu" />
      </Button>

      <GlobalSearch onNavigate={onNavigate} invoices={invoices} />

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <div className="relative">
          <Button
            label="Thông báo, có 3 thông báo mới"
            className="relative grid size-9 place-items-center rounded-sm text-slate-600 hover:bg-slate-100"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Icon name="bell" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger-600 ring-2 ring-white" />
          </Button>
          {notificationsOpen && (
            <div className="absolute right-0 top-11 z-dropdown w-80 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="font-heading text-sm font-bold text-slate-900">
                  Thông báo mới
                </span>
                <Button className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Đánh dấu đã đọc
                </Button>
              </div>
              <div className="p-2">
                {alerts.map((alert) => (
                  <Button
                    key={alert.title}
                    className="flex w-full gap-2.5 rounded-sm p-2 text-left hover:bg-slate-50"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <span className={`icon-box icon-box-${alert.tone} size-9`}>
                      <Icon name={alert.icon} className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800">
                        {alert.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {alert.time}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
        <div className="relative">
          <Button
            className="flex h-9 items-center gap-2 rounded-sm px-2 hover:bg-slate-100"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className="grid size-7 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
              TL
            </span>
            <span className="hidden text-left xl:block">
              <span className="block text-sm font-semibold text-slate-800">
                Thu Lan
              </span>
              <span className="block text-xs text-slate-500">Quản lý</span>
            </span>
            <Icon
              name="chevron"
              className="hidden size-4 rotate-90 text-slate-400 xl:block"
            />
          </Button>
          {profileOpen && (
            <div className="absolute right-0 top-11 z-dropdown w-52 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md">
              <Button
                className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate("Kĩ thuật viên");
                }}
              >
                <Icon name="settings" className="size-4" /> Kĩ thuật viên
              </Button>
              <Button
                className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setProfileOpen(false);
                  onOpenPassword();
                }}
              >
                <Icon name="settings" className="size-4" /> Đổi mật khẩu
              </Button>
              <Button
                className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-danger-600 hover:bg-danger-50"
                onClick={onLogout}
              >
                <Icon name="logout" className="size-4" /> Đăng xuất
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
