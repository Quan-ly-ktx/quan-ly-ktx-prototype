import { useState, useRef, useEffect } from "react";
import { Button, Drawer, Icon, PageHeader } from "../../../components/common/index.ts";
import { money, person, type TenantRecord } from "../../../data.ts";
import { card, th, rowCls, Badge, type Toast } from "../common.tsx";

type Contract = {
  id: string;
  tenant: string;
  room: string;
  start: string;
  end: string;
  deposit: number;
  status: "Hiệu lực" | "Sắp hết hạn" | "Chờ xác nhận";
};

type ContractDocument = {
  contractId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
};

const contracts: Contract[] = [
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
    status: "Chờ xác nhận",
  },
];

const initialContractDocuments: ContractDocument[] = [
  {
    contractId: "HD-2026-0187",
    name: "hop-dong-thue-HD-2026-0187.pdf",
    size: 284000,
    type: "application/pdf",
    url: "/hop-dong-noi-quy-ktx.pdf",
    uploadedAt: "01/09/2026",
  },
];

export function ContractsPage({
  tenants,
  showToast,
}: Toast & { tenants: TenantRecord[] }) {
  const [sel, setSel] = useState<Contract | null>(null);
  const [documents, setDocuments] = useState(initialContractDocuments);
  const fileInput = useRef<HTMLInputElement>(null);
  const blobUrls = useRef<string[]>([]);
  const tone = (s: Contract["status"]) =>
    s === "Hiệu lực" ? "success" : s === "Sắp hết hạn" ? "warning" : "brand";
  const document = sel
    ? documents.find((item) => item.contractId === sel.id)
    : undefined;
  const contractRows: Contract[] = [
    ...contracts,
    ...tenants
      .filter(
        (tenant) =>
          !contracts.some((contract) => contract.tenant === tenant.name),
      )
      .map((tenant) => ({
        id: `HD-${tenant.start.slice(-4)}-${tenant.id.replace("NT-", "")}`,
        tenant: tenant.name,
        room: `${tenant.room} · ${tenant.bed}`,
        start: tenant.start,
        end: tenant.end,
        deposit: tenant.deposit,
        status:
          tenant.status === "Sắp hết HĐ"
            ? ("Sắp hết hạn" as const)
            : ("Hiệu lực" as const),
      })),
  ];

  useEffect(
    () => () => {
      blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const upload = (file?: File) => {
    if (!file || !sel) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      showToast("Chỉ chấp nhận tệp PDF, DOC hoặc DOCX");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Tài liệu hợp đồng không được vượt quá 10 MB");
      return;
    }
    const old = documents.find((item) => item.contractId === sel.id);
    if (old?.url.startsWith("blob:")) URL.revokeObjectURL(old.url);
    const url = URL.createObjectURL(file);
    blobUrls.current.push(url);
    const next: ContractDocument = {
      contractId: sel.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      uploadedAt: new Date().toLocaleDateString("vi-VN"),
    };
    setDocuments([
      ...documents.filter((item) => item.contractId !== sel.id),
      next,
    ]);
    showToast(`Đã tải tài liệu lên ${sel.id}`);
  };

  const download = (item: ContractDocument) => {
    const anchor = window.document.createElement("a");
    anchor.href = item.url;
    anchor.download = item.name;
    anchor.click();
  };

  return (
    <>
      <PageHeader
        eyebrow="Hợp đồng"
        title="Hợp đồng thuê"
        description="Quản lý thời hạn thuê, tiền cọc và tài liệu hợp đồng của từng người thuê."
        actions={<Badge tone="brand">Thời hạn: 1 Năm (Mặc định)</Badge>}
      />
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
            {contractRows.map((c) => (
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
                  <Badge tone={tone(c.status)}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {sel && (
        <Drawer
          title={sel.tenant}
          subtitle={sel.id}
          onClose={() => setSel(null)}
        >
          <Badge tone={tone(sel.status)}>{sel.status}</Badge>
          <dl className="mt-5 divide-y divide-slate-100 rounded-sm border border-slate-200 text-sm">
            {[
              ["CCCD", person(sel.tenant).cccd],
              ["Email", person(sel.tenant).email],
              ["Phòng / Giường", sel.room],
              ["Bắt đầu", sel.start],
              ["Kết thúc", sel.end],
              ["Thời hạn", "1 năm (mặc định)"],
              ["Tiền cọc", money(sel.deposit)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-medium text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <h3 className="font-heading text-sm font-bold text-slate-900">
              Tài liệu hợp đồng
            </h3>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => {
                upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {document ? (
              <div className="mt-3 rounded-sm border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <span className="icon-box icon-box-brand size-9">
                    <Icon name="file" className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {document.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(document.size / 1024).toFixed(0)} KB · tải lên{" "}
                      {document.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Button
                    label="Xem tài liệu"
                    className="h-9 rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() =>
                      window.open(document.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    Xem
                  </Button>
                  <Button
                    label="Tải tài liệu xuống"
                    className="h-9 rounded-sm border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
                    onClick={() => download(document)}
                  >
                    Tải xuống
                  </Button>
                  <Button
                    label="Thay tài liệu"
                    className="h-9 rounded-sm border border-brand-200 text-xs font-medium text-brand-700 hover:bg-brand-50 active:translate-y-[1px]"
                    onClick={() => fileInput.current?.click()}
                  >
                    Thay tệp
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                label="Tải tài liệu hợp đồng lên"
                className="mt-3 flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                onClick={() => fileInput.current?.click()}
              >
                <Icon name="file" className="size-6" />
                Tải PDF, DOC hoặc DOCX · tối đa 10 MB
              </Button>
            )}
          </div>
          <Button
            label="Đóng"
            className="mt-5 h-10 w-full rounded-sm border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
            onClick={() => setSel(null)}
          >
            Đóng
          </Button>
        </Drawer>
      )}
    </>
  );
}
