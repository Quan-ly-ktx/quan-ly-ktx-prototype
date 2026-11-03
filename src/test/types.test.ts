import test from "node:test";
import assert from "node:assert/strict";
import * as Types from "../types/index.ts";
import type {
  Role,
  RoomRecord,
  TenantRecord,
  Invoice,
  Ticket,
  Priority,
  IconName,
  SingleResponse,
  PageResponse,
  DetailedErrorResponse,
  SuccessResponse,
  RoomDetailResponse,
  RoomSummaryResponse,
  BedSlotResponse,
  OccupantSummaryResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  UpdateBedStatusRequest,
  AuthResponse,
  UserProfileResponse,
  TechnicianResponse,
  CreateTechnicianRequest,
  UpdateTechnicianRequest,
  UpdateTechnicianStatusRequest,
} from "../types/index.ts";
import {
  assertDtoExports,
} from "../types/api/endpoints.ts";

test("src/types exports all core domain interfaces and constants", () => {
  assert.ok(Types !== undefined, "Types module must be resolvable");
  assert.ok(Array.isArray(Types.ROLES), "ROLES must be exported as an array");
  assert.ok(Array.isArray(Types.PRIORITIES), "PRIORITIES must be exported as an array");
  const role: Role = "student";
  const priority: Priority = "Khẩn cấp";
  assert.equal(role, "student");
  assert.equal(priority, "Khẩn cấp");
});

test("DTO types validate backend response contracts", () => {
  assertDtoExports();
  const mockAuthRes: SingleResponse<AuthResponse> = {
    httpStatus: 200,
    message: "Success",
    data: {
      accessToken: "token123",
      refreshToken: "refresh123",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: "u-1",
        username: "admin",
        email: "admin@ktxhub.vn",
        phone: "0900123456",
        role: "MANAGER",
        status: "ACTIVE",
      },
    },
  };
  assert.equal(mockAuthRes.data.user.role, "MANAGER");

  const mockRoomDetail: RoomDetailResponse = {
    id: "r-1",
    roomNumber: "P.302",
    floor: 3,
    roomType: "FOUR_BEDS",
    genderPolicy: "MALE",
    totalBeds: 4,
    occupiedBeds: 1,
    basePrice: 1500000,
    amenities: [
      {
        amenityId: "am-1",
        code: "AC",
        name: "Máy lạnh",
        category: "Thiết bị",
        quantity: 1,
      },
    ],
    beds: [
      {
        id: "b-1",
        bedCode: "P.302-G01",
        slotKey: "G01",
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
        id: "b-2",
        bedCode: "P.302-G02",
        slotKey: "G02",
        price: 1500000,
        status: "AVAILABLE",
        occupant: null,
      },
    ],
  };
  assert.equal(mockRoomDetail.beds[0].status, "OCCUPIED");
  assert.equal(mockRoomDetail.beds[1].occupant, null);

  const mockPage: PageResponse<RoomSummaryResponse> = {
    items: [
      {
        id: "r-1",
        roomNumber: "P.302",
        floor: 3,
        roomType: "FOUR_BEDS",
        genderPolicy: "MALE",
        totalBeds: 4,
        occupiedBeds: 1,
        basePrice: 1500000,
        amenities: [],
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    last: true,
  };
  assert.equal(mockPage.items.length, 1);
  assert.equal(mockPage.last, true);

  const mockTech: TechnicianResponse = {
    id: "tech-1",
    userId: "u-tech",
    username: "tech01",
    email: "tech01@ktxhub.vn",
    phone: "0911222333",
    fullName: "Trần Kỹ Thuật",
    active: true,
    userStatus: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
  };
  assert.equal(mockTech.active, true);
  assert.equal(mockTech.fullName, "Trần Kỹ Thuật");

  const mockError: DetailedErrorResponse = {
    httpStatus: 400,
    errorCode: "INVALID_INPUT",
    message: "Validation failed",
    timestamp: "2026-11-04T00:00:00Z",
    errors: {
      roomNumber: "Số phòng không hợp lệ",
    },
  };
  assert.equal(mockError.errorCode, "INVALID_INPUT");
  assert.equal(mockError.errors?.roomNumber, "Số phòng không hợp lệ");
});
