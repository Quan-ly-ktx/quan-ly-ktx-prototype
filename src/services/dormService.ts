import type {
  RoomRecord,
  BedStatus,
  TenantRecord,
  Invoice,
  Ticket,
} from "../types/index.ts";
import type { ContractDocumentRecord, ContractRecord, OnboardingInput, OnboardingResult, TenantVehicle } from "../types/tenant.ts";
import type { FacilityExpense, PaymentProof } from "../types/invoice.ts";
import { env } from "../config/env.ts";
import { mockDormService } from "./mock/mockDormService.ts";
import { apiDormService } from "./api/apiDormService.ts";

export interface DormService {
  getRooms(): Promise<RoomRecord[]>;
  createRoom(room: RoomRecord): Promise<RoomRecord>;
  updateRoom(id: string, room: RoomRecord): Promise<RoomRecord>;
  deleteRoom(id: string): Promise<void>;
  updateBedStatus(bedId: string, status: BedStatus): Promise<void>;
  getTenants(): Promise<TenantRecord[]>;
  getExpenses(): Promise<FacilityExpense[]>;
  createExpense(expense: FacilityExpense): Promise<FacilityExpense>;
  updateExpense(id: string, expense: FacilityExpense): Promise<FacilityExpense>;
  deleteExpense(id: string): Promise<void>;
  getInvoices(): Promise<Invoice[]>;
  getTickets(): Promise<Ticket[]>;
  getContracts(): Promise<ContractRecord[]>;
  getVehicles(): Promise<TenantVehicle[]>;
  registerVehicle(vehicle: TenantVehicle): Promise<TenantVehicle>;
  issueVehicleCard(id: string, cardCode: string): Promise<TenantVehicle>;
  revokeVehicle(id: string): Promise<TenantVehicle>;
  resetMockData(): Promise<void>;
  onboard(input: OnboardingInput): Promise<OnboardingResult>;
  renewContract(id: string, endDate: string): Promise<void>;
  checkoutContract(id: string, bedStatus: "AVAILABLE" | "MAINTENANCE"): Promise<void>;
  addContractDocuments(id: string, documents: ContractDocumentRecord[]): Promise<void>;
  deleteContractDocument(id: string, documentId: string): Promise<void>;
  updateTenantProfile(id: string, profile: Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender">): Promise<TenantRecord>;
  createTicket(ticket: Omit<Ticket, "id">): Promise<Ticket>;
  updateTicket(id: string, patch: Partial<Ticket>, actorStaffId?: string): Promise<Ticket>;
  saveRooms(rooms: RoomRecord[]): Promise<RoomRecord[]>;
  issueInvoices(billingPeriod: string): Promise<Invoice[]>;
  submitInvoiceProof(id: string, tenantId: string, proof: PaymentProof): Promise<Invoice>;
  rejectInvoiceProof(id: string): Promise<Invoice>;
  confirmInvoiceProof(id: string, managerStaffId: string): Promise<Invoice>;
  confirmPayment(invoiceId: string, manager: string): Promise<Invoice>;
}

export const dormService: DormService = env.USE_MOCK
  ? mockDormService
  : apiDormService;
