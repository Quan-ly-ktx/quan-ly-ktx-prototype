import { useState, type ReactNode } from "react";
import { Button, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import type { TenantRecord, TenantVehicle } from "../../../types/tenant.ts";

type Vehicle = TenantVehicle;
import { card, th, rowCls, Badge, SearchBox, type Toast } from "../common.tsx";


const CARD_STATUS_TONES: Record<Vehicle["cardStatus"], "success" | "warning" | "slate"> = {
  "Đã cấp thẻ": "success",
  "Chưa cấp thẻ": "warning",
  "Đã thu hồi": "slate",
};



function VehicleDetail({
  vehicle,
  tenant,
}: {
  vehicle: Vehicle;
  tenant?: TenantRecord;
}) {
  const infoRow = (label: string, value: ReactNode, mono = false) => (
    <div className="flex items-start justify-between gap-6 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`text-right text-sm font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-sm border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            ID thẻ từ gửi xe
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-950">
            {vehicle.cardCode ?? "Chưa cấp"}
          </p>
        </div>
        <Badge tone={CARD_STATUS_TONES[vehicle.cardStatus]}>
          {vehicle.cardStatus}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-sm border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="icon-box icon-box-brand">
              <Icon name="clipboard" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-slate-950">
                Thông tin phương tiện
              </p>
              <p className="text-xs text-slate-500">{vehicle.id}</p>
            </div>
          </div>
          <dl>
            {infoRow("Biển số", vehicle.plate || "Không có", true)}
            {infoRow("Loại xe", vehicle.type)}
            {infoRow("Hãng / Dòng xe", vehicle.brand)}
            {infoRow("Màu sắc", vehicle.color)}
          </dl>
        </section>

        <section className="rounded-sm border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="icon-box icon-box-success">
              <Icon name="user" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-slate-950">
                Thông tin người thuê
              </p>
              <p className="font-mono text-xs text-slate-500">
                {tenant?.id ?? vehicle.tenantId}
              </p>
            </div>
          </div>
          <dl>
            {infoRow("Họ và tên", tenant?.name ?? "Không xác định")}
            {infoRow(
              "Phòng / Giường",
              tenant ? `${tenant.room} · ${tenant.bed}` : "—",
              true,
            )}
            {infoRow("Số điện thoại", tenant?.phone ?? "—")}
            {infoRow("CCCD", tenant?.cccd ?? "—", true)}
            {infoRow("Email", tenant?.email ?? "—")}
          </dl>
        </section>
      </div>

      <section className="rounded-sm border border-slate-200 p-4">
        <div className="mb-4">
          <p className="font-heading text-lg font-bold text-slate-950">
            Ảnh cà vẹt xe (Giấy đăng ký xe)
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Đối soát giấy tờ chứng minh xe chính chủ để cấp thẻ từ hầm KTX.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[["Mặt trước", vehicle.registrationFront], ["Mặt sau", vehicle.registrationBack]].map(([side, image]) => (
            <div key={side}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{side}</p>
              <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                {image ? <img src={image} alt={`Giấy đăng ký ${side}`} className="h-full w-full object-contain" /> : <p className="text-sm text-slate-400">Chưa có ảnh</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function VehiclesPage({
  tenants,
  vehicles: externalVehicles,
  onIssueVehicleCard,
  onRevokeVehicle,
  showToast,
}: Toast & {
  tenants: TenantRecord[];
  vehicles?: TenantVehicle[];
  onIssueVehicleCard: (id: string, cardCode: string) => Promise<void>;
  onRevokeVehicle: (id: string) => Promise<void>;
}) {
  const vehicles = externalVehicles ?? [];
  const [statusTab, setStatusTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "REVOKED">("ALL");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [issuingVehicle, setIssuingVehicle] = useState<Vehicle | null>(null);
  const [cardCodeInput, setCardCodeInput] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const tenantName = (id?: string) =>
    tenants.find((tenant) => tenant.id === id)?.name ?? "Không xác định";


  const pendingCount = vehicles.filter((v) => v.cardStatus === "Chưa cấp thẻ").length;
  const activeCount = vehicles.filter((v) => v.cardStatus === "Đã cấp thẻ").length;
  const revokedCount = vehicles.filter((v) => v.cardStatus === "Đã thu hồi").length;

  const visible = vehicles.filter((vehicle) => {
    if (statusTab === "PENDING" && vehicle.cardStatus !== "Chưa cấp thẻ") return false;
    if (statusTab === "ACTIVE" && vehicle.cardStatus !== "Đã cấp thẻ") return false;
    if (statusTab === "REVOKED" && vehicle.cardStatus !== "Đã thu hồi") return false;
    if (!query.trim()) return true;
    return `${vehicle.plate} ${tenantName(vehicle.tenantId)} ${vehicle.type} ${vehicle.brand} ${vehicle.cardCode ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });


  return (
    <>
      <PageHeader
        eyebrow="Phương tiện"
        title="Quản lý phương tiện hầm xe"
        description="Quản lý biển số, cấp phát mã thẻ từ vật lý, ảnh cà vẹt xe và kiểm soát trật tự an ninh hầm KTX."
      />

      <section className={card}>
        <div className="border-b border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `Tất cả (${vehicles.length})`, highlight: false },
              { id: "PENDING", label: `Chờ cấp thẻ (${pendingCount})`, highlight: pendingCount > 0 },
              { id: "ACTIVE", label: `Đã cấp thẻ (${activeCount})`, highlight: false },
              { id: "REVOKED", label: `Đã thu hồi (${revokedCount})`, highlight: false },
            ].map((tab) => (
              <Button
                key={tab.id}
                className={`h-8 rounded-sm px-3 text-xs font-semibold active:translate-y-[1px] transition-all ${
                  statusTab === tab.id
                    ? "bg-brand-500 text-white shadow-xs"
                    : tab.highlight
                      ? "border border-warning-300 bg-warning-50 text-warning-800 hover:bg-warning-100"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setStatusTab(tab.id as typeof statusTab)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Tìm biển số, người thuê, mã thẻ từ..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Biển số</th>
                <th className={th}>Người thuê</th>
                <th className={th}>Loại xe</th>
                <th className={th}>Hãng / Màu</th>
                <th className={th}>Mã thẻ từ</th>
                <th className={th}>Tình trạng</th>
                <th className={th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((vehicle) => (
                <tr className={rowCls} key={vehicle.id}>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-brand-700">
                    {vehicle.plate}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {tenantName(vehicle.tenantId)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {
                        tenants.find((tenant) => tenant.id === vehicle.tenantId)
                          ?.room
                      }{" "}
                      ·{" "}
                      {
                        tenants.find((tenant) => tenant.id === vehicle.tenantId)
                          ?.bed
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {vehicle.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {vehicle.brand} · {vehicle.color}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-800">
                    {vehicle.cardCode ? (
                      <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs text-slate-800 border border-slate-200">
                        {vehicle.cardCode}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Chưa cấp</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge tone={CARD_STATUS_TONES[vehicle.cardStatus]}>
                        {vehicle.cardStatus}
                      </Badge>
                      {vehicle.cardStatus === "Chưa cấp thẻ" && (
                        <Button
                          className="rounded-sm border border-brand-300 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                          onClick={() => {
                            setIssuingVehicle(vehicle);
                            setCardCodeInput("");
                          }}
                        >
                          + Cấp thẻ
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative w-fit">
                      <Button
                        label={`Mở thao tác cho ${vehicle.plate}`}
                        className="grid size-8 place-items-center rounded-sm border border-slate-200 text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                        onClick={() =>
                          setActionMenu(
                            actionMenu === vehicle.id ? null : vehicle.id,
                          )
                        }
                      >
                        <Icon name="more" className="size-4" />
                      </Button>
                      {actionMenu === vehicle.id && (
                        <div className="absolute right-0 top-10 z-dropdown w-40 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md">
                          <Button
                            className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                            onClick={() => {
                              setViewing(vehicle);
                              setActionMenu(null);
                            }}
                          >
                            <Icon name="search" className="size-3.5" /> Xem chi tiết
                          </Button>
                          {vehicle.cardStatus === "Chưa cấp thẻ" && (
                            <Button
                              className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-brand-700 hover:bg-brand-50"
                              onClick={() => {
                                setIssuingVehicle(vehicle);
                                setCardCodeInput("");
                                setActionMenu(null);
                              }}
                            >
                              <Icon name="check" className="size-3.5" /> Cấp thẻ từ
                            </Button>
                          )}
                          {vehicle.cardStatus !== "Đã thu hồi" && (
                            <Button
                              className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-warning-700 hover:bg-warning-50"
                              onClick={async () => {
                                try {
                                  await onRevokeVehicle(vehicle.id);
                                } catch (error) {
                                  showToast(error instanceof Error ? error.message : "Không thể thu hồi thẻ");
                                  return;
                                }
                                showToast(`Đã thu hồi phương tiện ${vehicle.plate || vehicle.id}`);
                                setActionMenu(null);
                              }}
                            >
                              <Icon name="close" className="size-3.5" /> Thu hồi thẻ
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy phương tiện phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Chi tiết phương tiện */}
      {viewing && (
        <Modal
          wide
          title={`Chi tiết phương tiện ${viewing.plate}`}
          description="Thông tin thẻ xe, phương tiện, người thuê và ảnh cà vẹt xe."
          onClose={() => setViewing(null)}
        >
          <VehicleDetail
            vehicle={viewing}
            tenant={tenants.find((tenant) => tenant.id === viewing.tenantId)}
          />
        </Modal>
      )}

      {/* Modal Cấp thẻ từ gửi xe (FR-08 / BR-10) */}
      {issuingVehicle && (
        <Modal
          title={`Cấp thẻ từ gửi xe · ${issuingVehicle.plate}`}
          description="Gán mã thẻ vật lý cho phương tiện."
          onClose={() => setIssuingVehicle(null)}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-sm border border-brand-100 bg-brand-50 p-3.5 text-xs text-brand-900">
              <p className="font-semibold">
                Chủ xe: {tenantName(issuingVehicle.tenantId)}
              </p>
              <p className="mt-1 text-slate-600">
                Phương tiện: <b className="text-slate-900">{issuingVehicle.brand}</b> ({issuingVehicle.color}) · {issuingVehicle.type}
              </p>
            </div>

            <VehicleDetail vehicle={issuingVehicle} tenant={tenants.find((tenant) => tenant.id === issuingVehicle.tenantId)} />

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Mã thẻ từ gửi xe vật lý (bắt buộc)
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono text-sm uppercase outline-none focus:border-brand-500"
                placeholder="VD: THE-0187"
                value={cardCodeInput}
                onChange={(e) => setCardCodeInput(e.target.value.toUpperCase())}
              />
            </label>
            <p className="text-[11px] text-slate-500">
              Phí gửi xe đã bao gồm trọn gói 100% trong tiền phòng; không thu thêm bất kỳ khoản phí nào.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setIssuingVehicle(null)}
              >
                Hủy
              </Button>
              <Button
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
                onClick={async () => {
                  const code = cardCodeInput.trim().toUpperCase();
                  if (!code) {
                    showToast("Vui lòng nhập mã thẻ từ");
                    return;
                  }
                  if (!vehicles.some((v) => v.id === issuingVehicle.id && v.cardStatus === "Chưa cấp thẻ")) {
                    showToast("Phương tiện không còn chờ cấp thẻ.");
                    return;
                  }
                  const current = vehicles.find((v) => v.id === issuingVehicle.id);
                  if (current && current.type !== "Xe đạp" && current.type !== "Xe đạp điện" &&
                    (!current.plate.trim() || !current.registrationFront || !current.registrationBack)) {
                    showToast("Phương tiện cần biển số và ảnh giấy đăng ký hai mặt trước khi cấp thẻ.");
                    return;
                  }
                  if (vehicles.some((v) => v.id !== issuingVehicle.id && v.cardStatus !== "Đã thu hồi" && v.cardCode?.trim().toUpperCase() === code)) {
                    showToast("Mã thẻ đang được sử dụng bởi phương tiện chưa thu hồi.");
                    return;
                  }
                  try {
                    await onIssueVehicleCard(issuingVehicle.id, code);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Không thể cấp thẻ");
                    return;
                  }
                  showToast(`Đã cấp thẻ từ ${code} cho xe ${issuingVehicle.plate}`);
                  setIssuingVehicle(null);
                }}
              >
                Xác nhận cấp thẻ
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </>
  );
}
