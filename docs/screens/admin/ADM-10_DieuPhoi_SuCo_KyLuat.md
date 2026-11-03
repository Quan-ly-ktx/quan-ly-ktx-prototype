# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-10
## ĐIỀU PHỐI SỬA CHỮA SỰ CỐ & QUẢN LÝ KỶ LUẬT NỘI QUY
*Giải quyết Bài toán cốt lõi #5 của KTX Tư nhân: Quy trình tiếp nhận, điều phối và nghiệm thu sửa chữa*

- **Mã màn hình:** `ADM-10`
- **Tên màn hình:** Quản lý Sự cố Vật tư & Kỷ luật Nội quy
- **Đường dẫn (Route):** `/admin/maintenance-discipline`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX, Nhân viên Kỹ thuật
- **Mã Use Case liên kết:** `UC-20`, `UC-21`, `UC-22`, `UC-23`
- **Mã yêu cầu chức năng (FR):** `FR-19`, `FR-20`, `FR-21`, `FR-22`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm phiếu sự cố, tên phòng, sinh viên...             | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN LÝ SỰ CỐ & KỶ LUẬT KTX                                                                |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| TAB CHUYỂN ĐỔI: [1. SỰ CỐ VẬT TƯ (4 MỚI)] [2. BIÊN BẢN VI PHẠM KỶ LUẬT (2 MỚI)]           |
|   Phòng &  |--------------------------------------------------------------------------------------------|
|   Giường   | TAB 1: DANH SÁCH PHIẾU BÁO HỎNG CẦN ĐIỀU PHỐI                                              |
|   Sinh viên| +---------+-----------+-----------------------+-------------+-------------+--------------+ |
|   Xếp phòng| | MÃ PHIẾU| PHÒNG     | MÔ TẢ HƯ HỎNG         | MỨC ĐỘ      | KỸ THUẬT    | TRẠNG THÁI   | |
|   Hợp đồng | +---------+-----------+-----------------------+-------------+-------------+--------------+ |
|   Điện nước| | TK-102  | P.204-G02 | Vỡ vòi sen tắm nước rò| [KHẨN CẤP]  | [Chọn thợ v]| [Chờ giao]   | |
|   Hóa đơn  | | TK-103  | P.302-Chung| Hỏng quạt trần kêu to | [BÌNH THƯỜNG| Chú Tuấn KT | [Đang sửa]   | |
| * Sự cố    | | TK-105  | P.101-G01 | Cháy bóng đèn bàn học | [THẤP]      | Chú Tuấn KT | [ĐÃ XONG]    | |
|   Báo cáo  | +---------+-----------+-----------------------+-------------+-------------+--------------+ |
|   Cài đặt  |--------------------------------------------------------------------------------------------|
|            | MODAL ĐIỀU PHỐI KỸ THUẬT VIÊN & XEM ẢNH HIỆN TRẠNG (KHI CLICK TK-102):                     |
|            | +----------------------------------------------------------------------------------------+ |
|            | | CHI TIẾT SỰ CỐ: VỠ VÒI SEN TẮM - PHÒNG P.204                                           | |
|            | | Người báo: Nguyễn Thu Trang (SĐT: 0912333444) | Gửi lúc: 08:30 06/10/2026               | |
|            | | Mô tả: "Vòi sen tắm bị nứt cổ ren, nước phun mạnh làm ngập sàn phòng tắm."             | |
|            | |                                                                                        | |
|            | | ẢNH CHỤP HIỆN TRẠNG: [Ảnh 1: Vòi sen nứt] [Ảnh 2: Sàn ngập nước] (Bấm xem ảnh to)      | |
|            | |                                                                                        | |
|            | | PHÂN CÔNG KỸ THUẬT VIÊN:                                                               | |
|            | | Chọn kỹ thuật viên: [(o) Nguyễn Văn Tuấn (Kỹ thuật điện nước)]                         | |
|            | | Ghi chú dặn dò: "Mang theo vòi sen mới phi 21 và băng tan qua thay gấp."               | |
|            | | Hạn hoàn thành: [ 06/10/2026 - 11:30 (Trong vòng 3 tiếng) ]                            | |
|            | |                                                                                        | |
|            | | [ ĐÓNG ]                                          [ GIAO VIỆC & THÔNG BÁO CHO THỢ -> ] | |
|            | +----------------------------------------------------------------------------------------+ |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Quy Trình Điều Phối Sự Cố (Maintenance Lifecycle)

1. **Sinh viên gửi phiếu (`STU-05`):** Cung cấp mô tả, độ khẩn cấp và ảnh chụp hiện trường.
2. **Quản lý phân công (`ADM-10`):** Chọn nhân viên kỹ thuật từ danh sách nhân sự nội bộ, đặt deadline hoàn thành.
3. **Kỹ thuật viên thực hiện (`TEC-01`, `TEC-02`):** Nhận thông báo trên điện thoại, đến hiện trường thay thế vật tư và chụp ảnh kết quả.
4. **Nghiệm thu & Đóng phiếu:** Quản lý bấm nghiệm thu, hệ thống tự động thông báo cho sinh viên xác nhận.

---

### 3. Phân Hệ Quản Lý Kỷ Luật Nội Quy (Discipline Management - UC-22, UC-23)

- **Form Lập biên bản vi phạm mới:**
  - Chọn Sinh viên vi phạm (tìm theo MSSV hoặc theo Phòng).
  - Chọn lỗi vi phạm: *Nấu ăn trong phòng, Mất trật tự quá 23h, Dẫn bạn khác giới vào phòng, Hút thuốc lá, Làm bẩn khu vực chung*.
  - Upload ảnh/video bằng chứng (chụp lúc kiểm tra đột xuất).
  - Hình thức xử phạt:
    - *Lần 1:* Nhắc nhở bằng văn bản & gửi thông báo về tài khoản cá nhân.
    - *Lần 2:* Trừ 5 điểm rèn luyện và phạt tiền `200,000 đ` (tự động cộng vào kỳ hóa đơn tới).
    - *Lần 3:* Chấm dứt hợp đồng cư trú và buộc rời KTX.

---

### 4. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Giao việc kỹ thuật: `POST /api/v1/admin/maintenance/{ticketId}/dispatch`
```json
{
  "ticketId": "TK-102",
  "technicianId": "USR-TEC-003",
  "priority": "HIGH",
  "notes": "Mang theo vòi sen mới phi 21 và băng tan qua thay gấp",
  "deadline": "2026-10-06T11:30:00Z"
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Đã điều phối kỹ thuật viên Nguyễn Văn Tuấn thành công. Ticket chuyển trạng thái ĐANG XỬ LÝ.",
  "data": {
    "ticketId": "TK-102",
    "status": "IN_PROGRESS",
    "assignedTo": "Nguyễn Văn Tuấn",
    "dispatchedAt": "2026-10-06T08:45:00Z"
  }
}
```
