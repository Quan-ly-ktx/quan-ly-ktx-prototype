import { useState } from "react";
import { Toast } from "./components/common/Toast.tsx";
import { LoginPage } from "./pages/auth/LoginPage.tsx";
import { TenantPortal } from "./pages/student/TenantPortalPage.tsx";
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

function AppContent() {
  const { role, login, logout } = useAuth();
  const { toast, showToast, closeToast } = useToast();
  const {
    rooms,
    tenants,
    invoices,
    tickets,
    onRoomsChange,
    onCreateRoom,
    onUpdateRoom,
    onDeleteRoom,
    onUpdateBedStatus,
    onTenantsChange,
    onInvoicesChange,
    onCreateTicket,
    onUpdateTicket,
    onConfirmPayment,
  } = useDormData();

  const [activeNav, setActiveNav] = useState("Bảng điều khiển");
  const [quick, setQuick] = useState<QuickKind | null>(null);

  const handleNav = (label: string) => {
    setActiveNav(label);
  };

  const toastNode = toast ? (
    <Toast message={toast} onClose={closeToast} />
  ) : null;

  if (!role) {
    return (
      <>
        <LoginPage onLogin={login} />
        {toastNode}
      </>
    );
  }

  if (role === "student") {
    return (
      <>
        <TenantPortal
          onCreateTicket={onCreateTicket}
          onLogout={logout}
          showToast={showToast}
          tickets={tickets}
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
          onUpdate={onUpdateTicket}
          showToast={showToast}
          tickets={tickets}
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
          {activeNav === "Phòng & giường" ? (
            <RoomsPage
              rooms={rooms}
              onRoomsChange={onRoomsChange}
              onCreateRoom={onCreateRoom}
              onUpdateRoom={onUpdateRoom}
              onDeleteRoom={onDeleteRoom}
              onUpdateBedStatus={onUpdateBedStatus}
              tenants={tenants}
              onQuickOnboard={(roomCode, bedCode) => {
                setActiveNav("Người thuê");
                showToast(`Đã chọn vị trí ${roomCode} · ${bedCode} để xếp khách`);
              }}
              showToast={showToast}
            />
          ) : activeNav === "Người thuê" ? (
            <TenantsPage
              tenants={tenants}
              onTenantsChange={onTenantsChange}
              showToast={showToast}
            />
          ) : activeNav === "Phương tiện" ? (
            <VehiclesPage tenants={tenants} showToast={showToast} />
          ) : activeNav === "Hợp đồng" ? (
            <ContractsPage tenants={tenants} showToast={showToast} />
          ) : activeNav === "Hóa đơn" ? (
            <InvoicesPage
              records={invoices}
              onRecordsChange={onInvoicesChange}
              onConfirmPayment={onConfirmPayment}
              showToast={showToast}
            />
          ) : activeNav === "Tài chính" ? (
            <FinancialPage records={invoices} tickets={tickets} />
          ) : activeNav === "Sự cố & kỷ luật" ? (
            <IncidentsPage
              tickets={tickets}
              onAssign={(id, tech, priority) => {
                onUpdateTicket(id, {
                  ...(tech ? { assignee: tech } : {}),
                  ...(priority ? { priority } : {}),
                });
              }}
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
          onAssign={(id, tech, priority) => {
            onUpdateTicket(id, {
              ...(tech ? { assignee: tech } : {}),
              ...(priority ? { priority } : {}),
            });
          }}
          onClose={() => setQuick(null)}
        />
      )}

      {toastNode}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DormDataProvider>
          <AppContent />
        </DormDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
