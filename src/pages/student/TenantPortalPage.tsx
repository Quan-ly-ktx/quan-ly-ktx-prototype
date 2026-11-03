import { useState } from "react";
import { AccountMenu, Button, Icon, type IconName } from "../../components/common/index.ts";
import type { Ticket } from "../../types/incident.ts";
import {
  DEMO_TENANT,
  demoInvoices,
  initialTenantVehicles,
  TenantCtx,
  type Page,
  type RequestKind,
  type TenantInfo,
  type TenantInvoice,
} from "./studentConstants.tsx";
import { RoomPage } from "./RoomPage.tsx";
import { TenantInvoicesPage } from "./TenantInvoicesPage.tsx";
import { TenantVehiclesPage } from "./TenantVehiclesPage.tsx";
import { ReportPage } from "./ReportPage.tsx";
import { RequestModal } from "./RequestModal.tsx";

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
    setProofSubmitted((submitted) =>
      submitted.includes(id) ? submitted : [...submitted, id],
    );
    showToast("Đã gửi minh chứng cho Quản lý");
  };
  const [page, setPage] = useState<Page>("room");
  const [request, setRequest] = useState<RequestKind | null>(null);
  const myTickets = tickets.filter((ticket) => ticket.room === TENANT.room);
  const openCount = myTickets.filter(
    (ticket) => ticket.status !== "Hoàn thành",
  ).length;

  const nav: { id: Page; label: string; icon: IconName; badge?: number }[] = [
    { id: "room", label: "Phòng của tôi", icon: "bed" },
    {
      id: "invoices",
      label: "Hóa đơn",
      icon: "invoice",
      badge:
        invoices.filter((item) => item.status === "Chưa thanh toán").length ||
        undefined,
    },
    { id: "vehicles", label: "Phương tiện", icon: "clipboard" },
    {
      id: "report",
      label: "Báo hỏng vật tư",
      icon: "tools",
      badge: openCount || undefined,
    },
  ];
  const pageTitle =
    page === "room"
      ? "Phòng của tôi"
      : page === "invoices"
        ? "Hóa đơn"
        : page === "vehicles"
          ? "Phương tiện"
          : "Báo hỏng vật tư";

  return (
    <TenantCtx.Provider value={TENANT}>
      <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
        <aside className="fixed inset-y-0 left-0 z-drawer hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-18 items-center gap-3 border-b border-slate-100 px-5">
            <div className="grid size-9 place-items-center rounded-sm bg-brand-500 text-white">
              <Icon name="building" className="size-4" />
            </div>
            <div>
              <div className="font-heading text-base font-bold tracking-tight text-slate-950">
                KTX Hub
              </div>
              <div className="font-mono text-xs text-slate-400">
                Cổng người thuê
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-5" aria-label="Điều hướng người thuê">
            <div className="mb-2 px-3 text-xs font-bold tracking-widest text-slate-400">
              CỦA TÔI
            </div>
            <div className="space-y-1">
              {nav.map((item) => {
                const active = page === item.id;
                return (
                  <Button
                    key={item.id}
                    className={`flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm font-medium transition-all ${
                      active
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                    onClick={() => setPage(item.id)}
                  >
                    <Icon name={item.icon} className="size-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-sm px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
                          active
                            ? "bg-white text-brand-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </nav>
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2.5 rounded-sm bg-slate-50 p-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
                {TENANT.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-slate-800">
                  {TENANT.name}
                </div>
                <div className="truncate font-mono text-[11px] text-slate-500">
                  {TENANT.email}
                </div>
              </div>
              <Button
                label="Đăng xuất"
                className="grid size-8 place-items-center rounded-sm text-slate-400 hover:bg-white hover:text-danger-600"
                onClick={onLogout}
              >
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
              <Button
                label="Thông báo"
                className="relative grid size-9 place-items-center rounded-sm text-slate-600 hover:bg-slate-100"
                onClick={() =>
                  showToast("Hợp đồng của bạn có hiệu lực đến 01/09/2027")
                }
              >
                <Icon name="bell" className="size-4" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-danger-500 ring-2 ring-white" />
              </Button>
              <div className="mx-1 h-7 w-px bg-slate-200" />
              <AccountMenu
                initials={TENANT.initials}
                name={TENANT.name}
                subtitle="Người thuê"
                onLogout={onLogout}
                showToast={showToast}
              />
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-8">
            {page === "room" && (
              <RoomPage
                vehicles={vehicles}
                myTickets={myTickets}
                onReport={() => setPage("report")}
                onVehicles={() => setPage("vehicles")}
                onRequest={setRequest}
                pendingDeposit={pendingDeposit}
                onPay={() => setPage("invoices")}
              />
            )}
            {page === "invoices" && (
              <TenantInvoicesPage
                invoices={invoices}
                onSubmitProof={submitProof}
                showToast={showToast}
              />
            )}
            {page === "vehicles" && (
              <TenantVehiclesPage
                vehicles={vehicles}
                onVehiclesChange={setVehicles}
                showToast={showToast}
              />
            )}
            {page === "report" && (
              <ReportPage
                myTickets={myTickets}
                onCreate={onCreateTicket}
                showToast={showToast}
              />
            )}
          </main>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-sticky grid grid-cols-4 border-t border-slate-200 bg-white p-2 lg:hidden"
          aria-label="Điều hướng người thuê trên di động"
        >
          {nav.map((item) => (
            <Button
              key={item.id}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-sm text-xs font-semibold ${
                page === item.id
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500"
              }`}
              onClick={() => setPage(item.id)}
            >
              <Icon name={item.icon} className="size-5" />
              <span>
                {item.id === "room"
                  ? "Phòng"
                  : item.id === "invoices"
                    ? "Hóa đơn"
                    : item.id === "vehicles"
                      ? "Xe"
                      : "Sự cố"}
              </span>
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
