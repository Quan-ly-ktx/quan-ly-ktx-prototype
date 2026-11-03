import { useState } from "react";
import { Button } from "../../../components/common/Button.tsx";
import { Icon } from "../../../components/common/Icon.tsx";
import { PageHeader } from "../../../components/common/PageHeader.tsx";
import { Select } from "../../../components/common/Select.tsx";
import { AddEditRoomModal } from "./AddEditRoomModal.tsx";
import { DeleteRoomModal } from "./DeleteRoomModal.tsx";
import { RoomDetailDrawer } from "./RoomDetailDrawer.tsx";
import { RoomMatrixView } from "./RoomMatrixView.tsx";
import { RoomTableView } from "./RoomTableView.tsx";
import type { RoomRecord, TenantRecord, BedStatus } from "../../../types/index.ts";
import { ApiError } from "../../../services/httpClient.ts";
import {
  canDeleteRoom,
  canToggleBedMaintenance,
  getRoomOccupancy,
} from "../../../utils/roomCalculations.ts";

export function RoomsPage({
  rooms,
  onRoomsChange,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onUpdateBedStatus,
  tenants,
  onQuickOnboard,
  showToast,
}: {
  rooms: RoomRecord[];
  onRoomsChange: (next: RoomRecord[]) => void;
  onCreateRoom?: (room: RoomRecord) => Promise<RoomRecord>;
  onUpdateRoom?: (id: string, room: RoomRecord) => Promise<RoomRecord>;
  onDeleteRoom?: (id: string) => Promise<void>;
  onUpdateBedStatus?: (bedId: string, status: BedStatus) => Promise<void>;
  tenants: TenantRecord[];
  onQuickOnboard?: (roomCode: string, bedCode: string) => void;
  showToast: (message: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"matrix" | "table">("matrix");
  const [floor, setFloor] = useState("Tất cả");
  const [gender, setGender] = useState("Tất cả");
  const [occupancyFilter, setOccupancyFilter] = useState("Tất cả sức chứa");
  const [typeFilter, setTypeFilter] = useState("Tất cả loại phòng");
  const [search, setSearch] = useState("");

  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<RoomRecord | null>(null);

  const activeRooms = rooms.filter((r) => !r.deletedAt);

  const availableFloors = Array.from(
    new Set(activeRooms.map((r) => Number(r.floor))),
  ).sort((a, b) => a - b);

  const roomsWithOccupancy = activeRooms.map((room) => ({
    ...room,
    occupancy: getRoomOccupancy(room, tenants),
  }));

  const filteredRooms = roomsWithOccupancy.filter((item) => {
    if (floor !== "Tất cả" && Number(item.floor) !== Number(floor)) return false;
    if (gender !== "Tất cả" && item.gender !== gender) return false;
    if (typeFilter !== "Tất cả loại phòng" && item.type !== typeFilter) return false;
    if (occupancyFilter !== "Tất cả sức chứa") {
      if (
        occupancyFilter === "Còn giường trống" &&
        item.occupancy.occupied >= item.occupancy.total
      )
        return false;
      if (
        occupancyFilter === "Đã kín chỗ" &&
        item.occupancy.occupied < item.occupancy.total
      )
        return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const codeMatch = item.code.toLowerCase().includes(q);
      const bedMatch = item.occupancy.beds.some(
        (b) =>
          b.bedCode.toLowerCase().includes(q) ||
          b.slotKey.toLowerCase().includes(q) ||
          b.tenant?.name.toLowerCase().includes(q),
      );
      const amenityMatch = item.amenities.some((a) =>
        a.name.toLowerCase().includes(q),
      );
      if (!codeMatch && !bedMatch && !amenityMatch) return false;
    }
    return true;
  });

  const selectedRoomWithOcc = selectedRoom
    ? roomsWithOccupancy.find((r) => r.code === selectedRoom.code) ?? null
    : null;

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setAddEditOpen(true);
  };

  const handleOpenEdit = (room: RoomRecord) => {
    setEditingRoom(room);
    setAddEditOpen(true);
  };

  const handleSaveRoom = async (savedRoom: RoomRecord, isEdit: boolean) => {
    try {
      if (isEdit) {
        if (onUpdateRoom) {
          await onUpdateRoom(savedRoom.id, savedRoom);
        } else {
          const updated = rooms.map((r) => (r.id === savedRoom.id ? savedRoom : r));
          onRoomsChange(updated);
        }
        showToast(`Đã cập nhật cấu hình phòng ${savedRoom.code}`);
      } else {
        if (onCreateRoom) {
          await onCreateRoom(savedRoom);
        } else {
          onRoomsChange([savedRoom, ...rooms]);
        }
        showToast(
          `Đã tạo phòng ${savedRoom.code} và tự động sinh ${savedRoom.total} vị trí giường`,
        );
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.message);
      } else {
        showToast(isEdit ? "Cập nhật phòng thất bại" : "Tạo phòng thất bại");
      }
    }
  };

  const handleConfirmArchive = async (roomToArchive: RoomRecord) => {
    if (!canDeleteRoom(roomToArchive.code, tenants)) {
      showToast("Phòng đang có khách ở nên không thể đưa vào lưu trữ");
      return;
    }
    try {
      if (onDeleteRoom) {
        await onDeleteRoom(roomToArchive.id);
      } else {
        const updated = rooms.map((r) =>
          r.id === roomToArchive.id
            ? { ...r, deletedAt: new Date().toISOString() }
            : r,
        );
        onRoomsChange(updated);
      }
      showToast(`Đã đưa phòng ${roomToArchive.code} vào lưu trữ`);
      setDeleteRoom(null);
      if (selectedRoom?.id === roomToArchive.id) {
        setSelectedRoom(null);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.message);
      } else {
        showToast("Lưu trữ phòng thất bại");
      }
    }
  };

  const handleToggleBedMaintenance = async (
    room: RoomRecord,
    bedCode: string,
    newStatus: "AVAILABLE" | "MAINTENANCE",
  ) => {
    if (
      newStatus === "MAINTENANCE" &&
      !canToggleBedMaintenance(room.code, bedCode, tenants)
    ) {
      showToast("Giường đang có người ở, không thể đưa vào bảo trì");
      return;
    }

    const currentOverrides = room.bedOverrides ?? {};
    const nextOverrides = {
      ...currentOverrides,
      [bedCode]: {
        ...currentOverrides[bedCode],
        status: newStatus,
      },
    };

    try {
      if (onUpdateBedStatus) {
        const bedId = room.bedOverrides?.[bedCode]?.id || bedCode;
        await onUpdateBedStatus(bedId, newStatus);
      } else {
        const updatedRooms = rooms.map((r) =>
          r.id === room.id ? { ...r, bedOverrides: nextOverrides } : r,
        );
        onRoomsChange(updatedRooms);
      }
      showToast(
        newStatus === "MAINTENANCE"
          ? `Đã chuyển giường ${room.code}-${bedCode} sang trạng thái Bảo trì`
          : `Đã mở lại giường ${room.code}-${bedCode} sẵn sàng đón khách`,
      );
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        showToast(err.message);
      } else {
        showToast("Cập nhật trạng thái giường thất bại");
      }
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Phân hệ Cơ sở & Phòng ở"
        title="Quản lý Phòng & Giường"
        description="Theo dõi trực quan sơ đồ ma trận phòng, quản lý danh mục và cấu hình tiện nghi theo thời gian thực."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-sm border border-slate-200 bg-slate-100 p-0.5">
              <Button
                className={`flex h-8.5 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold ${
                  viewMode === "matrix"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setViewMode("matrix")}
              >
                <Icon name="grid" className="size-3.5" />
                Sơ đồ ma trận
              </Button>
              <Button
                className={`flex h-8.5 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold ${
                  viewMode === "table"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setViewMode("table")}
              >
                <Icon name="clipboard" className="size-3.5" />
                Danh mục bảng
              </Button>
            </div>

            <Button
              className="flex h-9 items-center gap-1.5 rounded-sm bg-brand-500 px-3.5 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={handleOpenAdd}
            >
              <span className="text-sm leading-none">+</span> Thêm phòng mới
            </Button>
          </div>
        }
      />

      <section className="mb-5 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1 rounded-sm bg-slate-100 p-0.5">
              <Button
                className={`h-8 rounded-sm px-2.5 text-xs font-semibold ${
                  floor === "Tất cả"
                    ? "bg-white text-brand-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => setFloor("Tất cả")}
              >
                Tất cả tầng
              </Button>
              {availableFloors.map((fl) => (
                <Button
                  className={`h-8 rounded-sm px-2.5 text-xs font-semibold ${
                    floor === String(fl)
                      ? "bg-white text-brand-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  key={fl}
                  onClick={() => setFloor(String(fl))}
                >
                  Tầng {fl}
                </Button>
              ))}
            </div>

            <div className="flex rounded-sm bg-slate-100 p-0.5">
              {["Tất cả", "Nam", "Nữ"].map((item) => (
                <Button
                  className={`h-8 rounded-sm px-2.5 text-xs font-semibold ${
                    gender === item
                      ? "bg-white text-brand-700 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  key={item}
                  onClick={() => setGender(item)}
                >
                  {item === "Tất cả" ? "Tất cả giới tính" : `Phòng ${item}`}
                </Button>
              ))}
            </div>

            <div className="w-40">
              <Select
                label=""
                value={occupancyFilter}
                options={[
                  "Tất cả sức chứa",
                  "Còn giường trống",
                  "Đã kín chỗ",
                ]}
                onChange={setOccupancyFilter}
              />
            </div>

            {viewMode === "table" && (
              <div className="w-36">
                <Select
                  label=""
                  value={typeFilter}
                  options={[
                    "Tất cả loại phòng",
                    "4 giường",
                    "6 giường",
                    "8 giường",
                  ]}
                  onChange={setTypeFilter}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:w-56">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <input
                className="focus-ring h-8.5 w-full rounded-sm border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white"
                placeholder={
                  viewMode === "matrix"
                    ? "Tìm phòng, giường, người ở..."
                    : "Tìm số phòng, tiện nghi..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {viewMode === "matrix" && (
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-brand-500" /> Đang ở
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm border border-dashed border-slate-400 bg-white" />{" "}
                  Trống
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex size-3.5 items-center justify-center rounded-sm bg-warning-100 text-warning-700">
                    <Icon name="tools" className="size-2.5" />
                  </span>{" "}
                  Bảo trì
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {viewMode === "matrix" && (
        <RoomMatrixView
          filteredRooms={filteredRooms}
          availableFloors={availableFloors}
          floor={floor}
          onSelectRoom={setSelectedRoom}
          onQuickOnboard={onQuickOnboard}
        />
      )}

      {viewMode === "table" && (
        <RoomTableView
          filteredRooms={filteredRooms}
          activeRooms={activeRooms}
          tenants={tenants}
          onSelectRoom={setSelectedRoom}
          onEditRoom={handleOpenEdit}
          onDeleteRoom={setDeleteRoom}
        />
      )}

      <RoomDetailDrawer
        room={selectedRoomWithOcc}
        tenants={tenants}
        onClose={() => setSelectedRoom(null)}
        onEdit={handleOpenEdit}
        onArchive={setDeleteRoom}
        onQuickOnboard={onQuickOnboard}
        onToggleMaintenance={handleToggleBedMaintenance}
      />

      <AddEditRoomModal
        open={addEditOpen}
        onClose={() => setAddEditOpen(false)}
        editingRoom={editingRoom}
        tenants={tenants}
        activeRooms={activeRooms}
        availableFloors={availableFloors}
        onSave={handleSaveRoom}
        showToast={showToast}
      />

      {deleteRoom && (
        <DeleteRoomModal
          room={deleteRoom}
          onClose={() => setDeleteRoom(null)}
          onConfirm={handleConfirmArchive}
        />
      )}
    </>
  );
}
