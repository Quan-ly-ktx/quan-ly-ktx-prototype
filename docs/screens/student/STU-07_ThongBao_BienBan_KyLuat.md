# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-07
## HỘP THƯ THÔNG BÁO & LỊCH SỬ KỶ LUẬT VI PHẠM (NOTIFICATIONS & DISCIPLINE)

- **Mã màn hình:** `STU-07`
- **Tên màn hình:** Trung tâm Thông báo & Hồ sơ Kỷ luật Sinh viên
- **Đường dẫn (Route):** `/portal/notifications`
- **Tác nhân chính:** Sinh viên, Khách thuê
- **Mã Use Case liên kết:** `UC-22`, `UC-44`
- **Mã yêu cầu chức năng (FR):** `FR-22`, `FR-33`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [< Quay lại]         THÔNG BÁO & KỶ LUẬT          |
+---------------------------------------------------+
| TAB: [ (o) THÔNG BÁO CHUNG (3) ]   [ ( ) BIÊN BẢN KỶ LUẬT (0) ]|
|---------------------------------------------------|
| DANH SÁCH THÔNG BÁO:                              |
|                                                   |
| +-----------------------------------------------+ |
| | [🔵 TÀI CHÍNH] - Hôm nay 09:00                | |
| | ĐÃ PHÁT HÀNH HÓA ĐƠN THÁNG 10/2026            | |
| | Hóa đơn tiền phòng & tiền điện nước tháng 10  | |
| | của bạn đã sẵn sàng. Hạn nộp: 10/10/2026.     | |
| | [ Bấm để quét mã VietQR thanh toán -> ]       | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | [🟠 VẬN HÀNH] - Hôm qua 15:30                 | |
| | LỊCH VỆ SINH BỂ NƯỚC NGẦM & TẠM NGỪNG CẤP NƯỚC| |
| | Từ 08:00 đến 11:30 ngày 08/10/2026. Quý sinh  | |
| | viên vui lòng chủ động tích trữ nước sinh hoạt| |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | [🟢 SỰ CỐ] - 05/10/2026 14:15                 | |
| | HOÀN THÀNH SỬA CHỮA PHIẾU #TK-102             | |
| | Thợ kỹ thuật đã thay xong vòi sen tắm phòng   | |
| | P.102. Vui lòng bấm vào để nghiệm thu đánh giá| |
| +-----------------------------------------------+ |
|                                                   |
| TAB 2: LỊCH SỬ KỶ LUẬT & NỘI QUY (NẾU CÓ):        |
| (•) Điểm rèn luyện hiện tại: 100/100 Điểm         |
| (•) Trạng thái: Chấp hành tốt nội quy KTX         |
| (•) Số biên bản vi phạm trong kỳ: 0 biên bản      |
+---------------------------------------------------+
```

---

### 2. Danh Mục Nhóm Thông Báo Theo Quy Chuẩn Màu

- **Thông báo Tài chính (Xanh dương `--brand-600`):** Phát hành hóa đơn, xác nhận đã nhận tiền qua VietQR, nhắc nợ khi đến hạn.
- **Thông báo Vận hành (Cam `--warning-600`):** Lịch vệ sinh, bảo dưỡng điều hòa, thông báo giờ đóng cổng.
- **Thông báo Sự cố (Xanh lá `--success-600`):** Cập nhật tiến độ thợ sửa chữa, nghiệm thu thiết bị.
- **Biên bản Kỷ luật (Đỏ `--danger-600`):** Thông báo biên bản vi phạm nội quy, số tiền phạt trừ vào hóa đơn.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/portal/notifications?page=1&limit=10`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": {
    "unreadCount": 1,
    "items": [
      {
        "id": "NOTIF-001",
        "category": "BILLING",
        "title": "Đã phát hành hóa đơn Tháng 10/2026",
        "content": "Hóa đơn tiền phòng & điện nước tháng 10 đã sẵn sàng. Hạn nộp 10/10/2026.",
        "linkUrl": "/portal/invoices/INV-2610-045",
        "isRead": false,
        "createdAt": "2026-10-06T09:00:00Z"
      },
      {
        "id": "NOTIF-002",
        "category": "OPERATIONS",
        "title": "Lịch vệ sinh bể nước ngầm",
        "content": "Tạm ngừng cấp nước từ 08:00 - 11:30 ngày 08/10/2026.",
        "linkUrl": null,
        "isRead": true,
        "createdAt": "2026-10-05T15:30:00Z"
      }
    ]
  }
}
```
