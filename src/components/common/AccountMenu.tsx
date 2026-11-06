import { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon.tsx";
import { ChangePasswordModal } from "./ChangePasswordModal.tsx";

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
        className={`flex h-10 max-w-full items-center gap-2.5 rounded-sm px-2 text-left ${
          dark ? "hover:bg-white/10" : "hover:bg-slate-100"
        }`}
        onClick={() => setOpen(!open)}
      >
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-sm text-xs font-semibold ${
            dark
              ? "bg-white/15 text-white"
              : "bg-brand-50 text-brand-700 border border-brand-100"
          }`}
        >
          {initials}
        </span>
        <span className={`min-w-0 ${dark ? "" : "hidden sm:block"}`}>
          <span
            className={`block truncate text-sm font-semibold ${
              dark ? "font-heading text-base font-bold" : "text-slate-800"
            }`}
          >
            {name}
          </span>
          <span
            className={`block truncate text-xs ${
              dark ? "text-blue-100" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        </span>
        <Icon
          name="chevron"
          className={`size-4 shrink-0 rotate-90 ${
            dark ? "text-blue-100" : "text-slate-400"
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute top-12 z-dropdown w-52 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md ${
            dark ? "left-0" : "right-0"
          }`}
        >
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
          <button
            role="menuitem"
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-danger-600 hover:bg-danger-50"
            onClick={onLogout}
          >
            <Icon name="logout" className="size-4" /> Đăng xuất
          </button>
        </div>
      )}

      {pw && (
        <ChangePasswordModal onClose={() => setPw(false)} onDone={showToast} />
      )}
    </div>
  );
}
