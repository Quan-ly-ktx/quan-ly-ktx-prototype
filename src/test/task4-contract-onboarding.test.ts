import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";

test("Task 4: Onboarding generates 1st month invoice and initial random password", async () => {
  const state = getMockSnapshot();
  // Find an available bed in a Male room
  const maleRoom = state.rooms.find((r) => !r.deletedAt && r.gender === "Nam")!;
  const availableBed = Object.values(maleRoom.bedOverrides ?? {}).find((b) => b.status === "AVAILABLE" && !state.contracts.some((c) => c.bedId === b.id && c.status !== "Đã thanh lý"))!;
  assert.ok(availableBed);

  const cccd = "079203999888";
  const email = "newtenant999@ktxhub.vn";

  const result = await mockDormService.onboard(
    {
      name: "Trần Minh Quân",
      gender: "Nam",
      phone: "0911222333",
      cccd,
      email,
      address: "Hà Nội",
      bedId: availableBed.id,
      startDate: "2026-11-01", // Valid day 01
      endDate: "2027-04-30",   // Month-end
      deposit: 1500000,
    },
    "2026-11-01"
  );

  // Result verification
  assert.equal(result.tenant.cccd, cccd);
  assert.ok(result.initialPassword);
  assert.ok(result.initialPassword.length >= 8);

  const updatedState = getMockSnapshot();
  // Bed became OCCUPIED
  const updatedRoom = updatedState.rooms.find((r) => r.id === maleRoom.id)!;
  const bedEntry = Object.values(updatedRoom.bedOverrides ?? {}).find((b) => b.id === availableBed.id)!;
  assert.equal(bedEntry.status, "OCCUPIED");

  // Contract created
  const contract = updatedState.contracts.find((c) => c.tenantId === result.tenant.id)!;
  assert.ok(contract);
  assert.equal(contract.bedId, availableBed.id);
  assert.equal(contract.status, "Hiệu lực");

  // 1st month invoice generated
  const firstInvoice = updatedState.invoices.find((inv) => inv.contractId === contract.id && inv.billingPeriod === "2026-11-01")!;
  assert.ok(firstInvoice);
  assert.equal(firstInvoice.status, "Nợ");
  assert.equal(firstInvoice.amount, maleRoom.basePrice);
  assert.equal(firstInvoice.due, "05/11/2026");

  // Clean up
  await mockDormService.resetMockData();
});

test("Task 4: Returning tenant with unpaid debt is rejected from onboarding", async () => {
  // Former tenant in fixture has unpaid invoice: id "e0000000-0000-4000-8000-000000000001", cccd: "000000000001"
  const state = getMockSnapshot();
  const maleRoom = state.rooms.find((r) => !r.deletedAt && r.gender === "Nam")!;
  const availableBed = Object.values(maleRoom.bedOverrides ?? {}).find((b) => b.status === "AVAILABLE" && !state.contracts.some((c) => c.bedId === b.id && c.status !== "Đã thanh lý"))!;
  assert.ok(availableBed);

  await assert.rejects(
    mockDormService.onboard(
      {
        name: "Khách demo đã trả phòng",
        gender: "Nam",
        phone: "0900000000",
        cccd: "000000000001",
        email: "khach-cu@example.invalid",
        address: "Địa chỉ demo",
        bedId: availableBed.id,
        startDate: "2026-11-01",
        endDate: "2027-04-30",
        deposit: 1500000,
      },
      "2026-11-01"
    ),
    /Khách đang thuê hoặc còn hóa đơn nợ\/chờ xác nhận/
  );
});

test("Task 4: Checkout contract requires explicit bed status and revokes vehicles while retaining debt", async () => {
  const state = getMockSnapshot();
  const activeContract = state.contracts.find((c) => c.status === "Hiệu lực" && c.tenantId === "NT-0187")!;
  assert.ok(activeContract);

  // Checkout with MAINTENANCE
  await mockDormService.checkoutContract(activeContract.id, "MAINTENANCE");

  const afterState = getMockSnapshot();
  const afterContract = afterState.contracts.find((c) => c.id === activeContract.id)!;
  assert.equal(afterContract.status, "Đã thanh lý");

  const afterTenant = afterState.tenants.find((t) => t.id === activeContract.tenantId)!;
  assert.equal(afterTenant.status, "Đã trả phòng");

  const afterRoom = afterState.rooms.find((r) => r.id === activeContract.roomId)!;
  const bedEntry = Object.values(afterRoom.bedOverrides ?? {}).find((b) => b.id === activeContract.bedId)!;
  assert.equal(bedEntry.status, "MAINTENANCE");

  // Vehicles revoked
  const tenantVehicles = afterState.vehicles.filter((v) => v.tenantId === activeContract.tenantId);
  for (const v of tenantVehicles) {
    assert.equal(v.cardStatus, "Đã thu hồi");
  }

  // Invoices preserved
  const tenantInvoices = afterState.invoices.filter((inv) => inv.contractId === activeContract.id);
  assert.ok(tenantInvoices.length > 0);

  // Clean up
  await mockDormService.resetMockData();
});
