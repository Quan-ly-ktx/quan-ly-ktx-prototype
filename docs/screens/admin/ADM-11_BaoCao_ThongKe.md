# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-11
## BÁO CÁO THỐNG KÊ, PHÂN TÍCH TIÊU THỤ & XUẤT DỮ LIỆU (REPORTING)

- **Mã màn hình:** `ADM-11`
- **Tên màn hình:** Trung tâm Báo cáo Doanh thu & Thống kê Vận hành
- **Đường dẫn (Route):** `/admin/reports-analytics`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX, Kế toán
- **Mã Use Case liên kết:** `UC-29`, `UC-30`, `UC-31`, `UC-32`, `UC-33`, `UC-34`
- **Mã yêu cầu chức năng (FR):** `FR-23`, `FR-24`, `FR-25`, `FR-26`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm báo cáo...                                        | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | BÁO CÁO & PHÂN TÍCH THỐNG KÊ                                [Xuất Excel .xlsx] [Xuất PDF]  |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| TAB PHÂN LOẠI BÁO CÁO:                                                                     |
|   Phòng &  | [1. DOANH THU & DÒNG TIỀN] [2. TỶ LỆ LẤP ĐẦY] [3. HAO TỔN ĐIỆN NƯỚC] [4. NỢ PHÍ QUÁ HẠN]  |
|   Giường   |--------------------------------------------------------------------------------------------|
|   Sinh viên| GIAO DIỆN TAB 3: BÁO CÁO PHÂN TÍCH TIÊU THỤ ĐIỆN NƯỚC BẤT THƯỜNG (FR-25 / UC-33)           |
|   Xếp phòng| Bộ lọc: [Kỳ: Tháng 10/2026 v] [Tòa nhà: Tòa A v] [Ngưỡng cảnh báo: Tăng đột biến > 150% v]|
|   Hợp đồng | +-------+------+--------------+--------------+-------------+-----------------------------+ |
|   Điện nước| | PHÒNG | TẦNG | ĐIỆN THÁNG NÀY| THÁNG TRƯỚC  | TỶ LỆ TĂNG  | ĐÁNH GIÁ NGUY CƠ & HÀNH ĐỘNG| |
|   Hóa đơn  | +-------+------+--------------+--------------+-------------+-----------------------------+ |
|   Sự cố    | | P.203 | T2   | 520 kWh      | 210 kWh      | [+ 147.6%]  | [!] Nghi vấn dùng bếp từ cấm| |
| * Báo cáo  | | P.305 | T3   | 45 m3 nước   | 14 m3 nước   | [+ 221.4%]  | [!] CẢNH BÁO RÒ RỈ ĐƯỜNG ỐNG| |
|   Cài đặt  | | P.102 | T1   | 240 kWh      | 235 kWh      | [+ 2.1%]    | Bình thường                 | |
|            | +-------+------+--------------+--------------+-------------+-----------------------------+ |
|            |                                                                                            |
|            | BIỂU ĐỒ SO SÁNH TIÊU THỤ ĐIỆN NƯỚC THEO TẦNG:                                              |
|            | [Biểu đồ cột chồng (Stacked Bar Chart): Điện (kWh) và Nước (m3) theo từng tầng]            |
|            |                                                                                            |
|            | THÔNG TIN XUẤT DỮ LIỆU ĐỊNH KỲ:                                                            |
|            | * Báo cáo doanh thu tài chính tháng: [Tải file Excel đầy đủ công thức tính phân bổ]        |
|            | * Báo cáo danh sách nợ quá hạn: [Tải danh sách PDF có dấu mộc KTX gửi nhà trường]          |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Các Báo Cáo Chuyên Sâu Theo Yêu Cầu SRS

1. **Báo cáo Doanh thu & Dòng tiền (UC-30 / FR-24):**
   - Phân tích cơ cấu nguồn thu: Thu tiền phòng (70%), Thu tiền điện nước (25%), Thu dịch vụ & phạt vi phạm (5%).
   - Tỷ lệ thu hồi công nợ: Số tiền đã vào tài khoản thực tế qua VietQR Napas so với dự toán phải thu.
2. **Báo cáo Tỷ lệ Lấp đầy Giường (Occupancy Report - UC-32 / FR-23):**
   - Số giường trống theo từng tòa nhà và từng tầng.
   - Thời gian trống bình quân của một vị trí giường trước khi có khách mới vào ở.
3. **Báo cáo Tiêu thụ Điện Nước Bất thường (Utility Anomaly - UC-33 / FR-25):**
   - Tự động phát hiện các phòng có mức tăng vọt sản lượng điện hoặc nước > 150% so với trung bình 3 tháng trước.
   - Giúp Ban Quản lý phát hiện sớm: Hiện tượng rò rỉ bồn cầu, vỡ ống ngầm, hoặc sinh viên lén lút cắm bếp từ/nồi lẩu công suất lớn trong phòng.
4. **Xuất Báo Cáo Đa Định Dạng (UC-34 / FR-26):**
   - Hỗ trợ xuất file Excel (`.xlsx`) nguyên bản kèm công thức phân bổ điện nước.
   - Hỗ trợ xuất báo cáo PDF chuẩn in ấn A4 (có tiêu đề KTX, ngày lập, người ký duyệt).

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Xuất Báo Cáo: `GET /api/v1/admin/reports/export?type=REVENUE&format=EXCEL&month=10&year=2026`

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "data": {
    "reportName": "Bao_Cao_Doanh_Thu_KTX_Thang_10_2026.xlsx",
    "downloadUrl": "/downloads/reports/revenue-202610-generated.xlsx",
    "generatedAt": "2026-10-06T20:20:00Z",
    "fileSizeBytes": 45820
  }
}
```
