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

export type TenantVehicle = {
  id: string;
  tenantId: string;
  plate: string;
  type: "Xe tay ga" | "Xe số" | "Xe máy điện" | "Xe côn tay" | "Xe đạp" | "Xe đạp điện" | "Xe máy";
  brand: string;
  color: string;
  cardStatus: "Chưa cấp thẻ" | "Đã cấp thẻ" | "Đã thu hồi";
  registration?: "Đủ 2 mặt" | "Chưa có";
  status?: "Chờ duyệt" | "Đã cấp thẻ xe";
  cardCode?: string;
  registrationFront?: string;
  registrationBack?: string;
  registeredAt?: string;
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
