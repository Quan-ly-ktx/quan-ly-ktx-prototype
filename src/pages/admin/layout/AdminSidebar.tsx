import { Button, Icon } from "../../../components/common/index.ts";
import type { IconName } from "../../../types/shared.ts";

export const navGroups = [
  {
    label: "TỔNG QUAN",
    items: [
      { label: "Bảng điều khiển", icon: "dashboard" as IconName },
      { label: "Phòng & giường", icon: "grid" as IconName },
    ],
  },
  {
    label: "VẬN HÀNH",
    items: [
      { label: "Người thuê", icon: "students" as IconName },
      { label: "Phương tiện", icon: "clipboard" as IconName },
      { label: "Hợp đồng", icon: "contract" as IconName },
      { label: "Hóa đơn", icon: "invoice" as IconName, badge: "12" },
      { label: "Tài chính", icon: "wallet" as IconName },
      { label: "Sự cố & kỷ luật", icon: "tools" as IconName, badge: "4" },
    ],
  },
  {
    label: "HỆ THỐNG",
    items: [
      { label: "Kĩ thuật viên", icon: "settings" as IconName },
    ],
  },
];

export function AdminSidebar({
  activeNav,
  onNavigate,
  open,
  onClose,
  compact,
  onToggleCompact,
}: {
  activeNav: string;
  onNavigate: (label: string) => void;
  open: boolean;
  onClose: () => void;
  compact: boolean;
  onToggleCompact: () => void;
}) {
  return (
    <>
      {open && (
        <Button
          label="Đóng menu"
          className="fixed inset-0 z-backdrop bg-slate-950/40 lg:hidden"
          onClick={onClose}
        >
          <span className="sr-only">Đóng menu</span>
        </Button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-drawer flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${compact ? "lg:w-20" : "lg:w-64"} w-64 lg:translate-x-0`}
      >
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <div
            className={`flex items-center gap-3 ${
              compact ? "lg:justify-center" : ""
            }`}
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-sm bg-brand-500 text-white">
              <Icon name="building" className="size-4" />
            </div>
            <div className={compact ? "lg:hidden" : ""}>
              <div className="font-heading text-base font-bold tracking-tight text-slate-950">
                KTX Hub
              </div>
              <div className="text-xs font-medium text-slate-500">
                Quản lý lưu trú
              </div>
            </div>
          </div>
          <Button
            label="Đóng điều hướng"
            className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            <Icon name="close" />
          </Button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-5"
          aria-label="Điều hướng chính"
        >
          {navGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              <div
                className={`mb-2 px-3 text-xs font-bold tracking-widest text-slate-400 ${
                  compact ? "lg:text-center lg:text-[0px]" : ""
                }`}
              >
                {compact ? (
                  <span className="hidden lg:inline">•</span>
                ) : null}
                <span className={compact ? "lg:hidden" : ""}>
                  {group.label}
                </span>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.label === activeNav;
                  return (
                    <Button
                      key={item.label}
                      label={item.label}
                      className={`flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      } ${compact ? "lg:justify-center lg:px-0" : ""}`}
                      onClick={() => onNavigate(item.label)}
                    >
                      <Icon
                        name={item.icon}
                        className={`size-5 shrink-0 ${
                          active ? "stroke-2" : ""
                        }`}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          compact ? "lg:hidden" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                            active
                              ? "bg-white text-brand-700"
                              : "bg-slate-100 text-slate-600"
                          } ${compact ? "lg:hidden" : ""}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Button
            label={
              compact
                ? "Mở rộng thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
            className="hidden h-10 w-full items-center gap-2.5 rounded-sm px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:flex"
            onClick={onToggleCompact}
          >
            <Icon
              name="chevron"
              className={`size-5 transition-transform ${
                compact ? "" : "rotate-180"
              }`}
            />
            <span className={compact ? "lg:hidden" : ""}>
              Thu gọn menu
            </span>
          </Button>
          <div
            className={`mt-2 flex items-center gap-2.5 rounded-sm bg-slate-50 p-2.5 ${
              compact ? "lg:justify-center lg:bg-white lg:p-0" : ""
            }`}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
              TL
            </div>
            <div
              className={`min-w-0 flex-1 ${compact ? "lg:hidden" : ""}`}
            >
              <div className="truncate text-sm font-semibold text-slate-800">
                Trần Thu Lan
              </div>
              <div className="truncate text-xs text-slate-500">
                Quản lý cơ sở thuê
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
