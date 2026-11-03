import { useState, useEffect, useCallback } from "react";
import { Button, Drawer, PageHeader } from "../../../components/common/index.ts";
import { card, th, rowCls, inputCls, Badge, type Toast } from "../common.tsx";
import { technicianService } from "../../../services/technicianService.ts";
import { ApiError } from "../../../services/httpClient.ts";

type TechnicianAccount = {
  id?: string;
  name: string;
  user: string;
  active: boolean;
  phone?: string;
};

export function TechnicianAccountsPage({ showToast }: Toast) {
  const [staff, setStaff] = useState<TechnicianAccount[]>([]);
  const [form, setForm] = useState({ name: "", user: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const cur = staff.find((s) => s.user === sel) ?? null;

  const loadTechnicians = useCallback(async () => {
    try {
      const res = await technicianService.getTechnicians();
      const items = Array.isArray(res) ? res : res.items || [];
      setStaff(
        items.map((t) => ({
          id: t.id,
          name: t.fullName,
          user: t.email || t.username || t.phone,
          active: t.active,
          phone: t.phone,
        })),
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Không thể tải danh sách kỹ thuật viên";
      showToast(msg);
    }
  }, [showToast]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);
  const add = async () => {
    if (!form.name.trim() || !form.user.trim()) {
      showToast("Vui lòng nhập họ tên và email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.user.trim())) {
      showToast("Email không hợp lệ");
      return;
    }
    if (form.password.length < 6) {
      showToast("Mật khẩu khởi tạo cần tối thiểu 6 ký tự");
      return;
    }

    try {
      const created = await technicianService.createTechnician({
        fullName: form.name.trim(),
        email: form.user.trim(),
        password: form.password,
        phone: form.phone.trim() || ("09" + Date.now().toString().slice(-8)),
      });

      setStaff((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.fullName,
          user: created.email || form.user.trim(),
          active: created.active,
          phone: created.phone,
        },
      ]);
      setForm({ name: "", user: "", password: "", phone: "" });
      setShowPw(false);
      showToast("Đã tạo tài khoản kỹ thuật viên");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Lỗi khi tạo tài khoản kỹ thuật viên";
      showToast(msg);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Kĩ thuật viên"
        title="Kĩ thuật viên"
        description="Quản lý và tạo tài khoản dành riêng cho kỹ thuật viên."
      />
      <div className="grid gap-6 xl:grid-cols-5">
        <section className={`${card} overflow-x-auto xl:col-span-3`}>
          <div className="border-b border-slate-200 p-6">
            <h2 className="font-heading text-lg font-bold text-slate-950">
              Tài khoản kỹ thuật viên
            </h2>
          </div>
          <table className="w-full min-w-120 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Họ tên</th>
                <th className={th}>Email</th>
                <th className={th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr
                  key={s.user}
                  className={`${rowCls} cursor-pointer`}
                  onClick={() => setSel(s.user)}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{s.user}</td>
                  <td className="px-6 py-4">
                    <Badge tone={s.active ? "success" : "danger"}>
                      {s.active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={`${card} p-6 xl:col-span-2`}>
          <h2 className="font-heading text-lg font-bold text-slate-950">
            Tạo tài khoản kỹ thuật viên
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Họ tên
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                className={inputCls}
                type="email"
                autoComplete="off"
                placeholder="ten@ktxhub.vn"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Mật khẩu khởi tạo
              <div className="relative">
                <input
                  className={`${inputCls} pr-20`}
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="focus-ring absolute right-2 top-1/2 h-7 -translate-y-1/2 rounded-sm px-2 text-xs font-medium text-brand-600 hover:bg-brand-50"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? "Ẩn" : "Hiện"}
                </button>
              </div>
              <span className="text-xs font-normal text-slate-500">
                Mật khẩu mặc định do quản trị viên cấp; kỹ thuật viên nên đổi
                sau lần đăng nhập đầu.
              </span>
            </label>
            <Button
              label="Tạo tài khoản kỹ thuật viên"
              className="h-10 rounded-sm bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
              onClick={add}
            >
              Tạo tài khoản
            </Button>
          </div>
        </section>
      </div>
      {cur && (
        <Drawer
          title={cur.name}
          subtitle={cur.user}
          onClose={() => setSel(null)}
        >
          <div className="flex gap-2">
            <Badge tone="slate">Kỹ thuật viên</Badge>
            <Badge tone={cur.active ? "success" : "danger"}>
              {cur.active ? "Hoạt động" : "Bị khóa"}
            </Badge>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            <div className="flex justify-between gap-4 px-4 py-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{cur.user}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-4">
              <dt className="text-slate-500">Vai trò</dt>
              <dd className="font-medium text-slate-900">Kỹ thuật viên</dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-2">
            <Button
              label="Khóa hoặc mở khóa"
              className={`h-10 rounded-sm text-sm font-semibold active:translate-y-[1px] ${
                cur.active
                  ? "border border-danger-200 text-danger-600 hover:bg-danger-50"
                  : "bg-brand-500 text-white hover:bg-brand-600"
              }`}
              onClick={async () => {
                const targetId = cur.id || cur.user;
                const nextActive = !cur.active;
                try {
                  await technicianService.toggleStatus(targetId, nextActive);
                  setStaff((prev) =>
                    prev.map((x) =>
                      x.user === cur.user ? { ...x, active: nextActive } : x,
                    ),
                  );
                  showToast(
                    cur.active
                      ? `Đã khóa tài khoản ${cur.user}`
                      : `Đã mở khóa ${cur.user}`,
                  );
                } catch (err) {
                  const msg =
                    err instanceof ApiError
                      ? err.message
                      : "Không thể thay đổi trạng thái tài khoản";
                  showToast(msg);
                }
              }}
            >
              {cur.active ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            </Button>
            <Button
              label="Đặt lại mật khẩu"
              className="h-10 rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() =>
                showToast(`Đã gửi liên kết đặt lại mật khẩu cho ${cur.user}`)
              }
            >
              Đặt lại mật khẩu
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
