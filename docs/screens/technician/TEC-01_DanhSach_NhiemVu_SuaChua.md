# ĐẶC TẢ CHI TIẾT MÀN HÌNH: TEC-01
## DANH SÁCH NHIỆM VỤ SỬA CHỮA KỸ THUẬT (TECHNICIAN WORK ORDERS)

- **Mã màn hình:** `TEC-01`
- **Tên màn hình:** Hàng đợi Công việc & Phiếu sửa chữa Kỹ thuật
- **Đường dẫn (Route):** `/technician/tasks`
- **Tác nhân chính:** Nhân viên Kỹ thuật, Thợ bảo trì
- **Mã Use Case liên kết:** `UC-20`, `UC-21`
- **Mã yêu cầu chức năng (FR):** `FR-20`, `FR-21`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile/Tablet Viewport 375px – 768px)

```text
+---------------------------------------------------+
| [Avatar] Chú Tuấn (Kỹ thuật KTX)     [🔔 Chuông (1)]|
| Tổ bảo trì điện nước & thiết bị                   |
+---------------------------------------------------+
| BỘ LỌC CÔNG VIỆC:                                 |
| [ (o) Cần làm ngay (2) ]  [ ( ) Đang sửa (1) ]  [ ( ) Đã xong (8) ]|
|---------------------------------------------------|
| HÀNG ĐỢI NHIỆM VỤ ĐƯỢC PHÂN CÔNG:                 |
|                                                   |
| +-----------------------------------------------+ |
| | [KHẨN CẤP] - PHÒNG P.204 (TẦNG 2 - TÒA A)     | |
| | Sự cố: Vỡ vòi sen tắm nước rò rỉ ngập sàn     | |
| | Báo lúc: 08:30 (Đã chờ: 25 phút)              | |
| | Hạn hoàn thành: Trước 11:30 hôm nay           | |
| | Người báo: Nguyễn Thu Trang (0912.333.xxx)    | |
| | Ghi chú BQL: Mang theo vòi sen phi 21 thay gấp| |
| |                                               | |
| | +-------------------------------------------+ | |
| | | [ NHẬN VIỆC & BẮT ĐẦU SỬA CHỮA NGAY -> ] | | |
| | +-------------------------------------------+ | |
| +-----------------------------------------------+ |
|                                                   |
| +-----------------------------------------------+ |
| | [BÌNH THƯỜNG] - PHÒNG P.302 (TẦNG 3 - TÒA A)  | |
| | Sự cố: Quạt trần kêu to và quay chậm          | |
| | Báo lúc: Hôm qua 16:00                        | |
| | Hạn hoàn thành: Trong ngày hôm nay            | |
| |                                               | |
| | [ Xem chi tiết & Nhận việc -> ]               | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
```

---

### 2. Danh Mục Trường Dữ Liệu Thẻ Nhiệm Vụ

| Trường dữ liệu | Kiểu | Mô tả hiển thị |
|----------------|------|----------------|
| `ticketCode` | String | Mã phiếu: `TK-102` |
| `priority` | Enum | `EMERGENCY` (Đỏ), `HIGH` (Cam), `NORMAL` (Xanh) |
| `roomNumber` | String | Vị trí phòng: `P.204` (kèm Tòa nhà, Tầng) |
| `equipment` | String | Thiết bị: `Vòi sen tắm` |
| `issueSummary` | String | Mô tả ngắn gọn sự cố |
| `assignedAt` | Datetime| Thời điểm Ban Quản lý giao việc |
| `deadline` | Datetime| Thời hạn phải hoàn thành |
| `reporterContact`| String | Tên và SĐT sinh viên để thợ gọi khi đến cửa |

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Nhận việc: `POST /api/v1/technician/tasks/{ticketId}/start`
```json
{
  "ticketId": "TK-102",
  "startedAt": "2026-10-06T08:55:00Z"
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Đã bắt đầu thực hiện nhiệm vụ TK-102. Trạng thái chuyển sang ĐANG SỬA.",
  "data": {
    "ticketId": "TK-102",
    "status": "IN_PROGRESS",
    "startedAt": "2026-10-06T08:55:00Z"
  }
}
```
