import type { BedStatus, RoomRecord, TenantRecord } from "../types/index.ts";
import type { ContractRecord } from "../types/tenant.ts";

export const slotKey = (room: string, bed: string) => `${room}-${bed}`;

export function isSlotAvailable(
  contracts: ContractRecord[],
  roomId: string,
  bedId: string,
): boolean {
  return !contracts.some((contract) => contract.status !== "Đã thanh lý" && contract.roomId === roomId && contract.bedId === bedId);
}

export function generateBedsForRoom(
  roomCode: string,
  totalBeds: number,
  basePrice: number,
): { bedCode: string; slotKey: string; price: number; status: BedStatus }[] {
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
  roomId: string,
  contracts: ContractRecord[],
): boolean {
  return !contracts.some((contract) => contract.status !== "Đã thanh lý" && contract.roomId === roomId);
}

export function canDeleteRoom(
  roomId: string,
  contracts: ContractRecord[],
): boolean {
  return !contracts.some((contract) => contract.status !== "Đã thanh lý" && contract.roomId === roomId);
}

export function canAssignTenantToRoom(
  tenantGender: "Nam" | "Nữ",
  roomGenderPolicy: "Nam" | "Nữ",
): boolean {
  return tenantGender === roomGenderPolicy;
}

export function canToggleBedMaintenance(
  roomId: string,
  bedId: string,
  contracts: ContractRecord[],
): boolean {
  return isSlotAvailable(contracts, roomId, bedId);
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
  available: number;
  total: number;
  beds: RoomOccupancyBed[];
  tenants: TenantRecord[];
};

export function getRoomOccupancy(
  room: RoomRecord,
  tenants: TenantRecord[],
  contracts: ContractRecord[],
): RoomOccupancySummary {
  const activeContracts = contracts.filter((contract) => contract.status !== "Đã thanh lý" && contract.roomId === room.id);
  const roomTenants = tenants.filter((tenant) => activeContracts.some((contract) => contract.tenantId === tenant.id));

  const beds = Array.from({ length: room.total }, (_, i) => {
    const bedCode = `G0${i + 1}`;
    const sKey = slotKey(room.code, bedCode);
    const override = room.bedOverrides?.[bedCode];
    const contract = activeContracts.find((item) => item.bedId === override?.id);
    const tenant = roomTenants.find((item) => item.id === contract?.tenantId);

    const status: BedStatus = contract ? "OCCUPIED" : (override?.status ?? "AVAILABLE");

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
    available: beds.filter((bed) => bed.status === "AVAILABLE").length,
    total: room.total,
    beds,
    tenants: roomTenants,
  };
}
