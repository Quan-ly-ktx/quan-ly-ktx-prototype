import { useState, useEffect } from "react";
import { useDormData } from "../../../hooks/useDormData.ts";
import {
  Button,
  Icon,
  Modal,
  PageHeader,
  Select,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import type { OnboardingInput, OnboardingResult, TenantRecord } from "../../../types/tenant.ts";
import type { Invoice, RoomRecord } from "../../../types/index.ts";
import { isSlotAvailable } from "../../../utils/roomCalculations.ts";
import { getViolations } from "../../../services/mock/incidentStore.ts";
import { env } from "../../../config/env.ts";

const emptyTenantForm: {
  name: string;
  gender: "Nam" | "Nữ";
  phone: string;
  cccd: string;
  email: string;
  address: string;
  slot: string;
  start: string;
  end: string;
  deposit: string;
} = {
  name: "",
  gender: "Nam",
  phone: "",
  cccd: "",
  email: "",
  address: "",
  slot: "",
  start: "",
  end: "",
  deposit: "",
};

export function TenantsPage({
  tenants,
  rooms,
  onOnboard,
  onUpdateTenantProfile,
  invoices = [],
  initialSlot = null,
  onClearInitialSlot,
  showToast,
}: {
  tenants: TenantRecord[];
  rooms: RoomRecord[];
  onOnboard: (input: OnboardingInput) => Promise<OnboardingResult>;
  onUpdateTenantProfile: (id: string, profile: Pick<TenantRecord, "name" | "cccd" | "email" | "phone" | "address" | "gender">) => Promise<TenantRecord>;
  invoices?: Invoice[];
  initialSlot?: { roomId: string; bedId: string } | null;
  onClearInitialSlot?: () => void;
  showToast: (message: string) => void;
}) {
  const { contracts } = useDormData();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<TenantRecord | null>(null);
  const [profileDraft, setProfileDraft] = useState<TenantRecord | null>(null);
  const [profileTab, setProfileTab] = useState("Thông tin cá nhân");
  const [query, setQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("Tất cả phòng");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [form, setForm] = useState(emptyTenantForm);
  const [createdAccountModal, setCreatedAccountModal] = useState<{
    name: string;
    cccd: string;
    email: string;
    phone: string;
    roomBed: string;
    initialPassword: string;
  } | null>(null);

  useEffect(() => {
    if (initialSlot) {
      const room = rooms.find((r) => r.id === initialSlot.roomId);
      const gender = room?.gender ?? "Nam";
      setForm({
        ...emptyTenantForm,
        gender,
        slot: initialSlot.bedId,
      });
      setAddOpen(true);
      onClearInitialSlot?.();
    }
  }, [initialSlot, onClearInitialSlot, rooms]);

  const filtered = tenants.filter((tenant) => {
    if (roomFilter !== "Tất cả phòng" && tenant.room !== roomFilter) return false;
    if (statusFilter !== "Tất cả trạng thái" && tenant.status !== statusFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return `${tenant.cccd} ${tenant.email} ${tenant.name} ${tenant.phone} ${tenant.room} ${tenant.bed}`
        .toLowerCase()
        .includes(q);
    }
    return true;
  });

  const availableSlots = rooms.filter((room) => !room.deletedAt && room.gender === form.gender).flatMap((room) =>
    Array.from({ length: room.total }, (_, index) => {
      const bed = `G${String(index + 1).padStart(2, "0")}`;
      return { room: room.code, roomId: room.id, bed, floor: room.floor, monthlyRent: room.basePrice, bedId: room.bedOverrides?.[bed]?.id, status: room.bedOverrides?.[bed]?.status };
    }).filter((slot) => slot.bedId && slot.status === "AVAILABLE" && isSlotAvailable(contracts, slot.roomId, slot.bedId)),
  );

  const chosenSlot = availableSlots.find(
    (slot) => slot.bedId === form.slot,
  );

  const createTenant = async () => {
    if (!chosenSlot?.bedId) return showToast("Vui lòng chọn vị trí thuê còn trống");
    try {
      const result = await onOnboard({
        name: form.name, gender: form.gender, phone: form.phone.replace(/\s/g, ""), cccd: form.cccd,
        email: form.email, address: form.address, bedId: chosenSlot.bedId, startDate: form.start,
        endDate: form.end, deposit: form.deposit ? Number(form.deposit) : chosenSlot.monthlyRent,
      });
      setForm(emptyTenantForm);
      setAddOpen(false);
      if (result.initialPassword) setCreatedAccountModal({
        name: result.tenant.name, cccd: result.tenant.cccd, email: result.tenant.email,
        phone: result.tenant.phone, roomBed: `${result.tenant.room} · ${result.tenant.bed}`,
        initialPassword: result.initialPassword,
      });
      showToast("Đã tiếp nhận và phát hành hóa đơn tháng đầu.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể tiếp nhận người thuê.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Người thuê"
        title="Hồ sơ người thuê"
        description="Quản lý thông tin định danh, vị trí thuê và hợp đồng của người đang thuê."
        actions={
          <Button
            className="flex h-10 items-center gap-2 rounded-sm bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
            onClick={() => {
              setForm({
                ...emptyTenantForm,
                slot: availableSlots[0]
                  ? availableSlots[0].bedId ?? ""
                  : "",
              });
              setAddOpen(true);
            }}
          >
            <Icon name="userPlus" className="size-4" /> Tiếp nhận người thuê
          </Button>
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
            value={roomFilter}
            options={[
              "Tất cả phòng",
              ...Array.from(new Set(tenants.map((tenant) => tenant.room))).sort(),
            ]}
            onChange={(val) => setRoomFilter(val)}
          />
          <Select
            label="Trạng thái"
            value={statusFilter}
            options={[
              "Tất cả trạng thái",
              "Đang thuê",
              "Sắp hết HĐ",
              "Đã trả phòng",
            ]}
            onChange={(val) => setStatusFilter(val)}
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
          title="Tiếp nhận và lập hợp đồng"
          description="Chỉ tiếp nhận vào ngày 01; hợp đồng và hóa đơn tháng đầu được tạo cùng hồ sơ."
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
                onChange={(event) => {
                  const cccd = event.target.value.replace(/\D/g, "").slice(0, 12);
                  const existing = tenants.find((tenant) => tenant.cccd === cccd);
                  setForm(existing ? { ...form, cccd, name: existing.name, gender: existing.gender, phone: existing.phone, email: existing.email, address: existing.address } : { ...form, cccd });
                }}
              />
              {tenants.some((tenant) => tenant.cccd === form.cccd) && <span>Khách đã có hồ sơ; tài khoản cũ sẽ được sử dụng lại.</span>}
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
                    key={slot.bedId}
                    value={slot.bedId}
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
              Xác nhận tiếp nhận
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
            {profileTab === "Thông tin cá nhân" && (profileDraft?.id === selected.id ? (
              <div className="grid gap-3">
                {(["name", "cccd", "email", "phone", "address"] as const).map((field) => (
                  <label key={field}>{({ name: "Họ tên", cccd: "CCCD", email: "Email", phone: "Số điện thoại", address: "Địa chỉ" })[field]}
                    <input className="block w-full border p-2" value={profileDraft[field]} onChange={(event) => setProfileDraft({ ...profileDraft, [field]: event.target.value })} />
                  </label>
                ))}
                <label>Giới tính <select value={profileDraft.gender} onChange={(event) => setProfileDraft({ ...profileDraft, gender: event.target.value === "Nữ" ? "Nữ" : "Nam" })}><option>Nam</option><option>Nữ</option></select></label>
                <Button onClick={() => { void (async () => { try { const updated = await onUpdateTenantProfile(selected.id, profileDraft); setSelected(updated); setProfileDraft(null); showToast("Đã lưu hồ sơ."); } catch (error) { showToast(error instanceof Error ? error.message : "Không thể lưu hồ sơ."); } })(); }}>Lưu hồ sơ</Button>
                <Button onClick={() => setProfileDraft(null)}>Hủy</Button>
              </div>
            ) : (
              <div><dl className="grid gap-x-8 md:grid-cols-2">
                {[
                  ["Họ và tên", selected.name], ["Giới tính", selected.gender], ["Số điện thoại", selected.phone],
                  ["CCCD", selected.cccd], ["Email", selected.email], ["Địa chỉ", selected.address],
                ].map(([label, value]) => <div className="flex justify-between gap-4 border-b border-slate-100 py-3" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl><Button onClick={() => setProfileDraft(selected)}>Sửa hồ sơ</Button></div>
            ))}
            {profileTab === "Hợp đồng & Cọc" && (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-sm border border-brand-200 bg-brand-50 p-4 sm:grid-cols-3">
                  {[
                    ["Phòng / Vị trí", `${selected.room} · ${selected.bed}`],
                    ["Giá thuê", money(selected.monthlyRent)],
                    ["Tiền cọc", money(selected.deposit)],
                    ["Ngày bắt đầu", selected.start],
                    ["Ngày kết thúc", selected.end],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-brand-700">{label}</div>
                      <div className="mt-1 font-mono text-sm font-bold text-slate-900">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const myInvoices = invoices.filter((i) => i.tenantId === selected.id);
                  const unpaidInvoice = myInvoices.find((i) => i.status === "Nợ");
                  const pendingInvoice = myInvoices.find((i) => i.status === "Chờ xác nhận");

                  const detailDesc = unpaidInvoice
                    ? `Đang nợ hóa đơn: ${money(unpaidInvoice.amount)} (Hạn nộp: ${unpaidInvoice.due})`
                    : pendingInvoice
                      ? `Hóa đơn ${money(pendingInvoice.amount)} đang chờ xác nhận biên lai`
                      : myInvoices.length > 0
                        ? "Đã hoàn thành thanh toán mọi kỳ hóa đơn"
                        : "Không có hóa đơn nợ đọng";

                  const badgeLabel = unpaidInvoice
                    ? "Còn nợ tiền phòng"
                    : pendingInvoice
                      ? "Chờ xác nhận"
                      : "Đã đóng đủ";

                  return (
                    <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Tình trạng công nợ hiện thời</div>
                        <div className="font-medium text-xs text-slate-800 mt-0.5">{detailDesc}</div>
                      </div>
                      <span
                        className={`status-label ${
                          unpaidInvoice
                            ? "bg-danger-50 text-danger-700 border border-danger-200"
                            : pendingInvoice
                              ? "status-label-warning"
                              : "status-label-success"
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
            {profileTab === "Kỷ luật & Vi phạm" && (
              <div className="space-y-2">
                {!env.USE_MOCK ? <p>API lịch sử vi phạm chưa được tích hợp.</p> : getViolations(selected.id).length === 0 ? <p>Không có biên bản vi phạm.</p> : getViolations(selected.id).map((item) => (
                  <p key={item.id}>{item.date} · {item.type} · {item.level}{item.fine ? ` · ${money(item.fine)}` : ""}</p>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
      {createdAccountModal && (
        <Modal
          title="Cấp tài khoản khách thuê mới"
          description="Hồ sơ đã được lưu và tài khoản đăng nhập Cổng thông tin di động đã được cấp phát."
          onClose={() => setCreatedAccountModal(null)}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-sm border border-success-200 bg-success-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-success-800">
                <Icon name="check" className="size-4" />
                Cấp tài khoản thành công cho {createdAccountModal.name}
              </div>
              <p className="mt-1 text-xs text-success-700">
                Vị trí giường: <b>{createdAccountModal.roomBed}</b>. Gửi thông tin đăng nhập này cho khách thuê để đăng nhập trên di động.
              </p>
            </div>

            <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Tên đăng nhập (CCCD):</span>
                <span className="font-mono font-bold text-slate-900">
                  {createdAccountModal.cccd}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Số điện thoại:</span>
                <span className="font-mono font-bold text-slate-900">
                  {createdAccountModal.phone}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Mật khẩu ban đầu:</span>
                <span className="rounded-sm border border-brand-200 bg-brand-50 px-2.5 py-0.5 font-mono text-xs font-bold text-brand-700">
                  {createdAccountModal.initialPassword}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              * Khách thuê được khuyến nghị đổi mật khẩu cá nhân sau lần đăng nhập đầu tiên.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                className="flex items-center gap-1.5 h-10 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  const content = `[KTX Hub] Thông tin tài khoản của ${createdAccountModal.name}:\n- Tên đăng nhập: ${createdAccountModal.cccd}\n- Mật khẩu: ${createdAccountModal.initialPassword}\n- Vị trí: ${createdAccountModal.roomBed}`;
                  if (!navigator.clipboard) { showToast("Trình duyệt không hỗ trợ sao chép."); return; }
                  void navigator.clipboard.writeText(content).then(() => showToast("Đã sao chép thông tin tài khoản.")).catch(() => showToast("Không thể sao chép thông tin tài khoản."));
                }}
              >
                <Icon name="copy" className="size-3.5" />
                Sao chép gửi khách
              </Button>
              <Button
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
                onClick={() => setCreatedAccountModal(null)}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
