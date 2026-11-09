import assert from "node:assert/strict";
import test from "node:test";
import { reportForPeriod } from "../utils/reportForPeriod.ts";
import type { Invoice, FacilityExpense, Ticket } from "../types/index.ts";

const invoice: Invoice = { id: "i1", contractId: "contract-1", tenant: "A", room: "P.1", bed: "G01", amount: 1500000, billingPeriod: "2026-10-01", due: "05/10/2026", status: "Đã thu", payment: { amount: 1500000, method: "Tiền mặt", paidAt: "02/11/2026", confirmedBy: "Quản lý" } };
const expense: FacilityExpense = { id: "e1", category: "Nước", title: "Nước tháng 10", amount: 200000, expenseDate: "2026-10-20" };
const ticket: Ticket = { id: "t1", reporterTenantId: "tenant-1", roomId: "room-1", room: "P.1", title: "Vòi", description: "Rò", category: "Nước", priority: "Bình thường", status: "Hoàn thành", reporter: "A", phone: "0900000000", createdAt: "01/10/2026", deadline: "", hasPhoto: false, completedAt: "2026-10-31T17:30:00Z", parts: [{ name: "Van", quantity: 2, unitCost: 50000 }] };

test("report groups late payments by invoice period and repairs by Vietnam local completion date", () => {
  assert.deepEqual(reportForPeriod([invoice], [ticket], [expense], "2026-10"), { revenue: 1500000, repairs: 0, facility: 200000, difference: 1300000 });
  assert.deepEqual(reportForPeriod([invoice], [ticket], [expense], "2026-11"), { revenue: 0, repairs: 100000, facility: 0, difference: -100000 });
});

test("report refuses to calculate when completed repairs lack a completion time", () => {
  const invalid = { ...ticket, completedAt: undefined };
  assert.equal(reportForPeriod([invoice], [invalid], [expense], "2026-10"), null);
});
