import type { Invoice, RoomRecord } from "../../types/index.ts";
import type { ContractRecord, OnboardingInput, OnboardingResult, TenantRecord, TenantVehicle } from "../../types/tenant.ts";

import type { MockSnapshot } from "./mockStore.ts";
export type LifecycleState = MockSnapshot;

let demoClock: string | undefined;
export function setDemoDate(date?: string) { demoClock = date; }
export function getDemoDate(): string { return demoClock ?? localDate(); }
const localDate = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const display = (date: string) => date.split("-").reverse().join("/");
const monthEnd = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isInteger(year) && month >= 1 && month <= 12 && day === new Date(Date.UTC(year, month, 0)).getUTCDate();
};
const nextMonth = (date: string) => {
  const [year, month] = date.split("-").map(Number);
  return `${year + (month === 12 ? 1 : 0)}-${String(month === 12 ? 1 : month + 1).padStart(2, "0")}-01`;
};
const hasDebt = (state: LifecycleState, tenantId: string) => state.invoices.some((invoice) => state.contracts.some((contract) => contract.id === invoice.contractId && contract.tenantId === tenantId) && invoice.status !== "Đã thu");
const password = () => `${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}A!`;
const invoiceFor = (contract: ContractRecord, period: string, amount: number): Invoice => ({
  id: crypto.randomUUID(), tenantId: contract.tenantId, contractId: contract.id, billingPeriod: period,
  tenant: contract.tenantName, room: contract.room, bed: contract.bed, amount,
  due: display(`${period.slice(0, 7)}-05`), status: "Nợ", kind: `Tiền phòng tháng ${period.slice(5, 7)}`,
});

export function onboard(state: LifecycleState, input: OnboardingInput, asOfDate?: string): { state: LifecycleState; result: OnboardingResult } {
  const today = asOfDate ?? getDemoDate();
  if (!today.endsWith("-01") || input.startDate !== today) throw new Error("Chỉ tiếp nhận vào ngày 01 và ngày bắt đầu phải là hôm nay.");
  if (!monthEnd(input.endDate) || input.endDate < input.startDate) throw new Error("Ngày kết thúc phải là ngày cuối tháng và không trước ngày bắt đầu.");
  if (!/^\d{12}$/.test(input.cccd) || !/^\S+@\S+\.\S+$/.test(input.email) || !input.name.trim() || !input.phone.trim() || !input.address.trim() || !Number.isSafeInteger(input.deposit) || input.deposit < 0) throw new Error("Thông tin người thuê hoặc tiền cọc không hợp lệ.");
  const room = state.rooms.find((item) => !item.deletedAt && Object.values(item.bedOverrides ?? {}).some((bed) => bed.id === input.bedId));
  const entry = room && Object.entries(room.bedOverrides ?? {}).find(([, bed]) => bed.id === input.bedId);
  if (!room || !entry || entry[1].status !== "AVAILABLE" || room.gender !== input.gender) throw new Error("Giường không còn trống hoặc giới tính phòng không phù hợp.");
  const [bedCode, bed] = entry;
  const existing = state.tenants.find((item) => item.cccd === input.cccd);
  if (existing && (existing.status !== "Đã trả phòng" || hasDebt(state, existing.id))) throw new Error("Khách đang thuê hoặc còn hóa đơn nợ/chờ xác nhận.");
  if (state.tenants.some((item) => item.id !== existing?.id && item.email.toLowerCase() === input.email.trim().toLowerCase())) throw new Error("Email đã được sử dụng.");
  if (state.contracts.some((item) => item.status !== "Đã thanh lý" && (item.bedId === input.bedId || item.tenantId === existing?.id))) throw new Error("Giường hoặc người thuê đã có hợp đồng hiệu lực.");
  const userId = existing?.userId ?? crypto.randomUUID();
  const tenant: TenantRecord = { ...existing, id: existing?.id ?? crypto.randomUUID(), userId, name: input.name.trim(), gender: input.gender, phone: input.phone.trim(), cccd: input.cccd, email: input.email.trim().toLowerCase(), address: input.address.trim(), room: room.code, bed: bedCode, start: display(input.startDate), end: display(input.endDate), monthlyRent: room.basePrice, deposit: input.deposit, status: "Đang thuê" };
  const contract: ContractRecord = { id: crypto.randomUUID(), tenantId: tenant.id, tenantName: tenant.name, room: room.code, roomId: room.id, bed: bedCode, bedId: input.bedId, startDate: input.startDate, endDate: input.endDate, deposit: input.deposit, monthlyRent: room.basePrice, status: "Hiệu lực", renewals: [], documents: [] };
  const initialPassword = existing ? undefined : password();
  const accounts = initialPassword ? [...state.accounts, { id: userId, identifier: tenant.cccd, email: tenant.email, role: "tenant" as const, name: tenant.name, password: initialPassword, tenantId: tenant.id }] : state.accounts;
  return { state: { ...state, accounts, tenants: [tenant, ...state.tenants.filter((item) => item.id !== tenant.id)], contracts: [contract, ...state.contracts], invoices: [invoiceFor(contract, input.startDate, room.basePrice), ...state.invoices], rooms: state.rooms.map((item) => item.id === room.id ? { ...item, bedOverrides: { ...item.bedOverrides, [bedCode]: { ...bed, status: "OCCUPIED" } } } : item) }, result: { tenant, initialPassword } };
}

export function renew(state: LifecycleState, id: string, endDate: string, asOfDate?: string): LifecycleState {
  const contract = state.contracts.find((item) => item.id === id);
  if (!contract || contract.status === "Đã thanh lý") throw new Error("Hợp đồng không còn hiệu lực.");
  const today = asOfDate ?? getDemoDate();
  if (today > contract.endDate || hasDebt(state, contract.tenantId)) throw new Error("Hợp đồng đã hết hạn hoặc khách còn nợ/chờ xác nhận.");
  if (!monthEnd(endDate) || endDate <= contract.endDate) throw new Error("Hạn mới phải là ngày cuối tháng sau hạn hiện tại.");
  const room = state.rooms.find((item) => item.id === contract.roomId);
  if (!room) throw new Error("Không tìm thấy phòng của hợp đồng.");
  const startDate = nextMonth(contract.endDate);
  const renewal = { id: crypto.randomUUID(), contractId: id, startDate, endDate, monthlyRent: room.basePrice, signedAt: today };
  const updated: ContractRecord = { ...contract, endDate, status: "Hiệu lực", renewals: [...(contract.renewals ?? []), renewal] };
  const next = nextMonth(today);
  const shouldIssue = Number(today.slice(8, 10)) >= 25 && next >= startDate && next <= endDate && !state.invoices.some((item) => item.contractId === id && item.billingPeriod === next);
  return { ...state, contracts: state.contracts.map((item) => item.id === id ? updated : item), tenants: state.tenants.map((item) => item.id === contract.tenantId ? { ...item, end: display(endDate), status: "Đang thuê" } : item), invoices: shouldIssue ? [invoiceFor(updated, next, renewal.monthlyRent), ...state.invoices] : state.invoices };
}

export function checkout(state: LifecycleState, id: string, status: "AVAILABLE" | "MAINTENANCE"): LifecycleState {
  const contract = state.contracts.find((item) => item.id === id);
  if (!contract || contract.status === "Đã thanh lý") throw new Error("Hợp đồng không còn hiệu lực.");
  if (status !== "AVAILABLE" && status !== "MAINTENANCE") throw new Error("Phải chọn trạng thái giường sau bàn giao.");
  const room = state.rooms.find((item) => item.id === contract.roomId);
  const entry = room && Object.entries(room.bedOverrides ?? {}).find(([, bed]) => bed.id === contract.bedId);
  if (!room || !entry || entry[1].status !== "OCCUPIED") throw new Error("Không tìm thấy giường đang thuê của hợp đồng.");
  const [code, bed] = entry;
  return { ...state, rooms: state.rooms.map((item) => item.id === room.id ? { ...item, bedOverrides: { ...item.bedOverrides, [code]: { ...bed, status } } } : item), tenants: state.tenants.map((item) => item.id === contract.tenantId ? { ...item, status: "Đã trả phòng" } : item), contracts: state.contracts.map((item) => item.id === id ? { ...item, status: "Đã thanh lý" } : item), vehicles: state.vehicles.map((item) => item.tenantId === contract.tenantId && item.cardStatus !== "Đã thu hồi" ? { ...item, cardStatus: "Đã thu hồi" } : item) };
}
