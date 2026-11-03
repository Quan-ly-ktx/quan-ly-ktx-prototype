import { useState } from "react";
import { TagInput } from "./TagInput.tsx";

const violationTypes = [
  "Về muộn",
  "Gây ồn",
  "Vệ sinh",
  "Khách ngoài",
  "Hút thuốc / cháy nổ",
];
const penaltyForms = ["Nhắc nhở", "Cảnh cáo", "Phạt tiền"];

export function ViolationFields({
  type,
  level,
  fine,
  onType,
  onLevel,
  onFine,
  typeLabel = "Loại vi phạm",
}: {
  type: string;
  level: string;
  fine: string;
  onType: (v: string) => void;
  onLevel: (v: string) => void;
  onFine: (v: string) => void;
  typeLabel?: string;
}) {
  const [types, setTypes] = useState(violationTypes);
  const [levels, setLevels] = useState(penaltyForms);
  const grow = (list: string[], v: string) =>
    list.includes(v) ? list : [...list, v];
  const isFine = level.trim().toLowerCase() === "phạt tiền";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TagInput
          single
          label={typeLabel}
          value={type ? [type] : []}
          suggestions={types}
          placeholder="Chọn hoặc gõ loại mới"
          hint="Gõ tên mới rồi nhấn Enter."
          createLabel="Thêm loại"
          onChange={(v) => {
            const next = v[0] ?? "";
            onType(next);
            if (next) {
              setTypes(grow(types, next));
            }
          }}
        />
        <TagInput
          single
          label="Hình thức xử lý"
          value={level ? [level] : []}
          suggestions={levels}
          placeholder="Chọn hoặc gõ hình thức mới"
          hint="Gõ tên mới rồi nhấn Enter."
          createLabel="Thêm hình thức"
          onChange={(v) => {
            const next = v[0] ?? "";
            onLevel(next);
            if (next) {
              setLevels(grow(levels, next));
            }
          }}
        />
      </div>
      {isFine && (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Số tiền phạt (VNĐ)
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="VD: 100000"
              value={fine}
              onChange={(e) => onFine(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-200 bg-white px-3 pr-14 text-sm outline-none transition-colors focus:border-brand-500 focus:outline-2 focus:outline-offset-2 focus:outline-brand-500"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              VNĐ
            </span>
          </div>
        </label>
      )}
    </>
  );
}
