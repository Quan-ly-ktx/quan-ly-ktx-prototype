import { Icon } from "../../../components/common/Icon.tsx";
import { RoomCard } from "./RoomCard.tsx";
import type { RoomRecord } from "../../../types/room.ts";
import type { RoomOccupancySummary } from "../../../utils/roomCalculations.ts";

export function RoomMatrixView({
  filteredRooms,
  availableFloors,
  floor,
  onSelectRoom,
  onQuickOnboard,
}: {
  filteredRooms: (RoomRecord & { occupancy: RoomOccupancySummary })[];
  availableFloors: number[];
  floor: string;
  onSelectRoom: (room: RoomRecord) => void;
  onQuickOnboard?: (roomCode: string, bedCode: string) => void;
}) {
  if (filteredRooms.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-slate-200 bg-white p-12 text-center">
        <Icon name="building" className="mx-auto size-10 text-slate-300" />
        <h3 className="mt-3 text-sm font-semibold text-slate-800">
          Không tìm thấy phòng nào phù hợp
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Thử thay đổi bộ lọc tầng, giới tính hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  if (floor === "Tất cả") {
    return (
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
                    onSelect={() => onSelectRoom(room)}
                    onQuickOnboard={onQuickOnboard}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {filteredRooms.map((room) => (
        <RoomCard
          key={room.code}
          room={room}
          onSelect={() => onSelectRoom(room)}
          onQuickOnboard={onQuickOnboard}
        />
      ))}
    </div>
  );
}
