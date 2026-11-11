import { useState } from "react";
import { Button, Drawer, Icon, Modal } from "../../components/common/index.ts";
import {
  normalizeVehicleStatus,
  type TenantVehicle,
  type VehicleChangeRequest,
  type VehicleStatus,
} from "../../types/tenant.ts";

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không đọc được ảnh."));
    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.readAsDataURL(file);
  });
}

const CHANGE_STATUS_LABELS: Record<VehicleChangeRequest["status"], string> = {
  PENDING: "Đang chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

const CHANGE_STATUS_TONES: Record<VehicleChangeRequest["status"], string> = {
  PENDING: "status-label-warning",
  APPROVED: "status-label-success",
  REJECTED: "status-label-danger",
  CANCELLED: "status-label-slate",
};

export function TenantVehiclesPage({
  vehicles,
  vehicleChangeRequests = [],
  onCreateVehicle,
  onRequestVehicleChange,
  showToast,
  tenantId,
  canRegister,
}: {
  vehicles: TenantVehicle[];
  vehicleChangeRequests?: VehicleChangeRequest[];
  onCreateVehicle: (vehicle: TenantVehicle) => Promise<void>;
  onRequestVehicleChange?: (input: {
    tenantId: string;
    currentVehicleId: string;
    newVehicle: {
      plate: string;
      type: TenantVehicle["type"];
      brand: string;
      color: string;
      registrationFront?: string;
      registrationBack?: string;
    };
  }) => Promise<void>;
  showToast: (message: string) => void;
  tenantId: string | undefined;
  canRegister: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<TenantVehicle | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // New registration form state
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<TenantVehicle["type"]>("Xe tay ga");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const requiresRegistration = type !== "Xe đạp" && type !== "Xe đạp điện";
  const valid = Boolean(
    (!plate.trim() || /^[0-9A-Z .-]{6,14}$/.test(plate.trim().toUpperCase())) &&
      (!requiresRegistration || (plate.trim() && front && back)) &&
      brand.trim() &&
      color.trim(),
  );

  // Vehicle change request modal state
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changePlate, setChangePlate] = useState("");
  const [changeType, setChangeType] = useState<TenantVehicle["type"]>("Xe tay ga");
  const [changeBrand, setChangeBrand] = useState("");
  const [changeColor, setChangeColor] = useState("");
  const [changeFront, setChangeFront] = useState("");
  const [changeBack, setChangeBack] = useState("");
  const [changeBusy, setChangeBusy] = useState(false);
  const [changeError, setChangeError] = useState("");

  const changeRequiresReg = changeType !== "Xe đạp" && changeType !== "Xe đạp điện";
  const changeValid = Boolean(
    (!changePlate.trim() || /^[0-9A-Z .-]{6,14}$/.test(changePlate.trim().toUpperCase())) &&
      (!changeRequiresReg || (changePlate.trim() && changeFront && changeBack)) &&
      changeBrand.trim() &&
      changeColor.trim(),
  );

  // Quota check: only PENDING_CARD and ISSUED count towards active vehicle quota
  const activeVehicles = vehicles.filter((v) => {
    const s = normalizeVehicleStatus(v);
    return s === "PENDING_CARD" || s === "ISSUED";
  });
  const hasVehicle = activeVehicles.length >= 1;
  const registrationAllowed = canRegister && Boolean(tenantId);

  const pendingChangeRequest = vehicleChangeRequests.find(
    (r) => r.tenantId === tenantId && r.status === "PENDING",
  );

  const submit = async () => {
    if (!valid || hasVehicle || !registrationAllowed || !tenantId) {
      showToast(
        hasVehicle
          ? "Mỗi khách thuê chỉ được đăng ký tối đa 01 phương tiện"
          : "Không thể đăng ký khi chưa xác định người thuê đang cư trú",
      );
      return;
    }
    try {
      await onCreateVehicle({
        id: `XE-${crypto.randomUUID()}`,
        tenantId,
        plate: plate.trim().toUpperCase(),
        type,
        brand: brand.trim(),
        color: color.trim(),
        registration: front && back ? "Đủ 2 mặt" : "Chưa có",
        registrationFront: front || undefined,
        registrationBack: back || undefined,
        cardStatus: "Chưa cấp thẻ",
        status: "Chờ duyệt",
        vehicleStatus: "PENDING_CARD",
        registeredAt: new Date().toISOString(),
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể đăng ký phương tiện");
      return;
    }
    setOpen(false);
    setPlate("");
    setBrand("");
    setColor("");
    setFront("");
    setBack("");
    showToast("Đã lưu đăng ký xe trong dữ liệu demo.");
  };

  const submitChangeRequest = async () => {
    if (!selectedVehicle || !onRequestVehicleChange || !tenantId || changeBusy) return;
    setChangeBusy(true);
    setChangeError("");
    try {
      await onRequestVehicleChange({
        tenantId,
        currentVehicleId: selectedVehicle.id,
        newVehicle: {
          plate: changePlate.trim().toUpperCase(),
          type: changeType,
          brand: changeBrand.trim(),
          color: changeColor.trim(),
          registrationFront: changeFront || undefined,
          registrationBack: changeBack || undefined,
        },
      });
      showToast("Đã gửi yêu cầu đổi phương tiện tới Ban Quản lý.");
      setChangeModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể gửi yêu cầu đổi xe.";
      setChangeError(msg);
      showToast(msg);
    } finally {
      setChangeBusy(false);
    }
  };

  const getVehicleBadgeTone = (s: VehicleStatus) => {
    switch (s) {
      case "ISSUED":
        return "status-label-success";
      case "PENDING_CARD":
        return "status-label-warning";
      case "REJECTED":
        return "status-label-danger";
      case "REVOKED":
      case "REPLACED":
      case "CANCELLED":
      default:
        return "status-label-slate";
    }
  };

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700">STU-08 · PHƯƠNG TIỆN</div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">
            Quản lý phương tiện cá nhân
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Khai báo phương tiện và giấy đăng ký theo loại xe để Ban quản lý cấp thẻ giữ xe (FR-08).
          </p>
        </div>
        {hasVehicle || !registrationAllowed ? (
          <div className="flex flex-col items-end gap-1">
            <Button
              className="h-10 rounded-sm border border-slate-200 bg-slate-100 px-4 text-xs font-semibold text-slate-400 cursor-not-allowed"
              disabled
              title="Mỗi khách thuê chỉ được đăng ký tối đa 01 phương tiện gửi hầm KTX"
            >
              {hasVehicle ? "Đã đủ hạn mức (1 xe/người)" : "Không thể đăng ký xe"}
            </Button>
            <span className="text-[11px] text-slate-500">
              {hasVehicle ? "Tối đa 01 xe đang sử dụng hoặc chờ cấp thẻ" : "Chỉ khách đang cư trú được đăng ký xe."}
            </span>
          </div>
        ) : (
          <Button
            className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => setOpen(true)}
          >
            + Đăng ký xe mới
          </Button>
        )}
      </section>

      {hasVehicle && (
        <div className="mb-6 flex items-start gap-3 rounded-sm border border-brand-100 bg-brand-50/70 p-4 text-xs text-brand-900 leading-relaxed">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <div>
            <span className="font-semibold">Hạn mức gửi xe KTX:</span> Bạn đã đăng ký 01 phương tiện gửi hầm (miễn phí trọn gói 100% theo tiền phòng). Nếu có nhu cầu đổi sang xe khác, bạn có thể chọn xe bên dưới và bấm <strong>“Yêu cầu đổi xe”</strong> để tiếp tục sử dụng lại thẻ từ hiện tại.
          </div>
        </div>
      )}

      {vehicles.length === 0 && (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-sm bg-brand-50 text-brand-600">
            <Icon name="clipboard" className="size-6" />
          </span>
          <h3 className="mt-3 font-heading text-sm font-bold text-slate-900">
            Chưa có phương tiện nào
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Mỗi khách thuê được đăng ký miễn phí 01 xe máy hoặc xe điện gửi hầm KTX. Bấm nút phía trên để khai báo thông tin xe.
          </p>
          {registrationAllowed && (
            <Button
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-sm bg-brand-500 px-4 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => setOpen(true)}
            >
              + Khai báo phương tiện
            </Button>
          )}
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {vehicles.map((vehicle) => {
          const s = normalizeVehicleStatus(vehicle);
          return (
            <button
              type="button"
              key={vehicle.id}
              aria-label={`Xem chi tiết phương tiện ${vehicle.plate || vehicle.brand || vehicle.type}`}
              className="focus-ring block w-full text-left rounded-sm border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-500 transition-colors cursor-pointer active:translate-y-[1px]"
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="rounded-sm border border-slate-800 bg-white px-3 py-1 font-mono text-lg font-bold tracking-wide text-slate-900">
                  {vehicle.plate || "Không có biển số"}
                </div>
                <span className={`status-label ${getVehicleBadgeTone(s)}`}>
                  {vehicle.cardStatus}
                  {vehicle.cardCode ? ` · ${vehicle.cardCode}` : ""}
                </span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Hãng & dòng xe</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{vehicle.brand}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Màu sơn</dt>
                  <dd className="mt-1 font-semibold text-slate-900">{vehicle.color}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Phân loại</dt>
                  <dd className="mt-1">
                    <span className="status-label status-label-brand">{vehicle.type}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Cà vẹt xe</dt>
                  <dd className="mt-1 flex items-center gap-2 font-semibold text-brand-700">
                    <Icon name="image" className="size-4" /> {vehicle.registration ?? "Chưa có"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
                <span>Bấm xem chi tiết & giấy tờ xe</span>
                <Icon name="chevron" className="size-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Vehicle Change Requests History Section */}
      {vehicleChangeRequests.length > 0 && (
        <section className="mt-8 rounded-sm border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="font-heading text-lg font-bold text-slate-900 mb-2">
            Lịch sử yêu cầu đổi phương tiện (FR-08)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Theo dõi tiến trình xét duyệt đổi xe giữ thẻ từ của Ban Quản lý.
          </p>
          <div className="divide-y divide-slate-100">
            {vehicleChangeRequests.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{req.id}</span>
                    <span className={`status-label ${CHANGE_STATUS_TONES[req.status]}`}>
                      {CHANGE_STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">
                    Đổi sang: <strong className="text-brand-700">{req.newVehicle.brand}</strong> ({req.newVehicle.plate || "Không có biển"}) · {req.newVehicle.type} ({req.newVehicle.color})
                  </p>
                  {req.rejectionReason && (
                    <p className="mt-1 text-danger-600">Lý do từ chối: {req.rejectionReason}</p>
                  )}
                </div>
                <div className="font-mono text-slate-400 text-[11px] shrink-0">
                  Gửi: {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal Khai báo xe mới ban đầu */}
      {open && (
        <Modal
          title="Khai báo phương tiện mới"
          description="Xe tay ga, xe số và xe máy điện có đăng ký cần biển số và ảnh giấy đăng ký hai mặt."
          onClose={() => setOpen(false)}
        >
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Biển số {requiresRegistration ? "(bắt buộc)" : "(không bắt buộc)"}
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono uppercase outline-none focus:border-brand-500"
                placeholder="VD: 59-X3 789.12"
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase())}
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-700">Phân loại xe</legend>
              <div className="flex flex-wrap gap-2">
                {(["Xe tay ga", "Xe số", "Xe máy điện", "Xe đạp điện", "Xe đạp"] as const).map(
                  (item) => (
                    <Button
                      key={item}
                      className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${
                        type === item
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setType(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Hãng / Dòng xe (bắt buộc)
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="VD: Honda Air Blade"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Màu sắc (bắt buộc)
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="VD: Đen nhám"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
              </label>
            </div>
            {requiresRegistration && (
              <div className="space-y-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-800">
                  Ảnh giấy đăng ký xe (Cà vẹt 2 mặt bắt buộc)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Mặt trước
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setFront(await readImage(f));
                      }}
                    />
                    {front && (
                      <span className="text-[11px] text-success-600 font-semibold">Đã tải ảnh mặt trước</span>
                    )}
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Mặt sau
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setBack(await readImage(f));
                      }}
                    />
                    {back && (
                      <span className="text-[11px] text-success-600 font-semibold">Đã tải ảnh mặt sau</span>
                    )}
                  </label>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                className="h-10 flex-[1.5] rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-300"
                disabled={!valid}
                onClick={submit}
              >
                Gửi thông tin đăng ký xe
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Yêu cầu đổi phương tiện giữ thẻ (C4 / FR-08) */}
      {changeModalOpen && selectedVehicle && (
        <Modal
          title={`Yêu cầu đổi phương tiện · Thẻ ${selectedVehicle.cardCode}`}
          description="Sau khi được duyệt, phương tiện mới sẽ tiếp tục sử dụng mã thẻ này."
          onClose={() => setChangeModalOpen(false)}
        >
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
            {changeError && (
              <div className="rounded-sm border border-danger-200 bg-danger-50 p-3 text-xs text-danger-700">
                {changeError}
              </div>
            )}

            <div className="rounded-sm border border-brand-100 bg-brand-50 p-3 text-xs text-brand-900 leading-relaxed">
              <p>
                <strong>Quy tắc đổi xe (FR-08):</strong> Phương tiện mới sẽ dùng chính mã thẻ vật lý{" "}
                <strong className="font-mono text-brand-700">{selectedVehicle.cardCode}</strong> của xe hiện tại. Bạn không cần làm thủ tục thu hồi hay đổi thẻ mới. Trong thời gian chờ duyệt, xe cũ vẫn ra vào hầm bình thường.
              </p>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-slate-700">Phân loại xe mới</legend>
              <div className="flex flex-wrap gap-2">
                {(["Xe tay ga", "Xe số", "Xe máy điện", "Xe đạp điện", "Xe đạp"] as const).map(
                  (item) => (
                    <Button
                      key={item}
                      className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${
                        changeType === item
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      onClick={() => setChangeType(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              </div>
            </fieldset>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Biển số xe mới {changeRequiresReg ? "(bắt buộc)" : "(không bắt buộc)"}
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono uppercase outline-none focus:border-brand-500"
                placeholder="VD: 59-X3 999.88"
                value={changePlate}
                onChange={(e) => setChangePlate(e.target.value.toUpperCase())}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Hãng / Dòng xe mới (bắt buộc)
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="VD: Yamaha Grande"
                  value={changeBrand}
                  onChange={(e) => setChangeBrand(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Màu sắc xe mới (bắt buộc)
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="VD: Trắng ngọc trai"
                  value={changeColor}
                  onChange={(e) => setChangeColor(e.target.value)}
                />
              </label>
            </div>

            {changeRequiresReg && (
              <div className="space-y-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-800">
                  Ảnh giấy đăng ký xe mới (Cà vẹt 2 mặt bắt buộc)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Mặt trước
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setChangeFront(await readImage(f));
                      }}
                    />
                    {changeFront && (
                      <span className="text-[11px] text-success-600 font-semibold">Đã tải ảnh</span>
                    )}
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-600">
                    Mặt sau
                    <input
                      type="file"
                      accept="image/*"
                      className="text-xs"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setChangeBack(await readImage(f));
                      }}
                    />
                    {changeBack && (
                      <span className="text-[11px] text-success-600 font-semibold">Đã tải ảnh</span>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setChangeModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                disabled={!changeValid || changeBusy}
                className="h-10 flex-[1.5] rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-300"
                onClick={submitChangeRequest}
              >
                {changeBusy ? "Đang gửi..." : "Gửi yêu cầu đổi xe"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vehicle Detail Drawer */}
      {selectedVehicle && (
        <Drawer
          title={selectedVehicle.plate ? `Xe ${selectedVehicle.plate}` : `Phương tiện ${selectedVehicle.type}`}
          subtitle={`${selectedVehicle.brand} · Màu ${selectedVehicle.color}`}
          onClose={() => setSelectedVehicle(null)}
        >
          {(() => {
            const s = normalizeVehicleStatus(selectedVehicle);
            return (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`status-label ${getVehicleBadgeTone(s)}`}>
                    {selectedVehicle.cardStatus}
                  </span>
                  <span className="status-label status-label-brand">{selectedVehicle.type}</span>
                </div>

                {/* If rejected */}
                {s === "REJECTED" && (
                  <div className="rounded-sm border border-danger-200 bg-danger-50/70 p-3.5 text-xs text-danger-800 space-y-1">
                    <p className="font-bold">Hồ sơ đăng ký xe đã bị từ chối</p>
                    {selectedVehicle.rejectionReason && (
                      <p className="text-danger-900">Lý do: {selectedVehicle.rejectionReason}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hồ sơ bị từ chối không chiếm hạn mức giữ xe. Bạn có thể bấm "Đăng ký xe mới" để nộp lại.
                    </p>
                  </div>
                )}

                {/* If replaced */}
                {s === "REPLACED" && (
                  <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
                    <p className="font-bold">Phương tiện đã được thay thế (REPLACED)</p>
                    <p>Mã thẻ vật lý ({selectedVehicle.cardCode}) đã được chuyển giao cho phương tiện mới của bạn.</p>
                  </div>
                )}

                {/* Physical card status */}
                <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Thẻ giữ xe vật lý
                  </h4>
                  {s === "ISSUED" && selectedVehicle.cardCode ? (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-600">Mã thẻ gửi xe đã kích hoạt:</span>
                      <span className="rounded-sm bg-success-50 border border-success-200 px-2.5 py-1 font-mono text-sm font-bold text-success-800">
                        {selectedVehicle.cardCode}
                      </span>
                    </div>
                  ) : s === "REVOKED" ? (
                    <div className="mt-1 text-xs text-slate-600">
                      <p>Thẻ xe vật lý đã được thu hồi và vô hiệu hóa.</p>
                      {selectedVehicle.cardCode && (
                        <p className="mt-1 font-mono text-[11px] text-slate-500">
                          Mã thẻ cũ đã lưu: {selectedVehicle.cardCode}
                        </p>
                      )}
                    </div>
                  ) : s === "REJECTED" ? (
                    <p className="mt-1 text-xs text-slate-500">Chưa cấp thẻ (hồ sơ bị từ chối).</p>
                  ) : (
                    <p className="mt-1 text-xs text-warning-700 font-medium">
                      Hồ sơ đang chờ Ban Quản lý duyệt và bàn giao thẻ gửi xe vật lý.
                    </p>
                  )}
                </div>

                {/* Specifications DL */}
                <dl className="divide-y divide-slate-100 rounded-sm border border-slate-200 text-xs">
                  {[
                    ["Biển số xe", selectedVehicle.plate || "Không có biển số"],
                    ["Loại phương tiện", selectedVehicle.type],
                    ["Hãng & dòng xe", selectedVehicle.brand],
                    ["Màu sơn", selectedVehicle.color],
                    ["Tình trạng hồ sơ", selectedVehicle.cardStatus],
                    ...(selectedVehicle.registeredAt
                      ? [["Thời gian khai báo", new Date(selectedVehicle.registeredAt).toLocaleDateString("vi-VN")]]
                      : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-3 py-2.5">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="font-semibold text-slate-900">{v}</dd>
                    </div>
                  ))}
                </dl>

                {/* Registration Papers Photos */}
                <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Ảnh giấy đăng ký xe (Cà vẹt)
                  </h4>
                  {selectedVehicle.type === "Xe đạp" || selectedVehicle.type === "Xe đạp điện" ? (
                    <p className="text-xs text-slate-500 italic">
                      Loại xe này không yêu cầu cung cấp giấy đăng ký xe theo quy định.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-600 mb-1">Mặt trước</p>
                        {selectedVehicle.registrationFront ? (
                          <button
                            type="button"
                            className="group relative block w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100 hover:border-brand-500"
                            onClick={() =>
                              setPreviewPhoto({
                                url: selectedVehicle.registrationFront!,
                                title: `Cà vẹt xe mặt trước (${selectedVehicle.plate || selectedVehicle.brand})`,
                              })
                            }
                          >
                            <img
                              src={selectedVehicle.registrationFront}
                              alt="Mặt trước cà vẹt"
                              className="h-28 w-full object-contain mx-auto"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                              Xem ảnh
                            </div>
                          </button>
                        ) : (
                          <div className="h-28 rounded-sm border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400 p-2 text-center">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-600 mb-1">Mặt sau</p>
                        {selectedVehicle.registrationBack ? (
                          <button
                            type="button"
                            className="group relative block w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100 hover:border-brand-500"
                            onClick={() =>
                              setPreviewPhoto({
                                url: selectedVehicle.registrationBack!,
                                title: `Cà vẹt xe mặt sau (${selectedVehicle.plate || selectedVehicle.brand})`,
                              })
                            }
                          >
                            <img
                              src={selectedVehicle.registrationBack}
                              alt="Mặt sau cà vẹt"
                              className="h-28 w-full object-contain mx-auto"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                              Xem ảnh
                            </div>
                          </button>
                        ) : (
                          <div className="h-28 rounded-sm border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400 p-2 text-center">
                            Chưa có ảnh
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* C4 Action Slot: Vehicle Change Request */}
                {s === "ISSUED" && canRegister && (
                  <div className="rounded-sm border border-brand-200 bg-brand-50/50 p-4 text-xs space-y-2.5">
                    <span className="font-heading font-bold text-slate-900 uppercase">
                      Nhu cầu đổi xe mới giữ nguyên thẻ (FR-08)
                    </span>
                    {pendingChangeRequest ? (
                      <div className="rounded-sm bg-warning-50 border border-warning-200 p-3 text-warning-900 space-y-1">
                        <p className="font-bold">Đang có yêu cầu đổi xe chờ Quản lý duyệt</p>
                        <p>
                          Xe mới đề xuất: <strong>{pendingChangeRequest.newVehicle.brand}</strong> (
                          {pendingChangeRequest.newVehicle.plate || "Không có biển"})
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Xe hiện tại ({selectedVehicle.plate || selectedVehicle.brand}) và mã thẻ{" "}
                          <strong className="font-mono text-brand-700">{selectedVehicle.cardCode}</strong> vẫn hoạt động bình thường.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-600 leading-relaxed">
                          Bạn có thể gửi yêu cầu đổi sang phương tiện khác. Sau khi Ban Quản lý duyệt, bạn tiếp tục dùng thẻ giữ xe vật lý hiện tại ({selectedVehicle.cardCode}).
                        </p>
                        <Button
                          className="w-full h-10 rounded-sm bg-brand-500 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                          onClick={() => {
                            setChangeType("Xe tay ga");
                            setChangePlate("");
                            setChangeBrand("");
                            setChangeColor("");
                            setChangeFront("");
                            setChangeBack("");
                            setChangeError("");
                            setChangeModalOpen(true);
                          }}
                        >
                          Yêu cầu đổi xe (giữ nguyên thẻ)
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    label="Đóng chi tiết"
                    className="h-10 w-full rounded-sm border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    Đóng chi tiết
                  </Button>
                </div>
              </div>
            );
          })()}
        </Drawer>
      )}

      {/* Large Image Preview Modal */}
      {previewPhoto && (
        <Modal
          title={previewPhoto.title}
          onClose={() => setPreviewPhoto(null)}
          wide
        >
          <div className="p-6 text-center">
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[70vh] mx-auto rounded-sm border border-slate-200 object-contain shadow-xs"
            />
            <div className="mt-4 flex justify-center">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setPreviewPhoto(null)}
              >
                Đóng xem ảnh
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
