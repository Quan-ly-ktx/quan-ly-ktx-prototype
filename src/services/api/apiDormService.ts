import type { DormService } from "../dormService.ts";
import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
} from "../../types/index.ts";
import { httpClient } from "../httpClient.ts";
import type { ApiResponse } from "../../types/api/endpoints.ts";

class ApiDormServiceImpl implements DormService {
  async getRooms(): Promise<RoomRecord[]> {
    const res = await httpClient.get<ApiResponse<RoomRecord[]> | RoomRecord[]>("/rooms");
    return Array.isArray(res) ? res : res.data;
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
