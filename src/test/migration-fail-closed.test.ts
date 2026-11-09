import assert from "node:assert/strict";
import test from "node:test";

test("migration fails closed when legacy ticket has assignee without staff ID", async () => {
  const store = new Map<string, string>();
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => { store.set(key, val); },
      removeItem: (key: string) => { store.delete(key); },
    },
  });

  const legacyKey = "dorm_mock_snapshot_v2";
  const legacyData = {
    tickets: [
      {
        id: "SC-9999",
        room: "P.101",
        title: "Test",
        category: "Điện",
        priority: "Bình thường",
        status: "Đang xử lý",
        reporterTenantId: "NT-0187",
        assignee: "Nguyễn Văn A", // has name but no assigneeStaffId
      },
    ],
  };
  store.set(legacyKey, JSON.stringify(legacyData));

  try {
    // Dynamic import cache-bust is required to test fresh load() invocation against isolated localStorage
    const { getMockSnapshot } = await import(`../services/mock/mockStore.ts?t=${Date.now()}`);
    assert.throws(
      () => getMockSnapshot(),
      /Không thể chuyển người xử lý phiếu SC-9999 khi thiếu ID/
    );
    // Crucial check: original legacy data was preserved and NOT overwritten
    assert.equal(store.get(legacyKey), JSON.stringify(legacyData));
  } finally {
    if (originalDescriptor) Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("migration fails closed when duplicate accounts have different data", async () => {
  const store = new Map<string, string>();
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => { store.set(key, val); },
      removeItem: (key: string) => { store.delete(key); },
    },
  });

  const legacyKey = "dorm_demo_credentials";
  const duplicateAccounts = [
    { id: "demo-manager", identifier: "manager@gmail.com", role: "manager", name: "Quản lý 1", password: "123" },
  ];
  const snapshotData = {
    accounts: [
      { id: "demo-manager", identifier: "manager@gmail.com", role: "manager", name: "Quản lý Khác", password: "456" },
    ],
  };
  store.set("dorm_mock_snapshot_v2", JSON.stringify(snapshotData));
  store.set(legacyKey, JSON.stringify(duplicateAccounts));
  try {
    // Dynamic import cache-bust is required to test fresh load() invocation against isolated localStorage
    const { getMockSnapshot } = await import(`../services/mock/mockStore.ts?t=${Date.now() + 1}`);
    assert.throws(
      () => getMockSnapshot(),
      /dữ liệu trùng ID nhưng khác nhau/
    );
    // Legacy keys untouched
    assert.equal(store.get(legacyKey), JSON.stringify(duplicateAccounts));
  } finally {
    if (originalDescriptor) Object.defineProperty(globalThis, "localStorage", originalDescriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
