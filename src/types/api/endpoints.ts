import type { RoomRecord } from "../room.ts";
import type { TenantRecord } from "../tenant.ts";
import type { Invoice } from "../invoice.ts";
import type { Ticket } from "../incident.ts";
import type {
  BackendUserRole,
  BackendUserStatus,
  BackendResidentStatus,
  StaffInfo,
  TenantInfo,
  UserProfileResponse,
  UserResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  VerifyResetPasswordOtpResponse,
  ResetPasswordRequest,
} from "../auth.ts";

// Re-export Auth DTOs from endpoints.ts
export type {
  BackendUserRole,
  BackendUserStatus,
  BackendResidentStatus,
  StaffInfo,
  TenantInfo,
  UserProfileResponse,
  UserResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  VerifyResetPasswordOtpResponse,
  ResetPasswordRequest,
};

// Base Envelope Responses
export type SingleResponse<T> = {
  httpStatus: number | string;
  message: string;
  data: T;
};

export type SuccessResponse = {
  httpStatus: number | string;
  message: string;
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type DetailedErrorResponse = {
  httpStatus: number | string;
  message: string;
  errorCode: string;
  timestamp: string;
  path?: string;
  items?: Record<string, string[]>;
  errors?: Record<string, string>;
};

// Room & Bed Enums & DTOs
export type BackendRoomType = "FOUR_BEDS" | "SIX_BEDS" | "EIGHT_BEDS";
export type BackendGenderPolicy = "MALE" | "FEMALE";
export type BackendBedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type AmenityItemResponse = {
  amenityId: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
};

export type OccupantSummaryResponse = {
  tenantId: string;
  fullName: string;
  phone: string;
  contractEndDate: string;
};

export type BedSlotResponse = {
  id: string;
  bedCode: string;
  slotKey: string;
  price: number;
  status: BackendBedStatus;
  occupant?: OccupantSummaryResponse | null;
};

export type BedResponse = {
  id: string;
  roomId: string;
  roomNumber: string;
  bedCode: string;
  slotKey: string;
  price: number;
  status: BackendBedStatus;
};

export type RoomSummaryResponse = {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: BackendRoomType;
  genderPolicy: BackendGenderPolicy;
  totalBeds: number;
  occupiedBeds: number;
  basePrice: number;
  amenities: AmenityItemResponse[];
};

export type RoomDetailResponse = {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: BackendRoomType;
  genderPolicy: BackendGenderPolicy;
  totalBeds: number;
  occupiedBeds: number;
  basePrice: number;
  amenities: AmenityItemResponse[];
  beds: BedSlotResponse[];
};

export type RoomAmenityRequest = {
  amenityId: string;
  quantity: number;
};

export type CreateRoomRequest = {
  roomNumber: string;
  floor: number;
  roomType: BackendRoomType;
  genderPolicy: BackendGenderPolicy;
  basePrice: number;
  amenities?: RoomAmenityRequest[];
};

export type UpdateRoomRequest = {
  genderPolicy?: BackendGenderPolicy;
  basePrice: number;
  amenities?: RoomAmenityRequest[];
};

export type UpdateBedStatusRequest = {
  status: BackendBedStatus;
};

// Technician DTOs
export type TechnicianResponse = {
  id: string;
  userId?: string | null;
  username?: string | null;
  email?: string | null;
  phone: string;
  fullName: string;
  active: boolean;
  userStatus?: BackendUserStatus | null;
  createdAt?: string;
};

export type CreateTechnicianRequest = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export type UpdateTechnicianRequest = {
  fullName: string;
  email: string;
  phone: string;
};

export type UpdateTechnicianStatusRequest = {
  active: boolean;
};

// Existing Prototype Legacy Endpoints
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

export function assertDtoExports(): boolean {
  return true;
}
