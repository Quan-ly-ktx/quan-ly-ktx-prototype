import { useState } from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import { requestConfig, type RequestKind } from "./studentConstants.tsx";

export function RequestModal({
  kind,
  onClose,
  onSubmit,
}: {
  kind: RequestKind;
  onClose: () => void;
  onSubmit: (message: string) => void;
}) {
  const [choice, setChoice] = useState(0);
  const config = requestConfig[kind];

  return (
    <Modal title={config.title} onClose={onClose}>
      <div className="p-6">
        <p className="mb-4 text-sm text-slate-600">{config.intro}</p>
        <div className="space-y-2">
          {config.options.map((option, index) => (
            <Button
              key={option}
              className={`flex min-h-12 w-full items-center gap-3 rounded-sm border px-3.5 py-2.5 text-left text-sm font-medium ${
                choice === index
                  ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setChoice(index)}
            >
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-sm border ${
                  choice === index
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-slate-300"
                }`}
              >
                {choice === index && <Icon name="check" className="size-3" />}
              </span>
              {option}
            </Button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            className="h-10 flex-[1.5] rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => onSubmit(config.done)}
          >
            {config.cta}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
