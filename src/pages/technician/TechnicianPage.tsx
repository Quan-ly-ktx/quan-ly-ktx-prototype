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
}: {
  tickets: Ticket[];
  onUpdate: (id: string, patch: Partial<Ticket>) => void;
  onLogout: () => void;
  showToast: (message: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"jobs" | "settings">("jobs");
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "Võ Văn Thịnh",
    phone: "0908 112 245",
    email: "technician@gmail.com",
    skill: "Điện nước",
  });

  const initials = profile.name
    .split(" ")
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const unread = notices.filter((n) => n.unread).length;
  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;
  const count = (status: Ticket["status"]) =>
    tickets.filter((ticket) => ticket.status === status).length;
  const urgentOpen = tickets.filter(
    (t) => t.priority === "Khẩn cấp" && t.status !== "Hoàn thành",
  ).length;

  return (
    <div className="min-h-[100dvh] bg-slate-100 md:py-6">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-slate-50 text-slate-900 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-sm md:shadow-md md:ring-1 md:ring-slate-200">
        {selected ? (
          <TicketDetailPage
            key={selected.id}
            onBack={() => setSelectedId(null)}
            onComplete={(patch) => {
              onUpdate(selected.id, { ...patch, status: "Hoàn thành" });
              showToast(
                `Đã hoàn thành ${selected.id}, thông báo gửi quản lý và người thuê`,
              );
              setSelectedId(null);
            }}
            onStart={() => {
              onUpdate(selected.id, { status: "Đang xử lý" });
              showToast(`Đã nhận ${selected.id}`);
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
                Thứ Bảy, 24/10/2026 · {count("Mới giao") + count("Đang xử lý")}{" "}
                việc cần xử lý
              </p>
              {urgentOpen > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="focus-ring mt-3 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-sm bg-danger-500 px-3.5 text-left text-xs font-semibold text-white shadow-xs active:translate-y-[1px]"
                >
                  <span className="size-2 animate-pulse rounded-sm bg-white" />
                  <span className="flex-1">
                    {urgentOpen} việc khẩn cấp đang chờ
                  </span>
                  <Icon name="chevron" className="size-3.5 rotate-90" />
                </button>
              )}
            </header>

            <TicketListPage
              tickets={tickets}
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
