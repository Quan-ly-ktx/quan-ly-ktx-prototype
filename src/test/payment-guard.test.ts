import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot, updateMockSnapshot } from "../services/mock/mockStore.ts";

test("cash confirmation rejects a pending proof and leaves the invoice unchanged", async () => {
  const original = getMockSnapshot();
  const debt = original.invoices.find((invoice) => invoice.status === "Nợ");
  assert.ok(debt);
  const pending = { ...debt, status: "Chờ xác nhận" as const, proof: { fileName: "proof.png", submittedAt: "2026-11-01T00:00:00Z" } };
  try {
    updateMockSnapshot((state) => ({ ...state, invoices: state.invoices.map((invoice) => invoice.id === debt.id ? pending : invoice) }));
    await assert.rejects(mockDormService.confirmPayment(pending.id, "demo-manager-staff"));
    assert.deepEqual((await mockDormService.getInvoices()).find((invoice) => invoice.id === pending.id), pending);
  } finally {
    updateMockSnapshot(() => original);
  }
});

test("cash confirmation cannot create a second receipt for a paid invoice", async () => {
  const original = getMockSnapshot();
  const debt = original.invoices.find((invoice) => invoice.status === "Nợ");
  assert.ok(debt);
  try {
    const paid = await mockDormService.confirmPayment(debt.id, "demo-manager-staff");
    await assert.rejects(mockDormService.confirmPayment(debt.id, "demo-manager-staff"));
    assert.deepEqual((await mockDormService.getInvoices()).find((invoice) => invoice.id === debt.id), paid);
  } finally {
    updateMockSnapshot(() => original);
  }
});

test("updating a missing ticket fails without creating a partial ticket", async () => {
  const before = await mockDormService.getTickets();
  await assert.rejects(mockDormService.updateTicket("missing-ticket", { status: "Hoàn thành" }));
  assert.deepEqual(await mockDormService.getTickets(), before);
});

test("failed browser storage does not report a saved invoice or change in-memory data", async () => {
  const before = getMockSnapshot();
  const invoice = before.invoices.find((item) => item.status === "Nợ");
  assert.ok(invoice);
  const existing = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { setItem: () => { throw new Error("storage full"); } },
  });
  try {
    await assert.rejects(mockDormService.confirmPayment(invoice.id, "demo-manager-staff"), /storage full/);
    assert.deepEqual(getMockSnapshot(), before);
  } finally {
    if (existing) Object.defineProperty(globalThis, "localStorage", existing);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
