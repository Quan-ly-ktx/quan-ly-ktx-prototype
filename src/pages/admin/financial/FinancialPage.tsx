import { PageHeader } from "../../../components/common/index.ts";
import { money, type Invoice, type Ticket } from "../../../data.ts";
import { calculateFinancialSummary } from "../../../domain.ts";
import { card, th, rowCls, Stat } from "../common.tsx";

export function FinancialPage({
  records,
  tickets,
}: {
  records: Invoice[];
  tickets: Ticket[];
}) {
  const summary = calculateFinancialSummary(records, tickets);
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

  return (
    <>
      <PageHeader
        eyebrow="Tài chính"
        title="Tổng hợp thu chi"
        description="Doanh thu chỉ tính từ khoản đã thực nhận; chi phí lấy từ phiếu sửa chữa đã hoàn thành."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Stat
          icon="wallet"
          tone="success"
          label="Doanh thu đã thu"
          value={money(summary.collectedRevenue)}
          hint={`${paid.length} khoản thanh toán duy nhất`}
        />
        <Stat
          icon="tools"
          tone="danger"
          label="Chi phí sửa chữa"
          value={money(summary.repairExpenses)}
          hint={`${repairs.length} phiếu đã hoàn thành`}
        />
        <Stat
          icon="trend"
          tone="brand"
          label="Lợi nhuận"
          value={money(summary.profit)}
          hint="Doanh thu đã thu − chi phí sửa chữa"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${card} overflow-hidden`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Khoản thu đã nhận
            </h2>
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
              Chi phí sửa chữa
            </h2>
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
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Chưa có chi phí sửa chữa đã xác nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
