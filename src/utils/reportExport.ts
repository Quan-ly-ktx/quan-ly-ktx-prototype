import ExcelJS from "exceljs";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { FacilityExpenseCategory } from "../types/invoice.ts";

export type ReportExport = { period: string; revenue: number; repairs: number; facility: number; difference: number; categories: Record<FacilityExpenseCategory, number>; demo?: boolean };

const rows = (report: ReportExport): [string, string | number][] => [
  ["Kỳ hóa đơn", report.period],
  ["Tiền thuê đã thu", report.revenue],
  ["Chi phí sửa chữa (vật tư)", report.repairs],
  ["Chi phí vận hành", report.facility],
  ["Lợi nhuận ròng (ước tính)", report.difference],
  ["Điện", report.categories["Điện EVN"] ?? 0],
  ["Nước", report.categories["Nước"] ?? 0],
  ["Internet", report.categories["Internet"] ?? 0],
  ["Tổng lương nhân viên", report.categories["Lương nhân viên"] ?? 0],
  ["Chi phí khác", report.categories["Khác"] ?? 0],
  ["Tổng chi phí", report.repairs + report.facility],
];

export async function createReportSpreadsheet(report: ReportExport): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Thu chi");
  sheet.addRow(["BÁO CÁO THU – CHI GHI NHẬN", report.demo ? "DỮ LIỆU DEMO" : ""]);
  rows(report).forEach((row) => sheet.addRow(row));
  sheet.addRow(["Ước tính dựa trên các khoản thu và chi đã được ghi nhận; có thể chưa bao gồm đầy đủ chi phí, thuế, khấu hao và nghĩa vụ khác."]);
  sheet.columns = [{ width: 45 }, { width: 28 }];
  return await workbook.xlsx.writeBuffer() as ArrayBuffer;
}

export async function createReportPdf(report: ReportExport, fontData: Uint8Array): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const font = await document.embedFont(fontData, { subset: true });
  const page = document.addPage([595, 842]);
  const lines = [
    `BÁO CÁO THU – CHI GHI NHẬN${report.demo ? " (DỮ LIỆU DEMO)" : ""}`,
    ...rows(report).map(([label, value]) => `${label}: ${typeof value === "number" ? `${value.toLocaleString("vi-VN")} đồng` : value}`),
    "Ước tính dựa trên các khoản thu và chi đã được ghi nhận; có thể chưa bao gồm đầy đủ chi phí, thuế, khấu hao và nghĩa vụ khác.",
  ];
  lines.forEach((line, index) => page.drawText(line.normalize("NFC"), { x: 48, y: 790 - index * 30, size: 12, font }));
  return document.save();
}
