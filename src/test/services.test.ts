import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService.ts";

test("created tickets are visible in the ticket list", async () => {
  const contract = (await mockDormService.getContracts()).find((item) => item.status === "Hiệu lực");
  assert.ok(contract);

  const newTicket = await mockDormService.createTicket({
    reporterTenantId: contract.tenantId,
    roomId: contract.roomId,
    title: "Sửa vòi sen P.102",
    room: "P.102",
    category: "Nước",
    priority: "Bình thường",
    status: "Chưa phân công",
    reporter: contract.tenantName,
    phone: "0900 123 456",
    createdAt: "Vừa xong",
    deadline: "Trong ngày",
    hasPhoto: false,
    description: "Vòi sen bị rỉ nước",
  });
  assert.ok((await mockDormService.getTickets()).some((ticket) => ticket.id === newTicket.id && ticket.title === "Sửa vòi sen P.102"));
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

  const bedId = created.bedOverrides?.G01?.id;
  assert.ok(bedId);
  await mockDormService.updateBedStatus(bedId, "MAINTENANCE");

  await mockDormService.deleteRoom(created.id);
  const afterDelete = await mockDormService.getRooms();
  const deletedRoom = afterDelete.find((r) => r.id === created.id);
  assert.ok(deletedRoom?.deletedAt);
});
