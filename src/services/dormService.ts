import type {
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
} from "../types/index.ts";
import { env } from "../config/env.ts";
import { mockDormService } from "./mock/mockDormService.ts";
import { apiDormService } from "./api/apiDormService.ts";

export interface DormService {
  getRooms(): Promise<RoomRecord[]>;
  getTenants(): Promise<TenantRecord[]>;
  getInvoices(): Promise<Invoice[]>;
  getTickets(): Promise<Ticket[]>;
  createTicket(ticket: Omit<Ticket, "id">): Promise<Ticket>;
  updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket>;
  saveRooms(rooms: RoomRecord[]): Promise<RoomRecord[]>;
  saveTenants(tenants: TenantRecord[]): Promise<TenantRecord[]>;
  saveInvoices(invoices: Invoice[]): Promise<Invoice[]>;
  confirmPayment(invoiceId: string, manager: string): Promise<Invoice>;
}

export const dormService: DormService = env.USE_MOCK
  ? mockDormService
  : apiDormService;
