import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { calculateOverdueDays } from "../utils/invoiceCalculations.ts";
import { getIncidentNotifications } from "../services/mock/incidentStore.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";
import type { RoomRecord } from "../types/room.ts";

// A3 Tests
test("A3: Mistaken room deletion, archiving and restoration commands", async () => {
  const roomsBefore = await mockDormService.getRooms();
  const contracts = await mockDormService.getContracts();

  // 1. Create a mistaken room
  const tempRoom: RoomRecord = {
    id: "RM-TEMP-MISTAKEN",
    code: "P.999MISTAKE",
    floor: 9,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1500000,
    amenities: [],
  };
  const created = await mockDormService.createRoom(tempRoom);
  assert.ok(created.id);

  // 2. deleteMistakenRoom physically deletes it because it has no history
  await mockDormService.deleteMistakenRoom(created.id);
  const roomsAfterDelete = await mockDormService.getRooms();
  assert.ok(!roomsAfterDelete.some((r) => r.id === created.id));

  // 3. Since it was physically deleted, its room code is completely freed for reuse!
  const recreated = await mockDormService.createRoom(tempRoom);
  assert.ok(recreated.id);

  // 4. Room with contract cannot be deleted via deleteMistakenRoom
  const occupiedContract = contracts.find((c) => c.status !== "Đã thanh lý")!;
  assert.ok(occupiedContract);
  await assert.rejects(
    mockDormService.deleteMistakenRoom(occupiedContract.roomId),
    /Phòng đã có lịch sử nghiệp vụ/
  );

  // 5. archiveRoom sets deletedAt
  await mockDormService.archiveRoom(recreated.id);
  const roomsAfterArchive = await mockDormService.getRooms();
  const archivedRoom = roomsAfterArchive.find((r) => r.id === recreated.id);
  assert.ok(archivedRoom?.deletedAt);

  // 6. Archived room code is protected against duplicate creation
  await assert.rejects(
    mockDormService.createRoom({ ...tempRoom, code: tempRoom.code }),
    /Mã phòng đã được sử dụng/
  );

  // 7. restoreRoom restores the room into active status
  const restored = await mockDormService.restoreRoom(recreated.id);
  assert.equal(restored.deletedAt, undefined);
  assert.equal(restored.id, recreated.id);
  assert.equal(restored.code, tempRoom.code);

  await mockDormService.saveRooms(roomsBefore);
});

// A6 Tests
test("A6: Dynamic overdue calculation excludes pending confirmation and calculates days late", () => {
  const due = "05/11/2026";
  const todayPast = "2026-11-09"; // 4 days past Nov 5

  // 1. Status "Chờ xác nhận" is NEVER overdue
  assert.equal(calculateOverdueDays(due, "Chờ xác nhận", todayPast), 0);

  // 2. Status "Đã thu" is NEVER overdue
  assert.equal(calculateOverdueDays(due, "Đã thu", todayPast), 0);

  // 3. Status "Nợ" past due date is overdue by exact day difference
  const days = calculateOverdueDays(due, "Nợ", todayPast);
  assert.equal(days, 4);

  // 4. Status "Nợ" before due date is not overdue
  const todayBefore = "2026-11-03";
  assert.equal(calculateOverdueDays(due, "Nợ", todayBefore), 0);
});

test("A6: Invoice Excel generation creates valid spreadsheet with correct headers and data", async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Hóa đơn");
  sheet.columns = [
    { header: "Mã hóa đơn", key: "id", width: 18 },
    { header: "Số tiền", key: "amount", width: 16 },
    { header: "Trạng thái", key: "status", width: 16 },
  ];
  sheet.addRow({ id: "INV-TEST-001", amount: 1500000, status: "Nợ" });

  const buffer = await workbook.xlsx.writeBuffer();
  assert.ok(buffer.byteLength > 0);

  // Read back to verify Excel content integrity
  const reader = new ExcelJS.Workbook();
  await reader.xlsx.load(buffer);
  const readSheet = reader.getWorksheet("Hóa đơn")!;
  assert.ok(readSheet);
  assert.equal(readSheet.getCell("A2").value, "INV-TEST-001");
  assert.equal(readSheet.getCell("B2").value, 1500000);
});

// A7 Tests
test("A7: Tenant self-profile update allows contact fields and rejects identity fields", async () => {
  const state = getMockSnapshot();
  const tenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0187")!;
  assert.ok(tenant);

  // 1. Tenant role cannot modify cccd, name, email, or gender
  await assert.rejects(
    mockDormService.updateTenantProfile(
      tenant.id,
      { name: "Tên Giả Mạo", phone: "0911222333" },
      "tenant"
    ),
    /Người thuê chỉ được phép chỉnh sửa số điện thoại, địa chỉ và liên hệ khẩn cấp/
  );

  await assert.rejects(
    mockDormService.updateTenantProfile(
      tenant.id,
      { cccd: "999999999999", phone: "0911222333" },
      "tenant"
    ),
    /Người thuê chỉ được phép chỉnh sửa số điện thoại, địa chỉ và liên hệ khẩn cấp/
  );

  // 2. Tenant role can update phone, address, and emergency contact
  const updated = await mockDormService.updateTenantProfile(
    tenant.id,
    {
      phone: "0988777666",
      address: "Số 123 Đường Mới, Hà Nội",
      emergencyContactName: "Nguyễn Văn Phụ (Bố)",
      emergencyContactPhone: "0912345678",
    },
    "tenant"
  );

  assert.equal(updated.phone, "0988777666");
  assert.equal(updated.address, "Số 123 Đường Mới, Hà Nội");
  assert.equal(updated.emergencyContactName, "Nguyễn Văn Phụ (Bố)");
  assert.equal(updated.emergencyContactPhone, "0912345678");

  await mockDormService.resetMockData();
});

// A8 Tests
test("A8: Automatic notifications generated for invoice issuance, rejection, and payment", async () => {
  const state = getMockSnapshot();
  const tenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0187")!;
  assert.ok(tenant);

  // 1. Batch issue invoice -> generates notification
  const issued = await mockDormService.issueInvoices("2026-12-01");
  assert.ok(issued.length > 0);
  const tenantInv = issued.find((inv) => inv.tenantId === tenant.id);
  assert.ok(tenantInv);

  const notisAfterIssue = getIncidentNotifications(tenant.id);
  assert.ok(
    notisAfterIssue.some((n) => n.title === "Phát hành hóa đơn tiền phòng" && n.body.includes("2026-12-01"))
  );

  // 2. Submit proof and reject -> generates rejection notification
  await mockDormService.submitInvoiceProof(tenantInv.id, tenant.id, {
    fileName: "proof.png",
    submittedAt: "2026-11-09T00:00:00Z",
  });
  await mockDormService.rejectInvoiceProof(tenantInv.id);

  const notisAfterReject = getIncidentNotifications(tenant.id);
  assert.ok(
    notisAfterReject.some((n) => n.title === "Minh chứng thanh toán bị từ chối" && n.body.includes(tenantInv.id))
  );

  // 3. Confirm payment -> generates confirmation notification
  await mockDormService.confirmPayment(tenantInv.id, "demo-manager-staff");
  const notisAfterConfirm = getIncidentNotifications(tenant.id);
  assert.ok(
    notisAfterConfirm.some((n) => n.title === "Xác nhận thanh toán thành công" && n.body.includes(tenantInv.id))
  );

  // 4. Check due / overdue notifications
  const count = await mockDormService.checkDueReminders("2026-12-10"); // past due 05/12
  assert.ok(count > 0);
  const notisAfterOverdue = getIncidentNotifications(tenant.id);
  assert.ok(
    notisAfterOverdue.some((n) => n.title === "Thông báo hóa đơn quá hạn" || n.title === "Nhắc nhở hạn nộp tiền phòng")
  );
  await mockDormService.resetMockData();
});

// A1 & A10 Tests
test("A1 & A10: Checked-out tenant has readable contract documents and business date simulation works", async () => {
  const state = getMockSnapshot();
  const former = state.tenants.find((t) => t.status === "Đã trả phòng")!;
  assert.ok(former);

  // 1. Former tenant's contract has accessible sample document
  const formerContract = state.contracts.find((c) => c.tenantId === former.id)!;
  assert.ok(formerContract);
  assert.equal(formerContract.status, "Đã thanh lý");
  assert.ok(formerContract.documents && formerContract.documents.length > 0);
  const docContent = formerContract.documents![0].content;
  assert.ok(docContent && docContent.startsWith("data:application/pdf"));

  // 2. Business date simulation changes business date and restores to real date
  const realDate = mockDormService.getBusinessDate();
  mockDormService.setBusinessDate("2027-01-01");
  assert.equal(mockDormService.getBusinessDate(), "2027-01-01");

  // Restore
  mockDormService.setBusinessDate(undefined);
  assert.equal(mockDormService.getBusinessDate(), realDate);
});
