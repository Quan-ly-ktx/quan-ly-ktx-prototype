import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getMockSnapshot } from "../services/mock/mockStore.ts";

test("Task 5: Invoice lifecycle - submit proof -> reject -> resubmit -> confirm online", async () => {
  const state = getMockSnapshot();
  const activeInvoice = state.invoices.find((inv) => inv.status === "Nợ" && inv.tenantId === "NT-0187")!;
  assert.ok(activeInvoice);

  // 1. Tenant submits proof: Nợ -> Chờ xác nhận
  const proofData = { fileName: "bill_transfer.png", submittedAt: "2026-11-09T10:00:00Z" };
  const pending = await mockDormService.submitInvoiceProof(activeInvoice.id, activeInvoice.tenantId!, proofData);
  assert.equal(pending.status, "Chờ xác nhận");
  assert.equal(pending.proof?.fileName, "bill_transfer.png");
  assert.equal(pending.payment, undefined);

  // 2. Manager rejects proof: Chờ xác nhận -> Nợ
  const rejected = await mockDormService.rejectInvoiceProof(activeInvoice.id);
  assert.equal(rejected.status, "Nợ");
  assert.equal(rejected.proof, undefined);

  // 3. Tenant resubmits proof
  const resubmitted = await mockDormService.submitInvoiceProof(activeInvoice.id, activeInvoice.tenantId!, proofData);
  assert.equal(resubmitted.status, "Chờ xác nhận");

  // 4. Manager confirms proof: Chờ xác nhận -> Đã thu
  const paid = await mockDormService.confirmInvoiceProof(activeInvoice.id, "demo-manager-staff");
  assert.equal(paid.status, "Đã thu");
  assert.equal(paid.payment?.method, "Trực tuyến");
  assert.equal(paid.payment?.confirmedByStaffId, "demo-manager-staff");
  assert.equal(paid.payment?.amount, activeInvoice.amount);

  // Cannot confirm again
  await assert.rejects(
    mockDormService.confirmInvoiceProof(activeInvoice.id, "demo-manager-staff"),
    /Chuyển trạng thái thanh toán không hợp lệ/
  );

  await mockDormService.resetMockData();
});

test("Task 5: Cash confirmation directly transitions Nợ -> Đã thu and creates single receipt", async () => {
  const state = getMockSnapshot();
  const activeInvoice = state.invoices.find((inv) => inv.status === "Nợ")!;
  assert.ok(activeInvoice);

  const paid = await mockDormService.confirmPayment(activeInvoice.id, "demo-manager-staff");
  assert.equal(paid.status, "Đã thu");
  assert.equal(paid.payment?.method, "Tiền mặt");
  assert.equal(paid.payment?.confirmedByStaffId, "demo-manager-staff");
  assert.equal(paid.payment?.amount, activeInvoice.amount);

  // Re-confirming cash is rejected
  await assert.rejects(
    mockDormService.confirmPayment(activeInvoice.id, "demo-manager-staff"),
    /Chỉ có thể xác nhận tiền mặt cho hóa đơn đang nợ/
  );

  await mockDormService.resetMockData();
});

test("Task 5: Checked out tenant can submit proof for their unpaid invoice", async () => {
  const state = getMockSnapshot();
  // Former tenant: id "f5000000-0000-4000-8000-000000000001", has unpaid invoice "e0000000-0000-4000-8000-000000000001"
  const formerInvoice = state.invoices.find((inv) => inv.id === "e0000000-0000-4000-8000-000000000001")!;
  assert.ok(formerInvoice);
  assert.equal(formerInvoice.status, "Nợ");

  const proof = { fileName: "checkout_debt_paid.png", submittedAt: "2026-11-09T11:00:00Z" };
  const updated = await mockDormService.submitInvoiceProof(formerInvoice.id, formerInvoice.tenantId!, proof);
  assert.equal(updated.status, "Chờ xác nhận");
  assert.equal(updated.proof?.fileName, "checkout_debt_paid.png");

  // Another tenant cannot submit proof for this invoice
  await assert.rejects(
    mockDormService.submitInvoiceProof(formerInvoice.id, "NT-0187", proof),
    /Hóa đơn không thuộc người thuê/
  );

  await mockDormService.resetMockData();
});
