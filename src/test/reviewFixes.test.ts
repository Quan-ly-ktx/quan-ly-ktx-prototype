import test from "node:test";
import assert from "node:assert/strict";
import { money } from "../utils/formatters.ts";
import { money as mockMoney } from "../services/mock/mockData.ts";
import { mockDormService } from "../services/mock/mockDormService.ts";

test("Canonical money formatter is identical across modules", () => {
  assert.equal(money(1500000), "1.500.000 đ");
  assert.equal(mockMoney(1500000), "1.500.000 đ");
  assert.equal(money, mockMoney);
});

test("mockDormService.confirmPayment marks invoice as Đã thu and records payment", async () => {
  const invoices = await mockDormService.getInvoices();
  const unpaid = invoices.find((i) => i.status !== "Đã thu") || invoices[0];
  const confirmed = await mockDormService.confirmPayment(unpaid.id, "Test Manager");
  assert.equal(confirmed.status, "Đã thu");
  assert.equal(confirmed.payment?.confirmedBy, "Test Manager");
});
