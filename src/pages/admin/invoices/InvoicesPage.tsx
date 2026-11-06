import { useState } from "react";
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  Select,
  QrCode,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { person } from "../../../services/mock/mockData.ts";
import type { Invoice } from "../../../types/invoice.ts";
import { confirmCashPayment, totalInvoiceDue } from "../../../utils/invoiceCalculations.ts";
import { card, th, rowCls, Badge, SearchBox, Stat, type Toast } from "../common.tsx";

const invTone = (s: Invoice["status"]) =>
  s === "Đã thu" ? "success" : s === "Chờ xác nhận" ? "warning" : "danger";

export function InvoicesPage({
  records,
  onRecordsChange,
  onConfirmPayment,
  showToast,
}: Toast & {
  records: Invoice[];
  onRecordsChange: (records: Invoice[]) => void;
  onConfirmPayment?: (invoiceId: string, manager: string) => Promise<Invoice>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả trạng thái");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [cashInvoice, setCashInvoice] = useState<Invoice | null>(null);

  const rows = records.filter(
    (i) =>
      (filter === "Tất cả trạng thái" || i.status === filter) &&
      `${i.id} ${i.tenant} ${i.room} ${person(i.tenant).cccd} ${person(i.tenant).email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const paidTotal = records
    .filter((invoice) => invoice.status === "Đã thu")
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0);

  const confirmCash = async () => {
    if (!cashInvoice) return;
    try {
      if (onConfirmPayment) {
        await onConfirmPayment(cashInvoice.id, "Thu Lan");
      } else {
        const paid = confirmCashPayment(
          cashInvoice,
          "Thu Lan",
          new Date().toLocaleString("vi-VN"),
        );
        onRecordsChange(
          records.map((invoice) => (invoice.id === paid.id ? paid : invoice)),
        );
      }
      setCashInvoice(null);
      setSelected(null);
      showToast(`Đã xác nhận ${cashInvoice.id} thanh toán tiền mặt`);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Không thể xác nhận thanh toán",
      );
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Hóa đơn"
        title="Hóa đơn tiền phòng & dịch vụ"
        description="Hóa đơn phát hành tự động hằng tháng vào ngày 25, hạn thanh toán cố định ngày 05."
        actions={
          <>
            <Button
              label="Xuất Excel"
              className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => showToast("Đã xuất danh sách hóa đơn tháng 10")}
            >
              Xuất Excel
            </Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat
          icon="check"
          tone="success"
          label="Đã thu"
          value={money(paidTotal)}
          hint={`${records.filter((i) => i.status === "Đã thu").length} hóa đơn`}
        />
        <Stat
          icon="clock"
          tone="warning"
          label="Nợ trong hạn"
          value={money(
            records
              .filter((i) => i.status === "Nợ" && !i.late)
              .reduce((t, i) => t + i.amount, 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && !i.late).length} hóa đơn`}
        />
        <Stat
          icon="alert"
          tone="danger"
          label="Nợ quá hạn"
          value={money(
            records
              .filter((i) => i.status === "Nợ" && i.late)
              .reduce((t, i) => t + i.amount, 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && i.late).length} hóa đơn`}
        />
      </div>

      <section className={card}>
        <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Tìm mã hóa đơn, người thuê, phòng..."
          />
          <Select
            label="Trạng thái"
            value={filter}
            options={["Tất cả trạng thái", "Đã thu", "Chờ xác nhận", "Nợ"]}
            onChange={setFilter}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã HĐ</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Phòng</th>
                <th className={`${th} text-right`}>Số tiền</th>
                <th className={th}>Trạng thái</th>
                <th className={th}>Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr
                  key={i.id}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setSelected(i)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                    {i.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {i.tenant}
                    </p>
                    <p className="text-xs text-slate-500">
                      {person(i.tenant).phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {i.room} · {i.bed}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {money(i.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={invTone(i.status)}>
                      {i.status}
                      {i.late ? ` · trễ ${i.late} ngày` : ""}
                    </Badge>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {i.status === "Nợ" ? (
                      <Button
                        label={`Xác nhận tiền mặt cho ${i.id}`}
                        className="h-8 rounded-sm border border-brand-200 px-2.5 text-xs font-medium text-brand-700 hover:bg-brand-50 active:translate-y-[1px]"
                        onClick={() => setCashInvoice(i)}
                      >
                        Xác nhận
                      </Button>
                    ) : i.status === "Chờ xác nhận" ? (
                      <span className="text-xs font-semibold text-warning-600">
                        Xem minh chứng
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {i.payment?.method === "Tiền mặt" ? "Tiền mặt" : "—"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy hóa đơn phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <Drawer
          title={selected.tenant}
          subtitle={selected.id}
          onClose={() => setSelected(null)}
        >
          <div className="flex items-center justify-between">
            <Badge tone={invTone(selected.status)}>{selected.status}</Badge>
            <span className="text-sm text-slate-500">
              Hạn chót {selected.due}
            </span>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Phòng / Giường", `${selected.room} · ${selected.bed}`],
              ["CCCD", person(selected.tenant).cccd],
              ["Email", person(selected.tenant).email],
              ["Khoản thu", selected.kind ?? "Tiền phòng tháng 10"],
              ["Số tiền", money(selected.amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 bg-slate-50 px-4 py-4">
              <dt className="font-semibold text-slate-700">
                Tổng cần thanh toán
              </dt>
              <dd className="font-heading text-lg font-bold text-brand-700">
                {money(selected.amount)}
              </dd>
            </div>
          </dl>

          {selected.status === "Đã thu" ? (
            <div className="mt-5 flex items-center gap-3 rounded-sm bg-success-50 p-3 text-xs text-success-600">
              <Icon name="check" className="size-4" />
              Đã thanh toán {selected.payment?.paidAt}. Người xác nhận:{" "}
              {selected.payment?.confirmedBy}.
            </div>
          ) : selected.status === "Chờ xác nhận" && selected.proof ? (
            <div className="mt-6">
              <div className="rounded-sm border border-warning-100 bg-warning-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="icon-box icon-box-warning">
                    <Icon name="image" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selected.proof.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Tải lên lúc {selected.proof.submittedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid aspect-video place-items-center rounded-sm border border-warning-100 bg-white">
                  <div className="text-center text-warning-600">
                    <Icon name="receipt" className="mx-auto size-8" />
                    <p className="mt-2 text-xs font-semibold">
                      Ảnh biên lai thanh toán
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-sm border border-slate-200 p-5">
              <p className="mb-4 text-sm font-semibold text-slate-700">
                Quét mã VietQR để thanh toán
              </p>
              <QrCode seed={selected.id} />
              <p className="mt-4 text-center text-xs text-slate-500">
                Nội dung CK:{" "}
                <span className="font-mono font-medium text-slate-800">
                  {selected.id.replace(/-/g, "")}
                </span>
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {selected.status === "Chờ xác nhận" && (
              <>
                <Button
                  label="Xác nhận đã nhận tiền"
                  className="h-10 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
                  onClick={() => {
                    const confirmed: Invoice = {
                      ...selected,
                      status: "Đã thu",
                      payment: {
                        amount: selected.amount,
                        method: "Trực tuyến",
                        paidAt: new Date().toLocaleString("vi-VN"),
                        confirmedBy: "Thu Lan (Quản lý)",
                      },
                    };
                    onRecordsChange(
                      records.map((invoice) =>
                        invoice.id === selected.id ? confirmed : invoice,
                      ),
                    );
                    setSelected(null);
                    showToast(
                      `Đã xác nhận ${selected.id} và gửi thông báo cho người thuê`,
                    );
                  }}
                >
                  Xác nhận Đã nhận tiền
                </Button>
                <Button
                  label="Yêu cầu gửi lại minh chứng"
                  className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px]"
                  onClick={() => {
                    onRecordsChange(
                      records.map((invoice) =>
                        invoice.id === selected.id
                          ? { ...invoice, status: "Nợ", proof: undefined }
                          : invoice,
                      ),
                    );
                    setSelected(null);
                    showToast("Đã yêu cầu người thuê gửi lại minh chứng");
                  }}
                >
                  Từ chối / Yêu cầu gửi lại
                </Button>
              </>
            )}
            {selected.status === "Nợ" && (
              <Button
                label="Xác nhận thanh toán tiền mặt"
                className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={() => setCashInvoice(selected)}
              >
                Xác nhận thanh toán tiền mặt
              </Button>
            )}
          </div>
        </Drawer>
      )}
      {cashInvoice && (
        <Modal
          title="Xác nhận thanh toán tiền mặt"
          description="Chỉ xác nhận sau khi quản lý đã nhận đủ tiền từ người thuê."
          onClose={() => setCashInvoice(null)}
        >
          <div className="space-y-5 p-6">
            <dl className="divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
              {[
                ["Hóa đơn", cashInvoice.id],
                ["Người thuê", cashInvoice.tenant],
                ["Số tiền nhận", money(totalInvoiceDue(cashInvoice))],
                ["Phương thức", "Tiền mặt"],
                ["Người xác nhận", "Thu Lan"],
              ].map(([label, value]) => (
                <div
                  className="flex justify-between gap-4 px-4 py-3"
                  key={label}
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end gap-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setCashInvoice(null)}
              >
                Hủy
              </Button>
              <Button
                label="Xác nhận đã nhận tiền"
                className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={confirmCash}
              >
                Xác nhận đã nhận tiền
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
