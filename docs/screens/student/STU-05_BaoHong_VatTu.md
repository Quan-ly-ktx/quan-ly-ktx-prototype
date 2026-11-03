# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-05
## GỬI YÊU CẦU SỬA CHỮA & BÁO HỎNG VẬT TƯ (MAINTENANCE TICKET)

- **Mã màn hình:** `STU-05`
- **Tên màn hình:** Báo hỏng Thiết bị & Theo dõi Tiến độ Sửa chữa
- **Đường dẫn (Route):** `/portal/maintenance`
- **Tác nhân chính:** Sinh viên, Khách thuê
- **Mã Use Case liên kết:** `UC-19`, `UC-24`
- **Mã yêu cầu chức năng (FR):** `FR-19`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [< Quay lại]        BÁO HỎNG & SỰ CỐ VẬT TƯ       |
+---------------------------------------------------+
| TAB: [ (o) TẠO PHIẾU BÁO HỎNG ]   [ ( ) LỊCH SỬ XỬ LÝ (2) ]|
|---------------------------------------------------|
| VỊ TRÍ HƯ HỎNG:                                   |
| [ ( ) Tại giường của tôi (G06) ]                  |
| [ (o) Khu vực chung trong phòng P.102 ]           |
|                                                   |
| THIẾT BỊ GẶP SỰ CỐ:                               |
| [ Chọn thiết bị: Vòi sen / Ống nước v           ] |
| (Điều hòa | Bình nóng lạnh | Khóa cửa | Bóng đèn) |
|                                                   |
| MỨC ĐỘ KHẨN CẤP:                                  |
| [ ( ) Bình thường (xử lý trong 24h) ]             |
| [ (o) Cần gấp (trong ngày) ]                      |
| [ ( ) Khẩn cấp nguy hiểm (chập điện, vỡ ống) ]    |
|                                                   |
| MÔ TẢ CHI TIẾT SỰ CỐ:                             |
| +-----------------------------------------------+ |
| | Vòi sen tắm bị rò rỉ nước liên tục làm ướt    | |
| | sàn nhà tắm, nhờ ban quản lý cho thợ qua      | |
| | thay giúp phòng em ạ.                         | |
| +-----------------------------------------------+ |
|                                                   |
| CHỤP / TẢI ẢNH HIỆN TRƯỜNG (TỐI ĐA 3 ẢNH):        |
| +-----------+ +-----------+ +-----------+         |
| |  [ẢNH 1]  | |  [ẢNH 2]  | |    [+]    |         |
| | Vòi rò rỉ | | Sàn ngập  | | Thêm ảnh  |         |
| +-----------+ +-----------+ +-----------+         |
|                                                   |
| THỜI GIAN THÍCH HỢP ĐỂ THỢ VÀO SỬA:               |
| [ (o) Chiều nay (14:00 - 17:00) ]                 |
| [ ( ) Sáng mai (08:00 - 11:30) ]                  |
|                                                   |
| +-----------------------------------------------+ |
| | [ GỬI YÊU CẦU SỬA CHỮA NGAY ]                 | |
| +-----------------------------------------------+ |
|                                                   |
| TIẾN TRÌNH THEO DÕI PHIẾU GẦN NHẤT (#TK-102):     |
| (V) Đã tiếp nhận lúc 08:30                        |
| (V) BQL đã giao thợ: Chú Tuấn (SĐT: 0912.888.xxx) |
| (o) Thợ đang di chuyển đến phòng...               |
| ( ) Nghiệm thu hoàn thành                         |
+---------------------------------------------------+
```

---

### 2. Danh Mục Trường Dữ Liệu Form Báo Hỏng

| Trường dữ liệu | Kiểu | Bắt buộc | Ràng buộc kiểm tra |
|----------------|------|----------|-------------------|
| `locationType` | Radio | Có | `BED_SLOT` hoặc `ROOM_COMMON` |
| `equipmentType`| Select | Có | Chọn thiết bị trong danh mục tài sản |
| `urgencyLevel` | Radio | Có | `NORMAL`, `URGENT`, `EMERGENCY` |
| `description` | Textarea | Có | Tối thiểu 10 ký tự, mô tả rõ hiện trạng |
| `photoUrls` | Array[File]| Có | Ít nhất 1 ảnh hiện trường rõ nét |
| `preferredTimeSlot`| Select | Có | Khung giờ sinh viên có mặt ở phòng |

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `POST /api/v1/portal/maintenance/tickets`
```json
{
  "roomNumber": "P.102",
  "bedNumber": "G06",
  "locationType": "ROOM_COMMON",
  "equipmentType": "SHOWER_HEAD",
  "urgencyLevel": "URGENT",
  "description": "Vòi sen tắm bị rò rỉ nước liên tục làm ướt sàn nhà tắm",
  "photoUrls": [
    "/uploads/tickets/shower-leak-1.jpg",
    "/uploads/tickets/shower-leak-2.jpg"
  ],
  "preferredTimeSlot": "TODAY_AFTERNOON"
}
```

#### Response Thành công (HTTP 201):
```json
{
  "success": true,
  "message": "Phiếu báo hỏng đã được gửi thành công. Ban Quản lý sẽ điều phối thợ sớm nhất.",
  "data": {
    "ticketId": "TK-102",
    "status": "DISPATCHED",
    "assignedTechnician": {
      "name": "Nguyễn Văn Tuấn",
      "phone": "0912888999"
    },
    "createdAt": "2026-10-06T08:30:00Z"
  }
}
```
