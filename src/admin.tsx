import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  PriorityPicker,
  PriorityTag,
  Select,
  ViolationFields,
  type IconName,
} from "./shared"
import {
  initialInvoices,
  money,
  person,
  TECHNICIANS,
  type Invoice,
  type Priority,
  type TenantRecord,
  type Ticket,
} from "./data"
import {
  calculateFinancialSummary,
  confirmCashPayment,
  totalInvoiceDue,
} from "./domain"

type Toast = { showToast: (message: string) => void }

const card = "rounded-sm border border-slate-200 bg-white shadow-xs"
const th =
  "px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50"
const rowCls =
  "border-t border-slate-100 transition-colors hover:bg-slate-50"
const inputCls =
  "focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500"

function Badge({
  tone,
  children,
}: {
  tone: "brand" | "success" | "danger" | "warning" | "slate"
  children: ReactNode
}) {
  const t =
    tone === "slate" ? "bg-slate-100 text-slate-600" : `status-label-${tone}`
  return <span className={`status-label ${t}`}>{children}</span>
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-full sm:w-80">
      <Icon
        name="search"
        className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function Stat({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: IconName
  tone: string
  label: string
  value: string
  hint: string
}) {
  return (
    <div className={`${card} flex items-center gap-4 p-5`}>
      <span className={`icon-box icon-box-${tone}`}>
        <Icon name={icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="font-mono text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  )
}

export { QrCode } from "./components/common/QrCode.tsx"

/* ================= HÓA ĐƠN ================= */
export const invoices = initialInvoices

const invTone = (s: Invoice["status"]) =>
  s === "Đã thu" ? "success" : s === "Chờ xác nhận" ? "warning" : "danger"
const penaltyOf = (i: Invoice) => (i.late ? i.late * 5000 : 0)

export function InvoicesPage({
  records,
  onRecordsChange,
  showToast,
}: Toast & {
  records: Invoice[]
  onRecordsChange: (records: Invoice[]) => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Tất cả trạng thái")
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [cashInvoice, setCashInvoice] = useState<Invoice | null>(null)

  const rows = records.filter(
    (i) =>
      (filter === "Tất cả trạng thái" || i.status === filter) &&
      `${i.id} ${i.tenant} ${i.room} ${person(i.tenant).cccd} ${person(i.tenant).email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const paidTotal = records
    .filter((invoice) => invoice.status === "Đã thu")
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0)

  const confirmCash = () => {
    if (!cashInvoice) return
    try {
      const paid = confirmCashPayment(
        cashInvoice,
        "Thu Lan",
        new Date().toLocaleString("vi-VN"),
      )
      onRecordsChange(
        records.map((invoice) => (invoice.id === paid.id ? paid : invoice)),
      )
      setCashInvoice(null)
      setSelected(null)
      showToast(`Đã xác nhận ${paid.id} thanh toán tiền mặt`)
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Không thể xác nhận thanh toán",
      )
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Hóa đơn"
        title="Hóa đơn tiền phòng & dịch vụ"
        description="Hóa đơn phát hành hằng tháng, hạn thanh toán ngày 05; phạt 5.000 đ/ngày kể từ ngày 06."
        actions={
          <>
            <Button
              label="Xuất Excel"
              className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => showToast("Đã xuất danh sách hóa đơn tháng 10")}
            >
              Xuất Excel
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat
          icon="check"
          tone="success"
          label="Đã thu"
          value={money(paidTotal)}
          hint={`${records.filter((i) => i.status === "Đã thu").length} hóa đơn`}
        />
        <Stat
          icon="clock"
          tone="warning"
          label="Nợ trong hạn"
          value={money(
            records
              .filter((i) => i.status === "Nợ" && !i.late)
              .reduce((t, i) => t + i.amount, 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && !i.late).length} hóa đơn`}
        />
        <Stat
          icon="alert"
          tone="danger"
          label="Nợ quá hạn (gồm phí phạt)"
          value={money(
            records
              .filter((i) => i.status === "Nợ" && i.late)
              .reduce((t, i) => t + totalInvoiceDue(i), 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && i.late).length} hóa đơn`}
        />
      </div>

      <section className={card}>
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Tìm mã hóa đơn, người thuê, phòng..."
          />
          <Select
            label="Trạng thái"
            value={filter}
            options={["Tất cả trạng thái", "Đã thu", "Chờ xác nhận", "Nợ"]}
            onChange={setFilter}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã HĐ</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Phòng</th>
                <th className={`${th} text-right`}>Số tiền</th>
                <th className={th}>Trạng thái</th>
                <th className={th}>Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr
                  key={i.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setSelected(i)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {i.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {i.tenant}
                    </p>
                    <p className="text-xs text-slate-500">
                      {person(i.tenant).phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {i.room} · {i.bed}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {money(i.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={invTone(i.status)}>
                      {i.status}
                      {i.late ? ` · trễ ${i.late} ngày` : ""}
                    </Badge>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {i.status === "Nợ" ? (
                      <Button
                        label={`Xác nhận tiền mặt cho ${i.id}`}
                        className="h-8 rounded-sm border border-brand-200 px-2.5 text-xs font-medium text-brand-700 hover:bg-brand-50 active:translate-y-[1px]"
                        onClick={() => setCashInvoice(i)}
                      >
                        Xác nhận
                      </Button>
                    ) : i.status === "Chờ xác nhận" ? (
                      <span className="text-xs font-semibold text-warning-600">Xem minh chứng</span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {i.payment?.method === "Tiền mặt" ? "Tiền mặt" : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy hóa đơn phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <Drawer
          title={selected.tenant}
          subtitle={selected.id}
          onClose={() => setSelected(null)}
        >
          <div className="flex items-center justify-between">
            <Badge tone={invTone(selected.status)}>{selected.status}</Badge>
            <span className="text-sm text-slate-500">
              Hạn chót {selected.due}
            </span>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Phòng / Giường", `${selected.room} · ${selected.bed}`],
              ["CCCD", person(selected.tenant).cccd],
              ["Email", person(selected.tenant).email],
              ["Khoản thu", selected.kind ?? "Tiền phòng tháng 10"],
              ["Số tiền", money(selected.amount)],
              [
                "Phí phạt trễ hạn",
                selected.late
                  ? `${money(penaltyOf(selected))} (${selected.late} ngày)`
                  : "—",
              ],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 bg-slate-50 px-4 py-4">
              <dt className="font-semibold text-slate-700">
                Tổng cần thanh toán
              </dt>
              <dd className="font-heading text-lg font-bold text-brand-700">
                {money(selected.amount + penaltyOf(selected))}
              </dd>
            </div>
          </dl>

          {selected.status === "Đã thu" ? (
            <div className="mt-5 flex items-center gap-3 rounded-sm bg-success-50 p-3 text-xs text-success-600">
              <Icon name="check" className="size-4" />
              Đã thanh toán {selected.payment?.paidAt}. Người xác nhận:{" "}
              {selected.payment?.confirmedBy}.
            </div>
          ) : selected.status === "Chờ xác nhận" && selected.proof ? (
            <div className="mt-6">
              <div className="rounded-sm border border-warning-100 bg-warning-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="icon-box icon-box-warning"><Icon name="image" /></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selected.proof.fileName}</p>
                    <p className="text-xs text-slate-500">Tải lên lúc {selected.proof.submittedAt}</p>
                  </div>
                </div>
                <div className="mt-3 grid aspect-video place-items-center rounded-sm border border-warning-100 bg-white">
                  <div className="text-center text-warning-600"><Icon name="receipt" className="mx-auto size-8" /><p className="mt-2 text-xs font-semibold">Ảnh biên lai thanh toán</p></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-sm border border-slate-200 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-700">
                Quét mã VietQR để thanh toán
              </p>
              <QrCode seed={selected.id} />
              <p className="mt-4 text-center text-xs text-slate-500">
                Nội dung CK:{" "}
                <span className="font-mono font-medium text-slate-800">
                  {selected.id.replace(/-/g, "")}
                </span>
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {selected.status === "Chờ xác nhận" && (
              <>
                <Button
                  label="Xác nhận đã nhận tiền"
                  className="h-10 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
                  onClick={() => {
                    const confirmed: Invoice = {
                      ...selected,
                      status: "Đã thu",
                      payment: {
                        amount: selected.amount,
                        method: "Trực tuyến",
                        paidAt: new Date().toLocaleString("vi-VN"),
                        confirmedBy: "Thu Lan (Quản lý)",
                      },
                    }
                    onRecordsChange(records.map((invoice) => invoice.id === selected.id ? confirmed : invoice))
                    setSelected(null)
                    showToast(`Đã xác nhận ${selected.id} và gửi thông báo cho người thuê`)
                  }}
                >
                  Xác nhận Đã nhận tiền
                </Button>
                <Button
                  label="Yêu cầu gửi lại minh chứng"
                  className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px]"
                  onClick={() => {
                    onRecordsChange(records.map((invoice) => invoice.id === selected.id ? { ...invoice, status: "Nợ", proof: undefined } : invoice))
                    setSelected(null)
                    showToast("Đã yêu cầu người thuê gửi lại minh chứng")
                  }}
                >
                  Từ chối / Yêu cầu gửi lại
                </Button>
              </>
            )}
            {selected.status === "Nợ" && (
              <Button
                label="Xác nhận thanh toán tiền mặt"
                className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={() => setCashInvoice(selected)}
              >
                Xác nhận thanh toán tiền mặt
              </Button>
            )}
            <Button
              label="Gửi nhắc"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => showToast(`Đã gửi hóa đơn tới ${selected.tenant}`)}
            >
              Gửi hóa đơn qua Zalo / Email
            </Button>
          </div>
        </Drawer>
      )}
      {cashInvoice && (
        <Modal
          title="Xác nhận thanh toán tiền mặt"
          description="Chỉ xác nhận sau khi quản lý đã nhận đủ tiền từ người thuê."
          onClose={() => setCashInvoice(null)}
        >
          <div className="space-y-5 p-6">
            <dl className="divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
              {[
                ["Hóa đơn", cashInvoice.id],
                ["Người thuê", cashInvoice.tenant],
                ["Số tiền nhận", money(totalInvoiceDue(cashInvoice))],
                ["Phương thức", "Tiền mặt"],
                ["Người xác nhận", "Thu Lan"],
              ].map(([label, value]) => (
                <div
                  className="flex justify-between gap-4 px-4 py-3"
                  key={label}
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end gap-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setCashInvoice(null)}
              >
                Hủy
              </Button>
              <Button
                label="Xác nhận đã nhận tiền"
                className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={confirmCash}
              >
                Xác nhận đã nhận tiền
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ================= SỰ CỐ & KỶ LUẬT ================= */
type Violation = {
  id: string
  tenant: string
  room: string
  type: string
  note: string
  date: string
  level: string
  fine?: number
}

const initialViolations: Violation[] = [
  {
    id: "KL-0231",
    tenant: "Hồ Minh Khoa",
    room: "P.312",
    type: "Về muộn",
    note: "Về lúc 00:40, quá giờ đóng cổng 23:30 (lần 3 trong tháng).",
    date: "05/10/2026",
    level: "Phạt tiền",
    fine: 100000,
  },
  {
    id: "KL-0230",
    tenant: "Phạm Đức Anh",
    room: "P.103",
    type: "Gây ồn",
    note: "Mở loa lớn sau 22:00, phòng bên phản ánh.",
    date: "03/10/2026",
    level: "Cảnh cáo",
  },
  {
    id: "KL-0229",
    tenant: "Bùi Khánh Linh",
    room: "P.210",
    type: "Vệ sinh",
    note: "Để rác ngoài hành lang qua đêm.",
    date: "29/09/2026",
    level: "Nhắc nhở",
  },
  {
    id: "KL-0227",
    tenant: "Võ Thị Mai",
    room: "P.108",
    type: "Khách ngoài",
    note: "Đưa người ngoài vào phòng không đăng ký.",
    date: "24/09/2026",
    level: "Cảnh cáo",
  },
]

const lvlTone = (l: Violation["level"]) =>
  l === "Phạt tiền" ? "danger" : l === "Cảnh cáo" ? "warning" : "slate"

export function IncidentsPage({
  tickets,
  onAssign,
  showToast,
}: Toast & {
  tickets: Ticket[]
  onAssign: (id: string, tech?: string, priority?: Priority) => void
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [viol, setViol] = useState<Violation | null>(null)
  const [tab, setTab] = useState<"repair" | "discipline">("repair")
  const [violations, setViolations] = useState(initialViolations)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    tenant: "",
    room: "",
    type: "Về muộn",
    level: "Nhắc nhở",
    fine: "",
    note: "",
  })

  const stTone = (s: Ticket["status"]) =>
    s === "Hoàn thành" ? "success" : s === "Đang xử lý" ? "brand" : "warning"

  const submit = () => {
    if (!form.tenant.trim() || !form.room.trim()) {
      showToast("Vui lòng nhập người thuê và phòng")
      return
    }
    if (!form.type.trim() || !form.level.trim()) {
      showToast("Vui lòng chọn loại vi phạm và hình thức xử lý")
      return
    }
    const isFine = form.level.trim().toLowerCase() === "phạt tiền"
    if (isFine && Number(form.fine) <= 0) {
      showToast("Vui lòng nhập số tiền phạt")
      return
    }
    setViolations([
      {
        id: `KL-0${232 + violations.length - 4}`,
        tenant: form.tenant,
        room: form.room,
        type: form.type,
        note: form.note || "—",
        date: "06/10/2026",
        level: form.level,
        fine: isFine ? Number(form.fine) : undefined,
      },
      ...violations,
    ])
    setOpen(false)
    setForm({
      tenant: "",
      room: "",
      type: "Về muộn",
      level: "Nhắc nhở",
      fine: "",
      note: "",
    })
    showToast("Đã ghi nhận vi phạm")
  }

  return (
    <>
      <PageHeader
        eyebrow="Sự cố & kỷ luật"
        title="Sự cố & kỷ luật"
        description="Theo dõi phiếu sửa chữa do người thuê báo và hồ sơ vi phạm nội quy."
        actions={
          tab === "discipline" ? (
            <Button
              label="Ghi nhận vi phạm"
              className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => setOpen(true)}
            >
              Ghi nhận vi phạm
            </Button>
          ) : undefined
        }
      />
      <div className="mb-6 inline-flex rounded-sm border border-slate-200 bg-white p-1 shadow-xs">
        {([
          [
            "repair",
            "Sự cố sửa chữa",
            tickets.filter((t) => t.status !== "Hoàn thành").length,
          ],
          ["discipline", "Hồ sơ vi phạm", violations.length],
        ] as const).map(([k, l, c]) => (
          <Button
            key={k}
            label={l}
            className={`h-9 rounded-sm px-3.5 text-sm font-semibold ${
              tab === k
                ? "bg-brand-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setTab(k)}
          >
            {l}{" "}
            <span
              className={`ml-2 rounded-sm px-1.5 font-mono text-xs ${
                tab === k ? "bg-white/20" : "bg-slate-100"
              }`}
            >
              {c}
            </span>
          </Button>
        ))}
      </div>

      {tab === "repair" ? (
        <section className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã phiếu</th>
                <th className={th}>Sự cố</th>
                <th className={th}>Ưu tiên</th>
                <th className={th}>Người báo</th>
                <th className={th}>Kỹ thuật viên</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setTicket(t)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {t.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.title}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {t.room} · {t.createdAt}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityTag priority={t.priority} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.reporter}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {t.assignee ?? (
                      <span className="text-warning-600">Chưa phân công</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={stTone(t.status)}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : (
        <section className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Loại vi phạm</th>
                <th className={th}>Ngày</th>
                <th className={th}>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr
                  key={v.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setViol(v)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {v.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {v.tenant}
                    </p>
                    <p className="font-mono text-xs text-slate-500">{v.room}</p>
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {v.type}
                    </p>
                    <p className="text-xs text-slate-500">{v.note}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{v.date}</td>
                  <td className="px-6 py-4">
                    <Badge tone={lvlTone(v.level)}>
                      {v.level}
                      {v.fine ? ` · ${money(v.fine)}` : ""}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {ticket && (
        <Drawer
          title={ticket.title}
          subtitle={`${ticket.id} · ${ticket.room}`}
          onClose={() => setTicket(null)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={stTone(ticket.status)}>{ticket.status}</Badge>
            <PriorityTag priority={ticket.priority} />
          </div>
          <p className="mt-5 rounded-sm bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {ticket.description}
          </p>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Người báo", `${ticket.reporter} · ${ticket.phone}`],
              ["Hạng mục", ticket.category],
              ["Tiếp nhận", ticket.createdAt],
              ["Hạn xử lý", ticket.deadline],
              ["Kỹ thuật viên", ticket.assignee ?? "Chưa phân công"],
              ...(ticket.resolution
                ? [
                    ["Kết quả", ticket.resolution],
                    ["Chi phí", money(ticket.cost ?? 0)],
                  ]
                : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          {ticket.status !== "Hoàn thành" && (
            <div className="mt-6 grid gap-2">
              <p className="text-sm font-semibold text-slate-700">
                Mức độ ưu tiên
              </p>
              <PriorityPicker
                value={ticket.priority}
                onChange={(p) => {
                  onAssign(ticket.id, undefined, p)
                  setTicket({ ...ticket, priority: p })
                  showToast(`Đã đặt ưu tiên "${p}" cho ${ticket.id}`)
                }}
              />
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Giao cho kỹ thuật viên
              </p>
              {TECHNICIANS.map((n) => (
                <Button
                  key={n}
                  label={n}
                  className={`h-10 rounded-sm border text-sm font-semibold active:translate-y-[1px] transition-all ${
                    ticket.assignee === n
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    onAssign(ticket.id, n)
                    setTicket({ ...ticket, assignee: n })
                    showToast(`Đã giao ${ticket.id} cho ${n}`)
                  }}
                >
                  {n}
                </Button>
              ))}
            </div>
          )}
        </Drawer>
      )}
      {viol && (
        <Drawer
          title={viol.tenant}
          subtitle={`${viol.id} · ${viol.room}`}
          onClose={() => setViol(null)}
        >
          <Badge tone={lvlTone(viol.level)}>
            {viol.level}
            {viol.fine ? ` · ${money(viol.fine)}` : ""}
          </Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Loại vi phạm", viol.type],
              ["Ngày lập", viol.date],
              ["Người lập", "Thu Lan · Quản lý"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 rounded-sm bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            {viol.note}
          </p>
          <div className="mt-6 grid gap-2">
            <Button
              label="In biên bản"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => showToast(`Đã xuất biên bản ${viol.id}`)}
            >
              In biên bản
            </Button>
            <Button
              label="Đóng"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setViol(null)}
            >
              Đóng
            </Button>
          </div>
        </Drawer>
      )}
      {open && (
        <Modal
          title="Ghi nhận vi phạm"
          description="Hồ sơ được lưu vào lịch sử cư trú của người thuê."
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4 p-6">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Người thuê
              <input
                className={inputCls}
                value={form.tenant}
                onChange={(e) => setForm({ ...form, tenant: e.target.value })}
                placeholder="VD: Hồ Minh Khoa"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Phòng
              <input
                className={inputCls}
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="VD: P.312"
              />
            </label>
            <ViolationFields
              type={form.type}
              level={form.level}
              fine={form.fine}
              onType={(type) => setForm({ ...form, type })}
              onLevel={(level) => setForm({ ...form, level })}
              onFine={(fine) => setForm({ ...form, fine })}
            />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Ghi chú
              <textarea
                className={`${inputCls} h-24 py-4`}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                label="Lưu"
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={submit}
              >
                Lưu hồ sơ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ================= PHÂN TÍCH TRÊN DASHBOARD ================= */
const floors = [
  { f: "Tầng 1", used: 34, total: 40 },
  { f: "Tầng 2", used: 38, total: 40 },
  { f: "Tầng 3", used: 36, total: 40 },
  { f: "Tầng 4", used: 27, total: 40 },
  { f: "Tầng 5", used: 22, total: 40 },
]
export function DashboardInsights({
  records,
  showToast,
}: Toast & { records: Invoice[] }) {
  const [debtor, setDebtor] = useState<Invoice | null>(null)
  const debtors = records.filter((invoice) => invoice.status !== "Đã thu")

  return (
    <>
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <section className={`${card} p-6`}>
          <h2 className="font-heading text-lg font-bold text-slate-950">
            Lấp đầy theo tầng
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Giường đang có người ở / tổng giường
          </p>
          <ul className="grid gap-4">
            {floors.map((f) => {
              const pct = Math.round((f.used / f.total) * 100)
              return (
                <li key={f.f}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{f.f}</span>
                    <span className="font-mono text-xs text-slate-500">
                      {f.used}/{f.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-sm bg-slate-100">
                    <div
                      className={`h-full rounded-sm ${
                        pct >= 90
                          ? "bg-danger-500"
                          : pct >= 75
                            ? "bg-brand-500"
                            : "bg-success-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={`${card} xl:col-span-2`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Người thuê đang nợ
            </h2>
            <Badge tone="danger">{debtors.length} khách</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Phòng</th>
                  <th className={th}>Hóa đơn</th>
                  <th className={`${th} text-right`}>Tiền nợ</th>
                  <th className={`${th} text-right`}>Phí phạt</th>
                </tr>
              </thead>
              <tbody>
                {debtors.map((d) => (
                  <tr
                    key={d.id}
                    className={`${rowCls} cursor-pointer`}
                    onClick={() => setDebtor(d)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {d.tenant}
                      </p>
                      <p className="text-xs text-slate-500">
                        {person(d.tenant).phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {d.room}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {d.id}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {money(d.amount)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-danger-600">
                      {penaltyOf(d) ? money(penaltyOf(d)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {debtor && (
        <Drawer
          title={debtor.tenant}
          subtitle={`${debtor.id} · ${person(debtor.tenant).phone}`}
          onClose={() => setDebtor(null)}
        >
          <Badge tone="danger">
            Nợ{debtor.late ? ` · trễ ${debtor.late} ngày` : ""}
          </Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Phòng / Giường", `${debtor.room} · ${debtor.bed}`],
              ["Khoản thu", debtor.kind ?? "Tiền phòng tháng 10"],
              ["Số tiền", money(debtor.amount)],
              ["Phí phạt", penaltyOf(debtor) ? money(penaltyOf(debtor)) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 bg-slate-50 px-4 py-4">
              <dt className="font-semibold text-slate-700">Tổng nợ</dt>
              <dd className="font-heading text-lg font-bold text-danger-600">
                {money(debtor.amount + penaltyOf(debtor))}
              </dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-2">
            <Button
              label="Nhắc nợ"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                showToast(`Đã nhắc nợ ${debtor.tenant}`)
                setDebtor(null)
              }}
            >
              Gửi nhắc nợ
            </Button>
            <Button
              label="Đóng"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setDebtor(null)}
            >
              Đóng
            </Button>
          </div>
        </Drawer>
      )}
    </>
  )
}

/* ================= TÀI CHÍNH ================= */
export function FinancialPage({
  records,
  tickets,
}: {
  records: Invoice[]
  tickets: Ticket[]
}) {
  const summary = calculateFinancialSummary(records, tickets)
  const paid = [
    ...new Map(
      records
        .filter((invoice) => invoice.payment)
        .map((invoice) => [invoice.id, invoice]),
    ).values(),
  ]
  const repairs = [
    ...new Map(
      tickets
        .filter((ticket) => ticket.status === "Hoàn thành" && ticket.cost)
        .map((ticket) => [ticket.id, ticket]),
    ).values(),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Tài chính"
        title="Tổng hợp thu chi"
        description="Doanh thu chỉ tính từ khoản đã thực nhận; chi phí lấy từ phiếu sửa chữa đã hoàn thành."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat
          icon="wallet"
          tone="success"
          label="Doanh thu đã thu"
          value={money(summary.collectedRevenue)}
          hint={`${paid.length} khoản thanh toán duy nhất`}
        />
        <Stat
          icon="tools"
          tone="danger"
          label="Chi phí sửa chữa"
          value={money(summary.repairExpenses)}
          hint={`${repairs.length} phiếu đã hoàn thành`}
        />
        <Stat
          icon="trend"
          tone="brand"
          label="Lợi nhuận"
          value={money(summary.profit)}
          hint="Doanh thu đã thu − chi phí sửa chữa"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Khoản thu đã nhận
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Hóa đơn</th>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Phương thức</th>
                  <th className={`${th} text-right`}>Đã nhận</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((invoice) => (
                  <tr className={rowCls} key={invoice.id}>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {invoice.tenant}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {invoice.payment?.method}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-success-600">
                      {money(invoice.payment?.amount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Chi phí sửa chữa
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Phiếu</th>
                  <th className={th}>Hạng mục</th>
                  <th className={th}>Phòng</th>
                  <th className={`${th} text-right`}>Chi phí</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((ticket) => (
                  <tr className={rowCls} key={ticket.id}>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {ticket.room}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-danger-600">
                      {money(ticket.cost ?? 0)}
                    </td>
                  </tr>
                ))}
                {repairs.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Chưa có chi phí sửa chữa đã xác nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

/* ================= PHƯƠNG TIỆN ================= */
type Vehicle = {
  id: string
  tenantId: string
  plate: string
  type: "Xe máy" | "Ô tô" | "Xe đạp điện"
  brand: string
  color: string
  registration: "Đủ 2 mặt" | "Chưa có"
  cardStatus: "Chưa cấp thẻ" | "Đã cấp thẻ"
  cardCode?: string
}

const initialVehicles: Vehicle[] = [
  {
    id: "XE-001",
    tenantId: "NT-0187",
    plate: "59X3-123.45",
    type: "Xe máy",
    brand: "Honda Vision",
    color: "Đen",
    registration: "Đủ 2 mặt",
    cardStatus: "Đã cấp thẻ",
    cardCode: "THE-0187",
  },
  {
    id: "XE-002",
    tenantId: "NT-0188",
    plate: "59P2-678.90",
    type: "Xe máy",
    brand: "Yamaha Exciter",
    color: "Xanh",
    registration: "Đủ 2 mặt",
    cardStatus: "Chưa cấp thẻ",
  },
  {
    id: "XE-003",
    tenantId: "NT-0189",
    plate: "51H-456.78",
    type: "Ô tô",
    brand: "Toyota Vios",
    color: "Trắng",
    registration: "Chưa có",
    cardStatus: "Chưa cấp thẻ",
  },
]

const emptyVehicle = {
  tenantId: "",
  plate: "",
  type: "Xe máy" as Vehicle["type"],
  brand: "",
  color: "",
  registration: "Chưa có" as Vehicle["registration"],
  cardStatus: "Chưa cấp thẻ" as Vehicle["cardStatus"],
  cardCode: "",
}

function VehicleDetail({
  vehicle,
  tenant,
}: {
  vehicle: Vehicle
  tenant?: TenantRecord
}) {
  const infoRow = (label: string, value: ReactNode, mono = false) => (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-right text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-sm border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            ID thẻ
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-950">
            {vehicle.cardCode ?? "Chưa cấp"}
          </p>
        </div>
        <Badge tone={vehicle.cardStatus === "Đã cấp thẻ" ? "success" : "warning"}>
          {vehicle.cardStatus}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-sm border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="icon-box icon-box-brand"><Icon name="clipboard" /></span>
            <div>
              <p className="font-heading text-lg font-bold text-slate-950">
                Thông tin phương tiện
              </p>
              <p className="text-xs text-slate-500">{vehicle.id}</p>
            </div>
          </div>
          <dl>
            {infoRow("Biển số", vehicle.plate, true)}
            {infoRow("Loại xe", vehicle.type)}
            {infoRow("Hãng / Dòng xe", vehicle.brand)}
            {infoRow("Màu sắc", vehicle.color)}
          </dl>
        </section>

        <section className="rounded-sm border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="icon-box icon-box-success"><Icon name="user" /></span>
            <div>
              <p className="font-heading text-lg font-bold text-slate-950">
                Thông tin người thuê
              </p>
              <p className="font-mono text-xs text-slate-500">{tenant?.id ?? vehicle.tenantId}</p>
            </div>
          </div>
          <dl>
            {infoRow("Họ và tên", tenant?.name ?? "Không xác định")}
            {infoRow("Phòng / Giường", tenant ? `${tenant.room} · ${tenant.bed}` : "—", true)}
            {infoRow("Số điện thoại", tenant?.phone ?? "—")}
            {infoRow("CCCD", tenant?.cccd ?? "—", true)}
            {infoRow("Email", tenant?.email ?? "—")}
          </dl>
        </section>
      </div>

      <section className="rounded-sm border border-slate-200 p-4">
        <div className="mb-4">
          <p className="font-heading text-lg font-bold text-slate-950">
            Ảnh cà vẹt xe
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Giấy đăng ký xe gồm mặt trước và mặt sau.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Mặt trước", "Mặt sau"].map((side) => (
            <div key={side}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{side}</p>
              <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                {vehicle.registration === "Đủ 2 mặt" ? (
                  <div className="text-center text-brand-700">
                    <span className="mx-auto grid size-12 place-items-center rounded-sm bg-brand-50">
                      <Icon name="image" className="size-7" />
                    </span>
                    <p className="mt-3 text-sm font-semibold">Ảnh cà vẹt · {side}</p>
                    <p className="mt-1 text-xs text-slate-500">Bấm để xem ảnh gốc</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <Icon name="image" className="mx-auto size-8" />
                    <p className="mt-2 text-sm">Chưa có ảnh</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function VehiclesPage({
  tenants,
  showToast,
}: Toast & { tenants: TenantRecord[] }) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Vehicle | null>(null)
  const [viewing, setViewing] = useState<Vehicle | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const [form, setForm] = useState(emptyVehicle)
  const tenantName = (id: string) =>
    tenants.find((tenant) => tenant.id === id)?.name ?? "Không xác định"
  const visible = vehicles.filter((vehicle) =>
    `${vehicle.plate} ${tenantName(vehicle.tenantId)} ${vehicle.type} ${vehicle.brand}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  )

  const startCreate = () => {
    setEditingId(null)
    setForm({
      ...emptyVehicle,
      tenantId:
        tenants.find((tenant) => tenant.status !== "Đã trả phòng")?.id ?? "",
    })
    setOpen(true)
  }
  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id)
    setForm({
      tenantId: vehicle.tenantId,
      plate: vehicle.plate,
      type: vehicle.type,
      brand: vehicle.brand,
      color: vehicle.color,
      registration: vehicle.registration,
      cardStatus: vehicle.cardStatus,
      cardCode: vehicle.cardCode ?? "",
    })
    setOpen(true)
  }
  const save = () => {
    const plate = form.plate.trim().toUpperCase()
    if (!form.tenantId || !plate || !form.brand.trim() || !form.color.trim()) {
      showToast("Vui lòng nhập đủ thông tin phương tiện")
      return
    }
    if (!/^[0-9A-Z.-]{6,12}$/.test(plate)) {
      showToast("Biển số xe không hợp lệ")
      return
    }
    if (
      vehicles.some(
        (vehicle) =>
          vehicle.plate.toUpperCase() === plate && vehicle.id !== editingId,
      )
    ) {
      showToast("Biển số xe đã tồn tại")
      return
    }
    if (editingId) {
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingId ? { ...vehicle, ...form, plate } : vehicle,
        ),
      )
      showToast("Đã cập nhật phương tiện")
    } else {
      setVehicles([
        {
          id: `XE-${String(vehicles.length + 1).padStart(3, "0")}`,
          ...form,
          plate,
        },
        ...vehicles,
      ])
      showToast("Đã thêm phương tiện")
    }
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Phương tiện"
        title="Quản lý phương tiện"
        description="Theo dõi phương tiện theo người thuê và tra cứu nhanh bằng biển số."
        actions={
          <Button
            label="Thêm phương tiện"
            className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={startCreate}
          >
            Thêm phương tiện
          </Button>
        }
      />
      <section className={card}>
        <div className="border-b border-slate-200 p-6">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Tìm biển số hoặc người thuê..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Biển số</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Loại xe</th>
                <th className={th}>Hãng / Màu</th>
                <th className={th}>Tình trạng</th>
                <th className={th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((vehicle) => (
                <tr className={rowCls} key={vehicle.id}>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-brand-700">
                    {vehicle.plate}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {tenantName(vehicle.tenantId)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {
                        tenants.find((tenant) => tenant.id === vehicle.tenantId)
                          ?.room
                      }{" "}
                      ·{" "}
                      {
                        tenants.find((tenant) => tenant.id === vehicle.tenantId)
                          ?.bed
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {vehicle.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {vehicle.brand} · {vehicle.color}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={vehicle.cardStatus === "Đã cấp thẻ" ? "success" : "warning"}>
                      {vehicle.cardStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-fit">
                      <Button
                        label={`Mở thao tác cho ${vehicle.plate}`}
                        className="grid size-8 place-items-center rounded-sm border border-slate-200 text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                        onClick={() => setActionMenu(actionMenu === vehicle.id ? null : vehicle.id)}
                      >
                        <Icon name="more" className="size-4" />
                      </Button>
                      {actionMenu === vehicle.id && (
                        <div className="absolute right-0 top-10 z-dropdown w-36 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md">
                          <Button className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700" onClick={() => { setViewing(vehicle); setActionMenu(null) }}>
                            <Icon name="search" className="size-3.5" /> Xem
                          </Button>
                          <Button className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => { startEdit(vehicle); setActionMenu(null) }}>
                            <Icon name="file" className="size-3.5" /> Sửa
                          </Button>
                          <Button className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-danger-600 hover:bg-danger-50" onClick={() => { setDeleting(vehicle); setActionMenu(null) }}>
                            <Icon name="close" className="size-3.5" /> Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy phương tiện phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {viewing && (
        <Modal
          wide
          title={`Chi tiết phương tiện ${viewing.plate}`}
          description="Thông tin thẻ xe, phương tiện, người thuê và giấy đăng ký xe."
          onClose={() => setViewing(null)}
        >
          <VehicleDetail
            vehicle={viewing}
            tenant={tenants.find((tenant) => tenant.id === viewing.tenantId)}
          />
        </Modal>
      )}
      {open && (
        <Modal
          title={editingId ? "Cập nhật phương tiện" : "Thêm phương tiện"}
          description="Phương tiện phải được liên kết với một người thuê."
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Người thuê
              <select
                className={inputCls}
                value={form.tenantId}
                onChange={(event) =>
                  setForm({ ...form, tenantId: event.target.value })
                }
              >
                {tenants
                  .filter((tenant) => tenant.status !== "Đã trả phòng")
                  .map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} · {tenant.room}-{tenant.bed}
                    </option>
                  ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Biển số
              <input
                className={`${inputCls} font-mono uppercase`}
                value={form.plate}
                onChange={(event) =>
                  setForm({ ...form, plate: event.target.value })
                }
                placeholder="59X3-123.45"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Loại xe
              <select
                className={inputCls}
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value as Vehicle["type"],
                  })
                }
              >
                {["Xe máy", "Ô tô", "Xe đạp điện"].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Hãng / Dòng xe
              <input
                className={inputCls}
                value={form.brand}
                onChange={(event) =>
                  setForm({ ...form, brand: event.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Màu sắc
              <input
                className={inputCls}
                value={form.color}
                onChange={(event) =>
                  setForm({ ...form, color: event.target.value })
                }
              />
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                label="Lưu phương tiện"
                className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={save}
              >
                Lưu phương tiện
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xóa phương tiện?"
          description={`${deleting.plate} sẽ được gỡ khỏi hồ sơ người thuê.`}
          onClose={() => setDeleting(null)}
        >
          <div className="flex justify-end gap-2 p-6">
            <Button
              label="Hủy"
              className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>
            <Button
              label="Xác nhận xóa"
              className="h-10 rounded-sm bg-danger-500 px-4 text-sm font-semibold text-white hover:bg-danger-600 active:translate-y-[1px]"
              onClick={() => {
                setVehicles(
                  vehicles.filter((vehicle) => vehicle.id !== deleting.id),
                )
                setDeleting(null)
                showToast("Đã xóa phương tiện")
              }}
            >
              Xóa phương tiện
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

/* ================= TÀI KHOẢN KĨ THUẬT VIÊN ================= */
type TechnicianAccount = { name: string; user: string; active: boolean }

export function TechnicianAccountsPage({ showToast }: Toast) {
  const [staff, setStaff] = useState<TechnicianAccount[]>([
    { name: "Võ Văn Thịnh", user: "thinh.vv@ktxhub.vn", active: true },
    { name: "Lâm Quốc Huy", user: "huy.lq@ktxhub.vn", active: false },
  ])
  const [form, setForm] = useState({ name: "", user: "", password: "" })
  const [showPw, setShowPw] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const cur = staff.find((s) => s.user === sel) ?? null
  const add = () => {
    if (!form.name.trim() || !form.user.trim()) {
      showToast("Vui lòng nhập họ tên và email")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.user.trim())) {
      showToast("Email không hợp lệ")
      return
    }
    if (form.password.length < 6) {
      showToast("Mật khẩu khởi tạo cần tối thiểu 6 ký tự")
      return
    }
    const { password: _pw, ...profile } = form
    setStaff([...staff, { ...profile, active: true }])
    setForm({ name: "", user: "", password: "" })
    setShowPw(false)
    showToast("Đã tạo tài khoản kỹ thuật viên")
  }

  return (
    <>
      <PageHeader
        eyebrow="Kĩ thuật viên"
        title="Kĩ thuật viên"
        description="Quản lý và tạo tài khoản dành riêng cho kỹ thuật viên."
      />
      <div className="grid gap-6 xl:grid-cols-5">
        <section className={`${card} overflow-x-auto xl:col-span-3`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Tài khoản kỹ thuật viên
            </h2>
          </div>
          <table className="w-full min-w-120 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Họ tên</th>
                <th className={th}>Email</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr
                  key={s.user}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setSel(s.user)}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.user}</td>
                  <td className="px-6 py-4">
                    <Badge tone={s.active ? "success" : "danger"}>
                      {s.active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={`${card} p-6 xl:col-span-2`}>
          <h2 className="font-heading text-lg font-bold text-slate-950">
            Tạo tài khoản kỹ thuật viên
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Họ tên
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                className={inputCls}
                type="email"
                autoComplete="off"
                placeholder="ten@ktxhub.vn"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Mật khẩu khởi tạo
              <div className="relative">
                <input
                  className={`${inputCls} pr-20`}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="focus-ring absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-sm px-2 text-xs font-medium text-brand-600 hover:bg-brand-50"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "Ẩn" : "Hiện"}
                </button>
              </div>
              <span className="text-xs font-normal text-slate-500">
                Mật khẩu mặc định do quản trị viên cấp; kỹ thuật viên nên đổi
                sau lần đăng nhập đầu.
              </span>
            </label>
            <Button
              label="Tạo tài khoản kỹ thuật viên"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={add}
            >
              Tạo tài khoản
            </Button>
          </div>
        </section>
      </div>
      {cur && (
        <Drawer
          title={cur.name}
          subtitle={cur.user}
          onClose={() => setSel(null)}
        >
          <div className="flex gap-2">
            <Badge tone="slate">Kỹ thuật viên</Badge>
            <Badge tone={cur.active ? "success" : "danger"}>
              {cur.active ? "Hoạt động" : "Bị khóa"}
            </Badge>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            <div className="flex justify-between gap-4 px-4 py-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{cur.user}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-4">
              <dt className="text-slate-500">Vai trò</dt>
              <dd className="font-medium text-slate-900">Kỹ thuật viên</dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-2">
            <Button
              label="Khóa hoặc mở khóa"
              className={`h-10 rounded-sm text-sm font-semibold active:translate-y-[1px] ${
                cur.active
                  ? "border border-danger-200 text-danger-600 hover:bg-danger-50"
                  : "bg-brand-500 text-white hover:bg-brand-600"
              }`}
              onClick={() => {
                setStaff(
                  staff.map((x) =>
                    x.user === cur.user ? { ...x, active: !x.active } : x,
                  ),
                )
                showToast(
                  cur.active
                    ? `Đã khóa tài khoản ${cur.user}`
                    : `Đã mở khóa ${cur.user}`,
                )
              }}
            >
              {cur.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </Button>
            <Button
              label="Đặt lại mật khẩu"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() =>
                showToast(`Đã gửi liên kết đặt lại mật khẩu cho ${cur.user}`)
              }
            >
              Đặt lại mật khẩu
            </Button>
          </div>
        </Drawer>
      )}
    </>
  )
}

/* ================= HỢP ĐỒNG ================= */
type Contract = {
  id: string
  tenant: string
  room: string
  start: string
  end: string
  deposit: number
  status: "Hiệu lực" | "Sắp hết hạn" | "Chờ xác nhận"
}
type ContractDocument = {
  contractId: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}
const contracts: Contract[] = [
  {
    id: "HD-2026-0187",
    tenant: "Nguyễn Hoàng Nam",
    room: "P.302 · G02",
    start: "01/09/2026",
    end: "01/09/2027",
    deposit: 1200000,
    status: "Hiệu lực",
  },
  {
    id: "HD-2026-0141",
    tenant: "Trần Quốc Bảo",
    room: "P.205 · G03",
    start: "01/09/2026",
    end: "01/09/2027",
    deposit: 1200000,
    status: "Hiệu lực",
  },
  {
    id: "HD-2025-0412",
    tenant: "Hồ Minh Khoa",
    room: "P.312 · G04",
    start: "01/11/2025",
    end: "01/11/2026",
    deposit: 900000,
    status: "Sắp hết hạn",
  },
  {
    id: "HD-2026-0203",
    tenant: "Nguyễn Minh Tuấn",
    room: "P.201 · G05",
    start: "01/11/2026",
    end: "01/11/2027",
    deposit: 1400000,
    status: "Chờ xác nhận",
  },
]

const initialContractDocuments: ContractDocument[] = [
  {
    contractId: "HD-2026-0187",
    name: "hop-dong-thue-HD-2026-0187.pdf",
    size: 284000,
    type: "application/pdf",
    url: "/hop-dong-noi-quy-ktx.pdf",
    uploadedAt: "01/09/2026",
  },
]

export function ContractsPage({
  tenants,
  showToast,
}: Toast & { tenants: TenantRecord[] }) {
  const [sel, setSel] = useState<Contract | null>(null)
  const [documents, setDocuments] = useState(initialContractDocuments)
  const fileInput = useRef<HTMLInputElement>(null)
  const blobUrls = useRef<string[]>([])
  const tone = (s: Contract["status"]) =>
    s === "Hiệu lực" ? "success" : s === "Sắp hết hạn" ? "warning" : "brand"
  const document = sel
    ? documents.find((item) => item.contractId === sel.id)
    : undefined
  const contractRows: Contract[] = [
    ...contracts,
    ...tenants
      .filter(
        (tenant) =>
          !contracts.some((contract) => contract.tenant === tenant.name),
      )
      .map((tenant) => ({
        id: `HD-${tenant.start.slice(-4)}-${tenant.id.replace("NT-", "")}`,
        tenant: tenant.name,
        room: `${tenant.room} · ${tenant.bed}`,
        start: tenant.start,
        end: tenant.end,
        deposit: tenant.deposit,
        status:
          tenant.status === "Sắp hết HĐ"
            ? "Sắp hết hạn" as const
            : "Hiệu lực" as const,
      })),
  ]

  useEffect(
    () => () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

  const upload = (file?: File) => {
    if (!file || !sel) return
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowed.includes(file.type)) {
      showToast("Chỉ chấp nhận tệp PDF, DOC hoặc DOCX")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Tài liệu hợp đồng không được vượt quá 10 MB")
      return
    }
    const old = documents.find((item) => item.contractId === sel.id)
    if (old?.url.startsWith("blob:")) URL.revokeObjectURL(old.url)
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    const next: ContractDocument = {
      contractId: sel.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      uploadedAt: new Date().toLocaleDateString("vi-VN"),
    }
    setDocuments([
      ...documents.filter((item) => item.contractId !== sel.id),
      next,
    ])
    showToast(`Đã tải tài liệu lên ${sel.id}`)
  }

  const download = (item: ContractDocument) => {
    const anchor = window.document.createElement("a")
    anchor.href = item.url
    anchor.download = item.name
    anchor.click()
  }

  return (
    <>
      <PageHeader
        eyebrow="Hợp đồng"
        title="Hợp đồng thuê"
        description="Quản lý thời hạn thuê, tiền cọc và tài liệu hợp đồng của từng người thuê."
        actions={<Badge tone="brand">Thời hạn: 1 Năm (Mặc định)</Badge>}
      />
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-175 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Mã HĐ</th>
              <th className={th}>Người thuê</th>
              <th className={th}>Phòng / Giường</th>
              <th className={th}>Thời hạn</th>
              <th className={th}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {contractRows.map((c) => (
              <tr
                key={c.id}
                className={`${rowCls} cursor-pointer`}
                onClick={() => setSel(c)}
              >
                <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                  {c.id}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {c.tenant}
                  </p>
                  <p className="text-xs text-slate-500">
                    {person(c.tenant).phone}
                  </p>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-600">
                  {c.room}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {c.start} – {c.end}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={tone(c.status)}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {sel && (
        <Drawer
          title={sel.tenant}
          subtitle={sel.id}
          onClose={() => setSel(null)}
        >
          <Badge tone={tone(sel.status)}>{sel.status}</Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["CCCD", person(sel.tenant).cccd],
              ["Email", person(sel.tenant).email],
              ["Phòng / Giường", sel.room],
              ["Bắt đầu", sel.start],
              ["Kết thúc", sel.end],
              ["Thời hạn", "1 năm (mặc định)"],
              ["Tiền cọc", money(sel.deposit)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Tài liệu hợp đồng
            </h3>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => {
                upload(event.target.files?.[0])
                event.target.value = ""
              }}
            />
            {document ? (
              <div className="mt-3 rounded-sm border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <span className="icon-box icon-box-brand size-9">
                    <Icon name="file" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {document.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(document.size / 1024).toFixed(0)} KB · tải lên{" "}
                      {document.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button
                    label="Xem tài liệu"
                    className="h-9 rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() =>
                      window.open(document.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    Xem
                  </Button>
                  <Button
                    label="Tải tài liệu xuống"
                    className="h-9 rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() => download(document)}
                  >
                    Tải xuống
                  </Button>
                  <Button
                    label="Thay tài liệu"
                    className="h-9 rounded-sm border border-brand-200 text-xs font-medium text-brand-700 hover:bg-brand-50 active:translate-y-[1px]"
                    onClick={() => fileInput.current?.click()}
                  >
                    Thay tệp
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                label="Tải tài liệu hợp đồng lên"
                className="mt-3 flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="file" className="size-6" />
                Tải PDF, DOC hoặc DOCX · tối đa 10 MB
              </Button>
            )}
          </div>
          <Button
            label="Đóng"
            className="mt-5 h-10 w-full rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
            onClick={() => setSel(null)}
          >
            Đóng
          </Button>
        </Drawer>
      )}
    </>
  )
}
