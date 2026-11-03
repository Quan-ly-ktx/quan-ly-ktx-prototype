import { useState, type ReactNode } from "react";
import { Button, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import type { TenantRecord } from "../../../types/tenant.ts";
import { card, th, rowCls, inputCls, Badge, SearchBox, type Toast } from "../common.tsx";

type Vehicle = {
  id: string;
  tenantId: string;
  plate: string;
  type: "Xe máy" | "Ô tô" | "Xe đạp điện";
  brand: string;
  color: string;
  registration: "Đủ 2 mặt" | "Chưa có";
  cardStatus: "Chưa cấp thẻ" | "Đã cấp thẻ";
  cardCode?: string;
};

const initialVehicles: Vehicle[] = [
  {
    id: "XE-001",
    tenantId: "NT-0187",
    plate: "59X3-123.45",
    type: "Xe máy",
    brand: "Honda Vision",
    color: "Đen",
    registration: "Đủ 2 mặt",
    cardStatus: "Đã cấp thẻ",
    cardCode: "THE-0187",
  },
  {
    id: "XE-002",
    tenantId: "NT-0188",
    plate: "59P2-678.90",
    type: "Xe máy",
    brand: "Yamaha Exciter",
    color: "Xanh",
    registration: "Đủ 2 mặt",
    cardStatus: "Chưa cấp thẻ",
  },
  {
    id: "XE-003",
    tenantId: "NT-0189",
    plate: "51H-456.78",
    type: "Ô tô",
    brand: "Toyota Vios",
    color: "Trắng",
    registration: "Chưa có",
    cardStatus: "Chưa cấp thẻ",
  },
];

const emptyVehicle = {
  tenantId: "",
  plate: "",
  type: "Xe máy" as Vehicle["type"],
  brand: "",
  color: "",
  registration: "Chưa có" as Vehicle["registration"],
  cardStatus: "Chưa cấp thẻ" as Vehicle["cardStatus"],
  cardCode: "",
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
            ID thẻ
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-950">
            {vehicle.cardCode ?? "Chưa cấp"}
          </p>
        </div>
        <Badge
          tone={vehicle.cardStatus === "Đã cấp thẻ" ? "success" : "warning"}
        >
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
            {infoRow("Biển số", vehicle.plate, true)}
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
            Ảnh cà vẹt xe
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Giấy đăng ký xe gồm mặt trước và mặt sau.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Mặt trước", "Mặt sau"].map((side) => (
            <div key={side}>
              <p className="mb-2 text-sm font-semibold text-slate-700">{side}</p>
              <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                {vehicle.registration === "Đủ 2 mặt" ? (
                  <div className="text-center text-brand-700">
                    <span className="mx-auto grid size-12 place-items-center rounded-sm bg-brand-50">
                      <Icon name="image" className="size-7" />
                    </span>
                    <p className="mt-3 text-sm font-semibold">
                      Ảnh cà vẹt · {side}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Bấm để xem ảnh gốc
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <Icon name="image" className="mx-auto size-8" />
                    <p className="mt-2 text-sm">Chưa có ảnh</p>
                  </div>
                )}
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
  showToast,
}: Toast & { tenants: TenantRecord[] }) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [viewing, setViewing] = useState<Vehicle | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVehicle);

  const tenantName = (id: string) =>
    tenants.find((tenant) => tenant.id === id)?.name ?? "Không xác định";
  const visible = vehicles.filter((vehicle) =>
    `${vehicle.plate} ${tenantName(vehicle.tenantId)} ${vehicle.type} ${vehicle.brand}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyVehicle,
      tenantId:
        tenants.find((tenant) => tenant.status !== "Đã trả phòng")?.id ?? "",
    });
    setOpen(true);
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      tenantId: vehicle.tenantId,
      plate: vehicle.plate,
      type: vehicle.type,
      brand: vehicle.brand,
      color: vehicle.color,
      registration: vehicle.registration,
      cardStatus: vehicle.cardStatus,
      cardCode: vehicle.cardCode ?? "",
    });
    setOpen(true);
  };

  const save = () => {
    const plate = form.plate.trim().toUpperCase();
    if (!form.tenantId || !plate || !form.brand.trim() || !form.color.trim()) {
      showToast("Vui lòng nhập đủ thông tin phương tiện");
      return;
    }
    if (!/^[0-9A-Z.-]{6,12}$/.test(plate)) {
      showToast("Biển số xe không hợp lệ");
      return;
    }
    if (
      vehicles.some(
        (vehicle) =>
          vehicle.plate.toUpperCase() === plate && vehicle.id !== editingId,
      )
    ) {
      showToast("Biển số xe đã tồn tại");
      return;
    }
    if (editingId) {
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingId ? { ...vehicle, ...form, plate } : vehicle,
        ),
      );
      showToast("Đã cập nhật phương tiện");
    } else {
      setVehicles([
        {
          id: `XE-${String(vehicles.length + 1).padStart(3, "0")}`,
          ...form,
          plate,
        },
        ...vehicles,
      ]);
      showToast("Đã thêm phương tiện");
    }
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Phương tiện"
        title="Quản lý phương tiện"
        description="Theo dõi phương tiện theo người thuê và tra cứu nhanh bằng biển số."
        actions={
          <Button
            label="Thêm phương tiện"
            className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={startCreate}
          >
            Thêm phương tiện
          </Button>
        }
      />
      <section className={card}>
        <div className="border-b border-slate-200 p-6">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Tìm biển số hoặc người thuê..."
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
                  <td className="px-6 py-4">
                    <Badge
                      tone={
                        vehicle.cardStatus === "Đã cấp thẻ"
                          ? "success"
                          : "warning"
                      }
                    >
                      {vehicle.cardStatus}
                    </Badge>
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
                        <div className="absolute right-0 top-10 z-dropdown w-36 overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-md">
                          <Button
                            className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                            onClick={() => {
                              setViewing(vehicle);
                              setActionMenu(null);
                            }}
                          >
                            <Icon name="search" className="size-3.5" /> Xem
                          </Button>
                          <Button
                            className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              startEdit(vehicle);
                              setActionMenu(null);
                            }}
                          >
                            <Icon name="file" className="size-3.5" /> Sửa
                          </Button>
                          <Button
                            className="flex h-9 w-full items-center gap-2.5 rounded-sm px-2.5 text-left text-xs font-medium text-danger-600 hover:bg-danger-50"
                            onClick={() => {
                              setDeleting(vehicle);
                              setActionMenu(null);
                            }}
                          >
                            <Icon name="close" className="size-3.5" /> Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
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
      {viewing && (
        <Modal
          wide
          title={`Chi tiết phương tiện ${viewing.plate}`}
          description="Thông tin thẻ xe, phương tiện, người thuê và giấy đăng ký xe."
          onClose={() => setViewing(null)}
        >
          <VehicleDetail
            vehicle={viewing}
            tenant={tenants.find((tenant) => tenant.id === viewing.tenantId)}
          />
        </Modal>
      )}
      {open && (
        <Modal
          title={editingId ? "Cập nhật phương tiện" : "Thêm phương tiện"}
          description="Phương tiện phải được liên kết với một người thuê."
          onClose={() => setOpen(false)}
        >
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Người thuê
              <select
                className={inputCls}
                value={form.tenantId}
                onChange={(event) =>
                  setForm({ ...form, tenantId: event.target.value })
                }
              >
                {tenants
                  .filter((tenant) => tenant.status !== "Đã trả phòng")
                  .map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} · {tenant.room}-{tenant.bed}
                    </option>
                  ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Biển số
              <input
                className={`${inputCls} font-mono uppercase`}
                value={form.plate}
                onChange={(event) =>
                  setForm({ ...form, plate: event.target.value })
                }
                placeholder="59X3-123.45"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Loại xe
              <select
                className={inputCls}
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value as Vehicle["type"],
                  })
                }
              >
                {["Xe máy", "Ô tô", "Xe đạp điện"].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Hãng / Dòng xe
              <input
                className={inputCls}
                value={form.brand}
                onChange={(event) =>
                  setForm({ ...form, brand: event.target.value })
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Màu sắc
              <input
                className={inputCls}
                value={form.color}
                onChange={(event) =>
                  setForm({ ...form, color: event.target.value })
                }
              />
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                label="Hủy"
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                onClick={() => setOpen(false)}
              >
                Hủy
              </Button>
              <Button
                label="Lưu phương tiện"
                className="h-10 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={save}
              >
                Lưu phương tiện
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xóa phương tiện?"
          description={`${deleting.plate} sẽ được gỡ khỏi hồ sơ người thuê.`}
          onClose={() => setDeleting(null)}
        >
          <div className="flex justify-end gap-2 p-6">
            <Button
              label="Hủy"
              className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setDeleting(null)}
            >
              Hủy
            </Button>
            <Button
              label="Xác nhận xóa"
              className="h-10 rounded-sm bg-danger-500 px-4 text-sm font-semibold text-white hover:bg-danger-600 active:translate-y-[1px]"
              onClick={() => {
                setVehicles(
                  vehicles.filter((vehicle) => vehicle.id !== deleting.id),
                );
                setDeleting(null);
                showToast("Đã xóa phương tiện");
              }}
            >
              Xóa phương tiện
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
