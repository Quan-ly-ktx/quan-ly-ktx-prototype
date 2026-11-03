export type RoomType = "4 giường" | "6 giường" | "8 giường";
export type RoomGender = "Nam" | "Nữ";
export type BedStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type AmenityItem = {
  name: string;
  quantity: number;
};

export type BedRecord = {
  bedCode: string;
  slotKey: string;
  price: number;
  status: BedStatus;
};

export type RoomRecord = {
  id: string;
  code: string;
  floor: number;
  type: RoomType;
  gender: RoomGender;
  total: number;
  basePrice: number;
  amenities: AmenityItem[];
  bedOverrides?: Record<string, { id?: string; status?: BedStatus; price?: number }>;
  deletedAt?: string | null;
};

export type RentalSlot = {
  room: string;
  bed: string;
  floor: number;
  monthlyRent: number;
  status: "Sẵn sàng" | "Bảo trì";
};

export type RoomFilterState = {
  floor: string;
  type: string;
  status: string;
  search: string;
};
