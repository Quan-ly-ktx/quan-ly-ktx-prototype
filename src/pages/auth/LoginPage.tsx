import { useState } from "react";
import type React from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import { resolveRole } from "../../utils/authUtils.ts";
import type { Role, LoginRequest } from "../../types/auth.ts";
import { authService } from "../../services/authService.ts";
import { toFrontendRole } from "../../services/api/adapters/authAdapter.ts";
import { ApiError } from "../../services/httpClient.ts";
import { env } from "../../config/env.ts";

const demoAccounts: { role: Role; label: string; email: string }[] = [
  { role: "manager", label: "Quản lý", email: "manager@gmail.com" },
  { role: "student", label: "Người thuê", email: "student@gmail.com" },
  { role: "technician", label: "Kỹ thuật viên", email: "technician@gmail.com" },
];

export function LoginPage({
  onLogin,
}: {
  onLogin: (roleOrCredentials: Role | LoginRequest) => void;
}) {
  const [email, setEmail] = useState("manager@gmail.com");
  const [password, setPassword] = useState("SecurePassword123!");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("admin@ktxhub.vn");
  const [forgotOtp, setForgotOtp] = useState("246810");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("NewPassword123!");
  const [confirmPassword, setConfirmPassword] = useState("NewPassword123!");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    setSubmitting(true);

    try {
      if (!env.USE_MOCK) {
        // Real Backend Authentication
        try {
          const authRes = await authService.login({
            identifier: email,
            password,
          });
          const role = toFrontendRole(authRes.user.role);
          onLogin(role);
        } catch (err: unknown) {
          if (err instanceof ApiError) {
            setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Đăng nhập thất bại. Vui lòng thử lại.");
          }
          return;
        }
      } else {
        // Mock Mode / Offline Fallback
        const role = resolveRole(email);
        if (!role) {
          setError(
            "Tài khoản Gmail không hợp lệ. Hãy dùng manager@gmail.com, student@gmail.com hoặc technician@gmail.com.",
          );
          return;
        }

        window.setTimeout(() => {
          onLogin(role);
        }, 650);
      }
    } finally {
      if (!env.USE_MOCK) {
        setSubmitting(false);
      }
    }
  };

  const handleForgotStep = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (forgotStep === 1) {
      if (!forgotEmail) {
        setForgotError("Vui lòng nhập email hợp lệ.");
        return;
      }
      setForgotLoading(true);
      try {
        if (!env.USE_MOCK) {
          await authService.forgotPassword({ email: forgotEmail });
        }
        setForgotStep(2);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setForgotError(err.message || "Gửi mã OTP thất bại.");
        } else if (err instanceof Error) {
          setForgotError(err.message);
        } else {
          setForgotError("Có lỗi xảy ra khi gửi mã OTP.");
        }
      } finally {
        setForgotLoading(false);
      }
    } else if (forgotStep === 2) {
      if (!forgotOtp || forgotOtp.length < 6) {
        setForgotError("Mã xác thực OTP gồm 6 chữ số.");
        return;
      }
      setForgotLoading(true);
      try {
        if (!env.USE_MOCK) {
          const res = await authService.verifyForgotPasswordOtp({
            email: forgotEmail,
            otp: forgotOtp,
          });
          setResetToken(res.resetToken);
        } else {
          setResetToken("mock_reset_token");
        }
        setForgotStep(3);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setForgotError(err.message || "Mã OTP không hợp lệ.");
        } else if (err instanceof Error) {
          setForgotError(err.message);
        } else {
          setForgotError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        }
      } finally {
        setForgotLoading(false);
      }
    } else if (forgotStep === 3) {
      if (newPassword.length < 6) {
        setForgotError("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setForgotError("Xác nhận mật khẩu không trùng khớp.");
        return;
      }
      setForgotLoading(true);
      try {
        if (!env.USE_MOCK) {
          await authService.resetPassword({
            email: forgotEmail,
            resetToken,
            newPassword,
            confirmPassword,
          });
        }
        setForgotSuccess("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.");
        window.setTimeout(() => {
          setForgotOpen(false);
          setForgotStep(1);
          setForgotError("");
          setForgotSuccess("");
        }, 1200);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setForgotError(err.message || "Đặt lại mật khẩu thất bại.");
        } else if (err instanceof Error) {
          setForgotError(err.message);
        } else {
          setForgotError("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
        }
      } finally {
        setForgotLoading(false);
      }
    }
  };

  return (
    <main className="grid min-h-[100dvh] bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-sm bg-brand-500 text-white">
            <Icon name="building" className="size-5" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold tracking-tight">
              KTX Hub
            </div>
            <div className="font-mono text-xs text-slate-400">
              Rental Property Management
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-300">
            <Icon name="activity" className="size-3.5 text-brand-500" />
            Hệ thống vận hành 99,8%
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            Quản lý nhà cho thuê thông minh, tinh gọn và minh bạch.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
            Từ từng vị trí phòng, hợp đồng đến tiếp nhận sự cố kỹ thuật, tất cả
            được quản lý tập trung trên một giao diện thống nhất.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["180", "Vị trí quản lý"],
              ["24/7", "Đối soát VietQR"],
              ["100%", "Hồ sơ tập trung"],
            ].map(([value, label]) => (
              <div
                className="rounded-sm border border-slate-700/60 bg-slate-800/60 p-3.5"
                key={label}
              >
                <div className="font-mono text-2xl font-bold text-white">
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 font-mono text-xs text-slate-400">
          <Icon name="settings" className="size-3.5" />
          Nền tảng vận hành dành cho quản lý nhà cho thuê
        </div>
      </section>

      <section className="flex min-h-[100dvh] items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-sm bg-brand-500 text-white">
              <Icon name="building" className="size-4" />
            </div>
            <div className="font-heading text-lg font-bold text-slate-900">
              KTX Hub
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">
              CỔNG ĐĂNG NHẬP
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              Chào mừng trở lại
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Đăng nhập để tiếp tục quản lý cơ sở cho thuê của bạn.
            </p>
          </div>

          {error && (
            <div
              className="mb-4 flex gap-2.5 rounded-sm border border-danger-200 bg-danger-50 p-3 text-xs text-danger-600"
              role="alert"
            >
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-700">
                Tài khoản Gmail
              </span>
              <span className="relative block">
                <Icon
                  name="students"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  autoFocus
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500"
                  disabled={submitting}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ten@gmail.com"
                  type="email"
                  value={email}
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-700">
                Mật khẩu
              </span>
              <span className="relative block">
                <Icon
                  name="contract"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white pl-9 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500"
                  disabled={submitting}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <Button
                  label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon name="search" className="size-4" />
                </Button>
              </span>
            </label>
            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  checked={remember}
                  className="size-3.5 rounded-sm accent-brand-500"
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />
                Ghi nhớ đăng nhập
              </label>
              <Button
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                onClick={() => {
                  setForgotError("");
                  setForgotSuccess("");
                  setForgotOpen(true);
                }}
              >
                Quên mật khẩu?
              </Button>
            </div>
            <button
              className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:translate-y-[1px] disabled:cursor-wait disabled:opacity-75"
              disabled={submitting}
              type="submit"
            >
              {submitting ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập vào hệ thống
                  <Icon name="chevron" className="size-3.5 rotate-90" />
                </>
              )}
            </button>
          </form>
          <div className="mt-6 rounded-sm border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tài khoản demo theo phân quyền
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {demoAccounts.map((account) => (
                <button
                  className="focus-ring min-h-10 cursor-pointer rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:border-brand-500 hover:bg-brand-50 active:translate-y-[1px] transition-all"
                  key={account.role}
                  onClick={() => {
                    setEmail(account.email);
                    setError("");
                  }}
                  type="button"
                >
                  <span className="block text-xs font-semibold text-slate-800">
                    {account.label}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-slate-500">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {forgotOpen && (
        <Modal
          title="Khôi phục mật khẩu"
          description={`Bước ${forgotStep}/3 · ${
            forgotStep === 1
              ? "Xác minh tài khoản"
              : forgotStep === 2
                ? "Nhập mã OTP"
                : "Tạo mật khẩu mới"
          }`}
          onClose={() => {
            setForgotOpen(false);
            setForgotStep(1);
            setForgotError("");
            setForgotSuccess("");
          }}
        >
          <div className="p-6">
            <div className="mb-6 flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  className={`h-1 flex-1 rounded-sm ${
                    step <= forgotStep ? "bg-brand-500" : "bg-slate-100"
                  }`}
                  key={step}
                />
              ))}
            </div>

            {forgotError && (
              <div
                className="mb-4 flex gap-2.5 rounded-sm border border-danger-200 bg-danger-50 p-3 text-xs text-danger-600"
                role="alert"
              >
                <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div
                className="mb-4 flex gap-2.5 rounded-sm border border-success-200 bg-success-50 p-3 text-xs text-success-600"
                role="status"
              >
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email quản trị
                </span>
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  placeholder="admin@ktxhub.vn"
                  type="email"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Mã OTP 6 số sẽ được gửi đến email này.
                </span>
              </label>
            )}
            {forgotStep === 2 && (
              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Mã xác thực OTP
                  </span>
                  <input
                    className="focus-ring h-11 w-full rounded-sm border border-slate-200 px-3 text-center font-mono text-xl tracking-[0.45em] outline-none focus:border-brand-500"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    disabled={forgotLoading}
                    inputMode="numeric"
                    maxLength={6}
                  />
                </label>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Gửi lại mã sau 00:48
                </p>
              </div>
            )}
            {forgotStep === 3 && (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Mật khẩu mới
                  </span>
                  <input
                    className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={forgotLoading}
                    type="password"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Xác nhận mật khẩu mới
                  </span>
                  <input
                    className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={forgotLoading}
                    type="password"
                  />
                </label>
                <div className="rounded-sm border border-success-200 bg-success-50 p-2.5 text-xs text-success-600">
                  Mật khẩu đạt yêu cầu: có chữ hoa, chữ số và ký tự đặc biệt.
                </div>
              </div>
            )}
            <Button
              className="mt-6 flex h-10 w-full items-center justify-center rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:opacity-75"
              disabled={forgotLoading}
              onClick={handleForgotStep}
            >
              {forgotLoading ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : forgotStep === 1 ? (
                "Gửi mã OTP"
              ) : forgotStep === 2 ? (
                "Xác minh mã"
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
