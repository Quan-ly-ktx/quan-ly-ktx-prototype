import { useState } from "react";
import { Button, Icon, PriorityTag } from "../../components/common/index.ts";
import { PRIORITIES, priorityRank, type Priority, type Ticket, type TicketStatus } from "../../types/incident.ts";
import { filters, prioBar, prioChip, statusStyle, where } from "./technicianConstants.ts";

export function TicketListPage({
  tickets,
  onSelectTicket,
  onUpdateTicket,
  showToast,
}: {
  tickets: Ticket[];
  onSelectTicket: (id: string) => void;
  onUpdateTicket: (id: string, patch: Partial<Ticket>) => void;
  showToast: (message: string) => void;
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tất cả");
  const [prio, setPrio] = useState<"Tất cả" | Priority>("Tất cả");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = tickets
    .filter((ticket) => filter === "Tất cả" || ticket.status === filter)
    .filter((ticket) => prio === "Tất cả" || ticket.priority === prio)
    .filter(
      (ticket) =>
        !q ||
        `${ticket.title} ${ticket.id} ${ticket.room} ${ticket.bed ?? ""}`
          .toLowerCase()
          .includes(q),
    )
    .sort(
      (a, b) =>
        Number(a.status === "Hoàn thành") - Number(b.status === "Hoàn thành") ||
        priorityRank[a.priority] - priorityRank[b.priority],
    );

  const count = (status: TicketStatus) =>
    tickets.filter((ticket) => ticket.status === status).length;
  const hasFilter = filter !== "Tất cả" || prio !== "Tất cả" || q !== "";

  return (
    <>
      <div className="relative z-10 -mt-10 px-4">
        <div className="grid grid-cols-3 gap-1.5 rounded-sm bg-white p-1.5 shadow-xs ring-1 ring-slate-200">
          {(
            [
              ["Mới giao", "text-brand-700", "bg-brand-50"],
              ["Đang xử lý", "text-warning-600", "bg-warning-50"],
              ["Hoàn thành", "text-success-600", "bg-success-50"],
            ] as const
          ).map(([label, text, bg]) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(filter === label ? "Tất cả" : label)}
              className={`focus-ring flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-sm transition-all ${
                filter === label
                  ? `${bg} ring-1 ring-current ${text} font-bold`
                  : `${text} hover:bg-slate-50`
              }`}
            >
              <span className="font-mono text-xl font-bold leading-none">
                {count(label)}
              </span>
              <span className="mt-1 text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-20 mt-3 space-y-2 border-b border-slate-200 bg-slate-50/95 px-4 pb-3 pt-2 backdrop-blur">
        <label className="relative block">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm công việc, phòng, giường..."
            type="search"
            value={query}
          />
        </label>
        <div
          className="grid grid-cols-4 gap-1"
          role="group"
          aria-label="Lọc theo mức độ ưu tiên"
        >
          {(["Tất cả", ...PRIORITIES] as const).map((item) => (
            <Button
              key={item}
              className={`h-8 rounded-sm border px-1 text-xs font-semibold active:translate-y-[1px] ${
                prio === item
                  ? item === "Tất cả"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : prioChip[item]
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setPrio(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      <main className="flex-1 pb-6" aria-label="Danh sách công việc">
        <div className="flex items-center justify-between px-4 pb-1 pt-3 text-sm text-slate-500">
          <span>
            {visible.length} công việc
            {prio !== "Tất cả" ? ` · ${prio}` : ""}
          </span>
          {hasFilter && (
            <button
              type="button"
              className="focus-ring h-11 cursor-pointer rounded-lg px-2 font-semibold text-brand-600"
              onClick={() => {
                setFilter("Tất cả");
                setPrio("Tất cả");
                setQuery("");
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>
        <ul className="space-y-3 px-4">
          {visible.length === 0 && (
            <li className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              Không có công việc phù hợp bộ lọc.
            </li>
          )}
          {visible.map((ticket) => (
            <li key={ticket.id}>
              <div className="relative overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${
                    prioBar[ticket.priority]
                  }`}
                />
                <button
                  className="focus-ring block w-full cursor-pointer py-3.5 pl-5 pr-3 text-left"
                  onClick={() => onSelectTicket(ticket.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <PriorityTag priority={ticket.priority} />
                    <span
                      className={`status-label ${statusStyle[ticket.status]}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <div className="mt-3 text-lg font-bold leading-snug text-slate-900">
                    {ticket.title}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-base font-semibold text-slate-700">
                    <Icon name="bed" className="size-5 text-slate-400" />
                    {where(ticket)}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="size-4" />
                      {ticket.deadline}
                    </span>
                    <span className="font-mono text-xs">{ticket.id}</span>
                  </div>
                </button>
                {ticket.status !== "Hoàn thành" && (
                  <div className="pb-4 pl-6 pr-4">
                    {ticket.status === "Mới giao" ? (
                      <Button
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                        onClick={() => {
                          onUpdateTicket(ticket.id, { status: "Đang xử lý" });
                          onSelectTicket(ticket.id);
                          showToast(`Đã nhận ${ticket.id} và bắt đầu xử lý`);
                        }}
                      >
                        <Icon name="play" className="size-4" />
                        Nhận việc
                      </Button>
                    ) : (
                      <Button
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
                        onClick={() => onSelectTicket(ticket.id)}
                      >
                        <Icon name="camera" className="size-4" />
                        Hoàn thành
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
