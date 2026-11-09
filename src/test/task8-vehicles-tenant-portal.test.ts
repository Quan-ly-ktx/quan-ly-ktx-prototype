import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";

test("Task 8: Vehicle lifecycle - register -> issue card -> duplicate card rejected -> revoke -> card reusable", async () => {
  const state = getMockSnapshot();
  // Find active tenant without unrevoked vehicle
  const tenant = state.tenants.find((t) => t.status === "Đang thuê" && !state.vehicles.some((v) => v.tenantId === t.id && v.cardStatus !== "Đã thu hồi"))!;
  assert.ok(tenant);

  // 1. Register vehicle (Chưa cấp thẻ)
  const vehicle = await mockDormService.registerVehicle({
    id: "XE-TEST-001",
    tenantId: tenant.id,
    plate: "59A-12345",
    type: "Xe tay ga",
    brand: "Honda Vision",
    color: "Trắng",
    cardStatus: "Chưa cấp thẻ",
  });
  assert.equal(vehicle.cardStatus, "Chưa cấp thẻ");

  // 2. Cannot register a second vehicle while first is not revoked
  await assert.rejects(
    mockDormService.registerVehicle({
      id: "XE-TEST-002",
      tenantId: tenant.id,
      plate: "59A-99999",
      type: "Xe đạp",
      brand: "Asama",
      color: "Đỏ",
      cardStatus: "Chưa cấp thẻ",
    }),
    /Người thuê đã có phương tiện chưa thu hồi/
  );

  // 3. Issue card
  const issued = await mockDormService.issueVehicleCard(vehicle.id, "CARD-001");
  assert.equal(issued.cardStatus, "Đã cấp thẻ");
  assert.equal(issued.cardCode, "CARD-001");

  // 4. Another vehicle cannot use the same card code while active
  const otherTenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id !== tenant.id && !state.vehicles.some((v) => v.tenantId === t.id && v.cardStatus !== "Đã thu hồi"))!;
  assert.ok(otherTenant);
  const otherVehicle = await mockDormService.registerVehicle({
    id: "XE-TEST-003",
    tenantId: otherTenant.id,
    plate: "59B-54321",
    type: "Xe tay ga",
    brand: "Yamaha",
    color: "Đen",
    cardStatus: "Chưa cấp thẻ",
  });
  await assert.rejects(
    mockDormService.issueVehicleCard(otherVehicle.id, "CARD-001"),
    /Mã thẻ đã được sử dụng/
  );

  // 5. Revoke first vehicle card
  const revoked = await mockDormService.revokeVehicle(vehicle.id);
  assert.equal(revoked.cardStatus, "Đã thu hồi");

  // 6. Now CARD-001 can be reused for otherVehicle
  const otherIssued = await mockDormService.issueVehicleCard(otherVehicle.id, "CARD-001");
  assert.equal(otherIssued.cardStatus, "Đã cấp thẻ");
  assert.equal(otherIssued.cardCode, "CARD-001");

  await mockDormService.resetMockData();
});

test("Task 8: Checked-out tenant cannot register vehicle", async () => {
  const state = getMockSnapshot();
  const former = state.tenants.find((t) => t.status === "Đã trả phòng")!;
  assert.ok(former);

  await assert.rejects(
    mockDormService.registerVehicle({
      id: "XE-FORMER-001",
      tenantId: former.id,
      plate: "59C-11111",
      type: "Xe máy",
      brand: "Wave",
      color: "Xanh",
      cardStatus: "Chưa cấp thẻ",
    }),
    /Người thuê không còn cư trú/
  );
});
