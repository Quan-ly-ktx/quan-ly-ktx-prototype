import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";
import { recordViolation, getViolations, getIncidentNotifications } from "../services/mock/incidentStore.ts";

test("Task 7: Incident workflow - create -> assign -> start -> complete with parts", async () => {
  const state = getMockSnapshot();
  const activeTenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0187")!;
  assert.ok(activeTenant);
  const activeRoom = state.rooms.find((r) => r.code === activeTenant.room)!;
  assert.ok(activeRoom);

  // 1. Tenant creates ticket (Chưa phân công, no assignee)
  const created = await mockDormService.createTicket({
    title: "Vòi sen phòng tắm rò rỉ",
    description: "Vòi sen rò nước liên tục ở đầu nối",
    category: "Nước",
    priority: "Cao",
    status: "Chưa phân công",
    reporterTenantId: activeTenant.id,
    reporter: activeTenant.name,
    phone: activeTenant.phone,
    roomId: activeRoom.id,
    room: activeRoom.code,
    createdAt: new Date().toISOString(),
    deadline: "",
    hasPhoto: false,
  });

  assert.equal(created.status, "Chưa phân công");
  assert.equal(created.assigneeStaffId, undefined);

  // 2. Manager assigns ticket to tech-1 -> Mới giao
  const assigned = await mockDormService.updateTicket(created.id, {
    status: "Mới giao",
    assigneeStaffId: "tech-1",
    deadline: "2026-11-10",
  });
  assert.equal(assigned.status, "Mới giao");
  assert.equal(assigned.assigneeStaffId, "tech-1");

  // 3. Technician tech-1 starts processing -> Đang xử lý
  // Another technician cannot process it
  await assert.rejects(
    mockDormService.updateTicket(assigned.id, { status: "Đang xử lý" }, "tech-2"),
    /Chỉ kỹ thuật viên hiện được giao có thể xử lý phiếu/
  );

  const processing = await mockDormService.updateTicket(assigned.id, { status: "Đang xử lý" }, "tech-1");
  assert.equal(processing.status, "Đang xử lý");

  // 4. Technician completes ticket with parts
  const parts = [
    { name: "Gioăng cao su vòi sen", quantity: 2, unitCost: 15000 },
    { name: "Khớp nối ren", quantity: 1, unitCost: 45000 },
  ];
  const completed = await mockDormService.updateTicket(
    processing.id,
    {
      status: "Hoàn thành",
      resolution: "Đã thay 2 gioăng cao su và khớp nối ren mới, xả thử áp lực 5 phút không còn rò nước.",
      completionPhoto: "data:image/png;base64,demoPhotoData",
      parts,
      cost: 75000,
      completedAt: new Date().toISOString(),
    },
    "tech-1"
  );
  assert.equal(completed.status, "Hoàn thành");
  assert.equal(completed.cost, 75000);
  assert.equal(completed.parts?.length, 2);

  // 5. Completed ticket cannot be reopened or edited
  await assert.rejects(
    mockDormService.updateTicket(completed.id, { status: "Đang xử lý" }, "tech-1"),
    /Không thể cập nhật phiếu đã hoàn thành/
  );

  await mockDormService.resetMockData();
});

test("Task 7: Discipline record enforces resident status and does not generate invoice", async () => {
  const state = getMockSnapshot();
  const checkedOutTenant = state.tenants.find((t) => t.status === "Đã trả phòng")!;
  assert.ok(checkedOutTenant);

  // 1. Violation on checked-out tenant is rejected
  assert.throws(
    () => recordViolation(checkedOutTenant, {
      type: "Gây ồn",
      level: "Nhắc nhở",
      date: "09/11/2026",
      note: "Hát hò đêm",
    }),
    /Người thuê đã trả phòng/
  );

  // 2. Active resident receives violation and personal notification, without creating invoice
  const activeTenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0187")!;
  assert.ok(activeTenant);
  const invoicesBefore = (await mockDormService.getInvoices()).length;

  const violation = recordViolation(activeTenant, {
    type: "Về muộn",
    level: "Phạt tiền",
    fine: 100000,
    date: "09/11/2026",
    note: "Về sau 23:00 không báo trước",
  });

  assert.equal(violation.tenantId, activeTenant.id);
  assert.equal(violation.fine, 100000);

  // Notifications updated
  const notis = getIncidentNotifications(activeTenant.id);
  assert.ok(notis.some((n) => n.title === "Biên bản vi phạm" && n.body.includes("100.000 đ")));

  // Invoice count must remain unchanged (fines are recorded only, not billed as receivables)
  const invoicesAfter = (await mockDormService.getInvoices()).length;
  assert.equal(invoicesAfter, invoicesBefore);

  await mockDormService.resetMockData();
});
