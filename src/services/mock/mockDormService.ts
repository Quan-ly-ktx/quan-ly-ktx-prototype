import type { DormService } from "../dormService.ts";
import type { RoomRecord, BedStatus, TenantRecord, Invoice, Ticket } from "../../types/index.ts";
import type { ContractDocumentRecord, ContractRecord, OnboardingInput, TenantVehicle } from "../../types/tenant.ts";
import type { FacilityExpense, PaymentProof } from "../../types/invoice.ts";
import { onboard, renew, checkout } from "./contractLifecycle.ts";
import { demoEmailAvailable } from "./mockAuth.ts";
import { getMockSnapshot, updateMockSnapshot, resetMockSnapshot, type MockSnapshot } from "./mockStore.ts";

function bedIds(room: RoomRecord): RoomRecord {
  return { ...room, bedOverrides: Object.fromEntries(Array.from({ length: room.total }, (_, index) => {
    const code = `G${String(index + 1).padStart(2, "0")}`;
    const bed = room.bedOverrides?.[code];
    return [code, { id: bed?.id ?? crypto.randomUUID(), roomId: room.id, status: bed?.status ?? "AVAILABLE" }];
  })) };
}

function validateTicket(ticket: Ticket, state: MockSnapshot): void {
  const tenant = state.tenants.find((item) => item.id === ticket.reporterTenantId);
  if (!tenant || tenant.status === "Đã trả phòng") throw new Error("Người báo không còn cư trú.");
  const room = state.rooms.find((item) => item.id === ticket.roomId);
  if (!room || room.deletedAt) throw new Error("Không tìm thấy phòng của phiếu.");
  if (!state.contracts.some((contract) => contract.tenantId === tenant.id && contract.roomId === room.id && contract.status !== "Đã thanh lý")) throw new Error("Người báo không cư trú tại phòng.");
  if (ticket.bedId && !Object.values(room.bedOverrides ?? {}).some((bed) => bed.id === ticket.bedId)) throw new Error("Giường không thuộc phòng của phiếu.");
  if (ticket.assigneeStaffId && !state.staff.some((staff) => staff.id === ticket.assigneeStaffId && staff.active && state.accounts.some((account) => account.id === staff.userId && account.role === "technician" && account.status !== "INACTIVE" && account.status !== "LOCKED"))) throw new Error("Không tìm thấy kỹ thuật viên đang hoạt động.");
}
function ticketDisplay(ticket: Ticket, state: MockSnapshot): Ticket {
  validateTicket(ticket, state);
  const tenant = state.tenants.find((item) => item.id === ticket.reporterTenantId)!;
  const room = state.rooms.find((item) => item.id === ticket.roomId)!;
  const bed = Object.entries(room.bedOverrides ?? {}).find(([, item]) => item.id === ticket.bedId)?.[0];
  return { ...ticket, reporter: tenant.name, phone: tenant.phone, room: room.code, bed, assignee: state.staff.find((item) => item.id === ticket.assigneeStaffId)?.fullName };
}
function managerFor(state: MockSnapshot, staffId: string) {
  const staff = state.staff.find((item) => item.id === staffId && item.active);
  if (!staff || !state.accounts.some((account) => account.id === staff.userId && account.role === "manager" && account.status !== "INACTIVE" && account.status !== "LOCKED")) throw new Error("Không tìm thấy quản lý đang hoạt động.");
  return staff;
}
function validateExpense(expense: FacilityExpense): void {
  if (!expense.id || !expense.title.trim() || !expense.expenseDate || !Number.isSafeInteger(expense.amount) || expense.amount <= 0 || !["Điện EVN", "Nước", "Internet", "Khác"].includes(expense.category)) throw new Error("Thông tin chi phí không hợp lệ.");
}

class MockDormServiceImpl implements DormService {
  private get state(): MockSnapshot { return getMockSnapshot(); }
  private commit(next: MockSnapshot): void { updateMockSnapshot(() => next); }
  async getRooms() { return [...this.state.rooms]; }
  async getTenants() { return [...this.state.tenants]; }
  async getInvoices() { return [...this.state.invoices]; }
  async getExpenses(): Promise<FacilityExpense[]> { return this.state.expenses; }
  async createExpense(expense: FacilityExpense): Promise<FacilityExpense> {
    validateExpense(expense);
    if (this.state.expenses.some((item) => item.id === expense.id)) throw new Error("Mã chi phí đã tồn tại.");
    this.commit({ ...this.state, expenses: [expense, ...this.state.expenses] });
    return expense;
  }
  async updateExpense(id: string, expense: FacilityExpense): Promise<FacilityExpense> {
    validateExpense(expense);
    if (expense.id !== id || !this.state.expenses.some((item) => item.id === id)) throw new Error("Không tìm thấy chi phí.");
    this.commit({ ...this.state, expenses: this.state.expenses.map((item) => item.id === id ? expense : item) });
    return expense;
  }
  async deleteExpense(id: string): Promise<void> {
    if (!this.state.expenses.some((item) => item.id === id)) throw new Error("Không tìm thấy chi phí.");
    this.commit({ ...this.state, expenses: this.state.expenses.filter((item) => item.id !== id) });
  }
  async updateTenantProfile(id: string, profile: Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender">): Promise<TenantRecord> {
    const tenant = this.state.tenants.find((item) => item.id === id);
    if (!tenant) throw new Error("Không tìm thấy hồ sơ.");
    if (!profile.name.trim() || !profile.address.trim() || !/^0\d{9}$/.test(profile.phone) || !/^\d{12}$/.test(profile.cccd) || !/^\S+@\S+\.\S+$/.test(profile.email)) throw new Error("Thông tin hồ sơ không hợp lệ.");
    if (this.state.tenants.some((item) => item.id !== id && item.cccd === profile.cccd) || !demoEmailAvailable(profile.email, id)) throw new Error("CCCD hoặc email đã được sử dụng.");
    const currentContract = this.state.contracts.find((contract) => contract.tenantId === id && contract.status !== "Đã thanh lý");
    const room = currentContract && this.state.rooms.find((item) => item.id === currentContract.roomId);
    if (tenant.status !== "Đã trả phòng" && room && room.gender !== profile.gender) throw new Error("Giới tính không phù hợp với phòng đang thuê.");
    const updated = { ...tenant, ...profile, email: profile.email.trim().toLowerCase(), name: profile.name.trim() };
    this.commit({ ...this.state, tenants: this.state.tenants.map((item) => item.id === id ? updated : item), accounts: this.state.accounts.map((item) => item.id === tenant.userId ? { ...item, identifier: updated.cccd, email: updated.email, name: updated.name } : item) });
    return updated;
  }
  async getTickets() { return [...this.state.tickets]; }
  async getContracts() { return [...this.state.contracts]; }
  async getVehicles() { return [...this.state.vehicles]; }
  async registerVehicle(vehicle: TenantVehicle) {
    const tenant = this.state.tenants.find((item) => item.id === vehicle.tenantId);
    if (!tenant || tenant.status === "Đã trả phòng") throw new Error("Người thuê không còn cư trú.");
    if (!vehicle.id || vehicle.cardStatus !== "Chưa cấp thẻ" || vehicle.cardCode) throw new Error("Phương tiện mới phải ở trạng thái chờ cấp thẻ.");
    if (this.state.vehicles.some((item) => item.id === vehicle.id)) throw new Error("Mã phương tiện đã tồn tại.");
    if (this.state.vehicles.some((item) => item.tenantId === tenant.id && item.cardStatus !== "Đã thu hồi")) throw new Error("Người thuê đã có phương tiện chưa thu hồi.");
    this.commit({ ...this.state, vehicles: [vehicle, ...this.state.vehicles] });
    return vehicle;
  }
  private async updateVehicle(id: string, patch: Partial<TenantVehicle>) {
    const current = this.state.vehicles.find((vehicle) => vehicle.id === id);
    if (!current) throw new Error("Không tìm thấy phương tiện.");
    if ((patch.id && patch.id !== id) || (patch.tenantId && patch.tenantId !== current.tenantId)) throw new Error("Không thể đổi chủ phương tiện.");
    const updated = { ...current, ...patch, id };
    if (updated.cardStatus !== "Đã thu hồi" && this.state.vehicles.some((item) => item.id !== id && item.tenantId === updated.tenantId && item.cardStatus !== "Đã thu hồi")) throw new Error("Người thuê đã có phương tiện chưa thu hồi.");
    if (updated.cardCode && updated.cardStatus !== "Đã thu hồi" && this.state.vehicles.some((item) => item.id !== id && item.cardStatus !== "Đã thu hồi" && item.cardCode === updated.cardCode)) throw new Error("Mã thẻ đã được sử dụng.");
    this.commit({ ...this.state, vehicles: this.state.vehicles.map((vehicle) => vehicle.id === id ? updated : vehicle) });
    return updated;
  }
  async issueVehicleCard(id: string, cardCode: string) {
    const vehicle = this.state.vehicles.find((item) => item.id === id);
    if (!vehicle || vehicle.cardStatus !== "Chưa cấp thẻ" || !cardCode.trim()) throw new Error("Phương tiện hoặc mã thẻ không hợp lệ.");
    return this.updateVehicle(id, { cardStatus: "Đã cấp thẻ", status: "Đã cấp thẻ xe", cardCode: cardCode.trim() });
  }
  async revokeVehicle(id: string) {
    const vehicle = this.state.vehicles.find((item) => item.id === id);
    if (!vehicle || vehicle.cardStatus === "Đã thu hồi") throw new Error("Phương tiện không tồn tại hoặc đã thu hồi.");
    return this.updateVehicle(id, { cardStatus: "Đã thu hồi" });
  }
  async resetMockData() { resetMockSnapshot(); }
  async onboard(input: OnboardingInput, asOfDate?: string) {
    const existing = this.state.tenants.find((tenant) => tenant.cccd === input.cccd);
    if (!demoEmailAvailable(input.email, existing?.id)) throw new Error("Email đã được sử dụng.");
    const result = onboard(this.state, input, asOfDate);
    this.commit({ ...this.state, ...result.state });
    return result.result;
  }
  async renewContract(id: string, endDate: string, asOfDate?: string) { this.commit({ ...this.state, ...renew(this.state, id, endDate, asOfDate) }); }
  async addContractDocuments(id: string, documents: ContractDocumentRecord[]) {
    const contract = this.state.contracts.find((item) => item.id === id);
    if (!contract) throw new Error("Không tìm thấy hợp đồng.");
    if (documents.some((item) => item.contractId !== id || !/\.(jpe?g|png|webp|pdf|docx?)$/i.test(item.name) || item.size > 10 * 1024 * 1024 || !item.content || (item.category === "RENEWAL_ANNEX" && !contract.renewals?.some((renewal) => renewal.id === item.renewalId)))) throw new Error("Tệp hoặc phụ lục không hợp lệ.");
    const contracts = this.state.contracts.map((item) => item.id === id ? { ...item, documents: [...(item.documents ?? []), ...documents] } : item);
    this.commit({ ...this.state, contracts });
  }
  async deleteContractDocument(id: string, documentId: string) {
    const contract = this.state.contracts.find((item) => item.id === id);
    if (!contract?.documents?.some((item) => item.id === documentId)) throw new Error("Không tìm thấy tài liệu.");
    const contracts = this.state.contracts.map((item) => item.id === id ? { ...item, documents: item.documents?.filter((document) => document.id !== documentId) } : item);
    this.commit({ ...this.state, contracts });
  }
  async checkoutContract(id: string, status: "AVAILABLE" | "MAINTENANCE") { this.commit({ ...this.state, ...checkout(this.state, id, status) }); }
  async createRoom(room: RoomRecord) {
    const code = room.code.trim().toUpperCase();
    if (!code || this.state.rooms.some((item) => item.code.toUpperCase() === code)) throw new Error("Mã phòng đã được sử dụng");
    const created = bedIds({ ...room, code, id: crypto.randomUUID(), bedOverrides: {} });
    this.commit({ ...this.state, rooms: [created, ...this.state.rooms] }); return created;
  }
  async updateRoom(id: string, room: RoomRecord) {
    const original = this.state.rooms.find((item) => item.id === id);
    if (!original) throw new Error("Không tìm thấy phòng");
    if (room.floor !== original.floor || room.total !== original.total || room.type !== original.type) throw new Error("Không thể thay đổi tầng hoặc sức chứa của phòng");
    if ((room.code !== original.code || room.gender !== original.gender) && this.state.contracts.some((contract) => contract.roomId === original.id && contract.status !== "Đã thanh lý")) throw new Error("Không thể đổi mã phòng hoặc giới tính khi còn người cư trú");
    const code = room.code.trim().toUpperCase();
    if (!code || this.state.rooms.some((item) => item.id !== id && item.code.toUpperCase() === code)) throw new Error("Mã phòng đã được sử dụng");
    const updated = { ...original, ...room, code, id, bedOverrides: original.bedOverrides };
    this.commit({ ...this.state, rooms: this.state.rooms.map((item) => item.id === id ? updated : item) }); return updated;
  }
  async deleteRoom(id: string) {
    if (!this.state.rooms.some((room) => room.id === id)) throw new Error("Không tìm thấy phòng.");
    if (this.state.contracts.some((contract) => contract.roomId === id && contract.status !== "Đã thanh lý")) throw new Error("Phòng còn hợp đồng hiệu lực.");
    this.commit({ ...this.state, rooms: this.state.rooms.map((room) => room.id === id ? { ...room, deletedAt: new Date().toISOString() } : room) });
  }
  async updateBedStatus(bedId: string, status: BedStatus) {
    if (status !== "AVAILABLE" && status !== "MAINTENANCE") throw new Error("Trạng thái thuê chỉ thay đổi qua tiếp nhận hoặc trả phòng");
    const room = this.state.rooms.find((item) => Object.values(item.bedOverrides ?? {}).some((bed) => bed.id === bedId));
    const entry = room && Object.entries(room.bedOverrides ?? {}).find(([, bed]) => bed.id === bedId);
    if (!room || !entry || room.deletedAt) throw new Error("Không tìm thấy giường đang hoạt động");
    const [code, bed] = entry;
    if (bed.status === "OCCUPIED" || this.state.contracts.some((contract) => contract.bedId === bedId && contract.status !== "Đã thanh lý")) throw new Error("Không thể đổi trạng thái giường đang thuê");
    this.commit({ ...this.state, rooms: this.state.rooms.map((item) => item.id === room.id ? { ...item, bedOverrides: { ...item.bedOverrides, [code]: { ...bed, status } } } : item) });
  }
  async createTicket(ticket: Omit<Ticket, "id">) {
    if (ticket.status !== "Chưa phân công" || ticket.assigneeStaffId) throw new Error("Phiếu mới phải chưa phân công.");
    const created = ticketDisplay({ ...ticket, id: crypto.randomUUID() }, this.state);
    this.commit({ ...this.state, tickets: [created, ...this.state.tickets] });
    return created;
  }
  async updateTicket(id: string, patch: Partial<Ticket>, actorStaffId?: string) {
    const old = this.state.tickets.find((item) => item.id === id);
    if (!old) throw new Error("Không tìm thấy phiếu");
    if (patch.id && patch.id !== id) throw new Error("Không thể đổi ID phiếu.");
    if (old.status === "Hoàn thành") throw new Error("Không thể cập nhật phiếu đã hoàn thành.");
    const target = patch.status ?? old.status;
    const changed = target !== old.status;
    const reassigned = !!patch.assigneeStaffId && patch.assigneeStaffId !== old.assigneeStaffId;
    if (changed && !((old.status === "Chưa phân công" && target === "Mới giao" && !!patch.assigneeStaffId) || (old.status === "Mới giao" && target === "Đang xử lý") || (old.status === "Đang xử lý" && target === "Hoàn thành") || (old.status === "Đang xử lý" && target === "Mới giao" && reassigned))) throw new Error("Chuyển trạng thái phiếu không hợp lệ.");
    if ((actorStaffId || (changed && (target === "Đang xử lý" || target === "Hoàn thành"))) && (!actorStaffId || actorStaffId !== old.assigneeStaffId || reassigned)) throw new Error("Chỉ kỹ thuật viên hiện được giao có thể xử lý phiếu.");
    if (target !== "Chưa phân công" && !(patch.assigneeStaffId ?? old.assigneeStaffId)) throw new Error("Phiếu cần được phân công.");
    const updated = ticketDisplay({ ...old, ...patch, id }, this.state);
    this.commit({ ...this.state, tickets: this.state.tickets.map((item) => item.id === id ? updated : item) });
    return updated;
  }
  async saveRooms(rooms: RoomRecord[]) { const next = rooms.map(bedIds); this.commit({ ...this.state, rooms: next }); return next; }
  private async updateInvoice(id: string, patch: Partial<Invoice>) {
    const invoice = this.state.invoices.find((item) => item.id === id);
    if (!invoice) throw new Error("Không tìm thấy hóa đơn.");
    if (Object.keys(patch).some((key) => !["status", "proof", "payment"].includes(key))) throw new Error("Không thể thay đổi trường hóa đơn này.");
    const submitting = invoice.status === "Nợ" && patch.status === "Chờ xác nhận" && patch.proof && !patch.payment;
    const rejecting = invoice.status === "Chờ xác nhận" && patch.status === "Nợ" && !patch.proof && !patch.payment;
    const confirming = invoice.status === "Chờ xác nhận" && patch.status === "Đã thu" && patch.payment?.method === "Trực tuyến" && patch.payment.amount === invoice.amount && !!patch.payment.confirmedBy && !invoice.payment;
    if (!submitting && !rejecting && !confirming) throw new Error("Chuyển trạng thái thanh toán không hợp lệ.");
    const updated = { ...invoice, ...patch };
    this.commit({ ...this.state, invoices: this.state.invoices.map((item) => item.id === id ? updated : item) });
    return updated;
  }
  async issueInvoices(billingPeriod: string): Promise<Invoice[]> {
    if (!/^\d{4}-(0[1-9]|1[0-2])-01$/.test(billingPeriod)) throw new Error("Kỳ hóa đơn không hợp lệ.");
    const state = this.state;
    const issued: Invoice[] = state.contracts.filter((contract) => contract.status !== "Đã thanh lý" && contract.startDate <= billingPeriod && contract.endDate >= billingPeriod && !state.invoices.some((invoice) => invoice.contractId === contract.id && invoice.billingPeriod === billingPeriod)).map((contract) => {
      const tenant = state.tenants.find((item) => item.id === contract.tenantId);
      if (!tenant) throw new Error(`Không tìm thấy người thuê hợp đồng ${contract.id}.`);
      const renewal = contract.renewals?.find((item) => item.startDate <= billingPeriod && item.endDate >= billingPeriod);
      return { id: crypto.randomUUID(), contractId: contract.id, billingPeriod, tenantId: tenant.id, tenant: tenant.name, room: contract.room, bed: contract.bed, amount: renewal?.monthlyRent ?? contract.monthlyRent, due: `05/${billingPeriod.slice(5, 7)}/${billingPeriod.slice(0, 4)}`, status: "Nợ" as const, kind: `Tiền phòng tháng ${billingPeriod.slice(5, 7)}` };
    });
    if (issued.length) this.commit({ ...state, invoices: [...issued, ...state.invoices] });
    return issued;
  }
  async submitInvoiceProof(id: string, tenantId: string, proof: PaymentProof): Promise<Invoice> {
    const state = this.state;
    const invoice = state.invoices.find((item) => item.id === id);
    const contract = invoice && state.contracts.find((item) => item.id === invoice.contractId);
    if (!invoice || !contract || contract.tenantId !== tenantId) throw new Error("Hóa đơn không thuộc người thuê.");
    if (!proof.fileName?.trim() || !proof.submittedAt?.trim()) throw new Error("Minh chứng không hợp lệ.");
    return this.updateInvoice(id, { status: "Chờ xác nhận", proof });
  }
  async rejectInvoiceProof(id: string): Promise<Invoice> {
    return this.updateInvoice(id, { status: "Nợ", proof: undefined });
  }
  async confirmInvoiceProof(id: string, managerStaffId: string): Promise<Invoice> {
    const state = this.state;
    const manager = managerFor(state, managerStaffId);
    const invoice = state.invoices.find((item) => item.id === id);
    if (!invoice) throw new Error("Không tìm thấy hóa đơn.");
    return this.updateInvoice(id, { status: "Đã thu", payment: { amount: invoice.amount, method: "Trực tuyến", paidAt: new Date().toISOString(), confirmedBy: manager.fullName, confirmedByStaffId: manager.id } });
  }
  async confirmPayment(id: string, managerStaffId: string) {
    const manager = managerFor(this.state, managerStaffId);
    const invoice = this.state.invoices.find((item) => item.id === id);
    if (!invoice || invoice.status !== "Nợ" || invoice.payment) throw new Error("Chỉ có thể xác nhận tiền mặt cho hóa đơn đang nợ");
    const updated: Invoice = { ...invoice, status: "Đã thu", payment: { amount: invoice.amount, method: "Tiền mặt", paidAt: new Date().toISOString(), confirmedBy: manager.fullName, confirmedByStaffId: manager.id } };
    this.commit({ ...this.state, invoices: this.state.invoices.map((item) => item.id === id ? updated : item) }); return updated;
  }
}
export const mockDormService = new MockDormServiceImpl();
