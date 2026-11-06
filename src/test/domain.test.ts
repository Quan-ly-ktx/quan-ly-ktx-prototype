import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateFinancialSummary,
  canAssignTenantToRoom,
  canChangeGenderPolicy,
  canDeleteRoom,
  canToggleBedMaintenance,
  confirmCashPayment,
  generateBedsForRoom,
  getRoomOccupancy,
  isSlotAvailable,
  slotKey,
  resolveRole,
} from "../utils/index.ts";
import type { Invoice, RoomRecord, TenantRecord, Ticket, FacilityExpense } from "../types/index.ts";

const tenant = {
  id: "NT-1",
  name: "Người thuê A",
  email: "a@example.com",
  phone: "0900000000",
  gender: "Nam",
  cccd: "079200000001",
  address: "TP.HCM",
  room: "P.101",
  bed: "G01",
  start: "01/01/2026",
  end: "01/01/2027",
  monthlyRent: 1000000,
  deposit: 1000000,
  status: "Đang thuê",
} satisfies TenantRecord;

test("prevents assigning an occupied room slot", () => {
  assert.equal(isSlotAvailable([tenant], "P.101", "G01"), false);
  assert.equal(isSlotAvailable([tenant], "P.101", "G02"), true);
});

test("cash confirmation records amount, method, timestamp and manager", () => {
  const invoice: Invoice = {
    id: "HD-1",
    tenant: tenant.name,
    room: tenant.room,
    bed: tenant.bed,
    amount: 1000000,
    due: "05/10/2026",
    status: "Nợ",
    late: 2,
  };
  const paid = confirmCashPayment(invoice, "Thu Lan", "06/10/2026 10:00");
  assert.equal(paid.payment?.amount, 1000000);
  assert.equal(paid.payment?.method, "Tiền mặt");
  assert.equal(paid.payment?.confirmedBy, "Thu Lan");
  assert.throws(() => confirmCashPayment(paid, "Thu Lan", "06/10/2026 10:01"));
});

test("financial summary uses unique received payments and repair costs", () => {
  const paid: Invoice = {
    id: "HD-1",
    tenant: tenant.name,
    room: tenant.room,
    bed: tenant.bed,
    amount: 1000000,
    due: "05/10/2026",
    status: "Đã thu",
    payment: {
      amount: 1000000,
      method: "Tiền mặt",
      paidAt: "05/10/2026",
      confirmedBy: "Thu Lan",
    },
  };
  const repair = {
    id: "SC-1",
    room: "P.101",
    title: "Sửa vòi",
    description: "Thay vòi nước",
    category: "Nước",
    priority: "Bình thường",
    status: "Hoàn thành",
    reporter: tenant.name,
    phone: tenant.phone,
    createdAt: "01/10/2026",
    deadline: "Đã đóng",
    hasPhoto: false,
    cost: 200000,
  } satisfies Ticket;
  const expense: FacilityExpense = {
    id: "EXP-1",
    category: "Điện EVN",
    title: "Tiền điện tổng tháng 10",
    amount: 300000,
    expenseDate: "20/10/2026",
  };
  const summary = calculateFinancialSummary([paid, paid], [repair, repair], [expense, expense]);
  assert.deepEqual(summary, {
    collectedRevenue: 1000000,
    repairExpenses: 200000,
    facilityTotal: 300000,
    profit: 500000,
    netProfit: 500000,
  });
});

test("BR-01: generateBedsForRoom generates slots G01..G0n with unique slotKey", () => {
  const beds = generateBedsForRoom("P.305", 4, 1500000);
  assert.equal(beds.length, 4);
  assert.equal(beds[0].bedCode, "G01");
  assert.equal(beds[0].slotKey, "P.305-G01");
  assert.equal(beds[0].price, 1500000);
  assert.equal(beds[0].status, "AVAILABLE");
  assert.equal(beds[3].bedCode, "G04");
  assert.equal(beds[3].slotKey, "P.305-G04");
});

test("BR-02: canChangeGenderPolicy prevents changing gender policy when room has active tenants", () => {
  assert.equal(canChangeGenderPolicy("P.101", [tenant]), false);
  assert.equal(canChangeGenderPolicy("P.102", [tenant]), true);
  assert.equal(canAssignTenantToRoom("Nam", "Nam"), true);
  assert.equal(canAssignTenantToRoom("Nam", "Nữ"), false);
});

test("BR-08 / FR-04: canDeleteRoom prevents deleting room when room has active tenants", () => {
  assert.equal(canDeleteRoom("P.101", [tenant]), false);
  assert.equal(canDeleteRoom("P.999", [tenant]), true);
});

test("FR-01: getRoomOccupancy calculates real bed status and occupancy metrics", () => {
  const room: RoomRecord = {
    id: "RM-101",
    code: "P.101",
    floor: 1,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1000000,
    amenities: [{ name: "Điều hòa", quantity: 1 }],
  };
  const occupancy = getRoomOccupancy(room, [tenant]);
  assert.equal(occupancy.occupied, 1);
  assert.equal(occupancy.total, 4);
  assert.equal(occupancy.beds[0].status, "OCCUPIED");
  assert.equal(occupancy.beds[0].tenant?.name, "Người thuê A");
  assert.equal(occupancy.beds[1].status, "AVAILABLE");
});

test("FR-01 / FR-02: getRoomOccupancy correctly flags newly created vacant room as Trống", () => {
  const newRoom: RoomRecord = {
    id: "RM-501",
    code: "P.501",
    floor: 5,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1400000,
    amenities: [
      { name: "Điều hòa", quantity: 1 },
      { name: "Tủ cá nhân", quantity: 6 },
    ],
  };
  const occupancy = getRoomOccupancy(newRoom, []);
  assert.equal(occupancy.occupied, 0);
  assert.equal(occupancy.total, 6);
  assert.equal(occupancy.beds.length, 6);
  assert.ok(occupancy.beds.every((b) => b.status === "AVAILABLE"));
  assert.equal(newRoom.floor, 5);
});

test("BR-01 Invariant: canToggleBedMaintenance prevents maintenance on occupied beds", () => {
  assert.equal(canToggleBedMaintenance("P.101", "G01", [tenant]), false);
  assert.equal(canToggleBedMaintenance("P.101", "G02", [tenant]), true);
  assert.equal(canToggleBedMaintenance("P.201", "G01", [tenant]), true);
});

test("BR-01: unified price and per-bed maintenance in getRoomOccupancy", () => {
  const room: RoomRecord = {
    id: "RM-304",
    code: "P.304",
    floor: 3,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1400000,
    amenities: [],
    bedOverrides: {
      G01: { status: "MAINTENANCE" },
      G02: { status: "MAINTENANCE" },
    },
  };
  const occupancy = getRoomOccupancy(room, []);
  assert.equal(occupancy.total, 6);
  assert.equal(occupancy.occupied, 0);
  assert.equal(occupancy.beds[0].status, "MAINTENANCE");
  assert.equal(occupancy.beds[1].status, "MAINTENANCE");
  assert.equal(occupancy.beds[2].status, "AVAILABLE");
  assert.ok(occupancy.beds.every((b) => b.price === 1400000));
});

test("resolveRole parses email domain and prefixes correctly", () => {
  assert.equal(resolveRole("tenant@gmail.com"), "tenant");
  assert.equal(resolveRole("student@gmail.com"), "tenant");
  assert.equal(resolveRole("tech@gmail.com"), "technician");
  assert.equal(resolveRole("manager@gmail.com"), "manager");
  assert.equal(resolveRole("admin@gmail.com"), "manager");
  assert.equal(resolveRole("invalid@other.com"), null);
});
