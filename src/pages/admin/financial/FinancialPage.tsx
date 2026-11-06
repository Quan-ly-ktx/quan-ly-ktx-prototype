import { useState } from "react";
import { Button, Drawer, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import type { Invoice, Ticket, FacilityExpense, FacilityExpenseCategory } from "../../../types/index.ts";
import { calculateFinancialSummary } from "../../../utils/financialCalculations.ts";
import { initialFacilityExpenses } from "../../../services/mock/mockData.ts";
import { card, th, rowCls, inputCls, Stat, Badge } from "../common.tsx";

const categoryTones: Record<FacilityExpenseCategory, "brand" | "info" | "warning" | "neutral"> = {
  "Điện EVN": "warning",
  "Nước": "info",
  "Internet": "brand",
  "Khác": "neutral",
};

export function FinancialPage({
  records,
  tickets,
  facilityExpenses: externalExpenses,
  onFacilityExpensesChange,
  showToast,
}: {
  records: Invoice[];
  tickets: Ticket[];
  facilityExpenses?: FacilityExpense[];
  onFacilityExpensesChange?: (expenses: FacilityExpense[]) => void;
  showToast?: (m: string) => void;
}) {
  const [internalExpenses, setInternalExpenses] = useState<FacilityExpense[]>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = window.localStorage.getItem("dorm_facility_expenses");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialFacilityExpenses;
  });

  const expenses = externalExpenses ?? internalExpenses;

  const updateExpenses = (next: FacilityExpense[]) => {
    if (onFacilityExpensesChange) onFacilityExpensesChange(next);
    setInternalExpenses(next);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("dorm_facility_expenses", JSON.stringify(next));
      } catch {}
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<FacilityExpense | null>(null);

  // Form state
  const [category, setCategory] = useState<FacilityExpenseCategory>("Điện EVN");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invoiceCode, setInvoiceCode] = useState("");
  const [note, setNote] = useState("");
  const [receiptImage, setReceiptImage] = useState("");

  const summary = calculateFinancialSummary(records, tickets, expenses);

  const paid = [
    ...new Map(
      records
        .filter((invoice) => invoice.payment)
        .map((invoice) => [invoice.id, invoice]),
    ).values(),
  ];

  const repairs = [
    ...new Map(
      tickets
        .filter((ticket) => ticket.status === "Hoàn thành" && ticket.cost)
        .map((ticket) => [ticket.id, ticket]),
    ).values(),
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount.replace(/\D/g, ""));
    if (!title.trim()) {
      showToast?.("Vui lòng nhập tiêu đề hóa đơn tiện ích");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      showToast?.("Vui lòng nhập số tiền chi phí hợp lệ");
      return;
    }

    const newExpense: FacilityExpense = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      category,
      title: title.trim(),
      amount: numAmount,
      expenseDate,
      invoiceCode: invoiceCode.trim() || undefined,
      receiptImage: receiptImage || undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("vi-VN"),
    };

    updateExpenses([newExpense, ...expenses]);
    setModalOpen(false);
    setTitle("");
    setAmount("");
    setInvoiceCode("");
    setNote("");
    setReceiptImage("");
    showToast?.(`Đã ghi nhận hóa đơn ${category}: ${money(numAmount)}`);
  };

  const handleExport = (format: "Excel" | "PDF") => {
    showToast?.(`Đã xuất báo cáo tài chính ${format} (Lợi nhuận ròng: ${money(summary.profit)})`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Tài chính"
        title="Báo cáo tài chính & Lợi nhuận ròng"
        description="Tổng hợp doanh thu tiền phòng thực thu, chi phí sửa chữa và hóa đơn tiện ích tổng cơ sở (BR-03 / FR-14)."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              label="Xuất Excel"
              className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => handleExport("Excel")}
            >
              <Icon name="file" className="mr-1.5 size-4 text-slate-500" />
              Xuất Excel
            </Button>
            <Button
              label="Xuất PDF"
              className="h-10 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => handleExport("PDF")}
            >
              <Icon name="file" className="mr-1.5 size-4 text-slate-500" />
              Xuất PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon="wallet"
          tone="success"
          label="Doanh thu thực thu"
          value={money(summary.collectedRevenue)}
          hint={`${paid.length} khoản đã gạch nợ`}
        />
        <Stat
          icon="tools"
          tone="warning"
          label="Chi phí sửa chữa"
          value={money(summary.repairExpenses)}
          hint={`${repairs.length} phiếu hoàn thành`}
        />
        <Stat
          icon="invoice"
          tone="danger"
          label="Tiện ích tổng cơ sở"
          value={money(summary.facilityTotal)}
          hint={`${expenses.length} hóa đơn điện nước/mạng`}
        />
        <Stat
          icon="trend"
          tone={summary.profit >= 0 ? "brand" : "danger"}
          label="Lợi nhuận ròng thực tế"
          value={money(summary.profit)}
          hint="Doanh thu − Sửa chữa − Điện nước tổng"
        />
      </div>

      {/* Facility Expenses Table */}
      <section className={`${card} mb-6 overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Hóa đơn chi phí tiện ích cơ sở (Điện tổng, Nước tổng, Internet)
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Chi phí định kỳ trả cho nhà cung cấp (EVN, Cấp nước, Viễn thông) để trừ vào doanh thu tính Lợi nhuận ròng.
            </p>
          </div>
          <Button
            label="Thêm chi phí"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border border-brand-200 bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100"
            onClick={() => setModalOpen(true)}
          >
            + Nhập hóa đơn tổng
          </Button>
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
              {expenses.map((exp) => (
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
              {expenses.length === 0 && (
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
              Khoản thu tiền phòng đã thực nhận
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Doanh thu tiền phòng trọn gói đã gạch nợ qua VietQR hoặc tiền mặt.
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
              Chi phí vật tư sửa chữa hoàn thành
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Linh kiện và phụ tùng thay thế được kỹ thuật viên nghiệm thu.
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
                      {money(ticket.cost ?? 0)}
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
          description="Nhập hóa đơn tiện ích phát sinh trong tháng của cả cơ sở để hạch toán Lợi nhuận ròng (FR-14)."
          onClose={() => setModalOpen(false)}
        >
          <form className="space-y-4 p-6" onSubmit={handleCreateExpense}>
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
                  <option value="Khác">Khác (Vệ sinh, rác thải)</option>
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
                    if (file) {
                      setReceiptImage(URL.createObjectURL(file));
                    }
                  }}
                />
                {receiptImage && (
                  <span className="shrink-0 text-xs font-semibold text-success-600">
                    Đã đính kèm ảnh
                  </span>
                )}
              </div>
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
            <Button
              label="Xóa hóa đơn chi phí"
              className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50"
              onClick={() => {
                updateExpenses(expenses.filter((x) => x.id !== selectedExpense.id));
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
