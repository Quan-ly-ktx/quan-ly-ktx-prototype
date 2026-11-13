import { useState, type ReactNode } from "react";
import { Button, Drawer, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import {
  normalizeVehicleStatus,
  type TenantRecord,
  type TenantVehicle,
  type VehicleChangeRequest,
  type VehicleStatus,
} from "../../../types/tenant.ts";
import { card, th, rowCls, inputCls, Badge, SearchBox, type Toast } from "../common.tsx";

type Vehicle = TenantVehicle;

const CARD_STATUS_TONES: Record<string, "success" | "warning" | "danger" | "slate"> = {
  "Đã cấp thẻ": "success",
  "Chưa cấp thẻ": "warning",
  "Đã thu hồi": "slate",
  "Bị từ chối": "danger",
  "Đã thay thế": "slate",
  "Đã hủy": "slate",
  "Chờ cấp thẻ": "warning",
};

const REQUEST_STATUS_TONES: Record<VehicleChangeRequest["status"], "warning" | "success" | "danger" | "slate"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "slate",
};

const REQUEST_STATUS_LABELS: Record<VehicleChangeRequest["status"], string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

function VehicleDetail({
  vehicle,
  tenant,
  onOpenIssue,
  onOpenReject,
}: {
  vehicle: Vehicle;
  tenant?: TenantRecord;
  onOpenIssue?: (vehicle: Vehicle) => void;
  onOpenReject?: (vehicle: Vehicle) => void;
}) {
  const status = normalizeVehicleStatus(vehicle);
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
        <Badge tone={CARD_STATUS_TONES[vehicle.cardStatus] ?? "slate"}>
          {vehicle.cardStatus}
        </Badge>
      </div>

      {status === "REJECTED" && (
        <div className="rounded-sm border border-danger-200 bg-danger-50 p-4 text-xs text-danger-800 space-y-1">
          <p className="font-bold">Hồ sơ đăng ký phương tiện đã bị từ chối</p>
          {vehicle.rejectionReason && (
            <p className="text-danger-900">Lý do: <strong>{vehicle.rejectionReason}</strong></p>
          )}
          {vehicle.rejectedAt && (
            <p className="text-slate-500 font-mono text-[11px]">
              Thời điểm từ chối: {new Date(vehicle.rejectedAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      )}

      {status === "REPLACED" && (
        <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-1">
          <p className="font-bold">Phương tiện đã được thay thế (REPLACED)</p>
          <p>Phương tiện này đã được thay thế sang xe mới theo yêu cầu đổi xe. Mã thẻ vật lý ({vehicle.cardCode}) đã được chuyển giao cho xe mới.</p>
        </div>
      )}

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
            {infoRow("Trạng thái nghiệp vụ", status, true)}
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
                {image ? (
                  <img src={image} alt={`Giấy đăng ký ${side}`} className="h-full w-full object-contain" />
                ) : (
                  <p className="text-sm text-slate-400">Chưa có ảnh</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {status === "PENDING_CARD" && onOpenIssue && onOpenReject && (
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            className="h-10 rounded-sm border border-danger-200 bg-white px-4 text-xs font-semibold text-danger-600 hover:bg-danger-50"
            onClick={() => onOpenReject(vehicle)}
          >
            Từ chối cấp thẻ
          </Button>
          <Button
            className="h-10 rounded-sm bg-brand-500 px-5 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => onOpenIssue(vehicle)}
          >
            Cấp thẻ gửi xe
          </Button>
        </div>
      )}
    </div>
  );
}

export function VehiclesPage({
  tenants,
  vehicles: externalVehicles,
  vehicleChangeRequests: externalChangeRequests,
  managerStaffId,
  onIssueVehicleCard,
  onRevokeVehicle,
  onRejectVehicle,
  onApproveVehicleChangeRequest,
  onRejectVehicleChangeRequest,
  showToast,
}: Toast & {
  managerStaffId?: string;
  tenants: TenantRecord[];
  vehicles?: TenantVehicle[];
  vehicleChangeRequests?: VehicleChangeRequest[];
  onIssueVehicleCard: (id: string, cardCode: string, actorStaffId: string) => Promise<void>;
  onRevokeVehicle: (id: string, actorStaffId: string) => Promise<void>;
  onRejectVehicle?: (id: string, reason: string, actorStaffId?: string) => Promise<void>;
  onApproveVehicleChangeRequest?: (requestId: string, actorStaffId?: string) => Promise<void>;
  onRejectVehicleChangeRequest?: (requestId: string, reason: string, actorStaffId?: string) => Promise<void>;
}) {
  const vehicles = externalVehicles ?? [];
  const changeRequests = externalChangeRequests ?? [];

  const [statusTab, setStatusTab] = useState<"ALL" | "PENDING" | "ACTIVE" | "CHANGES" | "REVOKED" | "REJECTED">("ALL");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [issuingVehicle, setIssuingVehicle] = useState<Vehicle | null>(null);
  const [cardCodeInput, setCardCodeInput] = useState("");
  const [rejectingVehicle, setRejectingVehicle] = useState<Vehicle | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  // Change request review modals
  const [viewingChangeRequest, setViewingChangeRequest] = useState<VehicleChangeRequest | null>(null);
  const [rejectChangeRequestTarget, setRejectChangeRequestTarget] = useState<VehicleChangeRequest | null>(null);
  const [rejectChangeReason, setRejectChangeReason] = useState("");

  const tenantName = (id?: string) =>
    tenants.find((tenant) => tenant.id === id)?.name ?? "Không xác định";

  const pendingCount = vehicles.filter((v) => normalizeVehicleStatus(v) === "PENDING_CARD").length;
  const activeCount = vehicles.filter((v) => normalizeVehicleStatus(v) === "ISSUED").length;
  const revokedCount = vehicles.filter((v) => normalizeVehicleStatus(v) === "REVOKED").length;
  const rejectedCount = vehicles.filter((v) => normalizeVehicleStatus(v) === "REJECTED").length;
  const pendingChangesCount = changeRequests.filter((r) => r.status === "PENDING").length;

  const visibleVehicles = vehicles.filter((vehicle) => {
    const s = normalizeVehicleStatus(vehicle);
    if (statusTab === "PENDING" && s !== "PENDING_CARD") return false;
    if (statusTab === "ACTIVE" && s !== "ISSUED") return false;
    if (statusTab === "REVOKED" && s !== "REVOKED") return false;
    if (statusTab === "REJECTED" && s !== "REJECTED") return false;
    if (!query.trim()) return true;
    return `${vehicle.plate} ${tenantName(vehicle.tenantId)} ${vehicle.type} ${vehicle.brand} ${vehicle.cardCode ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

  const visibleChangeRequests = changeRequests.filter((req) => {
    if (!query.trim()) return true;
    return `${req.id} ${tenantName(req.tenantId)} ${req.newVehicle.plate} ${req.newVehicle.brand}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  });

  const handleRejectVehicle = async () => {
    if (!rejectingVehicle || !rejectReason.trim() || !onRejectVehicle || busy) return;
    setBusy(true);
    try {
      await onRejectVehicle(rejectingVehicle.id, rejectReason.trim(), managerStaffId);
      showToast(`Đã từ chối cấp thẻ xe cho ${rejectingVehicle.plate || rejectingVehicle.brand}.`);
      setRejectingVehicle(null);
      setRejectReason("");
      if (viewing?.id === rejectingVehicle.id) setViewing(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể từ chối phương tiện.");
    } finally {
      setBusy(false);
    }
  };

  const handleApproveChange = async (req: VehicleChangeRequest) => {
    if (!onApproveVehicleChangeRequest || busy) return;
    setBusy(true);
    try {
      await onApproveVehicleChangeRequest(req.id, managerStaffId);
      showToast(`Đã chấp thuận yêu cầu đổi xe cho khách ${tenantName(req.tenantId)}.`);
      setViewingChangeRequest(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể duyệt đổi xe.");
    } finally {
      setBusy(false);
    }
  };

  const handleRejectChange = async () => {
    if (!rejectChangeRequestTarget || !rejectChangeReason.trim() || !onRejectVehicleChangeRequest || busy) return;
    setBusy(true);
    try {
      await onRejectVehicleChangeRequest(rejectChangeRequestTarget.id, rejectChangeReason.trim(), managerStaffId);
      showToast(`Đã từ chối yêu cầu đổi xe ${rejectChangeRequestTarget.id}.`);
      setRejectChangeRequestTarget(null);
      setRejectChangeReason("");
      if (viewingChangeRequest?.id === rejectChangeRequestTarget.id) setViewingChangeRequest(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể từ chối yêu cầu đổi xe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Phương tiện"
        title="Quản lý phương tiện hầm xe"
        description="Quản lý biển số, cấp phát mã thẻ từ vật lý, ảnh cà vẹt xe và kiểm soát trật tự an ninh hầm KTX (FR-08)."
      />

      <section className={card}>
        <div className="border-b border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: `Tất cả xe (${vehicles.length})`, highlight: false },
              { id: "PENDING", label: `Chờ cấp thẻ (${pendingCount})`, highlight: pendingCount > 0 },
              { id: "ACTIVE", label: `Đã cấp thẻ (${activeCount})`, highlight: false },
              { id: "CHANGES", label: `Yêu cầu đổi xe (${pendingChangesCount})`, highlight: pendingChangesCount > 0 },
              { id: "REVOKED", label: `Đã thu hồi (${revokedCount})`, highlight: false },
              { id: "REJECTED", label: `Bị từ chối (${rejectedCount})`, highlight: false },
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
            placeholder={
              statusTab === "CHANGES"
                ? "Tìm mã yêu cầu, khách thuê, xe mới..."
                : "Tìm biển số, người thuê, mã thẻ từ..."
            }
          />
        </div>

        {statusTab === "CHANGES" ? (
          /* Table of Vehicle Change Requests */
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Mã yêu cầu</th>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Xe hiện tại</th>
                  <th className={th}>Xe mới đề xuất</th>
                  <th className={th}>Thời gian gửi</th>
                  <th className={th}>Trạng thái</th>
                  <th className={`${th} text-right`}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visibleChangeRequests.map((req) => {
                  const currentV = vehicles.find((v) => v.id === req.currentVehicleId);
                  return (
                    <tr className={rowCls} key={req.id}>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-brand-700">
                        {req.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {tenantName(req.tenantId)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <p className="font-semibold">{currentV?.brand || "—"}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {currentV?.plate || "Không có biển"} · Thẻ: {currentV?.cardCode || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-900">
                        <p className="font-semibold text-brand-700">{req.newVehicle.brand}</p>
                        <p className="font-mono text-[11px] text-slate-600">
                          {req.newVehicle.plate || "Không có biển"} · {req.newVehicle.type} ({req.newVehicle.color})
                        </p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={REQUEST_STATUS_TONES[req.status]}>
                          {REQUEST_STATUS_LABELS[req.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          className="h-8 rounded-sm border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                          onClick={() => setViewingChangeRequest(req)}
                        >
                          Xem & Xử lý
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {visibleChangeRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      Chưa có yêu cầu đổi phương tiện nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Table of Vehicles */
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className={th}>Biển số</th>
                  <th className={th}>Người thuê</th>
                  <th className={th}>Loại xe</th>
                  <th className={th}>Hãng / Màu</th>
                  <th className={th}>Mã thẻ từ</th>
                  <th className={th}>Tình trạng</th>
                  <th className={`${th} text-right`}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visibleVehicles.map((vehicle) => {
                  const s = normalizeVehicleStatus(vehicle);
                  return (
                    <tr className={rowCls} key={vehicle.id}>
                      <td className="px-6 py-4 font-mono text-sm font-bold text-brand-700">
                        {vehicle.plate || "Không có biển"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {tenantName(vehicle.tenantId)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {vehicle.type}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {vehicle.brand} · {vehicle.color}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {vehicle.cardCode ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={CARD_STATUS_TONES[vehicle.cardStatus] ?? "slate"}>
                          {vehicle.cardStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            className="h-8 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            onClick={() => setViewing(vehicle)}
                          >
                            Chi tiết
                          </Button>

                          {s === "PENDING_CARD" && (
                            <>
                              <Button
                                className="h-8 rounded-sm bg-brand-500 px-2.5 text-xs font-semibold text-white hover:bg-brand-600"
                                onClick={() => {
                                  setIssuingVehicle(vehicle);
                                  setCardCodeInput("");
                                }}
                              >
                                Cấp thẻ
                              </Button>
                              <Button
                                className="h-8 rounded-sm border border-danger-200 bg-white px-2 text-xs font-semibold text-danger-600 hover:bg-danger-50"
                                onClick={() => {
                                  setRejectingVehicle(vehicle);
                                  setRejectReason("");
                                }}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {s === "ISSUED" && (
                            <Button
                              className="h-8 rounded-sm border border-warning-200 bg-white px-2 text-xs font-semibold text-warning-700 hover:bg-warning-50"
                              onClick={async () => {
                                if (!managerStaffId) {
                                  showToast("Thao tác quản trị yêu cầu quyền Quản lý đang hoạt động.");
                                  return;
                                }
                                if (!confirm(`Thu hồi thẻ từ ${vehicle.cardCode} của xe ${vehicle.plate}?`)) return;
                                try {
                                  await onRevokeVehicle(vehicle.id, managerStaffId);
                                  showToast(`Đã thu hồi thẻ xe ${vehicle.plate}`);
                                } catch (error) {
                                  showToast(error instanceof Error ? error.message : "Không thể thu hồi thẻ");
                                }
                              }}
                            >
                              Thu hồi
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleVehicles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      Không tìm thấy phương tiện phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Chi tiết phương tiện */}
      {viewing && (
        <Modal
          wide
          title={`Chi tiết phương tiện ${viewing.plate || viewing.brand}`}
          description="Thông tin thẻ xe, phương tiện, người thuê và ảnh cà vẹt xe (FR-08)."
          onClose={() => setViewing(null)}
        >
          <VehicleDetail
            vehicle={viewing}
            tenant={tenants.find((tenant) => tenant.id === viewing.tenantId)}
            onOpenIssue={(v) => {
              setIssuingVehicle(v);
              setCardCodeInput("");
              setViewing(null);
            }}
            onOpenReject={(v) => {
              setRejectingVehicle(v);
              setRejectReason("");
              setViewing(null);
            }}
          />
        </Modal>
      )}

      {/* Modal Cấp thẻ từ gửi xe (FR-08 / BR-10) */}
      {issuingVehicle && (
        <Modal
          title={`Cấp thẻ từ gửi xe · ${issuingVehicle.plate || issuingVehicle.brand}`}
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

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Mã thẻ từ gửi xe vật lý (bắt buộc)
              <input
                className={`${inputCls} font-mono text-sm uppercase`}
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
                className="h-10 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setIssuingVehicle(null)}
              >
                Hủy
              </Button>
              <Button
                className="h-10 rounded-sm bg-brand-500 px-5 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={async () => {
                  if (!managerStaffId) {
                    showToast("Thao tác quản trị yêu cầu quyền Quản lý đang hoạt động.");
                    return;
                  }
                  const code = cardCodeInput.trim().toUpperCase();
                  if (!code) {
                    showToast("Vui lòng nhập mã thẻ từ");
                    return;
                  }
                  if (!vehicles.some((v) => v.id === issuingVehicle.id && normalizeVehicleStatus(v) === "PENDING_CARD")) {
                    showToast("Phương tiện không còn chờ cấp thẻ.");
                    return;
                  }
                  const current = vehicles.find((v) => v.id === issuingVehicle.id);
                  if (
                    current &&
                    current.type !== "Xe đạp" &&
                    current.type !== "Xe đạp điện" &&
                    (!current.plate.trim() || !current.registrationFront || !current.registrationBack)
                  ) {
                    showToast("Phương tiện cần biển số và ảnh giấy đăng ký hai mặt trước khi cấp thẻ.");
                    return;
                  }
                  if (
                    vehicles.some(
                      (v) =>
                        v.id !== issuingVehicle.id &&
                        normalizeVehicleStatus(v) === "ISSUED" &&
                        v.cardCode?.trim().toUpperCase() === code
                    )
                  ) {
                    showToast("Mã thẻ đang được sử dụng bởi phương tiện khác.");
                    return;
                  }
                  try {
                    await onIssueVehicleCard(issuingVehicle.id, code, managerStaffId);
                  } catch (error) {
                    showToast(error instanceof Error ? error.message : "Không thể cấp thẻ");
                    return;
                  }
                  showToast(`Đã cấp thẻ từ ${code} cho xe ${issuingVehicle.plate || issuingVehicle.brand}`);
                  setIssuingVehicle(null);
                }}
              >
                Xác nhận cấp thẻ
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Từ chối cấp thẻ xe lần đầu (C3 / FR-08) */}
      {rejectingVehicle && (
        <Modal
          title={`Từ chối cấp thẻ xe · ${rejectingVehicle.plate || rejectingVehicle.brand}`}
          description="Nhập lý do từ chối gửi tới người thuê."
          onClose={() => setRejectingVehicle(null)}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <p>Khách thuê: <strong>{tenantName(rejectingVehicle.tenantId)}</strong></p>
              <p>Phương tiện: <strong>{rejectingVehicle.brand}</strong> · {rejectingVehicle.type} ({rejectingVehicle.color})</p>
              <p className="font-mono text-slate-600">Biển số: {rejectingVehicle.plate || "Không có"}</p>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Lý do từ chối (bắt buộc)
              <textarea
                className={`${inputCls} h-24 py-2 mt-1`}
                placeholder="VD: Ảnh giấy đăng ký xe bị mờ / Biển số không trùng khớp thông tin khai báo..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </label>
            <p className="text-[11px] text-slate-500">
              * Theo quy định FR-08, Quản lý không cần upload tài liệu minh chứng khi từ chối. Hệ thống sẽ tự động gửi thông báo trong ứng dụng tới người thuê kèm lý do này.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                className="h-10 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setRejectingVehicle(null)}
              >
                Hủy
              </Button>
              <Button
                disabled={busy || !rejectReason.trim()}
                className="h-10 rounded-sm bg-danger-600 px-5 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px] disabled:bg-slate-300"
                onClick={handleRejectVehicle}
              >
                {busy ? "Đang xử lý..." : "Xác nhận từ chối"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Drawer Chi tiết Yêu cầu đổi xe (C5 / FR-08) */}
      {viewingChangeRequest && (
        <Drawer
          title={`Yêu cầu đổi xe ${viewingChangeRequest.id}`}
          subtitle={`Người thuê: ${tenantName(viewingChangeRequest.tenantId)}`}
          onClose={() => setViewingChangeRequest(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">
                Ngày gửi: {new Date(viewingChangeRequest.createdAt).toLocaleString("vi-VN")}
              </span>
              <Badge tone={REQUEST_STATUS_TONES[viewingChangeRequest.status]}>
                {REQUEST_STATUS_LABELS[viewingChangeRequest.status]}
              </Badge>
            </div>

            {/* Comparison Grid: Old Vehicle vs Proposed New Vehicle */}
            <div className="grid gap-4 text-xs">
              {/* Old Vehicle */}
              {(() => {
                const oldV = vehicles.find((v) => v.id === viewingChangeRequest.currentVehicleId);
                return (
                  <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-slate-900 uppercase">1. Phương tiện hiện tại</span>
                      <span className="rounded-sm bg-success-50 border border-success-200 px-2 py-0.5 font-mono text-[11px] font-bold text-success-800">
                        Thẻ đang dùng: {oldV?.cardCode || "—"}
                      </span>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <dt className="text-slate-500">Biển số</dt>
                        <dd className="font-mono font-bold text-slate-900">{oldV?.plate || "Không có"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Phân loại</dt>
                        <dd className="font-semibold">{oldV?.type || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Hãng & dòng xe</dt>
                        <dd className="font-semibold">{oldV?.brand || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Màu sơn</dt>
                        <dd className="font-semibold">{oldV?.color || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })()}

              {/* Proposed New Vehicle */}
              <div className="rounded-sm border border-brand-200 bg-brand-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-brand-900 uppercase">2. Phương tiện mới đề xuất</span>
                  <span className="rounded-sm bg-brand-100 text-brand-800 px-2 py-0.5 text-[11px] font-semibold">
                    Đề nghị giữ thẻ cũ
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 pt-1 border-t border-brand-100">
                  <div>
                    <dt className="text-slate-500">Biển số mới</dt>
                    <dd className="font-mono font-bold text-brand-700">
                      {viewingChangeRequest.newVehicle.plate || "Không có"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phân loại</dt>
                    <dd className="font-semibold text-slate-900">{viewingChangeRequest.newVehicle.type}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Hãng & dòng xe</dt>
                    <dd className="font-semibold text-slate-900">{viewingChangeRequest.newVehicle.brand}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Màu sơn</dt>
                    <dd className="font-semibold text-slate-900">{viewingChangeRequest.newVehicle.color}</dd>
                  </div>
                </dl>

                {/* Papers of new vehicle */}
                <div className="pt-2 border-t border-brand-100">
                  <p className="font-semibold text-slate-700 mb-2">Ảnh giấy đăng ký xe mới:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Mặt trước</p>
                      {viewingChangeRequest.newVehicle.registrationFront ? (
                        <img
                          src={viewingChangeRequest.newVehicle.registrationFront}
                          alt="Mặt trước xe mới"
                          className="h-24 w-full object-contain rounded-sm border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="h-24 rounded-sm border border-dashed border-slate-200 bg-white flex items-center justify-center text-[10px] text-slate-400">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Mặt sau</p>
                      {viewingChangeRequest.newVehicle.registrationBack ? (
                        <img
                          src={viewingChangeRequest.newVehicle.registrationBack}
                          alt="Mặt sau xe mới"
                          className="h-24 w-full object-contain rounded-sm border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="h-24 rounded-sm border border-dashed border-slate-200 bg-white flex items-center justify-center text-[10px] text-slate-400">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* If Rejected: Show reason */}
            {viewingChangeRequest.status === "REJECTED" && (
              <div className="rounded-sm border border-danger-200 bg-danger-50 p-3 text-xs text-danger-800 space-y-1">
                <p className="font-bold">Yêu cầu đã bị từ chối</p>
                {viewingChangeRequest.rejectionReason && (
                  <p>Lý do: {viewingChangeRequest.rejectionReason}</p>
                )}
                {viewingChangeRequest.processedAt && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Thời điểm: {new Date(viewingChangeRequest.processedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            )}

            {/* If Approved: Show result */}
            {viewingChangeRequest.status === "APPROVED" && (
              <div className="rounded-sm border border-success-200 bg-success-50 p-3 text-xs text-success-800 space-y-1">
                <p className="font-bold">Yêu cầu đã được phê duyệt</p>
                <p>Xe mới đã được cấp và chuyển giao thẻ từ thành công. Xe cũ được lưu trữ vào lịch sử (REPLACED).</p>
                {viewingChangeRequest.processedAt && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Thời điểm duyệt: {new Date(viewingChangeRequest.processedAt).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons if PENDING */}
            {viewingChangeRequest.status === "PENDING" && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-500">
                  * Khi duyệt, xe mới sẽ tiếp tục sử dụng chính mã thẻ vật lý của xe cũ; xe cũ chuyển sang trạng thái đã thay thế (REPLACED).
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={busy}
                    className="flex-1 h-10 rounded-sm border border-danger-200 bg-white text-xs font-semibold text-danger-600 hover:bg-danger-50"
                    onClick={() => {
                      setRejectChangeRequestTarget(viewingChangeRequest);
                      setRejectChangeReason("");
                    }}
                  >
                    Từ chối yêu cầu
                  </Button>
                  <Button
                    disabled={busy}
                    className="flex-1 h-10 rounded-sm bg-brand-500 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                    onClick={() => void handleApproveChange(viewingChangeRequest)}
                  >
                    {busy ? "Đang xử lý..." : "Chấp thuận đổi xe"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Modal Từ chối yêu cầu đổi xe */}
      {rejectChangeRequestTarget && (
        <Modal
          title={`Từ chối yêu cầu đổi xe · ${rejectChangeRequestTarget.id}`}
          description={`Người thuê: ${tenantName(rejectChangeRequestTarget.tenantId)}`}
          onClose={() => setRejectChangeRequestTarget(null)}
        >
          <div className="space-y-4 p-6">
            <p className="text-xs text-slate-600">
              Nhập lý do từ chối yêu cầu đổi xe sang phương tiện <strong>{rejectChangeRequestTarget.newVehicle.brand}</strong> ({rejectChangeRequestTarget.newVehicle.plate || "Không có biển"}). Xe hiện tại của khách thuê vẫn giữ nguyên hiệu lực.
            </p>

            <label className="block text-xs font-semibold text-slate-700">
              Lý do từ chối (bắt buộc)
              <textarea
                className={`${inputCls} h-24 py-2 mt-1`}
                placeholder="VD: Giấy tờ xe mới không hợp lệ / Biển số không trùng khớp..."
                value={rejectChangeReason}
                onChange={(e) => setRejectChangeReason(e.target.value)}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                className="h-10 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setRejectChangeRequestTarget(null)}
              >
                Hủy
              </Button>
              <Button
                disabled={busy || !rejectChangeReason.trim()}
                className="h-10 rounded-sm bg-danger-600 px-5 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px] disabled:bg-slate-300"
                onClick={handleRejectChange}
              >
                {busy ? "Đang xử lý..." : "Xác nhận từ chối"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
