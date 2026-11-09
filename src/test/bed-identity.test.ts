import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import type { RoomRecord } from "../types/room.ts";

test("maintenance updates only the selected bed when rooms use the same bed code", async () => {
  const before = await mockDormService.getRooms();
  const base: RoomRecord = { id: "bed-test-a", code: "P.TESTA", floor: 1, type: "4 giường", gender: "Nam", total: 4, basePrice: 1000000, amenities: [] };
  try {
    const first = await mockDormService.createRoom(base);
    const second = await mockDormService.createRoom({ ...base, id: "bed-test-b", code: "P.TESTB" });
    const firstId = first.bedOverrides?.G01?.id;
    const secondId = second.bedOverrides?.G01?.id;
    assert.ok(firstId && secondId && firstId !== secondId);
    await mockDormService.updateBedStatus(secondId, "MAINTENANCE");
    const rooms = await mockDormService.getRooms();
    assert.equal(rooms.find((room) => room.id === first.id)?.bedOverrides?.G01?.status, "AVAILABLE");
    assert.equal(rooms.find((room) => room.id === second.id)?.bedOverrides?.G01?.status, "MAINTENANCE");
    await assert.rejects(mockDormService.updateBedStatus("G01", "AVAILABLE"));
  } finally {
    await mockDormService.saveRooms(before);
  }
});


test("editing a room cannot change floor or capacity", async () => {
  const before = await mockDormService.getRooms();
  const room: RoomRecord = { id: "bed-test-edit", code: "P.EDIT", floor: 1, type: "4 giường", gender: "Nam", total: 4, basePrice: 1000000, amenities: [] };
  try {
    const created = await mockDormService.createRoom(room);
    await assert.rejects(mockDormService.updateRoom(created.id, { ...created, floor: 2 }));
    await assert.rejects(mockDormService.updateRoom(created.id, { ...created, total: 6, type: "6 giường" }));
    assert.equal((await mockDormService.getRooms()).find((item) => item.id === created.id)?.floor, 1);
  } finally {
    await mockDormService.saveRooms(before);
  }
});

test("room code and gender cannot change while a tenant resides there", async () => {
  const before = await mockDormService.getRooms();
  const occupied = before.find((room) => room.code === "P.302");
  assert.ok(occupied);
  await assert.rejects(mockDormService.updateRoom(occupied.id, { ...occupied, code: "P.NEW" }));
  await assert.rejects(mockDormService.updateRoom(occupied.id, { ...occupied, gender: "Nữ" }));
});

test("room creation does not reuse an existing technical ID", async () => {
  const before = await mockDormService.getRooms();
  assert.ok(before[0]);
  try {
    const created = await mockDormService.createRoom({ ...before[0], code: "P.IDTEST" });
    assert.notEqual(created.id, before[0].id);
  } finally {
    await mockDormService.saveRooms(before);
  }
});

test("room codes are unique even when the existing room is archived", async () => {
  const before = await mockDormService.getRooms();
  const existing = before[0];
  assert.ok(existing);
  const archived = { ...existing, deletedAt: "2026-11-01T00:00:00Z" };
  try {
    await mockDormService.saveRooms([archived, ...before.slice(1)]);
    await assert.rejects(mockDormService.createRoom({ ...existing, code: existing.code.toLowerCase() }));
  } finally {
    await mockDormService.saveRooms(before);
  }
});