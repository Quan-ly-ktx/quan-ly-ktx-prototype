# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-01
## ĐĂNG KÝ GIỮ CHỖ TRỰC TUYẾN (ONLINE ROOM RESERVATION WIZARD)

- **Mã màn hình:** `STU-01`
- **Tên màn hình:** Cổng Đăng ký Giữ chỗ Ký túc xá Trực tuyến
- **Đường dẫn (Route):** `/portal/register`
- **Tác nhân chính:** Sinh viên, Khách thuê mới
- **Mã Use Case liên kết:** `UC-11`
- **Mã yêu cầu chức năng (FR):** `FR-09`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [Logo KTX Hub]         CỔNG TIẾP NHẬN SINH VIÊN   |
+---------------------------------------------------+
| TIẾN TRÌNH ĐĂNG KÝ (WIZARD 3 BƯỚC):               |
| (1) Nguyện vọng  ──(2) Thông tin cá nhân──(3) Giấy tờ |
| [======= 33% ==============================]      |
|---------------------------------------------------|
| BƯỚC 1: CHỌN NGUYỆN VỌNG LƯU TRÚ                  |
|                                                   |
| * Chọn cơ sở / Tòa nhà:                           |
|   [ (o) Tòa nhà A (Nam/Nữ) ]  [ ( ) Tòa nhà B ]   |
|                                                   |
| * Giới tính của bạn:                              |
|   [ (o) NỮ ]                     [ ( ) NAM ]      |
|   (Lưu ý: Hệ thống xếp phòng cách ly giới tính)   |
|                                                   |
| * Loại phòng mong muốn:                           |
|   [ ( ) Phòng 4 giường - 1,600,000 đ/tháng ]      |
|   [ (o) Phòng 6 giường - 1,400,000 đ/tháng ]      |
|   [ ( ) Phòng 8 giường - 1,100,000 đ/tháng ]      |
|   [ ( ) Sleepbox riêng tư - 1,800,000 đ/tháng ]   |
|                                                   |
| * Kỳ học dự kiến bắt đầu ở:                       |
|   [ 01/10/2026 v ] đến [ 30/06/2027 v ]           |
|                                                   |
| BƯỚC 2: THÔNG TIN SINH VIÊN & LIÊN HỆ             |
| * Họ và tên: [ Nguyễn Thị Mai                   ] |
| * Ngày sinh: [ 15/08/2005 ]                       |
| * Số điện thoại Zalo: [ 0987654321              ] |
| * Email cá nhân: [ mai.nt2005@gmail.com         ] |
| * Trường ĐH: [ Đại học Quốc Gia Hà Nội          ] |
| * Mã số sinh viên (MSSV): [ 23020015            ] |
| * Số CCCD: [ 001205012345                       ] |
| * Người liên hệ khẩn cấp (Bố/Mẹ):                 |
|   Họ tên: [ Nguyễn Văn Cường ] - SĐT: [0903112233]|
|                                                   |
| BƯỚC 3: DIỆN ƯU TIÊN & TẢI ẢNH GIẤY TỜ            |
| * Diện ưu tiên xét duyệt:                         |
|   [ (o) Con thương binh / Liệt sĩ / Hộ nghèo ]    |
|   [ ( ) Sinh viên năm nhất xa nhà ]               |
|   [ ( ) Sinh viên bình thường ]                   |
|                                                   |
| * Tải ảnh chụp mặt trước & sau CCCD:              |
|   [ + Tải ảnh mặt trước ]  [ + Tải ảnh mặt sau ]  |
| * Tải minh chứng diện ưu tiên (nếu có):           |
|   [ + Tải ảnh giấy xác nhận hộ nghèo / thẻ TB ]   |
|                                                   |
| [X] Tôi cam kết thông tin khai báo là chính xác.  |
|                                                   |
| +-----------------------------------------------+ |
| | [ GỬI ĐƠN ĐĂNG KÝ GIỮ CHỖ NGAY -> ]          | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
```

---

### 2. Danh Mục Trường Dữ Liệu Form Đăng Ký

| Trường dữ liệu | Kiểu | Bắt buộc | Validation Rules |
|----------------|------|----------|------------------|
| `buildingId` | Select | Có | Chọn cơ sở lưu trú |
| `gender` | Radio | Có | `FEMALE` hoặc `MALE` |
| `roomType` | Radio | Có | Loại phòng mong muốn |
| `fullName` | Text | Có | Độ dài >= 4 ký tự |
| `dateOfBirth` | Date | Có | Tuổi >= 17 |
| `phone` | Text | Có | Đúng 10 chữ số di động Việt Nam |
| `email` | Email | Có | Email đúng chuẩn RFC |
| `university` | Text | Có | Tên trường đại học / cao đẳng |
| `studentCode` | Text | Có | Mã số sinh viên |
| `idCardNumber` | Text | Có | Đúng 12 số CCCD |
| `idCardFrontUrl`| File | Có | Ảnh chụp rõ nét, dung lượng < 5MB |
| `idCardBackUrl` | File | Có | Ảnh chụp rõ nét, dung lượng < 5MB |
| `priorityCategory`| Select | Có | Diện ưu tiên xét duyệt |
| `priorityProofUrl`| File | Tùy chọn | Bắt buộc nếu chọn diện chính sách |

---

### 3. Thông Báo Xác Nhận Hoàn Tất (Success Screen)

Sau khi gửi đơn thành công, hệ thống chuyển sang màn hình thành công:
- **Biểu tượng:** Tích xanh nổi bật.
- **Tiêu đề:** "Nộp đơn đăng ký thành công!".
- **Mã tra cứu đơn:** `APP-202610-88` (có nút sao chép).
- **Hướng dẫn tiếp theo:** Ban Quản lý sẽ xét duyệt trong vòng **24 giờ làm việc**. Khi đơn được duyệt, bạn sẽ nhận được thông báo qua SMS/Email để tiến hành ký hợp đồng điện tử và nộp cọc giữ chỗ.

---

### 4. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `POST /api/v1/portal/applications`
```json
{
  "buildingId": "BLD-A",
  "gender": "FEMALE",
  "preferredRoomType": "6_BEDS",
  "startDate": "2026-10-01",
  "endDate": "2027-06-30",
  "fullName": "Nguyễn Thị Mai",
  "dateOfBirth": "2005-08-15",
  "phone": "0987654321",
  "email": "mai.nt2005@gmail.com",
  "university": "Đại học Quốc Gia Hà Nội",
  "studentCode": "23020015",
  "idCardNumber": "001205012345",
  "idCardFrontUrl": "/uploads/id/front-23020015.jpg",
  "idCardBackUrl": "/uploads/id/back-23020015.jpg",
  "priorityCategory": "MARTYR_CHILD",
  "priorityProofUrl": "/uploads/proof/policy-23020015.jpg",
  "emergencyContact": {
    "name": "Nguyễn Văn Cường",
    "relationship": "Bố",
    "phone": "0903112233"
  }
}
```

#### Response Thành công (HTTP 201):
```json
{
  "success": true,
  "message": "Đơn đăng ký của bạn đã được tiếp nhận thành công.",
  "data": {
    "applicationId": "APP-202610-88",
    "status": "PENDING_REVIEW",
    "submittedAt": "2026-10-06T20:30:00Z"
  }
}
```
