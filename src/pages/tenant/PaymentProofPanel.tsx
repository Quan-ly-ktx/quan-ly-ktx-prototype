import { useState, useEffect } from "react";
import { Button, Icon, QrCode } from "../../components/common/index.ts";
import { BANK, type TenantInvoice } from "./tenantConstants.tsx";

export function PaymentProofPanel({
  inv,
  memo,
  onSubmitProof,
  showToast,
}: {
  inv: TenantInvoice;
  memo: string;
  onSubmitProof: (id: string) => void;
  showToast: (message: string) => void;
}) {
  const [proof, setProof] = useState("");

  useEffect(() => {
    return () => {
      if (proof) URL.revokeObjectURL(proof);
    };
  }, [proof]);

  if (inv.status === "Chờ xác nhận") {
    return (
      <div className="flex flex-col justify-center border-t border-warning-100 bg-warning-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
        <span className="status-label status-label-warning">
          <Icon name="clock" className="size-4" />
          Chờ Quản lý xác nhận
        </span>
        <h3 className="mt-4 font-heading text-lg font-bold text-slate-950">
          Minh chứng đã được gửi
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ban Quản lý sẽ đối soát và phản hồi trong vòng 2–4 giờ làm việc. Hóa
          đơn chỉ chuyển sang “Đã thu” sau khi được duyệt.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-sm border border-warning-100 bg-white p-3">
          <span className="icon-box icon-box-warning">
            <Icon name="image" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              minh-chung-thanh-toan.png
            </div>
            <div className="text-xs text-slate-500">
              Đã gửi lúc 14:20 · 19/10/2026
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-2.5 py-1 font-mono text-xs font-semibold text-brand-700">
          <Icon name="qr" className="size-3.5" /> VIETQR
        </div>
        <div className="mt-3 w-fit rounded-sm border border-slate-200 bg-white p-2.5 shadow-xs">
          <QrCode seed={`${inv.id}${inv.amount}`} />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {BANK.name} · {BANK.account}
          <br />
          Nội dung: <span className="font-mono text-slate-700">{memo}</span>
        </p>
      </div>
      <div className="my-6 h-px bg-slate-200" />
      <h3 className="font-heading text-base font-bold text-slate-950">
        Gửi minh chứng thanh toán
      </h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Tải ảnh biên lai sau khi giao dịch thành công để Quản lý đối soát.
      </p>
      {proof ? (
        <div className="relative mt-4 overflow-hidden rounded-sm border border-slate-200 bg-white">
          <img
            src={proof}
            alt="Minh chứng thanh toán đã chọn"
            className="h-36 w-full object-cover"
          />
          <Button
            label="Xóa ảnh"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-sm bg-slate-900/80 text-white"
            onClick={() => setProof("")}
          >
            <Icon name="close" className="size-3.5" />
          </Button>
        </div>
      ) : (
        <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-slate-600">
          <Icon name="camera" className="size-7" />
          <span className="text-sm font-semibold">
            Chọn ảnh hoặc chụp biên lai
          </span>
          <span className="text-xs text-slate-500">
            JPG, PNG, PDF · tối đa 5MB
          </span>
          <input
            className="sr-only"
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setProof(URL.createObjectURL(file));
            }}
          />
        </label>
      )}
      <Button
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-300"
        disabled={!proof}
        onClick={() => {
          onSubmitProof(inv.id);
          showToast("Minh chứng đã được gửi tới Ban Quản lý");
        }}
      >
        <Icon name="send" className="size-4" /> Gửi minh chứng cho Quản lý
      </Button>
    </div>
  );
}
