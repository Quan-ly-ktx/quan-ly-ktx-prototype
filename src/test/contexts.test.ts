import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService.ts";

test("DormDataContext updates state immutably", async () => {
  const initial = await mockDormService.getTickets();
  const newTicket = { ...initial[0], id: "TCK-IMMUTABLE", title: "New" };
  const updated = [newTicket, ...initial];
  assert.notEqual(updated, initial);
  assert.equal(updated.length, initial.length + 1);
});
