import { PRIORITIES, type Priority } from "./data";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export type IconName =
  | "activity"
  | "alert"
  | "bell"
  | "bed"
  | "bolt"
  | "building"
  | "calendar"
  | "chevron"
  | "clipboard"
  | "close"
  | "contract"
  | "dashboard"
  | "droplet"
  | "file"
  | "grid"
  | "invoice"
  | "menu"
  | "more"
  | "receipt"
  | "report"
  | "search"
  | "settings"
  | "students"
  | "tools"
  | "trend"
  | "userPlus"
  | "wallet"
  | "camera"
  | "check"
  | "copy"
  | "home"
  | "logout"
  | "phone"
  | "qr"
  | "refresh"
  | "user"
  | "clock"
  | "send"
  | "image"
  | "play";

const iconPaths: Record<IconName, ReactNode> = {
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v12H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  home: <path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v1M14 20h1M18 20h3v1M20 17v1" />
    </>
  ),
  refresh: <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M3 21v-5h5M21 3v5h-5" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  play: <path d="m6 4 14 8-14 8z" />,
  activity: <path d="M3 12h4l2.4-7 4.1 14 2.4-7H21" />,
  alert: (
    <>
      <path d="M10.3 2.9 1.9 17a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  bed: (
    <>
      <path d="M3 5v14M21 19v-7a2 2 0 0 0-2-2H3" />
      <path d="M7 10V7h5a2 2 0 0 1 2 2v1" />
      <path d="M3 15h18" />
    </>
  ),
  bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
  building: (
    <>
      <path d="M3 21h18M6 21V4h12v17" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M10 21v-5h4v5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  contract: (
    <>
      <path d="M6 2h9l4 4v16H6z" />
      <path d="M14 2v5h5M9 13h6M9 17h4" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  droplet: <path d="M12 2S5 9.1 5 14a7 7 0 0 0 14 0c0-4.9-7-12-7-12Z" />,
  file: (
    <>
      <path d="M6 2h9l4 4v16H6z" />
      <path d="M14 2v5h5" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>
  ),
  invoice: (
    <>
      <path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </>
  ),
  report: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  students: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  tools: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L19.2 18a2 2 0 1 0 2.8-2.8z" />
      <path d="m5 13-3 3 4 4 3-3" />
    </>
  ),
  trend: <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />,
  userPlus: (
    <>
      <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 5h15a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V5a3 3 0 0 1 3-3h12" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
};

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {iconPaths[name]}
    </svg>
  );
}

export function Button({
  children,
  className = "",
  disabled = false,
  label,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={`focus-ring cursor-pointer transition-all duration-150 active:translate-y-[1px] ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        className="focus-ring h-10 cursor-pointer appearance-none rounded-sm border border-slate-200 bg-white py-1.5 pl-3 pr-9 text-sm font-medium text-slate-800 shadow-xs outline-none focus:border-brand-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <Icon
        name="chevron"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-400"
      />
    </label>
  );
}

export function Modal({
  children,
  title,
  description,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div aria-modal="true" className="fixed inset-0 z-backdrop grid place-items-center p-4" role="dialog">
      <Button label="Đóng hộp thoại" className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose}>
        <span className="sr-only">Đóng</span>
      </Button>
      <div
        className={`relative z-modal max-h-[90vh] w-full overflow-y-auto rounded-sm border border-slate-200 bg-white shadow-lg ${
          wide ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <Button
            label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Quản trị</span>
          <Icon name="chevron" className="size-3.5" />
          <span className="font-medium text-slate-700">{eyebrow}</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}

export function Drawer({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-backdrop" role="dialog" aria-modal="true">
      <Button label="Đóng" className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose}>
        <span className="sr-only">Đóng</span>
      </Button>
      <aside className="absolute right-0 top-0 z-drawer flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-lg">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="font-mono text-xs text-slate-500">{subtitle}</p>
            <h2 className="font-heading text-xl font-bold text-slate-950">{title}</h2>
          </div>
          <Button label="Đóng" className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <Icon name="close" className="size-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}

export function TagInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder = "Chọn hoặc gõ tiện nghi mới, nhấn Enter",
  single = false,
  hint = "Chọn từ danh sách hoặc gõ tên mới rồi nhấn Enter để thêm.",
  createLabel = "Tạo mới",
}: {
  single?: boolean;
  hint?: string;
  createLabel?: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const q = text.trim();
  const has = (v: string) => value.some((x) => x.toLowerCase() === v.toLowerCase());
  const full = single && value.length > 0;
  const matches = suggestions.filter((o) => !has(o) && o.toLowerCase().includes(q.toLowerCase()));
  const canCreate = q !== "" && !has(q) && !suggestions.some((o) => o.toLowerCase() === q.toLowerCase());
  const rows = [...matches.map((o) => ({ label: o, create: false })), ...(canCreate ? [{ label: q, create: true }] : [])];

  const add = (v: string) => {
    const t = v.trim();
    if (!t || has(t)) return;
    const known = suggestions.find((o) => o.toLowerCase() === t.toLowerCase());
    onChange(single ? [known ?? t] : [...value, known ?? t]);
    setText("");
    setActive(0);
    if (single) setOpen(false);
    else input.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!open && !q) return setOpen(true);
      const row = rows[active];
      if (row && !(canCreate && !row.create && q)) add(row.label);
      else add(q);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(rows.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <div
        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-2 py-1.5 transition-colors focus-within:border-brand-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500"
        onClick={() => {
          input.current?.focus();
          setOpen(true);
        }}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex h-6 items-center gap-1 rounded-sm bg-brand-50 pl-2 pr-1 text-xs font-medium text-brand-700">
            {tag}
            <button
              type="button"
              aria-label={`Xóa ${tag}`}
              className="grid size-4 place-items-center rounded-sm text-brand-600 hover:bg-brand-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((x) => x !== tag));
              }}
            >
              <Icon name="close" className="size-3" />
            </button>
          </span>
        ))}
        {!full && <input
          ref={input}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className="h-7 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
          placeholder={value.length ? "Thêm..." : placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />}
      </div>
      {open && rows.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-dropdown mt-1 max-h-56 w-full overflow-auto rounded-sm border border-slate-200 bg-white p-1 shadow-md">
          {rows.map((r, i) => (
            <li key={`${r.create}-${r.label}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={`flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm ${i === active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(r.label)}
              >
                {r.create ? (
                  <>
                    <span className="grid size-5 place-items-center rounded bg-brand-600 text-xs font-bold leading-none text-white">+</span>
                    {createLabel} “<span className="font-semibold">{r.label}</span>”
                  </>
                ) : (
                  r.label
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function PasswordField({ label, value, onChange, error, autoComplete }: { label: string; value: string; onChange: (v: string) => void; error?: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`h-10 w-full rounded-sm border bg-white px-3 pr-16 text-sm outline-none transition-colors focus:border-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500 ${error ? "border-danger-500" : "border-slate-200"}`}
        />
        <button
          type="button"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-sm px-2 text-xs font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500"
          onClick={() => setShow(!show)}
        >
          {show ? "Ẩn" : "Hiện"}
        </button>
      </div>
      {error && <span className="text-xs font-normal text-danger-600">{error}</span>}
    </label>
  );
}

export function ChangePasswordModal({ onClose, onDone }: { onClose: () => void; onDone: (message: string) => void }) {
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [tried, setTried] = useState(false);
  const errors = {
    old: f.old ? "" : "Vui lòng nhập mật khẩu cũ",
    next: f.next.length < 8 ? "Mật khẩu mới cần tối thiểu 8 ký tự" : f.next === f.old ? "Mật khẩu mới phải khác mật khẩu cũ" : "",
    confirm: f.confirm !== f.next ? "Mật khẩu xác nhận không khớp" : "",
  };
  const valid = !errors.old && !errors.next && !errors.confirm;
  const submit = () => {
    setTried(true);
    if (valid) {
      onClose();
      onDone("Đã đổi mật khẩu thành công");
    }
  };
  return (
    <Modal title="Đổi mật khẩu" description="Dùng mật khẩu mạnh, không trùng với mật khẩu cũ." onClose={onClose}>
      <form
        className="grid gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <PasswordField label="Mật khẩu cũ" autoComplete="current-password" value={f.old} onChange={(v) => setF({ ...f, old: v })} error={tried ? errors.old : ""} />
        <PasswordField label="Mật khẩu mới" autoComplete="new-password" value={f.next} onChange={(v) => setF({ ...f, next: v })} error={tried ? errors.next : ""} />
        <PasswordField label="Xác nhận mật khẩu mới" autoComplete="new-password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} error={tried ? errors.confirm : ""} />
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
            Cập nhật mật khẩu
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AccountMenu({
  initials,
  name,
  subtitle,
  onLogout,
  showToast,
  dark = false,
}: {
  initials: string;
  name: string;
  subtitle: string;
  onLogout: () => void;
  showToast: (message: string) => void;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
        className={`flex h-10 max-w-full items-center gap-2.5 rounded-sm px-2 text-left ${dark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`grid size-8 shrink-0 place-items-center rounded-sm text-xs font-semibold ${dark ? "bg-white/15 text-white" : "bg-brand-50 text-brand-700 border border-brand-100"}`}>{initials}</span>
        <span className={`min-w-0 ${dark ? "" : "hidden sm:block"}`}>
          <span className={`block truncate text-sm font-semibold ${dark ? "font-heading text-base font-bold" : "text-slate-800"}`}>{name}</span>
          <span className={`block truncate text-xs ${dark ? "text-blue-100" : "text-slate-500"}`}>{subtitle}</span>
        </span>
        <Icon name="chevron" className={`size-4 shrink-0 rotate-90 ${dark ? "text-blue-100" : "text-slate-400"}`} />
      </button>
      {open && (
        <div role="menu" className={`absolute top-12 z-dropdown w-52 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md ${dark ? "left-0" : "right-0"}`}>
          <button
            role="menuitem"
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              setPw(true);
            }}
          >
            <Icon name="settings" className="size-4" /> Đổi mật khẩu
          </button>
          <button role="menuitem" type="button" className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-danger-600 hover:bg-danger-50" onClick={onLogout}>
            <Icon name="logout" className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
      {pw && <ChangePasswordModal onClose={() => setPw(false)} onDone={showToast} />}
    </div>
  );
}

const violationTypes = ["Về muộn", "Gây ồn", "Vệ sinh", "Khách ngoài", "Hút thuốc / cháy nổ"];
const penaltyForms = ["Nhắc nhở", "Cảnh cáo", "Phạt tiền"];

export function ViolationFields({
  type,
  level,
  fine,
  onType,
  onLevel,
  onFine,
  typeLabel = "Loại vi phạm",
}: {
  type: string;
  level: string;
  fine: string;
  onType: (v: string) => void;
  onLevel: (v: string) => void;
  onFine: (v: string) => void;
  typeLabel?: string;
}) {
  const [types, setTypes] = useState(violationTypes);
  const [levels, setLevels] = useState(penaltyForms);
  const grow = (list: string[], v: string) => (list.includes(v) ? list : [...list, v]);
  const isFine = level.trim().toLowerCase() === "phạt tiền";
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TagInput
          single
          label={typeLabel}
          value={type ? [type] : []}
          suggestions={types}
          placeholder="Chọn hoặc gõ loại mới"
          hint="Gõ tên mới rồi nhấn Enter."
          createLabel="Thêm loại"
          onChange={(v) => {
            const next = v[0] ?? "";
            onType(next);
            if (next) {
              setTypes(grow(types, next));
            }
          }}
        />
        <TagInput
          single
          label="Hình thức xử lý"
          value={level ? [level] : []}
          suggestions={levels}
          placeholder="Chọn hoặc gõ hình thức mới"
          hint="Gõ tên mới rồi nhấn Enter."
          createLabel="Thêm hình thức"
          onChange={(v) => {
            const next = v[0] ?? "";
            onLevel(next);
            if (next) {
              setLevels(grow(levels, next));
            }
          }}
        />
      </div>
      {isFine && (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Số tiền phạt (VNĐ)
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="VD: 100000"
              value={fine}
              onChange={(e) => onFine(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-200 bg-white px-3 pr-14 text-sm outline-none transition-colors focus:border-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VNĐ</span>
          </div>
        </label>
      )}
    </>
  );
}

const priorityStyle: Record<Priority, { cls: string; dot: string }> = {
  "Khẩn cấp": { cls: "bg-danger-50 text-danger-600 ring-danger-200 border border-danger-200", dot: "bg-danger-500" },
  Cao: { cls: "bg-warning-50 text-warning-600 ring-warning-200 border border-warning-200", dot: "bg-warning-500" },
  "Bình thường": { cls: "bg-brand-50 text-brand-700 ring-brand-200 border border-brand-200", dot: "bg-brand-500" },
};

export function PriorityTag({ priority, size = "sm" }: { priority: Priority; size?: "sm" | "lg" }) {
  const st = priorityStyle[priority];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium ring-1 ring-inset ${st.cls} ${size === "lg" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}>
      <span className={`size-1.5 rounded-sm ${st.dot}`} />
      {priority}
    </span>
  );
}

export function PriorityPicker({ value, onChange }: { value: Priority; onChange: (p: Priority) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Mức độ ưu tiên">
      {PRIORITIES.map((p) => {
        const on = value === p;
        const st = priorityStyle[p];
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(p)}
            className={`focus-ring flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm px-2 text-sm font-semibold ring-1 ring-inset transition-all active:translate-y-[1px] ${on ? `${st.cls} shadow-xs` : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
          >
            <span className={`size-1.5 rounded-sm ${on ? st.dot : "bg-slate-300"}`} />
            {p}
          </button>
        );
      })}
    </div>
  );
}
