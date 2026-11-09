import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, PageHeader } from "../../../components/common/index.ts";
import { card, th, inputCls, Badge, type Toast } from "../common.tsx";
import { technicianService } from "../../../services/technicianService.ts";
import { addDemoTechnician, demoEmailAvailable, resetDemoTechnician, updateDemoTechnician } from "../../../services/mock/mockAuth.ts";
import { env } from "../../../config/env.ts";
import type { TechnicianResponse } from "../../../types/api/endpoints.ts";

const emptyForm = { name: "", email: "", phone: "" };
function generatePassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function TechnicianAccountsPage({ showToast }: Toast) {
  const [staff, setStaff] = useState<TechnicianResponse[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [edit, setEdit] = useState(emptyForm);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [once, setOnce] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const current = staff.find((s) => s.id === selected);
  const load = useCallback(async () => {
    try {
      const result = await technicianService.getTechnicians();
      setStaff(Array.isArray(result) ? result : result.items);
      setError("");
    } catch { setError("Không thể tải danh sách kỹ thuật viên."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const valid = (values: typeof form) => values.name.trim() && values.phone.trim() && /^\S+@\S+\.\S+$/.test(values.email.trim());
  const create = async () => {
    if (!valid(form)) { setError("Nhập họ tên, số điện thoại và email hợp lệ."); return; }
    if (staff.some((s) => s.email?.toLowerCase() === form.email.trim().toLowerCase())) { setError("Email đã được sử dụng."); return; }
    if (env.USE_MOCK && !demoEmailAvailable(form.email)) { setError("Email đã được sử dụng."); return; }
    setBusy(true); setError(""); setOnce("");
    try {
      const password = generatePassword();
      const created = await technicianService.createTechnician({ fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password });
      if (env.USE_MOCK) addDemoTechnician(created.id, form.email.trim(), form.name.trim(), password);
      setStaff((items) => [...items, created]);
      setForm(emptyForm);
      setOnce(password);
      showToast("Đã tạo tài khoản kỹ thuật viên.");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể tạo tài khoản."); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!current || !valid(edit)) { setError("Nhập họ tên, số điện thoại và email hợp lệ."); return; }
    if (staff.some((s) => s.id !== current.id && s.email?.toLowerCase() === edit.email.trim().toLowerCase())) { setError("Email đã được sử dụng."); return; }
    if (env.USE_MOCK && !demoEmailAvailable(edit.email, current.id)) { setError("Email đã được sử dụng."); return; }
    setBusy(true); setError("");
    try {
      const updated = await technicianService.updateTechnician(current.id, { fullName: edit.name.trim(), email: edit.email.trim(), phone: edit.phone.trim() });
      if (env.USE_MOCK) updateDemoTechnician(current.id, edit.email.trim(), edit.name.trim());
      setStaff((items) => items.map((s) => s.id === current.id ? updated : s));
      showToast("Đã cập nhật kỹ thuật viên.");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể cập nhật kỹ thuật viên."); }
    finally { setBusy(false); }
  };
  const filtered = staff.filter((s) => (status === "all" || s.active === (status === "active")) && `${s.fullName} ${s.email ?? ""} ${s.phone}`.toLowerCase().includes(search.toLowerCase()));
  const fields = (values: typeof form, set: (v: typeof form) => void) => <div className="grid gap-3">{([['name', 'Họ tên'], ['email', 'Email'], ['phone', 'Số điện thoại']] as const).map(([key, label]) => <label key={key} className="grid gap-1 text-sm">{label}<input className={inputCls} type={key === 'email' ? 'email' : 'text'} value={values[key]} onChange={(e) => set({ ...values, [key]: e.target.value })} /></label>)}</div>;
  return <>
    <PageHeader eyebrow="Kỹ thuật viên" title="Kỹ thuật viên" description="Quản lý tài khoản kỹ thuật viên." />
    {error && <p role="alert" className="mb-4 text-sm text-danger-600">{error}</p>}
    <div className="grid gap-6 xl:grid-cols-5">
      <section className={`${card} overflow-x-auto xl:col-span-3`}>
        <div className="flex flex-wrap gap-3 p-6"><label className="text-sm">Tìm kiếm <input className={inputCls} value={search} onChange={(e) => setSearch(e.target.value)} /></label><label className="text-sm">Trạng thái <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="locked">Bị khóa</option></select></label></div>
        <table className="w-full min-w-120 text-left"><thead><tr><th className={th}>Họ tên</th><th className={th}>Email</th><th className={th}>Trạng thái</th></tr></thead><tbody>{filtered.map((s) => <tr key={s.id}><td className="px-6 py-4"><button type="button" className="text-brand-600 underline" onClick={() => { setSelected(s.id); setEdit({ name: s.fullName, email: s.email ?? "", phone: s.phone }); setError(""); }}>{s.fullName}</button></td><td className="px-6 py-4">{s.email}</td><td className="px-6 py-4"><Badge tone={s.active ? "success" : "danger"}>{s.active ? "Hoạt động" : "Bị khóa"}</Badge></td></tr>)}</tbody></table>
        {filtered.length === 0 && <p className="p-6 text-sm text-slate-500">Không có kỹ thuật viên phù hợp.</p>}
      </section>
      <section className={`${card} grid content-start gap-4 p-6 xl:col-span-2`}><h2 className="font-bold">Tạo tài khoản kỹ thuật viên</h2>{fields(form, setForm)}<Button disabled={busy} onClick={create} className="rounded-sm bg-brand-500 p-3 text-white">Tạo tài khoản</Button>{once && <div role="status" className="rounded-sm bg-amber-50 p-3 text-sm">Mật khẩu khởi tạo chỉ hiển thị lần này: <strong className="break-all">{once}</strong><button type="button" className="ml-2 underline" onClick={() => setOnce("")}>Đã lưu</button></div>}</section>
    </div>
    {current && <Drawer title={current.fullName} subtitle={current.email ?? ""} onClose={() => { setSelected(null); setError(""); }}>
      <div className="grid gap-4">
        {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
        {fields(edit, setEdit)}
        <p className="text-xs text-slate-500">Chỉ cập nhật email sau khi đã xác minh ngoài hệ thống. Việc khóa không tự phân công lại phiếu.</p>
        <Button disabled={busy} onClick={save} className="rounded-sm bg-brand-500 p-3 text-white">Lưu thay đổi</Button>
        <Button disabled={busy} onClick={async () => {
          setBusy(true); setError("");
          try {
            const updated = await technicianService.toggleStatus(current.id, !current.active);
            setStaff((items) => items.map((s) => s.id === current.id ? updated : s));
            showToast(updated.active ? "Đã kích hoạt tài khoản." : "Đã khóa tài khoản.");
          } catch {
            setError("Không thể thay đổi trạng thái tài khoản.");
          } finally {
            setBusy(false);
          }
        }} className="rounded-sm border p-3">{current.active ? "Khóa tài khoản" : "Kích hoạt tài khoản"}</Button>
        {env.USE_MOCK ? <Button disabled={busy} onClick={() => {
          if (!current.email || !window.confirm("Đã xác minh danh tính kỹ thuật viên ngoài hệ thống?")) return;
          try {
            const password = generatePassword();
            resetDemoTechnician(current.id, current.email, current.fullName, password);
            setOnce(password);
            setSelected(null);
            showToast("Đã cấp lại mật khẩu demo.");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể cấp lại mật khẩu.");
          }
        }} className="rounded-sm border p-3">Cấp lại mật khẩu demo</Button> : <p className="text-xs text-slate-500">Cấp lại mật khẩu sau xác minh ngoài hệ thống cần contract API; chức năng này chưa khả dụng.</p>}
      </div>
    </Drawer>}
  </>;
}
