import { useContext, useState } from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import type { Ticket } from "../../types/incident.ts";
import {
  Card,
  TenantCtx,
  roommates,
  type RequestKind,
  type TenantVehicle,
} from "./tenantConstants.tsx";

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
  const [docsOpen, setDocsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const contractDocuments = [
    {
      id: "DOC-001",
      name: "hop-dong-thue-HD-2026-0187.pdf",
      category: "Hợp đồng gốc (Bản scan PDF)",
      type: "pdf" as const,
      url: "/hop-dong-noi-quy-ktx.pdf",
      size: "284 KB",
      date: "01/09/2026",
    },
    {
      id: "DOC-002",
      name: "anh-chup-hop-dong-trang-1.jpg",
      category: "Ảnh chụp hợp đồng giấy · Trang 1",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80",
      size: "1.2 MB",
      date: "01/09/2026",
    },
    {
      id: "DOC-003",
      name: "anh-chup-hop-dong-trang-2.jpg",
      category: "Ảnh chụp hợp đồng giấy · Trang 2 (Có chữ ký)",
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1554415707-9e49fe832847?auto=format&fit=crop&w=800&q=80",
      size: "1.4 MB",
      date: "01/09/2026",
    },
  ];

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
            </dl>
            <Button
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm border border-brand-200 bg-brand-50/50 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 active:translate-y-[1px]"
              onClick={() => setDocsOpen(true)}
            >
              <Icon name="file" className="size-3.5" />
              Xem tài liệu hợp đồng đã ký ({contractDocuments.length} tệp)
            </Button>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed rounded-sm border border-slate-200 bg-slate-50 p-3">
              * Khi có nhu cầu gia hạn hoặc trả phòng, vui lòng liên hệ trực tiếp Ban Quản lý KTX trước 15 ngày để tiến hành kiểm tra phòng và ký kết văn bản.
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
          description={`Mã hợp đồng: ${TENANT.contract} · Ký kết ngày 01/09/2026`}
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
                        <span>{doc.size}</span>
                        <span>· {doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      className="h-8 rounded-sm border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:translate-y-[1px]"
                      onClick={() => {
                        if (doc.type === "image") {
                          setPreviewImage(doc.url);
                        } else {
                          window.open(doc.url, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      {doc.type === "image" ? "Xem ảnh" : "Mở tệp PDF"}
                    </Button>
                    <a
                      href={doc.url}
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
