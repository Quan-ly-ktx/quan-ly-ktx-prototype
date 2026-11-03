import { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  Select,
} from "./shared";
import {
  money,
  type AmenityItem,
  type RoomGender,
  type RoomRecord,
  type RoomType,
  type TenantRecord,
} from "./data";
import {
  canChangeGenderPolicy,
  canDeleteRoom,
  canToggleBedMaintenance,
  generateBedsForRoom,
  getRoomOccupancy,
  type RoomOccupancySummary,
} from "./domain";

const suggestedAmenities = [
  "Điều hòa",
  "Bình nóng lạnh",
  "Tủ cá nhân",
  "Tủ lạnh",
  "Ban công",
  "Bàn học",
  "Quạt trần",
  "Tủ sắt",
  "Wifi riêng",
];

const defaultAmenities: AmenityItem[] = [
  { name: "Điều hòa", quantity: 1 },
  { name: "Bình nóng lạnh", quantity: 1 },
  { name: "Tủ cá nhân", quantity: 4 },
];

function bedCountForType(type: RoomType): number {
  switch (type) {
    case "4 giường":
      return 4;
    case "6 giường":
      return 6;
    case "8 giường":
      return 8;
    default:
      return 4;
  }
}

// Modal dùng chung Thêm mới & Chỉnh sửa phòng (POJO thuần túy - FR-02, FR-03, BR-02)
function AddEditRoomModal({
  open,
  onClose,
  editingRoom,
  tenants,
  activeRooms,
  availableFloors,
  onSave,
  showToast,
}: {
  open: boolean;
  onClose: () => void;
  editingRoom: RoomRecord | null;
  tenants: TenantRecord[];
  activeRooms: RoomRecord[];
  availableFloors: number[];
  onSave: (room: RoomRecord, isEdit: boolean) => void;
  showToast: (message: string) => void;
}) {
  const [formCode, setFormCode] = useState("");
  const [formFloor, setFormFloor] = useState<number>(1);
  const [formType, setFormType] = useState<RoomType>("6 giường");
  const [formGender, setFormGender] = useState<RoomGender>("Nam");
  const [formPrice, setFormPrice] = useState<number>(1500000);
  const [formAmenities, setFormAmenities] = useState<AmenityItem[]>(defaultAmenities);

  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityQty, setNewAmenityQty] = useState<number>(1);

  useEffect(() => {
    if (editingRoom) {
      setFormCode(editingRoom.code);
      setFormFloor(Number(editingRoom.floor));
      setFormType(editingRoom.type);
      setFormGender(editingRoom.gender);
      setFormPrice(editingRoom.basePrice);
      setFormAmenities(editingRoom.amenities.map((a) => ({ ...a })));
    } else {
      setFormCode("");
      setFormFloor(availableFloors[0] ?? 1);
      setFormType("6 giường");
      setFormGender("Nam");
      setFormPrice(1500000);
      setFormAmenities([
        { name: "Điều hòa", quantity: 1 },
        { name: "Bình nóng lạnh", quantity: 1 },
        { name: "Tủ cá nhân", quantity: 6 },
      ]);
    }
    setNewAmenityName("");
    setNewAmenityQty(1);
  }, [editingRoom, open, availableFloors]);

  if (!open) return null;

  const handleUpdateAmenityQty = (index: number, delta: number) => {
    setFormAmenities((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }),
    );
  };

  const handleRemoveAmenity = (index: number) => {
    setFormAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    const trimmed = newAmenityName.trim();
    if (!trimmed) return;
    const existingIndex = formAmenities.findIndex(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existingIndex !== -1) {
      handleUpdateAmenityQty(existingIndex, newAmenityQty);
    } else {
      setFormAmenities((prev) => [
        ...prev,
        { name: trimmed, quantity: Math.max(1, newAmenityQty) },
      ]);
    }
    setNewAmenityName("");
    setNewAmenityQty(1);
  };

  const previewTotal = bedCountForType(formType);
  const previewBeds = generateBedsForRoom(
    formCode.trim() || "P.xxx",
    previewTotal,
    formPrice || 1500000,
  );

  const isGenderLocked =
    editingRoom !== null && !canChangeGenderPolicy(editingRoom.code, tenants);

  const handleSubmit = () => {
    const trimmedCode = formCode.trim().toUpperCase();
    if (!trimmedCode) {
      showToast("Vui lòng nhập số phòng (Ví dụ: P.305)");
      return;
    }
    if (formPrice <= 0) {
      showToast("Đơn giá thuê phải lớn hơn 0");
      return;
    }

    const totalBeds = bedCountForType(formType);

    if (editingRoom) {
      const occ = getRoomOccupancy(editingRoom, tenants);
      if (
        editingRoom.gender !== formGender &&
        !canChangeGenderPolicy(editingRoom.code, tenants)
      ) {
        showToast(
          `Không thể đổi giới tính: phòng đang có ${occ.occupied} người ở.`,
        );
        return;
      }
      if (totalBeds < occ.occupied) {
        showToast(
          `Sức chứa không thể giảm xuống dưới ${occ.occupied} giường đang có người ở.`,
        );
        return;
      }

      const updated: RoomRecord = {
        ...editingRoom,
        code: trimmedCode,
        floor: formFloor,
        type: formType,
        gender: formGender,
        total: totalBeds,
        basePrice: formPrice,
        amenities: formAmenities,
      };

      onSave(updated, true);
    } else {
      if (activeRooms.some((r) => r.code === trimmedCode)) {
        showToast(`Số phòng ${trimmedCode} đã tồn tại trên hệ thống`);
        return;
      }

      const newRoom: RoomRecord = {
        id: `RM-${Date.now().toString().slice(-4)}`,
        code: trimmedCode,
        floor: formFloor,
        type: formType,
        gender: formGender,
        total: totalBeds,
        basePrice: formPrice,
        amenities: formAmenities,
      };

      onSave(newRoom, false);
    }

    onClose();
  };

  return (
    <Modal
      title={editingRoom ? `Chỉnh sửa phòng ${editingRoom.code}` : "Thêm phòng mới"}
      description={
        editingRoom
          ? "Cập nhật đơn giá và số lượng tiện nghi trang bị của phòng."
          : "Nhập thông tin để tạo phòng mới và tạo các vị trí giường tương ứng."
      }
      onClose={onClose}
      wide
    >
      <div className="grid gap-5 p-6 sm:grid-cols-2">
        {/* Số phòng */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Số phòng *
          </span>
          <input
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 font-mono text-sm outline-none focus:border-brand-500"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toUpperCase())}
            placeholder="VD: P.305"
          />
        </label>

        {/* Tầng (Linh hoạt, không cố định) */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Số tầng *
          </span>
          <input
            type="number"
            min={1}
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 font-mono text-sm outline-none focus:border-brand-500"
            value={formFloor}
            onChange={(e) => setFormFloor(Math.max(1, Number(e.target.value)))}
          />
        </label>

        {/* Loại phòng (4, 6, 8 giường) */}
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Loại phòng *
          </span>
          <select
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500"
            value={formType}
            onChange={(e) => setFormType(e.target.value as RoomType)}
          >
            <option value="4 giường">4 giường</option>
            <option value="6 giường">6 giường</option>
            <option value="8 giường">8 giường</option>
          </select>
        </label>

        {/* Chính sách giới tính */}
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Chính sách giới tính *</span>
            {isGenderLocked && (
              <span className="text-[11px] text-danger-600">Đã khóa (đang có khách)</span>
            )}
          </span>
          <select
            className={`focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 ${
              isGenderLocked ? "cursor-not-allowed bg-slate-100 opacity-70" : ""
            }`}
            value={formGender}
            disabled={isGenderLocked}
            onChange={(e) => setFormGender(e.target.value as RoomGender)}
          >
            <option value="Nam">Phòng Nam</option>
            <option value="Nữ">Phòng Nữ</option>
          </select>
        </label>

        {isGenderLocked && (
          <div className="sm:col-span-2 rounded-sm border border-warning-200 bg-warning-50 p-2.5 text-xs text-warning-800">
            <span className="font-semibold">Lưu ý:</span> Phòng đang có người ở.
            Tuyệt đối không được đổi chính sách giới tính khi phòng đang có ít nhất 01 khách cư trú.
          </div>
        )}

        {/* Đơn giá */}
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Đơn giá thuê tiêu chuẩn / tháng (VNĐ) *
          </span>
          <input
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 font-mono text-sm outline-none focus:border-brand-500"
            type="number"
            step={50000}
            value={formPrice}
            onChange={(e) => setFormPrice(Number(e.target.value))}
          />
        </label>

        {/* Chỉnh sửa số lượng từng tiện nghi */}
        <div className="sm:col-span-2 space-y-3 rounded-sm border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Tiện nghi trang bị
            </span>
          </div>

          <div className="space-y-2">
            {formAmenities.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs"
              >
                <span className="font-medium text-slate-800">{item.name}</span>
                <div className="flex items-center gap-2">
                  <Button
                    className="grid size-6 place-items-center rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:translate-y-[1px]"
                    onClick={() => handleUpdateAmenityQty(index, -1)}
                    title="Giảm số lượng"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-mono font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <Button
                    className="grid size-6 place-items-center rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:translate-y-[1px]"
                    onClick={() => handleUpdateAmenityQty(index, 1)}
                    title="Tăng số lượng"
                  >
                    +
                  </Button>
                  <Button
                    className="ml-2 text-danger-500 hover:text-danger-700"
                    onClick={() => handleRemoveAmenity(index)}
                    title="Xóa tiện nghi này"
                  >
                    <Icon name="close" className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {formAmenities.length === 0 && (
              <p className="text-xs italic text-slate-400">Chưa có tiện nghi nào được gắn vào phòng.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <select
              className="focus-ring h-8.5 rounded-sm border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-brand-500"
              value={newAmenityName}
              onChange={(e) => setNewAmenityName(e.target.value)}
            >
              <option value="">-- Chọn tiện nghi để thêm --</option>
              {suggestedAmenities.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">SL:</span>
              <input
                type="number"
                min={1}
                className="focus-ring h-8.5 w-16 rounded-sm border border-slate-200 px-2 font-mono text-xs outline-none focus:border-brand-500"
                value={newAmenityQty}
                onChange={(e) => setNewAmenityQty(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <Button
              className="h-8.5 rounded-sm bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-900 active:translate-y-[1px] disabled:opacity-40"
              disabled={!newAmenityName.trim()}
              onClick={handleAddAmenity}
            >
              + Thêm tiện nghi
            </Button>
          </div>
        </div>

        {/* Live Bed Preview - CHỈ hiển thị khi THÊM MỚI */}
        {!editingRoom && (
          <div className="sm:col-span-2 rounded-sm border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Danh sách vị trí giường sẽ tự động sinh ({previewTotal} vị trí)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {formCode ? `${formCode}-G01..G0${previewTotal}` : "Chờ nhập số phòng"}
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {previewBeds.map((bed) => (
                <div
                  key={bed.bedCode}
                  className="flex flex-col justify-between rounded-sm border border-slate-200 bg-white p-2 text-xs shadow-2xs"
                >
                  <div className="font-mono font-bold text-brand-700">
                    {bed.slotKey}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {money(bed.price)}/tháng
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
        <Button
          className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
          onClick={onClose}
        >
          Hủy bỏ
        </Button>
        <Button
          className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
          onClick={handleSubmit}
        >
          {editingRoom ? "Lưu thay đổi" : "Tạo phòng và sinh giường"}
        </Button>
      </div>
    </Modal>
  );
}

// Thẻ hiển thị một phòng trên Sơ đồ Ma trận
function RoomCard({
  room,
  onSelect,
  onQuickOnboard,
}: {
  room: RoomRecord & {
    occupancy: RoomOccupancySummary;
  };
  onSelect: () => void;
  onQuickOnboard?: (roomCode: string, bedCode: string) => void;
}) {
  const percent = Math.round(
    (room.occupancy.occupied / room.occupancy.total) * 100,
  );
  const remainingSlots = room.occupancy.total - room.occupancy.occupied;

  return (
    <article
      className="cursor-pointer rounded-sm border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-lg font-bold text-slate-950">
            {room.code}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Tầng {room.floor} · {room.type}
          </div>
        </div>

        <span
          className={`status-label ${
            room.gender === "Nam"
              ? "status-label-brand"
              : "border border-pink-200 bg-pink-50 text-pink-700"
          }`}
        >
          Phòng {room.gender}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-xs text-slate-500">Sức chứa</span>
        <span className="font-semibold text-slate-800">
          {room.occupancy.occupied}/{room.occupancy.total} giường
          <span className="ml-1 text-xs font-normal text-slate-500">
            ({remainingSlots === 0 ? "Kín chỗ" : `còn ${remainingSlots} chỗ`})
          </span>
        </span>
      </div>

      {/* Thanh tiến độ lấp đầy */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-slate-100">
        <div
          className={`h-full rounded-sm transition-all ${
            percent === 100 ? "bg-slate-500" : "bg-brand-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Ma trận slot giường con (Bed-level) */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {room.occupancy.beds.map((b) => {
          const isOccupied = b.status === "OCCUPIED";
          const isMaint = b.status === "MAINTENANCE";

          return (
            <Button
              key={b.bedCode}
              className={`flex h-9 items-center justify-between rounded-sm border px-2.5 text-xs font-semibold active:translate-y-[1px] ${
                isMaint
                  ? "border-warning-200 bg-warning-50 text-warning-700"
                  : isOccupied
                    ? "border-brand-100 bg-brand-50 text-brand-700"
                    : "border-dashed border-slate-300 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-700"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOccupied && !isMaint && onQuickOnboard) {
                  onQuickOnboard(room.code, b.bedCode);
                } else {
                  onSelect();
                }
              }}
              title={
                isOccupied && b.tenant
                  ? `${b.slotKey}: ${b.tenant.name}`
                  : `${b.slotKey}`
              }
            >
              <span>{b.bedCode}</span>
              <span className="flex items-center gap-1 truncate text-[11px]">
                {isMaint ? (
                  <>
                    <Icon name="tools" className="size-3 text-warning-600" />
                    Bảo trì
                  </>
                ) : isOccupied && b.tenant ? (
                  b.tenant.name.split(" ").slice(-1)[0]
                ) : (
                  "+ Trống"
                )}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="font-mono text-sm font-semibold text-slate-900">
          {money(room.basePrice)}
          <span className="font-sans text-xs font-normal text-slate-400">
            {" "}
            /tháng
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          Chi tiết <Icon name="chevron" className="size-3.5" />
        </span>
      </div>
    </article>
  );
}

// Phân hệ Hợp nhất Quản lý Phòng & Giường (RoomsPage)
export function RoomsPage({
  rooms,
  onRoomsChange,
  tenants,
  onQuickOnboard,
  showToast,
}: {
  rooms: RoomRecord[];
  onRoomsChange: (next: RoomRecord[]) => void;
  tenants: TenantRecord[];
  onQuickOnboard?: (roomCode: string, bedCode: string) => void;
  showToast: (message: string) => void;
}) {
  // Chế độ xem: "matrix" (Sơ đồ ma trận) hoặc "table" (Danh mục bảng)
  const [viewMode, setViewMode] = useState<"matrix" | "table">("matrix");

  // State bộ lọc (FR-01 & FR-05: Lọc tầng, giới tính, tìm kiếm)
  const [floor, setFloor] = useState("Tất cả");
  const [gender, setGender] = useState("Tất cả");
  const [occupancyFilter, setOccupancyFilter] = useState("Tất cả sức chứa");
  const [typeFilter, setTypeFilter] = useState("Tất cả loại phòng");
  const [search, setSearch] = useState("");

  // Modal & Drawer
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomRecord | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<RoomRecord | null>(null);
  const [confirmCode, setConfirmCode] = useState("");

  // Active rooms only (no soft deleted)
  const activeRooms = rooms.filter((r) => !r.deletedAt);

  // Dynamic floors from active rooms
  const availableFloors = Array.from(
    new Set(activeRooms.map((r) => Number(r.floor))),
  ).sort((a, b) => a - b);

  // Calculate occupancy metrics for all rooms
  const roomsWithOccupancy = activeRooms.map((room) => {
    const occ = getRoomOccupancy(room, tenants);
    return {
      ...room,
      occupancy: occ,
    };
  });

  // Filter computation
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

  const handleSaveRoom = (savedRoom: RoomRecord, isEdit: boolean) => {
    if (isEdit) {
      const updated = rooms.map((r) => (r.id === savedRoom.id ? savedRoom : r));
      onRoomsChange(updated);
      showToast(`Đã cập nhật cấu hình phòng ${savedRoom.code}`);
    } else {
      onRoomsChange([savedRoom, ...rooms]);
      showToast(
        `Đã tạo phòng ${savedRoom.code} và tự động sinh ${savedRoom.total} vị trí giường`,
      );
    }
  };

  const handleArchiveRoom = () => {
    if (!deleteRoom) return;
    // FR-04: Chặn xóa nếu phòng có người ở hoặc còn hợp đồng hiệu lực
    if (!canDeleteRoom(deleteRoom.code, tenants)) {
      showToast("Phòng đang có khách ở nên không thể đưa vào lưu trữ");
      return;
    }

    const updated = rooms.map((r) =>
      r.id === deleteRoom.id
        ? { ...r, deletedAt: new Date().toISOString() }
        : r,
    );
    onRoomsChange(updated);
    setDeleteRoom(null);
    setConfirmCode("");
    showToast(`Đã đưa phòng ${deleteRoom.code} vào lưu trữ an toàn`);
  };

  // Quản lý bảo trì từng giường độc lập (chỉ bảo trì khi không có khách ở)
  const handleToggleBedMaintenance = (
    room: RoomRecord,
    bedCode: string,
    newStatus: "AVAILABLE" | "MAINTENANCE",
  ) => {
    if (newStatus === "MAINTENANCE" && !canToggleBedMaintenance(room.code, bedCode, tenants)) {
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

    const updatedRooms = rooms.map((r) =>
      r.id === room.id ? { ...r, bedOverrides: nextOverrides } : r,
    );

    onRoomsChange(updatedRooms);
    showToast(
      newStatus === "MAINTENANCE"
        ? `Đã chuyển giường ${room.code}-${bedCode} sang trạng thái Bảo trì`
        : `Đã mở lại giường ${room.code}-${bedCode} sẵn sàng đón khách`,
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Phân hệ Cơ sở & Phòng ở"
        title="Quản lý Phòng & Giường"
        description="Theo dõi trực quan sơ đồ ma trận phòng, quản lý danh mục và cấu hình tiện nghi theo thời gian thực."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Chuyển tab qua lại giữa Sơ đồ ma trận & Danh mục bảng */}
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

      {/* Thanh bộ lọc đa tiêu chí (FR-01 & FR-05) */}
      <section className="mb-5 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Lọc Tầng động */}
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

            {/* Lọc Giới tính */}
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

            {/* Lọc Sức chứa */}
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

            {/* Lọc Loại phòng khi ở chế độ Bảng */}
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
            {/* Ô tìm kiếm nhanh */}
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

            {/* Legend chú thích (hiển thị khi ở chế độ Ma trận) */}
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

      {/* CHẾ ĐỘ 1: SƠ ĐỒ MA TRẬN PHÒNG & GIƯỜNG */}
      {viewMode === "matrix" && (
        filteredRooms.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-200 bg-white p-12 text-center">
            <Icon name="building" className="mx-auto size-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-800">
              Không tìm thấy phòng nào phù hợp
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Thử thay đổi bộ lọc tầng, giới tính hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : floor === "Tất cả" ? (
          <div className="space-y-8">
            {availableFloors.map((fl) => {
              const floorRooms = filteredRooms.filter((r) => Number(r.floor) === fl);
              if (floorRooms.length === 0) return null;
              const totalBeds = floorRooms.reduce(
                (sum, r) => sum + r.occupancy.total,
                0,
              );
              const occupiedBeds = floorRooms.reduce(
                (sum, r) => sum + r.occupancy.occupied,
                0,
              );
              const percent =
                totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

              return (
                <section key={fl} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-bold text-slate-900">
                        TẦNG {fl}
                      </span>
                      <span className="rounded-sm bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {floorRooms.length} phòng
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Lấp đầy:{" "}
                      <span className="font-mono font-semibold text-slate-800">
                        {occupiedBeds}/{totalBeds} giường ({percent}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {floorRooms.map((room) => (
                      <RoomCard
                        key={room.code}
                        room={room}
                        onSelect={() => setSelectedRoom(room)}
                        onQuickOnboard={onQuickOnboard}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.code}
                room={room}
                onSelect={() => setSelectedRoom(room)}
                onQuickOnboard={onQuickOnboard}
              />
            ))}
          </div>
        )
      )}

      {/* CHẾ ĐỘ 2: DANH MỤC BẢNG DỮ LIỆU */}
      {viewMode === "table" && (
        <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250 border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Số phòng</th>
                  <th className="px-5 py-3">Tầng</th>
                  <th className="px-5 py-3">Loại phòng</th>
                  <th className="px-5 py-3">Chính sách giới tính</th>
                  <th className="px-5 py-3">Đơn giá / tháng</th>
                  <th className="px-5 py-3">Sức chứa</th>
                  <th className="px-5 py-3">Tình trạng giường</th>
                  <th className="px-5 py-3">Tiện nghi trang bị</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => {
                  const occ = getRoomOccupancy(room, tenants);
                  const isDeletable = canDeleteRoom(room.code, tenants);
                  const maintCount = occ.beds.filter((b) => b.status === "MAINTENANCE").length;
                  const vacantCount = occ.total - occ.occupied - maintCount;

                  return (
                    <tr
                      className="cursor-pointer hover:bg-slate-50"
                      key={room.code}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <td className="px-5 py-4 font-mono text-sm font-bold text-brand-700">
                        {room.code}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        Tầng {room.floor}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {room.type}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`status-label ${
                            room.gender === "Nam"
                              ? "status-label-brand"
                              : "border border-pink-200 bg-pink-50 text-pink-700"
                          }`}
                        >
                          Phòng {room.gender}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm font-semibold text-slate-800">
                        {money(room.basePrice)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        <span className="font-mono font-semibold">
                          {occ.occupied}/{occ.total}
                        </span>
                        <span className="ml-1 text-xs text-slate-500">giường</span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5 font-medium">
                          {vacantCount > 0 && (
                            <span className="rounded-sm bg-success-50 px-2 py-0.5 text-success-700">
                              {vacantCount} trống
                            </span>
                          )}
                          {occ.occupied > 0 && (
                            <span className="rounded-sm bg-brand-50 px-2 py-0.5 text-brand-700">
                              {occ.occupied} đang ở
                            </span>
                          )}
                          {maintCount > 0 && (
                            <span className="rounded-sm bg-warning-50 px-2 py-0.5 text-warning-700">
                              {maintCount} bảo trì
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {room.amenities.map((item, idx) => (
                            <span
                              className="rounded-sm bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600"
                              key={idx}
                            >
                              {item.quantity > 1 ? `${item.quantity}x ` : ""}
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            className="rounded-sm border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                            onClick={() => handleOpenEdit(room)}
                          >
                            Sửa
                          </Button>
                          <Button
                            className="rounded-sm border border-danger-200 px-2.5 py-1 text-xs font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={!isDeletable}
                            title={
                              isDeletable
                                ? "Đưa vào lưu trữ"
                                : "Không thể xóa phòng đang có người ở"
                            }
                            onClick={() => setDeleteRoom(room)}
                          >
                            Lưu trữ
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRooms.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Không tìm thấy phòng phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Hiển thị {filteredRooms.length} trên tổng số {activeRooms.length}{" "}
              phòng hoạt động
            </span>
          </div>
        </section>
      )}

      {/* Slide-over Drawer (Chi tiết Phòng & Giường) */}
      {selectedRoomWithOcc && (
        <>
          <Button
            label="Đóng chi tiết phòng"
            className="fixed inset-0 z-backdrop bg-slate-950/35"
            onClick={() => setSelectedRoom(null)}
          >
            <span className="sr-only">Đóng</span>
          </Button>

          <aside className="fixed inset-y-0 right-0 z-drawer w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-lg">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold text-slate-950">
                    Phòng {selectedRoomWithOcc.code}
                  </span>
                  <span
                    className={`status-label ${
                      selectedRoomWithOcc.gender === "Nam"
                        ? "status-label-brand"
                        : "border border-pink-200 bg-pink-50 text-pink-700"
                    }`}
                  >
                    Phòng {selectedRoomWithOcc.gender}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Tầng {selectedRoomWithOcc.floor} · {selectedRoomWithOcc.type} ·
                  Chính sách: Phòng {selectedRoomWithOcc.gender}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  className="flex h-8 items-center gap-1.5 rounded-sm border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    handleOpenEdit(selectedRoomWithOcc);
                    setSelectedRoom(null);
                  }}
                >
                  <Icon name="settings" className="size-3.5" />
                  Chỉnh sửa
                </Button>
                <Button
                  label="Đóng"
                  className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
                  onClick={() => setSelectedRoom(null)}
                >
                  <Icon name="close" />
                </Button>
              </div>
            </div>

            <div className="space-y-6 p-5">
              {/* Thước đo sức chứa & giá thuê */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm bg-slate-50 p-3.5">
                  <div className="text-xs font-medium text-slate-500">
                    Sức chứa thực tế
                  </div>
                  <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                    {selectedRoomWithOcc.occupancy.occupied}/
                    {selectedRoomWithOcc.occupancy.total}
                    <span className="ml-1.5 text-xs font-normal text-slate-500">
                      giường
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {selectedRoomWithOcc.total - selectedRoomWithOcc.occupancy.occupied === 0
                      ? "Đã kín chỗ"
                      : `Còn ${selectedRoomWithOcc.total - selectedRoomWithOcc.occupancy.occupied} chỗ trống`}
                  </div>
                </div>

                <div className="rounded-sm bg-slate-50 p-3.5">
                  <div className="text-xs font-medium text-slate-500">
                    Đơn giá thuê trọn gói
                  </div>
                  <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                    {money(selectedRoomWithOcc.basePrice)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">/tháng/giường</div>
                </div>
              </div>

              {/* Danh sách từng vị trí giường (Bed-level Tracking) */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold text-slate-900">
                    Danh sách vị trí giường ({selectedRoomWithOcc.total} vị trí)
                  </h3>
                </div>

                <div className="mt-3 space-y-3">
                  {selectedRoomWithOcc.occupancy.beds.map((slot) => {
                    const isOccupied = slot.status === "OCCUPIED";
                    const isMaint = slot.status === "MAINTENANCE";

                    return (
                      <div
                        className={`rounded-sm border p-3.5 transition-all ${
                          isOccupied
                            ? "border-slate-200 bg-white"
                            : isMaint
                              ? "border-warning-200 bg-warning-50/50"
                              : "border-dashed border-slate-300 bg-slate-50/50"
                        }`}
                        key={slot.bedCode}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`grid size-9 shrink-0 place-items-center rounded-sm font-mono text-xs font-bold ${
                                isOccupied
                                  ? "border border-brand-100 bg-brand-50 text-brand-700"
                                  : isMaint
                                    ? "border border-warning-200 bg-warning-100 text-warning-700"
                                    : "border border-dashed border-slate-300 bg-white text-slate-500"
                              }`}
                            >
                              {slot.bedCode}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold text-slate-500">
                                  {slot.slotKey}
                                </span>
                                <span
                                  className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${
                                    isOccupied
                                      ? "bg-brand-50 text-brand-700"
                                      : isMaint
                                        ? "bg-warning-100 text-warning-700"
                                        : "bg-success-50 text-success-700"
                                  }`}
                                >
                                  {isOccupied
                                    ? "ĐANG CƯ TRÚ"
                                    : isMaint
                                      ? "BẢO TRÌ"
                                      : "SẴN SÀNG"}
                                </span>
                              </div>

                              {isOccupied && slot.tenant ? (
                                <div className="mt-1.5 space-y-1">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {slot.tenant.name}
                                  </div>
                                  <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                                    <span>SĐT: {slot.tenant.phone}</span>
                                    <span>CCCD: {slot.tenant.cccd}</span>
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Hạn HĐ:{" "}
                                    <span className="font-mono text-slate-700">
                                      {slot.tenant.end}
                                    </span>
                                  </div>
                                </div>
                              ) : isMaint ? (
                                <p className="mt-1 text-xs text-warning-800">
                                  Vị trí giường đang được bảo trì vật tư hoặc hỏng
                                  hóc.
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-slate-500">
                                  Vị trí trống, sẵn sàng tiếp nhận người thuê
                                  mới ({selectedRoomWithOcc.gender}).
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isOccupied && !isMaint && (
                              <>
                                {onQuickOnboard && (
                                  <Button
                                    className="rounded-sm bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                                    onClick={() => {
                                      onQuickOnboard(
                                        selectedRoomWithOcc.code,
                                        slot.bedCode,
                                      );
                                      setSelectedRoom(null);
                                    }}
                                  >
                                    + Xếp khách
                                  </Button>
                                )}
                                <Button
                                  className="flex items-center gap-1 rounded-sm border border-warning-300 bg-warning-50 px-2.5 py-1.5 text-xs font-semibold text-warning-700 hover:bg-warning-100 active:translate-y-[1px]"
                                  onClick={() =>
                                    handleToggleBedMaintenance(
                                      selectedRoomWithOcc,
                                      slot.bedCode,
                                      "MAINTENANCE",
                                    )
                                  }
                                  title="Chuyển giường sang bảo trì"
                                >
                                  <Icon name="tools" className="size-3 text-warning-600" />
                                  Bảo trì
                                </Button>
                              </>
                            )}

                            {isMaint && (
                              <Button
                                className="flex items-center gap-1 rounded-sm border border-success-300 bg-success-50 px-2.5 py-1.5 text-xs font-semibold text-success-700 hover:bg-success-100 active:translate-y-[1px]"
                                onClick={() =>
                                  handleToggleBedMaintenance(
                                    selectedRoomWithOcc,
                                    slot.bedCode,
                                    "AVAILABLE",
                                  )
                                }
                                title="Hoàn tất bảo trì, mở lại giường đón khách"
                              >
                                <Icon name="check" className="size-3 text-success-600" />
                                Mở lại giường
                              </Button>
                            )}

                            {isOccupied && (
                              <span className="text-[11px] text-slate-400 italic">
                                Đang có người ở
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Danh mục tiện nghi phòng có số lượng */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Tiện nghi phòng
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedRoomWithOcc.amenities &&
                  selectedRoomWithOcc.amenities.length > 0 ? (
                    selectedRoomWithOcc.amenities.map((item, idx) => (
                      <span
                        className="flex items-center gap-1.5 rounded-sm bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                        key={idx}
                      >
                        <span className="font-mono font-bold text-brand-600">
                          {item.quantity}x
                        </span>
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      Chưa ghi nhận tiện nghi
                    </span>
                  )}
                </div>
              </div>

              {!canDeleteRoom(selectedRoomWithOcc.code, tenants) && (
                <p className="rounded-sm bg-warning-50 p-3 text-xs text-warning-700">
                  Phòng đang có khách cư trú nên không thể đưa vào lưu trữ.
                </p>
              )}

              <div className="grid gap-2 border-t border-slate-100 pt-4">
                <Button
                  className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                  onClick={() => {
                    const target = selectedRoomWithOcc;
                    setSelectedRoom(null);
                    handleOpenEdit(target);
                  }}
                >
                  Chỉnh sửa phòng
                </Button>
                <Button
                  className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!canDeleteRoom(selectedRoomWithOcc.code, tenants)}
                  onClick={() => {
                    const target = selectedRoomWithOcc;
                    setSelectedRoom(null);
                    setDeleteRoom(target);
                  }}
                >
                  Đưa phòng vào lưu trữ (Soft Delete)
                </Button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Modal Thêm mới hoặc Chỉnh sửa phòng */}
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

      {/* Modal Đưa vào lưu trữ (Soft Delete) */}
      {deleteRoom && (
        <Modal
          title={`Đưa phòng ${deleteRoom.code} vào lưu trữ?`}
          description="Phòng sẽ ngừng hoạt động và ẩn khỏi sơ đồ (Soft Delete). Toàn bộ dữ liệu lịch sử hợp đồng và hóa đơn cũ vẫn được bảo lưu 100% để đối soát."
          onClose={() => {
            setDeleteRoom(null);
            setConfirmCode("");
          }}
        >
          <div className="p-6">
            <div className="mb-4 flex gap-2.5 rounded-sm border border-warning-200 bg-warning-50 p-3 text-xs text-warning-800">
              <Icon name="alert" className="size-5 shrink-0 text-warning-600" />
              <span>
                Vui lòng nhập chính xác mã phòng để tiếp tục.
              </span>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Nhập “{deleteRoom.code}” để xác nhận
              </span>
              <input
                className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 font-mono text-sm outline-none focus:border-warning-600"
                onChange={(event) => setConfirmCode(event.target.value)}
                value={confirmCode}
                placeholder={deleteRoom.code}
              />
            </label>

            <Button
              className="mt-4 h-10 w-full rounded-sm bg-danger-500 text-sm font-semibold text-white active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-danger-600"
              onClick={handleArchiveRoom}
              disabled={confirmCode !== deleteRoom.code}
            >
              Xác nhận đưa vào lưu trữ (Soft Delete)
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

// Backward-compatible exports
export const RoomMatrixPage = RoomsPage;
export const RoomsManagementPage = RoomsPage;
