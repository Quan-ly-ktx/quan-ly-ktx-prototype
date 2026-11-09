import { Button } from "../../../components/common/Button.tsx";
import { useDormData } from "../../../hooks/useDormData.ts";
import { Icon } from "../../../components/common/Icon.tsx";
import { money } from "../../../utils/formatters.ts";
import type { RoomRecord, TenantRecord } from "../../../types/index.ts";
import type { RoomOccupancySummary } from "../../../utils/roomCalculations.ts";
import { canDeleteRoom } from "../../../utils/roomCalculations.ts";

export function RoomDetailDrawer({
  room,
  tenants,
  onClose,
  onEdit,
  onArchive,
  onQuickOnboard,
  onToggleMaintenance,
}: {
  room: (RoomRecord & { occupancy: RoomOccupancySummary }) | null;
  tenants: TenantRecord[];
  onClose: () => void;
  onEdit: (room: RoomRecord) => void;
  onArchive: (room: RoomRecord) => void;
  onQuickOnboard?: (roomCode: string, bedCode: string) => void;
  onToggleMaintenance: (
    room: RoomRecord,
    bedCode: string,
    newStatus: "AVAILABLE" | "MAINTENANCE",
  ) => void;
}) {
  const { contracts } = useDormData();
  if (!room) return null;

  const isDeletable = canDeleteRoom(room.id, contracts) && room.occupancy.occupied === 0;
  const remainingSlots = room.occupancy.available;

  return (
    <>
      <Button
        label="Đóng chi tiết phòng"
        className="fixed inset-0 z-backdrop bg-slate-950/35"
        onClick={onClose}
      >
        <span className="sr-only">Đóng</span>
      </Button>

      <aside className="fixed inset-y-0 right-0 z-drawer w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-slate-950">
                Phòng {room.code}
              </span>
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
            <div className="mt-1 text-xs text-slate-500">
              Tầng {room.floor} · {room.type} · Chính sách: Phòng {room.gender}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              className="flex h-8 items-center gap-1.5 rounded-sm border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onEdit(room);
                onClose();
              }}
            >
              <Icon name="settings" className="size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              label="Đóng"
              className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
              onClick={onClose}
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
                {room.occupancy.occupied}/{room.occupancy.total}
                <span className="ml-1.5 text-xs font-normal text-slate-500">
                  giường
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {`Còn ${remainingSlots} giường sẵn sàng`}
              </div>
            </div>

            <div className="rounded-sm bg-slate-50 p-3.5">
              <div className="text-xs font-medium text-slate-500">
                Đơn giá thuê trọn gói
              </div>
              <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                {money(room.basePrice)}
              </div>
              <div className="mt-1 text-xs text-slate-500">/tháng/giường</div>
            </div>
          </div>

          {/* Danh sách từng vị trí giường */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Danh sách vị trí giường ({room.total} vị trí)
              </h3>
            </div>

            <div className="mt-3 space-y-3">
              {room.occupancy.beds.map((slot) => {
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
                          ) : isOccupied ? (
                            <p className="mt-1 text-xs text-slate-500">Giường đang được sử dụng; chưa có thông tin người thuê.</p>
                          ) : isMaint ? (
                            <p className="mt-1 text-xs text-warning-800">
                              Vị trí giường đang được bảo trì vật tư hoặc hỏng
                              hóc.
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-slate-500">
                              Vị trí trống, sẵn sàng tiếp nhận người thuê mới (
                              {room.gender}).
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
                                  const bedId = room.bedOverrides?.[slot.bedCode]?.id;
                                  if (!bedId) return;
                                  onQuickOnboard(room.id, bedId);
                                  onClose();
                                }}
                              >
                                + Xếp khách
                              </Button>
                            )}
                            <Button
                              className="flex items-center gap-1 rounded-sm border border-warning-300 bg-warning-50 px-2.5 py-1.5 text-xs font-semibold text-warning-700 hover:bg-warning-100 active:translate-y-[1px]"
                              onClick={() =>
                                onToggleMaintenance(
                                  room,
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
                              onToggleMaintenance(
                                room,
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

          {/* Tiện nghi phòng */}
          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Tiện nghi phòng
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.amenities && room.amenities.length > 0 ? (
                room.amenities.map((item, idx) => (
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

          {!isDeletable && (
            <p className="rounded-sm bg-warning-50 p-3 text-xs text-warning-700">
              Phòng đang có khách cư trú nên không thể đưa vào lưu trữ.
            </p>
          )}

          <div className="grid gap-2 border-t border-slate-100 pt-4">
            <Button
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                onClose();
                onEdit(room);
              }}
            >
              Chỉnh sửa phòng
            </Button>
            <Button
              className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!isDeletable}
              onClick={() => {
                onClose();
                onArchive(room);
              }}
            >
              Đưa phòng vào lưu trữ (Soft Delete)
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
