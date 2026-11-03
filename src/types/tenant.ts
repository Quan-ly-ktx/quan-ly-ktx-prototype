export type TenantRecord = {
  id: string;
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
};

export type TenantVehicle = {
  id: string;
  plate: string;
  type: "Xe máy" | "Xe đạp điện" | "Xe đạp";
  brand: string;
  registeredAt: string;
};

export type ContractRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  room: string;
  bed: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "Hiệu lực" | "Sắp hết hạn" | "Đã thanh lý";
};
