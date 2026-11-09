import { useEffect, useState } from "react";
import { AccountMenu, Button, Icon, type IconName } from "../../components/common/index.ts";
import type { Ticket } from "../../types/incident.ts";
import type { Invoice } from "../../types/invoice.ts";
import type { ContractRecord, TenantRecord } from "../../types/tenant.ts";
import { invoicesForTenant } from "../../utils/invoiceOwnership.ts";
import { getIncidentNotifications, getViolations, markIncidentNotificationRead, subscribeIncidentStore } from "../../services/mock/incidentStore.ts";
import { env } from "../../config/env.ts";
import {
  DEMO_TENANT,
  initialsOf,
  TenantCtx,
  type Page,
  type RequestKind,
  type TenantInfo,
  type TenantInvoice,
  type TenantVehicle,
  type TenantNotification,
  type PersonalViolation,
} from "./tenantConstants.tsx";
import { NotificationsDrawer } from "./NotificationsDrawer.tsx";
import { RoomPage } from "./RoomPage.tsx";
import { TenantInvoicesPage } from "./TenantInvoicesPage.tsx";
import { TenantVehiclesPage } from "./TenantVehiclesPage.tsx";
import { ReportPage } from "./ReportPage.tsx";
import { RequestModal } from "./RequestModal.tsx";

export function TenantPortal({
  tenant,
  tenants,
  contracts,
  tickets,
  invoices: externalInvoices,
  onSubmitInvoiceProof,
  vehicles: externalVehicles,
  onCreateVehicle,
  onCreateTicket,
  onLogout,
  showToast,
}: {
  tenant: TenantRecord;
  tenants: TenantRecord[];
  contracts?: ContractRecord[];
  tickets: Ticket[];
  invoices?: Invoice[];
  onSubmitInvoiceProof?: (id: string, tenantId: string, proof: NonNullable<Invoice["proof"]>) => Promise<void>;
  vehicles?: TenantVehicle[];
  onCreateVehicle?: (vehicle: TenantVehicle) => Promise<void>;
  onCreateTicket: (ticket: Ticket) => Promise<Ticket>;
  onLogout: () => void;
  showToast: (message: string) => void;
}) {
  const activeContract = contracts?.find((item) => item.tenantId === tenant.id && item.status !== "Đã thanh lý");
  const TENANT: TenantInfo = {
    ...DEMO_TENANT,
    name: tenant.name,
    gender: tenant.gender,
    cccd: tenant.cccd,
    email: tenant.email,
    phone: tenant.phone,
    address: tenant.address,
    room: tenant.room,
    bed: tenant.bed,
    initials: initialsOf(tenant.name),
    floor: "Chưa có thông tin tầng",
    contract: activeContract?.id ?? "Chưa có thông tin",
    deposit: tenant.deposit,
  };
  const roommates = tenants
    .filter((person) => tenant.status !== "Đã trả phòng" && Boolean(activeContract?.roomId) && person.id !== tenant.id && person.status !== "Đã trả phòng" && contracts?.some((item) => item.tenantId === person.id && item.status !== "Đã thanh lý" && item.roomId === activeContract?.roomId))
    .map(({ id, name, bed }) => ({ id, name, bed }));
  const isResident = tenant.status !== "Đã trả phòng";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [, setIncidentVersion] = useState(0);
  useEffect(() => env.USE_MOCK ? subscribeIncidentStore(() => setIncidentVersion((version) => version + 1)) : undefined, []);
  const notifications: TenantNotification[] = env.USE_MOCK && tenant.id ? getIncidentNotifications(tenant.id) : [];
  const violations: PersonalViolation[] = env.USE_MOCK && tenant.id ? getViolations(tenant.id).flatMap((item) => {
    if (!["Về muộn", "Gây ồn", "Vệ sinh", "Khách ngoài", "Hút thuốc / cháy nổ", "Khác"].includes(item.type) ||
        !["Nhắc nhở", "Cảnh cáo", "Phạt tiền"].includes(item.level)) return [];
    return [{ ...item, type: item.type as PersonalViolation["type"], level: item.level as PersonalViolation["level"] }];
  }) : [];
  const unreadNoticesCount = notifications.filter((n) => !n.read).length;
  const myDormInvoices = invoicesForTenant(externalInvoices ?? [], tenant.id, contracts ?? []);
  const invoices: (TenantInvoice & { paymentMethod?: string; proof?: Invoice["proof"] })[] =
    myDormInvoices
      ? myDormInvoices.map((inv) => {
          const isPending = inv.status === "Chờ xác nhận";
          const status =
            inv.status === "Đã thu"
              ? ("Đã thanh toán" as const)
              : isPending
                ? ("Chờ xác nhận" as const)
                : ("Chưa thanh toán" as const);
          return {
            id: inv.id,
            title:
              inv.kind ??
              `Tiền phòng ${inv.due.split("/")[1] ? `tháng ${inv.due.split("/")[1]}/${inv.due.split("/")[2]}` : ""}`,
            items: [[inv.kind ?? "Tiền phòng trọn gói", inv.amount]],
            amount: inv.amount,
            due: inv.due,
            status,
            paidAt: inv.payment?.paidAt ?? "",
            paymentMethod: inv.payment?.method,
            proof: inv.proof,
          };
        })
      : [];
  const allVehicles = externalVehicles ?? [];
  const myVehicles = allVehicles.filter((vehicle) => vehicle.tenantId === tenant.id);

  const handleCreateVehicle = async (vehicle: TenantVehicle) => {
    if (!onCreateVehicle) throw new Error("Chưa có nơi lưu phương tiện");
    await onCreateVehicle(vehicle);
  };
  const pendingDeposit = false;
  const submitProof = async (id: string, file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Không đọc được tệp minh chứng"));
      reader.onerror = () => reject(new Error("Không đọc được tệp minh chứng"));
      reader.readAsDataURL(file);
    });
    if (externalInvoices) {
      const invoice = myDormInvoices?.find((item) => item.id === id);
      if (!onSubmitInvoiceProof || !invoice || invoice.status !== "Nợ" || invoice.payment) {
        throw new Error("Không thể gửi minh chứng cho hóa đơn này");
      }
      const proof = { fileName: file.name, submittedAt: new Date().toLocaleString("vi-VN"), dataUrl };
      await onSubmitInvoiceProof(id, tenant.id, proof);
    } else {
      throw new Error("Chưa có nơi lưu minh chứng; vui lòng liên hệ Ban Quản lý");
    }
  };
  const [page, setPage] = useState<Page>("room");
  const [request, setRequest] = useState<RequestKind | null>(null);
  const myTickets: Ticket[] = tickets.filter((ticket) => ticket.reporterTenantId === tenant.id);
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
                label="Thông báo và Kỷ luật"
                className="relative grid size-9 place-items-center rounded-sm text-slate-600 hover:bg-slate-100"
                onClick={() => setNotificationsOpen(true)}
              >
                <Icon name="bell" className="size-4" />
                {unreadNoticesCount > 0 && (
                  <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-danger-500 font-mono text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNoticesCount}
                  </span>
                )}
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
            {page === "room" && !isResident && (
              <p>Không có hợp đồng cư trú hiện hành. Bạn có thể xem hóa đơn cũ trong mục Hóa đơn.</p>
            )}
            {page === "room" && isResident && (
              <RoomPage
                tenant={tenant}
                contract={activeContract}
                roommates={roommates}
                vehicles={myVehicles}
                myTickets={myTickets}
                onReport={() => setPage("report")}
                onVehicles={() => setPage("vehicles")}
                onRequest={setRequest}
                pendingDeposit={pendingDeposit}
                onPay={() => setPage("invoices")}
              />
            )}
            {page === "room" && (
              <section className="mt-6 rounded-sm border border-slate-200 bg-white p-6">
                <h2 className="font-heading text-lg font-bold text-slate-900">Lịch sử hợp đồng</h2>
                {!contracts && <p className="mt-3 text-sm text-slate-500">Chưa có dữ liệu hợp đồng.</p>}
                {contracts && contracts.filter((item) => item.tenantId === tenant.id).length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">Chưa có hợp đồng.</p>
                )}
                {contracts?.filter((item) => item.tenantId === tenant.id).map((item) => (
                  <article key={item.id} className="mt-4 border-t border-slate-100 pt-4 text-sm">
                    <h3 className="font-semibold">{item.id} · {item.status}</h3>
                    <p className="mt-1 text-slate-600">{item.startDate} – {item.endDate} · {item.room} · {item.bed}</p>
                    {item.renewals?.filter((renewal) => renewal.contractId === item.id).map((renewal) => (
                      <p key={renewal.id} className="mt-1 text-slate-600">Gia hạn: {renewal.startDate} – {renewal.endDate}</p>
                    ))}
                    {(item.documents?.filter((doc) => doc.contractId === item.id) ?? []).map((doc) => (
                      <div key={doc.id} className="mt-2">
                        {doc.content || doc.url ? (
                          <a className="text-brand-700 underline" href={doc.content || doc.url} download={doc.name}>{doc.name}</a>
                        ) : <span>{doc.name} — Chưa có tệp</span>}
                      </div>
                    ))}
                    {!item.documents?.some((doc) => doc.contractId === item.id) && <p className="mt-2 text-slate-500">Chưa có tài liệu hợp đồng.</p>}
                  </article>
                ))}
              </section>
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
                vehicles={myVehicles}
                tenantId={tenant.id}
                canRegister={isResident}
                onCreateVehicle={handleCreateVehicle}
                showToast={showToast}
              />
            )}
            {page === "report" && !isResident && (
              <p>Không thể gửi báo hỏng mới vì bạn đã trả phòng.</p>
            )}
            {page === "report" && isResident && (
              <ReportPage
                tenantId={tenant.id}
                resident={isResident}
                roomId={activeContract?.roomId}
                bedId={activeContract?.bedId}
                myTickets={tickets}
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
        <NotificationsDrawer
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          violations={violations}
          onMarkAllRead={() => {
            try {
              notifications.filter((item) => !item.read).forEach((item) => markIncidentNotificationRead(item.id, tenant.id));
              showToast("Đã đánh dấu tất cả thông báo là đã đọc");
            } catch (error) {
              showToast(error instanceof Error ? error.message : "Không thể cập nhật thông báo");
            }
          }}
        />
      </div>
    </TenantCtx.Provider>
  );
}
