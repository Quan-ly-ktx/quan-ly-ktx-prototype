import type { LoginRequest, UserProfile } from "../../types/auth.ts";
import { getMockSnapshot, updateMockSnapshot } from "./mockStore.ts";

function accounts() {
  const state = getMockSnapshot();
  return state.accounts.filter((account) => account.id !== "demo-checkout").map((account) => {
    const tenant = account.tenantId ? state.tenants.find((item) => item.id === account.tenantId) : undefined;
    return tenant ? { ...account, identifier: tenant.cccd, name: tenant.name } : account;
  });
}
function demoTenants() {
  return getMockSnapshot().tenants;
}
function staffAccountId(id: string): string {
  return getMockSnapshot().staff.find((staff) => staff.id === id)?.userId ?? id;
}
export function addDemoTechnician(id: string, identifier: string, name: string, password: string) {
  const accountId = staffAccountId(id);
  const existing = accounts().find((account) => account.id === accountId);
  if (existing && existing.role === "technician" && existing.identifier.toLowerCase() === identifier.trim().toLowerCase() && existing.name === name && existing.password === password) return;
  if (!demoEmailAvailable(identifier, id)) throw new Error("Email đã được sử dụng.");
  updateMockSnapshot((state) => {
    if (state.accounts.some((account) => account.id === accountId)) throw new Error("Tài khoản kỹ thuật viên đã tồn tại.");
    return { ...state, accounts: [...state.accounts, { id: accountId, staffId: id, identifier, email: identifier, name, password, role: "technician" }] };
  });
}
export function demoEmailAvailable(identifier: string, exceptId?: string): boolean {
  const state = getMockSnapshot();
  const email = identifier.trim().toLowerCase();
  const exceptAccountId = exceptId ? state.staff.find((staff) => staff.id === exceptId)?.userId ?? exceptId : undefined;
  return !state.tenants.some((tenant) => tenant.id !== exceptId && tenant.email.trim().toLowerCase() === email)
    && !state.accounts.some((account) => account.id !== exceptAccountId && (!exceptId || account.tenantId !== exceptId) && (account.email ?? account.identifier).trim().toLowerCase() === email);
}
export function updateDemoTechnician(id: string, identifier: string, name: string) {
  if (!demoEmailAvailable(identifier, id)) throw new Error("Email đã được sử dụng.");
  const accountId = staffAccountId(id);
  updateMockSnapshot((state) => ({ ...state, accounts: state.accounts.map((account) => account.id === accountId ? { ...account, identifier, email: identifier, name } : account) }));
}
export function resetDemoTechnician(id: string, identifier: string, name: string, password: string) {
  if (!demoEmailAvailable(identifier, id)) throw new Error("Email đã được sử dụng.");
  const accountId = staffAccountId(id);
  updateMockSnapshot((state) => {
    const existing = state.accounts.find((account) => account.id === accountId);
    return { ...state, accounts: existing
      ? state.accounts.map((account) => account.id === accountId ? { ...account, identifier, email: identifier, name, password } : account)
      : [...state.accounts, { id: accountId, staffId: id, identifier, email: identifier, name, password, role: "technician" }] };
  });
}
let currentId: string | null = null;
let challenge: { identifier: string; otp: string; expires: number; attempts: number; verified: boolean } | null = null;
export async function demoLogin(req: LoginRequest): Promise<UserProfile> {
  const account = accounts().find((a) => a.identifier.toLowerCase() === req.identifier.trim().toLowerCase());
  if (!account || account.password !== req.password) throw new Error("Thông tin đăng nhập không hợp lệ.");
  const staff = account.role !== "tenant" ? getMockSnapshot().staff.find((item) => item.userId === account.id) : undefined;
  if (account.role === "technician" && !staff?.active) throw new Error("Thông tin đăng nhập không hợp lệ.");
  const tenant = account.role === "tenant" ? demoTenants().find((item) => item.id === account.tenantId && item.cccd === account.identifier) : undefined;
  if (account.role === "tenant" && !tenant) throw new Error("Thông tin đăng nhập không hợp lệ.");
  currentId = account.id;
  return {
    userId: account.id,
    staffId: staff?.id,
    name: tenant?.name ?? account.name,
    email: tenant?.email ?? account.identifier,
    role: account.role,
    tenantId: tenant?.id,
    residentStatus: tenant ? (tenant.status === "Đã trả phòng" ? "CHECKED_OUT" : "ACTIVE") : undefined,
  };
}
export function demoLogout() { currentId = null; }
export function demoChangePassword(oldPassword: string, newPassword: string) {
  const all = accounts();
  const account = all.find((a) => a.id === currentId);
  if (!account || account.password !== oldPassword) throw new Error("Mật khẩu hiện tại không đúng.");
  updateMockSnapshot((state) => ({ ...state, accounts: state.accounts.map((item) => item.id === account.id ? { ...item, password: newPassword } : item) }));
  demoLogout();
}
export function demoRequestOtp(identifier: string): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const otp = String(bytes[0] % 1000000).padStart(6, "0");
  challenge = { identifier: identifier.trim().toLowerCase(), otp, expires: Date.now() + 300000, attempts: 0, verified: false };
  return otp;
}
export function demoVerifyOtp(identifier: string, otp: string) {
  if (!challenge || challenge.identifier !== identifier.trim().toLowerCase() || challenge.expires <= Date.now() || challenge.attempts >= 5 || challenge.verified) throw new Error("Mã không hợp lệ hoặc đã hết hạn.");
  challenge = { ...challenge, attempts: challenge.attempts + 1 };
  if (challenge.otp !== otp) throw new Error("Mã không hợp lệ hoặc đã hết hạn.");
  challenge = { ...challenge, verified: true };
}
export function demoResetPassword(identifier: string, password: string) {
  if (!challenge || !challenge.verified || challenge.identifier !== identifier.trim().toLowerCase() || challenge.expires <= Date.now()) throw new Error("Yêu cầu đặt lại không hợp lệ hoặc đã hết hạn.");
  const target = challenge.identifier;
  updateMockSnapshot((state) => ({ ...state, accounts: state.accounts.map((account) => account.identifier.toLowerCase() === target ? { ...account, password } : account) }));
  challenge = null;
}
