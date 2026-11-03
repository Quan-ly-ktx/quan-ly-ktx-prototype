import { useState, useEffect } from "react";
import { Button, Icon, Modal } from "../../components/common/index.ts";
import type { TenantVehicle } from "./studentConstants.tsx";

export function TenantVehiclesPage({
  vehicles,
  onVehiclesChange,
  showToast,
}: {
  vehicles: TenantVehicle[];
  onVehiclesChange: (vehicles: TenantVehicle[]) => void;
  showToast: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [type, setType] = useState<TenantVehicle["type"]>("Xe tay ga");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const valid = Boolean(
    /^[0-9A-Z .-]{8,14}$/.test(plate.trim().toUpperCase()) &&
      brand.trim() &&
      color.trim() &&
      front &&
      back,
  );

  useEffect(() => {
    return () => {
      if (front) URL.revokeObjectURL(front);
      if (back) URL.revokeObjectURL(back);
    };
  }, [front, back]);

  const submit = () => {
    if (!valid) return;
    onVehiclesChange([
      {
        id: `XE-${String(vehicles.length + 1).padStart(3, "0")}`,
        plate: plate.trim().toUpperCase(),
        type,
        brand: brand.trim(),
        color: color.trim(),
        status: "Chờ duyệt",
      },
      ...vehicles,
    ]);
    setOpen(false);
    setPlate("");
    setBrand("");
    setColor("");
    setFront("");
    setBack("");
    showToast("Đã gửi đăng ký xe máy thành công!");
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
            Khai báo xe máy và tải ảnh cà vẹt để Ban quản lý đối soát, cấp thẻ
            giữ xe.
          </p>
        </div>
        <Button
          className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
          onClick={() => setOpen(true)}
        >
          Đăng ký xe mới
        </Button>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {vehicles.map((vehicle) => (
          <article
            className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs"
            key={vehicle.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="rounded-sm border border-slate-800 bg-white px-3 py-1 font-mono text-lg font-bold tracking-wide text-slate-900">
                {vehicle.plate}
              </div>
              <span
                className={`status-label ${
                  vehicle.status === "Đã cấp thẻ xe"
                    ? "status-label-success"
                    : "status-label-warning"
                }`}
              >
                {vehicle.status}
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
                  <Icon name="image" className="size-4" /> Đủ 2 mặt
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {open && (
        <Modal
          title="Khai báo xe máy mới"
          description="Cung cấp đủ thông tin và ảnh cà vẹt hai mặt để được xét duyệt."
          onClose={() => setOpen(false)}
        >
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Biển số xe máy
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
                    "Xe côn tay",
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
                      if (file) setter(URL.createObjectURL(file));
                    }}
                  />
                </label>
              ))}
            </div>
            <p className="rounded-sm bg-info-50 p-2.5 text-xs leading-5 text-info-700 border border-info-100">
              Ảnh cần rõ nét, không lóa sáng, nhìn rõ tên chủ xe, biển số, số
              khung và số máy.
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
