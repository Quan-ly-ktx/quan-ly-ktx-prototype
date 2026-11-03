import test from "node:test";
import assert from "node:assert/strict";
import {
  toFrontendRoomRecord,
  toFrontendBedRecord,
  toBackendCreateRoomRequest,
  toBackendUpdateRoomRequest,
  toFrontendRoomType,
  toBackendRoomType,
  toFrontendGender,
  toBackendGenderPolicy,
} from "../services/api/adapters/roomAdapter.ts";
import type {
  RoomDetailResponse,
  RoomSummaryResponse,
  BedSlotResponse,
} from "../types/api/endpoints.ts";
import type { RoomRecord } from "../types/room.ts";

test("roomAdapter: enum mappings between backend and frontend", () => {
  assert.equal(toFrontendRoomType("FOUR_BEDS"), "4 giường");
  assert.equal(toFrontendRoomType("SIX_BEDS"), "6 giường");
  assert.equal(toFrontendRoomType("EIGHT_BEDS"), "8 giường");

  assert.equal(toBackendRoomType("4 giường"), "FOUR_BEDS");
  assert.equal(toBackendRoomType("6 giường"), "SIX_BEDS");
  assert.equal(toBackendRoomType("8 giường"), "EIGHT_BEDS");

  assert.equal(toFrontendGender("MALE"), "Nam");
  assert.equal(toFrontendGender("FEMALE"), "Nữ");

  assert.equal(toBackendGenderPolicy("Nam"), "MALE");
  assert.equal(toBackendGenderPolicy("Nữ"), "FEMALE");
});

test("roomAdapter converts BedSlotResponse to BedRecord correctly", () => {
  const bedSlot: BedSlotResponse = {
    id: "b-01",
    bedCode: "G01",
    slotKey: "P.101-G01",
    price: 1500000,
    status: "MAINTENANCE",
  };

  const bed = toFrontendBedRecord(bedSlot);
  assert.equal(bed.bedCode, "G01");
  assert.equal(bed.slotKey, "P.101-G01");
  assert.equal(bed.price, 1500000);
  assert.equal(bed.status, "MAINTENANCE");
});

test("roomAdapter converts RoomDetailResponse to RoomRecord with beds and bedOverrides", () => {
  const detail: RoomDetailResponse = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    roomNumber: "P.101",
    floor: 1,
    roomType: "FOUR_BEDS",
    genderPolicy: "MALE",
    totalBeds: 4,
    occupiedBeds: 1,
    basePrice: 1500000,
    amenities: [
      {
        amenityId: "a1",
        code: "AC",
        name: "Máy lạnh",
        category: "Appliance",
        quantity: 1,
      },
    ],
    beds: [
      {
        id: "b1",
        bedCode: "G01",
        slotKey: "P.101-G01",
        price: 1500000,
        status: "OCCUPIED",
        occupant: {
          tenantId: "t-1",
          fullName: "Nguyễn Văn A",
          phone: "0901234567",
          contractEndDate: "2026-12-31",
        },
      },
      {
        id: "b2",
        bedCode: "G02",
        slotKey: "P.101-G02",
        price: 1600000,
        status: "MAINTENANCE",
      },
      {
        id: "b3",
        bedCode: "G03",
        slotKey: "P.101-G03",
        price: 1500000,
        status: "AVAILABLE",
      },
      {
        id: "b4",
        bedCode: "G04",
        slotKey: "P.101-G04",
        price: 1500000,
        status: "AVAILABLE",
      },
    ],
  };

  const room = toFrontendRoomRecord(detail);
  assert.equal(room.id, "f47ac10b-58cc-4372-a567-0e02b2c3d479");
  assert.equal(room.code, "P.101");
  assert.equal(room.floor, 1);
  assert.equal(room.type, "4 giường");
  assert.equal(room.gender, "Nam");
  assert.equal(room.total, 4);
  assert.equal(room.basePrice, 1500000);
  assert.equal(room.amenities.length, 1);
  assert.equal(room.amenities[0].name, "Máy lạnh");
  assert.equal(room.amenities[0].quantity, 1);

  // bedOverrides: G02 has MAINTENANCE and price 1600000
  assert.ok(room.bedOverrides);
  assert.deepEqual(room.bedOverrides["G02"], {
    status: "MAINTENANCE",
    price: 1600000,
  });
  // G01 occupied is handled by tenant records, but if overridden or status present
  assert.equal(room.bedOverrides["G01"]?.status, "OCCUPIED");
});

test("roomAdapter converts RoomSummaryResponse to RoomRecord", () => {
  const summary: RoomSummaryResponse = {
    id: "r-202",
    roomNumber: "P.202",
    floor: 2,
    roomType: "SIX_BEDS",
    genderPolicy: "FEMALE",
    totalBeds: 6,
    occupiedBeds: 0,
    basePrice: 1800000,
    amenities: [
      {
        amenityId: "am-1",
        code: "FRIDGE",
        name: "Tủ lạnh",
        category: "Appliance",
        quantity: 1,
      },
    ],
  };

  const room = toFrontendRoomRecord(summary);
  assert.equal(room.id, "r-202");
  assert.equal(room.code, "P.202");
  assert.equal(room.floor, 2);
  assert.equal(room.type, "6 giường");
  assert.equal(room.gender, "Nữ");
  assert.equal(room.total, 6);

  assert.equal(room.basePrice, 1800000);
  assert.equal(room.amenities.length, 1);
  assert.equal(room.amenities[0].name, "Tủ lạnh");
  assert.equal(room.amenities[0].quantity, 1);
});

test("roomAdapter: handles fallback defaults for unknown enums safely", () => {
  // @ts-expect-error testing fallback for unexpected enum string
  assert.equal(toFrontendRoomType("UNKNOWN"), "4 giường");
  // @ts-expect-error testing fallback for unexpected enum string
  assert.equal(toBackendRoomType("Unknown"), "FOUR_BEDS");
  // @ts-expect-error testing fallback for unexpected enum string
  assert.equal(toFrontendGender("OTHER"), "Nam");
  // @ts-expect-error testing fallback for unexpected enum string
  assert.equal(toBackendGenderPolicy("Khác"), "MALE");
});

test("roomAdapter: toFrontendRoomRecord handles room without beds or amenities gracefully", () => {
  const minimal: RoomDetailResponse = {
    id: "r-min",
    roomNumber: "P.999",
    floor: 9,
    roomType: "FOUR_BEDS",
    genderPolicy: "MALE",
    totalBeds: 4,
    occupiedBeds: 0,
    basePrice: 1000000,
    // @ts-expect-error test optional or null amenities
    amenities: null,
    // @ts-expect-error test optional or null beds
    beds: null,
  };

  const record = toFrontendRoomRecord(minimal);
  assert.equal(record.code, "P.999");
  assert.deepEqual(record.amenities, []);
  assert.equal(record.bedOverrides, undefined);
});

test("roomAdapter converts RoomRecord to CreateRoomRequest and UpdateRoomRequest", () => {
  const frontendRoom: RoomRecord = {
    id: "r-101",
    code: "P.101",
    floor: 1,
    type: "8 giường",
    gender: "Nữ",
    total: 8,
    basePrice: 1200000,
    amenities: [
      { name: "Điều hòa", quantity: 2 },
      { name: "Quạt", quantity: 4 },
    ],
  };

  const createReq = toBackendCreateRoomRequest(frontendRoom);
  assert.equal(createReq.roomNumber, "P.101");
  assert.equal(createReq.floor, 1);
  assert.equal(createReq.roomType, "EIGHT_BEDS");
  assert.equal(createReq.genderPolicy, "FEMALE");
  assert.equal(createReq.basePrice, 1200000);

  const updateReq = toBackendUpdateRoomRequest(frontendRoom);
  assert.equal(updateReq.genderPolicy, "FEMALE");
  assert.equal(updateReq.basePrice, 1200000);
});
