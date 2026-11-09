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

function AppContent() {
  const { role, currentUser, logout } = useAuth();
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
    loading,
    onRoomsChange,
    onCreateRoom,
    onUpdateRoom,
    onDeleteRoom,
    onUpdateBedStatus,
    onSubmitInvoiceProof,
    onRejectInvoiceProof,
    onConfirmInvoiceProof,
    onCreateTicket,
    onUpdateTicket,
    onConfirmPayment,
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
              <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Môi trường Mock:</span> Dữ liệu lưu trong trình duyệt cục bộ.
              </span>
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
          {activeNav === "Phòng & giường" ? (
            <RoomsPage
              rooms={rooms}
              onRoomsChange={onRoomsChange}
              onCreateRoom={onCreateRoom}
              onUpdateRoom={onUpdateRoom}
              onDeleteRoom={onDeleteRoom}
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
