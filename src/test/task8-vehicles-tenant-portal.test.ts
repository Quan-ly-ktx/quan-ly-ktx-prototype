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
    registrationFront: "front.png",
    registrationBack: "back.png",
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

  await assert.rejects(
    mockDormService.issueVehicleCard(vehicle.id, "CARD-001", undefined!),
    /Thao tác quản trị yêu cầu quyền Quản lý đang hoạt động/
  );
  await assert.rejects(
    mockDormService.issueVehicleCard(vehicle.id, "CARD-001", "tech-1"),
    /Không tìm thấy quản lý đang hoạt động/
  );
  const issued = await mockDormService.issueVehicleCard(vehicle.id, "CARD-001", "demo-manager-staff");
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
    registrationFront: "front2.png",
    registrationBack: "back2.png",
    cardStatus: "Chưa cấp thẻ",
  });
  await assert.rejects(
    mockDormService.issueVehicleCard(otherVehicle.id, "card-001", "demo-manager-staff"),
    /Mã thẻ đã được sử dụng/
  );
  await assert.rejects(
    mockDormService.issueVehicleCard(otherVehicle.id, "CARD-001", "demo-manager-staff"),
    /Mã thẻ đã được sử dụng/
  );

  // 5. Revocation also requires an active manager.
  await assert.rejects(
    mockDormService.revokeVehicle(vehicle.id, undefined!),
    /Thao tác quản trị yêu cầu quyền Quản lý đang hoạt động/
  );
  await assert.rejects(
    mockDormService.revokeVehicle(vehicle.id, "tech-1"),
    /Không tìm thấy quản lý đang hoạt động/
  );
  const revoked = await mockDormService.revokeVehicle(vehicle.id, "demo-manager-staff");
  assert.equal(revoked.cardStatus, "Đã thu hồi");

  // 6. The normalized card code is reusable after revocation.
  const otherIssued = await mockDormService.issueVehicleCard(otherVehicle.id, "card-001", "demo-manager-staff");
  assert.equal(otherIssued.cardStatus, "Đã cấp thẻ");
  assert.equal(otherIssued.cardCode, "card-001");
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
