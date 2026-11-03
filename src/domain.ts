import type { BedRecord, BedStatus, Invoice, RoomRecord, TenantRecord, Ticket } from "./data";

export const slotKey = (room: string, bed: string) => `${room}-${bed}`;

export function isSlotAvailable(tenants: TenantRecord[], room: string, bed: string) {
  return !tenants.some(
    (tenant) =>
      tenant.status !== "Đã trả phòng" &&
      tenant.room === room &&
      tenant.bed === bed,
  );
}

export function totalInvoiceDue(invoice: Invoice) {
  return invoice.amount + (invoice.late ? invoice.late * 5000 : 0);
}

export function confirmCashPayment(
  invoice: Invoice,
  manager: string,
  paidAt: string,
): Invoice {
  if (invoice.status === "Đã thu" || invoice.payment) {
    throw new Error("Hóa đơn đã được xác nhận thanh toán");
  }
  if (!manager.trim()) {
    throw new Error("Thiếu người xác nhận thanh toán");
  }
  return {
    ...invoice,
    status: "Đã thu",
    payment: {
      amount: totalInvoiceDue(invoice),
      method: "Tiền mặt",
      paidAt,
      confirmedBy: manager.trim(),
    },
  };
}

export function calculateFinancialSummary(
  invoices: Invoice[],
  tickets: Ticket[],
) {
  const uniqueInvoices = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const collectedRevenue = [...uniqueInvoices.values()]
    .filter((invoice) => invoice.status === "Đã thu" && invoice.payment)
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0);

  const uniqueRepairs = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  const repairExpenses = [...uniqueRepairs.values()]
    .filter((ticket) => ticket.status === "Hoàn thành")
    .reduce((total, ticket) => total + (ticket.cost ?? 0), 0);

  return {
    collectedRevenue,
    repairExpenses,
    profit: collectedRevenue - repairExpenses,
  };
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

export interface RoomOccupancyBed {
  bedCode: string;
  slotKey: string;
  price: number;
  status: BedStatus;
  tenant?: TenantRecord;
}

export interface RoomOccupancySummary {
  occupied: number;
  total: number;
  beds: RoomOccupancyBed[];
  tenants: TenantRecord[];
}

export function getRoomOccupancy(room: RoomRecord, tenants: TenantRecord[]): RoomOccupancySummary {
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
