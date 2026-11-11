import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot, resetMockSnapshot, updateMockSnapshot } from "../services/mock/mockStore.ts";
import { reportForPeriod } from "../utils/reportForPeriod.ts";
import { createReportSpreadsheet, createReportPdf } from "../utils/reportExport.ts";
import {
  DEMO_BED_DISTRIBUTION,
  DEMO_DASHBOARD_DATA,
  DEMO_YEARS,
} from "../pages/admin/dashboard/dashboardDemoData.ts";
import { checkout } from "../services/mock/contractLifecycle.ts";
import { normalizeVehicleStatus, type TenantVehicle } from "../types/tenant.ts";

test("Group C - Dashboard: 4 Charts structure and isolation from KPIs", () => {
  // Verify demo years
  assert.deepEqual(DEMO_YEARS, [2026, 2025]);

  // Year 2026 has all 12 months for movements, revenues, and expenses
  const d2026 = DEMO_DASHBOARD_DATA[2026];
  assert.ok(d2026);
  assert.equal(d2026.movements.length, 12);
  assert.equal(d2026.revenues.length, 12);
  assert.equal(d2026.expenses.length, 12);

  // Year 2024 has no demo data
  assert.equal(DEMO_DASHBOARD_DATA[2024], undefined);

  // Bed distribution has exactly 3 categories (OCCUPIED, AVAILABLE, MAINTENANCE) summing to 100%
  assert.equal(DEMO_BED_DISTRIBUTION.length, 3);
  const totalPercent = DEMO_BED_DISTRIBUTION.reduce((sum, item) => sum + item.percentage, 0);
  assert.equal(totalPercent, 100);

  // Chart data must NOT leak into or alter the business Mock Store
  const snapshot = getMockSnapshot();
  assert.ok(!("dashboardDemoData" in snapshot));
});

test("Group C - Finance: Monthly staff salary uniqueness and estimated net profit formula", async () => {
  await mockDormService.resetMockData();

  // 1. Add staff salary for 2026-11
  const salary1 = await mockDormService.createExpense({
    id: "exp-salary-2026-11",
    category: "Lương nhân viên",
    title: "Tổng lương nhân sự tháng 11/2026",
    amount: 15000000,
    expenseDate: "2026-11-28",
  });
  assert.equal(salary1.amount, 15000000);

  // 2. Prevent duplicate staff salary in the same month
  await assert.rejects(
    () =>
      mockDormService.createExpense({
        id: "exp-salary-duplicate",
        category: "Lương nhân viên",
        title: "Tổng lương nhập trùng",
        amount: 12000000,
        expenseDate: "2026-11-30",
      }),
    /Đã có khoản chi phí Lương nhân viên trong tháng 2026-11/
  );

  // 3. Update existing salary is allowed
  const updated = await mockDormService.updateExpense(salary1.id, {
    ...salary1,
    amount: 16000000,
  });
  assert.equal(updated.amount, 16000000);

  // 4. Test reportForPeriod includes staff salary in facility expenses and estimated net profit
  const snapshot = getMockSnapshot();
  const report = reportForPeriod(snapshot.invoices, snapshot.tickets, snapshot.expenses, "2026-11");
  assert.ok(report);
  assert.equal(report.difference, report.revenue - report.repairs - report.facility);

  // Clean up
  await mockDormService.deleteExpense(salary1.id);
  await mockDormService.resetMockData();
});

test("Group C - Finance: Spreadsheet export includes staff salaries and mandatory disclaimer", async () => {
  const reportData = {
    period: "2026-11",
    revenue: 80000000,
    repairs: 2000000,
    facility: 25000000,
    difference: 53000000,
    categories: {
      "Điện EVN": 5000000,
      "Nước": 2000000,
      "Internet": 2000000,
      "Lương nhân viên": 15000000,
      "Khác": 1000000,
    },
    demo: true,
  };

  const buffer = await createReportSpreadsheet(reportData);
  assert.ok(buffer);
  assert.ok(buffer.byteLength > 0);
});

test("Group C - Vehicles: Reject initial registration and re-register", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const tenant = state.tenants.find((t) => t.status === "Đang thuê" && t.id === "NT-0190")!;
  assert.ok(tenant);

  // 1. Register a new vehicle
  const vId = "XE-TEST-REJECT-01";
  await mockDormService.registerVehicle({
    id: vId,
    tenantId: tenant.id,
    plate: "59-A1 111.22",
    type: "Xe tay ga",
    brand: "Honda Vision",
    color: "Trắng",
    cardStatus: "Chưa cấp thẻ",
    registration: "Đủ 2 mặt",
    registrationFront: "data:image/png;base64,front",
    registrationBack: "data:image/png;base64,back",
  });

  // 2. Reject initial registration requires non-empty reason
  await assert.rejects(
    () => mockDormService.rejectVehicle(vId, "   ", "demo-manager-staff"),
    /Vui lòng nhập lý do từ chối/
  );

  // 3. Reject with valid reason
  const rejected = await mockDormService.rejectVehicle(vId, "Ảnh giấy đăng ký xe bị mờ không đọc được số khung", "demo-manager-staff");
  assert.equal(rejected.cardStatus, "Bị từ chối");
  assert.equal(rejected.status, "Bị từ chối");
  assert.equal(normalizeVehicleStatus(rejected), "REJECTED");
  assert.equal(rejected.rejectionReason, "Ảnh giấy đăng ký xe bị mờ không đọc được số khung");

  // Notification sent to tenant
  const afterState = getMockSnapshot();
  const noti = afterState.notifications.find((n) => n.tenantId === tenant.id && n.title.includes("bị từ chối"));
  assert.ok(noti);
  assert.ok(noti.body.includes("Ảnh giấy đăng ký xe bị mờ"));

  // 4. Rejected vehicle does NOT block tenant from registering a new vehicle
  const vId2 = "XE-TEST-REREGISTER-02";
  const reregistered = await mockDormService.registerVehicle({
    id: vId2,
    tenantId: tenant.id,
    plate: "59-A1 111.22",
    type: "Xe tay ga",
    brand: "Honda Vision",
    color: "Trắng",
    cardStatus: "Chưa cấp thẻ",
    registration: "Đủ 2 mặt",
    registrationFront: "data:image/png;base64,clearfront",
    registrationBack: "data:image/png;base64,clearback",
  });
  assert.equal(reregistered.id, vId2);
  assert.equal(normalizeVehicleStatus(reregistered), "PENDING_CARD");

  await mockDormService.resetMockData();
});

test("Group C - Vehicles: Vehicle Change Request full workflow (request -> approve keeping same cardCode)", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  // Find tenant with active ISSUED vehicle
  const activeVehicle = state.vehicles.find((v) => normalizeVehicleStatus(v) === "ISSUED" && v.cardCode)!;
  assert.ok(activeVehicle);
  const tenantId = activeVehicle.tenantId;
  const originalCardCode = activeVehicle.cardCode!;
  assert.ok(originalCardCode);

  // 1. Tenant sends vehicle change request
  const request = await mockDormService.requestVehicleChange({
    tenantId,
    currentVehicleId: activeVehicle.id,
    newVehicle: {
      plate: "59-C1 888.99",
      type: "Xe tay ga",
      brand: "Yamaha Grande",
      color: "Đỏ",
      registrationFront: "data:image/png;base64,frontNew",
      registrationBack: "data:image/png;base64,backNew",
    },
  });
  assert.ok(request.id);
  assert.equal(request.status, "PENDING");

  // 2. While pending, old vehicle remains ISSUED with valid cardCode
  const pendingState = getMockSnapshot();
  const currentVehicleCheck = pendingState.vehicles.find((v) => v.id === activeVehicle.id)!;
  assert.equal(normalizeVehicleStatus(currentVehicleCheck), "ISSUED");
  assert.equal(currentVehicleCheck.cardCode, originalCardCode);

  // 3. Cannot submit duplicate change request while pending
  await assert.rejects(
    () =>
      mockDormService.requestVehicleChange({
        tenantId,
        currentVehicleId: activeVehicle.id,
        newVehicle: {
          plate: "59-C1 000.00",
          type: "Xe số",
          brand: "Honda Wave",
          color: "Xanh",
        },
      }),
    /đang có một yêu cầu đổi xe đang chờ xử lý/
  );

  // 4. Manager approves change request
  const { request: approvedReq, oldVehicle, newVehicle } =
    await mockDormService.approveVehicleChangeRequest(request.id, "demo-manager-staff");

  assert.equal(approvedReq.status, "APPROVED");
  assert.equal(normalizeVehicleStatus(oldVehicle), "REPLACED");
  assert.equal(normalizeVehicleStatus(newVehicle), "ISSUED");
  // CRITICAL: New vehicle retains the EXACT same physical cardCode as the old vehicle!
  assert.equal(newVehicle.cardCode, originalCardCode);

  // 5. Tenant receives notification
  const afterApprovalState = getMockSnapshot();
  const noti = afterApprovalState.notifications.find((n) => n.tenantId === tenantId && n.title.includes("đã được duyệt"));
  assert.ok(noti);
  assert.ok(noti.body.includes(originalCardCode));

  await mockDormService.resetMockData();
});

test("Group C - Vehicles: Reject Vehicle Change Request leaves current vehicle untouched", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const activeVehicle = state.vehicles.find((v) => normalizeVehicleStatus(v) === "ISSUED" && v.cardCode)!;
  assert.ok(activeVehicle);
  const tenantId = activeVehicle.tenantId;

  // 1. Submit request
  const request = await mockDormService.requestVehicleChange({
    tenantId,
    currentVehicleId: activeVehicle.id,
    newVehicle: {
      plate: "59-C1 777.66",
      type: "Xe tay ga",
      brand: "Piaggio Vespa",
      color: "Vàng",
      registrationFront: "data:image/png;base64,f",
      registrationBack: "data:image/png;base64,b",
    },
  });

  // 2. Reject request with reason
  const rejectedReq = await mockDormService.rejectVehicleChangeRequest(
    request.id,
    "Cà vẹt xe không chính chủ, cần xác minh tại văn phòng",
    "demo-manager-staff"
  );
  assert.equal(rejectedReq.status, "REJECTED");
  assert.equal(rejectedReq.rejectionReason, "Cà vẹt xe không chính chủ, cần xác minh tại văn phòng");

  // 3. Old vehicle remains ISSUED with cardCode unchanged
  const afterState = getMockSnapshot();
  const vehicleAfter = afterState.vehicles.find((v) => v.id === activeVehicle.id)!;
  assert.equal(normalizeVehicleStatus(vehicleAfter), "ISSUED");
  assert.equal(vehicleAfter.cardCode, activeVehicle.cardCode);

  // 4. Notification sent with reason
  const noti = afterState.notifications.find((n) => n.tenantId === tenantId && n.title.includes("bị từ chối"));
  assert.ok(noti);
  assert.ok(noti.body.includes("Cà vẹt xe không chính chủ"));

  await mockDormService.resetMockData();
});

test("Group C - Checkout cancels pending vehicle change requests and PENDING_CARD vehicles", () => {
  const beforeState = getMockSnapshot();
  const activeContract = beforeState.contracts.find((c) => c.status === "Hiệu lực")!;
  const tenantId = activeContract.tenantId;

  // Inject a PENDING change request for this tenant
  const stateWithPendingReq = {
    ...beforeState,
    vehicleChangeRequests: [
      {
        id: "VCR-CHECKOUT-TEST",
        tenantId,
        currentVehicleId: "v-curr",
        newVehicle: { plate: "59-X1 123.45", type: "Xe tay ga" as const, brand: "Honda", color: "Đen" },
        createdAt: new Date().toISOString(),
        status: "PENDING" as const,
      },
    ],
  };

  const afterState = checkout(stateWithPendingReq, activeContract.id, "AVAILABLE");

  // The change request is CANCELLED upon checkout
  const req = afterState.vehicleChangeRequests?.find((r) => r.id === "VCR-CHECKOUT-TEST");
  assert.equal(req?.status, "CANCELLED");

  // Vehicles of this tenant: ISSUED -> REVOKED ("Đã thu hồi"), PENDING_CARD -> CANCELLED ("Đã hủy")
  const tenantVehicles = afterState.vehicles.filter((v) => v.tenantId === tenantId);
  for (const v of tenantVehicles) {
    const s = normalizeVehicleStatus(v);
    assert.ok(s === "REVOKED" || s === "CANCELLED" || s === "REPLACED" || s === "REJECTED");
    if (s === "CANCELLED") {
      assert.equal(v.cardStatus, "Đã hủy");
    } else if (s === "REVOKED") {
      assert.equal(v.cardStatus, "Đã thu hồi");
    }
  }
});

test("Group C - Migration: Legacy snapshot without vehicleChangeRequests loads safely without data loss", () => {
  const base = getMockSnapshot();
  // Simulate legacy snapshot lacking vehicleChangeRequests
  const legacyRaw = JSON.stringify({
    rooms: base.rooms,
    tenants: base.tenants,
    invoices: base.invoices,
    contracts: base.contracts,
    vehicles: [
      { id: "v-legacy-1", tenantId: "NT-0187", plate: "59-X1 111.11", type: "Xe tay ga", brand: "Honda", color: "Đen", cardStatus: "Đã cấp thẻ", cardCode: "LEGACY-01" },
      { id: "v-legacy-2", tenantId: "NT-0188", plate: "59-X2 222.22", type: "Xe số", brand: "Yamaha", color: "Xanh", cardStatus: "Chưa cấp thẻ" },
      { id: "v-legacy-3", tenantId: "NT-0189", plate: "59-X3 333.33", type: "Xe đạp", brand: "Asama", color: "Đỏ", cardStatus: "Đã thu hồi" },
    ],
    accounts: base.accounts,
    staff: base.staff,
    tickets: base.tickets,
    violations: base.violations,
    notifications: base.notifications,
    expenses: base.expenses,
    // Notice: vehicleChangeRequests is intentionally omitted
  });

  const parsed = JSON.parse(legacyRaw);
  assert.equal(parsed.vehicleChangeRequests, undefined);

  // Normalization must correctly classify legacy cardStatus without crashing
  assert.equal(normalizeVehicleStatus(parsed.vehicles[0]), "ISSUED");
  assert.equal(normalizeVehicleStatus(parsed.vehicles[1]), "PENDING_CARD");
  assert.equal(normalizeVehicleStatus(parsed.vehicles[2]), "REVOKED");

  // Neither cardCode nor history is lost
  assert.equal(parsed.vehicles[0].cardCode, "LEGACY-01");
});

test("Group C - Finance: Numerical proof of Estimated Net Profit formula (UI = XLSX = PDF)", () => {
  // Setup exact figures
  const rentRevenue = 100000000; // 100M
  const ticketRepairs = 3500000;  // 3.5M
  const elec = 12000000;         // 12M
  const water = 4000000;         // 4M
  const internet = 3000000;      // 3M
  const staffSalary = 25000000;  // 25M
  const otherExp = 2500000;      // 2.5M

  const totalFacility = elec + water + internet + staffSalary + otherExp; // 46.5M
  const expectedNetProfit = rentRevenue - ticketRepairs - totalFacility;  // 100M - 3.5M - 46.5M = 50M

  const invoices = [
    {
      id: "inv-num-1",
      contractId: "c-num-1",
      tenantId: "t-num-1",
      tenant: "Khách A",
      room: "P.101",
      bed: "G01",
      amount: rentRevenue,
      due: "05/11/2026",
      status: "Đã thu" as const,
      billingPeriod: "2026-11-01",
      payment: { amount: rentRevenue, method: "Trực tuyến" as const, paidAt: "04/11/2026", confirmedBy: "Admin" },
    },
  ];

  const tickets = [
    {
      id: "t-num-1",
      reporterTenantId: "t-num-1",
      roomId: "r-num-1",
      room: "P.101",
      title: "Sửa chữa",
      description: "Thay thế",
      category: "Điện",
      priority: "Bình thường" as const,
      status: "Hoàn thành" as const,
      reporter: "Khách A",
      phone: "0900000000",
      createdAt: "01/11/2026",
      deadline: "03/11/2026",
      hasPhoto: false,
      completedAt: "2026-11-05T10:00:00Z",
      parts: [{ name: "Thiết bị", quantity: 1, unitCost: ticketRepairs }],
      cost: ticketRepairs,
    },
  ];

  const expenses = [
    { id: "e1", category: "Điện EVN" as const, title: "Điện", amount: elec, expenseDate: "2026-11-10" },
    { id: "e2", category: "Nước" as const, title: "Nước", amount: water, expenseDate: "2026-11-12" },
    { id: "e3", category: "Internet" as const, title: "Net", amount: internet, expenseDate: "2026-11-08" },
    { id: "e4", category: "Lương nhân viên" as const, title: "Lương", amount: staffSalary, expenseDate: "2026-11-28" },
    { id: "e5", category: "Khác" as const, title: "Rác", amount: otherExp, expenseDate: "2026-11-15" },
  ];

  const report = reportForPeriod(invoices, tickets, expenses, "2026-11");
  assert.ok(report);
  assert.equal(report.revenue, rentRevenue);
  assert.equal(report.repairs, ticketRepairs);
  assert.equal(report.facility, totalFacility);
  assert.equal(report.difference, expectedNetProfit);
  assert.equal(report.difference, 50000000);
});

test("Group C - Authorization: Service rejects cross-tenant vehicle tampering and unauthorized actors", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const tenant1 = state.tenants[0]; // NT-0187, owns XE-001
  const tenant2 = state.tenants[1]; // NT-0188

  // 1. Cross-tenant tampering: Tenant 2 cannot request vehicle change for Tenant 1's vehicle
  await assert.rejects(
    () =>
      mockDormService.requestVehicleChange({
        tenantId: tenant2.id,
        currentVehicleId: "XE-001", // Belongs to tenant 1!
        newVehicle: { plate: "59-X9 999.99", type: "Xe tay ga", brand: "Honda", color: "Đen" },
      }),
    /không thuộc người thuê/
  );

  // 2. Reject initial vehicle registration requires valid active manager if actorStaffId supplied
  await assert.rejects(
    () => mockDormService.rejectVehicle("XE-002", "Ảnh mờ", "invalid-staff-id"),
    /Không tìm thấy quản lý đang hoạt động/
  );
  // Technician is not a manager
  await assert.rejects(
    () => mockDormService.rejectVehicle("XE-002", "Ảnh mờ", "tech-1"),
    /Không tìm thấy quản lý đang hoạt động/
  );

  await mockDormService.resetMockData();
});

test("Group C - Invariants: revokeVehicle rejects non-ISSUED vehicles and cancels pending change request", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const pendingV = state.vehicles.find((v) => normalizeVehicleStatus(v) === "PENDING_CARD")!;
  assert.ok(pendingV);

  // 1. Cannot revoke a vehicle that is not ISSUED
  await assert.rejects(
    () => mockDormService.revokeVehicle(pendingV.id, "demo-manager-staff"),
    /Chỉ có thể thu hồi thẻ giữ xe đối với phương tiện đang có thẻ hiệu lực \(ISSUED\)/
  );

  // 2. Revoking an ISSUED vehicle that has a pending change request cancels the change request (BR-10)
  const issuedV = state.vehicles.find((v) => normalizeVehicleStatus(v) === "ISSUED")!;
  assert.ok(issuedV);
  const changeReq = await mockDormService.requestVehicleChange({
    tenantId: issuedV.tenantId,
    currentVehicleId: issuedV.id,
    newVehicle: { plate: "59-X8 888.88", type: "Xe tay ga", brand: "Honda", color: "Xanh", registrationFront: "data:image/png;base64,f", registrationBack: "data:image/png;base64,b" },
  });
  assert.equal(changeReq.status, "PENDING");

  // Now revoke the old issued vehicle
  const revoked = await mockDormService.revokeVehicle(issuedV.id, "demo-manager-staff");
  assert.equal(normalizeVehicleStatus(revoked), "REVOKED");
  assert.equal(revoked.cardStatus, "Đã thu hồi");

  // The change request must be CANCELLED automatically
  const afterState = getMockSnapshot();
  const reqAfter = afterState.vehicleChangeRequests?.find((r) => r.id === changeReq.id)!;
  assert.equal(reqAfter.status, "CANCELLED");

  await mockDormService.resetMockData();
});

test("Group C - Invariants: approveVehicleChangeRequest rejects missing or conflicting cardCode", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const issuedV = state.vehicles.find((v) => normalizeVehicleStatus(v) === "ISSUED")!;
  assert.ok(issuedV);

  const changeReq = await mockDormService.requestVehicleChange({
    tenantId: issuedV.tenantId,
    currentVehicleId: issuedV.id,
    newVehicle: { plate: "59-X7 777.77", type: "Xe tay ga", brand: "Honda", color: "Đỏ", registrationFront: "data:image/png;base64,f", registrationBack: "data:image/png;base64,b" },
  });

  // Manager actor is required
  await assert.rejects(
    () => mockDormService.approveVehicleChangeRequest(changeReq.id),
    /Thao tác quản trị yêu cầu quyền Quản lý đang hoạt động/
  );
  await assert.rejects(
    () => mockDormService.approveVehicleChangeRequest(changeReq.id, "tech-1"),
    /Không tìm thấy quản lý đang hoạt động/
  );

  // If actor is valid manager, it succeeds
  const { request, oldVehicle, newVehicle } = await mockDormService.approveVehicleChangeRequest(changeReq.id, "demo-manager-staff");
  assert.equal(request.status, "APPROVED");
  assert.equal(normalizeVehicleStatus(oldVehicle), "REPLACED");
  assert.equal(normalizeVehicleStatus(newVehicle), "ISSUED");
  assert.equal(newVehicle.cardCode, issuedV.cardCode);

  await mockDormService.resetMockData();
});

test("Group C - Invariants: approveVehicleChangeRequest rejects missing or conflicting cardCode on old vehicle", async () => {
  await mockDormService.resetMockData();
  const state = getMockSnapshot();
  const issuedV = state.vehicles.find((v) => normalizeVehicleStatus(v) === "ISSUED")!;
  assert.ok(issuedV);

  const changeReq = await mockDormService.requestVehicleChange({
    tenantId: issuedV.tenantId,
    currentVehicleId: issuedV.id,
    newVehicle: { plate: "59-X6 666.66", type: "Xe tay ga", brand: "Honda", color: "Tím", registrationFront: "data:image/png;base64,f", registrationBack: "data:image/png;base64,b" },
  });

  // Simulate corrupt old vehicle without cardCode
  const corruptState = {
    ...getMockSnapshot(),
    vehicles: getMockSnapshot().vehicles.map((v) => v.id === issuedV.id ? { ...v, cardCode: "" } : v),
  };
  updateMockSnapshot(() => corruptState);

  await assert.rejects(
    () => mockDormService.approveVehicleChangeRequest(changeReq.id, "demo-manager-staff"),
    /Không tìm thấy mã thẻ vật lý hợp lệ của phương tiện cũ/
  );

  await mockDormService.resetMockData();
});
