import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService.ts";

test("mockDormService provides seed data and handles ticket creation", async () => {
  const rooms = await mockDormService.getRooms();
  assert.ok(rooms.length > 0, "mock rooms should not be empty");

  const newTicket = await mockDormService.createTicket({
    title: "Sửa vòi sen P.102",
    room: "P.102",
    category: "Điện nước",
    priority: "Bình thường",
    status: "Mới giao",
    reporter: "Nguyễn Văn A",
    phone: "0900 123 456",
    createdAt: "Vừa xong",
    deadline: "Trong ngày",
    hasPhoto: false,
    description: "Vòi sen bị rỉ nước",
  });
  assert.ok(newTicket.id.startsWith("SC-"));
});

test("mockDormService handles room CRUD and bed status update", async () => {
  const initialRooms = await mockDormService.getRooms();
  const created = await mockDormService.createRoom({
    id: "rm-mock-test",
    code: "P.999",
    floor: 9,
    type: "4 giường",
    gender: "Nam",
    total: 4,
    basePrice: 1500000,
    amenities: [],
  });
  assert.equal(created.code, "P.999");

  const afterCreate = await mockDormService.getRooms();
  assert.equal(afterCreate.length, initialRooms.length + 1);

  const updated = await mockDormService.updateRoom(created.id, {
    ...created,
    basePrice: 1700000,
  });
  assert.equal(updated.basePrice, 1700000);

  await mockDormService.updateBedStatus("G01", "MAINTENANCE");

  await mockDormService.deleteRoom(created.id);
  const afterDelete = await mockDormService.getRooms();
  const deletedRoom = afterDelete.find((r) => r.id === created.id);
  assert.ok(deletedRoom?.deletedAt);
});
