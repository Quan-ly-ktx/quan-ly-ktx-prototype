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
