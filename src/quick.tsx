import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, Modal, PriorityPicker, PriorityTag, ViolationFields, type IconName } from "./shared";
import { money, person, TECHNICIANS, type Priority, type Ticket } from "./data";
import { QrCode, invoices } from "./admin";

export type QuickKind = "dispatch" | "receipt" | "report";

const inputCls =
  "focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500";
const primary =
  "h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40 transition-all";
const ghost = "h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px] transition-all";

const tenantList = [
  { name: "Nguyễn Hoàng Nam", room: "P.302" },
  { name: "Lê Hoàng Nam", room: "P.401" },
  { name: "Trần Quốc Bảo", room: "P.205" },
  { name: "Phạm Đức Anh", room: "P.103" },
  { name: "Đỗ Anh Tuấn", room: "P.204" },
  { name: "Hồ Minh Khoa", room: "P.312" },
].map((s) => ({ ...s, ...person(s.name) }));

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Success({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return (
    <div className="grid place-items-center gap-4 p-8 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-success-50 text-success-600">
        <Icon name="check" className="size-7" />
      </span>
      <div>
        <h3 className="font-heading text-xl font-bold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
      </div>
      <Button label="Hoàn tất" className={primary} onClick={onClose}>
        Hoàn tất
      </Button>
    </div>
  );
}

/* ---------- Phân công thợ ---------- */
const techInfo: Record<string, { skill: string; load: number }> = {
  "Võ Văn Thịnh": { skill: "Điện nước", load: 3 },
  "Lâm Quốc Huy": { skill: "Điều hòa · Nội thất", load: 1 },
};

function DispatchBody({ tickets, onAssign, onClose }: { tickets: Ticket[]; onAssign: (id: string, tech?: string, priority?: Priority) => void; onClose: () => void }) {
  const open = tickets.filter((t) => t.status !== "Hoàn thành");
  const [ticketId, setTicketId] = useState(open.find((t) => !t.assignee)?.id ?? open[0]?.id ?? "");
  const [tech, setTech] = useState(TECHNICIANS[1]);
  const [done, setDone] = useState(false);
  const [prio, setPrio] = useState<Priority | null>(null);
  const cur = open.find((t) => t.id === ticketId);
  const prioValue = prio ?? cur?.priority ?? "Bình thường";
  if (done) return <Success title="Đã giao việc" text={`Phiếu ${ticketId} được giao cho ${tech}. Kỹ thuật viên sẽ nhận thông báo ngay.`} onClose={onClose} />;
  if (!open.length) return <div className="p-8 text-center text-sm text-slate-500">Không có phiếu sự cố nào cần xử lý.</div>;
  return (
    <div className="grid gap-6 p-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Phiếu cần xử lý</h3>
        <div className="grid gap-2">
          {open.map((t) => (
            <Button key={t.id} label={t.title} className={`flex items-center justify-between gap-4 rounded-sm border p-3.5 text-left transition-colors ${ticketId === t.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`} onClick={() => { setTicketId(t.id); setPrio(null); }}>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{t.title}</span>
                <span className="font-mono text-xs text-slate-500">{t.id} · {t.room} · {t.assignee ?? "Chưa phân công"}</span>
              </span>
              <PriorityTag priority={t.priority} />
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Mức độ ưu tiên</h3>
        <PriorityPicker value={prioValue} onChange={setPrio} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Chọn kỹ thuật viên</h3>
        <div className="grid grid-cols-2 gap-2">
          {TECHNICIANS.map((n) => (
            <Button key={n} label={n} className={`rounded-sm border p-3.5 text-left transition-colors ${tech === n ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`} onClick={() => setTech(n)}>
              <span className="block text-sm font-semibold text-slate-900">{n}</span>
              <span className="block text-xs text-slate-500">{techInfo[n]?.skill}</span>
              <span className="mt-2 block text-xs font-medium text-brand-700">{techInfo[n]?.load} việc đang làm</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button label="Hủy" className={ghost} onClick={onClose}>Hủy bỏ</Button>
        <Button label="Giao việc" className={primary} onClick={() => { onAssign(ticketId, tech, prioValue); setDone(true); }}>Giao việc</Button>
      </div>
    </div>
  );
}

/* ---------- Tạo phiếu thu ---------- */
function ReceiptBody({ onClose }: { onClose: () => void }) {
  const [who, setWho] = useState(tenantList[0].cccd);
  const [kind, setKind] = useState("Tiền phòng tháng 11");
  const [amount, setAmount] = useState("1200000");
  const [qr, setQr] = useState(false);
  const tenant = tenantList.find((s) => s.cccd === who)!;
  const value = Number(amount.replace(/\D/g, "")) || 0;
  const memo = `PT${tenant.cccd.slice(-6)}`;

  if (qr)
    return (
      <div className="grid place-items-center gap-4 p-8 text-center">
        <QrCode seed={`${memo}${value}`} />
        <div>
          <p className="font-heading text-2xl font-bold text-brand-700">{money(value)}</p>
          <p className="mt-1 text-sm text-slate-600">{tenant.name} · {tenant.room} · {kind}</p>
          <p className="mt-2 text-xs text-slate-500">Nội dung CK: <span className="font-mono font-medium text-slate-800">{memo}</span></p>
        </div>
        <div className="flex gap-2">
          <Button label="Sửa" className={ghost} onClick={() => setQr(false)}>Chỉnh sửa</Button>
          <Button label="Hoàn tất" className={primary} onClick={onClose}>Gửi cho người thuê</Button>
        </div>
      </div>
    );
  return (
    <div className="grid gap-4 p-6">
      <Field label="Người thuê">
        <select className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>
          {tenantList.map((s) => <option key={s.cccd} value={s.cccd}>{s.name} · {s.room}</option>)}
        </select>
      </Field>
      <Field label="Khoản thu">
        <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value)}>
          {["Tiền phòng tháng 11", "Tiền cọc giữ chỗ", "Phí phạt trễ hạn", "Phí dịch vụ giặt ủi"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Số tiền (VNĐ)">
        <input className={`${inputCls} font-mono`} inputMode="numeric" value={value ? value.toLocaleString("vi-VN") : ""} onChange={(e) => setAmount(e.target.value)} placeholder="1.200.000" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button label="Hủy" className={ghost} onClick={onClose}>Hủy bỏ</Button>
        <Button label="Sinh mã VietQR" className={primary} disabled={value <= 0} onClick={() => setQr(true)}>Sinh mã VietQR</Button>
      </div>
    </div>
  );
}

/* ---------- Lập biên bản ---------- */
function ReportBody({ onClose }: { onClose: () => void }) {
  const [who, setWho] = useState(tenantList[0].cccd);
  const [type, setType] = useState("Về muộn");
  const [level, setLevel] = useState("Nhắc nhở");
  const [fine, setFine] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const tenant = tenantList.find((s) => s.cccd === who)!;

  if (done) return <Success title="Đã lập biên bản" text={`Biên bản "${type}" của ${tenant.name} đã lưu vào hồ sơ kỷ luật.`} onClose={onClose} />;
  return (
    <div className="grid gap-4 p-6">
      <Field label="Người thuê vi phạm">
        <select className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>
          {tenantList.map((s) => <option key={s.cccd} value={s.cccd}>{s.name} · {s.room}</option>)}
        </select>
      </Field>
      <ViolationFields typeLabel="Lỗi vi phạm" type={type} level={level} fine={fine} onType={setType} onLevel={setLevel} onFine={setFine} />
      <Field label="Mô tả">
        <textarea className={`${inputCls} h-24 py-4`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thời gian, địa điểm, diễn biến..." />
      </Field>
      <div>
        <span className="mb-2 block text-sm font-medium text-slate-700">Ảnh bằng chứng</span>
        <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div className="flex items-center gap-4 rounded-sm border border-slate-200 p-3">
            <img src={preview} alt="Ảnh bằng chứng" className="size-14 rounded-sm object-cover" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
            <Button label="Xóa ảnh" className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100" onClick={() => setFile(null)}>
              <Icon name="close" className="size-4" />
            </Button>
          </div>
        ) : (
          <Button label="Tải ảnh lên" className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-slate-300 text-sm text-slate-500 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700" onClick={() => input.current?.click()}>
            <Icon name="camera" className="size-6" />
            Bấm để chọn ảnh (PNG, JPG)
          </Button>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button label="Hủy" className={ghost} onClick={onClose}>Hủy bỏ</Button>
        <Button label="Lập biên bản" className={primary} disabled={!type.trim() || !level.trim() || (level.trim().toLowerCase() === "phạt tiền" && Number(fine) <= 0)} onClick={() => setDone(true)}>Lập biên bản</Button>
      </div>
    </div>
  );
}

const titles: Record<QuickKind, [string, string]> = {
  dispatch: ["Phân công kỹ thuật viên", "Giao phiếu sự cố cho nhân viên kỹ thuật."],
  receipt: ["Tạo phiếu thu", "Nhập số tiền và sinh mã VietQR cho người thuê."],
  report: ["Lập biên bản vi phạm", "Ghi nhận lỗi vi phạm nội quy kèm ảnh bằng chứng."],
};

export function QuickModals({ kind, tickets, onAssign, onClose }: { kind: QuickKind; tickets: Ticket[]; onAssign: (id: string, tech?: string, priority?: Priority) => void; onClose: () => void }) {
  return (
    <Modal title={titles[kind][0]} description={titles[kind][1]} onClose={onClose}>
      {kind === "dispatch" && <DispatchBody tickets={tickets} onAssign={onAssign} onClose={onClose} />}
      {kind === "receipt" && <ReceiptBody onClose={onClose} />}
      {kind === "report" && <ReportBody onClose={onClose} />}
    </Modal>
  );
}

/* ---------- Global search ---------- */
type Hit = { group: string; icon: IconName; title: string; sub: string; nav: string };

export function GlobalSearch({ onNavigate }: { onNavigate: (label: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, []);

  const hits = useMemo(() => {
    const all: Hit[] = [
      ...tenantList.map((s) => ({ group: "Người thuê", icon: "user" as IconName, title: s.name, sub: `${s.email} · ${s.room}`, nav: "Người thuê" })),
      ...["P.102", "P.201", "P.205", "P.302", "P.401"].map((r) => ({ group: "Phòng", icon: "bed" as IconName, title: `Phòng ${r}`, sub: "Xem sơ đồ giường", nav: "Phòng & giường" })),
      ...invoices.map((i) => ({ group: "Hóa đơn", icon: "invoice" as IconName, title: i.id, sub: `${i.tenant} · ${i.room} · ${money(i.amount)}`, nav: "Hóa đơn" })),
    ];
    const term = q.trim().toLowerCase();
    const list = term ? all.filter((h) => `${h.title} ${h.sub}`.toLowerCase().includes(term)) : [];
    return ["Người thuê", "Phòng", "Hóa đơn"].map((g) => ({ g, items: list.filter((h) => h.group === g).slice(0, 3) })).filter((x) => x.items.length);
  }, [q]);

  const pick = (h: Hit) => { setOpen(false); setQ(""); onNavigate(h.nav); };

  return (
    <div ref={ref} className="relative max-w-md flex-1">
      <Icon name="search" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={input}
        aria-label="Tìm kiếm toàn hệ thống"
        className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white md:pr-14"
        placeholder="Tìm người thuê, phòng, hóa đơn..."
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
      />
      <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-400 md:block">⌘ K</span>
      {open && (
        <div className="absolute left-0 top-12 z-dropdown w-full min-w-80 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md">
          {!q.trim() ? (
            <div className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Gợi ý</p>
              {["Nguyễn Hoàng Nam", "P.302", "HD-2610-0004"].map((s) => (
                <Button key={s} label={s} className="flex h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-sm text-slate-600 hover:bg-slate-50" onClick={() => setQ(s)}>
                  <Icon name="search" className="size-4 text-slate-400" /> {s}
                </Button>
              ))}
            </div>
          ) : hits.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">Không có kết quả cho “{q}”.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto p-2">
              {hits.map(({ g, items }) => (
                <div key={g} className="mb-2 last:mb-0">
                  <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{g}</p>
                  {items.map((h) => (
                    <Button key={h.title} label={h.title} className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-brand-50" onClick={() => pick(h)}>
                      <span className="icon-box icon-box-brand size-8"><Icon name={h.icon} className="size-4" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{h.title}</span>
                        <span className="block truncate text-xs text-slate-500">{h.sub}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
