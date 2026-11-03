import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar.tsx";
import { AdminHeader } from "./AdminHeader.tsx";
import { ChangePasswordModal } from "../../../components/common/index.ts";

export function AdminShell({
  activeNav,
  onNavigate,
  onLogout,
  showToast,
  children,
}: {
  activeNav: string;
  onNavigate: (label: string) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <AdminSidebar
        activeNav={activeNav}
        onNavigate={(label) => {
          onNavigate(label);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        compact={sidebarCompact}
        onToggleCompact={() => setSidebarCompact(!sidebarCompact)}
      />

      <div
        className={`transition-all duration-200 ${
          sidebarCompact ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <AdminHeader
          onOpenSidebar={() => setSidebarOpen(true)}
          onNavigate={(label) => {
            onNavigate(label);
            setSidebarOpen(false);
          }}
          onLogout={onLogout}
          onOpenPassword={() => setPasswordOpen(true)}
        />

        <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 lg:py-8">
          {children}
        </main>
      </div>

      {passwordOpen && (
        <ChangePasswordModal
          onClose={() => setPasswordOpen(false)}
          onDone={showToast}
        />
      )}
    </div>
  );
}
