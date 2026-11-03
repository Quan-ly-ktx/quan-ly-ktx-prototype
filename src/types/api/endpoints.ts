import type { RoomRecord } from "../room.ts";
import type { TenantRecord } from "../tenant.ts";
import type { Invoice } from "../invoice.ts";
import type { Ticket } from "../incident.ts";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type RoomsResponse = ApiResponse<RoomRecord[]>;
export type TenantsResponse = ApiResponse<TenantRecord[]>;
export type InvoicesResponse = ApiResponse<Invoice[]>;
export type TicketsResponse = ApiResponse<Ticket[]>;

export type CreateTicketRequest = Omit<Ticket, "id">;
export type UpdateTicketRequest = Partial<Ticket>;

export type PaymentConfirmationRequest = {
  invoiceId: string;
  manager: string;
  paidAt?: string;
};
