import type { IconName } from "../types/shared.ts";
import type { Role } from "../types/auth.ts";

export type NavItem = {
  label: string;
  icon: IconName;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "TỔNG QUAN",
    items: [
      { label: "Bảng điều khiển", icon: "dashboard" },
      { label: "Phòng & giường", icon: "grid" },
    ],
  },
  {
    label: "VẬN HÀNH",
    items: [
      { label: "Người thuê", icon: "tenants" },
      { label: "Phương tiện", icon: "clipboard" },
      { label: "Hợp đồng", icon: "contract" },
      { label: "Hóa đơn", icon: "invoice", badge: "12" },
      { label: "Tài chính", icon: "wallet" },
      { label: "Sự cố & kỷ luật", icon: "tools", badge: "4" },
    ],
  },
  {
    label: "HỆ THỐNG",
    items: [{ label: "Kĩ thuật viên", icon: "settings" }],
  },
];

export function getRouteByRole(role: Role | "admin"): string {
  switch (role) {
    case "manager":
    case "admin":
      return "Bảng điều khiển";
    case "tenant":
      return "portal";
    case "technician":
      return "tasks";
    default:
      return "login";
  }
}
