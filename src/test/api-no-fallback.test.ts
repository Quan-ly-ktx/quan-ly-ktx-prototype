import assert from "node:assert/strict";
import test from "node:test";
import { apiDormService } from "../services/api/apiDormService.ts";

test("API mode: rejects network failure across modules rather than returning demo data", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => { throw new Error("network unavailable"); };

  await assert.rejects(apiDormService.getRooms(), /network unavailable/);
  await assert.rejects(apiDormService.getTenants(), /network unavailable/);
  await assert.rejects(apiDormService.getInvoices(), /network unavailable/);
  await assert.rejects(apiDormService.getTickets(), /network unavailable/);
});

test("API mode: unsupported endpoints throw descriptive errors without mock fallback", async () => {
  await assert.rejects(apiDormService.getContracts(), /API hợp đồng chưa được thống nhất/);
  await assert.rejects(apiDormService.getVehicles(), /API phương tiện chưa được thống nhất/);
  await assert.rejects(apiDormService.getExpenses(), /API chi phí chưa được thống nhất/);
  await assert.rejects(apiDormService.resetMockData(), /Không thể reset dữ liệu demo trong chế độ API/);
});
