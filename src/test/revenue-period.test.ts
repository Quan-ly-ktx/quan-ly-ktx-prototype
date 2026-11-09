import assert from "node:assert/strict";
import test from "node:test";
import { revenueForPeriod } from "../utils/revenueForPeriod.ts";
import type { Invoice } from "../types/invoice.ts";

const invoice = (id: string, billingPeriod: string, status: Invoice["status"], amount: number): Invoice => ({
  id, contractId: `contract-${id}`, billingPeriod, status, amount, tenant: "Khách", room: "P.1", bed: "G01", due: "05/11/2026",
});

test("revenue uses invoice period and excludes pending and unpaid from collected revenue", () => {
  const rows = [invoice("a", "2026-10-01", "Đã thu", 1500000), invoice("b", "2026-10-01", "Chờ xác nhận", 900000), invoice("c", "2026-11-01", "Đã thu", 2000000)];
  assert.deepEqual(revenueForPeriod(rows, "2026-10"), { expected: 2400000, collected: 1500000 });
});

test("revenue is unavailable when an invoice has an invalid billing period", () => {
  const missing = invoice("a", "2026-13-01", "Nợ", 100);
  assert.equal(revenueForPeriod([missing], "2026-10"), null);
});
