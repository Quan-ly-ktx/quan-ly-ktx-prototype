import { createContext, type ReactNode } from "react";
import { person } from "../../services/mock/mockData.ts";
import type { TicketStatus } from "../../types/incident.ts";
import type { TenantVehicle } from "../../types/tenant.ts";
export type { TenantVehicle };

export type Page = "room" | "invoices" | "vehicles" | "report" | "violations";
export type RequestKind = "extend" | "checkout";

const ME = person("Nguyễn Hoàng Nam");

export const DEMO_TENANT = {
  ...ME,
  floor: "Tầng 3",
  deposit: 1500000,
  name: "Nguyễn Hoàng Nam",
  initials: "HN",
  room: "P.302",
  bed: "G02",
  contract: "HD-2026-0187",
};

export type TenantInfo = typeof DEMO_TENANT;
export const TenantCtx = createContext<TenantInfo>(DEMO_TENANT);

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export type TenantInvoice = {
  id: string;
  title: string;
  items: [string, number][];
  amount: number;
  due: string;
  status: "Chưa thanh toán" | "Chờ xác nhận" | "Đã thanh toán";
  paidAt: string;
};

export const BANK = {
  name: "MB Bank",
  account: "0987654321",
  holder: "CONG TY KTX HUB",
};
export type TenantNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "maintenance" | "billing" | "contract" | "general";
};

export type PersonalViolation = {
  id: string;
  type: "Về muộn" | "Gây ồn" | "Vệ sinh" | "Khách ngoài" | "Hút thuốc / cháy nổ" | "Khác";
  date: string;
  level: "Nhắc nhở" | "Cảnh cáo" | "Phạt tiền";
  fine?: number;
  note: string;
};

export const initialTenantNotifications: TenantNotification[] = [
  {
    id: "NOTI-01",
    title: "Phát hành hóa đơn tiền phòng tháng 11/2026",
    body: "Hóa đơn tiền phòng kỳ tháng 11 (1.500.000 đ) đã được phát hành tự động. Hạn thanh toán cố định là ngày 05/11/2026.",
    time: "25/10/2026 00:00",
    read: false,
    type: "billing",
  },
];

export const initialPersonalViolations: PersonalViolation[] = [
  {
    id: "KL-0219",
    type: "Về muộn",
    date: "12/09/2026",
    level: "Nhắc nhở",
    note: "Về phòng lúc 23:45, bảo vệ đã nhắc nhở quy định giờ giới nghiêm 23:30.",
  },
];




export const roommates = [
  { name: "Phạm Văn Hùng", bed: "G01" },
  { name: "Lê Quang Minh", bed: "G03" },
  { name: "Đỗ Anh Tuấn", bed: "G04" },
];

export const demoInvoices: TenantInvoice[] = [
  {
    id: "HD-2611-0187",
    title: "Tiền phòng tháng 11/2026",
    items: [["Tiền phòng tháng 11/2026", 1500000]],
    amount: 1500000,
    due: "05/11/2026",
    status: "Chưa thanh toán",
    paidAt: "",
  },
  {
    id: "HD-2610-0187",
    title: "Tiền phòng tháng 10/2026",
    items: [["Tiền phòng tháng 10/2026", 1500000]],
    amount: 1500000,
    due: "05/10/2026",
    status: "Đã thanh toán",
    paidAt: "03/10/2026",
  },
  {
    id: "PC-2026-0187",
    title: "Tiền cọc giữ chỗ",
    items: [["Tiền cọc giữ chỗ", 1500000]],
    amount: 1500000,
    due: "01/09/2026",
    status: "Đã thanh toán",
    paidAt: "29/08/2026",
  },
];

export const ticketTone: Record<TicketStatus, { label: string; cls: string }> = {
  "Chưa phân công": { label: "Chờ tiếp nhận", cls: "status-label-slate" },
  "Mới giao": { label: "Đã giao thợ", cls: "status-label-brand" },
  "Đang xử lý": { label: "Đang sửa chữa", cls: "status-label-warning" },
  "Hoàn thành": { label: "Đã hoàn thành", cls: "status-label-success" },
};

export const requestConfig: Record<
  RequestKind,
  {
    title: string;
    intro: string;
    options: string[];
    cta: string;
    done: string;
  }
> = {
  extend: {
    title: "Gia hạn cư trú",
    intro:
      "Hợp đồng hiện tại có hiệu lực đến 01/09/2027. Hợp đồng gia hạn theo từng năm:",
    options: ["Gia hạn thêm 1 năm (01/09/2027 – 01/09/2028)"],
    cta: "Gửi yêu cầu gia hạn",
    done: "Đã gửi yêu cầu gia hạn cho quản lý",
  },
  checkout: {
    title: "Đăng ký trả phòng",
    intro:
      "Chọn ngày bàn giao giường. Tiền cọc 1.500.000 đ được hoàn sau khi kiểm tra vật dụng:",
    options: [
      "01/09/2027 · Hết hạn hợp đồng",
      "15/11/2026 · Trả sớm (có thể mất cọc theo điều khoản)",
    ],
    cta: "Xác nhận trả phòng",
    done: "Đã ghi nhận đơn trả phòng",
  },
};

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-sm border border-slate-200 bg-white p-5 shadow-xs ${className}`}
    >
      {children}
    </section>
  );
}
