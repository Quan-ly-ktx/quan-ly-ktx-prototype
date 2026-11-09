import test from "node:test";
import assert from "node:assert/strict";
import { apiDormService } from "../services/api/apiDormService.ts";
import type {
  SingleResponse,
  RoomDetailResponse,
} from "../types/api/endpoints.ts";
import type { RoomRecord } from "../types/room.ts";

test("apiDormService has methods for room matrix and bed status", () => {
  assert.equal(typeof apiDormService.getRooms, "function");
  assert.equal(typeof apiDormService.createRoom, "function");
  assert.equal(typeof apiDormService.updateRoom, "function");
  assert.equal(typeof apiDormService.deleteRoom, "function");
  assert.equal(typeof apiDormService.updateBedStatus, "function");
});

test("apiDormService calls GET /admin/rooms/matrix and maps response via roomAdapter", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const mockBackendRooms: RoomDetailResponse[] = [
    {
      id: "rm-101",
      roomNumber: "P.101",
      floor: 1,
      roomType: "FOUR_BEDS",
      genderPolicy: "MALE",
      totalBeds: 4,
      occupiedBeds: 1,
      basePrice: 1500000,
      amenities: [{ amenityId: "a1", code: "AC", name: "Điều hòa", category: "Appliance", quantity: 1 }],
      beds: [
        { id: "b1", bedCode: "G01", slotKey: "P.101-G01", price: 1500000, status: "OCCUPIED" },
        { id: "b2", bedCode: "G02", slotKey: "P.101-G02", price: 1600000, status: "MAINTENANCE" },
      ],
    },
  ];

  const responseBody: SingleResponse<RoomDetailResponse[]> = {
    httpStatus: 200,
    message: "Success",
    data: mockBackendRooms,
  };

  let calledUrl = "";
  let calledMethod = "";

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    calledUrl = input.toString();
    calledMethod = init?.method || "GET";
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const rooms = await apiDormService.getRooms();
  assert.ok(calledUrl.includes("/admin/rooms/matrix"));
  assert.equal(calledMethod, "GET");
  assert.equal(rooms.length, 1);
  assert.equal(rooms[0].code, "P.101");
  assert.equal(rooms[0].type, "4 giường");
  assert.equal(rooms[0].gender, "Nam");
  assert.equal(rooms[0].amenities[0].name, "Điều hòa");
  assert.equal(rooms[0].bedOverrides?.["G02"]?.status, "MAINTENANCE");
  assert.equal(rooms[0].bedOverrides?.["G02"]?.roomId, "rm-101");
});

test("apiDormService createRoom sends POST to /admin/rooms with mapped DTO", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let requestBody: unknown = null;
  let requestMethod = "";
  let requestUrl = "";

  const backendReturn: RoomDetailResponse = {
    id: "rm-new-001",
    roomNumber: "P.401",
    floor: 4,
    roomType: "SIX_BEDS",
    genderPolicy: "FEMALE",
    totalBeds: 6,
    occupiedBeds: 0,
    basePrice: 1800000,
    amenities: [],
    beds: [],
  };

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = input.toString();
    requestMethod = init?.method || "POST";
    if (init?.body && typeof init.body === "string") {
      requestBody = JSON.parse(init.body);
    }
    return new Response(
      JSON.stringify({ httpStatus: 201, message: "Created", data: backendReturn }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  };

  const frontendRoom: RoomRecord = {
    id: "temp-id",
    code: "P.401",
    floor: 4,
    type: "6 giường",
    gender: "Nữ",
    total: 6,
    basePrice: 1800000,
    amenities: [],
  };

  const result = await apiDormService.createRoom(frontendRoom);
  assert.ok(requestUrl.includes("/admin/rooms"));
  assert.equal(requestMethod, "POST");
  assert.deepEqual(requestBody, {
    roomNumber: "P.401",
    floor: 4,
    roomType: "SIX_BEDS",
    genderPolicy: "FEMALE",
    basePrice: 1800000,
  });
  assert.equal(result.id, "rm-new-001");
  assert.equal(result.code, "P.401");
  assert.equal(result.type, "6 giường");
  assert.equal(result.gender, "Nữ");
});

test("apiDormService updateRoom sends PUT to /admin/rooms/{id}", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let requestBody: unknown = null;
  let requestMethod = "";
  let requestUrl = "";

  const backendReturn: RoomDetailResponse = {
    id: "rm-101",
    roomNumber: "P.101",
    floor: 1,
    roomType: "FOUR_BEDS",
    genderPolicy: "FEMALE",
    totalBeds: 4,
    occupiedBeds: 0,
    basePrice: 1650000,
    amenities: [],
    beds: [],
  };

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = input.toString();
    requestMethod = init?.method || "PUT";
    if (init?.body && typeof init.body === "string") {
      requestBody = JSON.parse(init.body);
    }
    return new Response(
      JSON.stringify({ httpStatus: 200, message: "Updated", data: backendReturn }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  const roomToUpdate: RoomRecord = {
    id: "rm-101",
    code: "P.101",
    floor: 1,
    type: "4 giường",
    gender: "Nữ",
    total: 4,
    basePrice: 1650000,
    amenities: [],
  };

  const result = await apiDormService.updateRoom("rm-101", roomToUpdate);
  assert.ok(requestUrl.includes("/admin/rooms/rm-101"));
  assert.equal(requestMethod, "PUT");
  assert.deepEqual(requestBody, {
    genderPolicy: "FEMALE",
    basePrice: 1650000,
  });
  assert.equal(result.gender, "Nữ");
  assert.equal(result.basePrice, 1650000);
});

test("apiDormService deleteRoom sends DELETE to /admin/rooms/{id}", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let requestMethod = "";
  let requestUrl = "";

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = input.toString();
    requestMethod = init?.method || "DELETE";
    return new Response(null, { status: 204 });
  };

  await apiDormService.deleteRoom("rm-del-99");
  assert.ok(requestUrl.includes("/admin/rooms/rm-del-99"));
  assert.equal(requestMethod, "DELETE");
});

test("apiDormService updateBedStatus sends PATCH to /admin/beds/{id}/status", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let requestBody: unknown = null;
  let requestMethod = "";
  let requestUrl = "";

  globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = input.toString();
    requestMethod = init?.method || "PATCH";
    if (init?.body && typeof init.body === "string") {
      requestBody = JSON.parse(init.body);
    }
    return new Response(
      JSON.stringify({ httpStatus: 200, message: "Status updated" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  await apiDormService.updateBedStatus("bed-456", "MAINTENANCE");
  assert.ok(requestUrl.includes("/admin/beds/bed-456/status"));
  assert.equal(requestMethod, "PATCH");
  assert.deepEqual(requestBody, {
    status: "MAINTENANCE",
  });
});
