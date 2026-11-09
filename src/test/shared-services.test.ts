import assert from "node:assert/strict";
import test from "node:test";

// Install isolated storage before loading the snapshot singleton.
const data = new Map<string, string>();
let failWrites = false;
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failWrites) throw new Error("storage unavailable");
      data.set(key, value);
    },
    removeItem: (key: string) => { data.delete(key); },
  },
});

test("technician account and staff stay in sync across login, update and lock", async () => {
  const { mockTechnicianService } = await import("../services/technicianService.ts");
  const { addDemoTechnician, demoLogin } = await import("../services/mock/mockAuth.ts");
  const email = `shared-${crypto.randomUUID()}@example.invalid`;
  const password = "Demo1234!";
  const created = await mockTechnicianService.createTechnician({ fullName: "Kỹ thuật viên", email, phone: "0900000000", password });
  addDemoTechnician(created.id, email, "Kỹ thuật viên", password);
  const profile = await demoLogin({ identifier: email, password });
  assert.equal(profile.staffId, created.id);
  assert.notEqual(profile.userId, created.id);
  const newEmail = `updated-${crypto.randomUUID()}@example.invalid`;
  await mockTechnicianService.updateTechnician(created.id, { fullName: "Tên mới", email: newEmail, phone: "0900000000" });
  await assert.rejects(demoLogin({ identifier: email, password }));
  assert.equal((await demoLogin({ identifier: newEmail, password })).name, "Tên mới");
  await mockTechnicianService.toggleStatus(created.id, false);
  await assert.rejects(demoLogin({ identifier: newEmail, password }));
});

test("manager login exposes staff identity without making manager a technician", async () => {
  const { demoLogin } = await import("../services/mock/mockAuth.ts");
  const { mockTechnicianService } = await import("../services/technicianService.ts");
  const manager = await demoLogin({ identifier: "manager@gmail.com", password: "Demo1234!" });
  assert.equal(manager.staffId, "demo-manager-staff");
  const result = await mockTechnicianService.getTechnicians();
  const technicians = Array.isArray(result) ? result : result.items;
  assert.ok(!technicians.some((staff) => staff.id === manager.staffId));
  await assert.rejects(mockTechnicianService.getTechnician(manager.staffId!));
  await assert.rejects(mockTechnicianService.toggleStatus(manager.staffId!, false));
});

test("failed storage write leaves technician and account unchanged", async () => {
  const { mockTechnicianService } = await import("../services/technicianService.ts");
  const { getMockSnapshot } = await import("../services/mock/mockStore.ts");
  const before = getMockSnapshot();
  failWrites = true;
  try {
    await assert.rejects(mockTechnicianService.createTechnician({
      fullName: "Không lưu", email: `failure-${crypto.randomUUID()}@example.invalid`, phone: "0900000000", password: "Demo1234!",
    }));
    assert.deepEqual(getMockSnapshot(), before);
  } finally {
    failWrites = false;
  }
});

test("violation and notification commit together and notify subscribers", async () => {
  const { getMockSnapshot } = await import("../services/mock/mockStore.ts");
  const { recordViolation, getIncidentNotifications, subscribeIncidentStore } = await import("../services/mock/incidentStore.ts");
  const tenant = getMockSnapshot().tenants.find((item) => item.status !== "Đã trả phòng");
  assert.ok(tenant);
  let notifications = 0;
  const unsubscribe = subscribeIncidentStore(() => { notifications += 1; });
  try {
    const violation = recordViolation(tenant, { type: "Gây ồn", level: "Nhắc nhở", date: "2026-11-09", note: "" });
    assert.equal(violation.tenantId, tenant.id);
    assert.ok(getIncidentNotifications(tenant.id).some((item) => item.title === "Biên bản vi phạm"));
    await Promise.resolve();
    assert.equal(notifications, 1);
  } finally {
    unsubscribe();
  }
});
