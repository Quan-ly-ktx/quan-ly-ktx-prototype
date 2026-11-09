import { useContext, useState } from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import type { Ticket } from "../../types/incident.ts";
import type { ContractRecord, TenantRecord } from "../../types/tenant.ts";
import {
  Card,
  TenantCtx,
  type RequestKind,
  type TenantVehicle,
} from "./tenantConstants.tsx";

export function RoomPage({
  tenant,
  contract,
  vehicles,
  roommates,
  myTickets,
  onReport,
  onVehicles,
  onRequest,
  pendingDeposit,
  onPay,
}: {
  tenant: TenantRecord;
  contract?: ContractRecord;
  vehicles: TenantVehicle[];
  roommates: { id: string; name: string; bed: string }[];
  myTickets: Ticket[];
  onReport: () => void;
  onVehicles: () => void;
  onRequest: (kind: RequestKind) => void;
  pendingDeposit: boolean;
  onPay: () => void;
}) {
  const TENANT = useContext(TenantCtx);
  const [docsOpen, setDocsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const ownedContract = contract?.tenantId === tenant.id && contract.status !== "Đã thanh lý" ? contract : undefined;
  const contractDocuments = ownedContract?.documents?.filter((doc) => doc.contractId === ownedContract.id) ?? [];
  const endParts = tenant.end.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const endDate = endParts
    ? new Date(Number(endParts[3]), Number(endParts[2]) - 1, Number(endParts[1]))
    : new Date(tenant.end);
  const daysRemaining = Number.isNaN(endDate.getTime())
    ? null
    : Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));


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
              Vui lòng kiểm tra hóa đơn đặt cọc để hoàn tất giữ chỗ.
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
                      Chưa có số liệu giường
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
                <p className="text-xs text-slate-500">Chưa có dữ liệu sơ đồ giường.</p>
              </div>
            </div>
          </article>

          <article className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Bạn cùng phòng
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {roommates.length} thành viên cùng phòng với bạn
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
                  <tr className="hover:bg-slate-50" key={mate.id}>
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
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-slate-900">
                Hợp đồng
              </h2>
              <span className="status-label status-label-success">
                {tenant.status}
              </span>
            </div>
            <dl className="space-y-4 text-sm">
              {[
                ["Mã hợp đồng", ownedContract?.id ?? "Chưa có thông tin", true],
                ["Thời hạn", tenant.start && tenant.end ? `${tenant.start} – ${tenant.end}` : "Chưa có thông tin", false],
                ["Còn lại", daysRemaining === null ? "Chưa có thông tin" : `${daysRemaining} ngày`, false],
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
            </dl>
            {contractDocuments.length > 0 ? (
              <Button
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm border border-brand-200 bg-brand-50/50 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                onClick={() => setDocsOpen(true)}
              >
                <Icon name="file" className="size-3.5" />
                Xem tài liệu hợp đồng ({contractDocuments.length} tệp)
              </Button>
            ) : <p className="mt-3 text-xs text-slate-500">Chưa có tài liệu hợp đồng.</p>}
            <p className="mt-4 text-xs text-slate-500 leading-relaxed rounded-sm border border-slate-200 bg-slate-50 p-3">
              Khi có nhu cầu gia hạn hoặc trả phòng, vui lòng liên hệ Ban Quản lý KTX.
            </p>
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

        </div>
      </div>
      {docsOpen && (
        <Modal
          wide
          title="Tài liệu & Minh chứng hợp đồng"
          description={`Mã hợp đồng: ${ownedContract?.id ?? "Chưa có thông tin"}`}
          onClose={() => setDocsOpen(false)}
        >
          <div className="space-y-4 p-6">
            <p className="text-xs text-slate-500">
              Danh sách các bản scan tài liệu và ảnh chụp hợp đồng giấy đã ký lưu trữ trên hệ thống:
            </p>

            <div className="space-y-3">
              {contractDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                      <Icon name="file" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {doc.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="rounded-sm bg-white px-1.5 py-0.5 border border-slate-200 font-medium text-slate-700">
                          {doc.category}
                        </span>
                        <span>{doc.size} byte</span>
                        <span>· {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      className="h-8 rounded-sm border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                      disabled={!doc.content && !doc.url}
                      onClick={() => {
                        const source = doc.content || doc.url;
                        if (!source) return;
                        if (doc.type.startsWith("image/")) {
                          setPreviewImage(source);
                        } else {
                          window.open(source, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      {doc.type.startsWith("image/") ? "Xem ảnh" : "Mở tệp"}
                    </Button>
                    <a
                      href={doc.content || doc.url}
                      download={doc.name}
                      className="grid size-8 place-items-center rounded-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      title="Tải tệp xuống"
                    >
                      <Icon name="file" className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                className="h-9 rounded-sm bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                onClick={() => setDocsOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {previewImage && (
        <Modal
          title="Xem ảnh tài liệu hợp đồng"
          description="Ảnh chụp trang hợp đồng giấy lưu trữ"
          onClose={() => setPreviewImage(null)}
        >
          <div className="p-4 space-y-3">
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-slate-950">
              <img
                src={previewImage}
                alt="Minh chứng hợp đồng"
                className="max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setPreviewImage(null)}
              >
                Đóng ảnh
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
