import { useRef, useState } from "react";
import { Button, Drawer, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import type { Invoice, Ticket, FacilityExpense, FacilityExpenseCategory } from "../../../types/index.ts";
import { completionMonth, expenseMonth, reportForPeriod } from "../../../utils/reportForPeriod.ts";
import { createReportPdf, createReportSpreadsheet } from "../../../utils/reportExport.ts";
import fontUrl from "../../../assets/NotoSans-Regular.ttf?url";
import { env } from "../../../config/env.ts";
import { card, th, rowCls, inputCls, Stat, Badge } from "../common.tsx";

const categoryTones: Record<FacilityExpenseCategory, "brand" | "warning" | "slate"> = {
  "Điện EVN": "warning",
  "Nước": "brand",
  "Internet": "brand",
  "Lương nhân viên": "brand",
  "Khác": "slate",
};

export function FinancialPage({
  records,
  tickets,
  facilityExpenses: expenses,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  showToast,
}: {
  records: Invoice[];
  tickets: Ticket[];
  facilityExpenses: FacilityExpense[];
  onCreateExpense: (expense: FacilityExpense) => Promise<void>;
  onUpdateExpense: (id: string, expense: FacilityExpense) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  showToast?: (m: string) => void;
}) {
  const [saveError, setSaveError] = useState("");
  const receiptReadId = useRef(0);


  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<FacilityExpense | null>(null);
  const [editingExpense, setEditingExpense] = useState<FacilityExpense | null>(null);
  const [period, setPeriod] = useState(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit" }).format(new Date()));
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  // Form state
  const [category, setCategory] = useState<FacilityExpenseCategory>("Điện EVN");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invoiceCode, setInvoiceCode] = useState("");
  const [note, setNote] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  const periodExpenses = expenses.filter(
    (expense) => !period || expenseMonth(expense.expenseDate) === period,
  );
  const filteredExpenses = periodExpenses.filter(
    (expense) => categoryFilter === "Tất cả" || expense.category === categoryFilter,
  );
  const report = reportForPeriod(records, tickets, expenses, period);
  const categories = periodExpenses.reduce(
    (totals, expense) => ({ ...totals, [expense.category]: (totals[expense.category] ?? 0) + expense.amount }),
    { "Điện EVN": 0, "Nước": 0, "Internet": 0, "Lương nhân viên": 0, "Khác": 0 } satisfies Record<FacilityExpenseCategory, number>,
  );
  const paid = records.filter((invoice) => invoice.status === "Đã thu" && invoice.billingPeriod === `${period}-01`);
  const repairs = tickets.filter((ticket) => ticket.status === "Hoàn thành" && completionMonth(ticket.completedAt) === period);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (receiptLoading || receiptError) {
      showToast?.(receiptLoading ? "Vui lòng chờ đọc ảnh chứng từ." : "Vui lòng chọn lại ảnh chứng từ hoặc bỏ ảnh bị lỗi.");
      return;
    }
    const numAmount = Number(amount.replace(/\D/g, ""));
    if (!title.trim()) {
      showToast?.("Vui lòng nhập tiêu đề hóa đơn tiện ích");
      return;
    }
    if (!Number.isSafeInteger(numAmount) || numAmount <= 0) {
      showToast?.("Vui lòng nhập số tiền chi phí hợp lệ");
      return;
    }

    const newExpense: FacilityExpense = {
      id: editingExpense?.id ?? `EXP-${crypto.randomUUID()}`,
      category,
      title: title.trim(),
      amount: numAmount,
      expenseDate,
      invoiceCode: invoiceCode.trim() || undefined,
      receiptImage: receiptImage || undefined,
      note: note.trim() || undefined,
      createdAt: editingExpense?.createdAt ?? new Date().toLocaleString("vi-VN"),
    };

    try {
      if (editingExpense) await onUpdateExpense(editingExpense.id, newExpense);
      else await onCreateExpense(newExpense);
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Không thể lưu chi phí. Vui lòng thử lại.");
      return;
    }
    setEditingExpense(null);
    setModalOpen(false);
    setTitle("");
    setAmount("");
    setInvoiceCode("");
    setNote("");
    setReceiptImage("");
    showToast?.(`Đã ghi nhận hóa đơn ${category}: ${money(numAmount)}`);
  };

  const exportUnavailable = "Chưa thể tổng hợp: cần kỳ hóa đơn hợp lệ và thời điểm hoàn thành cùng vật tư của mọi phiếu hoàn thành.";
  const exportReport = async (format: "xlsx" | "pdf") => {
    if (!report) { showToast?.(exportUnavailable); return; }
    try {
      const data = { period, ...report, categories, demo: env.USE_MOCK };
      const buffer = format === "xlsx"
        ? await createReportSpreadsheet(data)
        : await createReportPdf(data, new Uint8Array(await (await fetch(fontUrl)).arrayBuffer()));
      const bytes = new Uint8Array(buffer);
      const url = URL.createObjectURL(new Blob([bytes.buffer], { type: format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `thu-chi-${period}.${format}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      showToast?.("Không thể xuất báo cáo. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Tài chính"
        title="Báo cáo thu – chi ghi nhận"
        description="Báo cáo thu – chi ghi nhận và lợi nhuận ròng ước tính (FR-14)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button label="Xuất XLSX" className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700" onClick={() => void exportReport("xlsx")}>
              <Icon name="file" className="mr-1.5 size-4 text-slate-500" />Xuất XLSX
            </Button>
            <Button label="Xuất PDF" className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700" onClick={() => void exportReport("pdf")}>
              <Icon name="file" className="mr-1.5 size-4 text-slate-500" />Xuất PDF
            </Button>
          </div>
        }
      />

      {!report && <p className="mb-4 text-sm text-slate-600" role="status">{exportUnavailable}</p>}
      {saveError && <p className="mb-4 text-sm text-danger-600" role="alert">{saveError}</p>}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center text-sm font-semibold text-slate-700">
          Kỳ báo cáo (Tháng/Năm):
          <input
            type="month"
            className={`${inputCls} ml-2 w-48`}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          />
        </label>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="wallet" tone="success" label="Doanh thu theo kỳ" value={report ? money(report.revenue) : "Chưa đủ dữ liệu"} hint={`Theo kỳ hóa đơn ${period}`} />
        <Stat icon="tools" tone="warning" label="Chi phí sửa chữa theo kỳ" value={report ? money(report.repairs) : "Chưa đủ dữ liệu"} hint="Phiếu hoàn thành theo giờ Việt Nam" />
        <Stat icon="invoice" tone="danger" label="Chi phí vận hành theo kỳ" value={report ? money(report.facility) : "Chưa đủ dữ liệu"} hint={`${periodExpenses.length} khoản trong kỳ`} />
        <Stat icon="trend" tone="brand" label="Lợi nhuận ròng (ước tính)" value={report ? money(report.difference) : "Chưa đủ dữ liệu"} hint="Ước tính thu – chi ghi nhận; chưa gồm thuế, khấu hao" />
      </div>
      <p className="mb-6 -mt-3 text-[11px] text-slate-500 italic">
        * Lợi nhuận ròng (ước tính): Ước tính dựa trên các khoản thu và chi đã được ghi nhận; có thể chưa bao gồm đầy đủ chi phí, thuế, khấu hao và nghĩa vụ khác.
      </p>
      {/* Facility Expenses Table */}
      <section className={`${card} mb-6 overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Hóa đơn chi phí tiện ích cơ sở (Điện tổng, Nước tổng, Internet)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Chi phí theo ngày ghi nhận trong kỳ {period}.
            </p>
          </div>
          <Button
            label="Thêm chi phí"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100"
            onClick={() => { receiptReadId.current++; setReceiptLoading(false); setEditingExpense(null); setCategory("Điện EVN"); setTitle(""); setAmount(""); setExpenseDate(new Date().toISOString().split("T")[0]); setInvoiceCode(""); setNote(""); setReceiptImage(""); setReceiptError(""); setModalOpen(true); }}
          >
            + Nhập hóa đơn tổng
          </Button>
        </div>
        {/* Filter scoped only to facility expenses table */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Lọc danh sách chi phí:</span>
            <label className="inline-flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-500">Loại chi phí:</span>
              <select
                className={`${inputCls} h-8 text-xs w-40 bg-white`}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option>Tất cả</option>
                <option>Điện EVN</option>
                <option>Nước</option>
                <option>Internet</option>
                <option>Lương nhân viên</option>
                <option>Khác</option>
              </select>
            </label>
          </div>
          <span className="font-mono text-slate-500">
            Hiển thị {filteredExpenses.length} / {periodExpenses.length} khoản chi phí
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Mã phiếu</th>
                <th className={th}>Hạng mục</th>
                <th className={th}>Tiêu đề hóa đơn</th>
                <th className={th}>Ngày hóa đơn</th>
                <th className={th}>Mã hóa đơn / HĐ</th>
                <th className={`${th} text-right`}>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((exp) => (
                <tr
                  className={`${rowCls} cursor-pointer`}
                  key={exp.id}
                  onClick={() => setSelectedExpense(exp)}
                >
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-brand-700">
                    {exp.id}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={categoryTones[exp.category]}>{exp.category}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">{exp.title}</p>
                    {exp.note && <p className="text-xs text-slate-500">{exp.note}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{exp.expenseDate}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {exp.invoiceCode ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-danger-600">
                    {money(exp.amount)}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Chưa có hóa đơn chi phí cơ sở nào. Bấm "+ Ghi nhận chi phí cơ sở" để thêm mới.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two-column Revenue & Maintenance breakdown */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Hóa đơn có ghi nhận thanh toán
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Hóa đơn đã thu thuộc kỳ hóa đơn được chọn.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Hóa đơn</th>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Phương thức</th>
                  <th className={`${th} text-right`}>Đã nhận</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((invoice) => (
                  <tr className={rowCls} key={invoice.id}>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {invoice.tenant}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {invoice.payment?.method}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-success-600">
                      {money(invoice.payment?.amount ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Phiếu sửa chữa hoàn thành
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Phiếu hoàn thành trong kỳ theo múi giờ Việt Nam.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Phiếu</th>
                  <th className={th}>Hạng mục</th>
                  <th className={th}>Phòng</th>
                  <th className={`${th} text-right`}>Chi phí</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((ticket) => (
                  <tr className={rowCls} key={ticket.id}>
                    <td className="px-6 py-4 font-mono text-sm text-brand-700">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {ticket.room}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-danger-600">
                      {ticket.cost == null ? "Chưa có dữ liệu" : money(ticket.cost)}
                    </td>
                  </tr>
                ))}
                {repairs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                      Chưa có phiếu sửa chữa nào phát sinh chi phí.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal: Ghi nhận chi phí tiện ích cơ sở */}
      {modalOpen && (
        <Modal
          title="Ghi nhận hóa đơn chi phí cơ sở"
          description="Ghi nhận chi phí cơ sở trong dữ liệu hiện có."
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4 p-6" onSubmit={handleCreateExpense}>
            {saveError && <p role="alert" className="text-sm text-danger-600">{saveError}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Loại chi phí tiện ích
                </span>
                <select
                  className={`${inputCls} h-10`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FacilityExpenseCategory)}
                >
                  <option value="Điện EVN">Điện EVN (Điện lực)</option>
                  <option value="Nước">Nước (Cấp nước sinh hoạt)</option>
                  <option value="Internet">Internet cáp quang tòa nhà</option>
                  <option value="Lương nhân viên">Lương nhân viên (Tổng tháng)</option>
                  <option value="Khác">Khác (Vệ sinh, rác thải, v.v.)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Ngày trên hóa đơn
                </span>
                <input
                  type="date"
                  className={`${inputCls} h-10`}
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Tiêu đề hóa đơn
              </span>
              <input
                className={`${inputCls} h-10`}
                placeholder="VD: Tiền điện tổng cơ sở tháng 10/2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Số tiền thanh toán (VNĐ)
                </span>
                <input
                  className={`${inputCls} h-10 font-mono`}
                  placeholder="VD: 24.500.000"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setAmount(raw ? Number(raw).toLocaleString("vi-VN") : "");
                  }}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Mã hóa đơn / Mã hợp đồng EVN/Nước
                </span>
                <input
                  className={`${inputCls} h-10 font-mono`}
                  placeholder="VD: EVN-202610-098"
                  value={invoiceCode}
                  onChange={(e) => setInvoiceCode(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Ảnh chụp hóa đơn đối soát (Tùy chọn)
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-sm file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    const readId = ++receiptReadId.current;
                    setReceiptImage("");
                    setReceiptError("");
                    if (file) {
                      setReceiptLoading(true);
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (readId !== receiptReadId.current) return;
                        if (typeof reader.result === "string") setReceiptImage(reader.result);
                        else setReceiptError("Không thể đọc ảnh chứng từ. Vui lòng chọn lại.");
                        setReceiptLoading(false);
                      };
                      reader.onerror = () => {
                        if (readId !== receiptReadId.current) return;
                        setReceiptError("Không thể đọc ảnh chứng từ. Vui lòng chọn lại.");
                        setReceiptLoading(false);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setReceiptLoading(false);
                    }
                  }}
                />
                {receiptImage && (
                  <span className="shrink-0 text-xs font-semibold text-success-600">
                    Đã đính kèm ảnh
                  </span>
                )}
              </div>
              {receiptLoading && <p className="mt-1 text-xs text-slate-500">Đang đọc ảnh chứng từ...</p>}
              {receiptError && <p role="alert" className="mt-1 text-xs text-danger-600">{receiptError}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Ghi chú chi tiết
              </span>
              <textarea
                className={`${inputCls} min-h-20 py-2.5 text-xs`}
                placeholder="VD: Đã thanh toán qua ủy nhiệm chi ngân hàng VietinBank"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                label="Lưu hóa đơn"
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
                type="submit"
              >
                Lưu hóa đơn chi phí
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Drawer: Chi tiết hóa đơn chi phí cơ sở */}
      {selectedExpense && (
        <Drawer
          title={selectedExpense.title}
          subtitle={`${selectedExpense.id} · ${selectedExpense.category}`}
          onClose={() => setSelectedExpense(null)}
        >
          {saveError && <p role="alert" className="mb-4 text-sm text-danger-600">{saveError}</p>}
          <div className="flex items-center justify-between">
            <Badge tone={categoryTones[selectedExpense.category]}>
              {selectedExpense.category}
            </Badge>
            <span className="font-heading text-lg font-bold text-danger-600">
              {money(selectedExpense.amount)}
            </span>
          </div>

          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["Hạng mục chi phí", selectedExpense.category],
              ["Ngày ghi nhận", selectedExpense.expenseDate],
              ["Mã hóa đơn / Mã HĐ", selectedExpense.invoiceCode ?? "—"],
              ["Thời gian tạo", selectedExpense.createdAt ?? "—"],
              ["Ghi chú", selectedExpense.note ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          {selectedExpense.receiptImage && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-slate-700">
                Ảnh hóa đơn đối soát
              </p>
              <div className="overflow-hidden rounded-sm border border-slate-200">
                <img
                  src={selectedExpense.receiptImage}
                  alt="Ảnh hóa đơn đối soát"
                  className="max-h-60 w-full object-contain bg-slate-50"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Button label="Sửa chi phí" className="h-10 rounded-sm border border-slate-200 text-sm font-semibold" onClick={() => {
              receiptReadId.current++;
              setReceiptLoading(false);
              setEditingExpense(selectedExpense);
              setCategory(selectedExpense.category);
              setTitle(selectedExpense.title);
              setAmount(String(selectedExpense.amount));
              setExpenseDate(selectedExpense.expenseDate);
              setInvoiceCode(selectedExpense.invoiceCode ?? "");
              setNote(selectedExpense.note ?? "");
              setReceiptImage(selectedExpense.receiptImage ?? "");
              setReceiptError("");
              setSelectedExpense(null);
              setModalOpen(true);
            }}>Sửa chi phí</Button>
            <Button
              label="Xóa hóa đơn chi phí"
              className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50"
              onClick={async () => {
                try {
                  await onDeleteExpense(selectedExpense.id);
                  setSaveError("");
                } catch (error) {
                  setSaveError(error instanceof Error ? error.message : "Không thể xóa chi phí. Vui lòng thử lại.");
                  return;
                }
                setSelectedExpense(null);
                showToast?.(`Đã xóa hóa đơn ${selectedExpense.id}`);
              }}
            >
              Xóa hóa đơn này
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
