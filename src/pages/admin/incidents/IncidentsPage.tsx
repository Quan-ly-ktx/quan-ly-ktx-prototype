import { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  PriorityPicker,
  PriorityTag,
  ViolationFields,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { TECHNICIANS } from "../../../services/mock/mockData.ts";
import type { Priority, Ticket } from "../../../types/index.ts";
import { card, th, rowCls, inputCls, Badge, type Toast } from "../common.tsx";
import { technicianService } from "../../../services/technicianService.ts";

type Violation = {
  id: string;
  tenant: string;
  room: string;
  type: string;
  note: string;
  date: string;
  level: string;
  fine?: number;
};

const initialViolations: Violation[] = [
  {
    id: "KL-0231",
    tenant: "Hồ Minh Khoa",
    room: "P.312",
    type: "Về muộn",
    note: "Về lúc 00:40, quá giờ đóng cổng 23:30 (lần 3 trong tháng).",
    date: "05/10/2026",
    level: "Phạt tiền",
    fine: 100000,
  },
  {
    id: "KL-0230",
    tenant: "Phạm Đức Anh",
    room: "P.103",
    type: "Gây ồn",
    note: "Mở loa lớn sau 22:00, phòng bên phản ánh.",
    date: "03/10/2026",
    level: "Cảnh cáo",
  },
  {
    id: "KL-0229",
    tenant: "Bùi Khánh Linh",
    room: "P.210",
    type: "Vệ sinh",
    note: "Để rác ngoài hành lang qua đêm.",
    date: "29/09/2026",
    level: "Nhắc nhở",
  },
  {
    id: "KL-0227",
    tenant: "Võ Thị Mai",
    room: "P.108",
    type: "Khách ngoài",
    note: "Đưa người ngoài vào phòng không đăng ký.",
    date: "24/09/2026",
    level: "Cảnh cáo",
  },
];

const lvlTone = (l: Violation["level"]) =>
  l === "Phạt tiền" ? "danger" : l === "Cảnh cáo" ? "warning" : "slate";
const parseDeadlineToDateInput = (d?: string): string => {
  if (!d) return new Date().toISOString().split("T")[0];
  const parts = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (parts) {
    const [, day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  return new Date().toISOString().split("T")[0];
};

const formatDateInputToDisplay = (d: string): string => {
  if (!d) return "";
  const [year, month, day] = d.split("-");
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return d;
};


export function IncidentsPage({
  tickets,
  onAssign,
  showToast,
}: Toast & {
  tickets: Ticket[];
  onAssign: (id: string, tech?: string, priority?: Priority, deadline?: string) => void;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [dispatchTech, setDispatchTech] = useState("");
  const [dispatchPriority, setDispatchPriority] = useState<Priority>("Bình thường");
  const [dispatchDeadline, setDispatchDeadline] = useState("");
  const [activeTechnicians, setActiveTechnicians] = useState<string[]>([]);

  useEffect(() => {
    technicianService
      .getTechnicians({ active: true })
      .then((res) => {
        const items = Array.isArray(res) ? res : res.items || [];
        const names = items.filter((t) => t.active).map((t) => t.fullName);
        setActiveTechnicians(names.length > 0 ? names : [TECHNICIANS[0]]);
      })
      .catch(() => {
        setActiveTechnicians([TECHNICIANS[0]]);
      });
  }, []);
  const [viol, setViol] = useState<Violation | null>(null);
  const [tab, setTab] = useState<"repair" | "discipline">("repair");
  const [violations, setViolations] = useState(initialViolations);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    tenant: "",
    room: "",
    type: "Về muộn",
    level: "Nhắc nhở",
    fine: "",
    note: "",
  });

  const stTone = (s: Ticket["status"]) =>
    s === "Hoàn thành"
      ? "success"
      : s === "Đang xử lý"
        ? "brand"
        : s === "Mới giao"
          ? "warning"
          : "slate";

  const submit = () => {
    if (!form.tenant.trim() || !form.room.trim()) {
      showToast("Vui lòng nhập người thuê và phòng");
      return;
    }
    if (!form.type.trim() || !form.level.trim()) {
      showToast("Vui lòng chọn loại vi phạm và hình thức xử lý");
      return;
    }
    const isFine = form.level.trim().toLowerCase() === "phạt tiền";
    if (isFine && Number(form.fine) <= 0) {
      showToast("Vui lòng nhập số tiền phạt");
      return;
    }
    setViolations([
      {
        id: `KL-0${232 + violations.length - 4}`,
        tenant: form.tenant,
        room: form.room,
        type: form.type,
        note: form.note || "—",
        date: "06/10/2026",
        level: form.level,
        fine: isFine ? Number(form.fine) : undefined,
      },
      ...violations,
    ]);
    setOpen(false);
    setForm({
      tenant: "",
      room: "",
      type: "Về muộn",
      level: "Nhắc nhở",
      fine: "",
      note: "",
    });
    showToast("Đã ghi nhận vi phạm");
  };

  return (
    <>
      <PageHeader
        eyebrow="Sự cố & kỷ luật"
        title="Sự cố & kỷ luật"
        description="Theo dõi phiếu sửa chữa do người thuê báo và hồ sơ vi phạm nội quy."
        actions={
          tab === "discipline" ? (
            <Button
              label="Ghi nhận vi phạm"
              className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => setOpen(true)}
            >
              Ghi nhận vi phạm
            </Button>
          ) : undefined
        }
      />
      <div className="mb-6 inline-flex rounded-sm border border-slate-200 bg-white p-1 shadow-xs">
        {(
          [
            [
              "repair",
              "Sự cố sửa chữa",
              tickets.filter((t) => t.status !== "Hoàn thành").length,
            ],
            ["discipline", "Hồ sơ vi phạm", violations.length],
          ] as const
        ).map(([k, l, c]) => (
          <Button
            key={k}
            label={l}
            className={`h-9 rounded-sm px-3.5 text-sm font-semibold ${
              tab === k
                ? "bg-brand-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setTab(k)}
          >
            {l}{" "}
            <span
              className={`ml-2 rounded-sm px-1.5 font-mono text-xs ${
                tab === k ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {c}
            </span>
          </Button>
        ))}
      </div>

      {tab === "repair" ? (
        <section className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã phiếu</th>
                <th className={th}>Sự cố</th>
                <th className={th}>Ưu tiên</th>
                <th className={th}>Người báo</th>
                <th className={th}>Kỹ thuật viên</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => {
                    setTicket(t);
                    setDispatchTech(t.assignee || activeTechnicians[0] || TECHNICIANS[0]);
                    setDispatchPriority(t.priority);
                    setDispatchDeadline(parseDeadlineToDateInput(t.deadline));
                  }}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {t.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.title}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {t.room} · {t.createdAt}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityTag priority={t.priority} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.reporter}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.assignee ?? (
                      <span className="text-warning-600">Chưa phân công</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={stTone(t.status)}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Loại vi phạm</th>
                <th className={th}>Ngày</th>
                <th className={th}>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr
                  key={v.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setViol(v)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {v.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {v.tenant}
                    </p>
                    <p className="font-mono text-xs text-slate-500">{v.room}</p>
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {v.type}
                    </p>
                    <p className="text-xs text-slate-500">{v.note}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{v.date}</td>
                  <td className="px-6 py-4">
                    <Badge tone={lvlTone(v.level)}>
                      {v.level}
                      {v.fine ? ` · ${money(v.fine)}` : ""}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {ticket && (
        <Drawer
          title={ticket.title}
          subtitle={`${ticket.id} · ${ticket.room}`}
          onClose={() => setTicket(null)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={stTone(ticket.status)}>{ticket.status}</Badge>
            <PriorityTag priority={ticket.priority} />
          </div>
          <p className="mt-5 rounded-sm bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {ticket.description}
          </p>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Người báo", `${ticket.reporter} · ${ticket.phone}`],
              ["Hạng mục", ticket.category],
              ["Thời gian báo", ticket.createdAt],
              ["Hạn xử lý", ticket.deadline],
              ["Kỹ thuật viên", ticket.assignee ?? "Chưa phân công"],
              ...(ticket.resolution
                ? [
                    ["Kết quả", ticket.resolution],
                    ["Chi phí", money(ticket.cost ?? 0)],
                  ]
                : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          {ticket.status !== "Hoàn thành" && (
            <div className="mt-6 rounded-sm border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Giao việc cho kỹ thuật viên
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Chỉ định thợ phụ trách, cập nhật mức độ ưu tiên và đặt hạn hoàn thành (FR-18).
              </p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Cấp độ ưu tiên
                  </span>
                  <PriorityPicker
                    value={dispatchPriority}
                    onChange={setDispatchPriority}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Kỹ thuật viên phụ trách
                  </span>
                  <select
                    className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    value={dispatchTech}
                    onChange={(e) => setDispatchTech(e.target.value)}
                  >
                    {activeTechnicians.map((n) => (
                       <option key={n} value={n}>
                         {n}
                       </option>
                     ))}
                   </select>
                 </label>

                 <label className="block">
                   <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Hạn hoàn thành (Ngày chót)
                  </span>
                  <input
                    type="date"
                    className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-500"
                    min={new Date().toISOString().split("T")[0]}
                    value={dispatchDeadline}
                    onChange={(e) => setDispatchDeadline(e.target.value)}
                    required
                  />
                </label>

                 <Button
                   label="Xác nhận giao việc"
                   className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                   onClick={() => {
                    const finalDeadline = formatDateInputToDisplay(dispatchDeadline);
                    const nextStatus = "Mới giao" as const;
                    onAssign(ticket.id, dispatchTech, dispatchPriority, finalDeadline);
                    setTicket({
                      ...ticket,
                      assignee: dispatchTech,
                      priority: dispatchPriority,
                      deadline: finalDeadline,
                      status: nextStatus,
                    });
                    showToast(`Đã giao việc ${ticket.id} cho ${dispatchTech} (Hạn: ${finalDeadline})`);
                   }}
                 >
                   <Icon name="check" className="size-4" />
                   Giao việc cho kỹ thuật viên
                 </Button>
               </div>
             </div>
           )}
        </Drawer>
      )}

      {viol && (
        <Drawer
          title={viol.tenant}
          subtitle={`${viol.id} · ${viol.room}`}
          onClose={() => setViol(null)}
        >
          <Badge tone={lvlTone(viol.level)}>
            {viol.level}
            {viol.fine ? ` · ${money(viol.fine)}` : ""}
          </Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Loại vi phạm", viol.type],
              ["Ngày lập", viol.date],
              ["Người lập", "Thu Lan · Quản lý"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-sm bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {viol.note}
          </p>
          <div className="mt-6 grid gap-2">
            <Button
              label="In biên bản"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => showToast(`Đã xuất biên bản ${viol.id}`)}
            >
              In biên bản
            </Button>
            <Button
              label="Đóng"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setViol(null)}
            >
              Đóng
            </Button>
          </div>
        </Drawer>
      )}

      {open && (
        <Modal
          title="Ghi nhận vi phạm"
          description="Hồ sơ được lưu vào lịch sử cư trú của người thuê."
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4 p-6">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Người thuê
              <input
                className={inputCls}
                value={form.tenant}
                onChange={(e) => setForm({ ...form, tenant: e.target.value })}
                placeholder="VD: Hồ Minh Khoa"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Phòng
              <input
                className={inputCls}
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="VD: P.312"
              />
            </label>
            <ViolationFields
              type={form.type}
              level={form.level}
              fine={form.fine}
              onType={(type) => setForm({ ...form, type })}
              onLevel={(level) => setForm({ ...form, level })}
              onFine={(fine) => setForm({ ...form, fine })}
            />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Ghi chú
              <textarea
                className={`${inputCls} h-24 py-4`}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                label="Lưu"
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={submit}
              >
                Lưu hồ sơ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
