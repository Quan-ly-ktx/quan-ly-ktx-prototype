import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode(props: { value: string; seed?: never } | { seed: string; value?: never }) {
  const value = props.value;
  const [result, setResult] = useState<{ value: string; url?: string; error?: string } | null>(null);

  useEffect(() => {
    if (!value) return;
    let active = true;
    QRCode.toDataURL(value, { width: 320, margin: 4, errorCorrectionLevel: "M" })
      .then((url) => { if (active) setResult({ value, url }); })
      .catch(() => { if (active) setResult({ value, error: "Không thể tạo mã QR trên thiết bị này." }); });
    return () => { active = false; };
  }, [value]);

  if (!value) return <p className="max-w-48 rounded-sm border border-slate-200 bg-white p-4 text-center text-sm text-slate-600">Chưa có mã VietQR hợp lệ. Vui lòng liên hệ Ban Quản lý để nhận thông tin thanh toán.</p>;
  if (result?.value !== value) return <p role="status">Đang tạo mã QR mẫu…</p>;
  if (result.error || !result.url) return <p role="alert">{result.error}</p>;

  return <div className="grid justify-items-center gap-2">
    <img src={result.url} alt="Mã VietQR mẫu, không dùng để thanh toán" width={320} height={320} className="max-w-full" />
    <a href={result.url} download="vietqr-mau.png" className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Tải ảnh QR mẫu PNG</a>
  </div>;
}
