export type Priority = "Khẩn cấp" | "Cao" | "Bình thường";

export const PRIORITIES: Priority[] = ["Khẩn cấp", "Cao", "Bình thường"];

export const priorityRank: Record<Priority, number> = {
  "Khẩn cấp": 0,
  Cao: 1,
  "Bình thường": 2,
};

export type TicketStatus = "Mới giao" | "Đang xử lý" | "Hoàn thành";

export type Ticket = {
  id: string;
  room: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  bed?: string;
  status: TicketStatus;
  reporter: string;
  phone: string;
  createdAt: string;
  deadline: string;
  hasPhoto: boolean;
  assignee?: string;
  resolution?: string;
  cost?: number;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export type ViolationRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  room: string;
  type: string;
  level: string;
  fine: number;
  date: string;
  status: "Chờ nộp phạt" | "Đã xử lý";
};
