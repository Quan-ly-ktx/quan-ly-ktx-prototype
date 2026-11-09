import assert from "node:assert/strict";
import test from "node:test";
import { demoEmailAvailable, addDemoTechnician } from "../services/mock/mockAuth.ts";

test("technician email cannot duplicate a tenant email ignoring case", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  } });
  try {
    assert.equal(demoEmailAvailable(" TENANT@GMAIL.COM "), false);
    assert.throws(() => addDemoTechnician("new-tech", "tenant@gmail.com", "Demo", "Demo1234!"));
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
