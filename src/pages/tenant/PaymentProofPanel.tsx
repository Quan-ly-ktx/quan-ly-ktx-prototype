import { useEffect, useState } from "react";
import { Button, Icon, QrCode } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import type { TenantInvoice } from "./tenantConstants.tsx";

// Deliberately unassigned BIN and dummy account: this prototype is not a payment destination.
const DEMO_BANK = { name: "Ngân hàng giả lập (BIN 000000)", bin: "000000", account: "0000000000", holder: "TAI KHOAN GIA LAP" };
const encoder = new TextEncoder();

function field(id: string, value: string): string {
  const length = encoder.encode(value).length;
  if (length > 99) throw new Error("Thông tin hóa đơn quá dài để tạo mã QR mẫu.");
  return `${id}${String(length).padStart(2, "0")}${value}`;
}

function crc16(value: string): string {
  let crc = 0xffff;
  for (const byte of encoder.encode(value)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) crc = ((crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function demoVietQr(amount: number, memo: string): string {
  if (!Number.isSafeInteger(amount) || amount <= 0 || String(amount).length > 13) {
    throw new Error("Số tiền hóa đơn không hợp lệ để tạo mã QR mẫu.");
  }
  const account = field("00", DEMO_BANK.bin) + field("01", DEMO_BANK.account);
  const merchant = field("00", "A000000727") + field("01", account) + field("02", "QRIBFTTA");
  const payload = field("00", "01") + field("01", "12") + field("38", merchant) +
    field("53", "704") + field("54", String(amount)) + field("58", "VN") +
    field("62", field("08", memo)) + "6304";
  return payload + crc16(payload);
}

export function PaymentProofPanel({ inv, onSubmitProof, showToast }: {
  inv: TenantInvoice & { proof?: { fileName: string; submittedAt: string } };
  onSubmitProof: (id: string, file: File) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (inv.status === "Chờ xác nhận") {
    return <div className="border-t border-warning-100 bg-warning-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
      <span className="status-label status-label-warning"><Icon name="clock" className="size-4" /> Chờ Quản lý xác nhận</span>
      <p className="mt-4 text-sm text-slate-600">Minh chứng đang chờ đối soát. Hóa đơn chỉ được ghi nhận đã thu sau khi Quản lý xác nhận.</p>
      {inv.proof && <p className="mt-3 break-all text-sm text-slate-700">{inv.proof.fileName} · {inv.proof.submittedAt}</p>}
    </div>;
  }
  const memo = `DEMO ${inv.id}`;
  let qrValue = "";
  let qrError = "";
  try { qrValue = demoVietQr(inv.amount, memo); }
  catch (error) { qrError = error instanceof Error ? error.message : "Không thể tạo mã QR mẫu."; }

  const copy = async (value: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      showToast(`Đã sao chép ${label}`);
      window.setTimeout(() => setCopied((curr) => curr === key ? null : curr), 1500);
    } catch {
      showToast(`Không thể sao chép ${label}. Vui lòng chọn và sao chép thủ công.`);
    }
  };

  return <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8 xl:col-span-2 xl:border-l xl:border-t-0">
    <div className="rounded-sm border border-warning-200 bg-warning-50 p-4 text-sm text-slate-800">
      <p className="font-bold">CHỈ LÀ MẪU — KHÔNG THANH TOÁN</p>
      <p>Ngân hàng và tài khoản bên dưới là giả lập, không phải thông tin nhận tiền. Không chuyển tiền hoặc sử dụng mã này để thanh toán thật.</p>
    </div>
    <div className="mt-4">
      {qrError ? <p role="alert">{qrError}</p> : <QrCode value={qrValue} />}
      <dl className="mt-4 space-y-2 break-words text-sm">
        <div><dt className="font-semibold">Ngân hàng giả lập</dt><dd>{DEMO_BANK.name}</dd></div>
        <div><dt className="font-semibold">Chủ tài khoản giả lập</dt><dd>{DEMO_BANK.holder}</dd></div>
        <div><dt className="font-semibold">Số tài khoản giả lập</dt><dd className="font-mono">{DEMO_BANK.account} <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 underline ml-2" onClick={() => void copy(DEMO_BANK.account, "account", "số tài khoản mẫu")}>{copied === "account" ? <><Icon name="check" className="size-3 text-success-600" /><span className="text-success-600">Đã chép</span></> : "Sao chép số tài khoản"}</button></dd></div>
        <div><dt className="font-semibold">Số tiền hóa đơn</dt><dd>{money(inv.amount)}</dd></div>
        <div><dt className="font-semibold">Nội dung mẫu</dt><dd className="font-mono">{memo} <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 underline ml-2" onClick={() => void copy(memo, "memo", "nội dung mẫu")}>{copied === "memo" ? <><Icon name="check" className="size-3 text-success-600" /><span className="text-success-600">Đã chép</span></> : "Sao chép nội dung"}</button></dd></div>
      </dl>
    </div>
    <h3 className="mt-6 font-heading text-base font-bold text-slate-950">Gửi minh chứng thanh toán</h3>
    <p className="mt-1 text-xs text-slate-500">Chọn ảnh biên lai JPG hoặc PNG, tối đa 5 MB.</p>
    <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-slate-300 p-4 text-sm">
      <Icon name="camera" className="size-7" /> Chọn ảnh biên lai
      <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => {
        const selected = event.target.files?.[0];
        event.target.value = "";
        if (!selected) return;
        if (!['image/jpeg', 'image/png'].includes(selected.type) || selected.size === 0 || selected.size > 5 * 1024 * 1024) {
          setFile(null);
          showToast("Chỉ chấp nhận ảnh JPG hoặc PNG không rỗng, tối đa 5 MB");
          return;
        }
        setFile(selected);
      }} />
    </label>
    {file && <div className="mt-3"><p className="break-all text-sm">{file.name}</p>{preview && <img src={preview} alt="Minh chứng thanh toán đã chọn" className="mt-2 max-h-48" />}</div>}
    <Button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white disabled:bg-slate-300" disabled={!file || submitting} onClick={async () => {
      if (!file || submitting) return;
      setSubmitting(true);
      try {
        await onSubmitProof(inv.id, file);
        setFile(null);
        showToast("Đã gửi minh chứng cho Quản lý");
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Không thể gửi minh chứng");
      } finally { setSubmitting(false); }
    }}><Icon name="send" className="size-4" /> Gửi minh chứng cho Quản lý</Button>
  </div>;
}
