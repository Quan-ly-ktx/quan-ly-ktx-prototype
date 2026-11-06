import { useState } from "react";
import { Toast } from "./components/common/Toast.tsx";
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
import { initialVehicles } from "./services/mock/mockData.ts";
import type { TenantVehicle } from "./types/tenant.ts";

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
  const [onboardSlot, setOnboardSlot] = useState<{ roomCode: string; bedCode: string } | null>(null);
  const [vehicles, setVehicles] = useState<TenantVehicle[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem("dorm_mock_vehicles");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialVehicles;
  });

  const handleVehiclesChange = (next: TenantVehicle[]) => {
    setVehicles(next);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("dorm_mock_vehicles", JSON.stringify(next));
      } catch {}
    }
  };

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

  if (role === "tenant" || (role as string) === "student") {
    return (
      <>
        <TenantPortal
          tickets={tickets}
          invoices={invoices}
          onInvoicesChange={onInvoicesChange}
          vehicles={vehicles}
          onVehiclesChange={handleVehiclesChange}
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
                setOnboardSlot({ roomCode, bedCode });
                setActiveNav("Người thuê");
                showToast(`Đã chọn vị trí ${roomCode} · ${bedCode} để xếp khách`);
              }}
              showToast={showToast}
            />
          ) : activeNav === "Người thuê" ? (
            <TenantsPage
              tenants={tenants}
              onTenantsChange={onTenantsChange}
              invoices={invoices}
              initialSlot={onboardSlot}
              onClearInitialSlot={() => setOnboardSlot(null)}
              showToast={showToast}
            />
          ) : activeNav === "Phương tiện" ? (
            <VehiclesPage
              tenants={tenants}
              vehicles={vehicles}
              onVehiclesChange={handleVehiclesChange}
              showToast={showToast}
            />
          ) : activeNav === "Hợp đồng" ? (
            <ContractsPage
              tenants={tenants}
              onTenantsChange={onTenantsChange}
              vehicles={vehicles}
              onVehiclesChange={handleVehiclesChange}
              showToast={showToast}
            />
          ) : activeNav === "Hóa đơn" ? (
            <InvoicesPage
              records={invoices}
              onRecordsChange={onInvoicesChange}
              onConfirmPayment={onConfirmPayment}
              showToast={showToast}
            />
          ) : activeNav === "Tài chính" ? (
            <FinancialPage records={invoices} tickets={tickets} showToast={showToast} />
          ) : activeNav === "Sự cố & kỷ luật" ? (
            <IncidentsPage
              tickets={tickets}
              onAssign={(id, tech, priority, deadline) => {
                onUpdateTicket(id, {
                  ...(tech ? { assignee: tech, status: "Mới giao" } : {}),
                  ...(priority ? { priority } : {}),
                  ...(deadline ? { deadline } : {}),
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
          onAssign={(id, tech, priority, deadline) => {
            onUpdateTicket(id, {
              ...(tech ? { assignee: tech, status: "Mới giao" } : {}),
              ...(priority ? { priority } : {}),
              ...(deadline ? { deadline } : {}),
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
