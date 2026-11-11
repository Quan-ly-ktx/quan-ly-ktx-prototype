import { useState } from "react";
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
  Select,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import ExcelJS from "exceljs";
import { dormService } from "../../../services/dormService.ts";
import { env } from "../../../config/env.ts";
import type { Invoice } from "../../../types/invoice.ts";
import type { TenantRecord } from "../../../types/tenant.ts";
import { totalInvoiceDue, calculateOverdueDays } from "../../../utils/invoiceCalculations.ts";
import { card, th, rowCls, Badge, SearchBox, Stat, type Toast } from "../common.tsx";


const invTone = (s: Invoice["status"], lateDays: number) =>
  s === "Đã thu" ? "success" : s === "Chờ xác nhận" ? "brand" : lateDays > 0 ? "danger" : "warning";

export function InvoicesPage({
  records,
  onRejectInvoiceProof,
  onConfirmInvoiceProof,
  managerStaffId,
  tenants,
  onConfirmPayment,
  onIssueInvoices,
  showToast,
}: Toast & {
  records: Invoice[];
  onRejectInvoiceProof: (id: string) => Promise<void>;
  onConfirmInvoiceProof: (id: string, managerStaffId: string) => Promise<void>;
  onIssueInvoices?: (billingPeriod: string) => Promise<Invoice[]>;
  managerStaffId?: string;
  tenants: TenantRecord[];
  onConfirmPayment: (invoiceId: string, manager: string) => Promise<Invoice>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả trạng thái");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [cashInvoice, setCashInvoice] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const currentToday = dormService.getBusinessDate();
  const isLate = (i: Invoice) => calculateOverdueDays(i.due, i.status, currentToday) > 0;
  const lateDays = (i: Invoice) => calculateOverdueDays(i.due, i.status, currentToday);
  const person = (id: string | undefined) => tenants.find((tenant) => tenant.id === id);

  const rows = records.filter(
    (i) =>
      (filter === "Tất cả trạng thái" || i.status === filter) &&
      `${i.id} ${i.tenant} ${i.room} ${person(i.tenantId)?.cccd ?? ""} ${person(i.tenantId)?.email ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const paidTotal = records
    .filter((invoice) => invoice.status === "Đã thu")
    .reduce((total, invoice) => total + (invoice.payment?.amount ?? 0), 0);

  const confirmCash = async () => {
    if (!cashInvoice || saving) return;
    const current = records.find((invoice) => invoice.id === cashInvoice.id);
    if (!current || current.status !== "Nợ" || current.payment) {
      showToast("Hóa đơn không còn ở trạng thái Nợ");
      setCashInvoice(null);
      return;
    }
    setSaving(true);
    try {
      if (!managerStaffId) throw new Error("Không xác định được nhân viên xác nhận thanh toán");
      await onConfirmPayment(cashInvoice.id, managerStaffId);
      setCashInvoice(null);
      setSelected(null);
      showToast(`Đã xác nhận ${cashInvoice.id} thanh toán tiền mặt`);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Không thể xác nhận thanh toán",
      );
    } finally {
      setSaving(false);
    }
  };
  const exportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Danh sách hóa đơn");
      sheet.columns = [
        { header: "Mã hóa đơn", key: "id", width: 18 },
        { header: "Kỳ hóa đơn", key: "billingPeriod", width: 14 },
        { header: "Khách thuê", key: "tenant", width: 24 },
        { header: "Phòng · Giường", key: "roomBed", width: 16 },
        { header: "Số tiền", key: "amount", width: 16 },
        { header: "Hạn thanh toán", key: "due", width: 16 },
        { header: "Trạng thái", key: "status", width: 16 },
        { header: "Ngày thanh toán", key: "paidAt", width: 22 },
        { header: "Phương thức", key: "method", width: 16 },
        { header: "Người xác nhận", key: "confirmedBy", width: 20 },
      ];
      rows.forEach((inv) => {
        sheet.addRow({
          id: inv.id,
          billingPeriod: inv.billingPeriod,
          tenant: inv.tenant,
          roomBed: `${inv.room} · ${inv.bed}`,
          amount: inv.amount,
          due: inv.due,
          status: inv.status,
          paidAt: inv.payment?.paidAt ?? "",
          method: inv.payment?.method ?? "",
          confirmedBy: inv.payment?.confirmedBy ?? "",
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `danh-sach-hoa-don-${currentToday}.xlsx`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Đã xuất danh sách hóa đơn ra file Excel.");
    } catch {
      showToast("Không thể xuất file Excel.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Hóa đơn"
        title="Hóa đơn tiền phòng & dịch vụ"
        description="Hóa đơn phát hành tự động hằng tháng vào ngày 25, hạn thanh toán cố định ngày 05."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              label="Xuất Excel"
              className="flex h-10 items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => void exportExcel()}
            >
              <Icon name="file" className="size-4 text-slate-500" />
              Xuất Excel
            </Button>
            {env.USE_MOCK && (
              <Button
                label="Chạy batch hóa đơn ngày 25"
                className="flex h-10 items-center gap-1.5 rounded-sm bg-brand-500 px-3.5 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={async () => {
                  const [y, m] = currentToday.split("-").map(Number);
                  const nextMonth = `${y + (m === 12 ? 1 : 0)}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01`;
                  try {
                    const action = onIssueInvoices ?? ((p: string) => dormService.issueInvoices(p));
                    const issued = await action(nextMonth);
                    if (issued.length > 0) {
                      showToast(`Đã phát hành ${issued.length} hóa đơn mới kỳ ${nextMonth.slice(0, 7)}`);
                    } else {
                      showToast(`Kỳ ${nextMonth.slice(0, 7)}: Tất cả hợp đồng đã có hóa đơn (không tạo trùng).`);
                    }
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : "Không thể phát hành hóa đơn.");
                  }
                }}
              >
                <Icon name="refresh" className="size-3.5" />
                Chạy batch ngày 25
              </Button>
            )}
          </div>
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
              .filter((i) => i.status === "Nợ" && !isLate(i))
              .reduce((t, i) => t + i.amount, 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && !isLate(i)).length} hóa đơn`}
        />
        <Stat
          icon="alert"
          tone="danger"
          label="Nợ quá hạn"
          value={money(
            records
              .filter((i) => i.status === "Nợ" && isLate(i))
              .reduce((t, i) => t + i.amount, 0),
          )}
          hint={`${records.filter((i) => i.status === "Nợ" && isLate(i)).length} hóa đơn (tính động theo hạn)`}
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
                      {person(i.tenantId)?.phone ?? ""}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {i.room} · {i.bed}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {money(i.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={invTone(i.status, lateDays(i))}>
                      {i.status}
                      {lateDays(i) > 0 ? ` · trễ ${lateDays(i)} ngày` : ""}
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
                      <Button
                        label={`Xem minh chứng ${i.id}`}
                        className="text-xs font-semibold text-warning-600"
                        onClick={() => setSelected(i)}
                      >
                        Xem minh chứng
                      </Button>
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
            <Badge tone={invTone(selected.status, lateDays(selected))}>{selected.status}</Badge>
            <span className="text-sm text-slate-500">
              Hạn chót {selected.due}
            </span>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Phòng / Giường", `${selected.room} · ${selected.bed}`],
              ["CCCD", person(selected.tenantId)?.cccd ?? ""],
              ["Email", person(selected.tenantId)?.email ?? ""],
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
                {"dataUrl" in selected.proof && typeof selected.proof.dataUrl === "string" ? (
                  <img src={selected.proof.dataUrl} alt={`Minh chứng ${selected.proof.fileName}`} className="mt-3 max-h-80 w-full rounded-sm object-contain" />
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Không có tệp minh chứng để xem.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-600">
              {selected.status === "Chờ xác nhận"
                ? "Không có tệp minh chứng để xem."
                : "Chưa có mã VietQR hợp lệ cho hóa đơn này."}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {selected.status === "Chờ xác nhận" && (
              <>
                <Button
                  label="Xác nhận đã nhận tiền"
                  className="h-10 rounded-sm bg-success-500 text-sm font-semibold text-white hover:bg-success-600 active:translate-y-[1px]"
                  disabled={saving}
                  onClick={async () => {
                    if (saving) return;
                    const current = records.find((invoice) => invoice.id === selected.id);
                    if (!current || current.status !== "Chờ xác nhận" || current.payment) {
                      showToast("Hóa đơn không còn chờ xác nhận");
                      setSelected(null);
                      return;
                    }
                    if (!window.confirm(`Xác nhận đã nhận đủ ${money(current.amount)} qua chuyển khoản cho ${current.id} (${current.tenant})?`)) return;
                    setSaving(true);
                    try {
                      if (!managerStaffId) throw new Error("Không xác định được nhân viên xác nhận thanh toán");
                      await onConfirmInvoiceProof(current.id, managerStaffId);
                      setSelected(null);
                      showToast(`Đã xác nhận ${current.id} đã nhận tiền`);
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : "Không thể xác nhận thanh toán");
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Xác nhận Đã nhận tiền
                </Button>
                <Button
                  label="Yêu cầu gửi lại minh chứng"
                  className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px]"
                  disabled={saving}
                  onClick={async () => {
                    if (saving) return;
                    const current = records.find((invoice) => invoice.id === selected.id);
                    if (!current || current.status !== "Chờ xác nhận" || current.payment) {
                      showToast("Hóa đơn không còn chờ xác nhận");
                      setSelected(null);
                      return;
                    }
                    setSaving(true);
                    try {
                      await onRejectInvoiceProof(current.id);
                      setSelected(null);
                      showToast("Đã yêu cầu người thuê gửi lại minh chứng");
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : "Không thể từ chối minh chứng");
                    } finally {
                      setSaving(false);
                    }
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
                disabled={saving}
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
