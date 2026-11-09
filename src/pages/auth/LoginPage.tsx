import { useState } from "react";
import type React from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import type { Role, LoginRequest } from "../../types/auth.ts";
import { authService } from "../../services/authService.ts";
import { env } from "../../config/env.ts";
import { demoRequestOtp, demoResetPassword, demoVerifyOtp } from "../../services/mock/mockAuth.ts";

const demoAccounts: { role: Role; label: string; email: string }[] = [
  { role: "manager", label: "Quản lý", email: "manager@gmail.com" },
  { role: "tenant", label: "Người thuê", email: "079203001187" },
  { role: "tenant", label: "Khách đã checkout", email: "000000000001" },
  { role: "technician", label: "Kỹ thuật viên", email: "thinh.vv@ktxhub.vn" },
];

export function LoginPage({
  onLogin,
}: {
  onLogin: (roleOrCredentials: Role | LoginRequest) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^(?:\d{12}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(email.trim()) || !password) {
      setError("Thông tin đăng nhập không hợp lệ.");
      return;
    }

    // Real Backend Authentication
    setSubmitting(true);
    try {
      await onLogin({
        identifier: email.trim(),
        password,
      });
    } catch {
      setError("Thông tin đăng nhập không hợp lệ hoặc không thể kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotStep = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (forgotStep === 1) {
      if (!/^(?:\d{12}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(forgotEmail.trim())) {
        setForgotError("Vui lòng nhập email hoặc CCCD 12 chữ số hợp lệ.");
        return;
      }
      if (!env.USE_MOCK && /^\d{12}$/.test(forgotEmail.trim())) {
        setForgotError("Khôi phục bằng CCCD chưa có contract API. Vui lòng liên hệ quản lý.");
        return;
      }
      setForgotLoading(true);
      try {
        if (!env.USE_MOCK) {
          await authService.forgotPassword({ email: forgotEmail });
        } else {
          setDemoOtp(demoRequestOtp(forgotEmail));
        }
        setForgotStep(2);
      } catch {
        setForgotError("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      } finally {
        setForgotLoading(false);
      }
    } else if (forgotStep === 2) {
      if (!/^\d{6}$/.test(forgotOtp)) {
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
          demoVerifyOtp(forgotEmail, forgotOtp);
        }
        setForgotStep(3);
      } catch {
        setForgotError("Mã không hợp lệ hoặc đã hết hạn.");
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
        } else {
          demoResetPassword(forgotEmail, newPassword);
        }
        setForgotSuccess("Nếu tài khoản hợp lệ, mật khẩu đã được đặt lại. Hãy thử đăng nhập.");
        window.setTimeout(() => {
          setForgotOpen(false);
          setForgotStep(1);
          setForgotError("");
          setForgotSuccess("");
        }, 1200);
      } catch {
        setForgotError("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
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
                Email hoặc CCCD
              </span>
              <span className="relative block">
                <Icon
                  name="tenants"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  autoFocus
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500"
                  disabled={submitting}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email nhân viên hoặc CCCD người thuê"
                  type="text"
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
              <span />
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
          {env.USE_MOCK && <div className="mt-6 rounded-sm border border-slate-200 bg-slate-50 p-3.5">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tài khoản demo · mật khẩu Demo1234!
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {demoAccounts.map((account) => (
                <button
                  className="focus-ring flex flex-col justify-between min-h-12 cursor-pointer rounded-sm border border-slate-200 bg-white p-2 text-left hover:border-brand-500 hover:bg-brand-50 active:translate-y-[1px] transition-all"
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email);
                    setError("");
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="block text-xs font-semibold text-slate-800">
                      {account.label}
                    </span>
                    <span className={`inline-block rounded-xs px-1 text-[9px] font-bold uppercase tracking-wider ${
                      account.role === "manager"
                        ? "bg-brand-100 text-brand-700"
                        : account.role === "technician"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700"
                    }`}>
                      {account.role === "manager" ? "Quản lý" : account.role === "technician" ? "Kỹ thuật" : "Thuê"}
                    </span>
                  </div>
                  <span className="block truncate font-mono text-[11px] text-slate-500 mt-1">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          </div>}
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
            setForgotOtp("");
            setDemoOtp("");
            setResetToken("");
            setNewPassword("");
            setConfirmPassword("");
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
                  Email hoặc CCCD
                </span>
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  placeholder="Email hoặc CCCD"
                  type="text"
                />
                <span className="mt-2 block text-xs text-slate-500">
                  {env.USE_MOCK ? "Chế độ demo không gửi email thật." : "Nếu thông tin hợp lệ, mã sẽ được gửi tới email đã đăng ký."}
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
                {env.USE_MOCK && <p className="mt-3 text-center text-xs text-slate-500">Mã demo (không gửi email): {demoOtp}. Có hiệu lực 5 phút, tối đa 5 lần thử.</p>}
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
                <p className="text-xs text-slate-500">Mật khẩu mới cần ít nhất 6 ký tự.</p>
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
