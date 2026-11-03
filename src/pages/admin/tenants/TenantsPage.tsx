import { useState } from "react";
import {
  Button,
  Icon,
  Modal,
  PageHeader,
  Select,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { rentalSlots, initialRooms } from "../../../services/mock/mockData.ts";
import type { TenantRecord } from "../../../types/tenant.ts";
import { isSlotAvailable, slotKey } from "../../../utils/roomCalculations.ts";

const emptyTenantForm = {
  name: "",
  gender: "Nam" as const,
  phone: "",
  cccd: "",
  email: "",
  address: "",
  slot: "",
  start: "2026-09-01",
  end: "2027-09-01",
  deposit: "",
};

export function TenantsPage({
  tenants,
  onTenantsChange,
  showToast,
}: {
  tenants: TenantRecord[];
  onTenantsChange: (tenants: TenantRecord[]) => void;
  showToast: (message: string) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<TenantRecord | null>(null);
  const [profileTab, setProfileTab] = useState("Thông tin cá nhân");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyTenantForm);

  const filtered = tenants.filter((tenant) =>
    `${tenant.cccd} ${tenant.email} ${tenant.name} ${tenant.phone} ${tenant.room} ${tenant.bed}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const availableSlots = rentalSlots.filter((slot) => {
    if (slot.status !== "Sẵn sàng") return false;
    if (!isSlotAvailable(tenants, slot.room, slot.bed)) return false;
    const room = initialRooms.find((r) => r.code === slot.room);
    return !room || room.gender === form.gender;
  });

  const chosenSlot = availableSlots.find(
    (slot) => slotKey(slot.room, slot.bed) === form.slot,
  );

  const createTenant = () => {
    const phone = form.phone.replace(/\s/g, "");
    if (form.name.trim().length < 2)
      return showToast("Vui lòng nhập họ và tên");
    if (!/^0\d{9}$/.test(phone))
      return showToast("Số điện thoại cần đúng 10 chữ số");
    if (!/^\d{12}$/.test(form.cccd))
      return showToast("CCCD cần đúng 12 chữ số");
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return showToast("Email không hợp lệ");
    if (!form.address.trim())
      return showToast("Vui lòng nhập địa chỉ thường trú");
    if (!chosenSlot) return showToast("Vui lòng chọn vị trí thuê còn trống");
    if (new Date(form.end) <= new Date(form.start))
      return showToast("Ngày kết thúc phải sau ngày bắt đầu");
    if (Number(form.deposit) < 0) return showToast("Tiền cọc không hợp lệ");
    if (tenants.some((tenant) => tenant.cccd === form.cccd))
      return showToast("CCCD đã tồn tại");
    if (
      tenants.some(
        (tenant) => tenant.email.toLowerCase() === form.email.toLowerCase(),
      )
    )
      return showToast("Email đã tồn tại");
    if (!isSlotAvailable(tenants, chosenSlot.room, chosenSlot.bed))
      return showToast("Vị trí này vừa được gán cho người thuê khác");

    const tenant: TenantRecord = {
      id: `NT-${String(187 + tenants.length).padStart(4, "0")}`,
      name: form.name.trim(),
      gender: form.gender,
      phone,
      cccd: form.cccd,
      email: form.email.trim().toLowerCase(),
      address: form.address.trim(),
      room: chosenSlot.room,
      bed: chosenSlot.bed,
      start: new Date(form.start).toLocaleDateString("vi-VN"),
      end: new Date(form.end).toLocaleDateString("vi-VN"),
      monthlyRent: chosenSlot.monthlyRent,
      deposit: Number(form.deposit) || chosenSlot.monthlyRent,
      status: "Đang thuê",
    };
    onTenantsChange([tenant, ...tenants]);
    setForm(emptyTenantForm);
    setAddOpen(false);
    showToast(
      `Đã tạo hồ sơ và gán ${tenant.room}-${tenant.bed} cho ${tenant.name}`,
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Người thuê"
        title="Hồ sơ người thuê"
        description="Quản lý thông tin định danh, vị trí thuê và hợp đồng của người đang thuê."
        actions={
          <>
            <Button
              className="flex h-10 items-center gap-2 rounded-sm border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() =>
                showToast(`Đã xuất ${tenants.length} hồ sơ người thuê`)
              }
            >
              <Icon name="report" className="size-4" /> Xuất Excel
            </Button>
            <Button
              className="flex h-10 items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={() => {
                setForm({
                  ...emptyTenantForm,
                  slot: availableSlots[0]
                    ? slotKey(availableSlots[0].room, availableSlots[0].bed)
                    : "",
                });
                setAddOpen(true);
              }}
            >
              <Icon name="userPlus" className="size-4" /> Thêm người thuê
            </Button>
          </>
        }
      />
      <section className="mb-4 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative xl:col-span-2">
            <span className="sr-only">Tìm hồ sơ người thuê</span>
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm họ tên, CCCD, email, SĐT, phòng..."
              value={query}
            />
          </label>
          <Select
            label="Phòng"
            value="Tất cả phòng"
            options={[
              "Tất cả phòng",
              ...Array.from(new Set(tenants.map((tenant) => tenant.room))),
            ]}
            onChange={() => undefined}
          />
          <Select
            label="Trạng thái"
            value="Tất cả trạng thái"
            options={[
              "Tất cả trạng thái",
              "Đang thuê",
              "Sắp hết HĐ",
              "Đã trả phòng",
            ]}
            onChange={() => undefined}
          />
        </div>
      </section>
      <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 border-collapse text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Người thuê</th>
                <th className="px-5 py-3">CCCD</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Phòng / Vị trí</th>
                <th className="px-5 py-3">Giá thuê</th>
                <th className="px-5 py-3">Hạn hợp đồng</th>
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tenant) => (
                <tr
                  className="cursor-pointer hover:bg-slate-50"
                  key={tenant.id}
                  onClick={() => setSelected(tenant)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-sm bg-brand-50 text-xs font-semibold text-brand-700 border border-brand-100">
                        {tenant.name
                          .split(" ")
                          .slice(-2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {tenant.name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {tenant.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-medium text-slate-600">
                    {tenant.cccd}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-700">{tenant.phone}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {tenant.email}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm font-semibold text-brand-700">
                    {tenant.room} · {tenant.bed}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                    {money(tenant.monthlyRent)}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {tenant.end}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`status-label ${
                        tenant.status === "Đang thuê"
                          ? "status-label-success"
                          : tenant.status === "Sắp hết HĐ"
                            ? "status-label-warning"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    Không tìm thấy người thuê phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Hiển thị {filtered.length} trên tổng số {tenants.length} người thuê
        </div>
      </section>

      {addOpen && (
        <Modal
          title="Thêm người thuê và gán phòng"
          description="Tạo hồ sơ sau khi khách đồng ý thuê và giữ ngay một vị trí còn trống."
          onClose={() => setAddOpen(false)}
          wide
        >
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Họ và tên
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Giới tính
              <select
                className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-sm"
                value={form.gender}
                onChange={(event) =>
                  setForm({
                    ...form,
                    gender: event.target.value as "Nam" | "Nữ",
                  })
                }
              >
                <option>Nam</option>
                <option>Nữ</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Số điện thoại
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="0912 345 678"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              CCCD
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 font-mono text-sm"
                value={form.cccd}
                onChange={(event) =>
                  setForm({
                    ...form,
                    cccd: event.target.value.replace(/\D/g, "").slice(0, 12),
                  })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Email
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Địa chỉ thường trú
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm"
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700 sm:col-span-2">
              Vị trí thuê còn trống
              <select
                className="focus-ring h-10 rounded-sm border border-slate-200 bg-white px-3 text-sm"
                value={form.slot}
                onChange={(event) =>
                  setForm({ ...form, slot: event.target.value })
                }
              >
                {availableSlots.length === 0 && (
                  <option value="">Không còn vị trí trống</option>
                )}
                {availableSlots.map((slot) => (
                  <option
                    key={slotKey(slot.room, slot.bed)}
                    value={slotKey(slot.room, slot.bed)}
                  >
                    {slot.room} · {slot.bed} · Tầng {slot.floor} ·{" "}
                    {money(slot.monthlyRent)}/tháng
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Ngày bắt đầu
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm"
                type="date"
                value={form.start}
                onChange={(event) =>
                  setForm({ ...form, start: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Ngày kết thúc
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm"
                type="date"
                value={form.end}
                onChange={(event) =>
                  setForm({ ...form, end: event.target.value })
                }
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Tiền thuê / tháng
              <input
                className="h-10 rounded-sm border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 font-mono"
                readOnly
                value={chosenSlot ? money(chosenSlot.monthlyRent) : "—"}
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Tiền cọc
              <input
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm font-mono"
                inputMode="numeric"
                value={form.deposit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    deposit: event.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder={
                  chosenSlot ? String(chosenSlot.monthlyRent) : ""
                }
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
            <Button
              className="h-10 rounded-sm border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setAddOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={createTenant}
            >
              Tạo và gán phòng
            </Button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal
          title={selected.name}
          description={`${selected.id} · ${selected.status}`}
          onClose={() => {
            setSelected(null);
            setProfileTab("Thông tin cá nhân");
          }}
          wide
        >
          <div className="border-b border-slate-100 px-6">
            <div className="flex gap-1 overflow-x-auto">
              {[
                "Thông tin cá nhân",
                "Hợp đồng & Cọc",
                "Kỷ luật & Vi phạm",
              ].map((tab) => (
                <Button
                  className={`h-10 shrink-0 border-b-2 px-3.5 text-xs font-semibold ${
                    profileTab === tab
                      ? "border-brand-500 text-brand-700"
                      : "border-transparent text-slate-500"
                  }`}
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {profileTab === "Thông tin cá nhân" && (
              <dl className="grid gap-x-8 md:grid-cols-2">
                {[
                  ["Họ và tên", selected.name],
                  ["Giới tính", selected.gender],
                  ["Số điện thoại", selected.phone],
                  ["CCCD", selected.cccd],
                  ["Email", selected.email],
                  ["Địa chỉ", selected.address],
                ].map(([label, value]) => (
                  <div
                    className="flex justify-between gap-4 border-b border-slate-100 py-3"
                    key={label}
                  >
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-right text-xs font-semibold text-slate-800">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {profileTab === "Hợp đồng & Cọc" && (
              <div className="grid gap-3 rounded-sm border border-brand-200 bg-brand-50 p-4 sm:grid-cols-3">
                {[
                  ["Phòng / Vị trí", `${selected.room} · ${selected.bed}`],
                  ["Giá thuê", money(selected.monthlyRent)],
                  ["Tiền cọc", money(selected.deposit)],
                  ["Ngày bắt đầu", selected.start],
                  ["Ngày kết thúc", selected.end],
                  ["Thời hạn", "1 năm"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs text-brand-700">{label}</div>
                    <div className="mt-1 font-mono text-sm font-bold text-slate-900">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {profileTab === "Kỷ luật & Vi phạm" && (
              <div className="grid min-h-48 place-items-center rounded-sm border border-dashed border-slate-300 bg-slate-50 text-center">
                <div>
                  <span className="mx-auto grid size-10 place-items-center rounded-sm bg-success-50 text-success-600">
                    <Icon name="activity" className="size-5" />
                  </span>
                  <h3 className="mt-2.5 font-heading text-sm font-bold">
                    Không có vi phạm
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Người thuê chưa có biên bản vi phạm nội quy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
