import type { BedRecord, BedStatus, RoomRecord, TenantRecord } from "../types/index.ts";

export const slotKey = (room: string, bed: string) => `${room}-${bed}`;

export function isSlotAvailable(
  tenants: TenantRecord[],
  room: string,
  bed: string,
): boolean {
  return !tenants.some(
    (tenant) =>
      tenant.status !== "Đã trả phòng" &&
      tenant.room === room &&
      tenant.bed === bed,
  );
}

export function generateBedsForRoom(
  roomCode: string,
  totalBeds: number,
  basePrice: number,
): BedRecord[] {
  return Array.from({ length: totalBeds }, (_, i) => {
    const bedCode = `G0${i + 1}`;
    return {
      bedCode,
      slotKey: slotKey(roomCode, bedCode),
      price: basePrice,
      status: "AVAILABLE",
    };
  });
}

export function canChangeGenderPolicy(
  roomCode: string,
  tenants: TenantRecord[],
): boolean {
  return !tenants.some(
    (t) => t.status !== "Đã trả phòng" && t.room === roomCode,
  );
}

export function canDeleteRoom(
  roomCode: string,
  tenants: TenantRecord[],
): boolean {
  return !tenants.some(
    (t) => t.status !== "Đã trả phòng" && t.room === roomCode,
  );
}

export function canAssignTenantToRoom(
  tenantGender: "Nam" | "Nữ",
  roomGenderPolicy: "Nam" | "Nữ",
): boolean {
  return tenantGender === roomGenderPolicy;
}

export function canToggleBedMaintenance(
  roomCode: string,
  bedCode: string,
  tenants: TenantRecord[],
): boolean {
  return !tenants.some(
    (t) =>
      t.status !== "Đã trả phòng" &&
      t.room === roomCode &&
      t.bed === bedCode,
  );
}

export type RoomOccupancyBed = {
  bedCode: string;
  slotKey: string;
  price: number;
  status: BedStatus;
  tenant?: TenantRecord;
};

export type RoomOccupancySummary = {
  occupied: number;
  total: number;
  beds: RoomOccupancyBed[];
  tenants: TenantRecord[];
};

export function getRoomOccupancy(
  room: RoomRecord,
  tenants: TenantRecord[],
): RoomOccupancySummary {
  const roomTenants = tenants.filter(
    (t) => t.status !== "Đã trả phòng" && t.room === room.code,
  );

  const beds = Array.from({ length: room.total }, (_, i) => {
    const bedCode = `G0${i + 1}`;
    const sKey = slotKey(room.code, bedCode);
    const tenant = roomTenants.find((t) => t.bed === bedCode);
    const override = room.bedOverrides?.[bedCode];

    let status: BedStatus = "AVAILABLE";
    if (tenant) {
      status = "OCCUPIED";
    } else if (override?.status === "MAINTENANCE") {
      status = "MAINTENANCE";
    }

    return {
      bedCode,
      slotKey: sKey,
      price: room.basePrice,
      status,
      tenant,
    };
  });

  const occupied = beds.filter((b) => b.status === "OCCUPIED").length;

  return {
    occupied,
    total: room.total,
    beds,
    tenants: roomTenants,
  };
}
