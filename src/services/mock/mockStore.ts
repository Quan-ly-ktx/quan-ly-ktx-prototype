import type { Role } from "../../types/auth.ts";
import type { Invoice, FacilityExpense } from "../../types/invoice.ts";
import type { RoomRecord } from "../../types/room.ts";
import type { TenantRecord, ContractRecord, TenantVehicle } from "../../types/tenant.ts";
import type { Ticket } from "../../types/incident.ts";
import type { TechnicianResponse } from "../../types/api/endpoints.ts";
import type { IncidentViolation, IncidentNotification } from "./incidentStore.ts";
import { initialRooms, initialTenants, initialInvoices, initialTickets, initialVehicles, initialFacilityExpenses } from "./mockData.ts";

export type MockAccount = { id: string; identifier: string; role: Role; name: string; password: string; tenantId?: string; staffId?: string; email?: string; status?: string };
export type MockStaff = TechnicianResponse & { userId: string; role?: "manager" | "technician" };
export type MockSnapshot = { rooms: RoomRecord[]; tenants: TenantRecord[]; invoices: Invoice[]; contracts: ContractRecord[]; vehicles: TenantVehicle[]; accounts: MockAccount[]; staff: MockStaff[]; tickets: Ticket[]; violations: IncidentViolation[]; notifications: IncidentNotification[]; expenses: FacilityExpense[]; legacySnapshot?: unknown };
const KEY = "dorm_mock_snapshot_v2";
const SAMPLE_VALID_PDF_DATA_URL = "data:application/pdf;base64,JVBERi0xLjcKJYGBgYEKCjcgMCBvYmoKPDwKL0ZpbHRlciAvRmxhdGVEZWNvZGUKL0xlbmd0aCA1ODMKPj4Kc3RyZWFtCniclZTfitQwFMbv+xS5FnZNTs6fBERwph288EboC4juirIiK+Lz+5203XaYjoyENmlPmv7Od77kuTuMXbxPYbl+fe1ev394+vPw+9vnT3eHn09f7izWwiVaqSHlMD52xGH80GE+WgpJY7Ca7hEef3RvOPOJBzaKXDBKFKX4vT1V9JmLCHrMwbvaZih6EW5vE/dvw/i9G191w9h97J4nRArLdY5YjUkLiZaQ0iUdJQlm+YWO9aSZoh41WaRIPf7OBh5FZHrmokkHrBktajHRvMMDEsYf9/SiGGOJUosG/HxHLxDlVS/oIiBhXnQTdoUYTDKpNql5kOoxRPKk6f+o1MCqYUHFKrYrFeqomzr2ispo0ZPr5OpAE8vvWiWZ+kw54lKMYmuYTYi0eiID1HFgaMhHcNddBdHOKU2MJGd15eI+oK6ApKID0Hw+SmfciiUNY44BpjZkchyAJcjXRg3LRWVxSBecboMsLDGVmFzFK5B8AbkLRzPcQd1x2R0HnUV7Twej5N8Ztb5VwiswezS3xv593m97/thLR+FUS8XK1XToJR3ZYCwpOQIMPOTshpjxTGG2jWUMsezJb1fgAWn3t5oDdWJVyvk6aFxBuf2mNgenbQVmxRKd5vvi40l7zEQiUzSv0t0H+L8u+k2F+2e8mU/d141eFv51+9Tdv9z+3L3f/766/3p3+Pv27wfvLh+L3v1D4y7kG9eYmRkmZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMyAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgMSAwIFIKL0YyIDIgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NS4yOCA4NDEuODldCi9Db250ZW50cyA3IDAgUgo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EtQm9sZAovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs2IDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9Qcm9kdWNlciAocGRmLWxpYiAxfCAxLjExLjEpCi9Nb2REYXRlIChEOjIwMjYxMTExMjIwOTQzWikKL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MTExMTIyMDk0M1opCj4+CmVuZG9iagp4cmVmCjAgOAowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDkxMCAwMDAwMCBuCjAwMDAwMDEwMTMgMDAwMDAgbgowMDAwMDAxMTEwIDAwMDAwIG4KMDAwMDAwMTE2OSAwMDAwMCBuCjAwMDAwMDEyMTkgMDAwMDAgbgowMDAwMDAwNzI1IDAwMDAwIG4KMDAwMDAwMDAxNSAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgOAovUm9vdCA0IDAgUgovSW5mbyA1IDAgUgo+PgpzdGFydHhyZWYKMTM1NQolJUVPRgo=";
const listeners = new Set<() => void>();
let memory: MockSnapshot | undefined;
const uuid = () => crypto.randomUUID();
const iso = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : date.split("/").reverse().join("-");
const defaults: MockAccount[] = [
  { id: "demo-manager", identifier: "manager@gmail.com", role: "manager", name: "Quản lý KTX", password: "Demo1234!" },
  { id: "demo-tenant", identifier: "079203001187", role: "tenant", name: "Nguyễn Hoàng Nam", password: "Demo1234!", tenantId: "NT-0187" },
  { id: "tech-1", identifier: "thinh.vv@ktxhub.vn", role: "technician", name: "Võ Văn Thịnh", password: "Demo1234!", staffId: "tech-1" },
];
const defaultStaff: MockStaff[] = [
  { id: "demo-manager-staff", userId: "demo-manager", role: "manager", fullName: "Quản lý KTX", email: "manager@gmail.com", phone: "", active: true, userStatus: "ACTIVE", createdAt: "2024-01-01T00:00:00Z" },
  { id: "tech-1", userId: "tech-1", fullName: "Võ Văn Thịnh", email: "thinh.vv@ktxhub.vn", phone: "0908 112 245", active: true, userStatus: "ACTIVE", createdAt: "2024-01-15T08:00:00Z" },
  { id: "tech-2", userId: "tech-2", fullName: "Lâm Quốc Huy", email: "huy.lq@ktxhub.vn", phone: "0912 334 556", active: false, userStatus: "INACTIVE", createdAt: "2024-02-10T09:30:00Z" },
];
function beds(room: RoomRecord): RoomRecord {
  const existing = room.bedOverrides ?? {};
  const entries = Object.entries(existing).map(([code, bed]) => [code, { id: bed.id || uuid(), roomId: room.id, status: bed.status ?? "AVAILABLE" }]);
  for (let index = 1; index <= room.total; index++) {
    const code = `G${String(index).padStart(2, "0")}`;
    if (!entries.some(([key]) => key === code)) entries.push([code, { id: uuid(), roomId: room.id, status: "AVAILABLE" }]);
  }
  return { ...room, bedOverrides: Object.fromEntries(entries) };
}
function seed(): MockSnapshot {
  const former: TenantRecord = { id: "f5000000-0000-4000-8000-000000000001", userId: "f5000000-0000-4000-8000-000000000002", name: "Khách demo đã trả phòng", email: "khach-cu@example.invalid", phone: "0900000000", gender: "Nam", cccd: "000000000001", address: "Địa chỉ demo", room: "P.302", bed: "G03", start: "01/01/2026", end: "31/03/2026", monthlyRent: 1500000, deposit: 1500000, status: "Đã trả phòng" };
  const tenants = [...initialTenants.map((tenant) => { const end = iso(tenant.end); const [year, month] = end.split("-").map(Number); return { ...tenant, end: `${new Date(Date.UTC(year, month, 0)).getUTCDate()}/${end.slice(5, 7)}/${year}` }; }), former];
  const rooms = initialRooms.map((item, roomIndex) => {
    const room = beds(item);
    const overrides = Object.fromEntries(Object.entries(room.bedOverrides ?? {}).map(([code, bed], bedIndex) => [code, { ...bed, id: `b0000000-0000-4000-8000-${String(roomIndex * 100 + bedIndex + 1).padStart(12, "0")}`, status: tenants.some((tenant) => tenant.room === room.code && tenant.bed === code && tenant.status !== "Đã trả phòng") ? "OCCUPIED" as const : room.id === "RM-101" && code === "G01" ? "MAINTENANCE" as const : bed.status }]));
    return { ...room, bedOverrides: overrides };
  });
  const contracts: ContractRecord[] = tenants.map((tenant, index) => {
    const room = rooms.find((item) => item.code === tenant.room)!;
    const bed = room.bedOverrides![tenant.bed];
    const id = `c0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
    const sampleDocs = tenant.id === former.id ? [{
      id: "doc-sample-former-contract",
      contractId: id,
      name: "hop-dong-thue-phong-p302.pdf",
      size: 1451,
      type: "application/pdf",
      category: "ORIGINAL_CONTRACT" as const,
      uploadedAt: "2026-01-01T08:00:00Z",
      content: SAMPLE_VALID_PDF_DATA_URL,
    }] : [];
    return { id, tenantId: tenant.id, tenantName: tenant.name, room: room.code, roomId: room.id, bed: tenant.bed, bedId: bed.id, startDate: iso(tenant.start), endDate: iso(tenant.end), deposit: tenant.deposit, monthlyRent: tenant.monthlyRent, status: tenant.status === "Đã trả phòng" ? "Đã thanh lý" : "Hiệu lực", documents: sampleDocs, renewals: tenant.id === "NT-0188" ? [{ id: "d0000000-0000-4000-8000-000000000001", contractId: id, startDate: "2027-10-01", endDate: "2028-09-30", monthlyRent: tenant.monthlyRent, signedAt: "2027-09-01" }] : [] };
  });
  const invoices: Invoice[] = initialInvoices.filter((item) => item.tenantId && contracts.some((contract) => contract.tenantId === item.tenantId)).map((item) => ({ ...item, contractId: contracts.find((contract) => contract.tenantId === item.tenantId)!.id }));
  invoices.push({ id: "e0000000-0000-4000-8000-000000000001", tenantId: former.id, contractId: contracts.find((contract) => contract.tenantId === former.id)!.id, billingPeriod: "2026-03-01", tenant: former.name, room: former.room, bed: former.bed, amount: former.monthlyRent, due: "05/03/2026", status: "Nợ" });
  const accounts = [...defaults, ...tenants.filter((tenant) => tenant.userId !== "demo-tenant").map((tenant) => ({ id: tenant.userId, tenantId: tenant.id, identifier: tenant.cccd, role: "tenant" as const, name: tenant.name, email: tenant.email, password: "Demo1234!" })), { id: "tech-2", identifier: "huy.lq@ktxhub.vn", role: "technician" as const, name: "Lâm Quốc Huy", password: "Demo1234!", staffId: "tech-2" }];
  const tickets = [initialTickets[2], initialTickets[3]].map((ticket, index) => { const tenant = tenants[index]; const room = rooms.find((item) => item.code === tenant.room)!; return { ...ticket, reporterTenantId: tenant.id, reporter: tenant.name, phone: tenant.phone, roomId: room.id, room: room.code, bed: tenant.bed, bedId: room.bedOverrides![tenant.bed].id, ...(ticket.assignee ? { assigneeStaffId: "tech-1" } : {}) }; });
  return { rooms, tenants, contracts, invoices, accounts, staff: defaultStaff, tickets, vehicles: [...initialVehicles, { id: "a0000000-0000-4000-8000-000000000001", tenantId: former.id, plate: "DEMO-001", type: "Xe đạp", brand: "Demo", color: "Xám", cardStatus: "Đã thu hồi" }], violations: [], notifications: [], expenses: initialFacilityExpenses };
}
function unique<T>(items: T[], label: string): T {
  if (items.length !== 1) throw new Error(`Không thể chuyển dữ liệu cũ: ${label} (${items.length} kết quả). Dữ liệu gốc được giữ nguyên.`);
  return items[0];
}
function mergeById<T extends { id: string }>(first: T[], second: T[], label: string): T[] {
  const merged = [...first];
  for (const item of second) {
    const existing = merged.find((entry) => entry.id === item.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(item)) throw new Error(`Không thể chuyển ${label} ${item.id}: dữ liệu trùng ID nhưng khác nhau.`);
    if (!existing) merged.push(item);
  }
  return merged;
}
function readLegacy<T>(key: string): T | undefined {
  const raw = localStorage.getItem(key);
  return raw === null ? undefined : JSON.parse(raw) as T;
}
function migrate(old: Partial<MockSnapshot>, legacyAccounts?: MockAccount[], legacyStaff?: TechnicianResponse[], events?: { violations: IncidentViolation[]; notifications: IncidentNotification[] }, expenses?: FacilityExpense[]): MockSnapshot {
  const base = seed();
  const rooms = (old.rooms ?? base.rooms).map(beds);
  const accounts = mergeById(old.accounts ?? [], legacyAccounts ?? [], "tài khoản");
  if (!accounts.some((account) => account.role === "manager")) accounts.push(defaults[0]);
  if (!old.tenants) accounts.push(...base.accounts.filter((account) => !accounts.some((item) => item.id === account.id)));
  if (old.tenants?.some((tenant) => tenant.id === "NT-0187") && !accounts.some((account) => account.tenantId === "NT-0187")) accounts.push(defaults[1]);
  const sourceTenants = old.tenants ?? base.tenants;
  const tenants = sourceTenants.map((tenant) => {
    const candidates = accounts.filter((account) => account.tenantId === tenant.id);
    const matching = tenant.userId ? unique(accounts.filter((account) => account.id === tenant.userId), `tài khoản người thuê ${tenant.id}`) : unique(candidates, `tài khoản người thuê ${tenant.id}`);
    const account = matching;
    return { ...tenant, userId: account.id };
  });
  if (!old.accounts && !legacyAccounts) accounts.push(...base.accounts.filter((account) => !accounts.some((item) => item.id === account.id)));
  const storedStaff = mergeById<TechnicianResponse>(old.staff ?? [], legacyStaff ?? [], "nhân viên");
  const staff: MockStaff[] = storedStaff.length ? storedStaff.map((member) => ({ ...member, userId: "userId" in member && typeof member.userId === "string" ? member.userId : member.id })) : [...base.staff];
  for (const account of accounts.filter((item) => item.role === "manager" && !staff.some((member) => member.userId === item.id))) {
    staff.push({ id: account.id === "demo-manager" ? "demo-manager-staff" : crypto.randomUUID(), userId: account.id, role: "manager", fullName: account.name, email: account.email ?? account.identifier, phone: "", active: account.status !== "INACTIVE" && account.status !== "LOCKED", userStatus: account.status === "LOCKED" ? "LOCKED" : account.status === "INACTIVE" ? "INACTIVE" : "ACTIVE", createdAt: "2024-01-01T00:00:00Z" });
  }
  for (const member of staff) {
    if (accounts.some((account) => account.id === member.userId)) continue;
    const defaultAccount = base.accounts.find((account) => account.id === member.userId);
    if (!defaultAccount) throw new Error(`Không thể chuyển nhân viên ${member.id}: thiếu tài khoản tương ứng.`);
    accounts.push(defaultAccount);
  }
  const contracts = (old.contracts ?? base.contracts).map((contract) => {
    const room = contract.roomId ? unique(rooms.filter((item) => item.id === contract.roomId), `phòng hợp đồng ${contract.id}`) : unique(rooms.filter((item) => item.code === contract.room), `phòng hợp đồng ${contract.id}`);
    const bed = contract.bedId ? unique(Object.values(room.bedOverrides ?? {}).filter((item) => item.id === contract.bedId), `giường hợp đồng ${contract.id}`) : unique(Object.entries(room.bedOverrides ?? {}).filter(([code]) => code === contract.bed).map(([, item]) => item), `giường hợp đồng ${contract.id}`);
    unique(tenants.filter((item) => item.id === contract.tenantId), `người thuê hợp đồng ${contract.id}`);
    return { ...contract, roomId: room.id, bedId: bed.id };
  });
  const invoices = (old.invoices ?? base.invoices).map((invoice) => {
    const candidates = invoice.contractId ? contracts.filter((item) => item.id === invoice.contractId) : invoice.tenantId ? contracts.filter((item) => item.tenantId === invoice.tenantId) : [];
    const contract = unique(candidates, `hóa đơn ${invoice.id}`);
    if (invoice.tenantId && invoice.tenantId !== contract.tenantId) throw new Error(`Không thể chuyển hóa đơn ${invoice.id}: người thuê không khớp hợp đồng.`);
    const due = iso(invoice.due);
    const billingPeriod = invoice.billingPeriod ?? (/^\d{4}-\d{2}-\d{2}$/.test(due) ? `${due.slice(0, 7)}-01` : "");
    if (!billingPeriod) throw new Error(`Không thể chuyển kỳ hóa đơn ${invoice.id}.`);
    return { ...invoice, contractId: contract.id, billingPeriod };
  });
  const tickets = (old.tickets ?? base.tickets).map((ticket) => {
    const room = unique(rooms.filter((item) => ticket.roomId ? item.id === ticket.roomId : item.code === ticket.room), `phòng phiếu ${ticket.id}`);
    const reporter = unique(tenants.filter((item) => item.id === ticket.reporterTenantId), `người báo phiếu ${ticket.id}`);
    const bed = ticket.bedId ? unique(Object.values(room.bedOverrides ?? {}).filter((item) => item.id === ticket.bedId), `giường phiếu ${ticket.id}`) : ticket.bed ? unique(Object.entries(room.bedOverrides ?? {}).filter(([code]) => code === ticket.bed).map(([, item]) => item), `giường phiếu ${ticket.id}`) : undefined;
    if (ticket.assignee && !ticket.assigneeStaffId) throw new Error(`Không thể chuyển người xử lý phiếu ${ticket.id} khi thiếu ID.`);
    const assignee = ticket.assigneeStaffId ? unique(staff.filter((item) => item.id === ticket.assigneeStaffId), `nhân viên phiếu ${ticket.id}`) : undefined;
    return { ...ticket, reporterTenantId: reporter.id, roomId: room.id, bedId: bed?.id, assigneeStaffId: assignee?.id };
  });
  const vehicles = old.vehicles ?? base.vehicles;
  const violations = mergeById(old.violations ?? [], events?.violations ?? [], "vi phạm");
  const notifications = mergeById(old.notifications ?? [], events?.notifications ?? [], "thông báo");
  for (const item of [...vehicles, ...violations, ...notifications]) unique(tenants.filter((tenant) => tenant.id === item.tenantId), `người thuê bản ghi ${item.id}`);
  return { ...base, ...old, legacySnapshot: Object.keys(old).length ? old : undefined, rooms, tenants, accounts, staff, contracts, invoices, tickets, vehicles, violations, notifications, expenses: old.expenses && expenses ? mergeById(old.expenses, expenses, "chi phí") : old.expenses ?? expenses ?? base.expenses };
}
function load(): MockSnapshot {
  if (typeof localStorage === "undefined") return seed();
  const old = readLegacy<Partial<MockSnapshot>>(KEY);
  if (old && Array.isArray(old.staff) && Array.isArray(old.violations) && Array.isArray(old.notifications) && Array.isArray(old.expenses)) {
    const formerId = "f5000000-0000-4000-8000-000000000001";
    const formerContract = old.contracts?.find((c) => c.tenantId === formerId);
    if (formerContract && (!formerContract.documents || formerContract.documents.length === 0)) {
      formerContract.documents = [{
        id: "doc-sample-former-contract",
        contractId: formerContract.id,
        name: "hop-dong-thue-phong-p302.pdf",
        size: 1451,
        type: "application/pdf",
        category: "ORIGINAL_CONTRACT",
        uploadedAt: "2026-01-01T08:00:00Z",
        content: SAMPLE_VALID_PDF_DATA_URL,
      }];
    }
    return old as MockSnapshot;
  }
  const legacyAccounts = readLegacy<MockAccount[]>("dorm_demo_credentials");
  const legacyStaff = readLegacy<TechnicianResponse[]>("dorm_mock_technicians");
  const events = readLegacy<{ violations: IncidentViolation[]; notifications: IncidentNotification[] }>("dorm_mock_incident_events");
  const expenses = readLegacy<FacilityExpense[]>("dorm_facility_expenses");
  const next = old || legacyAccounts || legacyStaff || events || expenses ? migrate(old ?? {}, legacyAccounts, legacyStaff, events, expenses) : seed();
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
export function getMockSnapshot(): MockSnapshot { return structuredClone(memory ??= load()); }
export function updateMockSnapshot(change: (state: MockSnapshot) => MockSnapshot): MockSnapshot {
  const next = change(getMockSnapshot());
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (error) {
      const isQuota = error instanceof Error && (error.name === "QuotaExceededError" || error.message.includes("quota"));
      if (isQuota) throw new Error("Dung lượng bộ nhớ trình duyệt đã đầy (quota exceeded). Vui lòng xóa bớt tài liệu demo hoặc dùng tệp nhỏ hơn.");
      throw error;
    }
  }
  memory = structuredClone(next);
  for (const listener of listeners) queueMicrotask(listener);
  return structuredClone(next);
}
export function resetMockSnapshot(): MockSnapshot { return updateMockSnapshot(() => seed()); }
export function subscribeMockSnapshot(listener: () => void): () => void { listeners.add(listener); return () => { listeners.delete(listener); }; }
