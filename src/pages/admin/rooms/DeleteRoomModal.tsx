import { useState } from "react";
import { Modal } from "../../../components/common/Modal.tsx";
import { Button } from "../../../components/common/Button.tsx";
import type { RoomRecord } from "../../../types/room.ts";

export function DeleteRoomModal({
  room,
  onClose,
  onConfirm,
}: {
  room: RoomRecord;
  onClose: () => void;
  onConfirm: (room: RoomRecord) => void;
}) {
  const [confirmCode, setConfirmCode] = useState("");

  return (
    <Modal
      title={`Đưa phòng ${room.code} vào lưu trữ?`}
      description="Phòng sẽ ngừng hoạt động và ẩn khỏi sơ đồ (Soft Delete). Toàn bộ dữ liệu lịch sử hợp đồng và hóa đơn cũ vẫn được bảo lưu 100% để đối soát."
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        <div className="rounded-sm border border-danger-200 bg-danger-50 p-3.5 text-xs text-danger-700">
          <span className="font-bold">Lưu ý quan trọng:</span> Sau khi lưu trữ,
          phòng này sẽ biến mất khỏi sơ đồ tầng và không thể tiếp nhận người thuê
          mới. Bạn có thể khôi phục lại bất kỳ lúc nào trong danh sách lưu trữ.
        </div>

        <p className="text-sm text-slate-600">
          Để xác nhận, vui lòng nhập chính xác mã phòng:{" "}
          <span className="font-mono font-bold text-slate-900">{room.code}</span>
        </p>

        <input
          type="text"
          placeholder={`Nhập ${room.code}`}
          value={confirmCode}
          onChange={(e) => setConfirmCode(e.target.value)}
          className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 font-mono text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
        <Button
          label="Hủy thao tác"
          className="h-10 rounded-sm border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          label="Xác nhận lưu trữ"
          disabled={confirmCode !== room.code}
          className="h-10 rounded-sm bg-danger-500 px-4 text-sm font-semibold text-white hover:bg-danger-600 disabled:opacity-50"
          onClick={() => onConfirm(room)}
        >
          Xác nhận lưu trữ
        </Button>
      </div>
    </Modal>
  );
}
