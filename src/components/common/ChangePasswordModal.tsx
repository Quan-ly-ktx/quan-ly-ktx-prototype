import { useState } from "react";
import { authService } from "../../services/authService.ts";
import { demoChangePassword } from "../../services/mock/mockAuth.ts";
import { env } from "../../config/env.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { Modal } from "./Modal.tsx";

function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: string;
}) {
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
          className={`h-10 w-full rounded-sm border bg-white px-3 pr-16 text-sm outline-none transition-colors focus:border-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500 ${
            error ? "border-danger-500" : "border-slate-200"
          }`}
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
      {error && (
        <span className="text-xs font-normal text-danger-600">{error}</span>
      )}
    </label>
  );
}

export function ChangePasswordModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [f, setF] = useState({ old: "", next: "", confirm: "" });
  const [tried, setTried] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pending, setPending] = useState(false);
  const { logout } = useAuth();
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
  const valid = !errors.old && !errors.next && !errors.confirm;

  const submit = async () => {
    setTried(true);
    if (!valid || pending) return;
    setServerError("");
    setPending(true);
    try {
      if (env.USE_MOCK) demoChangePassword(f.old, f.next);
      else await authService.changePassword({ oldPassword: f.old, newPassword: f.next, confirmPassword: f.confirm });
      await logout();
      onClose();
      onDone("Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
    } catch {
      setServerError("Không thể đổi mật khẩu. Kiểm tra mật khẩu cũ và thử lại.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      description="Dùng mật khẩu mạnh, không trùng với mật khẩu cũ."
      onClose={onClose}
    >
      <form
        className="grid gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <PasswordField
          label="Mật khẩu cũ"
          autoComplete="current-password"
          value={f.old}
          onChange={(v) => setF({ ...f, old: v })}
          error={tried ? errors.old : ""}
        />
        <PasswordField
          label="Mật khẩu mới"
          autoComplete="new-password"
          value={f.next}
          onChange={(v) => setF({ ...f, next: v })}
          error={tried ? errors.next : ""}
        />
        <PasswordField
          label="Xác nhận mật khẩu mới"
          autoComplete="new-password"
          value={f.confirm}
          onChange={(v) => setF({ ...f, confirm: v })}
          error={tried ? errors.confirm : ""}
        />
        {serverError && <p role="alert" className="text-sm text-danger-600">{serverError}</p>}
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </form>
    </Modal>
  );
}
