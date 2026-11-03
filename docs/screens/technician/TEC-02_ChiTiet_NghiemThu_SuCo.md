# ĐẶC TẢ CHI TIẾT MÀN HÌNH: TEC-02
## CHI TIẾT SỬA CHỮA & NGHIỆM THU HOÀN THÀNH SỰ CỐ (MAINTENANCE COMPLETION)

- **Mã màn hình:** `TEC-02`
- **Tên màn hình:** Ghi nhận Kết quả Sửa chữa & Chụp ảnh Nghiệm thu
- **Đường dẫn (Route):** `/technician/tasks/:ticketId/complete`
- **Tác nhân chính:** Nhân viên Kỹ thuật
- **Mã Use Case liên kết:** `UC-21`, `UC-26`
- **Mã yêu cầu chức năng (FR):** `FR-21`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile/Tablet Viewport 375px – 768px)

```text
+---------------------------------------------------+
| [< Quay lại]      NGHIỆM THU PHIẾU #TK-102        |
+---------------------------------------------------+
| THÔNG TIN SỰ CỐ:                                  |
| * Vị trí: Phòng P.204 (Tòa A - Tầng 2)            |
| * Người báo: Nguyễn Thu Trang (SĐT: 0912.333.xxx) |
| * Ảnh hiện trạng lúc hỏng (do sinh viên chụp):    |
|   [Ảnh: Vòi sen nứt gãy phun nước ngập sàn]       |
|                                                   |
| KẾT QUẢ XỬ LÝ SỬA CHỮA CỦA KỸ THUẬT VIÊN:         |
| * Nội dung công việc đã làm:                      |
| +-----------------------------------------------+ |
| | Đã khóa van tổng, tháo vòi sen cũ bị nứt cổ,  | |
| | quấn băng tan và thay thế vòi sen Inox phi 21 | |
| | mới. Đã xả nước thử nghiệm không còn rò rỉ.   | |
| +-----------------------------------------------+ |
|                                                   |
| * Vật tư thay thế xuất từ kho KTX:                |
|   - Tên vật tư: Vòi sen tăng áp Inox 304          |
|   - Số lượng: 1 bộ | Đơn giá: 150,000 đ           |
|   - Phân loại chi phí:                            |
|     [ (o) Hao mòn tự nhiên (KTX chịu) ]           |
|     [ ( ) Sinh viên làm gãy (Khấu trừ cọc) ]      |
|                                                   |
| * Chụp ảnh hiện trường sau khi sửa xong (Bắt buộc)|
| +--------------------+ +--------------------+     |
| |      [ẢNH 1]       | |        [+]         |     |
| | Vòi sen mới lắp    | | Chụp thêm ảnh khác |     |
| | không còn rò rỉ    | |                    |     |
| +--------------------+ +--------------------+     |
|                                                   |
| +-----------------------------------------------+ |
| | [ XÁC NHẬN ĐÃ SỬA XONG & ĐÓNG PHIẾU NGAY -> ] | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
```

---

### 2. Danh Mục Trường Dữ Liệu Form Nghiệm Thu

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả & Ràng buộc kiểm tra |
|----------------|------|----------|----------------------------|
| `workReport` | Textarea | Có | Tối thiểu 15 ký tự, ghi rõ cách thức xử lý |
| `replacedParts`| Array[Object]| Không | Danh sách linh kiện/vật tư thay thế |
| `costBearer` | Radio | Có | `DORM_EXPENSE` (Hao mòn tự nhiên) hoặc `TENANT_DAMAGE` (Lỗi người dùng) |
| `completionPhotos`| Array[File]| Có | Ít nhất 1 ảnh chụp rõ thiết bị sau khi sửa xong |
| `completedAt` | Datetime | Có | Thời điểm thợ bấm xác nhận hoàn thành |

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Nghiệm thu hoàn tất: `POST /api/v1/technician/tasks/{ticketId}/complete`
```json
{
  "ticketId": "TK-102",
  "workReport": "Đã thay vòi sen tăng áp Inox 304 mới, quấn băng tan và kiểm tra kín nước",
  "costBearer": "DORM_EXPENSE",
  "replacedParts": [
    {
      "partName": "Vòi sen Inox 304",
      "quantity": 1,
      "cost": 150000
    }
  ],
  "completionPhotos": [
    "/uploads/repairs/tk102-done-1.jpg"
  ],
  "completedAt": "2026-10-06T10:15:00Z"
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Nhiệm vụ đã được xác nhận hoàn thành. Đã đóng phiếu và gửi thông báo cho sinh viên.",
  "data": {
    "ticketId": "TK-102",
    "status": "COMPLETED",
    "closedAt": "2026-10-06T10:15:00Z"
  }
}
```
