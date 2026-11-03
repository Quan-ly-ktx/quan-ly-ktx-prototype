import { useContext } from "react";
import { Button, Icon } from "../../components/common/index.ts";
import { money, type Ticket } from "../../data.ts";
import {
  Card,
  TenantCtx,
  roommates,
  type RequestKind,
  type TenantVehicle,
} from "./studentConstants.tsx";

export function RoomPage({
  vehicles,
  myTickets,
  onReport,
  onVehicles,
  onRequest,
  pendingDeposit,
  onPay,
}: {
  vehicles: TenantVehicle[];
  myTickets: Ticket[];
  onReport: () => void;
  onVehicles: () => void;
  onRequest: (kind: RequestKind) => void;
  pendingDeposit: boolean;
  onPay: () => void;
}) {
  const TENANT = useContext(TenantCtx);
  const openTickets = myTickets.filter(
    (ticket) => ticket.status !== "Hoàn thành",
  );

  return (
    <>
      <section className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-950">
          Xin chào, {TENANT.name.split(" ").slice(-1)[0]}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thông tin phòng ở, bạn cùng phòng và hợp đồng của bạn.
        </p>
      </section>

      {pendingDeposit && (
        <div className="mb-6 flex flex-col gap-4 rounded-sm border border-warning-100 bg-warning-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-slate-700">
            <Icon
              name="clock"
              className="mt-0.5 size-4 shrink-0 text-warning-600"
            />
            <span className="text-xs leading-5">
              <b className="font-semibold text-slate-900">
                Chờ thanh toán cọc.
              </b>{" "}
              Vui lòng thanh toán hóa đơn đặt cọc trong 24h để hoàn tất giữ chỗ.
            </span>
          </div>
          <Button
            className="h-10 shrink-0 rounded-sm bg-brand-500 px-4 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={onPay}
          >
            Thanh toán ngay
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="relative overflow-hidden bg-slate-900 p-6 text-white">
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-slate-400">
                    Phòng đang ở
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-mono text-4xl font-bold tracking-tight text-white">
                      {TENANT.room}
                    </span>
                    <span className="font-mono text-xl font-medium text-slate-400">
                      · {TENANT.bed}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">
                      {TENANT.floor}
                    </span>
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">
                      Phòng {TENANT.gender}
                    </span>
                    <span className="rounded-sm border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-mono text-slate-300">
                      4 / 6 giường
                    </span>
                  </div>
                </div>
                <span
                  className={`status-label bg-white ${
                    pendingDeposit ? "text-warning-600" : "text-success-600"
                  }`}
                >
                  <span className="size-1.5 rounded-sm bg-current" />
                  {pendingDeposit ? "Đang giữ chỗ" : "Đang cư trú"}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Sơ đồ giường trong phòng
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-brand-500" />
                    Giường của bạn
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-slate-300" />
                    Đã có người
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm border border-dashed border-success-500 bg-success-50" />
                    Còn chỗ
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {["G01", "G02", "G03", "G04", "G05", "G06"].map((bed) => {
                  const mine = bed === TENANT.bed;
                  const taken = ["G01", "G02", "G03", "G04"].includes(bed);
                  return (
                    <div
                      className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-sm border ${
                        mine
                          ? "border-brand-500 bg-brand-500 text-white shadow-xs"
                          : taken
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-dashed border-success-500 bg-success-50 text-success-600"
                      }`}
                      key={bed}
                    >
                      <Icon name="bed" className="size-5" />
                      <span className="font-mono text-xs font-medium">{bed}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Bạn cùng phòng
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                3 thành viên cùng phòng với bạn
              </p>
            </div>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Người thuê</th>
                  <th className="px-6 py-3">Giường</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roommates.map((mate) => (
                  <tr className="hover:bg-slate-50" key={mate.name}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-sm bg-slate-100 font-mono text-xs font-semibold text-slate-600">
                          {mate.name
                            .split(" ")
                            .slice(-2)
                            .map((part) => part[0])
                            .join("")}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {mate.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {mate.bed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <span className="icon-box icon-box-brand">
                <Icon name="clipboard" />
              </span>
              <span
                className={`status-label ${
                  vehicles[0]?.status === "Đã cấp thẻ xe"
                    ? "status-label-success"
                    : "status-label-warning"
                }`}
              >
                {vehicles[0]?.status ?? "Chưa đăng ký"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-lg font-bold text-slate-900">
              Phương tiện của tôi
            </h2>
            {vehicles[0] ? (
              <>
                <div className="mt-3 font-mono text-xl font-bold text-slate-950">
                  {vehicles[0].plate}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {vehicles[0].brand} · {vehicles[0].color}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Chưa có phương tiện được khai báo.
              </p>
            )}
            <Button
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={onVehicles}
            >
              Quản lý phương tiện <Icon name="chevron" className="size-4" />
            </Button>
          </Card>
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Hợp đồng
              </h2>
              {pendingDeposit ? (
                <span className="status-label status-label-warning">
                  <Icon name="clock" className="size-3.5" />
                  Chờ kích hoạt
                </span>
              ) : (
                <span className="status-label status-label-success">
                  <span className="size-1.5 rounded-sm bg-current" />
                  Đang hiệu lực
                </span>
              )}
            </div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-brand-50 px-2.5 py-1 font-mono text-xs font-medium text-brand-700">
              <Icon name="clock" className="size-3.5" />
              Thời hạn: 1 Năm (Mặc định)
            </span>
            <dl className="space-y-4 text-sm">
              {[
                ["Mã hợp đồng", TENANT.contract, true],
                ["Thời hạn", "01/09/2026 – 01/09/2027", false],
                ["Còn lại", pendingDeposit ? "—" : "312 ngày", false],
              ].map(([label, value, mono]) => (
                <div
                  className="flex justify-between gap-4"
                  key={label as string}
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd
                    className={`font-semibold text-slate-800 ${
                      mono ? "font-mono" : ""
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">
                  Tiền cọc {money(TENANT.deposit)}
                </dt>
                <dd>
                  {pendingDeposit ? (
                    <span className="status-label status-label-warning">
                      Chờ thanh toán cọc
                    </span>
                  ) : (
                    <span className="status-label status-label-success">
                      Đã nộp tiền
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            {!pendingDeposit && (
              <Button
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={() => onRequest("extend")}
              >
                <Icon name="refresh" className="size-4" />
                Gửi yêu cầu gia hạn
              </Button>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => onRequest("transfer")}
              >
                Chuyển phòng
              </Button>
              <Button
                className="h-10 rounded-sm border border-danger-200 text-sm font-semibold text-danger-600 hover:bg-danger-50 active:translate-y-[1px]"
                onClick={() => onRequest("checkout")}
              >
                Trả phòng
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Hồ sơ cá nhân
            </h2>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {[
                ["Họ và tên", TENANT.name, false],
                ["Giới tính", TENANT.gender, false],
                ["Địa chỉ", TENANT.address, false],
                ["Số điện thoại", TENANT.phone, true],
                ["CCCD", TENANT.cccd, true],
                ["Email", TENANT.email, false],
              ].map(([label, value, mono]) => (
                <div
                  className="flex justify-between gap-4 py-3"
                  key={label as string}
                >
                  <dt className="text-slate-500">{label}</dt>
                  <dd
                    className={`text-right font-semibold text-slate-800 ${
                      mono ? "font-mono" : ""
                    }`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="icon-box icon-box-warning">
                <Icon name="tools" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">
                  Sự cố của phòng
                </div>
                <div className="text-xs text-slate-500">
                  {openTickets.length
                    ? `${openTickets.length} phiếu đang xử lý`
                    : "Không có phiếu đang mở"}
                </div>
              </div>
            </div>
            <Button
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={onReport}
            >
              Báo hỏng vật tư
              <Icon name="chevron" className="size-4" />
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
