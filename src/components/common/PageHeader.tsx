import type { ReactNode } from "react";
import { Icon } from "./Icon.tsx";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Quản trị</span>
          <Icon name="chevron" className="size-3.5" />
          <span className="font-medium text-slate-700">{eyebrow}</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
