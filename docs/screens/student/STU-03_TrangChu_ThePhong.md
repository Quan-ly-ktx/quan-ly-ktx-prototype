# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-03
## TRANG CHỦ CỔNG SINH VIÊN & THẺ PHÒNG CỦA TÔI (STUDENT HOME)

- **Mã màn hình:** `STU-03`
- **Tên màn hình:** Bảng điều khiển Cá nhân & Thẻ thông tin Phòng ở
- **Đường dẫn (Route):** `/portal/home`
- **Tác nhân chính:** Sinh viên, Khách thuê đang cư trú
- **Mã Use Case liên kết:** `UC-40`, `UC-44`
- **Mã yêu cầu chức năng (FR):** `FR-31`, `FR-33`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [Avatar] Xin chào, Mai!               [🔔 Chuông (2)]|
| MSSV: 23020015 | ĐHQGHN                           |
+---------------------------------------------------+
| THẺ PHÒNG CỦA TÔI (MY ROOM HERO CARD):            |
| +-----------------------------------------------+ |
| | PHÒNG P.102 - GIƯỜNG 06 (TẦNG DƯỚI)           | |
| | Tòa A (Tầng 1) - Khu Nữ                       | |
| | Thời hạn hợp đồng: Còn 265 ngày               | |
| |                                               | |
| | CÁC BẠN CÙNG PHÒNG (5 NGƯỜI):                 | |
| | (•) Lan (G01)  (•) Mai (G02)  (•) Hương (G03) | |
| | (•) Thảo (G04) (•) Yến (G05)  (*) Bạn (G06)   | |
| +-----------------------------------------------+ |
|                                                   |
| TRẠNG THÁI CÔNG NỢ THÁNG 10/2026:                 |
| +-----------------------------------------------+ |
| | [!] BẠN CÓ 1 HÓA ĐƠN CHỜ THANH TOÁN           | |
| | Tiền phòng & Điện nước: 1,650,000 VNĐ         | |
| | Hạn nộp: 10/10/2026 (Còn 4 ngày)              | |
| |                                               | |
| | [ NÚT: THANH TOÁN BẰNG MÃ VIETQR NGAY -> ]    | |
| +-----------------------------------------------+ |
|                                                   |
| LỐI TẮT HÀNH ĐỘNG NHANH (QUICK ACTIONS 2x2):      |
| +-----------------------+ +---------------------+ |
| | [📄 Hóa đơn & Điện nc]| | [🔧 Báo hỏng thiết bị] | |
| | Xem chi tiết ngày ở   | | Chụp ảnh gửi thợ    | |
| +-----------------------+ +---------------------+ |
| +-----------------------+ +---------------------+ |
| | [🔄 Đổi phòng /Gia hạn]| | [📜 Nội quy Ký túc xá]| |
| | Đổi tầng hoặc trả cọc | | Giờ giấc & kỷ luật  | |
| +-----------------------+ +---------------------+ |
|                                                   |
| THÔNG BÁO MỚI NHẤT TỪ BAN QUẢN LÝ:                |
| * [Bảo trì] Lịch vệ sinh bể nước ngầm ngày 08/10. |
| * [An ninh] Nhắc nhở khóa cổng chính sau 23:00.   |
|                                                   |
| [ Bottom Nav: (• Trang chủ) (📄 Hóa đơn) (🔧 Báo hỏng) (👤 Hồ sơ) ] |
+---------------------------------------------------+
```

---

### 2. Chi Tiết Thành Phần Giao Diện (Components & Props)

1. **Header User Profile:** Hiển thị Avatar, Họ tên rút gọn, Mã sinh viên và Chuông thông báo (có chấm đỏ Badge đếm số thông báo chưa đọc).
2. **My Room Hero Card:**
   - Sử dụng nền xanh dương nhạt `--brand-50` (`#EFF6FF`), bo góc tròn 16px `--radius-xl`.
   - Hiển thị vị trí giường cụ thể (`P.102 - G06`).
   - Danh sách Avatar các bạn cùng phòng (giúp sinh viên biết rõ những ai đang ở cùng mình trong phòng theo yêu cầu `UC-40 / FR-31`).
3. **Outstanding Debt Banner:**
   - Nếu đã nộp tiền: Nền xanh lá nhạt `--success-50`, nội dung "Đã thanh toán đủ tiền tháng này".
   - Nếu chưa nộp: Nền cam/đỏ cảnh báo, hiển thị số tiền nợ và nút thanh toán 1 chạm.
4. **Bottom Navigation Bar (Cố định ở đáy màn hình):**
   - 4 mục điều hướng chính: `Trang chủ`, `Hóa đơn`, `Báo hỏng`, `Cá nhân`. Đảm bảo vùng chạm >= 44x44px.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/portal/me/dashboard`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": {
    "student": {
      "fullName": "Nguyễn Thị Mai",
      "studentCode": "23020015",
      "avatarUrl": "/assets/avatars/mai.png"
    },
    "currentStay": {
      "roomNumber": "P.102",
      "bedNumber": "G06",
      "tier": "LOWER",
      "building": "Tòa A",
      "floor": 1,
      "genderZone": "FEMALE",
      "daysRemaining": 265,
      "roommates": [
        { "bed": "G01", "name": "Nguyễn Thị Lan", "faculty": "Kinh tế" },
        { "bed": "G02", "name": "Phạm Tuyết Mai", "faculty": "Ngoại ngữ" },
        { "bed": "G03", "name": "Đỗ Thu Hương", "faculty": "Luật" }
      ]
    },
    "billing": {
      "hasPendingInvoice": true,
      "pendingInvoiceId": "INV-2610-045",
      "amountDue": 1650000,
      "dueDate": "2026-10-10"
    },
    "unreadNotificationsCount": 2
  }
}
```
