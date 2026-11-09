import { Button } from "../../../components/common/Button.tsx";
import { useDormData } from "../../../hooks/useDormData.ts";
import { money } from "../../../utils/formatters.ts";
import type { RoomRecord, TenantRecord } from "../../../types/index.ts";
import { canDeleteRoom, getRoomOccupancy } from "../../../utils/roomCalculations.ts";

export function RoomTableView({
  filteredRooms,
  activeRooms,
  tenants,
  onSelectRoom,
  onEditRoom,
  onDeleteRoom,
}: {
  filteredRooms: RoomRecord[];
  activeRooms: RoomRecord[];
  tenants: TenantRecord[];
  onSelectRoom: (room: RoomRecord) => void;
  onEditRoom: (room: RoomRecord) => void;
  onDeleteRoom: (room: RoomRecord) => void;
}) {
  const { contracts } = useDormData();
  return (
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
              const occ = getRoomOccupancy(room, tenants, contracts);
              const isDeletable = canDeleteRoom(room.id, contracts) && occ.occupied === 0;
              const maintCount = occ.beds.filter(
                (b) => b.status === "MAINTENANCE",
              ).length;
              const vacantCount = occ.available;

              return (
                <tr
                  className="cursor-pointer hover:bg-slate-50"
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
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
                        onClick={() => onEditRoom(room)}
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
                        onClick={() => onDeleteRoom(room)}
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
          Hiển thị {filteredRooms.length} trên tổng số {activeRooms.length} phòng hoạt động
        </span>
      </div>
    </section>
  );
}
