import { useState } from "react";
import { Button, Icon, PriorityTag } from "./shared";
import { money, PRIORITIES, priorityRank, type Priority, type Ticket, type TicketStatus } from "./data";

const filters: ("Tất cả" | TicketStatus)[] = ["Tất cả", "Mới giao", "Đang xử lý", "Hoàn thành"];

const prioBar: Record<Priority, string> = { "Khẩn cấp": "bg-red-600", Cao: "bg-orange-500", "Bình thường": "bg-sky-400" };
const prioChip: Record<Priority, string> = {
  "Khẩn cấp": "border-red-600 bg-red-600 text-white",
  Cao: "border-orange-500 bg-orange-500 text-white",
  "Bình thường": "border-sky-500 bg-sky-500 text-white",
};
const where = (t: Ticket) => (t.bed ? `${t.room} · Giường ${t.bed}` : t.room);

type Notice = { id: string; title: string; body: string; time: string; ticketId?: string; tone: "danger" | "brand" | "warning" | "success"; unread: boolean };
const noticeTone: Record<Notice["tone"], string> = {
  danger: "bg-red-100 text-red-600",
  brand: "bg-brand-50 text-brand-600",
  warning: "bg-warning-50 text-warning-600",
  success: "bg-success-50 text-success-600",
};
const initialNotices: Notice[] = [
  { id: "n1", title: "Việc khẩn cấp mới được giao", body: "SC-1049 · Rò rỉ nước dưới bồn rửa tại P.401, cần xử lý trước 12:00.", time: "5 phút trước", ticketId: "SC-1049", tone: "danger", unread: true },
  { id: "n2", title: "Quản lý đổi mức ưu tiên", body: "SC-1047 · Điều hòa không lạnh (P.205) được nâng lên mức Cao.", time: "1 giờ trước", ticketId: "SC-1047", tone: "warning", unread: true },
  { id: "n3", title: "Sắp đến hạn xử lý", body: "SC-1046 · Quạt trần kêu to (P.302) còn hạn đến 26/10.", time: "Hôm nay, 07:30", ticketId: "SC-1046", tone: "brand", unread: false },
  { id: "n4", title: "Người thuê đã xác nhận", body: "SC-1041 · Bóng đèn hành lang tầng 2 đã được xác nhận hoàn thành.", time: "Hôm qua", ticketId: "SC-1041", tone: "success", unread: false },
];

const statusStyle: Record<TicketStatus, string> = {
  "Mới giao": "status-label-brand",
  "Đang xử lý": "status-label-warning",
  "Hoàn thành": "status-label-success",
};

export function TechnicianApp({
  tickets,
  onUpdate,
  onLogout,
  showToast,
}: {
  tickets: Ticket[];
  onUpdate: (id: string, patch: Partial<Ticket>) => void;
  onLogout: () => void;
  showToast: (message: string) => void;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tất cả");
  const [prio, setPrio] = useState<"Tất cả" | Priority>("Tất cả");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"jobs" | "settings">("jobs");
  const [notices, setNotices] = useState(initialNotices);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "Võ Văn Thịnh", phone: "0908 112 245", email: "technician@gmail.com", skill: "Điện nước" });
  const initials = profile.name.split(" ").slice(-2).map((p) => p[0]).join("").toUpperCase();
  const unread = notices.filter((n) => n.unread).length;
  const q = query.trim().toLowerCase();

  const visible = tickets
    .filter((ticket) => filter === "Tất cả" || ticket.status === filter)
    .filter((ticket) => prio === "Tất cả" || ticket.priority === prio)
    .filter((ticket) => !q || `${ticket.title} ${ticket.id} ${ticket.room} ${ticket.bed ?? ""}`.toLowerCase().includes(q))
    .sort((a, b) => Number(a.status === "Hoàn thành") - Number(b.status === "Hoàn thành") || priorityRank[a.priority] - priorityRank[b.priority]);
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const count = (status: TicketStatus) => tickets.filter((ticket) => ticket.status === status).length;
  const urgentOpen = tickets.filter((t) => t.priority === "Khẩn cấp" && t.status !== "Hoàn thành").length;
  const hasFilter = filter !== "Tất cả" || prio !== "Tất cả" || q !== "";

  return (
    <div className="min-h-[100dvh] bg-slate-100 md:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-slate-50 text-slate-900 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-sm md:shadow-md md:ring-1 md:ring-slate-200">
        {selected ? (
          <TicketDetail
            key={selected.id}
            onBack={() => setSelectedId(null)}
            onComplete={(patch) => {
              onUpdate(selected.id, { ...patch, status: "Hoàn thành" });
              showToast(`Đã hoàn thành ${selected.id}, thông báo gửi quản lý và người thuê`);
              setSelectedId(null);
            }}
            onStart={() => {
              onUpdate(selected.id, { status: "Đang xử lý" });
              showToast(`Đã nhận ${selected.id}`);
            }}
            ticket={selected}
          />
        ) : tab === "settings" ? (
          <SettingsTab profile={profile} initials={initials} onSave={setProfile} onLogout={onLogout} showToast={showToast} />
        ) : (
          <>
            <header className="bg-slate-900 px-4 pb-12 pt-4 text-white">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-white/10 text-xs font-semibold ring-1 ring-white/20">{initials}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-sm font-bold">{profile.name}</span>
                    <span className="block truncate font-mono text-[11px] text-slate-400">Kỹ thuật viên</span>
                  </span>
                </div>
                <Button label="Thông báo" className="relative grid size-8 place-items-center rounded-sm hover:bg-white/10" onClick={() => setNoticeOpen(true)}>
                  <Icon name="bell" className="size-4" />
                  {unread > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-sm bg-danger-500 font-mono text-[10px] font-bold text-white">{unread}</span>}
                </Button>
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold tracking-tight">Công việc hôm nay</h1>
              <p className="mt-0.5 text-xs text-slate-400">Thứ Bảy, 24/10/2026 · {count("Mới giao") + count("Đang xử lý")} việc cần xử lý</p>
              {urgentOpen > 0 && (
                <button
                  type="button"
                  onClick={() => { setPrio("Khẩn cấp"); setFilter("Tất cả"); }}
                  className="focus-ring mt-3 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-sm bg-danger-500 px-3.5 text-left text-xs font-semibold text-white shadow-xs active:translate-y-[1px]"
                >
                  <span className="size-2 animate-pulse rounded-sm bg-white" />
                  <span className="flex-1">{urgentOpen} việc khẩn cấp đang chờ</span>
                  <Icon name="chevron" className="size-3.5 rotate-90" />
                </button>
              )}
            </header>

            <div className="relative z-10 -mt-10 px-4">
              <div className="grid grid-cols-3 gap-1.5 rounded-sm bg-white p-1.5 shadow-xs ring-1 ring-slate-200">
                {(
                  [
                    ["Mới giao", "text-brand-700", "bg-brand-50"],
                    ["Đang xử lý", "text-warning-600", "bg-warning-50"],
                    ["Hoàn thành", "text-success-600", "bg-success-50"],
                  ] as const
                ).map(([label, text, bg]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFilter(filter === label ? "Tất cả" : label)}
                    className={`focus-ring flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-sm transition-all ${filter === label ? `${bg} ring-1 ring-current ${text} font-bold` : `${text} hover:bg-slate-50`}`}
                  >
                    <span className="font-mono text-xl font-bold leading-none">{count(label)}</span>
                    <span className="mt-1 text-[11px] font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky top-0 z-20 mt-3 space-y-2 border-b border-slate-200 bg-slate-50/95 px-4 pb-3 pt-2 backdrop-blur">
              <label className="relative block">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm công việc, phòng, giường..."
                  type="search"
                  value={query}
                />
              </label>
              <div className="grid grid-cols-4 gap-1" role="group" aria-label="Lọc theo mức độ ưu tiên">
                {(["Tất cả", ...PRIORITIES] as const).map((item) => (
                  <Button
                    key={item}
                    className={`h-8 rounded-sm border px-1 text-xs font-semibold active:translate-y-[1px] ${
                      prio === item ? (item === "Tất cả" ? "border-slate-900 bg-slate-900 text-white" : prioChip[item]) : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setPrio(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            <main className="flex-1 pb-6" aria-label="Danh sách công việc">
              <div className="flex items-center justify-between px-4 pb-1 pt-3 text-sm text-slate-500">
                <span>{visible.length} công việc{prio !== "Tất cả" ? ` · ${prio}` : ""}</span>
                {hasFilter && (
                  <button type="button" className="focus-ring h-11 cursor-pointer rounded-lg px-2 font-semibold text-brand-600" onClick={() => { setFilter("Tất cả"); setPrio("Tất cả"); setQuery(""); }}>
                    Xóa lọc
                  </button>
                )}
              </div>
              <ul className="space-y-3 px-4">
                {visible.length === 0 && (
                  <li className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">Không có công việc phù hợp bộ lọc.</li>
                )}
                {visible.map((ticket) => (
                  <li key={ticket.id}>
                    <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
                      <span className={`absolute inset-y-0 left-0 w-1 ${prioBar[ticket.priority]}`} />
                      <button className="focus-ring block w-full cursor-pointer py-3.5 pl-5 pr-3 text-left" onClick={() => setSelectedId(ticket.id)} type="button">
                        <div className="flex items-center justify-between gap-2">
                          <PriorityTag priority={ticket.priority} />
                          <span className={`status-label ${statusStyle[ticket.status]}`}>{ticket.status}</span>
                        </div>
                        <div className="mt-3 text-lg font-bold leading-snug text-slate-900">{ticket.title}</div>
                        <div className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-700">
                          <Icon name="bed" className="size-5 text-slate-400" />
                          {where(ticket)}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Icon name="clock" className="size-4" />
                            {ticket.deadline}
                          </span>
                          <span className="font-mono text-xs">{ticket.id}</span>
                        </div>
                      </button>
                      {ticket.status !== "Hoàn thành" && (
                        <div className="pb-4 pl-6 pr-4">
                          {ticket.status === "Mới giao" ? (
                            <Button
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                              onClick={() => {
                                onUpdate(ticket.id, { status: "Đang xử lý" });
                                showToast(`Đã nhận ${ticket.id}`);
                              }}
                            >
                              <Icon name="play" className="size-4" />
                              Nhận việc
                            </Button>
                          ) : (
                            <Button
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
                              onClick={() => setSelectedId(ticket.id)}
                            >
                              <Icon name="camera" className="size-4" />
                              Hoàn thành
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </main>

          </>
        )}

        {!selected && (
          <nav className="sticky bottom-0 z-30 mt-auto grid grid-cols-2 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Điều hướng chính">
            {(
              [
                ["jobs", "Công việc", "tools"],
                ["settings", "Cài đặt", "settings"],
              ] as const
            ).map(([key, label, icon]) => (
              <button key={key} type="button" aria-current={tab === key ? "page" : undefined} onClick={() => setTab(key)} className={`focus-ring relative flex h-16 cursor-pointer flex-col items-center justify-center gap-1 text-xs font-semibold ${tab === key ? "text-brand-600" : "text-slate-500"}`}>
                {tab === key && <span className="absolute inset-x-10 top-0 h-0.5 rounded-b bg-brand-600" />}
                <Icon name={icon} className="size-6" />
                {label}
              </button>
            ))}
          </nav>
        )}

        {noticeOpen && (
          <NoticeSheet
            notices={notices}
            onClose={() => setNoticeOpen(false)}
            onReadAll={() => setNotices(notices.map((n) => ({ ...n, unread: false })))}
            onOpen={(n) => {
              setNotices(notices.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
              if (n.ticketId && tickets.some((t) => t.id === n.ticketId)) {
                setTab("jobs");
                setSelectedId(n.ticketId);
                setNoticeOpen(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

function NoticeSheet({ notices, onClose, onReadAll, onOpen }: { notices: Notice[]; onClose: () => void; onReadAll: () => void; onOpen: (n: Notice) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Thông báo" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-sm border border-slate-200 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-heading text-base font-bold text-slate-900">Thông báo</h2>
          <Button label="Đóng" className="grid size-8 place-items-center rounded-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <Icon name="close" className="size-4" />
          </Button>
        </div>
        <div className="px-5 pb-2">
          <button type="button" className="focus-ring h-11 cursor-pointer rounded-lg text-sm font-semibold text-brand-600" onClick={onReadAll}>
            Đánh dấu tất cả đã đọc
          </button>
        </div>
        <ul className="divide-y divide-slate-100 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {notices.map((n) => (
            <li key={n.id}>
              <button type="button" className={`focus-ring flex w-full cursor-pointer gap-3 px-5 py-4 text-left ${n.unread ? "bg-brand-50/50" : ""}`} onClick={() => onOpen(n)}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-sm ${noticeTone[n.tone]}`}>
                  <Icon name={n.tone === "success" ? "check" : n.tone === "danger" ? "alert" : "clock"} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug text-slate-900">{n.title}</span>
                    {n.unread && <span className="mt-1 size-1.5 shrink-0 rounded-sm bg-brand-500" />}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">{n.body}</span>
                  <span className="mt-1.5 block text-xs text-slate-400">{n.time}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PwInput({ label, value, onChange, error, auto, hint }: { label: string; value: string; onChange: (v: string) => void; error?: string; auto: string; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      <span className="relative block">
        <input
          className={`focus-ring h-10 w-full rounded-sm border bg-white pl-3 pr-16 text-sm outline-none focus:border-brand-500 ${error ? "border-danger-500" : "border-slate-200"}`}
          type={show ? "text" : "password"}
          autoComplete={auto}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="focus-ring absolute right-1.5 top-1/2 h-7 -translate-y-1/2 cursor-pointer rounded-sm px-2 text-xs font-medium text-brand-600 hover:bg-brand-50" onClick={() => setShow(!show)}>
          {show ? "Ẩn" : "Hiện"}
        </button>
      </span>
      {error ? <span className="mt-1.5 block text-xs text-danger-600">{error}</span> : hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function PasswordPage({ onBack, onDone }: { onBack: () => void; onDone: (message: string) => void }) {
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [tried, setTried] = useState(false);
  const errors = {
    old: f.old ? "" : "Vui lòng nhập mật khẩu cũ",
    next: f.next.length < 8 ? "Mật khẩu mới cần tối thiểu 8 ký tự" : f.next === f.old ? "Mật khẩu mới phải khác mật khẩu cũ" : "",
    confirm: f.confirm !== f.next ? "Mật khẩu xác nhận không khớp" : "",
  };
  const rules = [
    ["Tối thiểu 8 ký tự", f.next.length >= 8],
    ["Khác mật khẩu cũ", f.next.length > 0 && f.next !== f.old],
    ["Xác nhận trùng khớp", f.confirm.length > 0 && f.confirm === f.next],
  ] as const;
  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!errors.old && !errors.next && !errors.confirm) onDone("Đã đổi mật khẩu thành công");
      }}
    >
      <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
        <Button label="Quay lại" className="grid size-9 place-items-center rounded-sm hover:bg-slate-100" onClick={onBack}>
          <Icon name="chevron" className="size-6 rotate-180" />
        </Button>
        <div className="text-base font-bold text-slate-900">Đổi mật khẩu</div>
      </div>
      <div className="flex-1 space-y-5 px-4 py-5">
        <p className="text-sm text-slate-500">Dùng mật khẩu mạnh, không trùng với mật khẩu cũ.</p>
        <PwInput label="Mật khẩu cũ" auto="current-password" value={f.old} onChange={(v) => setF({ ...f, old: v })} error={tried ? errors.old : ""} />
        <PwInput label="Mật khẩu mới" auto="new-password" value={f.next} onChange={(v) => setF({ ...f, next: v })} error={tried ? errors.next : ""} />
        <PwInput label="Xác nhận mật khẩu mới" auto="new-password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} error={tried ? errors.confirm : ""} />
        <ul className="space-y-2 rounded-sm bg-slate-100 p-3 text-xs">
          {rules.map(([label, ok]) => (
            <li key={label} className={`flex items-center gap-2 ${ok ? "font-semibold text-success-600" : "text-slate-500"}`}>
              <span className={`grid size-4 place-items-center rounded-sm ${ok ? "bg-success-500 text-white" : "bg-slate-300"}`}>{ok && <Icon name="check" className="size-2.5" />}</span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button type="submit" className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]">
          Cập nhật mật khẩu
        </button>
      </div>
    </form>
  );
}

type Profile = { name: string; phone: string; email: string; skill: string };

function SettingsTab({ profile, initials, onSave, onLogout, showToast }: { profile: Profile; initials: string; onSave: (p: Profile) => void; onLogout: () => void; showToast: (m: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [pwPage, setPwPage] = useState(false);
  const field = "focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500";

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.name.trim().length < 2) return showToast("Vui lòng nhập họ và tên");
    if (!/^0\d{9}$/.test(draft.phone.replace(/\s/g, ""))) return showToast("Số điện thoại cần 10 chữ số");
    onSave({ ...draft, name: draft.name.trim() });
    setEditing(false);
    showToast("Đã cập nhật thông tin cá nhân");
  };

  if (pwPage) {
    return <PasswordPage onBack={() => setPwPage(false)} onDone={(m) => { setPwPage(false); showToast(m); }} />;
  }

  if (editing) {
    return (
      <form className="flex flex-1 flex-col" onSubmit={save}>
        <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
          <Button label="Quay lại" className="grid size-9 place-items-center rounded-sm hover:bg-slate-100" onClick={() => { setDraft(profile); setEditing(false); }}>
            <Icon name="chevron" className="size-6 rotate-180" />
          </Button>
          <div className="text-base font-bold text-slate-900">Thông tin cá nhân</div>
        </div>
        <div className="flex-1 space-y-5 px-4 py-5">
          {(
            [
              ["Họ và tên", "name", "text"],
              ["Số điện thoại", "phone", "tel"],
              ["Email đăng nhập", "email", "email"],
              ["Chuyên môn", "skill", "text"],
            ] as const
          ).map(([label, key, type]) => (
            <label className="block" key={key}>
              <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
              <input className={`${field} ${key === "email" ? "bg-slate-100 text-slate-500" : ""}`} type={type} readOnly={key === "email"} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
              {key === "email" && <span className="mt-1.5 block text-xs text-slate-500">Email do quản lý cấp, không thể tự đổi.</span>}
            </label>
          ))}
        </div>
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <button type="submit" className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]">
            <Icon name="check" className="size-4" />
            Lưu thay đổi
          </button>
        </div>
      </form>
    );
  }

  const rows = [
    { icon: "user" as const, label: "Thông tin cá nhân", hint: "Họ tên, số điện thoại, chuyên môn", action: () => { setDraft(profile); setEditing(true); }, tone: "text-slate-900" },
    { icon: "settings" as const, label: "Đổi mật khẩu", hint: "Cập nhật mật khẩu đăng nhập", action: () => setPwPage(true), tone: "text-slate-900" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-brand-700 px-4 pb-14 pt-6 text-white">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Cài đặt</h1>
      </header>
      <div className="relative z-10 -mt-9 px-4">
        <div className="flex items-center gap-3 rounded-sm bg-white p-3.5 shadow-xs ring-1 ring-slate-200">
          <span className="grid size-12 shrink-0 place-items-center rounded-sm bg-brand-50 font-mono text-base font-bold text-brand-700 border border-brand-100">{initials}</span>
          <div className="min-w-0">
            <div className="truncate font-heading text-base font-bold text-slate-900">{profile.name}</div>
            <div className="truncate font-mono text-xs text-slate-500">{profile.email}</div>
            <div className="mt-1 flex gap-1.5 text-xs font-semibold">
              <span className="rounded-sm bg-brand-50 px-2 py-0.5 font-mono text-[11px] text-brand-700">{profile.skill}</span>
            </div>
          </div>
        </div>
      </div>

      <ul className="mx-4 mt-4 divide-y divide-slate-100 overflow-hidden rounded-sm border border-slate-200 bg-white">
        {rows.map((r) => (
          <li key={r.label}>
            <button type="button" onClick={r.action} className="focus-ring flex min-h-16 w-full cursor-pointer items-center gap-4 px-4 text-left active:bg-slate-50">
              <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-slate-100 text-slate-600">
                <Icon name={r.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-base font-semibold ${r.tone}`}>{r.label}</span>
                <span className="block text-xs text-slate-500">{r.hint}</span>
              </span>
              <Icon name="chevron" className="size-4 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-4">
        <button type="button" onClick={onLogout} className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-danger-200 bg-danger-50 text-sm font-semibold text-danger-600 active:translate-y-[1px]">
          <Icon name="logout" className="size-4" />
          Đăng xuất
        </button>
      </div>
      <p className="mt-6 pb-6 text-center text-xs text-slate-400">KTX Hub · Ứng dụng kỹ thuật viên</p>

    </div>
  );
}

function TicketDetail({
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
  const stepIndex = ticket.status === "Mới giao" ? 0 : ticket.status === "Đang xử lý" ? 1 : 3;
  const ready = note.trim().length >= 10 && afterPhoto;

  return (
    <article className="flex flex-1 flex-col pb-28">
      <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
        <Button label="Quay lại" className="grid size-9 place-items-center rounded-sm text-slate-800 hover:bg-slate-100" onClick={onBack}>
          <Icon name="chevron" className="size-6 rotate-180" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-xs text-slate-500">{ticket.id}</div>
          <div className="truncate text-sm font-bold text-slate-900">Chi tiết công việc</div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityTag priority={ticket.priority} size="lg" />
            <span className={`status-label ml-auto ${statusStyle[ticket.status]}`}>{ticket.status}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span className="rounded-sm bg-slate-900 px-2 py-0.5 font-mono text-xs font-medium text-white">{where(ticket)}</span>
            <span className="font-mono text-slate-500">{ticket.id}</span>
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold leading-snug text-slate-950">{ticket.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.description}</p>

          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-2.5">
              <span className="grid size-8 place-items-center rounded-sm bg-white font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                {ticket.reporter.split(" ").slice(-2).map((part) => part[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">{ticket.reporter}</div>
                <div className="font-mono text-xs text-slate-500">{ticket.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-2.5">
              <span className="icon-box icon-box-warning size-10">
                <Icon name="clock" className="size-5" />
              </span>
              <div>
                <div className="text-xs text-slate-500">Hạn xử lý</div>
                <div className="text-sm font-semibold text-slate-800">{ticket.deadline}</div>
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
                <li className="flex flex-1 items-center last:flex-none" key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`grid size-7 place-items-center rounded-sm font-mono text-xs font-bold ${
                        done ? "bg-success-500 text-white" : current ? "bg-brand-500 text-white ring-2 ring-brand-100" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? <Icon name="check" className="size-4" /> : index + 1}
                    </span>
                    <span className={`text-xs font-semibold ${done || current ? "text-slate-800" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {index < steps.length - 1 && <span className={`mx-2 mb-5 h-0.5 flex-1 rounded ${done ? "bg-success-500" : "bg-slate-200"}`} />}
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
              if (ready) onComplete({ resolution: note.trim(), cost: Number(cost) || 0 });
            }}
          >
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-950">Kết quả xử lý</h3>
              <p className="mt-1 text-sm text-slate-500">Nhập kết quả và ảnh sau sửa chữa để xác nhận đã xử lý xong.</p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Mô tả kết quả</span>
              <textarea
                className="focus-ring min-h-24 w-full resize-none rounded-sm border border-slate-200 p-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
                onChange={(event) => setNote(event.target.value)}
                placeholder="VD: Đã thay gioăng ống cấp nước, siết lại khớp nối, thử áp lực 10 phút không rò."
                value={note}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800">Chi phí vật tư (nếu có)</span>
              <span className="relative block">
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 pl-3 pr-10 font-mono text-sm outline-none focus:border-brand-500"
                  inputMode="numeric"
                  onChange={(event) => setCost(event.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  value={cost}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">đ</span>
              </span>
            </label>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-800">Ảnh sau sửa chữa</div>
              <Button
                className={`flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed text-xs font-medium ${
                  afterPhoto ? "border-success-500 bg-success-50 text-success-600" : "border-slate-300 text-slate-500 hover:border-brand-500 hover:text-brand-600"
                }`}
                onClick={() => setAfterPhoto(!afterPhoto)}
              >
                <Icon name={afterPhoto ? "check" : "camera"} className="size-7" />
                {afterPhoto ? "Đã chụp 1 ảnh · bấm để chụp lại" : "Chụp ảnh sau khi sửa"}
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
            {!ready && <p className="text-center text-xs text-slate-500">Cần nhập kết quả (≥10 ký tự) và chụp ảnh sau khi sửa.</p>}
          </form>
        )}

        {ticket.status === "Hoàn thành" && (
          <div className="rounded-sm border border-success-200 bg-success-50 p-4">
            <div className="flex items-center gap-2 font-heading text-base font-bold text-success-600">
              <Icon name="check" className="size-5" />
              Đã hoàn thành
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{ticket.resolution}</p>
            <div className="mt-3 flex justify-between border-t border-success-100 pt-3 text-sm">
              <span className="text-slate-500">Chi phí vật tư</span>
              <span className="font-bold text-slate-900">{money(ticket.cost ?? 0)}</span>
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
