import { useState } from "react";
import type React from "react";
import { Button, Icon } from "../../components/common/index.ts";
import { PasswordPage } from "./PasswordPage.tsx";
import type { Profile } from "./technicianConstants.ts";

export function SettingsTab({
  profile,
  initials,
  onSave,
  onLogout,
  showToast,
}: {
  profile: Profile;
  initials: string;
  onSave: (p: Profile) => void;
  onLogout: () => void;
  showToast: (m: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [pwPage, setPwPage] = useState(false);
  const field =
    "focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500";

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft.name.trim().length < 2)
      return showToast("Vui lòng nhập họ và tên");
    if (!/^0\d{9}$/.test(draft.phone.replace(/\s/g, "")))
      return showToast("Số điện thoại cần 10 chữ số");
    onSave({ ...draft, name: draft.name.trim() });
    setEditing(false);
    showToast("Đã cập nhật thông tin cá nhân");
  };

  if (pwPage) {
    return (
      <PasswordPage
        onBack={() => setPwPage(false)}
        onDone={(m) => {
          setPwPage(false);
          showToast(m);
        }}
      />
    );
  }

  if (editing) {
    return (
      <form className="flex flex-1 flex-col" onSubmit={save}>
        <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
          <Button
            label="Quay lại"
            className="grid size-9 place-items-center rounded-sm hover:bg-slate-100"
            onClick={() => {
              setDraft(profile);
              setEditing(false);
            }}
          >
            <Icon name="chevron" className="size-6 rotate-180" />
          </Button>
          <div className="text-base font-bold text-slate-900">
            Thông tin cá nhân
          </div>
        </div>
        <div className="flex-1 space-y-5 px-4 py-5">
          {(
            [
              ["Họ và tên", "name", "text"],
              ["Số điện thoại", "phone", "tel"],
              ["Email đăng nhập", "email", "email"],
            ] as const
          ).map(([label, key, type]) => (
            <label className="block" key={key}>
              <span className="mb-2 block text-sm font-semibold text-slate-800">
                {label}
              </span>
              <input
                className={`${field} ${
                  key === "email" ? "bg-slate-100 text-slate-500" : ""
                }`}
                type={type}
                readOnly={key === "email"}
                value={draft[key]}
                onChange={(e) =>
                  setDraft({ ...draft, [key]: e.target.value })
                }
              />
              {key === "email" && (
                <span className="mt-1.5 block text-xs text-slate-500">
                  Email do quản lý cấp, không thể tự đổi.
                </span>
              )}
            </label>
          ))}
        </div>
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
          <button
            type="submit"
            className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
          >
            <Icon name="check" className="size-4" />
            Lưu thay đổi
          </button>
        </div>
      </form>
    );
  }

  const rows = [
    {
      icon: "user" as const,
      label: "Thông tin cá nhân",
      hint: "Họ tên, số điện thoại",
      action: () => {
        setDraft(profile);
        setEditing(true);
      },
      tone: "text-slate-900",
    },
    {
      icon: "settings" as const,
      label: "Đổi mật khẩu",
      hint: "Cập nhật mật khẩu đăng nhập",
      action: () => setPwPage(true),
      tone: "text-slate-900",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-brand-700 px-4 pb-14 pt-6 text-white">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Cài đặt
        </h1>
      </header>
      <div className="relative z-10 -mt-9 px-4">
        <div className="flex items-center gap-3 rounded-sm bg-white p-3.5 shadow-xs ring-1 ring-slate-200">
          <span className="grid size-12 shrink-0 place-items-center rounded-sm bg-brand-50 font-mono text-base font-bold text-brand-700 border border-brand-100">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="truncate font-heading text-base font-bold text-slate-900">
              {profile.name}
            </div>
            <div className="truncate font-mono text-xs text-slate-500">
              {profile.email}
            </div>
          </div>
        </div>
      </div>

      <ul className="mx-4 mt-4 divide-y divide-slate-100 overflow-hidden rounded-sm border border-slate-200 bg-white">
        {rows.map((r) => (
          <li key={r.label}>
            <button
              type="button"
              onClick={r.action}
              className="focus-ring flex min-h-16 w-full cursor-pointer items-center gap-4 px-4 text-left active:bg-slate-50"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-slate-100 text-slate-600">
                <Icon name={r.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-base font-semibold ${r.tone}`}>
                  {r.label}
                </span>
                <span className="block text-xs text-slate-500">{r.hint}</span>
              </span>
              <Icon name="chevron" className="size-4 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-4">
        <button
          type="button"
          onClick={onLogout}
          className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-danger-200 bg-danger-50 text-sm font-semibold text-danger-600 active:translate-y-[1px]"
        >
          <Icon name="logout" className="size-4" />
          Đăng xuất
        </button>
      </div>
      <p className="mt-6 pb-6 text-center text-xs text-slate-400">
        KTX Hub · Ứng dụng kỹ thuật viên
      </p>
    </div>
  );
}
