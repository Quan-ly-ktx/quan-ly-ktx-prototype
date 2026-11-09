import { useState } from "react";
import { Button, Icon, PriorityTag } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import type { Ticket } from "../../types/index.ts";
import { readIncidentImage } from "../../services/mock/incidentImages.ts";
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
  const [parts, setParts] = useState<{ name: string; quantity: string; unitPrice: string }[]>([]);
  const total = parts.reduce((sum, part) => sum + Number(part.quantity || 0) * Number(part.unitPrice || 0), 0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = ["Tiếp nhận", "Kiểm tra", "Hoàn thành"];
  const stepIndex =
    ticket.status === "Mới giao" ? 0 : ticket.status === "Đang xử lý" ? 1 : 3;

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

          {ticket.scenePhoto && <img src={ticket.scenePhoto} alt="Ảnh hiện trường" className="mt-3 max-h-64 rounded-sm object-contain" />}
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
          <div className="flex items-center gap-2.5 rounded-sm border border-brand-200 bg-brand-50 p-3 text-xs text-brand-900">
            <Icon name="tools" className="size-4 shrink-0 text-brand-600" />
            <span>
              <b>Đã tiếp nhận:</b> Phiếu đang trong quá trình xử lý. Sau khi hoàn thành kiểm tra sửa chữa, hãy nhập kết quả và chi phí phụ tùng bên dưới.
            </span>
          </div>
        )}
        {ticket.status === "Đang xử lý" && (
          <form
            className="space-y-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!note.trim() || !photo || pending) {
                setErrorMsg("Vui lòng nhập kết quả và chọn ảnh nghiệm thu."); return;
              }
              const lines = parts.map((part) => ({ name: part.name.trim(), quantity: Number(part.quantity), unitCost: Number(part.unitPrice) }));
              if (lines.some((part, index) => !part.name || !parts[index].quantity || !parts[index].unitPrice || !Number.isSafeInteger(part.quantity) || part.quantity <= 0 || !Number.isSafeInteger(part.unitCost) || part.unitCost < 0 || !Number.isSafeInteger(part.quantity * part.unitCost)) || !Number.isSafeInteger(total)) {
                setErrorMsg("Vật tư cần tên, số lượng nguyên dương và đơn giá nguyên không âm."); return;
              }
              setPending(true);
              try {
                const completionPhoto = await readIncidentImage(photo);
                await onComplete({ resolution: note.trim(), completionPhoto, parts: lines, cost: total, completedAt: new Date().toISOString() });
              } catch (error) {
                setErrorMsg(error instanceof Error ? error.message : "Không thể hoàn thành phiếu.");
              } finally { setPending(false); }
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

            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-semibold text-slate-800">Vật tư thực dùng</legend>
              {parts.map((part, index) => (
                <div key={index} className="grid gap-2 rounded-sm border border-slate-200 p-3">
                  <label className="text-xs">Tên vật tư
                    <input className="mt-1 block h-10 w-full rounded-sm border border-slate-200 px-3 text-sm" value={part.name} onChange={(event) => setParts(parts.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
                  </label>
                  <label className="text-xs">Số lượng
                    <input type="number" min="1" step="1" className="mt-1 block h-10 w-full rounded-sm border border-slate-200 px-3 text-sm" value={part.quantity} onChange={(event) => setParts(parts.map((item, i) => i === index ? { ...item, quantity: event.target.value } : item))} />
                  </label>
                  <label className="text-xs">Đơn giá (đ)
                    <input type="number" min="0" step="1" className="mt-1 block h-10 w-full rounded-sm border border-slate-200 px-3 text-sm" value={part.unitPrice} onChange={(event) => setParts(parts.map((item, i) => i === index ? { ...item, unitPrice: event.target.value } : item))} />
                  </label>
                  <span className="text-sm font-semibold tabular-nums">Thành tiền: {money(Number(part.quantity || 0) * Number(part.unitPrice || 0))}</span>
                  <button type="button" className="text-left text-sm text-danger-600" onClick={() => setParts(parts.filter((_, i) => i !== index))}>Xóa vật tư</button>
                </div>
              ))}
              <button type="button" className="text-sm font-semibold text-brand-600" onClick={() => setParts([...parts, { name: "", quantity: "", unitPrice: "" }])}>Thêm vật tư</button>
              <p className="text-sm font-bold tabular-nums text-slate-900">Tổng vật tư: {money(total)}</p>
            </fieldset>
            <label className="block text-sm font-semibold">Ảnh nghiệm thu
              <input type="file" accept="image/*" className="mt-2 block w-full text-sm" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
            </label>

            {errorMsg && (
              <div className="rounded-sm border border-danger-200 bg-danger-50 p-2.5 text-xs text-danger-700">
                {errorMsg}
              </div>
            )}
            <button
              className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
              disabled={pending}
              type="submit"
            >
              <Icon name="check" className="size-5" />
              Xác nhận đã xử lý xong
            </button>
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
            {ticket.completionPhoto && <img src={ticket.completionPhoto} alt="Ảnh nghiệm thu" className="mt-3 max-h-64 rounded-sm object-contain" />}
            {ticket.parts?.map((part, index) => <p key={index} className="mt-1 text-sm">{part.name} · {part.quantity} × {money(part.unitCost)}</p>)}
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
            Bắt đầu xử lý
          </Button>
        </div>
      )}
    </article>
  );
}
