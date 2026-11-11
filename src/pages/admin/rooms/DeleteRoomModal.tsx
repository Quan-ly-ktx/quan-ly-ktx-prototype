import { useState } from "react";
import { Modal } from "../../../components/common/Modal.tsx";
import { Button } from "../../../components/common/Button.tsx";
import type { RoomRecord } from "../../../types/room.ts";

export function DeleteRoomModal({
  room,
  hasHistory = false,
  onClose,
  onConfirm,
  onDeleteMistaken,
}: {
  room: RoomRecord;
  hasHistory?: boolean;
  onClose: () => void;
  onConfirm: (room: RoomRecord) => void;
  onDeleteMistaken?: (room: RoomRecord) => void;
}) {
  const [confirmCode, setConfirmCode] = useState("");
  const [actionType, setActionType] = useState<"archive" | "delete">(hasHistory ? "archive" : "delete");

  return (
    <Modal
      title={actionType === "delete" ? `Xóa vĩnh viễn phòng ${room.code}?` : `Đưa phòng ${room.code} vào lưu trữ?`}
      description={actionType === "delete" ? "Xóa phòng tạo nhầm chưa từng phát sinh hợp đồng hay sự cố. Mã phòng sẽ được giải phóng hoàn toàn." : "Phòng sẽ ngừng hoạt động và ẩn khỏi sơ đồ tầng. Bạn có thể khôi phục lại bất kỳ lúc nào."}
      onClose={onClose}
    >
      <div className="space-y-4 p-5">
        {!hasHistory && onDeleteMistaken ? (
          <div className="flex gap-2 rounded-sm border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
            <button
              type="button"
              className={`flex-1 rounded-sm py-2 transition-all ${actionType === "delete" ? "bg-danger-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={() => setActionType("delete")}
            >
              Xóa phòng tạo nhầm
            </button>
            <button
              type="button"
              className={`flex-1 rounded-sm py-2 transition-all ${actionType === "archive" ? "bg-brand-500 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"}`}
              onClick={() => setActionType("archive")}
            >
              Đưa vào lưu trữ
            </button>
          </div>
        ) : (
          <div className="rounded-sm border border-warning-200 bg-warning-50 p-3 text-xs text-warning-800">
            <span className="font-bold">Lưu ý:</span> Phòng này đã có lịch sử thuê hoặc sự cố kỹ thuật nên không thể xóa vĩnh viễn, chỉ có thể đưa vào lưu trữ để bảo toàn dữ liệu lịch sử.
          </div>
        )}
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
          {actionType === "delete"
            ? "Thao tác này sẽ xóa hoàn toàn phòng và các giường khỏi hệ thống. Mã phòng sẽ sẵn sàng để tạo lại nếu muốn."
            : "Sau khi lưu trữ, phòng sẽ ẩn khỏi sơ đồ tầng và không tiếp nhận khách mới. Bạn có thể xem và khôi phục lại từ danh sách Phòng đã lưu trữ."}
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
          label={actionType === "delete" ? "Xác nhận xóa vĩnh viễn" : "Xác nhận lưu trữ"}
          disabled={confirmCode !== room.code}
          className={`h-10 rounded-sm px-4 text-sm font-semibold text-white disabled:opacity-50 ${actionType === "delete" ? "bg-danger-600 hover:bg-danger-700" : "bg-brand-600 hover:bg-brand-700"}`}
          onClick={() => {
            if (actionType === "delete" && onDeleteMistaken) {
              onDeleteMistaken(room);
            } else {
              onConfirm(room);
            }
          }}
        >
          {actionType === "delete" ? "Xác nhận xóa vĩnh viễn" : "Xác nhận lưu trữ"}
        </Button>
      </div>
    </Modal>
  );
}
