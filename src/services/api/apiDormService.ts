import type { DormService } from "../dormService.ts";
import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
  BedStatus,
} from "../../types/index.ts";
import type { ContractDocumentRecord, ContractRecord, OnboardingInput, OnboardingResult, TenantVehicle, VehicleChangeRequest } from "../../types/tenant.ts";
import type { FacilityExpense, PaymentProof } from "../../types/invoice.ts";
import { httpClient } from "../httpClient.ts";
import type {
  ApiResponse,
  SingleResponse,
  RoomDetailResponse,
  UpdateBedStatusRequest,
} from "../../types/api/endpoints.ts";
import {
  toFrontendRoomRecord,
  toBackendCreateRoomRequest,
  toBackendUpdateRoomRequest,
  toBackendBedStatus,
} from "./adapters/roomAdapter.ts";

class ApiDormServiceImpl implements DormService {
  async getContracts(): Promise<ContractRecord[]> { throw new Error("API hợp đồng chưa được thống nhất."); }
  async getExpenses(): Promise<FacilityExpense[]> { throw new Error("API chi phí chưa được thống nhất."); }
  async createExpense(_expense: FacilityExpense): Promise<FacilityExpense> { throw new Error("API chi phí chưa được thống nhất."); }
  async updateExpense(_id: string, _expense: FacilityExpense): Promise<FacilityExpense> { throw new Error("API chi phí chưa được thống nhất."); }
  async deleteExpense(_id: string): Promise<void> { throw new Error("API chi phí chưa được thống nhất."); }
  async getVehicles(): Promise<TenantVehicle[]> { throw new Error("API phương tiện chưa được thống nhất."); }
  async registerVehicle(_vehicle: TenantVehicle): Promise<TenantVehicle> { throw new Error("API phương tiện chưa được thống nhất."); }
  async issueVehicleCard(_id: string, _cardCode: string): Promise<TenantVehicle> { throw new Error("API phương tiện chưa được thống nhất."); }
  async revokeVehicle(_id: string): Promise<TenantVehicle> { throw new Error("API phương tiện chưa được thống nhất."); }
  async rejectVehicle(_id: string, _reason: string, _actorStaffId?: string): Promise<TenantVehicle> { throw new Error("API phương tiện chưa được thống nhất."); }
  async getVehicleChangeRequests(_tenantId?: string): Promise<VehicleChangeRequest[]> { throw new Error("API đổi phương tiện chưa được thống nhất."); }
  async requestVehicleChange(_input: { tenantId: string; currentVehicleId: string; newVehicle: { plate: string; type: TenantVehicle["type"]; brand: string; color: string; registrationFront?: string; registrationBack?: string } }): Promise<VehicleChangeRequest> { throw new Error("API đổi phương tiện chưa được thống nhất."); }
  async approveVehicleChangeRequest(_requestId: string, _actorStaffId?: string): Promise<{ request: VehicleChangeRequest; oldVehicle: TenantVehicle; newVehicle: TenantVehicle }> { throw new Error("API đổi phương tiện chưa được thống nhất."); }
  async rejectVehicleChangeRequest(_requestId: string, _reason: string, _actorStaffId?: string): Promise<VehicleChangeRequest> { throw new Error("API đổi phương tiện chưa được thống nhất."); }
  async resetMockData(): Promise<void> { throw new Error("Không thể reset dữ liệu demo trong chế độ API."); }
  async onboard(_input: OnboardingInput): Promise<OnboardingResult> { throw new Error("API tiếp nhận chưa được thống nhất."); }
  async renewContract(_id: string, _endDate: string): Promise<void> { throw new Error("API gia hạn chưa được thống nhất."); }
  async checkoutContract(_id: string, _status: "AVAILABLE" | "MAINTENANCE"): Promise<void> { throw new Error("API thanh lý chưa được thống nhất."); }
  async addContractDocuments(_id: string, _documents: ContractDocumentRecord[]): Promise<void> { throw new Error("API tài liệu hợp đồng chưa được thống nhất."); }
  async deleteContractDocument(_id: string, _documentId: string): Promise<void> { throw new Error("API tài liệu hợp đồng chưa được thống nhất."); }
  async updateTenantProfile(_id: string, _profile: Partial<Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender" | "emergencyContactName" | "emergencyContactPhone">>, _actorRole?: "manager" | "tenant"): Promise<TenantRecord> { throw new Error("API cập nhật hồ sơ chưa được thống nhất."); }
  async getRooms(): Promise<RoomRecord[]> {
    const res = await httpClient.get<SingleResponse<RoomDetailResponse[]> | RoomDetailResponse[]>(
      "/admin/rooms/matrix",
    );
    const details = Array.isArray(res) ? res : res.data;
    return details.map(toFrontendRoomRecord);
  }

  async createRoom(room: RoomRecord): Promise<RoomRecord> {
    const payload = toBackendCreateRoomRequest(room);
    const res = await httpClient.post<SingleResponse<RoomDetailResponse> | RoomDetailResponse>(
      "/admin/rooms",
      payload,
    );
    const detail = res && typeof res === "object" && "data" in res ? res.data : (res as RoomDetailResponse);
    return toFrontendRoomRecord(detail);
  }

  async updateRoom(id: string, room: RoomRecord): Promise<RoomRecord> {
    const payload = toBackendUpdateRoomRequest(room);
    const res = await httpClient.put<SingleResponse<RoomDetailResponse> | RoomDetailResponse>(
      `/admin/rooms/${id}`,
      payload,
    );
    const detail = res && typeof res === "object" && "data" in res ? res.data : (res as RoomDetailResponse);
    return toFrontendRoomRecord(detail);
  }

  async deleteRoom(id: string): Promise<void> {
    await httpClient.delete<void>(`/admin/rooms/${id}`);
  }
  async deleteMistakenRoom(_id: string): Promise<void> { throw new Error("API xóa phòng nhầm chưa được thống nhất."); }
  async archiveRoom(id: string): Promise<void> { await this.deleteRoom(id); }
  async restoreRoom(_id: string): Promise<RoomRecord> { throw new Error("API khôi phục phòng chưa được thống nhất."); }

  async updateBedStatus(bedId: string, status: BedStatus): Promise<void> {
    const payload: UpdateBedStatusRequest = {
      status: toBackendBedStatus(status),
    };
    await httpClient.patch<void>(`/admin/beds/${bedId}/status`, payload);
  }

  async getTenants(): Promise<TenantRecord[]> {
    const res = await httpClient.get<ApiResponse<TenantRecord[]> | TenantRecord[]>("/tenants");
    return Array.isArray(res) ? res : res.data;
  }

  async getInvoices(): Promise<Invoice[]> {
    const res = await httpClient.get<ApiResponse<Invoice[]> | Invoice[]>("/invoices");
    return Array.isArray(res) ? res : res.data;
  }

  async getTickets(): Promise<Ticket[]> {
    const res = await httpClient.get<ApiResponse<Ticket[]> | Ticket[]>("/tickets");
    return Array.isArray(res) ? res : res.data;
  }

  async createTicket(ticketData: Omit<Ticket, "id">): Promise<Ticket> {
    const res = await httpClient.post<ApiResponse<Ticket> | Ticket>("/tickets", ticketData);
    return "data" in res ? res.data : res;
  }

  async updateTicket(id: string, patch: Partial<Ticket>, actorStaffId?: string): Promise<Ticket> {
    if (actorStaffId) throw new Error("API xử lý phiếu theo kỹ thuật viên chưa được thống nhất.");
    const res = await httpClient.patch<ApiResponse<Ticket> | Ticket>(`/tickets/${id}`, patch);
    return "data" in res ? res.data : res;
  }

  async saveRooms(_rooms: RoomRecord[]): Promise<RoomRecord[]> { throw new Error("API lưu danh sách phòng chưa được thống nhất."); }
  async issueInvoices(_billingPeriod: string): Promise<Invoice[]> { throw new Error("API phát hành hóa đơn chưa được thống nhất."); }
  async submitInvoiceProof(_id: string, _tenantId: string, _proof: PaymentProof): Promise<Invoice> { throw new Error("API minh chứng chưa được thống nhất."); }
  async rejectInvoiceProof(_id: string): Promise<Invoice> { throw new Error("API minh chứng chưa được thống nhất."); }
  async confirmInvoiceProof(_id: string, _managerStaffId: string): Promise<Invoice> { throw new Error("API minh chứng chưa được thống nhất."); }

  async confirmPayment(_invoiceId: string, _managerStaffId: string): Promise<Invoice> { throw new Error("API xác nhận tiền mặt chưa được thống nhất."); }
  getBusinessDate(): string { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
  setBusinessDate(_date?: string): void {}
  async checkDueReminders(_asOfDate?: string): Promise<number> { return 0; }
}

export const apiDormService = new ApiDormServiceImpl();
