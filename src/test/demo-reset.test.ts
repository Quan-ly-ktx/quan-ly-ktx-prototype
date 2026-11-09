import assert from "node:assert/strict";
import test from "node:test";

test("reset restores all demo collections together in isolated storage", async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  } });
  try {
    const { getMockSnapshot, updateMockSnapshot } = await import("../services/mock/mockStore.ts");
    const { mockDormService } = await import("../services/mock/mockDormService.ts");
    const initial = getMockSnapshot();
    updateMockSnapshot((state) => ({ ...state, vehicles: [], expenses: [], notifications: [{ id: "test-notification", tenantId: state.tenants[0].id, title: "Test", body: "Test", time: "2026-01-01T00:00:00Z", read: false, type: "general" }] }));
    await mockDormService.resetMockData();
    const restored = getMockSnapshot();
    assert.deepEqual(restored.vehicles, initial.vehicles);
    assert.deepEqual(restored.expenses, initial.expenses);
    assert.deepEqual(restored.notifications, initial.notifications);
    assert.deepEqual(JSON.parse(data.get("dorm_mock_snapshot_v2")!), restored);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
