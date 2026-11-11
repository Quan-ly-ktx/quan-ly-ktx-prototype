export type TenantRecord = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: "Nam" | "Nữ";
  cccd: string;
  address: string;
  room: string;
  bed: string;
  start: string;
  end: string;
  monthlyRent: number;
  deposit: number;
  status: "Đang thuê" | "Sắp hết HĐ" | "Đã trả phòng";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export type OnboardingInput = {
  name: string;
  gender: "Nam" | "Nữ";
  phone: string;
  cccd: string;
  email: string;
  address: string;
  bedId: string;
  startDate: string;
  endDate: string;
  deposit: number;
};

export type OnboardingResult = {
  tenant: TenantRecord;
  initialPassword?: string;
};

export type ContractRenewal = {
  id: string;
  contractId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  signedAt: string;
};

export type VehicleStatus =
  | "PENDING_CARD"
  | "ISSUED"
  | "REJECTED"
  | "REVOKED"
  | "REPLACED"
  | "CANCELLED";

export type TenantVehicle = {
  id: string;
  tenantId: string;
  plate: string;
  type: "Xe tay ga" | "Xe số" | "Xe máy điện" | "Xe côn tay" | "Xe đạp" | "Xe đạp điện" | "Xe máy";
  brand: string;
  color: string;
  cardStatus: "Chưa cấp thẻ" | "Đã cấp thẻ" | "Đã thu hồi" | "Bị từ chối" | "Đã thay thế" | "Đã hủy";
  registration?: "Đủ 2 mặt" | "Chưa có";
  status?: "Chờ duyệt" | "Đã cấp thẻ xe" | "Bị từ chối" | "Đã thu hồi" | "Đã thay thế" | "Đã hủy";
  vehicleStatus?: VehicleStatus;
  cardCode?: string;
  registrationFront?: string;
  registrationBack?: string;
  registeredAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  replacedByVehicleId?: string;
  replacedVehicleId?: string;
  revokedAt?: string;
  cancelledAt?: string;
};

export function normalizeVehicleStatus(vehicle: TenantVehicle): VehicleStatus {
  if (vehicle.vehicleStatus) return vehicle.vehicleStatus;
  if (vehicle.status === "Bị từ chối" || vehicle.cardStatus === "Bị từ chối") return "REJECTED";
  if (vehicle.status === "Đã thay thế" || vehicle.cardStatus === "Đã thay thế") return "REPLACED";
  if (vehicle.status === "Đã hủy" || vehicle.cardStatus === "Đã hủy") return "CANCELLED";
  if (vehicle.cardStatus === "Đã thu hồi" || vehicle.status === "Đã thu hồi") return "REVOKED";
  if (vehicle.cardStatus === "Đã cấp thẻ" || vehicle.status === "Đã cấp thẻ xe") return "ISSUED";
  return "PENDING_CARD";
}

export function vehicleStatusLabel(status: VehicleStatus): string {
  switch (status) {
    case "PENDING_CARD":
      return "Chờ cấp thẻ";
    case "ISSUED":
      return "Đã cấp thẻ";
    case "REJECTED":
      return "Bị từ chối";
    case "REVOKED":
      return "Đã thu hồi";
    case "REPLACED":
      return "Đã thay thế";
    case "CANCELLED":
      return "Đã hủy";
  }
}

export type VehicleChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type VehicleChangeRequest = {
  id: string;
  tenantId: string;
  currentVehicleId: string;
  newVehicle: {
    plate: string;
    type: TenantVehicle["type"];
    brand: string;
    color: string;
    registrationFront?: string;
    registrationBack?: string;
  };
  createdAt: string;
  status: VehicleChangeRequestStatus;
  rejectionReason?: string;
  processedBy?: string;
  processedAt?: string;
  createdVehicleId?: string;
};

export type ContractDocumentRecord = {
  id: string;
  contractId: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  category: "ORIGINAL_CONTRACT" | "RENEWAL_ANNEX" | "CHECKOUT_HANDOVER" | "OTHER";
  renewalId?: string;
  content?: string;
  uploadedAt: string;
};

export type ContractRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  room: string;
  roomId: string;
  bedId: string;
  bed: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "Hiệu lực" | "Sắp hết hạn" | "Đã thanh lý";
  documents?: ContractDocumentRecord[];
  renewals?: ContractRenewal[];
};
