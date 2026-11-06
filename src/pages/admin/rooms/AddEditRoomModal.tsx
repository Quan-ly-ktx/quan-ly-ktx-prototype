import { useEffect, useState } from "react";
import { Modal } from "../../../components/common/Modal.tsx";
import { Button } from "../../../components/common/Button.tsx";
import { Icon } from "../../../components/common/Icon.tsx";
import { money } from "../../../utils/formatters.ts";
import type { AmenityItem, RoomGender, RoomRecord, RoomType, TenantRecord } from "../../../types/index.ts";
import {
  canChangeGenderPolicy,
  generateBedsForRoom,
  getRoomOccupancy,
} from "../../../utils/roomCalculations.ts";

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

export function AddEditRoomModal({
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
                    label="Giảm số lượng"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-mono font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <Button
                    className="grid size-6 place-items-center rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-100 active:translate-y-[1px]"
                    onClick={() => handleUpdateAmenityQty(index, 1)}
                    label="Tăng số lượng"
                  >
                    +
                  </Button>
                  <Button
                    className="ml-2 text-danger-500 hover:text-danger-700"
                    onClick={() => handleRemoveAmenity(index)}
                    label="Xóa tiện nghi này"
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
