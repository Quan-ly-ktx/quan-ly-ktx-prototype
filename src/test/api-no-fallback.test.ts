import assert from "node:assert/strict";
import test from "node:test";
import { apiDormService } from "../services/api/apiDormService.ts";

test("API room loading rejects a network failure rather than returning demo rooms", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => { throw new Error("network unavailable"); };
  await assert.rejects(apiDormService.getRooms(), /network unavailable/);
});
