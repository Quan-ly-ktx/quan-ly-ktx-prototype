import type {
  RoomDetailResponse,
  RoomSummaryResponse,
  BedSlotResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  BackendRoomType,
  BackendGenderPolicy,
  BackendBedStatus,
} from "../../../types/api/endpoints.ts";
import type {
  RoomRecord,
  BedRecord,
  RoomType,
  RoomGender,
  BedStatus,
  AmenityItem,
} from "../../../types/room.ts";

/**
 * Maps backend RoomType enum to frontend RoomType string
 */
export function toFrontendRoomType(type: BackendRoomType): RoomType {
  switch (type) {
    case "FOUR_BEDS":
      return "4 giường";
    case "SIX_BEDS":
      return "6 giường";
    case "EIGHT_BEDS":
      return "8 giường";
    default:
      return "4 giường";
  }
}

/**
 * Maps frontend RoomType string to backend RoomType enum
 */
export function toBackendRoomType(type: RoomType): BackendRoomType {
  switch (type) {
    case "4 giường":
      return "FOUR_BEDS";
    case "6 giường":
      return "SIX_BEDS";
    case "8 giường":
      return "EIGHT_BEDS";
    default:
      return "FOUR_BEDS";
  }
}

/**
 * Maps backend GenderPolicy enum to frontend RoomGender string
 */
export function toFrontendGender(gender: BackendGenderPolicy): RoomGender {
  switch (gender) {
    case "MALE":
      return "Nam";
    case "FEMALE":
      return "Nữ";
    default:
      return "Nam";
  }
}

/**
 * Maps frontend RoomGender string to backend GenderPolicy enum
 */
export function toBackendGenderPolicy(gender: RoomGender): BackendGenderPolicy {
  switch (gender) {
    case "Nam":
      return "MALE";
    case "Nữ":
      return "FEMALE";
    default:
      return "MALE";
  }
}

/**
 * Maps backend BedStatus enum to frontend BedStatus
 */
export function toFrontendBedStatus(status: BackendBedStatus): BedStatus {
  switch (status) {
    case "AVAILABLE":
      return "AVAILABLE";
    case "OCCUPIED":
      return "OCCUPIED";
    case "MAINTENANCE":
      return "MAINTENANCE";
    default:
      return "AVAILABLE";
  }
}

/**
 * Maps frontend BedStatus to backend BedStatus enum
 */
export function toBackendBedStatus(status: BedStatus): BackendBedStatus {
  switch (status) {
    case "AVAILABLE":
      return "AVAILABLE";
    case "OCCUPIED":
      return "OCCUPIED";
    case "MAINTENANCE":
      return "MAINTENANCE";
    default:
      return "AVAILABLE";
  }
}

/**
 * Maps backend BedSlotResponse to frontend BedRecord
 */
export function toFrontendBedRecord(bed: BedSlotResponse): BedRecord {
  return {
    bedCode: bed.bedCode,
    slotKey: bed.slotKey,
    price: bed.price,
    status: toFrontendBedStatus(bed.status),
  };
}

/**
 * Maps backend RoomDetailResponse or RoomSummaryResponse to frontend RoomRecord.
 * Automatically extracts bedOverrides if beds array is present.
 */
export function toFrontendRoomRecord(
  res: RoomDetailResponse | RoomSummaryResponse,
): RoomRecord {
  const amenities: AmenityItem[] = (res.amenities || []).map((a) => ({
    name: a.name,
    quantity: a.quantity,
  }));

  const roomRecord: RoomRecord = {
    id: res.id,
    code: res.roomNumber,
    floor: res.floor,
    type: toFrontendRoomType(res.roomType),
    gender: toFrontendGender(res.genderPolicy),
    total: res.totalBeds,
    basePrice: res.basePrice,
    amenities,
  };

  if ("beds" in res && Array.isArray(res.beds)) {
    const bedOverrides: Record<string, { id?: string; status?: BedStatus; price?: number }> = {};
    for (const bed of res.beds) {
      const status = toFrontendBedStatus(bed.status);
      const isCustomStatus = status !== "AVAILABLE";
      const isCustomPrice = typeof bed.price === "number" && bed.price !== res.basePrice;

      bedOverrides[bed.bedCode] = {
        id: bed.id,
        ...(isCustomStatus ? { status } : {}),
        ...(isCustomPrice ? { price: bed.price } : {}),
      };
    }
    if (Object.keys(bedOverrides).length > 0) {
      roomRecord.bedOverrides = bedOverrides;
    }
  }

  return roomRecord;
}

/**
 * Converts frontend RoomRecord to CreateRoomRequest for backend POST /api/v1/admin/rooms
 */
export function toBackendCreateRoomRequest(
  room: RoomRecord,
): CreateRoomRequest {
  return {
    roomNumber: room.code,
    floor: room.floor,
    roomType: toBackendRoomType(room.type),
    genderPolicy: toBackendGenderPolicy(room.gender),
    basePrice: room.basePrice,
  };
}

/**
 * Converts frontend RoomRecord to UpdateRoomRequest for backend PUT /api/v1/admin/rooms/{id}
 */
export function toBackendUpdateRoomRequest(
  room: RoomRecord,
): UpdateRoomRequest {
  return {
    genderPolicy: toBackendGenderPolicy(room.gender),
    basePrice: room.basePrice,
  };
}
