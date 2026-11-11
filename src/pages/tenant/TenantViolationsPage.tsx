import { useState } from "react";
import { Button, Drawer, Icon } from "../../components/common/index.ts";
import { money } from "../../utils/formatters.ts";
import type { PersonalViolation } from "./tenantConstants.tsx";

const violationLevelTone: Record<PersonalViolation["level"], { tone: "danger" | "warning" | "slate"; label: string }> = {
  "Phạt tiền": { tone: "danger", label: "Phạt tiền" },
  "Cảnh cáo": { tone: "warning", label: "Cảnh cáo" },
  "Nhắc nhở": { tone: "slate", label: "Nhắc nhở" },
};

export function TenantViolationsPage({
  violations,
}: {
  violations: PersonalViolation[];
}) {
  const [selectedViolation, setSelectedViolation] = useState<PersonalViolation | null>(null);

  return (
    <>
      <section className="mb-8">
        <div className="text-sm font-semibold text-brand-700">
          KỶ LUẬT & NỘI QUY · HỒ SƠ CƯ TRÚ
        </div>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-950">
          Lịch sử vi phạm nội quy
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Biên bản vi phạm do Ban Quản lý lập và lưu trữ trong hồ sơ cư trú cá nhân (BR-07 / FR-19).
        </p>
      </section>

      {/* Policy Explainer Box */}
      <div className="mb-6 rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
        <p className="font-semibold text-slate-800">Quy định về biên bản kỷ luật & tiền phạt:</p>
        <p className="mt-1">
          Hồ sơ vi phạm được gắn trực tiếp với mã khách thuê để theo dõi lịch sử sinh hoạt. Các khoản tiền phạt (nếu có) được nộp trực tiếp ngoài thực tế, mang tính chất chế tài hành chính và <strong>không tạo hóa đơn, công nợ hay liên kết với thanh toán tiền phòng</strong>. Khách thuê sau khi trả phòng vẫn có quyền tra cứu lại lịch sử này.
        </p>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {violations.map((v) => {
          const config = violationLevelTone[v.level] ?? { tone: "slate", label: v.level };
          const toneCls =
            config.tone === "danger"
              ? "status-label-danger"
              : config.tone === "warning"
                ? "status-label-warning"
                : "status-label-slate";

          return (
            <article
              key={v.id}
              className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs hover:border-brand-500 transition-colors cursor-pointer"
              onClick={() => setSelectedViolation(v)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-brand-700">
                    {v.id}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">Ngày lập: {v.date}</span>
                </div>
                <span className={`status-label ${toneCls}`}>
                  {config.label}
                  {v.fine ? ` · ${money(v.fine)}` : ""}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Hành vi vi phạm: {v.type}
                </h3>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {v.note}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-brand-600 font-medium">Bấm để xem chi tiết biên bản</span>
                {v.fine ? (
                  <span className="font-mono text-slate-500">
                    Mức phạt: <strong className="text-danger-600">{money(v.fine)}</strong> (nộp ngoài đời)
                  </span>
                ) : (
                  <span className="text-slate-400">Không có tiền phạt</span>
                )}
              </div>
            </article>
          );
        })}

        {violations.length === 0 && (
          <div className="rounded-sm border border-dashed border-slate-300 bg-white p-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-sm bg-success-50 text-success-600">
              <Icon name="check" className="size-6" />
            </span>
            <h3 className="mt-3 font-heading text-sm font-bold text-slate-900">
              Lịch sử cư trú tốt
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Bạn không có bất kỳ biên bản vi phạm nội quy nào trong suốt quá trình lưu trú tại KTX Hub.
            </p>
          </div>
        )}
      </div>

      {/* Violation Detail Drawer */}
      {selectedViolation && (
        <Drawer
          title={`Biên bản vi phạm ${selectedViolation.id}`}
          subtitle={`Ngày lập: ${selectedViolation.date}`}
          onClose={() => setSelectedViolation(null)}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`status-label ${
                selectedViolation.level === "Phạt tiền"
                  ? "status-label-danger"
                  : selectedViolation.level === "Cảnh cáo"
                    ? "status-label-warning"
                    : "status-label-slate"
              }`}
            >
              {selectedViolation.level}
            </span>
            <span className="status-label status-label-brand">
              {selectedViolation.type}
            </span>
          </div>

          <dl className="divide-y divide-slate-100 rounded-sm border border-slate-200 text-xs mb-4">
            {[
              ["Mã biên bản", selectedViolation.id],
              ["Ngày ghi nhận", selectedViolation.date],
              ["Loại vi phạm", selectedViolation.type],
              ["Hình thức xử lý", selectedViolation.level],
              ...(selectedViolation.fine
                ? [["Tiền phạt tham khảo", money(selectedViolation.fine)]]
                : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-3 py-2.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Detailed Narrative */}
          <div className="rounded-sm border border-slate-200 bg-slate-50 p-4 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Diễn biến sự việc & Ghi chú của Quản lý
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {selectedViolation.note}
            </p>
          </div>

          {selectedViolation.fine && (
            <div className="rounded-sm border border-danger-200 bg-danger-50/50 p-4 mb-4 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-danger-700 mb-1">
                Lưu ý về khoản tiền phạt ({money(selectedViolation.fine)}):
              </p>
              <p>
                Số tiền này chỉ là mức phạt tham khảo ghi trong biên bản, được nộp trực tiếp tại Văn phòng Ban Quản lý. <strong>Ứng dụng không thu tiền phạt online và không ghi nhận vào hóa đơn tiền phòng.</strong>
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button
              label="Đóng chi tiết"
              className="h-10 w-full rounded-sm border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:translate-y-[1px]"
              onClick={() => setSelectedViolation(null)}
            >
              Đóng chi tiết biên bản
            </Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
