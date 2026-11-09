import { Button, Icon } from "../../components/common/index.ts";
import { noticeTone, type Notice } from "./technicianConstants.ts";

export function NoticeSheet({
  notices,
  onClose,
  onReadAll,
  onOpen,
}: {
  notices: Notice[];
  onClose: () => void;
  onReadAll: () => void;
  onOpen: (n: Notice) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Thông báo"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-sm border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="font-heading text-base font-bold text-slate-900">
            Thông báo
          </h2>
          <Button
            label="Đóng"
            className="grid size-8 place-items-center rounded-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <Icon name="close" className="size-4" />
          </Button>
        </div>
        <div className="px-5 pb-2">
          <button
            type="button"
            className="focus-ring h-10 cursor-pointer rounded-sm text-xs font-semibold text-brand-600 hover:text-brand-700"
            onClick={onReadAll}
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
        <ul className="divide-y divide-slate-100 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {notices.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`focus-ring flex w-full cursor-pointer gap-3 px-5 py-4 text-left ${
                  n.unread ? "bg-brand-50/50" : ""
                }`}
                onClick={() => onOpen(n)}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-sm ${
                    noticeTone[n.tone]
                  }`}
                >
                  <Icon
                    name={
                      n.tone === "success"
                        ? "check"
                        : n.tone === "danger"
                          ? "alert"
                          : "clock"
                    }
                    className="size-4"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold leading-snug text-slate-900">
                      {n.title}
                    </span>
                    {n.unread && (
                      <span className="mt-1 size-1.5 shrink-0 rounded-sm bg-brand-500" />
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-600">
                    {n.body}
                  </span>
                  <span className="mt-1.5 block text-xs text-slate-400">
                    {n.time}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
