import { Icon } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import { Card, type TenantInvoice } from "./tenantConstants.tsx";
import { PaymentProofPanel } from "./PaymentProofPanel.tsx";

function InvoiceArt() {
  return (
    <svg
      viewBox="0 0 240 170"
      className="mx-auto h-40 w-auto"
      role="img"
      aria-label="Không có hóa đơn"
    >
      <ellipse cx="120" cy="154" rx="78" ry="8" fill="#DBEAFE" />
      <rect
        x="64"
        y="22"
        width="112"
        height="126"
        rx="12"
        fill="#fff"
        stroke="#BFDBFE"
        strokeWidth="2"
      />
      <rect x="82" y="44" width="48" height="8" rx="4" fill="#DBEAFE" />
      <rect x="82" y="64" width="76" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="82" y="80" width="60" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="82" y="96" width="68" height="7" rx="3.5" fill="#E2E8F0" />
      <circle cx="160" cy="124" r="22" fill="#10B981" />
      <circle
        cx="160"
        cy="124"
        r="22"
        fill="none"
        stroke="#D1FAE5"
        strokeWidth="5"
      />
      <path
        d="m150 125 8 8 14-16"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="52" r="5" fill="#2563EB" opacity=".7" />
      <circle cx="204" cy="60" r="4" fill="#F59E0B" />
      <rect
        x="196"
        y="100"
        width="9"
        height="9"
        rx="2"
        fill="#2563EB"
        opacity=".5"
        transform="rotate(20 200 104)"
      />
      <path
        d="M32 112c5-5 10 5 15 0"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


export function TenantInvoicesPage({
  invoices,
  onSubmitProof,
  showToast,
}: {
  invoices: (TenantInvoice & { paymentMethod?: string; proof?: { fileName: string; submittedAt: string } })[];
  onSubmitProof: (id: string, file: File) => Promise<void>;
  showToast: (message: string) => void;
}) {
  const unpaid = invoices.filter((item) => item.status === "Chưa thanh toán");
  const pending = invoices.filter((item) => item.status === "Chờ xác nhận");
  const paid = invoices.filter((item) => item.status === "Đã thanh toán");
  const unpaidTotal = unpaid.reduce((sum, item) => sum + item.amount, 0);
  const paidTotal = paid.reduce((sum, item) => sum + item.amount, 0);


  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">
          Hóa đơn của tôi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Bảng kê minh bạch, VietQR và minh chứng để Quản lý đối soát.
        </p>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm font-medium text-slate-500">
            Cần thanh toán
          </div>
          <div
            className={`mt-2 font-heading text-2xl font-bold ${
              unpaidTotal ? "text-danger-600" : "text-slate-950"
            }`}
          >
            {money(unpaidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {unpaid.length} hóa đơn cần xử lý · {pending.length} chờ xác nhận
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-slate-500">
            Đã thanh toán
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-success-600">
            {money(paidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {paid.length} hóa đơn
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-slate-500">
            Hạn gần nhất
          </div>
          <div className="mt-2 font-heading text-2xl font-bold text-slate-950">
            {unpaid[0]?.due ?? "—"}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {unpaid.length
              ? "Vui lòng thanh toán đúng hạn"
              : "Không có khoản nào đến hạn"}
          </div>
        </Card>
      </div>

      {unpaid.length === 0 && (
        <section className="mb-8 rounded-sm border border-slate-200 bg-white px-6 py-10 text-center shadow-xs">
          <InvoiceArt />
          <p className="mt-4 text-sm text-slate-500">
            Hiện tại bạn không có hóa đơn nào cần thanh toán.
          </p>
        </section>
      )}

      <div className="space-y-6">
        {[...unpaid, ...pending].map((inv) => {
          return (
            <article
              className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs"
              key={inv.id}
            >
              <div className="grid xl:grid-cols-5">
                <div className="p-6 sm:p-8 xl:col-span-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs font-semibold text-brand-700">
                        {inv.id}
                      </div>
                      <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">
                        {inv.title}
                      </h2>
                    </div>
                    <span className="status-label status-label-warning">
                      <Icon name="clock" className="size-3.5" />
                      {inv.status}
                    </span>
                  </div>

                  <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-slate-600">Tiền phòng trọn gói (All-inclusive)</dt>
                      <dd className="font-semibold text-slate-900">
                        {money(inv.amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-slate-600">Điện & nước sinh hoạt cơ bản</dt>
                      <dd className="font-semibold text-success-600">
                        Đã bao gồm trọn gói
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-slate-600">
                        Wifi cáp quang, rác, vệ sinh chung
                      </dt>
                      <dd className="font-semibold text-success-600">
                        Miễn phí
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-slate-600">
                        Chỗ gửi 01 xe máy tại hầm KTX
                      </dt>
                      <dd className="font-semibold text-success-600">
                        Miễn phí (Trọn gói 100%)
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <dt className="font-semibold text-slate-900">
                        Tổng cần thanh toán
                      </dt>
                      <dd className="font-heading text-2xl font-bold text-brand-700">
                        {money(inv.amount)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <Icon name="calendar" className="size-4 text-slate-400" />
                    Hạn thanh toán:{" "}
                    <b className="font-semibold text-slate-900">{inv.due}</b>
                  </div>

                </div>

                <PaymentProofPanel
                  inv={inv}
                  onSubmitProof={onSubmitProof}
                  showToast={showToast}
                />
              </div>
            </article>
          );
        })}
      </div>

      {paid.length > 0 && (
        <section className="mt-8 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Lịch sử thanh toán
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Hóa đơn</th>
                  <th className="px-6 py-3">Ngày thanh toán</th>
                  <th className="px-6 py-3">Phương thức</th>
                  <th className="px-6 py-3">Số tiền</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paid.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-brand-700">
                        {item.id}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.paidAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.paymentMethod ?? "Không có dữ liệu"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {money(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="status-label status-label-success">
                        Đã thanh toán
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
