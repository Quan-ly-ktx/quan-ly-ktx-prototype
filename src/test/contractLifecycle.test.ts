import { test } from "node:test";
import assert from "node:assert/strict";
import { checkout, onboard, renew, type LifecycleState } from "../services/mock/contractLifecycle.ts";

function fixture(): LifecycleState {
  return {
    rooms: [{ id: "room-1", code: "P.1", floor: 1, type: "4 giường", gender: "Nam", total: 4, basePrice: 1500000, amenities: [], bedOverrides: { G01: { id: "bed-1", roomId: "room-1", status: "OCCUPIED" } } }],
    tenants: [{ id: "tenant-1", userId: "user-1", name: "A", email: "a@example.invalid", phone: "0900000000", gender: "Nam", cccd: "012345678901", address: "A", room: "P.1", bed: "G01", start: "01/01/2026", end: "31/12/2099", monthlyRent: 1000000, deposit: 1000000, status: "Đang thuê" }],
    contracts: [{ id: "contract-1", tenantId: "tenant-1", tenantName: "A", roomId: "room-1", bedId: "bed-1", room: "P.1", bed: "G01", startDate: "2026-01-01", endDate: "2099-12-31", deposit: 1000000, monthlyRent: 1000000, status: "Hiệu lực" }],
    invoices: [{ id: "invoice-1", tenantId: "tenant-1", contractId: "contract-1", billingPeriod: "2026-01-01", tenant: "A", room: "P.1", bed: "G01", amount: 1000000, due: "05/01/2026", status: "Nợ" }],
    vehicles: [
      { id: "vehicle-pending", tenantId: "tenant-1", plate: "", type: "Xe đạp", brand: "", color: "", cardStatus: "Chưa cấp thẻ" },
      { id: "vehicle-issued", tenantId: "tenant-1", plate: "59-X1 999.99", type: "Xe tay ga", brand: "Honda", color: "Đen", cardStatus: "Đã cấp thẻ", cardCode: "CARD-01" },
    ], accounts: [],
    staff: [], tickets: [], violations: [], notifications: [], expenses: [],
  };
}
test("checkout retains debt, cancels pending vehicle and revokes issued vehicle while applying selected bed status", () => {
  const before = fixture();
  const after = checkout(before, "contract-1", "MAINTENANCE");
  assert.equal(after.rooms[0].bedOverrides?.G01.status, "MAINTENANCE");
  assert.equal(after.tenants[0].status, "Đã trả phòng");
  // PENDING_CARD becomes CANCELLED (Đã hủy)
  assert.equal(after.vehicles[0].cardStatus, "Đã hủy");
  assert.equal(after.vehicles[0].vehicleStatus, "CANCELLED");
  // ISSUED becomes REVOKED (Đã thu hồi)
  assert.equal(after.vehicles[1].cardStatus, "Đã thu hồi");
  assert.equal(after.vehicles[1].vehicleStatus, "REVOKED");
  assert.equal(after.invoices[0].status, "Nợ");
  assert.equal(before.rooms[0].bedOverrides?.G01.status, "OCCUPIED");
});
test("renewal refuses outstanding debt without changing the snapshot", () => {
  const before = fixture();
  assert.throws(() => renew(before, "contract-1", "2100-12-31"));
  assert.equal(before.contracts[0].endDate, "2099-12-31");
});

test("renewal snapshots current room price without changing the original contract price", () => {
  const before = fixture();
  const paid = { ...before, invoices: before.invoices.map((invoice) => ({ ...invoice, status: "Đã thu" as const })) };
  const after = renew(paid, "contract-1", "2100-12-31");
  assert.equal(after.contracts[0].monthlyRent, 1000000);
  assert.equal(after.contracts[0].renewals?.[0].monthlyRent, 1500000);
  assert.equal(after.contracts[0].renewals?.[0].startDate, "2100-01-01");
});

test("onboarding rejects a backdated start without mutating the store", () => {
  const before = fixture();
  assert.throws(() => onboard(before, { name: "B", gender: "Nam", phone: "0900000001", cccd: "012345678902", email: "b@example.invalid", address: "B", bedId: "bed-1", startDate: "1900-01-01", endDate: "1900-12-31", deposit: 1000000 }));
  assert.equal(before.tenants.length, 1);
  assert.equal(before.invoices.length, 1);
});
