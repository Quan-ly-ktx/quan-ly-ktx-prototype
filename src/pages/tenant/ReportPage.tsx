import { useContext, useState } from "react";
import type React from "react";
import { Button, Drawer, Icon, Modal, PriorityPicker, PriorityTag } from "../../components/common/index.ts";
import type { Priority, Ticket } from "../../types/incident.ts";
import { TenantCtx, ticketTone } from "./tenantConstants.tsx";
import { readIncidentImage } from "../../services/mock/incidentImages.ts";

const categories = ["Điện", "Nước", "Internet", "Nội thất", "Tiện ích", "Khác"];

export function ReportPage({
  myTickets,
  onCreate,
  showToast,
  tenantId,
  resident = false,
  roomId,
  bedId,
}: {
  myTickets: Ticket[];
  onCreate: (ticket: Ticket) => Promise<unknown>;
  showToast: (m: string) => void;
  tenantId?: string;
  resident?: boolean;
  roomId?: string;
  bedId?: string;
}) {
  const TENANT = useContext(TenantCtx);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Điện");
  const [location, setLocation] = useState("Tại giường ngủ cá nhân");
  const [priority, setPriority] = useState<Priority>("Bình thường");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const valid = title.trim().length >= 3 && description.trim().length >= 10;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || !tenantId || !roomId || !resident || !photo || pending) return;
    setPending(true);
    try {
      const scenePhoto = await readIncidentImage(photo);
      await onCreate({
        id: `SC-${crypto.randomUUID()}`,
        roomId,
        bedId: location === "Tại giường ngủ cá nhân" ? bedId : undefined,
        reporterTenantId: tenantId,
        room: TENANT.room,
        bed: location === "Tại giường ngủ cá nhân" ? TENANT.bed : undefined,
        title: title.trim(), description: `${location}: ${description.trim()}`,
        category, priority, status: "Chưa phân công", reporter: TENANT.name,
        phone: TENANT.phone, createdAt: new Date().toISOString(), deadline: "",
        hasPhoto: true, scenePhoto,
      });
      setTitle(""); setDescription(""); setPhoto(null);
      showToast("Đã gửi phiếu báo hỏng.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể gửi phiếu báo hỏng.");
    } finally {
      setPending(false);
    }
  };

  const personalTickets = tenantId ? myTickets.filter((ticket) => ticket.reporterTenantId === tenantId) : [];


  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">
          Báo hỏng vật tư
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gửi mô tả và hình ảnh để kỹ thuật viên xử lý nhanh nhất.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <form
          className="space-y-6 rounded-sm border border-slate-200 bg-white p-6 shadow-xs lg:col-span-3"
          onSubmit={submit}
        >
          <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-3 text-xs text-slate-600">
            <Icon name="bed" className="size-5 text-slate-400" />
            <span>
              Phiếu gắn với phòng{" "}
              <span className="font-mono font-medium text-slate-900">
                {TENANT.room}
              </span>{" "}
              · giường{" "}
              <span className="font-mono font-medium text-slate-900">
                {TENANT.bed}
              </span>
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-800">
              Tiêu đề
            </span>
            <input
              className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-base sm:text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500"
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Quạt trần phát ra tiếng kêu"
              value={title}
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-800">
              Loại sự cố
            </legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${
                    category === item
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-1.5 text-xs font-semibold text-slate-800">
            Vị trí hỏng hóc cụ thể
            <select
              className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-base sm:text-sm font-normal outline-none focus:border-brand-500"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>Tại giường ngủ cá nhân</option>
              <option>Khu vực vệ sinh trong phòng</option>
              <option>Khu vực ban công</option>
              <option>Thiết bị điện tử chung</option>
            </select>
          </label>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-800">
              Mức độ ưu tiên
            </legend>
            <PriorityPicker value={priority} onChange={setPriority} />
          </fieldset>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-semibold text-slate-800">
              Mô tả sự cố
              <span
                className={`text-xs font-medium ${
                  valid ? "text-success-600" : "text-slate-400"
                }`}
              >
                {description.trim().length}/10 ký tự tối thiểu
              </span>
            </span>
            <textarea
              className="focus-ring min-h-28 w-full resize-none rounded-sm border border-slate-200 p-3 text-base sm:text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="VD: Quạt trần phát ra tiếng kêu to khi chạy tốc độ 2 và 3..."
              value={description}
            />
          </label>
          <label className="block text-sm font-semibold">Ảnh hiện trường
            <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
          </label>
          {!resident && <p className="text-sm text-warning-800">Chỉ người đang cư trú được báo hỏng.</p>}
          {!tenantId && <p className="text-sm text-warning-800">Không xác định được người báo.</p>}

          <button
            className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:translate-y-[1px] disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!valid || !photo || !resident || !tenantId || pending}
            type="submit"
          >
            <Icon name="send" className="size-4" />
            Gửi phiếu báo hỏng
          </button>
        </form>

        <aside className="lg:col-span-2">
          <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Phiếu của tôi
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Các phiếu do bạn gửi.
              </p>
            </div>
            <ul className="divide-y divide-slate-100">
              {personalTickets.map((ticket) => {
                const tone = ticketTone[ticket.status];
                return (
                  <li
                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer"
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-500">
                        {ticket.id}
                      </span>
                      <span className={`status-label ${tone.cls}`}>
                        {tone.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="text-sm font-bold text-slate-900">
                        {ticket.title}
                      </div>
                      <PriorityTag priority={ticket.priority} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{ticket.category}</span>
                      <span>·</span>
                      <span>{ticket.createdAt}</span>
                    </div>
                    {ticket.resolution && (
                      <p className="mt-2.5 rounded-sm bg-success-50 p-2.5 text-xs leading-5 text-success-700 border border-success-100 line-clamp-2">
                        {ticket.resolution}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-brand-600 font-medium">Bấm xem chi tiết</span>
                      {ticket.scenePhoto && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Icon name="image" className="size-3" /> Có ảnh
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
              {personalTickets.length === 0 && (
                <li className="p-8 text-center text-xs text-slate-500">
                  Bạn chưa gửi phiếu báo hỏng nào.
                </li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <Drawer
          title={selectedTicket.title}
          subtitle={`${selectedTicket.id} · Phòng ${selectedTicket.room}${selectedTicket.bed ? ` · Giường ${selectedTicket.bed}` : ""}`}
          onClose={() => setSelectedTicket(null)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`status-label ${ticketTone[selectedTicket.status].cls}`}>
              {ticketTone[selectedTicket.status].label}
            </span>
            <PriorityTag priority={selectedTicket.priority} />
          </div>

          <div className="mt-4 rounded-sm bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed border border-slate-200">
            <p className="font-semibold text-slate-900 mb-1">Mô tả sự cố:</p>
            <p>{selectedTicket.description}</p>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 rounded-sm border border-slate-200 text-xs">
            {[
              ["Vị trí", `Phòng ${selectedTicket.room}${selectedTicket.bed ? ` · Giường ${selectedTicket.bed}` : ""}`],
              ["Hạng mục", selectedTicket.category],
              ["Thời gian báo", selectedTicket.createdAt],
              ["Kỹ thuật viên phụ trách", selectedTicket.assignee || "Đang chờ phân công"],
              ["Hạn dự kiến", selectedTicket.deadline || "Đang cập nhật"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-3 py-2.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Scene Photo */}
          <div className="mt-4 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ảnh hiện trường đã gửi
              </h4>
              {selectedTicket.scenePhoto && (
                <span className="text-[11px] text-brand-600 font-medium">Bấm để phóng to</span>
              )}
            </div>
            {selectedTicket.scenePhoto ? (
              <button
                type="button"
                className="group relative block w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100 hover:border-brand-500 transition-colors"
                onClick={() =>
                  setPreviewPhoto({
                    url: selectedTicket.scenePhoto!,
                    title: `Ảnh hiện trường: ${selectedTicket.title} (${selectedTicket.id})`,
                  })
                }
              >
                <img
                  src={selectedTicket.scenePhoto}
                  alt="Ảnh hiện trường"
                  className="max-h-48 w-full object-contain mx-auto transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                  Xem ảnh lớn
                </div>
              </button>
            ) : (
              <p className="text-xs text-slate-400 italic">Không có ảnh hiện trường đính kèm.</p>
            )}
          </div>

          {/* Acceptance / Resolution Section */}
          <div className="mt-4 rounded-sm border border-success-200 bg-success-50/30 p-3.5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-success-800 mb-2">
              Kết quả sửa chữa & Nghiệm thu
            </h4>
            {selectedTicket.resolution ? (
              <div className="rounded-sm bg-white p-3 border border-success-100 text-xs text-slate-800 leading-relaxed font-medium">
                {selectedTicket.resolution}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {selectedTicket.status === "Hoàn thành"
                  ? "Đã hoàn thành sửa chữa."
                  : "Kỹ thuật viên đang xử lý. Chưa có báo cáo nghiệm thu hoàn thành."}
              </p>
            )}
            {selectedTicket.completedAt && (
              <p className="mt-2 text-[11px] text-slate-500">
                Thời điểm hoàn thành:{" "}
                <span className="font-mono text-slate-700">
                  {new Date(selectedTicket.completedAt).toLocaleString("vi-VN")}
                </span>
              </p>
            )}

            {/* Completion Photo */}
            <div className="mt-3 pt-3 border-t border-success-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Ảnh nghiệm thu hoàn thành:</span>
                {selectedTicket.completionPhoto && (
                  <span className="text-[11px] text-brand-600 font-medium">Bấm để phóng to</span>
                )}
              </div>
              {selectedTicket.completionPhoto ? (
                <button
                  type="button"
                  className="group relative block w-full overflow-hidden rounded-sm border border-slate-200 bg-white hover:border-brand-500 transition-colors"
                  onClick={() =>
                    setPreviewPhoto({
                      url: selectedTicket.completionPhoto!,
                      title: `Ảnh nghiệm thu: ${selectedTicket.title} (${selectedTicket.id})`,
                    })
                  }
                >
                  <img
                    src={selectedTicket.completionPhoto}
                    alt="Ảnh nghiệm thu"
                    className="max-h-48 w-full object-contain mx-auto transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Xem ảnh lớn
                  </div>
                </button>
              ) : selectedTicket.status === "Hoàn thành" ? (
                <p className="text-xs text-slate-400 italic">Không có ảnh nghiệm thu sau hoàn thành.</p>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa nghiệm thu.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button
              label="Đóng"
              className="h-10 w-full rounded-sm border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setSelectedTicket(null)}
            >
              Đóng chi tiết
            </Button>
          </div>
        </Drawer>
      )}

      {/* Large Image Preview Modal */}
      {previewPhoto && (
        <Modal
          title={previewPhoto.title}
          onClose={() => setPreviewPhoto(null)}
          wide
        >
          <div className="p-6 text-center">
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[70vh] mx-auto rounded-sm border border-slate-200 object-contain shadow-xs"
            />
            <div className="mt-4 flex justify-center">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setPreviewPhoto(null)}
              >
                Đóng xem ảnh
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
