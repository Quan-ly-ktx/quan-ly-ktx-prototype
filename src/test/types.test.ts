import test from "node:test";
import assert from "node:assert/strict";
import * as Types from "../types/index.ts";
import type { Role, RoomRecord, TenantRecord, Invoice, Ticket, Priority, IconName } from "../types/index.ts";

test("src/types exports all core domain interfaces and constants", () => {
  assert.ok(Types !== undefined, "Types module must be resolvable");
  assert.ok(Array.isArray(Types.ROLES), "ROLES must be exported as an array");
  assert.ok(Array.isArray(Types.PRIORITIES), "PRIORITIES must be exported as an array");
  const role: Role = "student";
  const priority: Priority = "Khẩn cấp";
  assert.equal(role, "student");
  assert.equal(priority, "Khẩn cấp");
});
