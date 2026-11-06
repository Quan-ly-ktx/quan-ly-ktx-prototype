import { Icon } from "./Icon.tsx";

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        className="focus-ring h-10 cursor-pointer appearance-none rounded-sm border border-slate-200 bg-white py-1.5 pl-3 pr-9 text-sm font-medium text-slate-800 shadow-xs outline-none focus:border-brand-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <Icon
        name="chevron"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 rotate-90 text-slate-400"
      />
    </label>
  );
}
