export * from "./pages/admin/index.ts";
export { QrCode } from "./components/common/QrCode.tsx";
export { initialInvoices as invoices } from "./data.ts";

// Required for design-contract.test.ts
export const card = "rounded-sm border border-slate-200 bg-white shadow-xs";
