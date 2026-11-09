import { useState } from "react";
import { Button, Modal, PageHeader } from "../../../components/common/index.ts";
import type { ContractDocumentRecord, ContractRecord } from "../../../types/tenant.ts";
import { money } from "../../../utils/formatters.ts";

type Props = {
  contracts: ContractRecord[];
  onRenewContract: (id: string, endDate: string) => Promise<void>;
  onCheckoutContract: (id: string, status: "AVAILABLE" | "MAINTENANCE") => Promise<void>;
  onAddContractDocuments: (id: string, documents: ContractDocumentRecord[]) => Promise<void>;
  onDeleteContractDocument: (id: string, documentId: string) => Promise<void>;
  showToast: (message: string) => void;
};
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không đọc được tệp."));
    reader.onerror = () => reject(new Error("Không đọc được tệp."));
    reader.readAsDataURL(file);
  });
}
export function ContractsPage({ contracts, onRenewContract, onCheckoutContract, onAddContractDocuments, onDeleteContractDocument, showToast }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [endDate, setEndDate] = useState("");
  const [bedStatus, setBedStatus] = useState<"" | "AVAILABLE" | "MAINTENANCE">("");
  const [category, setCategory] = useState<ContractDocumentRecord["category"]>("ORIGINAL_CONTRACT");
  const [renewalId, setRenewalId] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const selected = contracts.find((item) => item.id === selectedId);
  const perform = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    try { await action(); showToast(message); }
    catch (error) { showToast(error instanceof Error ? error.message : "Không thể lưu thay đổi."); }
    finally { setBusy(false); }
  };
  const upload = async (files: FileList | null) => {
    if (!selected || !files?.length) return;
    await perform(async () => {
      const documents = await Promise.all(Array.from(files, async (file): Promise<ContractDocumentRecord> => ({
        id: crypto.randomUUID(), contractId: selected.id, name: file.name, size: file.size, type: file.type,
        content: await readFile(file), category, renewalId: category === "RENEWAL_ANNEX" ? renewalId : undefined,
        uploadedAt: new Date().toISOString(),
      })));
      await onAddContractDocuments(selected.id, documents);
    }, "Đã lưu tài liệu hợp đồng trong dữ liệu demo.");
  };
  return <>
    <PageHeader eyebrow="Hợp đồng" title="Vòng đời hợp đồng thuê" description="Gia hạn bằng phụ lục, quản lý tài liệu và xác nhận bàn giao." />
    <label className="block mb-4">Tìm hợp đồng <input className="border p-2 ml-2" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <div className="overflow-x-auto bg-white border"><table className="w-full text-left text-sm"><thead><tr><th>Hợp đồng</th><th>Người thuê</th><th>Vị trí</th><th>Hạn</th><th>Trạng thái</th></tr></thead><tbody>
      {contracts.filter((item) => `${item.id} ${item.tenantName} ${item.room}`.toLowerCase().includes(query.toLowerCase())).map((item) => <tr key={item.id} className="border-t"><td><button className="text-brand-700 underline p-3" onClick={() => { setSelectedId(item.id); setBedStatus(""); setEndDate(""); }}>{item.id}</button></td><td>{item.tenantName}</td><td>{item.room} · {item.bed}</td><td>{item.endDate}</td><td>{item.status}</td></tr>)}
    </tbody></table></div>
    {selected && <Modal title={`Hợp đồng ${selected.id}`} description={`${selected.tenantName} · ${selected.room} · ${selected.bed}`} onClose={() => setSelectedId(null)} wide>
      <div className="space-y-5 p-6 text-sm">
        <p>{selected.startDate} → {selected.endDate} · Giá gốc {money(selected.monthlyRent)}/tháng · Cọc {money(selected.deposit)}</p>
        <section><h3 className="font-bold">Phụ lục</h3>{(selected.renewals ?? []).map((item) => <p key={item.id}>{item.startDate} → {item.endDate}: {money(item.monthlyRent)}/tháng</p>)}</section>
        {selected.status !== "Đã thanh lý" && <>
          <section className="space-y-2"><h3 className="font-bold">Gia hạn</h3><label>Ngày cuối kỳ mới <input type="date" className="border p-2 ml-2" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><Button disabled={busy || !endDate} onClick={() => void perform(() => onRenewContract(selected.id, endDate), "Đã gia hạn hợp đồng.")}>Xác nhận gia hạn</Button></section>
          <section className="space-y-2"><h3 className="font-bold">Bàn giao và thanh lý</h3><p>Công nợ được giữ nguyên; xe chưa thu hồi sẽ được thu hồi.</p><label>Trạng thái giường sau bàn giao <select className="border p-2" value={bedStatus} onChange={(event) => setBedStatus(event.target.value === "AVAILABLE" || event.target.value === "MAINTENANCE" ? event.target.value : "")}><option value="">Chọn trạng thái</option><option value="AVAILABLE">Sẵn sàng</option><option value="MAINTENANCE">Bảo trì</option></select></label><Button disabled={busy || !bedStatus} onClick={() => { if (bedStatus) void perform(() => onCheckoutContract(selected.id, bedStatus), "Đã xác nhận bàn giao và thanh lý."); }}>Xác nhận thanh lý</Button></section>
        </>}
        <section className="space-y-2"><h3 className="font-bold">Tài liệu demo</h3><p>Chỉ lưu trong trình duyệt; không chứng minh lưu trữ private OCI.</p>
          <label>Loại tài liệu <select value={category} onChange={(event) => { const value = event.target.value; if (value === "ORIGINAL_CONTRACT" || value === "RENEWAL_ANNEX" || value === "CHECKOUT_HANDOVER" || value === "OTHER") setCategory(value); }}><option value="ORIGINAL_CONTRACT">Hợp đồng gốc</option><option value="RENEWAL_ANNEX">Phụ lục</option><option value="CHECKOUT_HANDOVER">Bàn giao</option><option value="OTHER">Khác</option></select></label>
          {category === "RENEWAL_ANNEX" && <label>Phụ lục <select value={renewalId} onChange={(event) => setRenewalId(event.target.value)}><option value="">Chọn phụ lục</option>{selected.renewals?.map((item) => <option key={item.id} value={item.id}>{item.startDate} → {item.endDate}</option>)}</select></label>}
          <input aria-label="Chọn tài liệu" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx" disabled={busy} onChange={(event) => { void upload(event.target.files); event.target.value = ""; }} />
          {(selected.documents ?? []).map((doc) => <div key={doc.id}><a className="underline" href={doc.content} download={doc.name}>{doc.name}</a> <button disabled={busy} onClick={() => void perform(() => onDeleteContractDocument(selected.id, doc.id), "Đã xóa tài liệu.")}>Xóa</button></div>)}
        </section>
      </div>
    </Modal>}
  </>;
}
