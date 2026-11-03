import { useState } from "react";
import { Button, Icon, PriorityTag } from "../../components/common/index.ts";
import { money } from "../../data.ts";
import type { Ticket } from "../../types/index.ts";
import { statusStyle, where } from "./technicianConstants.ts";

export function TicketDetailPage({
  ticket,
  onBack,
  onStart,
  onComplete,
}: {
  ticket: Ticket;
  onBack: () => void;
  onStart: () => void;
  onComplete: (patch: Partial<Ticket>) => void;
}) {
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");
  const [afterPhoto, setAfterPhoto] = useState(false);

  const steps = ["Tiếp nhận", "Kiểm tra", "Hoàn thành"];
  const stepIndex =
    ticket.status === "Mới giao" ? 0 : ticket.status === "Đang xử lý" ? 1 : 3;
  const ready = note.trim().length >= 10 && afterPhoto;

  return (
    <article className="flex flex-1 flex-col pb-28">
      <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
        <Button
          label="Quay lại"
          className="grid size-9 place-items-center rounded-sm text-slate-800 hover:bg-slate-100"
          onClick={onBack}
        >
          <Icon name="chevron" className="size-6 rotate-180" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-slate-500">{ticket.id}</div>
          <div className="truncate text-sm font-bold text-slate-900">
            Chi tiết công việc
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityTag priority={ticket.priority} size="lg" />
            <span
              className={`status-label ml-auto ${statusStyle[ticket.status]}`}
            >
              {ticket.status}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span className="rounded-sm bg-slate-900 px-2 py-0.5 font-mono text-xs font-medium text-white">
              {where(ticket)}
            </span>
            <span className="font-mono text-slate-500">{ticket.id}</span>
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-slate-950">
            {ticket.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {ticket.description}
          </p>

          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-2.5">
              <span className="grid size-8 place-items-center rounded-sm bg-white font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                {ticket.reporter
                  .split(" ")
                  .slice(-2)
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {ticket.reporter}
                </div>
                <div className="font-mono text-xs text-slate-500">
                  {ticket.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-2.5">
              <span className="icon-box icon-box-warning size-10">
                <Icon name="clock" className="size-5" />
              </span>
              <div>
                <div className="text-xs text-slate-500">Hạn xử lý</div>
                <div className="text-sm font-semibold text-slate-800">
                  {ticket.deadline}
                </div>
              </div>
            </div>
          </div>

          {ticket.hasPhoto && (
            <div className="mt-3 flex h-32 items-end overflow-hidden rounded-sm border border-slate-200 bg-slate-100 p-3">
              <span className="flex items-center gap-1.5 rounded-sm bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs">
                <Icon name="image" className="size-4" />
                Ảnh người thuê đính kèm
              </span>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const done = index < stepIndex;
              const current = index === stepIndex;
              return (
                <li
                  className="flex flex-1 items-center last:flex-none"
                  key={step}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`grid size-7 place-items-center rounded-sm font-mono text-xs font-bold ${
                        done
                          ? "bg-success-500 text-white"
                          : current
                            ? "bg-brand-500 text-white ring-2 ring-brand-100"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? (
                        <Icon name="check" className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        done || current ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <span
                      className={`mx-2 mb-5 h-0.5 flex-1 rounded ${
                        done ? "bg-success-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {ticket.status === "Đang xử lý" && (
          <form
            className="space-y-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs"
            onSubmit={(event) => {
              event.preventDefault();
              if (ready)
                onComplete({
                  resolution: note.trim(),
                  cost: Number(cost) || 0,
                });
            }}
          >
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-950">
                Kết quả xử lý
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Nhập kết quả và ảnh sau sửa chữa để xác nhận đã xử lý xong.
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                Mô tả kết quả
              </span>
              <textarea
                className="focus-ring min-h-24 w-full resize-none rounded-sm border border-slate-200 p-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
                onChange={(event) => setNote(event.target.value)}
                placeholder="VD: Đã thay gioăng ống cấp nước, siết lại khớp nối, thử áp lực 10 phút không rò."
                value={note}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                Chi phí vật tư (nếu có)
              </span>
              <span className="relative block">
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 pl-3 pr-10 font-mono text-sm outline-none focus:border-brand-500"
                  inputMode="numeric"
                  onChange={(event) =>
                    setCost(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  value={cost}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  đ
                </span>
              </span>
            </label>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">
                Ảnh sau sửa chữa
              </div>
              <Button
                className={`flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed text-xs font-medium ${
                  afterPhoto
                    ? "border-success-500 bg-success-50 text-success-600"
                    : "border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-600"
                }`}
                onClick={() => setAfterPhoto(!afterPhoto)}
              >
                <Icon
                  name={afterPhoto ? "check" : "camera"}
                  className="size-7"
                />
                {afterPhoto
                  ? "Đã chụp 1 ảnh · bấm để chụp lại"
                  : "Chụp ảnh sau khi sửa"}
              </Button>
            </div>

            <button
              className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px] disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!ready}
              type="submit"
            >
              <Icon name="check" className="size-5" />
              Xác nhận đã xử lý xong
            </button>
            {!ready && (
              <p className="text-center text-xs text-slate-500">
                Cần nhập kết quả (≥10 ký tự) và chụp ảnh sau khi sửa.
              </p>
            )}
          </form>
        )}

        {ticket.status === "Hoàn thành" && (
          <div className="rounded-sm border border-success-200 bg-success-50 p-4">
            <div className="flex items-center gap-2 font-heading text-base font-bold text-success-600">
              <Icon name="check" className="size-5" />
              Đã hoàn thành
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {ticket.resolution}
            </p>
            <div className="mt-3 flex justify-between border-t border-success-100 pt-3 text-sm">
              <span className="text-slate-500">Chi phí vật tư</span>
              <span className="font-bold text-slate-900">
                {money(ticket.cost ?? 0)}
              </span>
            </div>
          </div>
        )}
      </div>
      {ticket.status === "Mới giao" && (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Button
            className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={onStart}
          >
            <Icon name="play" className="size-5" />
            Nhận việc
          </Button>
        </div>
      )}
    </article>
  );
}
