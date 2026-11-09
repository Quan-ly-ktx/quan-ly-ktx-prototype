import type { Invoice } from "../types/invoice.ts";
import type { ContractRecord } from "../types/tenant.ts";

export function invoicesForTenant(invoices: Invoice[], tenantId: string | undefined, contracts: ContractRecord[]): Invoice[] {
  if (!tenantId) return [];
  const ownedContracts = new Set(contracts.filter((contract) => contract.tenantId === tenantId).map((contract) => contract.id));
  return invoices.filter((invoice) => ownedContracts.has(invoice.contractId));
}
