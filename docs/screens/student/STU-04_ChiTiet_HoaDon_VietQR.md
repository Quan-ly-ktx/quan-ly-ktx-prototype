# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-04
## CHI TIẾT TIỀN PHÒNG, ĐIỆN NƯỚC THEO NGÀY & THANH TOÁN VIETQR

- **Mã màn hình:** `STU-04`
- **Tên màn hình:** Chi tiết Hóa đơn & Quét mã VietQR Thanh toán
- **Đường dẫn (Route):** `/portal/invoices/:invoiceId`
- **Tác nhân chính:** Sinh viên, Khách thuê
- **Mã Use Case liên kết:** `UC-42`, `UC-43`
- **Mã yêu cầu chức năng (FR):** `FR-17`, `FR-18`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [< Quay lại]         HÓA ĐƠN THÁNG 10/2026        |
+---------------------------------------------------+
| TRẠNG THÁI: [ CHỜ THANH TOÁN - HẠN: 10/10/2026 ]  |
|                                                   |
| BẢNG KÊ MINH BẠCH CHI PHÍ SINH HOẠT:              |
| +-----------------------------------------------+ |
| | 1. TIỀN THUÊ GIƯỜNG THÁNG 10:                 | |
| |    Phòng P.102 - Giường 06        1,400,000 đ | |
| |                                               | |
| | 2. TIỀN ĐIỆN PHÂN BỔ THEO NGÀY THỰC Ở:        | |
| |    - Chỉ số công tơ: 1,420 -> 1,650 (230 kWh) | |
| |    - Tổng tiền điện cả phòng: 805,000 đ       | |
| |    - Số ngày bạn thực ở: 30 / 150 ngày-khách  | |
| |    - Phần tiền điện của bạn:        161,000 đ | |
| |                                               | |
| | 3. TIỀN NƯỚC PHÂN BỔ THEO NGÀY THỰC Ở:        | |
| |    - Chỉ số công tơ: 85 -> 97 (12 khối)       | |
| |    - Tổng tiền nước cả phòng: 240,000 đ       | |
| |    - Phần tiền nước của bạn:         48,000 đ | |
| |                                               | |
| | 4. DỊCH VỤ CỐ ĐỊNH (WIFI, RÁC, VỆ SINH):      | |
| |    - Trọn gói tháng 10:              41,000 đ | |
| | --------------------------------------------- | |
| | TỔNG CỘNG TIỀN PHẢI NỘP:          1,650,000 đ | |
| +-----------------------------------------------+ |
|                                                   |
| KHU VỰC QUÉT MÃ VIETQR ĐỘNG ĐỂ THANH TOÁN:        |
| +-----------------------------------------------+ |
| |             +-------------------+             | |
| |             |     [ẢNH QR]      |             | |
| |             |  VietQR Napas247  |             | |
| |             |  MB Bank 091234.. |             | |
| |             +-------------------+             | |
| |                                               | |
| | Số tài khoản: 09123456789     [Sao chép STK]  | |
| | Ngân hàng: Quân Đội (MB Bank)                 | |
| | Chủ tài khoản: BAN QUAN LY KTX TU NHAN        | |
| | Số tiền: 1,650,000 VNĐ        [Sao chép số]   | |
| | Nội dung: KTX P102 G06 T10    [Sao chép ND]   | |
| |                                               | |
| | +-------------------------------------------+ | |
| | | [ MỞ APP NGÂN HÀNG THANH TOÁN NGAY ]      | | |
| | +-------------------------------------------+ | |
| | [ Tải ảnh mã QR về thư viện máy ]             | |
| +-----------------------------------------------+ |
| Lưu ý: Tiền sẽ được gạch nợ tự động trong 1-3p.   |
+---------------------------------------------------+
```

---

### 2. Các Quy Chuẩn Trực Quan & Minh Bạch Chi Phí

- **Minh bạch theo ngày thực ở:** Hiển thị rõ công thức và số ngày thực ở của cá nhân để sinh viên hiểu tại sao mình phải trả số tiền đó, giải quyết triệt để khiếu nại giữa các bạn cùng phòng.
- **Tiện ích sao chép 1 chạm:** Mỗi trường (Số tài khoản, Số tiền, Nội dung chuyển khoản) đều có nút icon sao chép nhanh kèm hiệu ứng tooltip "Đã sao chép!".
- **Deep link mở ứng dụng ngân hàng:** Nút [MỞ APP NGÂN HÀNG] tự động kích hoạt intent trên iOS/Android để mở ứng dụng ngân hàng sẵn có trên thiết bị di động.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/portal/invoices/INV-2610-045`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": {
    "invoiceId": "INV-2610-045",
    "period": "10/2026",
    "status": "UNPAID",
    "dueDate": "2026-10-10",
    "breakdown": {
      "rentAmount": 1400000,
      "electric": {
        "roomTotalKwh": 230,
        "roomTotalCost": 805000,
        "personalDays": 30,
        "roomTotalDays": 150,
        "personalAmount": 161000
      },
      "water": {
        "roomTotalM3": 12,
        "roomTotalCost": 240000,
        "personalDays": 30,
        "roomTotalDays": 150,
        "personalAmount": 48000
      },
      "serviceFee": 41000,
      "totalAmount": 1650000
    },
    "vietQr": {
      "bankCode": "MB",
      "accountNumber": "09123456789",
      "accountName": "BAN QUAN LY KTX TU NHAN",
      "transferContent": "KTX P102 G06 T10",
      "qrImageUrl": "https://img.vietqr.io/image/970422-09123456789-compact2.png?amount=1650000&addInfo=KTX%20P102%20G06%20T10"
    }
  }
}
```
