import { useEffect, type ReactNode } from "react";
import { Button } from "./Button.tsx";
import { Icon } from "./Icon.tsx";

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-backdrop" role="dialog" aria-modal="true">
      <Button
        label="Đóng"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <span className="sr-only">Đóng</span>
      </Button>
      <aside className="absolute right-0 top-0 z-drawer flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-lg">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="font-mono text-xs text-slate-500">{subtitle}</p>
            <h2 className="font-heading text-xl font-bold text-slate-950">
              {title}
            </h2>
          </div>
          <Button
            label="Đóng"
            className="grid size-9 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" className="size-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
