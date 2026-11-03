# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-06
## ĐƠN XIN ĐỔI PHÒNG, GIA HẠN CƯ TRÚ & TRẢ PHÒNG (REQUEST FORMS)

- **Mã màn hình:** `STU-06`
- **Tên màn hình:** Yêu cầu Chuyển phòng, Gia hạn Hợp đồng & Trả phòng Checkout
- **Đường dẫn (Route):** `/portal/requests`
- **Tác nhân chính:** Sinh viên, Khách thuê
- **Mã Use Case liên kết:** `UC-14`, `UC-16`, `UC-17`, `UC-18`
- **Mã yêu cầu chức năng (FR):** `FR-14`, `FR-15`, `FR-16`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [< Quay lại]         GỬI ĐƠN & THỦ TỤC PHÒNG      |
+---------------------------------------------------+
| CHỌN LOẠI THỦ TỤC:                                |
| [ (1) Gia hạn HĐ ]  [ (2) Đổi phòng ]  [ (3) Trả phòng ]|
|---------------------------------------------------|
| TAB 3: ĐƠN XIN TRẢ PHÒNG & HOÀN TIỀN CỌC (CHECKOUT)|
|                                                   |
| * Thông tin phòng đang thuê:                      |
|   Phòng: P.102 - Giường 06 | HĐ: HD-2026-P102G06  |
|   Số tiền cọc đang giữ: 1,400,000 VNĐ             |
|                                                   |
| * Ngày dự kiến rời KTX:                           |
|   [ 25/10/2026 v ]                                |
|   (Quy định: Phải báo trước tối thiểu 15 ngày)    |
|                                                   |
| * Lý do trả phòng:                                |
|   [ Chọn lý do: Đã tốt nghiệp / Đi thực tập v   ] |
|   [ Khác: Ghi rõ lý do...                       ] |
|                                                   |
| * Thông tin tài khoản nhận tiền hoàn cọc:         |
|   - Tên ngân hàng: [ MB Bank (Quân Đội) v       ] |
|   - Số tài khoản: [ 0987654321                  ] |
|   - Tên chủ tài khoản: [ NGUYEN THI MAI         ] |
|                                                   |
| QUY TRÌNH HOÀN CỌC:                               |
| 1. BQL sẽ liên hệ hẹn giờ kiểm kê phòng ngày 25/10|
| 2. Chốt số điện nước kỳ cuối và trừ tiền khấu trừ |
| 3. Hoàn chuyển khoản tiền cọc trong vòng 48h làm  |
|    việc sau khi bàn giao chìa khóa.               |
|                                                   |
| [X] Tôi cam kết dọn dẹp sạch sẽ vị trí giường ở   |
|                                                   |
| +-----------------------------------------------+ |
| | [ GỬI ĐƠN XIN TRẢ PHÒNG -> ]                  | |
| +-----------------------------------------------+ |
+---------------------------------------------------+
```

---

### 2. Các Thủ Tục Đi Kèm Trong Màn Hình

1. **Thủ tục Gia hạn Hợp đồng (Tab 1 - UC-14 / FR-14):**
   - Sinh viên chọn kỳ hạn muốn ở tiếp: `3 tháng (1 kỳ hè)`, `6 tháng (học kỳ tiếp)`, hoặc `1 năm (2 học kỳ chính)`.
   - Giữ nguyên tiền cọc hiện tại mà không phải nộp mới.
2. **Thủ tục Xin Đổi Phòng (Tab 2 - UC-18 / FR-15):**
   - Chọn loại phòng mong muốn chuyển: Đổi từ phòng 6 người sang phòng 4 người hoặc Sleepbox riêng tư.
   - Nhập lý do chuyển (khác nhịp sinh hoạt, muốn chuyển cùng bạn thân...).
   - Hệ thống tự động kiểm tra và chỉ cho phép chuyển sang các phòng **cùng giới tính**.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Trả phòng: `POST /api/v1/portal/requests/checkout`
```json
{
  "contractId": "HD-2026-P102G06",
  "expectedCheckoutDate": "2026-10-25",
  "reason": "GRADUATED",
  "bankAccount": {
    "bankCode": "MB",
    "accountNumber": "0987654321",
    "accountHolder": "NGUYEN THI MAI"
  }
}
```

#### Response Thành công (HTTP 201):
```json
{
  "success": true,
  "message": "Đã tiếp nhận đơn xin trả phòng. Ban Quản lý sẽ sắp xếp lịch kiểm kê tài sản.",
  "data": {
    "requestId": "REQ-CHECKOUT-102",
    "status": "PENDING_INSPECTION",
    "inspectionScheduledDate": "2026-10-25"
  }
}
```
