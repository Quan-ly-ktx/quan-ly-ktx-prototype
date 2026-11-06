import type { Priority, Ticket, TicketStatus } from "../../types/index.ts";

export const filters: ("Tất cả" | TicketStatus)[] = [
  "Tất cả",
  "Mới giao",
  "Đang xử lý",
  "Hoàn thành",
];

export const prioBar: Record<Priority, string> = {
  "Khẩn cấp": "bg-red-600",
  Cao: "bg-orange-500",
  "Bình thường": "bg-sky-400",
};

export const prioChip: Record<Priority, string> = {
  "Khẩn cấp": "border-red-600 bg-red-600 text-white",
  Cao: "border-orange-500 bg-orange-500 text-white",
  "Bình thường": "border-sky-500 bg-sky-500 text-white",
};

export const where = (t: Ticket) =>
  t.bed ? `${t.room} · Giường ${t.bed}` : t.room;

export type Notice = {
  id: string;
  title: string;
  body: string;
  time: string;
  ticketId?: string;
  tone: "danger" | "brand" | "warning" | "success";
  unread: boolean;
};

export const noticeTone: Record<Notice["tone"], string> = {
  danger: "bg-red-100 text-red-600",
  brand: "bg-brand-50 text-brand-600",
  warning: "bg-warning-50 text-warning-600",
  success: "bg-success-50 text-success-600",
};

export const initialNotices: Notice[] = [
  {
    id: "n1",
    title: "Việc khẩn cấp mới được giao",
    body: "SC-1049 · Rò rỉ nước dưới bồn rửa tại P.401, cần xử lý trước 12:00.",
    time: "5 phút trước",
    ticketId: "SC-1049",
    tone: "danger",
    unread: true,
  },
  {
    id: "n2",
    title: "Quản lý đổi mức ưu tiên",
    body: "SC-1047 · Điều hòa không lạnh (P.205) được nâng lên mức Cao.",
    time: "1 giờ trước",
    ticketId: "SC-1047",
    tone: "warning",
    unread: true,
  },
  {
    id: "n3",
    title: "Sắp đến hạn xử lý",
    body: "SC-1046 · Quạt trần kêu to (P.302) còn hạn đến 26/10.",
    time: "Hôm nay, 07:30",
    ticketId: "SC-1046",
    tone: "brand",
    unread: false,
  },
  {
    id: "n4",
    title: "Người thuê đã xác nhận",
    body: "SC-1041 · Bóng đèn hành lang tầng 2 đã được xác nhận hoàn thành.",
    time: "Hôm qua",
    ticketId: "SC-1041",
    tone: "success",
    unread: false,
  },
];

export const statusStyle: Record<TicketStatus, string> = {
  "Chưa phân công": "status-label-slate",
  "Mới giao": "status-label-brand",
  "Đang xử lý": "status-label-warning",
  "Hoàn thành": "status-label-success",
};

export type Profile = {
  name: string;
  phone: string;
  email: string;
};
