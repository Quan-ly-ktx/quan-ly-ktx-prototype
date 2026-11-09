import { useContext, useState } from "react";
import type React from "react";
import { Button, Icon, PriorityPicker, PriorityTag } from "../../components/common/index.ts";
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
                  <li className="p-5" key={ticket.id}>
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
                      <p className="mt-2.5 rounded-sm bg-success-50 p-2.5 text-xs leading-5 text-success-700 border border-success-100">
                        {ticket.resolution}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
