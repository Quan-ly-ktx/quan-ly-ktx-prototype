import type { Priority } from "../../types/index.ts";
import { PRIORITIES } from "../../types/index.ts";

const priorityStyle: Record<Priority, { cls: string; dot: string }> = {
  "Khẩn cấp": {
    cls: "bg-danger-50 text-danger-600 ring-danger-200 border border-danger-200",
    dot: "bg-danger-500",
  },
  Cao: {
    cls: "bg-warning-50 text-warning-600 ring-warning-200 border border-warning-200",
    dot: "bg-warning-500",
  },
  "Bình thường": {
    cls: "bg-brand-50 text-brand-700 ring-brand-200 border border-brand-200",
    dot: "bg-brand-500",
  },
};

export function PriorityTag({
  priority,
  size = "sm",
}: {
  priority: Priority;
  size?: "sm" | "lg";
}) {
  const st = priorityStyle[priority];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-sm font-medium ring-1 ring-inset ${
        st.cls
      } ${size === "lg" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
    >
      <span className={`size-1.5 rounded-sm ${st.dot}`} />
      {priority}
    </span>
  );
}

export function PriorityPicker({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
      aria-label="Mức độ ưu tiên"
    >
      {PRIORITIES.map((p) => {
        const on = value === p;
        const st = priorityStyle[p];
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(p)}
            className={`focus-ring flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm px-2 text-sm font-semibold ring-1 ring-inset transition-all active:translate-y-[1px] ${
              on
                ? `${st.cls} shadow-xs`
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            <span
              className={`size-1.5 rounded-sm ${on ? st.dot : "bg-slate-300"}`}
            />
            {p}
          </button>
        );
      })}
    </div>
  );
}
