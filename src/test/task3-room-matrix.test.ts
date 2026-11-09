import assert from "node:assert/strict";
import test from "node:test";
import { mockDormService } from "../services/mock/mockDormService.ts";
import { getRoomOccupancy, canDeleteRoom, canChangeGenderPolicy, canToggleBedMaintenance } from "../utils/roomCalculations.ts";
import type { RoomRecord } from "../types/room.ts";

test("Task 3: Room with active contracts cannot be deleted or archived", async () => {
  const rooms = await mockDormService.getRooms();
  const contracts = await mockDormService.getContracts();
  const occupiedContract = contracts.find((c) => c.status !== "Đã thanh lý")!;
  assert.ok(occupiedContract);

  // Invariant helper check
  assert.equal(canDeleteRoom(occupiedContract.roomId, contracts), false);
  assert.equal(canChangeGenderPolicy(occupiedContract.roomId, contracts), false);

  // Mock service delete check
  await assert.rejects(
    mockDormService.deleteRoom(occupiedContract.roomId),
    /Phòng còn hợp đồng hiệu lực/
  );
});

test("Task 3: Occupancy calculation includes MAINTENANCE beds in denominator but excludes from available", async () => {
  const rooms = await mockDormService.getRooms();
  const tenants = await mockDormService.getTenants();
  const contracts = await mockDormService.getContracts();

  // Find RM-101 which has G01 as MAINTENANCE
  const room101 = rooms.find((r) => r.id === "RM-101")!;
  assert.ok(room101);
  assert.equal(room101.bedOverrides?.G01?.status, "MAINTENANCE");

  const occ = getRoomOccupancy(room101, tenants, contracts);
  assert.equal(occ.total, room101.total);

  // Available beds count must NOT include MAINTENANCE beds
  const maintenanceCount = occ.beds.filter((b) => b.status === "MAINTENANCE").length;
  assert.ok(maintenanceCount >= 1);
  assert.equal(occ.available, occ.total - occ.occupied - maintenanceCount);

  // Maintenance bed cannot be toggled if occupied
  for (const bed of occ.beds) {
    if (bed.status === "OCCUPIED") {
      const overrideId: string | undefined = room101.bedOverrides?.[bed.bedCode]?.id;
      if (overrideId) {
        assert.equal(canToggleBedMaintenance(room101.id, overrideId, contracts), false);
      }
    }
  }
});

test("Task 3: Empty room can be deleted/archived and retains bed IDs and structure", async () => {
  const before = await mockDormService.getRooms();
  const newRoom: RoomRecord = {
    id: "temp-room-archive-test",
    code: "P.999TEST",
    floor: 9,
    type: "4 giường",
    gender: "Nữ",
    total: 4,
    basePrice: 1200000,
    amenities: [{ name: "Quạt trần", quantity: 1 }],
  };

  try {
    const created = await mockDormService.createRoom(newRoom);
    assert.ok(created.id);
    assert.equal(Object.keys(created.bedOverrides ?? {}).length, 4);

    // Delete empty room
    await mockDormService.deleteRoom(created.id);
    const roomsAfter = await mockDormService.getRooms();
    const archived = roomsAfter.find((r) => r.id === created.id);
    assert.ok(archived?.deletedAt);

    // Bed overrides and structure remain intact for historical preservation
    assert.equal(Object.keys(archived?.bedOverrides ?? {}).length, 4);
  } finally {
    await mockDormService.saveRooms(before);
  }
});
