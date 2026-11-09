import assert from "node:assert/strict";
import test from "node:test";
import { invoicesForTenant } from "../utils/invoiceOwnership.ts";
import type { Invoice } from "../types/invoice.ts";
import type { ContractRecord } from "../types/tenant.ts";

test("invoices are selected by tenant ID rather than by a shared name", () => {
  const invoices: Invoice[] = [
    { id: "one", contractId: "contract-1", billingPeriod: "2026-11-01", tenantId: "tenant-1", tenant: "Nam", room: "P.1", bed: "G01", amount: 1, due: "05/11/2026", status: "Nợ" },
    { id: "two", contractId: "contract-2", billingPeriod: "2026-11-01", tenantId: "tenant-1", tenant: "Nam", room: "P.1", bed: "G02", amount: 2, due: "05/11/2026", status: "Nợ" },
    { id: "unknown", contractId: "contract-3", billingPeriod: "2026-11-01", tenant: "Nam", room: "P.1", bed: "G03", amount: 3, due: "05/11/2026", status: "Nợ" },
  ];
  const contracts: ContractRecord[] = [
    { id: "contract-1", tenantId: "tenant-1", tenantName: "Nam", roomId: "room-1", bedId: "bed-1", room: "P.1", bed: "G01", startDate: "2026-11-01", endDate: "2026-11-30", deposit: 1, monthlyRent: 1, status: "Hiệu lực" },
    { id: "contract-2", tenantId: "tenant-2", tenantName: "Nam", roomId: "room-1", bedId: "bed-2", room: "P.1", bed: "G02", startDate: "2026-11-01", endDate: "2026-11-30", deposit: 2, monthlyRent: 2, status: "Hiệu lực" },
  ];
  assert.deepEqual(invoicesForTenant(invoices, "tenant-1", contracts).map((invoice) => invoice.id), ["one"]);
  assert.deepEqual(invoicesForTenant(invoices, undefined, contracts), []);
});
