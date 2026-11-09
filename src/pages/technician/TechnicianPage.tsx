import { useState } from "react";
import { Button, Icon } from "../../components/common/index.ts";
import type { Ticket } from "../../types/incident.ts";
import {
  initialNotices,
  type Notice,
  type Profile,
} from "./technicianConstants.ts";
import { TicketDetailPage } from "./TicketDetailPage.tsx";
import { SettingsTab } from "./SettingsTab.tsx";
import { TicketListPage } from "./TicketListPage.tsx";
import { NoticeSheet } from "./NoticeSheet.tsx";

export function TechnicianApp({
  tickets,
  onUpdate,
  onLogout,
  showToast,
  staffId,
}: {
  tickets: Ticket[];
  onUpdate: (id: string, patch: Partial<Ticket>) => Promise<unknown>;
  onLogout: () => void;
  showToast: (message: string) => void;
  staffId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"jobs" | "settings">("jobs");
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "Võ Văn Thịnh",
    phone: "0908 112 245",
    email: "technician@gmail.com",
  });

  const initials = profile.name
    .split(" ")
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const unread = notices.filter((n) => n.unread).length;
  const assignedTickets = staffId ? tickets.filter((ticket) => ticket.assigneeStaffId === staffId) : [];
  const selected = assignedTickets.find((ticket) => ticket.id === selectedId) ?? null;

  return (
    <div className="min-h-[100dvh] bg-slate-100 md:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-slate-50 text-slate-900 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-sm md:shadow-md md:ring-1 md:ring-slate-200">
        {selected ? (
          <TicketDetailPage
            key={selected.id}
            onBack={() => setSelectedId(null)}
            onComplete={async (patch) => {
              try {
                await onUpdate(selected.id, { ...patch, status: "Hoàn thành" });
                showToast(`Đã hoàn thành ${selected.id}`);
                setSelectedId(null);
              } catch {
                throw new Error("Không thể hoàn thành phiếu. Vui lòng thử lại.");
              }
            }}
            onStart={async () => {
              try {
                await onUpdate(selected.id, { status: "Đang xử lý" });
                showToast(`Đã bắt đầu xử lý ${selected.id}`);
              } catch {
                showToast("Không thể bắt đầu xử lý. Vui lòng thử lại.");
              }
            }}
            ticket={selected}
          />
        ) : tab === "settings" ? (
          <SettingsTab
            profile={profile}
            initials={initials}
            onSave={setProfile}
            onLogout={onLogout}
            showToast={showToast}
          />
        ) : (
          <>
            <header className="bg-slate-900 px-4 pb-12 pt-4 text-white">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-white/10 text-xs font-semibold ring-1 ring-white/20">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-heading text-sm font-bold">
                      {profile.name}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-slate-400">
                      Kỹ thuật viên
                    </span>
                  </span>
                </div>
                <Button
                  label="Thông báo"
                  className="relative grid size-8 place-items-center rounded-sm hover:bg-white/10"
                  onClick={() => setNoticeOpen(true)}
                >
                  <Icon name="bell" className="size-4" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-sm bg-danger-500 font-mono text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Button>
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold tracking-tight">
                Công việc hôm nay
              </h1>
              <p className="mt-0.5 text-xs text-slate-400">
                {staffId ? "Các phiếu hiện được giao cho bạn." : "Không xác định được kỹ thuật viên."}
              </p>
            </header>

            <TicketListPage
              tickets={assignedTickets}
              onSelectTicket={setSelectedId}
              onUpdateTicket={onUpdate}
              showToast={showToast}
            />
          </>
        )}

        {!selected && (
          <nav
            className="sticky bottom-0 z-30 mt-auto grid grid-cols-2 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
            aria-label="Điều hướng chính"
          >
            {(
              [
                ["jobs", "Công việc", "tools"],
                ["settings", "Cài đặt", "settings"],
              ] as const
            ).map(([key, label, icon]) => (
              <button
                key={key}
                type="button"
                aria-current={tab === key ? "page" : undefined}
                onClick={() => setTab(key)}
                className={`focus-ring relative flex h-16 cursor-pointer flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  tab === key ? "text-brand-600" : "text-slate-500"
                }`}
              >
                <Icon name={icon} className="size-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}

        {noticeOpen && (
          <NoticeSheet
            notices={notices}
            onClose={() => setNoticeOpen(false)}
            onReadAll={() =>
              setNotices(notices.map((n) => ({ ...n, unread: false })))
            }
            onOpen={(n) => {
              setNotices(
                notices.map((x) =>
                  x.id === n.id ? { ...x, unread: false } : x,
                ),
              );
              setNoticeOpen(false);
              if (n.ticketId) setSelectedId(n.ticketId);
            }}
          />
        )}
      </div>
    </div>
  );
}
