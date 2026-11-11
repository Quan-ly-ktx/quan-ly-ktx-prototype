import { useState } from "react";
import { Toast } from "./components/common/Toast.tsx";
import { Icon } from "./components/common/Icon.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { TenantPortal } from "./pages/tenant/TenantPortalPage.tsx";
import { TechnicianApp } from "./pages/technician/TechnicianPage.tsx";
import {
  AdminShell,
  DashboardPage,
  RoomsPage,
  TenantsPage,
  VehiclesPage,
  ContractsPage,
  InvoicesPage,
  FinancialPage,
  IncidentsPage,
  TechnicianAccountsPage,
  QuickModals,
  type QuickKind,
} from "./pages/admin/index.ts";
import { ToastProvider, AuthProvider, DormDataProvider } from "./contexts/index.ts";
import { useAuth, useToast, useDormData } from "./hooks/index.ts";
import type { Priority } from "./types/incident.ts";
import { env } from "./config/env.ts";
import { dormService } from "./services/dormService.ts";

function AppContent() {
  const { role, currentUser, logout } = useAuth();
  const [simClock, setSimClock] = useState(() => dormService.getBusinessDate());

  const handleSetSimDate = async (target: "01" | "25" | "end") => {
    const base = new Date();
    const year = base.getFullYear();
    const month = base.getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    let targetDate = "";
    if (target === "01") {
      targetDate = `${year}-${pad(month)}-01`;
    } else if (target === "25") {
      targetDate = `${year}-${pad(month)}-25`;
    } else {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      targetDate = `${year}-${pad(month)}-${pad(lastDay)}`;
    }
    dormService.setBusinessDate(targetDate);
    setSimClock(targetDate);
    showToast(`Đã chuyển ngày mô phỏng sang ${targetDate}`);
    await reload();
  };
  const { toast, showToast, closeToast } = useToast();
  const {
    rooms,
    tenants,
    invoices,
    tickets,
    contracts,
    vehicles,
    expenses,
    onCreateExpense,
    onUpdateExpense,
    onDeleteExpense,
    onRegisterVehicle,
    onIssueVehicleCard,
    onRevokeVehicle,
    onResetDemo,
    onOnboard,
    onRenewContract,
    onCheckoutContract,
    onAddContractDocuments,
    onDeleteContractDocument,
    onUpdateTenantProfile,
    error,
    loading,
    reload,
    onRoomsChange,
    onCreateRoom,
    onUpdateRoom,
    onDeleteRoom,
    onDeleteMistakenRoom,
    onArchiveRoom,
    onRestoreRoom,
    onUpdateBedStatus,
    onSubmitInvoiceProof,
    onRejectInvoiceProof,
    onConfirmInvoiceProof,
    onCreateTicket,
    onUpdateTicket,
    onConfirmPayment,
    onIssueInvoices,
  } = useDormData();

  const [activeNav, setActiveNav] = useState("Bảng điều khiển");
  const [quick, setQuick] = useState<QuickKind | null>(null);
  const [onboardSlot, setOnboardSlot] = useState<{ roomId: string; bedId: string } | null>(null);

  const handleNav = (label: string) => {
    setActiveNav(label);
  };

  const handleAssignTicket = async (id: string, tech?: string, priority?: Priority, deadline?: string) => {
    const ticket = tickets.find((item) => item.id === id);
    if (!ticket || ticket.status === "Hoàn thành") throw new Error("Phiếu không còn có thể phân công");
    await onUpdateTicket(id, {
      ...(tech ? { assigneeStaffId: tech } : {}),
      ...(tech && ticket.status === "Chưa phân công" ? { status: "Mới giao" as const } : {}),
      ...(priority ? { priority } : {}),
      ...(deadline ? { deadline } : {}),
    });
  };

  const toastNode = toast ? (
    <Toast message={toast} onClose={closeToast} />
  ) : null;


  if (role === "tenant") {
    const tenant = currentUser?.tenantId
      ? tenants.find((item) => item.id === currentUser.tenantId)
      : undefined;
    if (!tenant) {
      return (
        <main>
          <p>{loading ? "Đang tải hồ sơ người thuê…" : "Không thể xác định hồ sơ người thuê."}</p>
          <button type="button" onClick={() => void logout()}>Đăng xuất</button>
          {toastNode}
        </main>
      );
    }
    return (
      <>
        <TenantPortal
          tenant={tenant}
          tenants={tenants}
          tickets={tickets}
          contracts={contracts}
          invoices={invoices}
          onSubmitInvoiceProof={onSubmitInvoiceProof}
          vehicles={vehicles}
          onCreateVehicle={onRegisterVehicle}
          onCreateTicket={onCreateTicket}
          onLogout={logout}
          onUpdateTenantProfile={onUpdateTenantProfile}
          showToast={showToast}
        />
        {toastNode}
      </>
    );
  }

  if (role === "technician") {
    return (
      <>
        <TechnicianApp
          onLogout={logout}
          onUpdate={(id, patch) => onUpdateTicket(id, patch, currentUser?.staffId)}
          showToast={showToast}
          tickets={tickets}
          staffId={currentUser?.staffId}
        />
        {toastNode}
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <AdminShell
        activeNav={activeNav}
        onNavigate={handleNav}
        onLogout={logout}
        showToast={showToast}
        invoices={invoices}
      >
        <div className="mx-auto max-w-[1280px]">
          {env.USE_MOCK && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Mock Mode:</span>
                <span className="rounded-sm bg-brand-50 px-2 py-0.5 font-mono font-bold text-brand-700 border border-brand-100">
                  Ngày mô phỏng: {simClock}
                </span>
                <span className="text-slate-400">·</span>
                <button
                  type="button"
                  className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                  onClick={() => handleSetSimDate("01")}
                >
                  Ngày 01 (Onboarding)
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                  onClick={() => handleSetSimDate("25")}
                >
                  Ngày 25 (Hóa đơn)
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                  onClick={() => handleSetSimDate("end")}
                >
                  Cuối tháng
                </button>
                <input
                  type="date"
                  className="h-6 rounded-sm border border-slate-200 px-1 font-mono text-[11px]"
                  value={simClock}
                  onChange={async (e) => {
                    if (e.target.value) {
                      dormService.setBusinessDate(e.target.value);
                      setSimClock(e.target.value);
                      showToast(`Đã chuyển ngày mô phỏng sang ${e.target.value}`);
                      await reload();
                    }
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-brand-600 underline hover:text-brand-700"
                  onClick={async () => {
                    dormService.setBusinessDate(undefined);
                    const real = dormService.getBusinessDate();
                    setSimClock(real);
                    showToast("Đã đưa ngày mô phỏng về ngày thực tế.");
                    await reload();
                  }}
                >
                  Ngày thực tế
                </button>
              </div>
              <button
                type="button"
                className="focus-ring flex items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 active:translate-y-[1px] transition-all"
                onClick={async () => {
                  if (!window.confirm("Khôi phục dữ liệu demo? Mọi thay đổi dữ liệu demo sẽ bị xóa.")) return;
                  try {
                    await onResetDemo();
                    showToast("Đã khôi phục dữ liệu demo.");
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Không thể khôi phục dữ liệu demo.");
                  }
                }}
              >
                <Icon name="refresh" className="size-3.5 text-slate-500" />
                Khôi phục dữ liệu demo
              </button>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-sm border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">
              <div className="flex items-center gap-2.5">
                <Icon name="alert" className="size-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                className="focus-ring cursor-pointer rounded-sm bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px]"
                onClick={() => void reload()}
              >
                Thử lại
              </button>
            </div>
          )}
          {activeNav === "Phòng & giường" ? (
            <RoomsPage
              rooms={rooms}
              onRoomsChange={onRoomsChange}
              onCreateRoom={onCreateRoom}
              onUpdateRoom={onUpdateRoom}
              onDeleteRoom={onDeleteRoom}
              onDeleteMistakenRoom={onDeleteMistakenRoom}
              onArchiveRoom={onArchiveRoom}
              onRestoreRoom={onRestoreRoom}
              onUpdateBedStatus={onUpdateBedStatus}
              tenants={tenants}
              onQuickOnboard={(roomId, bedId) => {
                setOnboardSlot({ roomId, bedId });
                setActiveNav("Người thuê");
                const room = rooms.find((item) => item.id === roomId);
                const bedCode = Object.entries(room?.bedOverrides ?? {}).find(([, bed]) => bed.id === bedId)?.[0];
                showToast(`Đã chọn vị trí ${room?.code ?? ""} · ${bedCode ?? ""} để xếp khách`);
              }}
              showToast={showToast}
            />
          ) : activeNav === "Người thuê" ? (
            <TenantsPage
              tenants={tenants}
              rooms={rooms}
              onOnboard={onOnboard}
              onUpdateTenantProfile={onUpdateTenantProfile}
              invoices={invoices}
              initialSlot={onboardSlot}
              onClearInitialSlot={() => setOnboardSlot(null)}
              showToast={showToast}
            />
          ) : activeNav === "Phương tiện" ? (
            <VehiclesPage
              tenants={tenants}
              vehicles={vehicles}
              onIssueVehicleCard={onIssueVehicleCard}
              onRevokeVehicle={onRevokeVehicle}
              showToast={showToast}
            />
          ) : activeNav === "Hợp đồng" ? (
            <ContractsPage
              contracts={contracts}
              onRenewContract={onRenewContract}
              onCheckoutContract={onCheckoutContract}
              onAddContractDocuments={onAddContractDocuments}
              onDeleteContractDocument={onDeleteContractDocument}
              showToast={showToast}
            />
          ) : activeNav === "Hóa đơn" ? (
            <InvoicesPage
              records={invoices}
              onRejectInvoiceProof={onRejectInvoiceProof}
              onConfirmInvoiceProof={onConfirmInvoiceProof}
              managerStaffId={currentUser?.staffId}
              tenants={tenants}
              onConfirmPayment={onConfirmPayment}
              onIssueInvoices={onIssueInvoices}
              showToast={showToast}
            />
          ) : activeNav === "Tài chính" ? (
            <FinancialPage records={invoices} tickets={tickets} facilityExpenses={expenses} onCreateExpense={onCreateExpense} onUpdateExpense={onUpdateExpense} onDeleteExpense={onDeleteExpense} showToast={showToast} />
          ) : activeNav === "Sự cố & kỷ luật" ? (
            <IncidentsPage
              tickets={tickets}
              onAssign={handleAssignTicket}
              showToast={showToast}
            />
          ) : activeNav === "Kĩ thuật viên" ? (
            <TechnicianAccountsPage showToast={showToast} />
          ) : (
            <DashboardPage
              invoices={invoices}
              onNavigate={handleNav}
              onOpenQuick={setQuick}
              showToast={showToast}
            />
          )}
        </div>
      </AdminShell>

      {quick && (
        <QuickModals
          kind={quick}
          tickets={tickets}
          onAssign={handleAssignTicket}
          onClose={() => setQuick(null)}
        />
      )}

      {toastNode}
    </div>
  );
}

function SessionRoot() {
  const { role, login } = useAuth();
  const { toast, closeToast } = useToast();
  if (!role) {
    return (
      <>
        <LoginPage onLogin={login} />
        {toast && <Toast message={toast} onClose={closeToast} />}
      </>
    );
  }
  return (
    <DormDataProvider>
      <AppContent />
    </DormDataProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SessionRoot />
      </AuthProvider>
    </ToastProvider>
  );
}
