import { useState, useRef, useId, useEffect } from "react";
import type React from "react";

export function TagInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder = "Chọn hoặc gõ tiện nghi mới, nhấn Enter",
  single = false,
  hint = "Chọn từ danh sách hoặc gõ tên mới rồi nhấn Enter để thêm.",
  createLabel = "Tạo mới",
}: {
  single?: boolean;
  hint?: string;
  createLabel?: string;
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const q = text.trim();
  const has = (v: string) =>
    value.some((x) => x.toLowerCase() === v.toLowerCase());
  const full = single && value.length > 0;
  const matches = suggestions.filter(
    (o) => !has(o) && o.toLowerCase().includes(q.toLowerCase()),
  );
  const canCreate =
    q !== "" &&
    !has(q) &&
    !suggestions.some((o) => o.toLowerCase() === q.toLowerCase());
  const rows = [
    ...matches.map((o) => ({ label: o, create: false })),
    ...(canCreate ? [{ label: q, create: true }] : []),
  ];

  const add = (v: string) => {
    const t = v.trim();
    if (!t || has(t)) return;
    const known = suggestions.find((o) => o.toLowerCase() === t.toLowerCase());
    onChange(single ? [known ?? t] : [...value, known ?? t]);
    setText("");
    setActive(0);
    if (single) setOpen(false);
    else input.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!open && !q) return setOpen(true);
      const row = rows[active];
      if (row && !(canCreate && !row.create && q)) add(row.label);
      else add(q);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(rows.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className="relative">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <div
        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-2 py-1.5 transition-colors focus-within:border-brand-500 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500"
        onClick={() => {
          input.current?.focus();
          setOpen(true);
        }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
          >
            {tag}
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((t) => t !== tag));
              }}
            >
              ×
            </button>
          </span>
        ))}
        {!full && (
          <input
            ref={input}
            type="text"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 min-w-[120px]"
            placeholder={value.length === 0 ? placeholder : ""}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
          />
        )}
      </div>

      {open && rows.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-dropdown mt-1 max-h-56 w-full overflow-auto rounded-sm border border-slate-200 bg-white p-1 shadow-md"
        >
          {rows.map((row, idx) => (
            <li
              key={row.label}
              role="option"
              aria-selected={idx === active}
              className={`flex cursor-pointer items-center justify-between rounded-sm px-3 py-1.5 text-sm ${
                idx === active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                add(row.label);
              }}
              onMouseEnter={() => setActive(idx)}
            >
              <span>{row.label}</span>
              {row.create && (
                <span className="text-xs text-brand-600">{createLabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
