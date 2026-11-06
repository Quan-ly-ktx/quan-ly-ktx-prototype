import { useState } from "react";
import { Button, Icon } from "../../components/common/index.ts";

function PwInput({
  label,
  value,
  onChange,
  error,
  auto,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  auto: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </span>
      <span className="relative block">
        <input
          className={`focus-ring h-10 w-full rounded-sm border bg-white pl-3 pr-16 text-sm outline-none focus:border-brand-500 ${
            error ? "border-danger-500" : "border-slate-200"
          }`}
          type={show ? "text" : "password"}
          autoComplete={auto}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="focus-ring absolute right-1.5 top-1/2 h-7 -translate-y-1/2 cursor-pointer rounded-sm px-2 text-xs font-medium text-brand-600 hover:bg-brand-50"
          onClick={() => setShow(!show)}
        >
          {show ? "Ẩn" : "Hiện"}
        </button>
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-danger-600">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

export function PasswordPage({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (message: string) => void;
}) {
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [tried, setTried] = useState(false);
  const errors = {
    old: f.old ? "" : "Vui lòng nhập mật khẩu cũ",
    next:
      f.next.length < 8
        ? "Mật khẩu mới cần tối thiểu 8 ký tự"
        : f.next === f.old
          ? "Mật khẩu mới phải khác mật khẩu cũ"
          : "",
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
        if (!errors.old && !errors.next && !errors.confirm)
          onDone("Đã đổi mật khẩu thành công");
      }}
    >
      <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-slate-200 bg-white/95 px-2 backdrop-blur">
        <Button
          label="Quay lại"
          className="grid size-9 place-items-center rounded-sm hover:bg-slate-100"
          onClick={onBack}
        >
          <Icon name="chevron" className="size-6 rotate-180" />
        </Button>
        <div className="text-base font-bold text-slate-900">Đổi mật khẩu</div>
      </div>
      <div className="flex-1 space-y-5 px-4 py-5">
        <p className="text-sm text-slate-500">
          Dùng mật khẩu mạnh, không trùng với mật khẩu cũ.
        </p>
        <PwInput
          label="Mật khẩu cũ"
          auto="current-password"
          value={f.old}
          onChange={(v) => setF({ ...f, old: v })}
          error={tried ? errors.old : ""}
        />
        <PwInput
          label="Mật khẩu mới"
          auto="new-password"
          value={f.next}
          onChange={(v) => setF({ ...f, next: v })}
          error={tried ? errors.next : ""}
        />
        <PwInput
          label="Xác nhận mật khẩu mới"
          auto="new-password"
          value={f.confirm}
          onChange={(v) => setF({ ...f, confirm: v })}
          error={tried ? errors.confirm : ""}
        />
        <ul className="space-y-2 rounded-sm bg-slate-100 p-3 text-xs">
          {rules.map(([label, ok]) => (
            <li
              key={label}
              className={`flex items-center gap-2 ${
                ok ? "font-semibold text-success-600" : "text-slate-500"
              }`}
            >
              <span
                className={`grid size-4 place-items-center rounded-sm ${
                  ok ? "bg-success-500 text-white" : "bg-slate-300"
                }`}
              >
                {ok && <Icon name="check" className="size-2.5" />}
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="submit"
          className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
        >
          Cập nhật mật khẩu
        </button>
      </div>
    </form>
  );
}
