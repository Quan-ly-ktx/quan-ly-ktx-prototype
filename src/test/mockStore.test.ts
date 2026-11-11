import assert from "node:assert/strict";
import test from "node:test";
import { getMockSnapshot, updateMockSnapshot } from "../services/mock/mockStore.ts";
import { mockDormService } from "../services/mock/mockDormService.ts";

test("fixture relationships use IDs and ticket beds belong to their rooms", () => {
  const state = getMockSnapshot();
  for (const tenant of state.tenants) assert.ok(state.accounts.some((account) => account.id === tenant.userId));
  for (const contract of state.contracts) assert.ok(state.rooms.some((room) => room.id === contract.roomId && Object.values(room.bedOverrides ?? {}).some((bed) => bed.id === contract.bedId)));
  for (const invoice of state.invoices) assert.ok(state.contracts.some((contract) => contract.id === invoice.contractId) && invoice.billingPeriod);
  for (const ticket of state.tickets) {
    assert.ok(state.tenants.some((tenant) => tenant.id === ticket.reporterTenantId));
    const room = state.rooms.find((item) => item.id === ticket.roomId);
    assert.ok(room);
    if (ticket.bedId) assert.ok(Object.values(room.bedOverrides ?? {}).some((bed) => bed.id === ticket.bedId));
  }
});

test("a rejected transaction leaves the snapshot unchanged", () => {
  const before = getMockSnapshot();
  assert.throws(() => updateMockSnapshot(() => { throw new Error("failure"); }));
  assert.deepEqual(getMockSnapshot(), before);
});

test("invoice issuance retry never duplicates a contract period", async () => {
  const first = await mockDormService.issueInvoices("2027-03-01", "2027-02-25");
  assert.ok(first.length > 0);
  assert.deepEqual(await mockDormService.issueInvoices("2027-03-01", "2027-02-25"), []);
  const issued = (await mockDormService.getInvoices()).filter((invoice) => invoice.billingPeriod === "2027-03-01");
  assert.equal(new Set(issued.map((invoice) => invoice.contractId)).size, issued.length);
});

test("an invalid ticket bed is rejected without changing the snapshot", async () => {
  const before = getMockSnapshot();
  const ticket = before.tickets[0];
  const otherRoom = before.rooms.find((room) => room.id !== ticket.roomId)!;
  const otherBed = Object.values(otherRoom.bedOverrides!)[0];
  await assert.rejects(mockDormService.updateTicket(ticket.id, { bedId: otherBed.id }));
  assert.deepEqual(getMockSnapshot(), before);
});

test("ticket creation rejects a missing reporter or room without changing the snapshot", async () => {
  const before = getMockSnapshot();
  const source = before.tickets[0];
  const { id: _id, ...ticket } = source;
  const unassigned = { ...ticket, status: "Chưa phân công" as const, assigneeStaffId: undefined };
  await assert.rejects(mockDormService.createTicket({ ...unassigned, reporterTenantId: "" }));
  await assert.rejects(mockDormService.createTicket({ ...unassigned, roomId: "" }));
  assert.deepEqual(getMockSnapshot(), before);
});

test("proof ownership is resolved through the contract and receipt records manager staff ID", async () => {
  const state = getMockSnapshot();
  const invoice = state.invoices.find((item) => item.status === "Nợ")!;
  const contract = state.contracts.find((item) => item.id === invoice.contractId)!;
  const other = state.tenants.find((item) => item.id !== contract.tenantId)!;
  const proof = { fileName: "demo.png", submittedAt: "2026-11-09T00:00:00Z" };
  await assert.rejects(mockDormService.submitInvoiceProof(invoice.id, other.id, proof));
  await mockDormService.submitInvoiceProof(invoice.id, contract.tenantId, proof);
  await assert.rejects(mockDormService.confirmInvoiceProof(invoice.id, "tech-1"));
  const paid = await mockDormService.confirmInvoiceProof(invoice.id, "demo-manager-staff");
  assert.equal(paid.payment?.confirmedByStaffId, "demo-manager-staff");
  await assert.rejects(mockDormService.confirmInvoiceProof(invoice.id, "demo-manager-staff"));
});

test("a storage write failure does not publish the proposed snapshot", () => {
  const before = getMockSnapshot();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { setItem() { throw new Error("quota"); } } });
  try {
    assert.throws(() => updateMockSnapshot((state) => ({ ...state, expenses: [] })), /quota/);
    assert.deepEqual(getMockSnapshot(), before);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("ticket processing requires the currently assigned technician", async () => {
  const state = getMockSnapshot();
  const ticket = state.tickets.find((item) => item.status === "Chưa phân công")!;
  const assigned = await mockDormService.updateTicket(ticket.id, { status: "Mới giao", assigneeStaffId: "tech-1" });
  await assert.rejects(mockDormService.updateTicket(assigned.id, { status: "Đang xử lý" }, "tech-2"));
  const processing = await mockDormService.updateTicket(assigned.id, { status: "Đang xử lý" }, "tech-1");
  assert.equal(processing.status, "Đang xử lý");
});
