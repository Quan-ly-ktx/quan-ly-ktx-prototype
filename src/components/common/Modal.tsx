import { useEffect, type ReactNode } from "react";
import { Button } from "./Button.tsx";
import { Icon } from "./Icon.tsx";

export function Modal({
  children,
  title,
  description,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-backdrop grid place-items-center p-4"
      role="dialog"
    >
      <Button
        label="Đóng hộp thoại"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <span className="sr-only">Đóng</span>
      </Button>
      <div
        className={`relative z-modal max-h-[90vh] w-full overflow-y-auto rounded-sm border border-slate-200 bg-white shadow-lg ${
          wide ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-5 py-4 md:px-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-950">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <Button
            label="Đóng"
            className="grid size-9 shrink-0 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
