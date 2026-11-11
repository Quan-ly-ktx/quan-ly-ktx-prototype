import { useState } from "react";
import { Button, Drawer, Icon, Modal, PageHeader } from "../../../components/common/index.ts";
import type { ContractDocumentRecord, ContractRecord } from "../../../types/tenant.ts";
import { money } from "../../../utils/formatters.ts";
import { card, th, rowCls, inputCls, Badge, SearchBox, Stat } from "../common.tsx";

type Props = {
  contracts: ContractRecord[];
  onRenewContract: (id: string, endDate: string) => Promise<void>;
  onCheckoutContract: (id: string, status: "AVAILABLE" | "MAINTENANCE") => Promise<void>;
  onAddContractDocuments: (id: string, documents: ContractDocumentRecord[]) => Promise<void>;
  onDeleteContractDocument: (id: string, documentId: string) => Promise<void>;
  showToast: (message: string) => void;
};

const CATEGORY_NAMES: Record<ContractDocumentRecord["category"], string> = {
  ORIGINAL_CONTRACT: "Hợp đồng gốc",
  RENEWAL_ANNEX: "Phụ lục gia hạn",
  CHECKOUT_HANDOVER: "Biên bản bàn giao",
  OTHER: "Tài liệu khác",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không đọc được tệp."));
    reader.onerror = () => reject(new Error("Không đọc được tệp."));
    reader.readAsDataURL(file);
  });
}
export function ContractsPage({
  contracts,
  onRenewContract,
  onCheckoutContract,
  onAddContractDocuments,
  onDeleteContractDocument,
  showToast,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [activeTab, setActiveTab] = useState<"overview" | "renewals" | "documents" | "actions">("overview");

  // Actions state
  const [endDate, setEndDate] = useState("");
  const [bedStatus, setBedStatus] = useState<"" | "AVAILABLE" | "MAINTENANCE">("");
  const [category, setCategory] = useState<ContractDocumentRecord["category"]>("ORIGINAL_CONTRACT");
  const [renewalId, setRenewalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  // Confirmation dialogs
  const [confirmRenewOpen, setConfirmRenewOpen] = useState(false);
  const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);
  const [deleteDocTarget, setDeleteDocTarget] = useState<ContractDocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ContractDocumentRecord | null>(null);

  const selected = contracts.find((item) => item.id === selectedId);

  const perform = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setActionError("");
    try {
      await action();
      showToast(successMessage);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể lưu thay đổi.";
      setActionError(msg);
      showToast(msg);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleRenew = async () => {
    if (!selected || !endDate || busy) return;
    const ok = await perform(() => onRenewContract(selected.id, endDate), "Đã gia hạn hợp đồng thành công.");
    if (ok) {
      setConfirmRenewOpen(false);
      setEndDate("");
    }
  };

  const handleCheckout = async () => {
    if (!selected || !bedStatus || busy) return;
    const ok = await perform(
      () => onCheckoutContract(selected.id, bedStatus),
      "Đã xác nhận bàn giao và thanh lý hợp đồng.",
    );
    if (ok) {
      setConfirmCheckoutOpen(false);
      setBedStatus("");
    }
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!selected || !files?.length) return;
    const fileList = Array.from(files);
    for (const file of fileList) {
      if (!/\.(jpe?g|png|webp|pdf|docx?)$/i.test(file.name)) {
        showToast(`Tệp ${file.name} không đúng định dạng (.jpg, .png, .webp, .pdf, .doc, .docx).`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Tệp ${file.name} vượt quá dung lượng tối đa 10 MB.`);
        return;
      }
    }

    await perform(async () => {
      const documents = await Promise.all(
        fileList.map(async (file): Promise<ContractDocumentRecord> => ({
          id: crypto.randomUUID(),
          contractId: selected.id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          content: await readFile(file),
          category,
          renewalId: category === "RENEWAL_ANNEX" ? renewalId || undefined : undefined,
          uploadedAt: new Date().toISOString(),
        })),
      );
      await onAddContractDocuments(selected.id, documents);
    }, "Đã lưu tài liệu hợp đồng trong dữ liệu demo.");
  };

  const handleDeleteDoc = async () => {
    if (!selected || !deleteDocTarget || busy) return;
    const ok = await perform(
      () => onDeleteContractDocument(selected.id, deleteDocTarget.id),
      `Đã xóa tài liệu "${deleteDocTarget.name}".`,
    );
    if (ok) {
      setDeleteDocTarget(null);
    }
  };

  const statusTone = (status: ContractRecord["status"]) =>
    status === "Hiệu lực" ? "success" : status === "Sắp hết hạn" ? "warning" : "slate";

  const activeCount = contracts.filter((c) => c.status === "Hiệu lực").length;
  const expiringCount = contracts.filter((c) => c.status === "Sắp hết hạn").length;
  const terminatedCount = contracts.filter((c) => c.status === "Đã thanh lý").length;

  const filteredContracts = contracts.filter((item) => {
    const matchesQuery =
      `${item.id} ${item.tenantName} ${item.room} ${item.bed}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "Tất cả trạng thái" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <>
      <PageHeader
        eyebrow="Hợp đồng"
        title="Vòng đời hợp đồng thuê"
        description="Gia hạn bằng phụ lục, quản lý tài liệu và xác nhận bàn giao (FR-10 / FR-12 / FR-13)."
      />

      {/* Stats Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon="contract"
          tone="brand"
          label="Tổng hợp đồng"
          value={String(contracts.length)}
          hint="Hồ sơ hợp đồng toàn hệ thống"
        />
        <Stat
          icon="check"
          tone="success"
          label="Đang hiệu lực"
          value={String(activeCount)}
          hint="Khách đang cư trú theo hạn HĐ"
        />
        <Stat
          icon="clock"
          tone="warning"
          label="Sắp hết hạn"
          value={String(expiringCount)}
          hint="Cần theo dõi gia hạn hoặc bàn giao"
        />
        <Stat
          icon="clipboard"
          tone="slate"
          label="Đã thanh lý"
          value={String(terminatedCount)}
          hint="Hợp đồng đã kết thúc bàn giao"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo mã HĐ, tên khách, phòng, giường..."
        />
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Trạng thái:</label>
          <select
            className={`${inputCls} max-w-48`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tất cả trạng thái</option>
            <option>Hiệu lực</option>
            <option>Sắp hết hạn</option>
            <option>Đã thanh lý</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <section className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className={th}>Mã hợp đồng</th>
              <th className={th}>Người thuê</th>
              <th className={th}>Vị trí phòng · giường</th>
              <th className={th}>Thời hạn hợp đồng</th>
              <th className={th}>Giá thuê snapshot</th>
              <th className={th}>Tiền cọc</th>
              <th className={th}>Trạng thái</th>
              <th className={`${th} text-right`}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((item) => (
              <tr
                key={item.id}
                className={`${rowCls} cursor-pointer`}
                onClick={() => {
                  setSelectedId(item.id);
                  setBedStatus("");
                  setEndDate("");
                  setActionError("");
                  setActiveTab("overview");
                }}
              >
                <td className="px-6 py-4 font-mono text-sm font-semibold text-brand-700">
                  {item.id}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{item.tenantName}</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-700">
                  {item.room} · {item.bed}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                  {item.startDate} → {item.endDate}
                </td>
                <td className="px-6 py-4 font-mono text-sm font-medium text-slate-900">
                  {money(item.monthlyRent)}/tháng
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-700">
                  {money(item.deposit)}
                </td>
                <td className="px-6 py-4">
                  <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    className="inline-flex h-8 items-center gap-1 rounded-sm border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(item.id);
                      setBedStatus("");
                      setEndDate("");
                      setActionError("");
                      setActiveTab("overview");
                    }}
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
            {filteredContracts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                  <span className="mx-auto grid size-10 place-items-center rounded-sm bg-slate-100 text-slate-400 mb-2">
                    <Icon name="search" className="size-5" />
                  </span>
                  Không tìm thấy hợp đồng nào phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Contract Detail Drawer */}
      {selected && (
        <Drawer
          title={`Hợp đồng ${selected.id}`}
          subtitle={`${selected.tenantName} · Phòng ${selected.room} · Giường ${selected.bed}`}
          onClose={() => {
            setSelectedId(null);
            setActionError("");
          }}
        >
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge tone={statusTone(selected.status)}>{selected.status}</Badge>
            <span className="font-mono text-xs text-slate-500">
              {selected.startDate} → {selected.endDate}
            </span>
          </div>

          {actionError && (
            <div className="mb-4 rounded-sm border border-danger-200 bg-danger-50 p-3 text-xs text-danger-700" role="alert">
              {actionError}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-5">
            {[
              ["overview", "Tổng quan"],
              ["renewals", `Phụ lục (${selected.renewals?.length ?? 0})`],
              ["documents", `Tài liệu (${selected.documents?.length ?? 0})`],
              ["actions", "Xử lý HĐ"],
            ].map(([tabKey, tabLabel]) => (
              <button
                key={tabKey}
                type="button"
                className={`flex-1 border-b-2 py-2.5 text-center text-xs font-semibold transition-all ${
                  activeTab === tabKey
                    ? "border-brand-500 text-brand-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
                onClick={() => {
                  setActiveTab(tabKey as typeof activeTab);
                  setActionError("");
                }}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <section className="rounded-sm border border-slate-200 bg-slate-50/50 p-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Thông tin người thuê & vị trí
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Họ tên người thuê</dt>
                    <dd className="mt-0.5 font-bold text-slate-900">{selected.tenantName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Mã người thuê</dt>
                    <dd className="mt-0.5 font-mono text-slate-800">{selected.tenantId}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phòng ở</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-slate-900">{selected.room}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Vị trí giường</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-slate-900">{selected.bed}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-sm border border-slate-200 bg-slate-50/50 p-4">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Thời hạn & Giá thuê snapshot
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Ngày bắt đầu</dt>
                    <dd className="mt-0.5 font-mono text-slate-900">{selected.startDate}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Ngày kết thúc</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-slate-900">{selected.endDate}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Giá thuê gốc snapshot</dt>
                    <dd className="mt-0.5 font-mono font-bold text-brand-700">{money(selected.monthlyRent)}/tháng</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Tiền cọc phòng</dt>
                    <dd className="mt-0.5 font-mono font-bold text-slate-900">{money(selected.deposit)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2">
                  * Giá thuê và tiền cọc được snapshot cố định tại thời điểm ký hợp đồng ban đầu theo quy tắc BR-03.
                </p>
              </section>
            </div>
          )}

          {/* Tab 2: Renewals & Annexes */}
          {activeTab === "renewals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Lịch sử gia hạn hợp đồng
                </h3>
                <span className="text-xs text-slate-500">
                  {selected.renewals?.length ?? 0} phụ lục
                </span>
              </div>

              {(selected.renewals ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(selected.renewals ?? []).map((renewal, index) => (
                    <article
                      key={renewal.id}
                      className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-brand-700">
                          Phụ lục #{index + 1}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          Ký ngày: {renewal.signedAt}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-700">
                        <p>
                          <span className="text-slate-500">Thời hạn áp dụng:</span>{" "}
                          <span className="font-mono font-medium">{renewal.startDate} → {renewal.endDate}</span>
                        </p>
                        <p className="mt-1">
                          <span className="text-slate-500">Giá thuê mới:</span>{" "}
                          <span className="font-mono font-bold text-brand-700">{money(renewal.monthlyRent)}/tháng</span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  Chưa có phụ lục gia hạn nào cho hợp đồng này.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Contract Documents */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Tải lên tài liệu hợp đồng
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Hỗ trợ tải nhiều file (.jpg, .png, .webp, .pdf, .docx). Tối đa 10 MB/tệp.
                </p>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <label className="block">
                    <span className="font-semibold text-slate-700 mb-1 block">Phân loại tài liệu</span>
                    <select
                      className={`${inputCls} h-9 text-xs`}
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ContractDocumentRecord["category"])}
                    >
                      <option value="ORIGINAL_CONTRACT">Hợp đồng gốc</option>
                      <option value="RENEWAL_ANNEX">Phụ lục gia hạn</option>
                      <option value="CHECKOUT_HANDOVER">Biên bản bàn giao</option>
                      <option value="OTHER">Tài liệu khác</option>
                    </select>
                  </label>

                  {category === "RENEWAL_ANNEX" && (
                    <label className="block">
                      <span className="font-semibold text-slate-700 mb-1 block">Gắn với phụ lục</span>
                      <select
                        className={`${inputCls} h-9 text-xs`}
                        value={renewalId}
                        onChange={(e) => setRenewalId(e.target.value)}
                      >
                        <option value="">Chọn phụ lục liên quan</option>
                        {selected.renewals?.map((r, i) => (
                          <option key={r.id} value={r.id}>
                            Phụ lục #{i + 1} ({r.startDate} → {r.endDate})
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="mt-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]">
                    <Icon name="file" className="size-4" />
                    <span>Chọn tệp tài liệu</span>
                    <input
                      aria-label="Chọn tài liệu"
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                      disabled={busy}
                      className="hidden"
                      onChange={(event) => {
                        void uploadFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-700">Danh sách tài liệu đã lưu</h4>
                {(selected.documents ?? []).length > 0 ? (
                  <ul className="divide-y divide-slate-100 rounded-sm border border-slate-200 bg-white">
                    {(selected.documents ?? []).map((doc) => {
                      const isImg = /\.(jpe?g|png|webp|gif|svg)$/i.test(doc.name);
                      const isPdf = /\.pdf$/i.test(doc.name);
                      return (
                        <li key={doc.id} className="flex items-center justify-between p-3 text-xs gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                            <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-slate-400">
                              <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-slate-600 font-sans">
                                {CATEGORY_NAMES[doc.category] || doc.category}
                              </span>
                              <span>·</span>
                              <span>{formatFileSize(doc.size)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isImg && (doc.content || doc.url) && (
                              <Button
                                className="h-7 rounded-sm border border-slate-200 bg-white px-2 text-[11px] font-semibold text-brand-700 hover:bg-slate-50"
                                onClick={() => setPreviewDoc(doc)}
                              >
                                Xem ảnh
                              </Button>
                            )}
                            {isPdf && (doc.content || doc.url) && (
                              <a
                                href={doc.content || doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-7 inline-flex items-center rounded-sm border border-slate-200 bg-white px-2 text-[11px] font-semibold text-brand-700 hover:bg-slate-50"
                              >
                                Mở PDF
                              </a>
                            )}
                            {(doc.content || doc.url) && (
                              <a
                                href={doc.content || doc.url}
                                download={doc.name}
                                className="h-7 inline-flex items-center rounded-sm border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Tải về
                              </a>
                            )}
                            <Button
                              className="h-7 rounded-sm border border-danger-200 bg-white px-2 text-[11px] font-semibold text-danger-600 hover:bg-danger-50"
                              disabled={busy}
                              onClick={() => setDeleteDocTarget(doc)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-sm border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    Chưa có tài liệu đính kèm nào.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Actions (Renew & Checkout) */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              {selected.status === "Đã thanh lý" ? (
                <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Hợp đồng này đã được thanh lý.</p>
                  <p className="mt-1">
                    Hợp đồng đã thanh lý không thể gia hạn thêm hoặc bàn giao lại. Dữ liệu công nợ và phương tiện cũ được bảo lưu theo quy tắc FR-13.
                  </p>
                </div>
              ) : (
                <>
                  {/* Renewal Section */}
                  <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-1">
                      Gia hạn hợp đồng (FR-12)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Gia hạn tạo phụ lục mới, snapshot theo giá phòng hiện hành. Hạn mới phải là ngày cuối tháng và sau hạn hiện tại ({selected.endDate}).
                    </p>
                    <div className="space-y-3">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Ngày kết thúc kỳ hạn mới (Ngày cuối tháng)
                        </span>
                        <input
                          type="date"
                          className={inputCls}
                          value={endDate}
                          min={selected.endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </label>
                      <Button
                        disabled={busy || !endDate}
                        className="w-full h-9 rounded-sm bg-brand-500 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px] disabled:bg-slate-200 disabled:text-slate-400"
                        onClick={() => setConfirmRenewOpen(true)}
                      >
                        Tiến hành gia hạn hợp đồng
                      </Button>
                    </div>
                  </section>

                  {/* Checkout Section */}
                  <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
                    <h3 className="font-heading text-sm font-bold text-slate-900 mb-1">
                      Bàn giao phòng & Thanh lý hợp đồng (FR-13)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Công nợ chưa tất toán được bảo lưu; thẻ xe chưa thu hồi sẽ tự động thu hồi. Vui lòng chọn trạng thái của giường sau bàn giao.
                    </p>
                    <div className="space-y-3">
                      <label className="block">
                        <span className="block text-xs font-semibold text-slate-700 mb-1">
                          Trạng thái giường sau khi bàn giao
                        </span>
                        <select
                          className={inputCls}
                          value={bedStatus}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBedStatus(val === "AVAILABLE" || val === "MAINTENANCE" ? val : "");
                          }}
                        >
                          <option value="">Chọn trạng thái tiếp theo của giường</option>
                          <option value="AVAILABLE">Sẵn sàng (AVAILABLE) — Có thể đón khách mới</option>
                          <option value="MAINTENANCE">Bảo trì (MAINTENANCE) — Cần vệ sinh / sửa chữa</option>
                        </select>
                      </label>
                      <Button
                        disabled={busy || !bedStatus}
                        className="w-full h-9 rounded-sm bg-danger-600 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px] disabled:bg-slate-200 disabled:text-slate-400"
                        onClick={() => setConfirmCheckoutOpen(true)}
                      >
                        Tiến hành bàn giao & thanh lý
                      </Button>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </Drawer>
      )}

      {/* Confirmation Modal: Renew */}
      {confirmRenewOpen && selected && (
        <Modal
          title="Xác nhận gia hạn hợp đồng"
          description={`Gia hạn hợp đồng ${selected.id} cho người thuê ${selected.tenantName}`}
          onClose={() => setConfirmRenewOpen(false)}
        >
          <div className="p-6 space-y-4 text-sm text-slate-700">
            <p>
              Bạn đang chuẩn bị gia hạn hợp đồng tới ngày{" "}
              <strong className="font-mono text-brand-700">{endDate}</strong>.
            </p>
            <div className="rounded-sm bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p>• Hệ thống sẽ kiểm tra công nợ: nếu khách còn nợ, thao tác sẽ bị từ chối.</p>
              <p>• Phụ lục gia hạn mới sẽ snapshot giá phòng hiện hành.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmRenewOpen(false)}
              >
                Hủy
              </Button>
              <Button
                disabled={busy}
                className="h-9 rounded-sm bg-brand-500 px-4 text-xs font-semibold text-white hover:bg-brand-600 active:translate-y-[1px]"
                onClick={() => void handleRenew()}
              >
                {busy ? "Đang xử lý..." : "Xác nhận gia hạn"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Checkout */}
      {confirmCheckoutOpen && selected && (
        <Modal
          title="Xác nhận thanh lý hợp đồng"
          description={`Thanh lý hợp đồng ${selected.id} của khách thuê ${selected.tenantName}`}
          onClose={() => setConfirmCheckoutOpen(false)}
        >
          <div className="p-6 space-y-4 text-sm text-slate-700">
            <p className="text-danger-600 font-semibold">
              Cảnh báo: Hành động này sẽ chuyển trạng thái hợp đồng sang "Đã thanh lý".
            </p>
            <div className="rounded-sm bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p>• Giường <strong>{selected.bed}</strong> tại phòng <strong>{selected.room}</strong> sẽ chuyển sang trạng thái <strong>{bedStatus === "AVAILABLE" ? "Sẵn sàng" : "Bảo trì"}</strong>.</p>
              <p>• Thẻ xe đang hiệu lực sẽ tự động thu hồi.</p>
              <p>• Mọi khoản công nợ chưa trả vẫn được bảo toàn để thu hồi nợ cũ.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmCheckoutOpen(false)}
              >
                Hủy
              </Button>
              <Button
                disabled={busy}
                className="h-9 rounded-sm bg-danger-600 px-4 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px]"
                onClick={() => void handleCheckout()}
              >
                {busy ? "Đang xử lý..." : "Xác nhận thanh lý"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Delete Document */}
      {deleteDocTarget && selected && (
        <Modal
          title="Xác nhận xóa tài liệu"
          description={`Xóa tài liệu khỏi hợp đồng ${selected.id}`}
          onClose={() => setDeleteDocTarget(null)}
        >
          <div className="p-6 space-y-4 text-sm text-slate-700">
            <p>
              Bạn có chắc chắn muốn xóa tài liệu <strong>{deleteDocTarget.name}</strong> không?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setDeleteDocTarget(null)}
              >
                Hủy
              </Button>
              <Button
                disabled={busy}
                className="h-9 rounded-sm bg-danger-600 px-4 text-xs font-semibold text-white hover:bg-danger-700 active:translate-y-[1px]"
                onClick={() => void handleDeleteDoc()}
              >
                {busy ? "Đang xóa..." : "Xóa tài liệu"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview Modal for Images */}
      {previewDoc && (
        <Modal
          title={previewDoc.name}
          description={`${CATEGORY_NAMES[previewDoc.category] || previewDoc.category} · ${formatFileSize(previewDoc.size)}`}
          onClose={() => setPreviewDoc(null)}
          wide
        >
          <div className="p-6 text-center">
            {previewDoc.content || previewDoc.url ? (
              <img
                src={previewDoc.content || previewDoc.url}
                alt={previewDoc.name}
                className="max-h-[70vh] mx-auto rounded-sm border border-slate-200 object-contain shadow-xs"
              />
            ) : (
              <p className="text-sm text-slate-500">Không có dữ liệu hình ảnh để hiển thị.</p>
            )}
            <div className="mt-4 flex justify-center">
              <Button
                className="h-9 rounded-sm border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setPreviewDoc(null)}
              >
                Đóng xem trước
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
