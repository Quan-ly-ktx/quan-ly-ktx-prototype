import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Icon } from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { person, initialInvoices } from "../../../services/mock/mockData.ts";
import type { Invoice } from "../../../types/invoice.ts";
import type { IconName } from "../../../types/shared.ts";

const tenantList = [
  { name: "Nguyễn Hoàng Nam", room: "P.302" },
  { name: "Lê Hoàng Nam", room: "P.401" },
  { name: "Trần Quốc Bảo", room: "P.205" },
  { name: "Phạm Đức Anh", room: "P.103" },
  { name: "Đỗ Anh Tuấn", room: "P.204" },
  { name: "Hồ Minh Khoa", room: "P.312" },
].map((s) => ({ ...s, ...person(s.name) }));

type Hit = {
  group: string;
  icon: IconName;
  title: string;
  sub: string;
  nav: string;
};

export function GlobalSearch({
  onNavigate,
  invoices = initialInvoices,
}: {
  onNavigate: (label: string) => void;
  invoices?: Invoice[];
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        input.current?.blur();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const hits = useMemo(() => {
    const all: Hit[] = [
      ...tenantList.map((s) => ({
        group: "Người thuê",
        icon: "user" as IconName,
        title: s.name,
        sub: `${s.email} · ${s.room}`,
        nav: "Người thuê",
      })),
      ...["P.102", "P.201", "P.205", "P.302", "P.401"].map((r) => ({
        group: "Phòng",
        icon: "bed" as IconName,
        title: `Phòng ${r}`,
        sub: "Xem sơ đồ giường",
        nav: "Phòng & giường",
      })),
      ...invoices.map((i) => ({
        group: "Hóa đơn",
        icon: "invoice" as IconName,
        title: i.id,
        sub: `${i.tenant} · ${i.room} · ${money(i.amount)}`,
        nav: "Hóa đơn",
      })),
    ];
    const term = q.trim().toLowerCase();
    const list = term
      ? all.filter((h) => `${h.title} ${h.sub}`.toLowerCase().includes(term))
      : [];
    return ["Người thuê", "Phòng", "Hóa đơn"]
      .map((g) => ({
        g,
        items: list.filter((h) => h.group === g).slice(0, 3),
      }))
      .filter((x) => x.items.length);
  }, [q]);

  const pick = (h: Hit) => {
    setOpen(false);
    setQ("");
    onNavigate(h.nav);
  };

  return (
    <div ref={ref} className="relative max-w-md flex-1">
      <Icon
        name="search"
        className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={input}
        aria-label="Tìm kiếm toàn hệ thống"
        className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:bg-white md:pr-14"
        placeholder="Tìm người thuê, phòng, hóa đơn..."
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
      />
      <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-400 md:block">
        ⌘ K
      </span>
      {open && (
        <div className="absolute left-0 top-12 z-dropdown w-full min-w-80 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md">
          {!q.trim() ? (
            <div className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gợi ý
              </p>
              {["Nguyễn Hoàng Nam", "P.302", "HD-2610-0004"].map((s) => (
                <Button
                  key={s}
                  label={s}
                  className="flex h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  onClick={() => setQ(s)}
                >
                  <Icon name="search" className="size-4 text-slate-400" /> {s}
                </Button>
              ))}
            </div>
          ) : hits.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Không có kết quả cho “{q}”.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto p-2">
              {hits.map(({ g, items }) => (
                <div key={g} className="mb-2 last:mb-0">
                  <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {g}
                  </p>
                  {items.map((h) => (
                    <Button
                      key={h.title}
                      label={h.title}
                      className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-brand-50"
                      onClick={() => pick(h)}
                    >
                      <span className="icon-box icon-box-brand size-8">
                        <Icon name={h.icon} className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {h.title}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {h.sub}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
