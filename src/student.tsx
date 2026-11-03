import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AccountMenu, Button, Icon, Modal, PriorityPicker, PriorityTag, type IconName } from "./shared";
import { money, person, type Priority, type Ticket, type TicketStatus } from "./data";
import { QrCode } from "./admin";

type Page = "room" | "invoices" | "vehicles" | "report";
type RequestKind = "extend" | "transfer" | "checkout";

const ME = person("Nguyễn Hoàng Nam");

const DEMO_TENANT = {
  ...ME,
  floor: "Tầng 3",
  deposit: 1500000,
  name: "Nguyễn Hoàng Nam",
  initials: "HN",
  room: "P.302",
  bed: "G02",
  contract: "HD-2026-0187",
};

type TenantInfo = typeof DEMO_TENANT;
const TenantCtx = createContext<TenantInfo>(DEMO_TENANT);

const initialsOf = (name: string) => name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join("").toUpperCase();

type TenantInvoice = {
  id: string;
  title: string;
  items: [string, number][];
  amount: number;
  due: string;
  status: "Chưa thanh toán" | "Chờ xác nhận" | "Đã thanh toán";
  paidAt: string;
};

const BANK = { name: "MB Bank", account: "0987654321", holder: "CONG TY KTX HUB" };
type TenantVehicle = {
  id: string;
  plate: string;
  type: "Xe tay ga" | "Xe số" | "Xe máy điện" | "Xe côn tay";
  brand: string;
  color: string;
  status: "Chờ duyệt" | "Đã cấp thẻ xe";
  cardCode?: string;
};

const initialTenantVehicles: TenantVehicle[] = [
  {
    id: "XE-001",
    plate: "59-X3 789.12",
    type: "Xe tay ga",
    brand: "Honda Air Blade 150cc",
    color: "Xanh xám đen",
    status: "Đã cấp thẻ xe",
    cardCode: "THE-0187",
  },
];

const roommates = [
  { name: "Phạm Văn Hùng", bed: "G01" },
  { name: "Lê Quang Minh", bed: "G03" },
  { name: "Đỗ Anh Tuấn", bed: "G04" },
];

const demoInvoices: TenantInvoice[] = [
  { id: "HD-2611-0187", title: "Tiền phòng tháng 11/2026", items: [["Tiền phòng tháng 11/2026", 1500000]], amount: 1500000, due: "05/11/2026", status: "Chưa thanh toán", paidAt: "" },
  { id: "HD-2610-0187", title: "Tiền phòng tháng 10/2026", items: [["Tiền phòng tháng 10/2026", 1500000]], amount: 1500000, due: "05/10/2026", status: "Đã thanh toán", paidAt: "03/10/2026" },
  { id: "PC-2026-0187", title: "Tiền cọc giữ chỗ", items: [["Tiền cọc giữ chỗ", 1500000]], amount: 1500000, due: "01/09/2026", status: "Đã thanh toán", paidAt: "29/08/2026" },
];

const todayVN = () => new Date().toLocaleDateString("vi-VN");

const ticketTone: Record<TicketStatus, { label: string; cls: string }> = {
  "Mới giao": { label: "Đã tiếp nhận", cls: "status-label-brand" },
  "Đang xử lý": { label: "Đang sửa chữa", cls: "status-label-warning" },
  "Hoàn thành": { label: "Đã hoàn thành", cls: "status-label-success" },
};

const requestConfig: Record<RequestKind, { title: string; intro: string; options: string[]; cta: string; done: string }> = {
  extend: {
    title: "Gia hạn cư trú",
    intro: "Hợp đồng hiện tại có hiệu lực đến 01/09/2027. Hợp đồng gia hạn theo từng năm:",
    options: ["Gia hạn thêm 1 năm (01/09/2027 – 01/09/2028)"],
    cta: "Gửi yêu cầu gia hạn",
    done: "Đã gửi yêu cầu gia hạn cho quản lý",
  },
  transfer: {
    title: "Yêu cầu chuyển phòng",
    intro: "Chỉ hiển thị các phòng Nam còn chỗ trống:",
    options: ["P.303 · Tầng 3 · còn 2 giường · 1.700.000 đ", "P.201 · Tầng 2 · còn 1 giường · 1.400.000 đ"],
    cta: "Gửi yêu cầu chuyển phòng",
    done: "Yêu cầu chuyển phòng đang chờ duyệt",
  },
  checkout: {
    title: "Đăng ký trả phòng",
    intro: "Chọn ngày bàn giao giường. Tiền cọc 1.500.000 đ được hoàn sau khi kiểm tra vật dụng:",
    options: ["01/09/2027 · Hết hạn hợp đồng", "15/11/2026 · Trả sớm (có thể mất cọc theo điều khoản)"],
    cta: "Xác nhận trả phòng",
    done: "Đã ghi nhận đơn trả phòng",
  },
};

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-sm border border-slate-200 bg-white p-5 shadow-xs ${className}`}>{children}</section>;
}

export function TenantPortal({
  tickets,
  onCreateTicket,
  onLogout,
  showToast,
}: {
  tickets: Ticket[];
  onCreateTicket: (ticket: Ticket) => void;
  onLogout: () => void;
  showToast: (message: string) => void;
}) {
  const TENANT: TenantInfo = DEMO_TENANT;
  const [proofSubmitted, setProofSubmitted] = useState<string[]>([]);
  const invoices: TenantInvoice[] = demoInvoices.map((i) =>
    proofSubmitted.includes(i.id) ? { ...i, status: "Chờ xác nhận" } : i,
  );
  const [vehicles, setVehicles] = useState(initialTenantVehicles);
  const pendingDeposit = false;
  const submitProof = (id: string) => {
    setProofSubmitted((submitted) => submitted.includes(id) ? submitted : [...submitted, id]);
    showToast("Đã gửi minh chứng cho Quản lý");
  };
  const [page, setPage] = useState<Page>("room");
  const [request, setRequest] = useState<RequestKind | null>(null);
  const myTickets = tickets.filter((ticket) => ticket.room === TENANT.room);
  const openCount = myTickets.filter((ticket) => ticket.status !== "Hoàn thành").length;

  const nav: { id: Page; label: string; icon: IconName; badge?: number }[] = [
    { id: "room", label: "Phòng của tôi", icon: "bed" },
    { id: "invoices", label: "Hóa đơn", icon: "invoice", badge: invoices.filter((item) => item.status === "Chưa thanh toán").length || undefined },
    { id: "vehicles", label: "Phương tiện", icon: "clipboard" },
    { id: "report", label: "Báo hỏng vật tư", icon: "tools", badge: openCount || undefined },
  ];
  const pageTitle = page === "room" ? "Phòng của tôi" : page === "invoices" ? "Hóa đơn" : page === "vehicles" ? "Phương tiện" : "Báo hỏng vật tư";

  return (
    <TenantCtx.Provider value={TENANT}>
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-drawer hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-18 items-center gap-3 border-b border-slate-100 px-5">
          <div className="grid size-9 place-items-center rounded-sm bg-brand-500 text-white">
            <Icon name="building" className="size-4" />
          </div>
          <div>
            <div className="font-heading text-base font-bold tracking-tight text-slate-900">KTX Hub</div>
            <div className="font-mono text-xs text-slate-400">Cổng người thuê</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5" aria-label="Điều hướng người thuê">
          <div className="mb-2 px-3 text-xs font-bold tracking-widest text-slate-400">CỦA TÔI</div>
          <div className="space-y-1">
            {nav.map((item) => {
              const active = page === item.id;
              return (
                <Button
                  key={item.id}
                  className={`flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm font-medium transition-all ${
                    active ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  onClick={() => setPage(item.id)}
                >
                  <Icon name={item.icon} className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && <span className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-semibold ${active ? "bg-white text-brand-700" : "bg-slate-100 text-slate-600"}`}>{item.badge}</span>}
                </Button>
              );
            })}
          </div>
        </nav>
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2.5 rounded-sm bg-slate-50 p-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">{TENANT.initials}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-800">{TENANT.name}</div>
              <div className="truncate font-mono text-[11px] text-slate-500">{TENANT.email}</div>
            </div>
            <Button label="Đăng xuất" className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-white hover:text-danger-600" onClick={onLogout}>
              <Icon name="logout" className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-sticky flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Người thuê</span>
            <Icon name="chevron" className="size-3.5" />
            <span className="font-medium text-slate-700">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button label="Thông báo" className="relative grid size-9 place-items-center rounded-sm text-slate-600 hover:bg-slate-100" onClick={() => showToast("Hợp đồng của bạn có hiệu lực đến 01/09/2027")}>
              <Icon name="bell" className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-danger-500 ring-2 ring-white" />
            </Button>
            <div className="mx-1 h-7 w-px bg-slate-200" />
            <AccountMenu initials={TENANT.initials} name={TENANT.name} subtitle="Người thuê" onLogout={onLogout} showToast={showToast} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-8">
          {page === "room" && <RoomPage vehicles={vehicles} myTickets={myTickets} onReport={() => setPage("report")} onVehicles={() => setPage("vehicles")} onRequest={setRequest} pendingDeposit={pendingDeposit} onPay={() => setPage("invoices")} />}
          {page === "invoices" && <TenantInvoicesPage invoices={invoices} onSubmitProof={submitProof} showToast={showToast} />}
          {page === "vehicles" && <TenantVehiclesPage vehicles={vehicles} onVehiclesChange={setVehicles} showToast={showToast} />}
          {page === "report" && <ReportPage myTickets={myTickets} onCreate={onCreateTicket} showToast={showToast} />}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-sticky grid grid-cols-4 border-t border-slate-200 bg-white p-2 lg:hidden" aria-label="Điều hướng người thuê trên di động">
        {nav.map((item) => (
          <Button
            key={item.id}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-sm text-xs font-semibold ${page === item.id ? "bg-brand-50 text-brand-700" : "text-slate-500"}`}
            onClick={() => setPage(item.id)}
          >
            <Icon name={item.icon} className="size-5" />
            <span>{item.id === "room" ? "Phòng" : item.id === "invoices" ? "Hóa đơn" : item.id === "vehicles" ? "Xe" : "Sự cố"}</span>
          </Button>
        ))}
      </nav>

      {request && (
        <RequestModal
          kind={request}
          onClose={() => setRequest(null)}
          onSubmit={(message) => {
            setRequest(null);
            showToast(message);
          }}
        />
      )}
    </div>
    </TenantCtx.Provider>
  );
}

function RoomPage({ vehicles, myTickets, onReport, onVehicles, onRequest, pendingDeposit, onPay }: { vehicles: TenantVehicle[]; myTickets: Ticket[]; onReport: () => void; onVehicles: () => void; onRequest: (kind: RequestKind) => void; pendingDeposit: boolean; onPay: () => void }) {
  const TENANT = useContext(TenantCtx);
  const openTickets = myTickets.filter((ticket) => ticket.status !== "Hoàn thành");
  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">Xin chào, {TENANT.name.split(" ").slice(-1)[0]}</h1>
        <p className="mt-2 text-sm text-slate-500">Thông tin phòng ở, bạn cùng phòng và hợp đồng của bạn.</p>
      </section>

      {pendingDeposit && (
        <div className="mb-6 flex flex-col gap-4 rounded-sm border border-warning-100 bg-warning-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-slate-700">
            <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-warning-600" />
            <span className="text-xs leading-5"><b className="font-semibold text-slate-900">Chờ thanh toán cọc.</b> Vui lòng thanh toán hóa đơn đặt cọc trong 24h để hoàn tất giữ chỗ.</span>
          </div>
          <Button className="h-10 shrink-0 rounded-sm bg-brand-500 px-4 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]" onClick={onPay}>Thanh toán ngay</Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="relative overflow-hidden bg-slate-900 p-6 text-white">
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-slate-400">Phòng đang ở</div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-mono text-4xl font-bold tracking-tight text-white">{TENANT.room}</span>
                    <span className="font-mono text-xl font-medium text-slate-400">· {TENANT.bed}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">{TENANT.floor}</span>
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">Phòng {TENANT.gender}</span>
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">4 / 6 giường</span>
                  </div>
                </div>
                <span className={`status-label bg-white ${pendingDeposit ? "text-warning-600" : "text-success-600"}`}>
                  <span className="size-1.5 rounded-sm bg-current" />
                  {pendingDeposit ? "Đang giữ chỗ" : "Đang cư trú"}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-slate-900">Sơ đồ giường trong phòng</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-brand-500" />Giường của bạn</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-slate-300" />Đã có người</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border border-dashed border-success-500 bg-success-50" />Còn chỗ</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {["G01", "G02", "G03", "G04", "G05", "G06"].map((bed) => {
                  const mine = bed === TENANT.bed;
                  const taken = ["G01", "G02", "G03", "G04"].includes(bed);
                  return (
                    <div
                      className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-sm border ${
                        mine
                          ? "border-brand-500 bg-brand-500 text-white shadow-xs"
                          : taken
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-dashed border-success-500 bg-success-50 text-success-600"
                      }`}
                      key={bed}
                    >
                      <Icon name="bed" className="size-5" />
                      <span className="font-mono text-xs font-medium">{bed}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Bạn cùng phòng</h2>
              <p className="mt-1 text-sm text-slate-500">3 thành viên cùng phòng với bạn</p>
            </div>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Người thuê</th>
                  <th className="px-6 py-3">Giường</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roommates.map((mate) => (
                  <tr className="hover:bg-slate-50" key={mate.name}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-sm bg-slate-100 font-mono text-xs font-semibold text-slate-600">
                          {mate.name.split(" ").slice(-2).map((part) => part[0]).join("")}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{mate.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{mate.bed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <span className="icon-box icon-box-brand"><Icon name="clipboard" /></span>
              <span className={`status-label ${vehicles[0]?.status === "Đã cấp thẻ xe" ? "status-label-success" : "status-label-warning"}`}>
                {vehicles[0]?.status ?? "Chưa đăng ký"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-lg font-bold text-slate-900">Phương tiện của tôi</h2>
            {vehicles[0] ? (
              <>
                <div className="mt-3 font-mono text-xl font-bold text-slate-950">{vehicles[0].plate}</div>
                <p className="mt-1 text-sm text-slate-500">{vehicles[0].brand} · {vehicles[0].color}</p>
              </>
            ) : <p className="mt-2 text-sm text-slate-500">Chưa có phương tiện được khai báo.</p>}
            <Button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={onVehicles}>
              Quản lý phương tiện <Icon name="chevron" className="size-4" />
            </Button>
          </Card>
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-slate-900">Hợp đồng</h2>
              {pendingDeposit ? (
                <span className="status-label status-label-warning"><Icon name="clock" className="size-3.5" />Chờ kích hoạt</span>
              ) : (
                <span className="status-label status-label-success"><span className="size-1.5 rounded-sm bg-current" />Đang hiệu lực</span>
              )}
            </div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-2.5 py-1 font-mono text-xs font-medium text-brand-700"><Icon name="clock" className="size-3.5" />Thời hạn: 1 Năm (Mặc định)</span>
            <dl className="space-y-4 text-sm">
              {[
                ["Mã hợp đồng", TENANT.contract, true],
                ["Thời hạn", "01/09/2026 – 01/09/2027", false],
                ["Còn lại", pendingDeposit ? "—" : "312 ngày", false],
              ].map(([label, value, mono]) => (
                <div className="flex justify-between gap-4" key={label as string}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className={`font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Tiền cọc {money(TENANT.deposit)}</dt>
                <dd>
                  {pendingDeposit ? (
                    <span className="status-label status-label-warning">Chờ thanh toán cọc</span>
                  ) : (
                    <span className="status-label status-label-success">Đã nộp tiền</span>
                  )}
                </dd>
              </div>
            </dl>
            {!pendingDeposit && (
              <Button
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={() => onRequest("extend")}
              >
                <Icon name="refresh" className="size-4" />
                Gửi yêu cầu gia hạn
              </Button>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={() => onRequest("transfer")}>
                Chuyển phòng
              </Button>
              <Button className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px]" onClick={() => onRequest("checkout")}>
                Trả phòng
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-lg font-bold text-slate-900">Hồ sơ cá nhân</h2>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {[
                ["Họ và tên", TENANT.name, false],
                ["Giới tính", TENANT.gender, false],
                ["Địa chỉ", TENANT.address, false],
                ["Số điện thoại", TENANT.phone, true],
                ["CCCD", TENANT.cccd, true],
                ["Email", TENANT.email, false],
              ].map(([label, value, mono]) => (
                <div className="flex justify-between gap-4 py-3" key={label as string}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className={`text-right font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="icon-box icon-box-warning">
                <Icon name="tools" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">Sự cố của phòng</div>
                <div className="text-xs text-slate-500">{openTickets.length ? `${openTickets.length} phiếu đang xử lý` : "Không có phiếu đang mở"}</div>
              </div>
            </div>
            <Button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={onReport}>
              Báo hỏng vật tư
              <Icon name="chevron" className="size-4" />
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}

const categories = ["Điện", "Nước", "Điều hòa", "Nội thất", "Khác"];
function ReportPage({ myTickets, onCreate, showToast }: { myTickets: Ticket[]; onCreate: (ticket: Ticket) => void; showToast: (m: string) => void }) {
  const TENANT = useContext(TenantCtx);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Điện");
  const [location, setLocation] = useState("Tại giường ngủ cá nhân");
  const [priority, setPriority] = useState<Priority>("Bình thường");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const valid = title.trim().length >= 3 && description.trim().length >= 10;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const text = description.trim();
    onCreate({
      id: `SC-${1050 + myTickets.length + Math.floor(Math.random() * 40)}`,
      room: TENANT.room,
      title: title.trim(),
      description: `${location}: ${text}`,
      category,
      priority,
      bed: TENANT.bed,
      status: "Mới giao",
      reporter: TENANT.name,
      phone: TENANT.phone,
      createdAt: "Vừa xong",
      deadline: "Trong 3 ngày làm việc",
      hasPhoto: photos.length > 0,
    });
    setTitle("");
    setDescription("");
    setPriority("Bình thường");
    photos.forEach((photo) => URL.revokeObjectURL(photo));
    setPhotos([]);
    showToast("Đã gửi phiếu báo hỏng cho quản lý");
  };

  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">Báo hỏng vật tư</h1>
        <p className="mt-2 text-sm text-slate-500">Gửi mô tả và hình ảnh để kỹ thuật viên xử lý nhanh nhất.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <form className="space-y-6 rounded-sm border border-slate-200 bg-white p-6 shadow-xs lg:col-span-3" onSubmit={submit}>
          <div className="flex items-center gap-3 rounded-sm bg-slate-50 p-3 text-xs text-slate-600">
            <Icon name="bed" className="size-5 text-slate-400" />
            <span>
              Phiếu gắn với phòng <span className="font-mono font-medium text-slate-900">{TENANT.room}</span> · giường <span className="font-mono font-medium text-slate-900">{TENANT.bed}</span>
            </span>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-800">Tiêu đề</span>
            <input
              className="focus-ring h-10 w-full rounded-sm border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-500"
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Quạt trần phát ra tiếng kêu"
              value={title}
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-800">Loại sự cố</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Button
                  key={item}
                  className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${category === item ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-1.5 text-xs font-semibold text-slate-800">
            Vị trí hỏng hóc cụ thể
            <select
              className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-brand-500"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>Tại giường ngủ cá nhân</option>
              <option>Khu vực vệ sinh trong phòng</option>
              <option>Khu vực ban công</option>
              <option>Thiết bị điện tử chung</option>
            </select>
          </label>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-800">Mức độ ưu tiên</legend>
            <PriorityPicker value={priority} onChange={setPriority} />
          </fieldset>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-xs font-semibold text-slate-800">
              Mô tả sự cố
              <span className={`text-xs font-medium ${valid ? "text-success-600" : "text-slate-400"}`}>{description.trim().length}/10 ký tự tối thiểu</span>
            </span>
            <textarea
              className="focus-ring min-h-28 w-full resize-none rounded-sm border border-slate-200 p-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="VD: Quạt trần phát ra tiếng kêu to khi chạy tốc độ 2 và 3..."
              value={description}
            />
          </label>
          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>Hình ảnh hiện trạng</span>
              <span className="text-xs font-medium text-slate-400">{photos.length}/3 ảnh</span>
            </div>
            {photos.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, index) => (
                  <div className="relative overflow-hidden rounded-sm border border-slate-200" key={photo}>
                    <img alt={`Ảnh sự cố ${index + 1}`} className="h-24 w-full object-cover" src={photo} />
                    <Button label={`Xóa ảnh ${index + 1}`} className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-sm bg-slate-900/80 text-white" onClick={() => {
                      URL.revokeObjectURL(photo);
                      setPhotos(photos.filter((item) => item !== photo));
                    }}>
                      <Icon name="close" className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 3 && (
              <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 text-slate-500 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600">
                <Icon name="camera" className="size-6" />
                <span className="text-xs font-semibold">Thêm ảnh từ máy hoặc camera</span>
                <span className="text-[11px] text-slate-400">JPG, PNG · tối đa 3 ảnh</span>
                <input
                  accept="image/*"
                  className="sr-only"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []).slice(0, 3 - photos.length);
                    setPhotos([...photos, ...files.map((file) => URL.createObjectURL(file))]);
                  }}
                  type="file"
                />
              </label>
            )}
          </div>

          <button
            className="focus-ring flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:translate-y-[1px] disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!valid}
            type="submit"
          >
            <Icon name="send" className="size-4" />
            Gửi phiếu báo hỏng
          </button>
        </form>

        <aside className="lg:col-span-2">
          <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Phiếu của phòng</h2>
              <p className="mt-1 text-sm text-slate-500">{myTickets.length} phiếu gần đây</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {myTickets.map((ticket) => {
                const tone = ticketTone[ticket.status];
                return (
                  <li className="p-5" key={ticket.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-500">{ticket.id}</span>
                      <span className={`status-label ${tone.cls}`}>{tone.label}</span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div className="text-sm font-bold text-slate-900">{ticket.title}</div>
                      <PriorityTag priority={ticket.priority} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{ticket.category}</span>
                      <span>·</span>
                      <span>{ticket.createdAt}</span>
                    </div>
                    {ticket.resolution && <p className="mt-2.5 rounded-sm bg-success-50 p-2.5 text-xs leading-5 text-success-700 border border-success-100">{ticket.resolution}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

function TenantVehiclesPage({
  vehicles,
  onVehiclesChange,
  showToast,
}: {
  vehicles: TenantVehicle[];
  onVehiclesChange: (vehicles: TenantVehicle[]) => void;
  showToast: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<TenantVehicle["type"]>("Xe tay ga");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const valid = Boolean(/^[0-9A-Z .-]{8,14}$/.test(plate.trim().toUpperCase()) && brand.trim() && color.trim() && front && back);

  useEffect(() => () => {
    if (front) URL.revokeObjectURL(front);
    if (back) URL.revokeObjectURL(back);
  }, [front, back]);

  const submit = () => {
    if (!valid) return;
    onVehiclesChange([
      {
        id: `XE-${String(vehicles.length + 1).padStart(3, "0")}`,
        plate: plate.trim().toUpperCase(),
        type,
        brand: brand.trim(),
        color: color.trim(),
        status: "Chờ duyệt",
      },
      ...vehicles,
    ]);
    setOpen(false);
    setPlate("");
    setBrand("");
    setColor("");
    setFront("");
    setBack("");
    showToast("Đã gửi đăng ký xe máy thành công!");
  };

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700">STU-08 · PHƯƠNG TIỆN</div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">Quản lý phương tiện cá nhân</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Khai báo xe máy và tải ảnh cà vẹt để Ban quản lý đối soát, cấp thẻ giữ xe.</p>
        </div>
        <Button className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]" onClick={() => setOpen(true)}>
          Đăng ký xe mới
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {vehicles.map((vehicle) => (
          <article className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs" key={vehicle.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="rounded-sm border border-slate-800 bg-white px-3 py-1 font-mono text-lg font-bold tracking-wide text-slate-900">{vehicle.plate}</div>
              <span className={`status-label ${vehicle.status === "Đã cấp thẻ xe" ? "status-label-success" : "status-label-warning"}`}>
                {vehicle.status}{vehicle.cardCode ? ` · ${vehicle.cardCode}` : ""}
              </span>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Hãng & dòng xe</dt><dd className="mt-1 font-semibold text-slate-900">{vehicle.brand}</dd></div>
              <div><dt className="text-slate-500">Màu sơn</dt><dd className="mt-1 font-semibold text-slate-900">{vehicle.color}</dd></div>
              <div><dt className="text-slate-500">Phân loại</dt><dd className="mt-1"><span className="status-label status-label-brand">{vehicle.type}</span></dd></div>
              <div><dt className="text-slate-500">Cà vẹt xe</dt><dd className="mt-1 flex items-center gap-2 font-semibold text-brand-700"><Icon name="image" className="size-4" /> Đủ 2 mặt</dd></div>
            </dl>
          </article>
        ))}
      </div>

      {open && (
        <Modal title="Khai báo xe máy mới" description="Cung cấp đủ thông tin và ảnh cà vẹt hai mặt để được xét duyệt." onClose={() => setOpen(false)}>
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Biển số xe máy
              <input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono uppercase outline-none focus:border-brand-500" placeholder="VD: 59-X3 789.12" value={plate} onChange={(event) => setPlate(event.target.value.toUpperCase())} />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Phân loại xe</legend>
              <div className="flex flex-wrap gap-2">
                {(["Xe tay ga", "Xe số", "Xe máy điện", "Xe côn tay"] as const).map((item) => (
                  <Button key={item} className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${type === item ? "border-brand-500 bg-brand-500 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`} onClick={() => setType(item)}>{item}</Button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Hãng & dòng xe<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500" placeholder="Honda Air Blade" value={brand} onChange={(event) => setBrand(event.target.value)} /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">Màu sơn<input className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500" placeholder="Đen nhám" value={color} onChange={(event) => setColor(event.target.value)} /></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                ["Mặt trước cà vẹt", front, setFront],
                ["Mặt sau cà vẹt", back, setBack],
              ] as const).map(([label, preview, setter]) => (
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-dashed border-brand-200 bg-brand-50/50 p-3 text-center text-brand-700" key={label}>
                  {preview ? <img className="h-24 w-full rounded-sm object-cover" src={preview} alt={label} /> : <><Icon name="camera" className="size-6" /><span className="text-xs font-semibold">{label}</span><span className="text-[11px] text-slate-500">Bấm để chọn hoặc chụp ảnh</span></>}
                  <input className="sr-only" type="file" accept="image/*" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) setter(URL.createObjectURL(file));
                  }} />
                </label>
              ))}
            </div>
            <p className="rounded-sm bg-info-50 p-2.5 text-xs leading-5 text-info-700 border border-info-100">Ảnh cần rõ nét, không lóa sáng, nhìn rõ tên chủ xe, biển số, số khung và số máy.</p>
            <div className="flex gap-2">
              <Button className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={() => setOpen(false)}>Hủy bỏ</Button>
              <Button className="h-10 flex-[1.5] rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-300" disabled={!valid} onClick={submit}>Gửi thông tin đăng ký xe</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function InvoiceArt() {
  return (
    <svg viewBox="0 0 240 170" className="mx-auto h-40 w-auto" role="img" aria-label="Không có hóa đơn">
      <ellipse cx="120" cy="154" rx="78" ry="8" fill="#DBEAFE" />
      <rect x="64" y="22" width="112" height="126" rx="12" fill="#fff" stroke="#BFDBFE" strokeWidth="2" />
      <rect x="82" y="44" width="48" height="8" rx="4" fill="#DBEAFE" />
      <rect x="82" y="64" width="76" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="82" y="80" width="60" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="82" y="96" width="68" height="7" rx="3.5" fill="#E2E8F0" />
      <circle cx="160" cy="124" r="22" fill="#10B981" />
      <circle cx="160" cy="124" r="22" fill="none" stroke="#D1FAE5" strokeWidth="5" />
      <path d="m150 125 8 8 14-16" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="52" r="5" fill="#2563EB" opacity=".7" />
      <circle cx="204" cy="60" r="4" fill="#F59E0B" />
      <rect x="196" y="100" width="9" height="9" rx="2" fill="#2563EB" opacity=".5" transform="rotate(20 200 104)" />
      <path d="M32 112c5-5 10 5 15 0" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CopyRow({ label, value, mono, onCopy, copyLabel }: { label: string; value: string; mono?: boolean; onCopy: () => void; copyLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-sm bg-slate-50 px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`mt-0.5 truncate text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
      <Button className="flex h-8 shrink-0 items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-medium text-brand-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={onCopy}>
        <Icon name="copy" className="size-3.5" />
        {copyLabel}
      </Button>
    </div>
  );
}

function PaymentProofPanel({
  inv,
  memo,
  onSubmitProof,
  showToast,
}: {
  inv: TenantInvoice;
  memo: string;
  onSubmitProof: (id: string) => void;
  showToast: (message: string) => void;
}) {
  const [proof, setProof] = useState("");

  useEffect(() => () => {
    if (proof) URL.revokeObjectURL(proof);
  }, [proof]);

  if (inv.status === "Chờ xác nhận") {
    return (
      <div className="flex flex-col justify-center border-t border-warning-100 bg-warning-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
        <span className="status-label status-label-warning"><Icon name="clock" className="size-4" />Chờ Quản lý xác nhận</span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-950">Minh chứng đã được gửi</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Ban Quản lý sẽ đối soát và phản hồi trong vòng 2–4 giờ làm việc. Hóa đơn chỉ chuyển sang “Đã thu” sau khi được duyệt.</p>
        <div className="mt-4 flex items-center gap-3 rounded-sm border border-warning-100 bg-white p-3">
          <span className="icon-box icon-box-warning"><Icon name="image" /></span>
          <div><div className="text-sm font-semibold text-slate-900">minh-chung-thanh-toan.png</div><div className="text-xs text-slate-500">Đã gửi lúc 14:20 · 19/10/2026</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-2.5 py-1 font-mono text-xs font-semibold text-brand-700"><Icon name="qr" className="size-3.5" /> VIETQR</div>
        <div className="mt-3 w-fit rounded-sm border border-slate-200 bg-white p-2.5 shadow-xs"><QrCode seed={`${inv.id}${inv.amount}`} /></div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{BANK.name} · {BANK.account}<br />Nội dung: <span className="font-mono text-slate-700">{memo}</span></p>
      </div>
      <div className="my-6 h-px bg-slate-200" />
      <h3 className="font-heading text-base font-bold text-slate-950">Gửi minh chứng thanh toán</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">Tải ảnh biên lai sau khi giao dịch thành công để Quản lý đối soát.</p>
      {proof ? (
        <div className="relative mt-4 overflow-hidden rounded-sm border border-slate-200 bg-white">
          <img src={proof} alt="Minh chứng thanh toán đã chọn" className="h-36 w-full object-cover" />
          <Button label="Xóa ảnh" className="absolute right-2 top-2 grid size-7 place-items-center rounded-sm bg-slate-900/80 text-white" onClick={() => setProof("")}><Icon name="close" className="size-3.5" /></Button>
        </div>
      ) : (
        <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-slate-600">
          <Icon name="camera" className="size-7" />
          <span className="text-sm font-semibold">Chọn ảnh hoặc chụp biên lai</span>
          <span className="text-xs text-slate-500">JPG, PNG, PDF · tối đa 5MB</span>
          <input className="sr-only" type="file" accept="image/*,.pdf" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setProof(URL.createObjectURL(file));
          }} />
        </label>
      )}
      <Button
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-300"
        disabled={!proof}
        onClick={() => {
          onSubmitProof(inv.id);
          showToast("Minh chứng đã được gửi tới Ban Quản lý");
        }}
      >
        <Icon name="send" className="size-4" /> Gửi minh chứng cho Quản lý
      </Button>
    </div>
  );
}

function TenantInvoicesPage({ invoices, onSubmitProof, showToast }: { invoices: TenantInvoice[]; onSubmitProof: (id: string) => void; showToast: (message: string) => void }) {
  const TENANT = useContext(TenantCtx);
  const unpaid = invoices.filter((item) => item.status === "Chưa thanh toán");
  const pending = invoices.filter((item) => item.status === "Chờ xác nhận");
  const paid = invoices.filter((item) => item.status === "Đã thanh toán");
  const unpaidTotal = unpaid.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = paid.reduce((sum, item) => sum + item.amount, 0);

  const copy = (text: string, message: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    showToast(message);
  };

  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">Hóa đơn của tôi</h1>
        <p className="mt-2 text-sm text-slate-500">Bảng kê minh bạch, VietQR và minh chứng để Quản lý đối soát.</p>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm font-medium text-slate-500">Cần thanh toán</div>
          <div className={`mt-2 font-heading text-2xl font-bold ${unpaidTotal ? "text-danger-600" : "text-slate-950"}`}>{money(unpaidTotal)}</div>
          <div className="mt-1 text-xs text-slate-400">{unpaid.length} hóa đơn cần xử lý · {pending.length} chờ xác nhận</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-slate-500">Đã thanh toán</div>
          <div className="mt-2 font-heading text-2xl font-bold text-success-600">{money(paidTotal)}</div>
          <div className="mt-1 text-xs text-slate-400">{paid.length} hóa đơn</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-slate-500">Hạn gần nhất</div>
          <div className="mt-2 font-heading text-2xl font-bold text-slate-950">{unpaid[0]?.due ?? "—"}</div>
          <div className="mt-1 text-xs text-slate-400">{unpaid.length ? "Vui lòng thanh toán đúng hạn" : "Không có khoản nào đến hạn"}</div>
        </Card>
      </div>

      {unpaid.length === 0 && (
        <section className="mb-8 rounded-sm border border-slate-200 bg-white px-6 py-10 text-center shadow-xs">
          <InvoiceArt />
          <p className="mt-4 text-sm text-slate-500">Hiện tại bạn không có hóa đơn nào cần thanh toán.</p>
        </section>
      )}

      <div className="space-y-6">
        {[...unpaid, ...pending].map((inv) => {
          const memo = `KTXHUB ${inv.id} ${TENANT.room} ${TENANT.bed}`;
          return (
            <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs" key={inv.id}>
              <div className="grid xl:grid-cols-5">
                <div className="p-6 sm:p-8 xl:col-span-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-700">{inv.id}</div>
                      <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">{inv.title}</h2>
                    </div>
                    <span className="status-label status-label-warning"><Icon name="clock" className="size-3.5" />{inv.status}</span>
                  </div>

                  <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600">Tiền thuê phòng định kỳ</dt><dd className="font-semibold text-slate-900">{money(inv.amount)}</dd></div>
                    <div className="py-4">
                      <div className="flex justify-between gap-4"><dt className="font-semibold text-slate-700">Điện sinh hoạt</dt><dd className="font-mono font-bold text-slate-950">0 kWh = 0 đ</dd></div>
                      <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-3"><span>Đầu kỳ: 1.420 kWh</span><span>Cuối kỳ: 1.420 kWh</span><span>Đơn giá: 3.500 đ/kWh</span></div>
                      <p className="mt-3 rounded-sm bg-info-50 p-2.5 text-xs text-info-700 border border-info-100">Thực tế tiêu thụ 0 kWh — đồng hồ không phát sinh trong kỳ chốt.</p>
                    </div>
                    <div className="py-4">
                      <div className="flex justify-between gap-4"><dt className="font-semibold text-slate-700">Nước sinh hoạt</dt><dd className="font-mono font-bold text-slate-950">0 m³ = 0 đ</dd></div>
                      <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-3"><span>Đầu kỳ: 85 m³</span><span>Cuối kỳ: 85 m³</span><span>Đơn giá: 25.000 đ/m³</span></div>
                      <p className="mt-3 rounded-sm bg-info-50 p-2.5 text-xs text-info-700 border border-info-100">Thực tế tiêu thụ 0 m³ — không phát sinh sản lượng nước trong kỳ.</p>
                    </div>
                    <div className="flex justify-between gap-4 py-3"><dt className="text-slate-600">Wifi, rác thải, vệ sinh hành lang</dt><dd className="font-semibold text-success-600">Miễn phí</dd></div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <dt className="font-semibold text-slate-900">Tổng cần thanh toán</dt>
                      <dd className="font-heading text-2xl font-bold text-brand-700">{money(inv.amount)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <Icon name="calendar" className="size-4 text-slate-400" />
                    Hạn thanh toán: <b className="font-semibold text-slate-900">{inv.due}</b>
                  </div>

                  <div className="mt-6 space-y-3">
                    <CopyRow label={`${BANK.name} · ${BANK.holder}`} value={BANK.account} mono copyLabel="Sao chép STK" onCopy={() => copy(BANK.account, "Đã sao chép số tài khoản")} />
                    <CopyRow label="Nội dung thanh toán" value={memo} mono copyLabel="Sao chép nội dung" onCopy={() => copy(memo, "Đã sao chép nội dung thanh toán")} />
                  </div>
                </div>

                <PaymentProofPanel inv={inv} memo={memo} onSubmitProof={onSubmitProof} showToast={showToast} />
              </div>
            </article>
          );
        })}
      </div>

      {paid.length > 0 && (
        <section className="mt-8 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-heading text-lg font-bold text-slate-900">Lịch sử thanh toán</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-6 py-3">Hóa đơn</th><th className="px-6 py-3">Ngày thanh toán</th><th className="px-6 py-3">Số tiền</th><th className="px-6 py-3">Trạng thái</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paid.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4"><div className="font-mono text-sm font-semibold text-brand-700">{item.id}</div><div className="mt-1 text-xs text-slate-500">{item.title}</div></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.paidAt}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{money(item.amount)}</td>
                    <td className="px-6 py-4"><span className="status-label status-label-success">Đã thanh toán</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

function RequestModal({ kind, onClose, onSubmit }: { kind: RequestKind; onClose: () => void; onSubmit: (message: string) => void }) {
  const [choice, setChoice] = useState(0);
  const config = requestConfig[kind];
  return (
    <Modal title={config.title} onClose={onClose}>
      <div className="p-6">
        <p className="mb-4 text-sm text-slate-600">{config.intro}</p>
        <div className="space-y-2">
          {config.options.map((option, index) => (
            <Button
              key={option}
              className={`flex min-h-12 w-full items-center gap-3 rounded-sm border px-3.5 py-2.5 text-left text-sm font-medium ${choice === index ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              onClick={() => setChoice(index)}
            >
              <span className={`grid size-4 shrink-0 place-items-center rounded-sm border ${choice === index ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"}`}>
                {choice === index && <Icon name="check" className="size-3" />}
              </span>
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]" onClick={onClose}>
            Hủy
          </Button>
          <Button className="h-10 flex-[1.5] rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]" onClick={() => onSubmit(config.done)}>
            {config.cta}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
