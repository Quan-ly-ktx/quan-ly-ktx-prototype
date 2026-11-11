import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { mockTechnicianService } from "../services/technicianService.ts";
import { demoLogin } from "../services/mock/mockAuth.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";

// A2 Tests
test("A2: Manager updates technician email cleanly and atomically", async () => {
  const techs = await mockTechnicianService.getTechnicians();
  const list = Array.isArray(techs) ? techs : techs.items;
  const tech = list.find((t) => t.id === "tech-1")!;
  assert.ok(tech);
  const oldEmail = tech.email!;

  const newEmail = "thinh.remediation@ktxhub.vn";

  // Duplicate email check: try using an existing tenant's email
  await assert.rejects(
    mockTechnicianService.updateTechnician(tech.id, {
      fullName: tech.fullName,
      email: "tenant@gmail.com", // existing tenant email
      phone: tech.phone,
    }),
    /Email đã được sử dụng/
  );

  // Successful email change
  const updated = await mockTechnicianService.updateTechnician(tech.id, {
    fullName: "Võ Văn Thịnh Đã Đổi",
    email: newEmail,
    phone: tech.phone,
  });
  assert.equal(updated.email, newEmail);

  // Old email no longer logs in
  await assert.rejects(
    demoLogin({ identifier: oldEmail, password: "Demo1234!" }),
    /Thông tin đăng nhập không hợp lệ/
  );

  // New email logs in successfully
  const session = await demoLogin({ identifier: newEmail, password: "Demo1234!" });
  assert.equal(session.role, "technician");
  assert.equal(session.staffId, tech.id);

  // Restore
  await mockTechnicianService.updateTechnician(tech.id, {
    fullName: "Võ Văn Thịnh",
    email: oldEmail,
    phone: tech.phone,
  });
});

// A5 Tests
test("A5: Ticket created by active tenant can be assigned, processed and completed after tenant checkout", async () => {
  const state = getMockSnapshot();
  const activeTenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0187")!;
  assert.ok(activeTenant);
  const room = state.rooms.find((r) => r.code === activeTenant.room)!;
  assert.ok(room);

  // 1. Tenant creates ticket while residing
  const ticket = await mockDormService.createTicket({
    title: "Vỡ kính cửa sổ ban công",
    description: "Cửa sổ ban công bị rạn nứt do gió lốc",
    category: "Nội thất",
    priority: "Khẩn cấp",
    status: "Chưa phân công",
    reporterTenantId: activeTenant.id,
    reporter: activeTenant.name,
    phone: activeTenant.phone,
    roomId: room.id,
    room: room.code,
    createdAt: new Date().toISOString(),
    deadline: "",
    hasPhoto: false,
  });
  assert.equal(ticket.status, "Chưa phân công");

  // 2. Tenant checks out of dorm
  const contract = state.contracts.find((c) => c.tenantId === activeTenant.id && c.status === "Hiệu lực")!;
  assert.ok(contract);
  await mockDormService.checkoutContract(contract.id, "MAINTENANCE");

  // Verify tenant is checked out
  const stateAfterCheckout = getMockSnapshot();
  const tenantAfter = stateAfterCheckout.tenants.find((t) => t.id === activeTenant.id)!;
  assert.equal(tenantAfter.status, "Đã trả phòng");

  // 3. Manager can STILL assign the ticket
  const assigned = await mockDormService.updateTicket(ticket.id, {
    status: "Mới giao",
    assigneeStaffId: "tech-1",
  });
  assert.equal(assigned.status, "Mới giao");
  assert.equal(assigned.assigneeStaffId, "tech-1");

  // 4. Technician can start processing
  const inProgress = await mockDormService.updateTicket(assigned.id, { status: "Đang xử lý" }, "tech-1");
  assert.equal(inProgress.status, "Đang xử lý");

  // 5. Completion validation: missing resolution or photo must fail
  await assert.rejects(
    mockDormService.updateTicket(inProgress.id, {
      status: "Hoàn thành",
      resolution: "",
      completionPhoto: "",
    }, "tech-1"),
    /bắt buộc phải có kết quả xử lý và ảnh nghiệm thu/
  );

  // Cost mismatch must fail
  await assert.rejects(
    mockDormService.updateTicket(inProgress.id, {
      status: "Hoàn thành",
      resolution: "Đã thay kính cường lực mới",
      completionPhoto: "data:image/png;base64,photoData",
      parts: [{ name: "Kính cường lực 8mm", quantity: 1, unitCost: 350000 }],
      cost: 500000, // mismatch
    }, "tech-1"),
    /Tổng chi phí vật tư không khớp/
  );

  // Valid completion
  const completed = await mockDormService.updateTicket(inProgress.id, {
    status: "Hoàn thành",
    resolution: "Đã thay kính cường lực mới, vệ sinh khung nhôm sạch sẽ",
    completionPhoto: "data:image/png;base64,photoData",
    parts: [{ name: "Kính cường lực 8mm", quantity: 1, unitCost: 350000 }],
    cost: 350000,
    completedAt: new Date().toISOString(),
  }, "tech-1");

  assert.equal(completed.status, "Hoàn thành");
  assert.equal(completed.cost, 350000);

  await mockDormService.resetMockData();
});

// A9 Tests
test("A9: Vehicle registration validation strictly enforced in Mock Service", async () => {
  const state = getMockSnapshot();
  const tenant = state.tenants.find((t) => t.status === "Đang thuê" && !state.vehicles.some((v) => v.tenantId === t.id && v.cardStatus !== "Đã thu hồi"))!;
  assert.ok(tenant);

  // 1. Motorbike missing license plate must fail
  await assert.rejects(
    mockDormService.registerVehicle({
      id: "XE-INVALID-1",
      tenantId: tenant.id,
      plate: "",
      type: "Xe máy",
      brand: "Honda",
      color: "Đen",
      registrationFront: "front.jpg",
      registrationBack: "back.jpg",
      cardStatus: "Chưa cấp thẻ",
    }),
    /Biển số xe là bắt buộc đối với loại xe có đăng ký/
  );

  // 2. Motorbike missing registration photos must fail
  await assert.rejects(
    mockDormService.registerVehicle({
      id: "XE-INVALID-2",
      tenantId: tenant.id,
      plate: "59A-12345",
      type: "Xe máy",
      brand: "Honda",
      color: "Đen",
      registrationFront: "front.jpg",
      registrationBack: "", // missing back
      cardStatus: "Chưa cấp thẻ",
    }),
    /Bắt buộc phải có đủ 2 mặt ảnh giấy đăng ký xe/
  );

  // 3. Bicycle does not require registration photos
  const bicycle = await mockDormService.registerVehicle({
    id: "XE-VALID-BIKE",
    tenantId: tenant.id,
    plate: "",
    type: "Xe đạp",
    brand: "Asama",
    color: "Trắng",
    cardStatus: "Chưa cấp thẻ",
  });
  assert.equal(bicycle.cardStatus, "Chưa cấp thẻ");

  // 4. Multiple unrevoked vehicles per tenant must fail
  await assert.rejects(
    mockDormService.registerVehicle({
      id: "XE-SECOND-BIKE",
      tenantId: tenant.id,
      plate: "",
      type: "Xe đạp",
      brand: "Martin",
      color: "Đỏ",
      cardStatus: "Chưa cấp thẻ",
    }),
    /Người thuê đã có phương tiện chưa thu hồi/
  );

  await mockDormService.resetMockData();
});
