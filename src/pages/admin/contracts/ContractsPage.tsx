import { useState, useRef, useEffect } from "react";
import {
  Button,
  Drawer,
  Icon,
  Modal,
  PageHeader,
} from "../../../components/common/index.ts";
import { money } from "../../../utils/formatters.ts";
import { person } from "../../../services/mock/mockData.ts";
import type { TenantRecord, TenantVehicle } from "../../../types/tenant.ts";
import { card, th, rowCls, Badge, type Toast } from "../common.tsx";

type Contract = {
  id: string;
  tenant: string;
  room: string;
  start: string;
  end: string;
  deposit: number;
  status: "Hiệu lực" | "Sắp hết hạn" | "Đã thanh lý";
};

type ContractDocument = {
  id: string;
  contractId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  category: "ORIGINAL_CONTRACT" | "RENEWAL_ANNEX" | "CHECKOUT_HANDOVER" | "OTHER";
  uploadedAt: string;
};

const initialContracts: Contract[] = [
  {
    id: "HD-2026-0187",
    tenant: "Nguyễn Hoàng Nam",
    room: "P.302 · G02",
    start: "01/09/2026",
    end: "01/09/2027",
    deposit: 1200000,
    status: "Hiệu lực",
  },
  {
    id: "HD-2026-0141",
    tenant: "Trần Quốc Bảo",
    room: "P.205 · G03",
    start: "01/09/2026",
    end: "01/09/2027",
    deposit: 1200000,
    status: "Hiệu lực",
  },
  {
    id: "HD-2025-0412",
    tenant: "Hồ Minh Khoa",
    room: "P.312 · G04",
    start: "01/11/2025",
    end: "01/11/2026",
    deposit: 900000,
    status: "Sắp hết hạn",
  },
  {
    id: "HD-2026-0203",
    tenant: "Nguyễn Minh Tuấn",
    room: "P.201 · G05",
    start: "01/11/2026",
    end: "01/11/2027",
    deposit: 1400000,
    status: "Hiệu lực",
  },
];

const initialContractDocuments: ContractDocument[] = [
  {
    id: "DOC-001",
    contractId: "HD-2026-0187",
    name: "hop-dong-thue-HD-2026-0187.pdf",
    size: 284000,
    type: "application/pdf",
    url: "/hop-dong-noi-quy-ktx.pdf",
    category: "ORIGINAL_CONTRACT",
    uploadedAt: "01/09/2026",
  },
];

const categoryLabels: Record<ContractDocument["category"], { label: string; tone: "brand" | "success" | "warning" | "neutral" }> = {
  ORIGINAL_CONTRACT: { label: "Hợp đồng gốc", tone: "brand" },
  RENEWAL_ANNEX: { label: "Phụ lục gia hạn", tone: "success" },
  CHECKOUT_HANDOVER: { label: "Biên bản bàn giao", tone: "warning" },
  OTHER: { label: "Tài liệu khác", tone: "neutral" },
};
const STATUS_TONES: Record<Contract["status"], "success" | "warning" | "neutral"> = {
  "Hiệu lực": "success",
  "Sắp hết hạn": "warning",
  "Đã thanh lý": "neutral",
};

export function ContractsPage({
  tenants,
  onTenantsChange,
  vehicles,
  onVehiclesChange,
  showToast,
}: Toast & {
  tenants: TenantRecord[];
  onTenantsChange?: (tenants: TenantRecord[]) => void;
  vehicles?: TenantVehicle[];
  onVehiclesChange?: (vehicles: TenantVehicle[]) => void;
}) {
  const [contractList, setContractList] = useState<Contract[]>(() => {
    const existing = [...initialContracts];
    tenants.forEach((tenant) => {
      if (!existing.some((c) => c.tenant === tenant.name)) {
        existing.push({
          id: `HD-${tenant.start.slice(-4)}-${tenant.id.replace("NT-", "")}`,
          tenant: tenant.name,
          room: `${tenant.room} · ${tenant.bed}`,
          start: tenant.start,
          end: tenant.end,
          deposit: tenant.deposit,
          status:
            tenant.status === "Sắp hết HĐ"
              ? "Sắp hết hạn"
              : tenant.status === "Đã trả phòng"
                ? "Đã thanh lý"
                : "Hiệu lực",
        });
      }
    });
    return existing;
  });

  const [sel, setSel] = useState<Contract | null>(null);
  const [documents, setDocuments] = useState(initialContractDocuments);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [newEndDate, setNewEndDate] = useState("2028-09-01");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const annexFileInput = useRef<HTMLInputElement>(null);
  const blobUrls = useRef<string[]>([]);


  const contractDocs = sel
    ? documents.filter((item) => item.contractId === sel.id)
    : [];

  useEffect(
    () => () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleUploadFiles = (files?: FileList | null, category: ContractDocument["category"] = "ORIGINAL_CONTRACT") => {
    if (!files || files.length === 0 || !sel) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const addedDocs: ContractDocument[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Tệp ${file.name} vượt quá dung lượng cho phép (10 MB)`);
        return;
      }
      if (!allowed.includes(file.type) && !file.type.startsWith("image/")) {
        showToast(`Tệp ${file.name} định dạng không được hỗ trợ`);
        return;
      }
      const url = URL.createObjectURL(file);
      blobUrls.current.push(url);
      addedDocs.push({
        id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        contractId: sel.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        category,
        uploadedAt: new Date().toLocaleDateString("vi-VN"),
      });
    });

    if (addedDocs.length > 0) {
      setDocuments((prev) => [...prev, ...addedDocs]);
      showToast(`Đã tải lên ${addedDocs.length} tệp cho hợp đồng ${sel.id}`);
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast("Đã xóa tài liệu khỏi hợp đồng");
  };

  const download = (item: ContractDocument) => {
    const anchor = window.document.createElement("a");
    anchor.href = item.url;
    anchor.download = item.name;
    anchor.click();
  };

  const handleConfirmRenewal = () => {
    if (!sel) return;
    const formattedEnd = new Date(newEndDate).toLocaleDateString("vi-VN");
    const updated = contractList.map((c) =>
      c.id === sel.id ? { ...c, end: formattedEnd, status: "Hiệu lực" as const } : c,
    );
    setContractList(updated);
    setSel({ ...sel, end: formattedEnd, status: "Hiệu lực" });

    if (onTenantsChange) {
      const updatedTenants = tenants.map((t) =>
        t.name === sel.tenant ? { ...t, end: formattedEnd, status: "Đang thuê" as const } : t,
      );
      onTenantsChange(updatedTenants);
    }

    setRenewModalOpen(false);
    showToast(`Đã gia hạn hợp đồng ${sel.id} đến ngày ${formattedEnd}`);
  };

  const handleConfirmCheckout = () => {
    if (!sel) return;
    const updated = contractList.map((c) =>
      c.id === sel.id ? { ...c, status: "Đã thanh lý" as const } : c,
    );
    setContractList(updated);
    setSel({ ...sel, status: "Đã thanh lý" });

    if (onTenantsChange) {
      const updatedTenants = tenants.map((t) =>
        t.name === sel.tenant ? { ...t, status: "Đã trả phòng" as const } : t,
      );
      onTenantsChange(updatedTenants);
    }
    if (onVehiclesChange && vehicles) {
      const targetTenant = tenants.find((t) => t.name === sel.tenant);
      const updatedVehicles = vehicles.map((v) =>
        (v.tenantId === targetTenant?.id || (!v.tenantId && targetTenant?.name === sel.tenant)) && v.cardStatus === "Đã cấp thẻ"
          ? { ...v, cardStatus: "Đã thu hồi" as const }
          : v,
      );
      onVehiclesChange(updatedVehicles);
    }

    setCheckoutModalOpen(false);
    showToast(`Đã thanh lý hợp đồng ${sel.id} và mở khóa giường ${sel.room}`);
  };

  const visibleContracts = contractList.filter((c) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.tenant.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHeader
        eyebrow="Hợp đồng"
        title="Vòng đời hợp đồng thuê"
        description="Quản lý thời hạn lưu trú, phụ lục gia hạn linh hoạt, tài liệu minh chứng và thanh lý trả phòng."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Thời hạn: Linh hoạt theo thỏa thuận</span>
          </div>
        }
      />

      <section className="mb-4 rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs">
        <label className="relative block">
          <span className="sr-only">Tìm hợp đồng</span>
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            className="focus-ring h-10 w-full rounded-sm border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
            placeholder="Tìm theo mã hợp đồng, tên người thuê, số phòng..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </label>
      </section>

      <section className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-175 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Mã HĐ</th>
              <th className={th}>Người thuê</th>
              <th className={th}>Phòng / Giường</th>
              <th className={th}>Thời hạn</th>
              <th className={th}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {visibleContracts.map((c) => (
              <tr
                key={c.id}
                className={`${rowCls} cursor-pointer`}
                onClick={() => setSel(c)}
              >
                <td className="px-6 py-4 font-mono text-sm font-medium text-brand-700">
                  {c.id}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {c.tenant}
                  </p>
                  <p className="text-xs text-slate-500">
                    {person(c.tenant).phone}
                  </p>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-600">
                  {c.room}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {c.start} – {c.end}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={STATUS_TONES[c.status]}>{c.status}</Badge>
                </td>
              </tr>
            ))}
            {visibleContracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  Không tìm thấy hợp đồng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {sel && (
        <Drawer
          title={sel.tenant}
          subtitle={sel.id}
          onClose={() => setSel(null)}
        >
          <div className="flex items-center justify-between">
            <Badge tone={STATUS_TONES[sel.status]}>{sel.status}</Badge>
            {sel.status !== "Đã thanh lý" && (
              <div className="flex items-center gap-1.5">
                <Button
                  className="rounded-sm border border-brand-300 bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 active:translate-y-[1px]"
                  onClick={() => {
                    setNewEndDate("2028-09-01");
                    setRenewModalOpen(true);
                  }}
                >
                  <Icon name="refresh" className="mr-1 inline size-3" />
                  Gia hạn
                </Button>
                <Button
                  className="rounded-sm border border-danger-300 bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-700 hover:bg-danger-100 active:translate-y-[1px]"
                  onClick={() => setCheckoutModalOpen(true)}
                >
                  Thanh lý (Checkout)
                </Button>
              </div>
            )}
          </div>

          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["CCCD", person(sel.tenant).cccd],
              ["Email", person(sel.tenant).email],
              ["Phòng / Giường", sel.room],
              ["Bắt đầu", sel.start],
              ["Kết thúc", sel.end],
              ["Thời hạn", "Linh hoạt theo thỏa thuận"],
              ["Tiền cọc", money(sel.deposit)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-slate-500 text-xs">{k}</dt>
                <dd className="font-medium text-slate-900 text-xs">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Tài liệu & Minh chứng hợp đồng ({contractDocs.length})
              </h3>
              <Button
                className="text-xs font-semibold text-brand-600 hover:underline"
                onClick={() => fileInput.current?.click()}
              >
                + Tải thêm tệp
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Hỗ trợ nhiều trang ảnh chụp (JPG, PNG) và tệp văn bản (PDF, DOCX) tối đa 10 MB.
            </p>

            <input
              ref={fileInput}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => {
                handleUploadFiles(event.target.files, "ORIGINAL_CONTRACT");
                event.target.value = "";
              }}
            />

            <div className="mt-3 space-y-2.5">
              {contractDocs.map((doc) => {
                const cat = categoryLabels[doc.category] || categoryLabels.OTHER;
                return (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                        <Icon name="file" className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {doc.name}
                          </p>
                          <Badge tone={cat.tone}>{cat.label}</Badge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {(doc.size / 1024).toFixed(0)} KB · tải lên {doc.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        label="Xem"
                        className="h-7 rounded-sm border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                      >
                        Xem
                      </Button>
                      <Button
                        label="Tải"
                        className="h-7 rounded-sm border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => download(doc)}
                      >
                        Tải
                      </Button>
                      <Button
                        label="Xóa"
                        className="h-7 rounded-sm border border-danger-200 bg-white px-2 text-[11px] font-medium text-danger-600 hover:bg-danger-50"
                        onClick={() => removeDocument(doc.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                );
              })}

              {contractDocs.length === 0 && (
                <Button
                  label="Tải tài liệu hợp đồng lên"
                  className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                  onClick={() => fileInput.current?.click()}
                >
                  <Icon name="file" className="size-6" />
                  Tải ảnh chụp hoặc file scan PDF/DOCX · Tối đa 10 MB
                </Button>
              )}
            </div>
          </div>

          <Button
            label="Đóng"
            className="mt-6 h-10 w-full rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
            onClick={() => setSel(null)}
          >
            Đóng
          </Button>
        </Drawer>
      )}

      {/* Modal Gia hạn hợp đồng (FR-12 Offline Renewal) */}
      {renewModalOpen && sel && (
        <Modal
          title={`Gia hạn hợp đồng · ${sel.id}`}
          description="Ghi nhận Phụ lục gia hạn hợp đồng đã ký kết trực tiếp ngoài thực tế giữa hai bên."
          onClose={() => setRenewModalOpen(false)}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-sm border border-brand-100 bg-brand-50 p-3.5 text-xs text-brand-900">
              <p className="font-semibold">Khách thuê: {sel.tenant} · {sel.room}</p>
              <p className="mt-1 text-slate-600">
                Hạn kết thúc hiện tại: <b className="font-mono text-slate-900">{sel.end}</b>. Tiền cọc được bảo lưu nguyên vẹn.
              </p>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
              Ngày kết thúc mới (Linh hoạt theo thỏa thuận trên phụ lục giấy)
              <input
                type="date"
                className="focus-ring h-10 rounded-sm border border-slate-200 px-3 text-sm outline-none focus:border-brand-500"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </label>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Đính kèm ảnh chụp / file scan Phụ lục hợp đồng đã ký (Tùy chọn)
              </label>
              <input
                ref={annexFileInput}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,image/*"
                className="sr-only"
                onChange={(e) => handleUploadFiles(e.target.files, "RENEWAL_ANNEX")}
              />
              <Button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-slate-300 text-xs text-slate-600 hover:border-brand-500 hover:bg-brand-50"
                onClick={() => annexFileInput.current?.click()}
              >
                <Icon name="file" className="size-4" />
                Chọn ảnh chụp hoặc file phụ lục gia hạn
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setRenewModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                className="h-10 rounded-sm bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
                onClick={handleConfirmRenewal}
              >
                Xác nhận gia hạn
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Thanh lý hợp đồng (FR-13 Checkout) */}
      {checkoutModalOpen && sel && (
        <Modal
          title={`Thanh lý hợp đồng & Trả phòng · ${sel.id}`}
          description="Hoàn tất quy trình cư trú và giải phóng giường đón khách mới."
          onClose={() => setCheckoutModalOpen(false)}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-sm border border-warning-200 bg-warning-50 p-4 text-xs text-warning-900 leading-relaxed">
              <p className="font-semibold text-sm mb-1">Xác nhận thanh lý phòng thực tế (BR-04):</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Chủ cơ sở và khách thuê đã hoàn tất kiểm tra phòng và đồ đạc.</li>
                <li>Đã thanh toán tiền cọc thực hoàn (tiền mặt/chuyển khoản) trực tiếp ngoài đời.</li>
                <li>Thu hồi thẻ từ vật lý gửi xe hầm KTX (nếu khách có xe máy).</li>
              </ul>
            </div>

            <p className="text-xs text-slate-600">
              Sau khi bấm xác nhận: Hợp đồng sẽ chuyển sang <b className="text-slate-900">Đã thanh lý</b>, hồ sơ khách chuyển <b className="text-slate-900">Đã trả phòng</b>, và vị trí giường <b className="text-brand-700 font-mono">{sel.room}</b> tự động giải phóng về trạng thái <b className="text-success-700">Sẵn sàng</b> đón khách mới.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                className="h-10 rounded-sm border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setCheckoutModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                className="h-10 rounded-sm bg-danger-500 px-5 text-sm font-semibold text-white hover:bg-danger-600"
                onClick={handleConfirmCheckout}
              >
                Xác nhận thanh lý & Giải phóng giường
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
