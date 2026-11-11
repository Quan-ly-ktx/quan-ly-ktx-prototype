import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { createReportSpreadsheet } from "../utils/reportExport.ts";

test("spreadsheet contains the selected period and the recorded income and cost totals", async () => {
  const bytes = await createReportSpreadsheet({ period: "2026-10", revenue: 1500000, repairs: 100000, facility: 200000, difference: 1200000, categories: { "Điện EVN": 0, "Nước": 200000, "Internet": 0, "Lương nhân viên": 0, "Khác": 0 } });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  const sheet = workbook.getWorksheet("Thu chi");
  assert.ok(sheet);
  assert.equal(sheet.getCell("B2").value, "2026-10");
  assert.equal(sheet.getCell("B3").value, 1500000);
  assert.equal(sheet.getCell("B4").value, 100000);
  assert.equal(sheet.getCell("B5").value, 200000);
  assert.equal(sheet.getCell("B6").value, 1200000);
  assert.equal(sheet.getCell("B8").value, 200000);
});
