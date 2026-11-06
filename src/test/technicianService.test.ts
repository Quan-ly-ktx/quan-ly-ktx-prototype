import test from "node:test";
import assert from "node:assert/strict";
import {
  technicianService,
  mockTechnicianService,
  apiTechnicianService,
} from "../services/technicianService.ts";
import type {
  TechnicianResponse,
  CreateTechnicianRequest,
  SingleResponse,
} from "../types/api/endpoints.ts";

test("technicianService defines CRUD methods for staff accounts", () => {
  assert.equal(typeof technicianService.getTechnicians, "function");
  assert.equal(typeof technicianService.createTechnician, "function");
  assert.equal(typeof technicianService.getTechnician, "function");
  assert.equal(typeof technicianService.updateTechnician, "function");
  assert.equal(typeof technicianService.toggleStatus, "function");
});

test("mockTechnicianService performs CRUD and status toggle in memory", async () => {
  // 1. Get initial technicians
  const initial = await mockTechnicianService.getTechnicians();
  const list = Array.isArray(initial) ? initial : initial.items;
  assert.ok(list.length >= 2);
  const first = list[0];
  assert.ok(first.fullName);

  // 2. Create technician
  const newReq: CreateTechnicianRequest = {
    fullName: "Nguyễn Văn Test",
    email: "test.nv@ktxhub.vn",
    phone: "0999888777",
    password: "password123",
  };
  const created = await mockTechnicianService.createTechnician(newReq);
  assert.equal(created.fullName, newReq.fullName);
  assert.equal(created.email, newReq.email);
  assert.equal(created.phone, newReq.phone);
  assert.equal(created.active, true);

  // 3. Get created technician
  const retrieved = await mockTechnicianService.getTechnician(created.id);
  assert.equal(retrieved.id, created.id);
  assert.equal(retrieved.fullName, newReq.fullName);

  // 4. Update technician
  const updated = await mockTechnicianService.updateTechnician(created.id, {
    fullName: "Nguyễn Văn Test Updated",
    email: "test.updated@ktxhub.vn",
    phone: "0999888666",
  });
  assert.equal(updated.fullName, "Nguyễn Văn Test Updated");
  assert.equal(updated.email, "test.updated@ktxhub.vn");

  // 5. Toggle status (Lock)
  const locked = await mockTechnicianService.toggleStatus(created.id, false);
  assert.equal(locked.active, false);
  assert.equal(locked.userStatus, "INACTIVE");

  // 6. Toggle status (Unlock)
  const unlocked = await mockTechnicianService.toggleStatus(created.id, true);
  assert.equal(unlocked.active, true);
  assert.equal(unlocked.userStatus, "ACTIVE");

  // 7. Filter & Search
  const filteredActive = await mockTechnicianService.getTechnicians({
    active: true,
  });
  const activeList = Array.isArray(filteredActive)
    ? filteredActive
    : filteredActive.items;
  assert.ok(activeList.every((t) => t.active));

  const searched = await mockTechnicianService.getTechnicians({
    search: "Test Updated",
  });
  const searchList = Array.isArray(searched) ? searched : searched.items;
  assert.ok(searchList.some((t) => t.id === created.id));
});

test("apiTechnicianService calls correct endpoints and payloads", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const calls: { url: string; method: string; body?: unknown }[] = [];

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    calls.push({ url, method, body });

    if (url.includes("/users/technicians") && method === "GET") {
      const resp: SingleResponse<TechnicianResponse[]> = {
        httpStatus: 200,
        message: "Success",
        data: [
          {
            id: "tech-api-1",
            fullName: "KTV API 1",
            email: "api1@ktxhub.vn",
            phone: "0901111222",
            active: true,
            userStatus: "ACTIVE",
          },
        ],
      };
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/users/technicians") && method === "POST") {
      const resp: SingleResponse<TechnicianResponse> = {
        httpStatus: 201,
        message: "Created",
        data: {
          id: "tech-api-2",
          fullName: (body as CreateTechnicianRequest).fullName,
          email: (body as CreateTechnicianRequest).email,
          phone: (body as CreateTechnicianRequest).phone,
          active: true,
          userStatus: "ACTIVE",
        },
      };
      return new Response(JSON.stringify(resp), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/status") && method === "PATCH") {
      const resp: SingleResponse<TechnicianResponse> = {
        httpStatus: 200,
        message: "Status updated",
        data: {
          id: "tech-api-1",
          fullName: "KTV API 1",
          email: "api1@ktxhub.vn",
          phone: "0901111222",
          active: (body as { active: boolean }).active,
          userStatus: (body as { active: boolean }).active ? "ACTIVE" : "INACTIVE",
        },
      };
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/users/technicians/") && method === "PUT") {
      const resp: SingleResponse<TechnicianResponse> = {
        httpStatus: 200,
        message: "Updated",
        data: {
          id: "tech-api-1",
          fullName: "Updated Name",
          email: "api1@ktxhub.vn",
          phone: "0901111222",
          active: true,
        },
      };
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ httpStatus: 200, message: "OK", data: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  // Test getTechnicians
  const list = await apiTechnicianService.getTechnicians({ active: true, search: "ktv" });
  assert.ok(calls.some((c) => c.url.includes("/users/technicians") && c.url.includes("active=true") && c.method === "GET"));
  const techItems = Array.isArray(list) ? list : list.items;
  assert.equal(techItems[0].fullName, "KTV API 1");

  // Test createTechnician
  const created = await apiTechnicianService.createTechnician({
    fullName: "KTV Mới",
    email: "ktvmoi@ktxhub.vn",
    phone: "0933444555",
    password: "secretpassword",
  });
  assert.ok(calls.some((c) => c.url.includes("/users/technicians") && c.method === "POST"));
  assert.equal(created.fullName, "KTV Mới");

  // Test toggleStatus
  const toggled = await apiTechnicianService.toggleStatus("tech-api-1", false);
  assert.ok(calls.some((c) => c.url.includes("/users/technicians/tech-api-1/status") && c.method === "PATCH"));
  assert.equal(toggled.active, false);

  // Test updateTechnician
  const updated = await apiTechnicianService.updateTechnician("tech-api-1", {
    fullName: "Updated Name",
    email: "api1@ktxhub.vn",
    phone: "0901111222",
  });
  assert.ok(calls.some((c) => c.url.includes("/users/technicians/tech-api-1") && c.method === "PUT"));
  assert.equal(updated.fullName, "Updated Name");
});
