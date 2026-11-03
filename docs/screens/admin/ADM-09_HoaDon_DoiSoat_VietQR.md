# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-09
## QUẢN LÝ HÓA ĐƠN, ĐỐI SOÁT & THANH TOÁN VIETQR ĐỘNG
*Giải quyết Bài toán cốt lõi #4 của KTX Tư nhân: Tích hợp mã VietQR động & Đối soát tự động*

- **Mã màn hình:** `ADM-09`
- **Tên màn hình:** Quản lý Thu chi Hóa đơn & Đối soát Giao dịch
- **Đường dẫn (Route):** `/admin/billing-invoices`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX, Kế toán
- **Mã Use Case liên kết:** `UC-42`, `UC-43`
- **Mã yêu cầu chức năng (FR):** `FR-17`, `FR-18`, `FR-24`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm mã HĐ, tên sinh viên, số phòng... [Enter]         | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN LÝ HÓA ĐƠN THU TIỀN & ĐỐI SOÁT VIETQR              [Gửi nhắc nợ tất cả] [Xuất Excel]  |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| BỘ LỌC HÓA ĐƠN:                                                                            |
|   Phòng &  | [Kỳ: Tháng 10/2026 v] [Trạng thái: Tất cả | Đã nộp (98) | Chờ nộp (45) | Quá hạn (15)]        |
|   Giường   | [Loại: Tiền phòng & điện nước | Tiền cọc | Phạt kỷ luật]                                   |
|   Sinh viên|--------------------------------------------------------------------------------------------|
|   Xếp phòng| BẢNG DỮ LIỆU HÓA ĐƠN (DATA TABLE)                                                          |
|   Hợp đồng | +--------------+--------------------+-----------+-------------+------------+-------------+ |
|   Điện nước| | MÃ HÓA ĐƠN   | SINH VIÊN          | PHÒNG/G   | TỔNG TIỀN   | HẠN NỘP    | TRẠNG THÁI  | |
| * Hóa đơn  | +--------------+--------------------+-----------+-------------+------------+-------------+ |
|   Sự cố    | | INV-2610-001 | Nguyễn Văn Nam     | P.302-G01 | 1,789,000 đ | 05/10/2026 | [ĐÃ NỘP]    | |
|   Báo cáo  | | INV-2610-002 | Lê Văn Hùng        | P.302-G02 | 1,789,000 đ | 05/10/2026 | [QUÁ HẠN]   | |
|   Cài đặt  | | INV-2610-045 | Trần Thị Thảo      | P.102-G04 | 1,650,000 đ | 10/10/2026 | [CHỜ NỘP]   | |
|            | +--------------+--------------------+-----------+-------------+------------+-------------+ |
|            |--------------------------------------------------------------------------------------------|
|            | MODAL CHI TIẾT HÓA ĐƠN & MÃ VIETQR ĐỘNG NAPAS247 (KHI CLICK XEM):                          |
|            | +----------------------------------------------------------------------------------------+ |
|            | | HÓA ĐƠN TIỀN PHÒNG & TIỆN ÍCH - THÁNG 10/2026                                          | |
|            | | Mã: INV-2610-002 | Khách: Lê Văn Hùng | Phòng P.302 - Giường 02                        | |
|            | |                                                                                        | |
|            | | BẢNG KÊ CHI PHÍ:                                                                       | |
|            | | - Tiền phòng tháng 10:               1,500,000 VNĐ                                     | |
|            | | - Tiền điện (30 ngày phân bổ):         161,000 VNĐ                                     | |
|            | | - Tiền nước (30 ngày phân bổ):          48,000 VNĐ                                     | |
|            | | - Tiền dịch vụ (Wifi, rác, vệ sinh):    80,000 VNĐ                                     | |
|            | | --------------------------------------------------                                     | |
|            | | TỔNG CỘNG CẦN THANH TOÁN:            1,789,000 VNĐ                                     | |
|            | |                                                                                        | |
|            | | +-----------------------+   THÔNG TIN THANH TOÁN CHUYỂN KHOẢN:                         | |
|            | | |       [ẢNH QR]        |   Ngân hàng: MB Bank (Napas247)                              | |
|            | | |   Mã VietQR động      |   Số TK: 09123456789                                         | |
|            | | |   Nạp sẵn số tiền     |   Chủ TK: BAN QUAN LY KTX TU NHAN                            | |
|            | | |   và nội dung chuẩn   |   Số tiền: 1,789,000 VNĐ                                     | |
|            | | +-----------------------+   Nội dung: KTX P302 G02 THANG10                             | |
|            | |                                                                                        | |
|            | | [ Tải ảnh QR ]   [ Gửi nhắc nợ cá nhân ]   [ Gạch nợ thủ công (Đã nhận tiền mặt) ]     | |
|            | +----------------------------------------------------------------------------------------+ |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Tiêu Chuẩn Sinh Mã VietQR Động (Dynamic VietQR Standard)

Để tự động hóa đối soát thanh toán và hạn chế tối đa sinh viên gõ nhầm số tiền hoặc nội dung:
- **Cấu trúc URL VietQR chuẩn:**
  `https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-compact2.png?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<NAME>`
- **Quy tắc nội dung chuyển khoản (Memo Syntax):**
  - Hóa đơn tháng: `KTX <PHONG> <GIUONG> THANG<XX>` (Ví dụ: `KTX P302 G02 THANG10`).
  - Tiền cọc: `COC KTX <PHONG> <GIUONG> <MSSV>`.
- **Cơ chế gạch nợ tự động:** Hệ thống lắng nghe Webhook ngân hàng (Open Banking API). Khi có biến động số dư khớp đúng mã hóa đơn và số tiền, trạng thái hóa đơn tự động chuyển từ `UNPAID` sang `PAID` và gửi thông báo cảm ơn đến sinh viên.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Gạch nợ thủ công: `POST /api/v1/admin/invoices/{invoiceId}/mark-paid`
```json
{
  "invoiceId": "INV-2610-002",
  "paymentMethod": "CASH",
  "note": "Thu tiền mặt trực tiếp tại văn phòng ban quản lý",
  "receivedBy": "USR-ADM-001"
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Đã gạch nợ thành công cho hóa đơn INV-2610-002.",
  "data": {
    "invoiceId": "INV-2610-002",
    "status": "PAID",
    "paidAt": "2026-10-06T20:15:00Z",
    "receiptNumber": "REC-202610-002"
  }
}
```
