import { useState } from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import type { TenantVehicle } from "./tenantConstants.tsx";

export function TenantVehiclesPage({
  vehicles,
  onCreateVehicle,
  showToast,
  tenantId,
  canRegister,
}: {
  vehicles: TenantVehicle[];
  onCreateVehicle: (vehicle: TenantVehicle) => Promise<void>;
  showToast: (message: string) => void;
  tenantId: string | undefined;
  canRegister: boolean;
}) {
  const [open, setOpen] = useState(false);
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
      brand.trim() && color.trim(),
  );

  const activeVehicles = vehicles.filter((v) => v.cardStatus !== "Đã thu hồi");
  const hasVehicle = activeVehicles.length >= 1;
  const registrationAllowed = canRegister && Boolean(tenantId);

  const submit = async () => {
    if (!valid || hasVehicle || !registrationAllowed || !tenantId) {
      showToast(hasVehicle ? "Mỗi khách thuê chỉ được đăng ký tối đa 01 phương tiện" : "Không thể đăng ký khi chưa xác định người thuê đang cư trú");
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

  return (
    <>
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-brand-700">
            STU-08 · PHƯƠNG TIỆN
          </div>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">
            Quản lý phương tiện cá nhân
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Khai báo phương tiện và giấy đăng ký theo loại xe để Ban quản lý cấp thẻ giữ xe.
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
              {hasVehicle ? "Tối đa 01 xe chưa thu hồi/khách thuê" : "Chỉ khách đang cư trú được đăng ký xe."}
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
            <span className="font-semibold">Hạn mức gửi xe KTX:</span> Bạn đã đăng ký 01 phương tiện gửi hầm (miễn phí trọn gói 100% theo tiền phòng). Nếu cần đổi xe hoặc cập nhật lại biển số mới, vui lòng liên hệ trực tiếp Ban Quản lý để thu hồi thẻ xe cũ.
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
          {registrationAllowed && <Button
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-sm bg-brand-500 px-4 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => setOpen(true)}
          >
            + Khai báo phương tiện
          </Button>}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {vehicles.map((vehicle) => (
          <article
            className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs"
            key={vehicle.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="rounded-sm border border-slate-800 bg-white px-3 py-1 font-mono text-lg font-bold tracking-wide text-slate-900">
                {vehicle.plate || "Không có biển số"}
              </div>
              <span
                className={`status-label ${
                  vehicle.cardStatus === "Đã cấp thẻ"
                    ? "status-label-success"
                    : vehicle.cardStatus === "Đã thu hồi" ? "status-label-slate" : "status-label-warning"
                }`}
              >
                {vehicle.cardStatus}
                {vehicle.cardCode ? ` · ${vehicle.cardCode}` : ""}
              </span>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Hãng & dòng xe</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {vehicle.brand}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Màu sơn</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {vehicle.color}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Phân loại</dt>
                <dd className="mt-1">
                  <span className="status-label status-label-brand">
                    {vehicle.type}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Cà vẹt xe</dt>
                <dd className="mt-1 flex items-center gap-2 font-semibold text-brand-700">
                  <Icon name="image" className="size-4" /> {vehicle.registration ?? "Chưa có"}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

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
              <legend className="mb-2 text-sm font-semibold text-slate-700">
                Phân loại xe
              </legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "Xe tay ga",
                    "Xe số",
                    "Xe máy điện",
                    "Xe đạp điện",
                    "Xe đạp",
                  ] as const
                ).map((item) => (
                  <Button
                    key={item}
                    className={`h-8 rounded-sm border px-3 text-xs font-semibold active:translate-y-[1px] ${
                      type === item
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    onClick={() => setType(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Hãng & dòng xe
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="Honda Air Blade"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Màu sơn
                <input
                  className="focus-ring h-10 rounded-sm border border-slate-200 px-3 outline-none focus:border-brand-500"
                  placeholder="Đen nhám"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Mặt trước cà vẹt", front, setFront],
                  ["Mặt sau cà vẹt", back, setBack],
                ] as const
              ).map(([label, preview, setter]) => (
                <label
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm border border-dashed border-brand-200 bg-brand-50/50 p-3 text-center text-brand-700"
                  key={label}
                >
                  {preview ? (
                    <img
                      className="h-24 w-full rounded-sm object-cover"
                      src={preview}
                      alt={label}
                    />
                  ) : (
                    <>
                      <Icon name="camera" className="size-6" />
                      <span className="text-xs font-semibold">{label}</span>
                      <span className="text-[11px] text-slate-500">
                        Bấm để chọn hoặc chụp ảnh
                      </span>
                    </>
                  )}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setter(typeof reader.result === "string" ? reader.result : "");
                        reader.onerror = () => showToast("Không thể đọc ảnh giấy đăng ký.");
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ))}
            </div>
            <p className="rounded-sm bg-info-50 p-2.5 text-xs leading-5 text-info-700 border border-info-100">
              {requiresRegistration ? "Cần đủ hai mặt giấy đăng ký." : "Ảnh giấy đăng ký không bắt buộc."} Ảnh chỉ được lưu trong dữ liệu demo, không phải lưu trữ private của backend.
            </p>
            <div className="flex gap-2">
              <Button
                className="h-10 flex-1 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
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
    </>
  );
}
