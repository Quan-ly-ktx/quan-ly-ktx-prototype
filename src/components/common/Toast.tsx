import { Button } from "./Button.tsx";
import { Icon } from "./Icon.tsx";

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-toast flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-md md:bottom-5 md:left-auto md:right-5 md:w-auto md:translate-x-0">
      <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-success-50 text-success-600">
        <Icon name="check" className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-xs font-medium text-slate-800">
        {message}
      </span>
      <Button
        label="Đóng thông báo"
        className="grid size-7 place-items-center rounded-sm text-slate-400 hover:bg-slate-100"
        onClick={onClose}
      >
        <Icon name="close" className="size-3.5" />
      </Button>
    </div>
  );
}
