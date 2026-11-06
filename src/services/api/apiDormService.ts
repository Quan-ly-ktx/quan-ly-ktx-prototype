import type { DormService } from "../dormService.ts";
import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
  BedStatus,
} from "../../types/index.ts";
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

  async updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket> {
    const res = await httpClient.patch<ApiResponse<Ticket> | Ticket>(`/tickets/${id}`, patch);
    return "data" in res ? res.data : res;
  }

  async saveRooms(rooms: RoomRecord[]): Promise<RoomRecord[]> {
    const res = await httpClient.put<ApiResponse<RoomRecord[]> | RoomRecord[]>("/rooms", rooms);
    return Array.isArray(res) ? res : res.data;
  }

  async saveTenants(tenants: TenantRecord[]): Promise<TenantRecord[]> {
    const res = await httpClient.put<ApiResponse<TenantRecord[]> | TenantRecord[]>("/tenants", tenants);
    return Array.isArray(res) ? res : res.data;
  }

  async saveInvoices(invoices: Invoice[]): Promise<Invoice[]> {
    const res = await httpClient.put<ApiResponse<Invoice[]> | Invoice[]>("/invoices", invoices);
    return Array.isArray(res) ? res : res.data;
  }

  async confirmPayment(invoiceId: string, manager: string): Promise<Invoice> {
    const res = await httpClient.post<ApiResponse<Invoice> | Invoice>(
      `/invoices/${invoiceId}/confirm-payment`,
      { manager },
    );
    return "data" in res ? res.data : res;
  }
}

export const apiDormService = new ApiDormServiceImpl();
