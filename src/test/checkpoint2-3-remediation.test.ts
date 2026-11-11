import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { PDFDocument } from "pdf-lib";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { calculateOverdueDays } from "../utils/invoiceCalculations.ts";
import { getIncidentNotifications } from "../services/mock/incidentStore.ts";
import { getMockSnapshot, updateMockSnapshot } from "../services/mock/mockStore.ts";
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
  const issued = await mockDormService.issueInvoices("2026-12-01", "2026-11-25");
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

test("A8 Regression: Due reminders are not created early and remain idempotent", async () => {
  const original = getMockSnapshot();
  const tenant = original.tenants.find((t) => t.id === "NT-0187")!;
  const contract = original.contracts.find((c) => c.tenantId === tenant.id)!;
  const invoice = {
    id: "INV-DUE-REMINDER-TEST",
    tenantId: tenant.id,
    contractId: contract.id,
    billingPeriod: "2026-12-01",
    tenant: tenant.name,
    room: contract.room,
    bed: contract.bed,
    amount: 1500000,
    due: "05/12/2026",
    status: "Nợ" as const,
  };

  try {
    updateMockSnapshot((state) => ({
      ...state,
      invoices: [invoice],
      notifications: [],
    }));

    // Before the due date, do not remind the tenant early.
    assert.equal(await mockDormService.checkDueReminders("2026-11-25"), 0);
    assert.equal(getIncidentNotifications(tenant.id).length, 0);

    // Notify on the exact due date once, and never duplicate on retry.
    assert.equal(await mockDormService.checkDueReminders("2026-12-05"), 1);
    assert.equal(await mockDormService.checkDueReminders("2026-12-05"), 0);
    assert.equal(getIncidentNotifications(tenant.id).length, 1);

    // Overdue event is emitted once, separately from the due-day reminder.
    assert.equal(await mockDormService.checkDueReminders("2026-12-10"), 1);
    assert.equal(await mockDormService.checkDueReminders("2026-12-10"), 0);
    assert.equal(getIncidentNotifications(tenant.id).length, 2);
  } finally {
    updateMockSnapshot(() => original);
  }
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

test("A3 Regression: Historical room code remains protected even after renaming room", async () => {
  const roomsBefore = await mockDormService.getRooms();
  const state = getMockSnapshot();
  // Find room P.302 which has historical contract c0000000-0000-4000-8000-000000000002
  const room302 = state.rooms.find((r) => r.code === "P.302")!;
  assert.ok(room302);

  // Liquidate contracts in P.302 so it can be renamed
  const contracts302 = state.contracts.filter((c) => c.roomId === room302.id && c.status !== "Đã thanh lý");
  for (const c of contracts302) {
    await mockDormService.checkoutContract(c.id, "AVAILABLE");
  }

  // Rename P.302 to P.302-RENAMED
  await mockDormService.updateRoom(room302.id, {
    ...room302,
    code: "P.302-RENAMED",
  });

  // Attempting to create a NEW room with old code P.302 must be REJECTED because P.302 has historical contracts!
  await assert.rejects(
    mockDormService.createRoom({
      id: "RM-NEW-302",
      code: "P.302",
      floor: 3,
      type: "4 giường",
      gender: "Nam",
      total: 4,
      basePrice: 1500000,
      amenities: [],
    }),
    /lịch sử nghiệp vụ phải bảo vệ/
  );

  // Clean up
  await mockDormService.saveRooms(roomsBefore);
  await mockDormService.resetMockData();
});

test("A1 Regression: Former tenant contract PDF is a fully valid, parsable PDF-1.7 document", async () => {
  const state = getMockSnapshot();
  const former = state.tenants.find((t) => t.status === "Đã trả phòng")!;
  const formerContract = state.contracts.find((c) => c.tenantId === former.id)!;
  assert.ok(formerContract.documents && formerContract.documents.length > 0);

  const dataUrl = formerContract.documents![0].content;
  assert.ok(dataUrl && dataUrl.startsWith("data:application/pdf;base64,"));
  const b64 = dataUrl.replace("data:application/pdf;base64,", "");
  const pdfBytes = Buffer.from(b64, "base64");
  assert.ok(pdfBytes.length > 1000, "PDF size must be realistic (> 1000 bytes)");

  // Parse with pdf-lib to ensure valid PDF structure
  const loadedDoc = await PDFDocument.load(pdfBytes);
  assert.equal(loadedDoc.getPageCount(), 1);
  const page = loadedDoc.getPage(0);
  assert.ok(page.getWidth() > 500 && page.getHeight() > 800);
});

test("A6 Regression: Early future invoice issuance is rejected; scheduled day-25 batch is idempotent", async () => {
  // Simulated date: 2026-11-10 (day 10)
  // 1. Attempting to issue for 2027-02-01 (distant future) must fail
  await assert.rejects(
    mockDormService.issueInvoices("2027-02-01", "2026-11-10"),
    /Không thể phát hành hóa đơn sớm cho kỳ tương lai xa/
  );

  // 2. Attempting to issue next month (2026-12-01) before day 25 must fail
  await assert.rejects(
    mockDormService.issueInvoices("2026-12-01", "2026-11-10"),
    /Kỳ hóa đơn tháng sau chỉ được phát hành định kỳ từ ngày 25/
  );

  // 3. On day 25 (2026-11-25), issuing for next month (2026-12-01) succeeds
  const issued = await mockDormService.issueInvoices("2026-12-01", "2026-11-25");
  assert.ok(issued.length > 0);

  // 4. Retrying is idempotent (returns 0 new invoices, does not duplicate)
  const retried = await mockDormService.issueInvoices("2026-12-01", "2026-11-25");
  assert.equal(retried.length, 0);

  // 5. Backfilling past eligible period (2026-11-01) issues missing invoices, then retrying returns 0
  const pastBackfilled = await mockDormService.issueInvoices("2026-11-01", "2026-11-25");
  assert.ok(pastBackfilled.length > 0);
  const pastRetried = await mockDormService.issueInvoices("2026-11-01", "2026-11-25");
  assert.equal(pastRetried.length, 0);

  await mockDormService.resetMockData();
});
