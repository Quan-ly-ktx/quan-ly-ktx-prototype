import type { ReactNode } from "react";
import { Icon } from "../../components/common/Icon.tsx";
import type { IconName } from "../../types/shared.ts";

export type Toast = { showToast: (message: string) => void };

export const card = "rounded-sm border border-slate-200 bg-white shadow-xs";
export const th =
  "px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50";
export const rowCls =
  "border-t border-slate-100 transition-colors hover:bg-slate-50";
export const inputCls =
  "focus-ring h-10 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500";

export function Badge({
  tone,
  children,
}: {
  tone: "brand" | "success" | "danger" | "warning" | "slate";
  children: ReactNode;
}) {
  const t =
    tone === "slate" ? "bg-slate-100 text-slate-600" : `status-label-${tone}`;
  return <span className={`status-label ${t}`}>{children}</span>;
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:w-80">
      <Icon
        name="search"
        className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <input
        className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Stat({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: IconName;
  tone: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={`${card} flex items-center gap-4 p-5`}>
      <span className={`icon-box icon-box-${tone}`}>
        <Icon name={icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="font-mono text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      </div>
    </div>
  );
}
