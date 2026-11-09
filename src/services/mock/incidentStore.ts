import { env } from "../../config/env.ts";
import type { TenantRecord } from "../../types/tenant.ts";
import { getMockSnapshot, subscribeMockSnapshot, updateMockSnapshot } from "./mockStore.ts";

export type IncidentViolation = {
  id: string; tenantId: string; tenant: string; room: string;
  type: string; level: string; fine?: number; date: string; note: string;
};
export type IncidentNotification = {
  id: string; tenantId: string; title: string; body: string; time: string; read: boolean; type: "general";
};
export function subscribeIncidentStore(listener: () => void) {
  return subscribeMockSnapshot(listener);
}
export function getViolations(tenantId?: string): IncidentViolation[] {
  if (!env.USE_MOCK) throw new Error("Chưa tích hợp API vi phạm.");
  const items = getMockSnapshot().violations;
  return tenantId === undefined ? items : items.filter((item) => item.tenantId === tenantId);
}
export function getIncidentNotifications(tenantId: string): IncidentNotification[] {
  if (!env.USE_MOCK) throw new Error("Chưa tích hợp API thông báo.");
  return getMockSnapshot().notifications.filter((item) => item.tenantId === tenantId);
}
export function markIncidentNotificationRead(id: string, tenantId: string) {
  if (!env.USE_MOCK) throw new Error("Chưa tích hợp API thông báo.");
  updateMockSnapshot((state) => {
    if (!state.notifications.some((item) => item.id === id && item.tenantId === tenantId)) throw new Error("Không tìm thấy thông báo.");
    return { ...state, notifications: state.notifications.map((item) => item.id === id && item.tenantId === tenantId ? { ...item, read: true } : item) };
  });
}
export function recordViolation(tenant: TenantRecord, input: Omit<IncidentViolation, "id" | "tenantId" | "tenant" | "room">) {
  if (!env.USE_MOCK) throw new Error("Chưa tích hợp API vi phạm.");
  if (tenant.status === "Đã trả phòng") throw new Error("Người thuê đã trả phòng.");
  if (!input.date || !["Về muộn", "Gây ồn", "Vệ sinh", "Khách ngoài", "Hút thuốc / cháy nổ", "Khác"].includes(input.type) || !["Nhắc nhở", "Cảnh cáo", "Phạt tiền"].includes(input.level) || (input.level === "Phạt tiền" && (!Number.isSafeInteger(input.fine) || (input.fine ?? 0) <= 0))) throw new Error("Thông tin vi phạm không hợp lệ.");
  const id = `KL-${crypto.randomUUID()}`;
  const fine = input.level === "Phạt tiền" ? input.fine : undefined;
  const notification: IncidentNotification = { id: `NOTI-${crypto.randomUUID()}`, tenantId: tenant.id, title: "Biên bản vi phạm", body: `${input.type} · ${input.level}${fine ? ` · ${fine.toLocaleString("vi-VN")} đ` : ""}`, time: new Date().toISOString(), read: false, type: "general" };
  const next = updateMockSnapshot((state) => {
    const current = state.tenants.find((item) => item.id === tenant.id);
    if (!current || current.status === "Đã trả phòng") throw new Error("Không tìm thấy người thuê đang cư trú.");
    const violation: IncidentViolation = { ...input, fine, id, tenantId: current.id, tenant: current.name, room: current.room };
    return { ...state, violations: [violation, ...state.violations], notifications: [notification, ...state.notifications] };
  });
  return next.violations[0];
}
