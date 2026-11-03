import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  ChangePasswordModal,
  Select,
  TagInput,
  type IconName,
} from "./shared"
import {
  ContractsPage,
  InvoicesPage,
  IncidentsPage,
  DashboardInsights,
  FinancialPage,
  VehiclesPage,
  TechnicianAccountsPage,
} from "./admin"
import { RoomsPage } from "./rooms"
import { GlobalSearch, QuickModals, type QuickKind } from "./quick"
import { TenantPortal } from "./student"
import { TechnicianApp } from "./technician"
import {
  initialInvoices,
  initialRooms,
  initialTenants,
  initialTickets,
  money,
  person,
  rentalSlots,
  type Invoice,
  type Role,
  type RoomRecord,
  type TenantRecord,
  type Ticket,
} from "./data"
import { isSlotAvailable, slotKey } from "./domain"

const navGroups = [
  {
    label: "TỔNG QUAN",
    items: [
      { label: "Bảng điều khiển", icon: "dashboard" as IconName },
      { label: "Phòng & giường", icon: "grid" as IconName },
    ],
  },
  {
    label: "VẬN HÀNH",
    items: [
      { label: "Người thuê", icon: "students" as IconName },
      { label: "Phương tiện", icon: "clipboard" as IconName },
      { label: "Hợp đồng", icon: "contract" as IconName },
      { label: "Hóa đơn", icon: "invoice" as IconName, badge: "12" },
      { label: "Tài chính", icon: "wallet" as IconName },
      { label: "Sự cố & kỷ luật", icon: "tools" as IconName, badge: "4" },
    ],
  },
  {
    label: "HỆ THỐNG",
    items: [
      { label: "Kĩ thuật viên", icon: "settings" as IconName },
    ],
  },
]

const kpis = [
  {
    label: "Tỷ lệ lấp đầy",
    value: "87,7%",
    detail: "158 / 180 giường",
    change: "+3,2%",
    icon: "bed" as IconName,
    tone: "brand",
  },
  {
    label: "Doanh thu tháng 10",
    value: "145,2 tr",
    detail: "Đã thu 94,4 triệu",
    change: "+8,4%",
    icon: "wallet" as IconName,
    tone: "success",
  },
  {
    label: "Công nợ quá hạn",
    value: "18,4 tr",
    detail: "12 người thuê",
    change: "Cần xử lý",
    icon: "receipt" as IconName,
    tone: "danger",
  },
  {
    label: "Sự cố chờ xử lý",
    value: "4 phiếu",
    detail: "2 phiếu mới hôm nay",
    change: "Mới hôm nay",
    icon: "tools" as IconName,
    tone: "warning",
  },
]

const revenue = [
  { month: "T5", value: "112", height: "bar-56" },
  { month: "T6", value: "120", height: "bar-62" },
  { month: "T7", value: "116", height: "bar-59" },
  { month: "T8", value: "132", height: "bar-72" },
  { month: "T9", value: "138", height: "bar-79" },
  { month: "T10", value: "145", height: "bar-88" },
]

const alerts = [
  {
    title: "Hóa đơn quá hạn trên 5 ngày",
    detail: "12 người thuê · 18.400.000 đ",
    time: "Cập nhật 10 phút trước",
    icon: "receipt" as IconName,
    tone: "danger",
  },
  {
    title: "Rò rỉ nước tại phòng P.401",
    detail: "Phiếu mới · Chưa phân công",
    time: "Đã chờ 35 phút",
    icon: "droplet" as IconName,
    tone: "warning",
  },
  {
    title: "5 vị trí thuê còn trống",
    detail: "Sẵn sàng gán cho người thuê mới",
    time: "Cập nhật hôm nay",
    icon: "clipboard" as IconName,
    tone: "brand",
  },
]

const quickActions: {
  kind?: QuickKind
  nav?: string
  label: string
  helper: string
  icon: IconName
  tone: string
}[] = [
  {
    nav: "Người thuê",
    label: "Thêm người thuê",
    helper: "Tạo hồ sơ và gán phòng",
    icon: "clipboard" as IconName,
    tone: "brand",
  },
  {
    kind: "dispatch" as QuickKind,
    label: "Phân công thợ",
    helper: "4 phiếu chờ xử lý",
    icon: "tools" as IconName,
    tone: "info",
  },
  {
    kind: "receipt" as QuickKind,
    label: "Tạo phiếu thu",
    helper: "Ghi nhận thanh toán",
    icon: "receipt" as IconName,
    tone: "success",
  },
  {
    kind: "report" as QuickKind,
    label: "Lập biên bản",
    helper: "Sự cố hoặc vi phạm",
    icon: "file" as IconName,
    tone: "warning",
  },
]

const recentPayments = [
  {
    name: "Nguyễn Minh Anh",
    room: "P.302 · G02",
    amount: "1.525.000 đ",
    status: "Đã thanh toán",
    time: "09:42",
  },
  {
    name: "Trần Quốc Bảo",
    room: "P.205 · G04",
    amount: "1.460.000 đ",
    status: "Đã thanh toán",
    time: "09:18",
  },
  {
    name: "Lê Hoàng Nam",
    room: "P.401 · G01",
    amount: "1.595.000 đ",
    status: "Chờ đối soát",
    time: "08:55",
  },
]

const demoAccounts: { role: Role; label: string; email: string }[] = [
  { role: "manager", label: "Quản lý", email: "manager@gmail.com" },
  { role: "student", label: "Người thuê", email: "student@gmail.com" },
  { role: "technician", label: "Kỹ thuật viên", email: "technician@gmail.com" },
]

function resolveRole(email: string): Role | null {
  const value = email.trim().toLowerCase()
  if (!/^[^\s@]+@gmail\.com$/.test(value)) return null
  if (value.startsWith("student")) return "student"
  if (value.startsWith("tech")) return "technician"
  if (value.startsWith("manager") || value.startsWith("admin")) return "manager"
  return null
}

function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("manager@gmail.com")
  const [password, setPassword] = useState("SecurePassword123!")
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const role = resolveRole(email)
    if (!role) {
      setError(
        "Tài khoản Gmail không hợp lệ. Hãy dùng manager@gmail.com, student@gmail.com hoặc technician@gmail.com.",
      )
      return
    }
    if (password.length < 6) {
      setError("Mật khẩu phải chứa ít nhất 6 ký tự.")
      return
    }
    setError("")
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      onLogin(role)
    }, 650)
  }

  return (
    <main className="grid min-h-[100dvh] bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-sm bg-brand-500 text-white">
            <Icon name="building" className="size-5" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold tracking-tight">KTX Hub</div>
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
                <div className="font-mono text-2xl font-bold text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {label}
                </div>
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
                onClick={() => setForgotOpen(true)}
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
                    setEmail(account.email)
                    setError("")
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
            setForgotOpen(false)
            setForgotStep(1)
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
            {forgotStep === 1 && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Email quản trị
                </span>
                <input
                  className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                  defaultValue="admin@ktxhub.vn"
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
                    defaultValue="246810"
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
                    defaultValue="NewPassword123!"
                    type="password"
                  />
                </label>
                <div className="rounded-sm border border-success-200 bg-success-50 p-2.5 text-xs text-success-600">
                  Mật khẩu đạt yêu cầu: có chữ hoa, chữ số và ký tự đặc biệt.
                </div>
              </div>
            )}
            <Button
              className="mt-6 flex h-10 w-full items-center justify-center rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                if (forgotStep < 3) setForgotStep(forgotStep + 1)
                else {
                  setForgotOpen(false)
                  setForgotStep(1)
                }
              }}
            >
              {forgotStep === 1
                ? "Gửi mã OTP"
                : forgotStep === 2
                  ? "Xác minh mã"
                  : "Đặt lại mật khẩu"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  )
}


const emptyTenantForm = {
  name: "",
  gender: "Nam" as "Nam" | "Nữ",
  phone: "",
  cccd: "",
  email: "",
  address: "",
  slot: "",
  start: "2026-09-01",
  end: "2027-09-01",
  deposit: "",
}

function TenantsPage({
  tenants,
  onTenantsChange,
  showToast,
}: {
  tenants: TenantRecord[]
  onTenantsChange: (tenants: TenantRecord[]) => void
  showToast: (message: string) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected] = useState<TenantRecord | null>(null)
  const [profileTab, setProfileTab] = useState("Thông tin cá nhân")
  const [query, setQuery] = useState("")
  const [form, setForm] = useState(emptyTenantForm)
  const filtered = tenants.filter((tenant) =>
    `${tenant.cccd} ${tenant.email} ${tenant.name} ${tenant.phone} ${tenant.room} ${tenant.bed}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  const availableSlots = rentalSlots.filter((slot) => {
    if (slot.status !== "Sẵn sàng") return false
    if (!isSlotAvailable(tenants, slot.room, slot.bed)) return false
    const room = initialRooms.find((r) => r.code === slot.room)
    return !room || room.gender === form.gender
  })
  const chosenSlot = availableSlots.find(
    (slot) => slotKey(slot.room, slot.bed) === form.slot,
  )

  const createTenant = () => {
    const phone = form.phone.replace(/\s/g, "")
    if (form.name.trim().length < 2) return showToast("Vui lòng nhập họ và tên")
    if (!/^0\d{9}$/.test(phone)) return showToast("Số điện thoại cần đúng 10 chữ số")
    if (!/^\d{12}$/.test(form.cccd)) return showToast("CCCD cần đúng 12 chữ số")
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return showToast("Email không hợp lệ")
    if (!form.address.trim()) return showToast("Vui lòng nhập địa chỉ thường trú")
    if (!chosenSlot) return showToast("Vui lòng chọn vị trí thuê còn trống")
    if (new Date(form.end) <= new Date(form.start)) return showToast("Ngày kết thúc phải sau ngày bắt đầu")
    if (Number(form.deposit) < 0) return showToast("Tiền cọc không hợp lệ")
    if (tenants.some((tenant) => tenant.cccd === form.cccd)) return showToast("CCCD đã tồn tại")
    if (tenants.some((tenant) => tenant.email.toLowerCase() === form.email.toLowerCase())) return showToast("Email đã tồn tại")
    if (!isSlotAvailable(tenants, chosenSlot.room, chosenSlot.bed)) return showToast("Vị trí này vừa được gán cho người thuê khác")

    const tenant: TenantRecord = {
      id: `NT-${String(187 + tenants.length).padStart(4, "0")}`,
      name: form.name.trim(),
      gender: form.gender,
      phone,
      cccd: form.cccd,
      email: form.email.trim().toLowerCase(),
      address: form.address.trim(),
      room: chosenSlot.room,
      bed: chosenSlot.bed,
      start: new Date(form.start).toLocaleDateString("vi-VN"),
      end: new Date(form.end).toLocaleDateString("vi-VN"),
      monthlyRent: chosenSlot.monthlyRent,
      deposit: Number(form.deposit) || chosenSlot.monthlyRent,
      status: "Đang thuê",
    }
    onTenantsChange([tenant, ...tenants])
    setForm(emptyTenantForm)
    setAddOpen(false)
    showToast(`Đã tạo hồ sơ và gán ${tenant.room}-${tenant.bed} cho ${tenant.name}`)
  }

  return (
    <>
      <PageHeader
        eyebrow="Người thuê"
        title="Hồ sơ người thuê"
        description="Quản lý thông tin định danh, vị trí thuê và hợp đồng của người đang thuê."
        actions={
          <>
            <Button
              className="flex h-10 items-center gap-2 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => showToast(`Đã xuất ${tenants.length} hồ sơ người thuê`)}
            >
              <Icon name="report" className="size-4" /> Xuất Excel
            </Button>
            <Button
              className="flex h-10 items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                setForm({ ...emptyTenantForm, slot: availableSlots[0] ? slotKey(availableSlots[0].room, availableSlots[0].bed) : "" })
                setAddOpen(true)
              }}
            >
              <Icon name="userPlus" className="size-4" /> Thêm người thuê
            </Button>
          </>
        }
      />
      <section className="mb-4 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-2">
            <span className="sr-only">Tìm hồ sơ người thuê</span>
            <Icon name="search" className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm họ tên, CCCD, email, SĐT, phòng..."
              value={query}
            />
          </label>
          <Select label="Phòng" value="Tất cả phòng" options={["Tất cả phòng", ...Array.from(new Set(tenants.map((tenant) => tenant.room)))]} onChange={() => undefined} />
          <Select label="Trạng thái" value="Tất cả trạng thái" options={["Tất cả trạng thái", "Đang thuê", "Sắp hết HĐ", "Đã trả phòng"]} onChange={() => undefined} />
        </div>
      </section>
      <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 border-collapse text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Người thuê</th><th className="px-5 py-3">CCCD</th><th className="px-5 py-3">Liên hệ</th><th className="px-5 py-3">Phòng / Vị trí</th><th className="px-5 py-3">Giá thuê</th><th className="px-5 py-3">Hạn hợp đồng</th><th className="px-5 py-3">Trạng thái</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tenant) => (
                <tr className="cursor-pointer hover:bg-slate-50" key={tenant.id} onClick={() => setSelected(tenant)}>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">{tenant.name.split(" ").slice(-2).map((part) => part[0]).join("")}</span><div><div className="text-sm font-semibold text-slate-800">{tenant.name}</div><div className="mt-0.5 text-xs text-slate-500">{tenant.id}</div></div></div></td>
                  <td className="px-5 py-4 font-mono text-sm font-medium text-slate-600">{tenant.cccd}</td>
                  <td className="px-5 py-4"><div className="text-sm text-slate-700">{tenant.phone}</div><div className="mt-1 text-xs text-slate-500">{tenant.email}</div></td>
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-brand-700">{tenant.room} · {tenant.bed}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{money(tenant.monthlyRent)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{tenant.end}</td>
                  <td className="px-5 py-4"><span className={`status-label ${tenant.status === "Đang thuê" ? "status-label-success" : tenant.status === "Sắp hết HĐ" ? "status-label-warning" : "bg-slate-100 text-slate-600"}`}>{tenant.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">Không tìm thấy người thuê phù hợp.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">Hiển thị {filtered.length} trên tổng số {tenants.length} người thuê</div>
      </section>

      {addOpen && (
        <Modal title="Thêm người thuê và gán phòng" description="Tạo hồ sơ sau khi khách đồng ý thuê và giữ ngay một vị trí còn trống." onClose={() => setAddOpen(false)} wide>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Họ và tên<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Giới tính<select className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-sm" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as "Nam" | "Nữ" })}><option>Nam</option><option>Nữ</option></select></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Số điện thoại<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="0912 345 678" /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">CCCD<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono text-sm" value={form.cccd} onChange={(event) => setForm({ ...form, cccd: event.target.value.replace(/\D/g, "").slice(0, 12) })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Email<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Địa chỉ thường trú<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">Vị trí thuê còn trống<select className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-sm" value={form.slot} onChange={(event) => setForm({ ...form, slot: event.target.value })}>{availableSlots.length === 0 && <option value="">Không còn vị trí trống</option>}{availableSlots.map((slot) => <option key={slotKey(slot.room, slot.bed)} value={slotKey(slot.room, slot.bed)}>{slot.room} · {slot.bed} · Tầng {slot.floor} · {money(slot.monthlyRent)}/tháng</option>)}</select></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Ngày bắt đầu<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm" type="date" value={form.start} onChange={(event) => setForm({ ...form, start: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Ngày kết thúc<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm" type="date" value={form.end} onChange={(event) => setForm({ ...form, end: event.target.value })} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Tiền thuê / tháng<input className="h-10 rounded-sm border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 font-mono" readOnly value={chosenSlot ? money(chosenSlot.monthlyRent) : "—"} /></label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Tiền cọc<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm font-mono" inputMode="numeric" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value.replace(/\D/g, "") })} placeholder={chosenSlot ? String(chosenSlot.monthlyRent) : ""} /></label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 p-5"><Button className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={() => setAddOpen(false)}>Hủy bỏ</Button><Button className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]" onClick={createTenant}>Tạo và gán phòng</Button></div>
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} description={`${selected.id} · ${selected.status}`} onClose={() => { setSelected(null); setProfileTab("Thông tin cá nhân") }} wide>
          <div className="border-b border-slate-100 px-6"><div className="flex gap-1 overflow-x-auto">{["Thông tin cá nhân", "Hợp đồng & Cọc", "Kỷ luật & Vi phạm"].map((tab) => <Button className={`h-10 shrink-0 border-b-2 px-3.5 text-xs font-semibold ${profileTab === tab ? "border-brand-500 text-brand-700" : "border-transparent text-slate-500"}`} key={tab} onClick={() => setProfileTab(tab)}>{tab}</Button>)}</div></div>
          <div className="p-6">
            {profileTab === "Thông tin cá nhân" && <dl className="grid gap-x-8 md:grid-cols-2">{[["Họ và tên", selected.name], ["Giới tính", selected.gender], ["Số điện thoại", selected.phone], ["CCCD", selected.cccd], ["Email", selected.email], ["Địa chỉ", selected.address]].map(([label, value]) => <div className="flex justify-between gap-4 border-b border-slate-100 py-3" key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="text-right text-xs font-semibold text-slate-800">{value}</dd></div>)}</dl>}
            {profileTab === "Hợp đồng & Cọc" && <div className="grid gap-3 rounded-sm border border-brand-200 bg-brand-50 p-4 sm:grid-cols-3">{[["Phòng / Vị trí", `${selected.room} · ${selected.bed}`], ["Giá thuê", money(selected.monthlyRent)], ["Tiền cọc", money(selected.deposit)], ["Ngày bắt đầu", selected.start], ["Ngày kết thúc", selected.end], ["Thời hạn", "1 năm"]].map(([label, value]) => <div key={label}><div className="text-xs text-brand-700">{label}</div><div className="mt-1 font-mono text-sm font-bold text-slate-900">{value}</div></div>)}</div>}
            {profileTab === "Kỷ luật & Vi phạm" && <div className="grid min-h-48 place-items-center rounded-sm border border-dashed border-slate-300 bg-slate-50 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-sm bg-success-50 text-success-600"><Icon name="activity" className="size-5" /></span><h3 className="mt-2.5 font-heading text-sm font-bold">Không có vi phạm</h3><p className="mt-1 text-xs text-slate-500">Người thuê chưa có biên bản vi phạm nội quy.</p></div></div>}
          </div>
        </Modal>
      )}
    </>
  )
}

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [tenants, setTenants] = useState<TenantRecord[]>(initialTenants)
  const [rooms, setRooms] = useState<RoomRecord[]>(initialRooms)
  const [invoiceRecords, setInvoiceRecords] = useState<Invoice[]>(initialInvoices)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [activeNav, setActiveNav] = useState("Bảng điều khiển")
  const [month, setMonth] = useState("Tháng 10/2026")
  const [floorFilter, setFloorFilter] = useState("Tất cả tầng")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [quick, setQuick] = useState<QuickKind | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(""), 2800)
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const handleNav = (label: string) => {
    setActiveNav(label)
    setSidebarOpen(false)
  }

  const logout = () => {
    setRole(null)
    setActiveNav("Bảng điều khiển")
  }

  const toastNode = toast ? (
    <div className="fixed bottom-24 left-1/2 z-toast flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-md md:bottom-5 md:left-auto md:right-5 md:w-auto md:translate-x-0">
      <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-success-50 text-success-600">
        <Icon name="check" className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-xs font-medium text-slate-800">
        {toast}
      </span>
      <Button
        label="Đóng thông báo"
        className="grid size-7 place-items-center rounded-sm text-slate-400 hover:bg-slate-100"
        onClick={() => setToast("")}
      >
        <Icon name="close" className="size-3.5" />
      </Button>
    </div>
  ) : null

  if (!role) {
    return <LoginPage onLogin={setRole} />
  }

  if (role === "student") {
    return (
      <>
        <TenantPortal
          onCreateTicket={(ticket) => setTickets([ticket, ...tickets])}
          onLogout={logout}
          showToast={showToast}
          tickets={tickets}
        />
        {toastNode}
      </>
    )
  }

  if (role === "technician") {
    return (
      <>
        <TechnicianApp
          onLogout={logout}
          onUpdate={(id, patch) =>
            setTickets(
              tickets.map((ticket) =>
                ticket.id === id ? { ...ticket, ...patch } : ticket,
              ),
            )
          }
          showToast={showToast}
          tickets={tickets}
        />
        {toastNode}
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <Button
          label="Đóng menu"
          className="fixed inset-0 z-backdrop bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="sr-only">Đóng menu</span>
        </Button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-drawer flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCompact ? "lg:w-20" : "lg:w-64"} w-64 lg:translate-x-0`}
      >
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <div
            className={`flex items-center gap-3 ${
              sidebarCompact ? "lg:justify-center" : ""
            }`}
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-sm bg-brand-500 text-white">
              <Icon name="building" className="size-4" />
            </div>
            <div className={sidebarCompact ? "lg:hidden" : ""}>
              <div className="font-heading text-base font-bold tracking-tight text-slate-900">
                KTX Hub
              </div>
              <div className="text-xs font-medium text-slate-500">
                Quản lý lưu trú
              </div>
            </div>
          </div>
          <Button
            label="Đóng điều hướng"
            className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="close" />
          </Button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-5"
          aria-label="Điều hướng chính"
        >
          {navGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              <div
                className={`mb-2 px-3 text-xs font-bold tracking-widest text-slate-400 ${
                  sidebarCompact ? "lg:text-center lg:text-[0px]" : ""
                }`}
              >
                {sidebarCompact ? (
                  <span className="hidden lg:inline">•</span>
                ) : null}
                <span className={sidebarCompact ? "lg:hidden" : ""}>
                  {group.label}
                </span>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.label === activeNav
                  return (
                    <Button
                      key={item.label}
                      label={item.label}
                      className={`flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      } ${sidebarCompact ? "lg:justify-center lg:px-0" : ""}`}
                      onClick={() => handleNav(item.label)}
                    >
                      <Icon
                        name={item.icon}
                        className={`size-5 shrink-0 ${
                          active ? "stroke-2" : ""
                        }`}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate ${
                          sidebarCompact ? "lg:hidden" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                            active
                              ? "bg-white text-brand-700"
                              : "bg-slate-100 text-slate-600"
                          } ${sidebarCompact ? "lg:hidden" : ""}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <Button
            label={
              sidebarCompact
                ? "Mở rộng thanh điều hướng"
                : "Thu gọn thanh điều hướng"
            }
            className="hidden h-10 w-full items-center gap-2.5 rounded-sm px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:flex"
            onClick={() => setSidebarCompact(!sidebarCompact)}
          >
            <Icon
              name="chevron"
              className={`size-5 transition-transform ${
                sidebarCompact ? "" : "rotate-180"
              }`}
            />
            <span className={sidebarCompact ? "lg:hidden" : ""}>
              Thu gọn menu
            </span>
          </Button>
          <div
            className={`mt-2 flex items-center gap-2.5 rounded-sm bg-slate-50 p-2.5 ${
              sidebarCompact ? "lg:justify-center lg:bg-white lg:p-0" : ""
            }`}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
              TL
            </div>
            <div
              className={`min-w-0 flex-1 ${sidebarCompact ? "lg:hidden" : ""}`}
            >
              <div className="truncate text-sm font-semibold text-slate-800">
                Trần Thu Lan
              </div>
              <div className="truncate text-xs text-slate-500">Quản lý cơ sở thuê</div>
            </div>
            <Button
              label="Đăng xuất"
              className={`grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-white ${
                sidebarCompact ? "lg:hidden" : ""
              }`}
              onClick={logout}
            >
              <Icon name="more" />
            </Button>
          </div>
        </div>
      </aside>

      <div
        className={`transition-all duration-200 ${
          sidebarCompact ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-sticky flex h-18 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <Button
            label="Mở menu"
            className="grid size-9 shrink-0 place-items-center rounded-sm text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="menu" />
          </Button>

          <GlobalSearch onNavigate={handleNav} />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="relative">
              <Button
                label="Thông báo, có 3 thông báo mới"
                className="relative grid size-9 place-items-center rounded-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Icon name="bell" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger-600 ring-2 ring-white" />
              </Button>
              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-dropdown w-80 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="font-heading text-sm font-bold text-slate-900">
                      Thông báo mới
                    </span>
                    <Button className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                      Đánh dấu đã đọc
                    </Button>
                  </div>
                  <div className="p-2">
                    {alerts.slice(0, 2).map((alert) => (
                      <Button
                        key={alert.title}
                        className="flex w-full gap-2.5 rounded-sm p-2 text-left hover:bg-slate-50"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <span
                          className={`icon-box icon-box-${alert.tone} size-9`}
                        >
                          <Icon name={alert.icon} className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-800">
                            {alert.title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            {alert.time}
                          </span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="relative">
              <Button
                className="flex h-9 items-center gap-2 rounded-sm px-2 hover:bg-slate-100"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="grid size-7 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
                  TL
                </span>
                <span className="hidden text-left xl:block">
                  <span className="block text-sm font-semibold text-slate-800">
                    Thu Lan
                  </span>
                  <span className="block text-xs text-slate-500">Quản lý</span>
                </span>
                <Icon
                  name="chevron"
                  className="hidden size-4 rotate-90 text-slate-400 xl:block"
                />
              </Button>
              {profileOpen && (
                <div className="absolute right-0 top-11 z-dropdown w-52 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md">
                  <Button
                    className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false)
                      handleNav("Kĩ thuật viên")
                    }}
                  >
                    <Icon name="settings" className="size-4" /> Kĩ thuật viên
                  </Button>
                  <Button
                    className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false)
                      setPasswordOpen(true)
                    }}
                  >
                    <Icon name="settings" className="size-4" /> Đổi mật khẩu
                  </Button>
                  <Button
                    className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-sm text-danger-600 hover:bg-danger-50"
                    onClick={logout}
                  >
                    <Icon name="logout" className="size-4" /> Đăng xuất
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 lg:py-8">
          {activeNav === "Phòng & giường" ? (
            <RoomsPage
              rooms={rooms}
              onRoomsChange={setRooms}
              tenants={tenants}
              onQuickOnboard={(roomCode, bedCode) => {
                setActiveNav("Người thuê")
                showToast(`Đã chọn vị trí ${roomCode} · ${bedCode} để xếp khách`)
              }}
              showToast={showToast}
            />
          ) : activeNav === "Người thuê" ? (
            <TenantsPage tenants={tenants} onTenantsChange={setTenants} showToast={showToast} />
          ) : activeNav === "Phương tiện" ? (
            <VehiclesPage tenants={tenants} showToast={showToast} />
          ) : activeNav === "Hợp đồng" ? (
            <ContractsPage tenants={tenants} showToast={showToast} />
          ) : activeNav === "Hóa đơn" ? (
            <InvoicesPage records={invoiceRecords} onRecordsChange={setInvoiceRecords} showToast={showToast} />
          ) : activeNav === "Tài chính" ? (
            <FinancialPage records={invoiceRecords} tickets={tickets} />
          ) : activeNav === "Sự cố & kỷ luật" ? (
            <IncidentsPage
              tickets={tickets}
              onAssign={(id, tech, priority) =>
                setTickets(
                  tickets.map((t) =>
                    t.id === id
                      ? { ...t, ...(tech ? { assignee: tech } : {}), ...(priority ? { priority } : {}) }
                      : t,
                  ),
                )
              }
              showToast={showToast}
            />
          ) : activeNav === "Kĩ thuật viên" ? (
            <TechnicianAccountsPage showToast={showToast} />
          ) : (
            <>
              <section className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <span>Tổng quan</span>
                    <Icon name="chevron" className="size-3.5" />
                    <span className="font-medium text-slate-700">
                      Bảng điều khiển
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
                    Chào buổi sáng, chị Lan
                  </h1>
                  <p className="mt-2 text-sm text-slate-500">
                    Đây là tình hình vận hành cơ sở cho thuê hôm nay, 24 tháng 10.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    label="Chọn thời gian báo cáo"
                    value={month}
                    options={[
                      "Tháng 10/2026",
                      "Tháng 09/2026",
                      "Tháng 08/2026",
                    ]}
                    onChange={setMonth}
                  />
                  <Select
                    label="Chọn tầng"
                    value={floorFilter}
                    options={["Tất cả tầng", "Tầng 1", "Tầng 2", "Tầng 3"]}
                    onChange={setFloorFilter}
                  />
                  <Button
                    className="flex h-10 items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                    onClick={() => showToast("Đã xuất báo cáo tháng 10 (PDF)")}
                  >
                    <Icon name="report" className="size-4" />
                    <span className="hidden sm:inline">Xuất báo cáo</span>
                  </Button>
                </div>
              </section>

              <section
                aria-label="Chỉ số vận hành"
                className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                {kpis.map((kpi) => (
                  <article
                    className="group rounded-sm border border-slate-200 bg-white p-4.5 shadow-xs transition-all hover:border-slate-300"
                    key={kpi.label}
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <span className={`icon-box icon-box-${kpi.tone}`}>
                        <Icon name={kpi.icon} />
                      </span>
                      <span className={`status-label status-label-${kpi.tone}`}>
                        {kpi.tone === "brand" || kpi.tone === "success" ? (
                          <Icon name="trend" className="size-3.5" />
                        ) : null}
                        {kpi.change}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      {kpi.label}
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-900">
                      {kpi.value}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {kpi.detail}
                    </div>
                  </article>
                ))}
              </section>

              <section className="mb-6 grid gap-6 xl:grid-cols-3">
                <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs xl:col-span-2">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-slate-900">
                        Doanh thu 6 tháng gần nhất
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Tổng thu từ tiền giường và dịch vụ
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="size-2 rounded-full bg-brand-600" />
                      <span className="text-slate-500">Đơn vị: triệu đồng</span>
                    </div>
                  </div>

                  <div className="chart-shell">
                    <div className="chart-y-axis">
                      <span>160</span>
                      <span>120</span>
                      <span>80</span>
                      <span>40</span>
                      <span>0</span>
                    </div>
                    <div className="chart-area">
                      <div className="chart-grid" />
                      <div className="chart-bars">
                        {revenue.map((item, index) => (
                          <div
                            className="chart-column group/bar"
                            key={item.month}
                          >
                            <span className="chart-value">{item.value}</span>
                            <div
                              className={`chart-bar ${item.height} ${
                                index === revenue.length - 1
                                  ? "chart-bar-active"
                                  : ""
                              }`}
                            />
                            <span className="chart-label">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Tổng 6 tháng
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        763,2 triệu
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Tăng trưởng
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm font-bold text-success-600">
                        <Icon name="trend" className="size-4" />
                        8,4% so với kỳ trước
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500">
                        Mục tiêu tháng 10
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-900">
                        145,2 / 160 triệu
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-slate-900">
                        Tình trạng giường
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Toàn bộ hệ thống
                      </p>
                    </div>
                    <Button
                      label="Mở sơ đồ phòng"
                      className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => handleNav("Phòng & giường")}
                    >
                      <Icon name="more" />
                    </Button>
                  </div>

                  <div className="flex justify-center py-2">
                    <div
                      aria-label="87,7 phần trăm giường đang được sử dụng"
                      className="occupancy-ring"
                      role="img"
                    >
                      <div className="occupancy-ring-inner">
                        <span className="font-heading text-3xl font-bold text-slate-950">
                          87,7%
                        </span>
                        <span className="mt-1 text-xs font-medium text-slate-500">
                          đã lấp đầy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="size-2.5 rounded-full bg-brand-600" />
                        Đang sử dụng
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        158 giường
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="size-2.5 rounded-full bg-success-500" />
                        Còn trống
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        18 giường
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-sm bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="size-2.5 rounded-full bg-warning-500" />
                        Bảo trì
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        4 giường
                      </span>
                    </div>
                  </div>
                  <Button
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() => handleNav("Phòng & giường")}
                  >
                    Xem sơ đồ phòng
                    <Icon name="chevron" className="size-4" />
                  </Button>
                </article>
              </section>

              <section className="mb-6 grid gap-6 xl:grid-cols-3">
                <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs xl:col-span-2">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-heading text-lg font-bold text-slate-900">
                        Cần xử lý hôm nay
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Các tác vụ cần chị ưu tiên theo dõi
                      </p>
                    </div>
                    <Button
                      className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
                      onClick={() => handleNav("Sự cố & kỷ luật")}
                    >
                      Xem tất cả
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <Button
                        key={alert.title}
                        className="group flex w-full items-center gap-3 rounded-sm border border-transparent p-2.5 text-left hover:border-slate-200 hover:bg-slate-50"
                        onClick={() =>
                          handleNav(
                            alert.title.includes("Hóa đơn")
                              ? "Hóa đơn"
                              : alert.title.includes("Rò rỉ")
                                ? "Sự cố & kỷ luật"
                                : "Người thuê",
                          )
                        }
                      >
                        <span
                          className={`icon-box icon-box-${alert.tone} shrink-0`}
                        >
                          <Icon name={alert.icon} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800">
                            {alert.title}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {alert.detail}
                          </span>
                        </span>
                        <span className="hidden text-xs text-slate-400 md:block">
                          {alert.time}
                        </span>
                        <Icon
                          name="chevron"
                          className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
                        />
                      </Button>
                    ))}
                  </div>
                </article>

                <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
                  <h2 className="font-heading text-lg font-bold text-slate-900">
                    Thao tác nhanh
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Truy cập nghiệp vụ thường dùng
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        className="group rounded-sm border border-slate-200 p-3 text-left hover:border-brand-500 hover:bg-brand-50 active:translate-y-[1px] transition-all"
                        onClick={() =>
                          action.nav
                            ? handleNav(action.nav)
                            : action.kind && setQuick(action.kind)
                        }
                      >
                        <span
                          className={`icon-box icon-box-${action.tone} mb-3 size-9`}
                        >
                          <Icon name={action.icon} className="size-4" />
                        </span>
                        <span className="block text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-700">
                          {action.label}
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-slate-500">
                          {action.helper}
                        </span>
                      </Button>
                    ))}
                  </div>
                </article>
              </section>

              <DashboardInsights records={invoiceRecords} showToast={showToast} />

              <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900">
                      Thanh toán gần đây
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Giao dịch VietQR được ghi nhận trong hôm nay
                    </p>
                  </div>
                  <Button
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    onClick={() => handleNav("Hóa đơn")}
                  >
                    Xem hóa đơn
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-175 border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-3">Người thuê</th>
                        <th className="px-6 py-3">Phòng / Giường</th>
                        <th className="px-6 py-3">Số tiền</th>
                        <th className="px-6 py-3">Trạng thái</th>
                        <th className="px-6 py-3 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentPayments.map((payment) => (
                        <tr
                          className="transition-colors hover:bg-slate-50"
                          key={payment.name}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 place-items-center rounded-sm bg-slate-100 font-mono text-xs font-semibold text-slate-700">
                                {payment.name
                                  .split(" ")
                                  .slice(-2)
                                  .map((part) => part[0])
                                  .join("")}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {payment.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm font-medium text-slate-600">
                            {payment.room}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            {payment.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={
                                payment.status === "Chờ đối soát"
                                  ? "status-label status-label-warning"
                                  : "status-label status-label-success"
                              }
                            >
                              <span className="size-1.5 rounded-full bg-current" />
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-slate-500">
                            {payment.time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {quick && (
        <QuickModals
          kind={quick}
          tickets={tickets}
          onAssign={(id, tech, priority) =>
            setTickets(
              tickets.map((t) =>
                t.id === id
                  ? { ...t, ...(tech ? { assignee: tech } : {}), ...(priority ? { priority } : {}) }
                  : t,
              ),
            )
          }
          onClose={() => setQuick(null)}
        />
      )}
      {passwordOpen && (
        <ChangePasswordModal
          onClose={() => setPasswordOpen(false)}
          onDone={showToast}
        />
      )}
      {toastNode}
    </div>
  )
}

export default App
