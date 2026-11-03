import test from "node:test";
import assert from "node:assert/strict";
import { navGroups, getRouteByRole } from "../routes/routes.ts";

test("Routes module defines navigation groups for Admin", () => {
  assert.ok(navGroups.length >= 3, "Must define at least 3 nav groups");
  assert.equal(getRouteByRole("manager"), "Bảng điều khiển");
  assert.equal(getRouteByRole("student"), "portal");
  assert.equal(getRouteByRole("technician"), "tasks");
});
