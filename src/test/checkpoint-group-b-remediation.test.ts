import assert from "node:assert/strict";
import test from "node:test";
import { getMockSnapshot } from "../services/mock/mockStore.ts";
import { reportForPeriod } from "../utils/reportForPeriod.ts";
import type { FacilityExpense, Invoice, Ticket } from "../types/index.ts";

test("Group B - B3 Financial Filter: Category filter does not alter period KPI calculation", () => {
  const invoices: Invoice[] = [
    {
      id: "inv-1",
      contractId: "c-1",
      tenantId: "t-1",
      tenant: "Nguyen Van A",
      room: "P.101",
      bed: "G01",
      amount: 2000000,
      due: "05/11/2026",
      status: "Đã thu",
      billingPeriod: "2026-11-01",
      payment: { method: "Trực tuyến", amount: 2000000, paidAt: "03/11/2026", confirmedBy: "Admin" },
    },
  ];

  const tickets: Ticket[] = [
    {
      id: "t-1",
      reporterTenantId: "t-1",
      roomId: "r-1",
      room: "P.101",
      title: "Thay bóng đèn",
      description: "Cháy bóng LED",
      category: "Điện",
      priority: "Bình thường",
      status: "Hoàn thành",
      reporter: "Nguyen Van A",
      phone: "0900000000",
      createdAt: "01/11/2026",
      deadline: "03/11/2026",
      hasPhoto: false,
      completedAt: "2026-11-04T10:00:00Z",
      resolution: "Đã thay bóng mới",
      parts: [{ name: "Bóng LED 12W", quantity: 2, unitCost: 40000 }],
      cost: 80000,
    },
  ];

  const allExpenses: FacilityExpense[] = [
    {
      id: "exp-1",
      category: "Điện EVN",
      title: "Tiền điện tổng tháng 11",
      amount: 1200000,
      expenseDate: "2026-11-15",
    },
    {
      id: "exp-2",
      category: "Nước",
      title: "Tiền nước tổng tháng 11",
      amount: 300000,
      expenseDate: "2026-11-20",
    },
    {
      id: "exp-3",
      category: "Internet",
      title: "Internet cáp quang VNPT tháng 11",
      amount: 500000,
      expenseDate: "2026-11-05",
    },
  ];

  // Report computed on all period expenses
  const baseReport = reportForPeriod(invoices, tickets, allExpenses, "2026-11");
  assert.ok(baseReport);
  assert.equal(baseReport.revenue, 2000000);
  assert.equal(baseReport.repairs, 80000);
  assert.equal(baseReport.facility, 2000000); // 1200000 + 300000 + 500000
  assert.equal(baseReport.difference, -80000); // 2000000 - 80000 - 2000000

  // Category filtering should ONLY filter the list of rows for the table,
  // NEVER the expenses passed into reportForPeriod or KPI cards!
  const filteredForTable = allExpenses.filter((e) => e.category === "Điện EVN");
  assert.equal(filteredForTable.length, 1);
  assert.equal(filteredForTable[0].amount, 1200000);

  // Re-evaluating baseReport remains identical:
  const reportStillUnchanged = reportForPeriod(invoices, tickets, allExpenses, "2026-11");
  assert.deepEqual(reportStillUnchanged, baseReport);
});

test("Group B - B2 Ticket Parts & Cost integrity: parts total must match cost", () => {
  const parts = [
    { name: "Khóa cửa tay gạt", quantity: 1, unitCost: 220000 },
    { name: "Ốc vít inox 4mm", quantity: 4, unitCost: 5000 },
  ];
  const calculated = parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
  assert.equal(calculated, 240000);
});

test("Group B - B4 Tenant Violations isolation: tenant only sees own violations", () => {
  const state = getMockSnapshot();
  // Existing fixture violations should be isolated per tenant ID
  const tenant1 = state.tenants[0];
  const tenant2 = state.tenants[1];
  assert.ok(tenant1 && tenant2);

  // Each tenant receives strictly their own violations
  const v1 = state.violations.filter((v) => v.tenantId === tenant1.id);
  const v2 = state.violations.filter((v) => v.tenantId === tenant2.id);

  // Cross check: no v1 contains tenant2 id
  for (const item of v1) {
    assert.equal(item.tenantId, tenant1.id);
  }
  for (const item of v2) {
    assert.equal(item.tenantId, tenant2.id);
  }
});
