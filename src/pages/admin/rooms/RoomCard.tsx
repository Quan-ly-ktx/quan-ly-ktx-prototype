import { Button } from "../../../components/common/Button.tsx";
import { Icon } from "../../../components/common/Icon.tsx";
import { money } from "../../../utils/formatters.ts";
import type { RoomRecord } from "../../../types/room.ts";
import type { RoomOccupancySummary } from "../../../utils/roomCalculations.ts";

export function RoomCard({
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
