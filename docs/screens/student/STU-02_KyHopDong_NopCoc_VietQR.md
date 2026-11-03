# ĐẶC TẢ CHI TIẾT MÀN HÌNH: STU-02
## KÝ HỢP ĐỒNG ĐIỆN TỬ & NỘP CỌC GIỮ CHỖ QUA VIETQR ĐỘNG

- **Mã màn hình:** `STU-02`
- **Tên màn hình:** Xem & Ký Hợp đồng Điện tử kèm Thanh toán Đặt cọc
- **Đường dẫn (Route):** `/portal/contracts/:contractId/sign-and-deposit`
- **Tác nhân chính:** Sinh viên, Khách thuê
- **Mã Use Case liên kết:** `UC-13`, `UC-15`
- **Mã yêu cầu chức năng (FR):** `FR-12`, `FR-13`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Mobile Viewport 375px – 430px)

```text
+---------------------------------------------------+
| [< Quay lại]    XÁC NHẬN HỢP ĐỒNG & NỘP CỌC       |
+---------------------------------------------------+
| THÔNG TIN PHÒNG ĐÃ ĐƯỢC PHÊ DUYỆT:                |
| +-----------------------------------------------+ |
| | Phòng: P.102 (Tầng 1 - Tòa A - NỮ)            | |
| | Vị trí: Giường số 06 (Tầng dưới)              | |
| | Giá thuê: 1,400,000 đ/tháng                   | |
| | Thời hạn cư trú: 01/10/2026 - 30/06/2027      | |
| +-----------------------------------------------+ |
|                                                   |
| ĐỒNG HỒ ĐẾM NGƯỢC GIỮ CHỖ:                        |
| [!] Vị trí giường được giữ tạm trong: [ 47:52:10 ] |
|                                                   |
| BƯỚC 1: ĐỌC & KÝ HỢP ĐỒNG THUÊ KTX ĐIỆN TỬ:      |
| +-----------------------------------------------+ |
| | HỢP ĐỒNG THUÊ PHÒNG KÝ TÚC XÁ TƯ NHÂN         | |
| | Số: HD-2026-P102G06                           | |
| | Điều 1: Đối tượng hợp đồng và tài sản         | |
| | Điều 2: Thời hạn và giá thuê                  | |
| | Điều 3: Tiền đặt cọc bảo đảm (1,400,000 đ)    | |
| | Điều 4: Cơ chế chia tiền điện nước theo ngày  | |
| | Điều 5: Nội quy và an ninh trật tự            | |
| | (Cuộn để đọc toàn bộ 8 trang điều khoản...)   | |
| +-----------------------------------------------+ |
| [X] Tôi đã đọc kỹ và cam kết tuân thủ 100% nội quy|
|                                                   |
| KÝ TÊN ĐIỆN TỬ (DÙNG NGÓN TAY KÝ VÀO KHUNG):      |
| +-----------------------------------------------+ |
| |                                               | |
| |               [ Chữ ký mẫu ]                  | |
| |                                               | |
| +-----------------------------------------------+ |
| [ Xóa ký lại ]                                    |
|                                                   |
| BƯỚC 2: NỘP CỌC GIỮ CHỖ BẰNG VIETQR ĐỘNG:         |
| +-----------------------------------------------+ |
| | SỐ TIỀN CỌC CẦN NỘP: 1,400,000 VNĐ            | |
| |                                               | |
| |          +-------------------------+          | |
| |          |        [ẢNH QR]         |          | |
| |          |     VietQR Napas247     |          | |
| |          |    MB Bank 09123456789  |          | |
| |          +-------------------------+          | |
| |                                               | |
| | Cú pháp: COC KTX P102 G06 23020015            | |
| |                                               | |
| | [ Tải ảnh QR ]     [ Mở App Ngân hàng ]       | |
| +-----------------------------------------------+ |
|                                                   |
| Trạng thái thanh toán: Đang đợi chuyển khoản...   |
| (Trang tự động chuyển khi hệ thống nhận được tiền)|
+---------------------------------------------------+
```

---

### 2. Quy Trình Trải Nghiệm Người Dùng (UX Flow)

1. **Đọc hợp đồng điện tử:** Khung hiển thị tài liệu hợp đồng có thanh cuộn mượt mà.
2. **Ký số bằng Canvas (Signature Pad):** Sinh viên ký tay trực tiếp trên màn hình cảm ứng điện thoại, hỗ trợ nút [Xóa để ký lại].
3. **Thanh toán nộp cọc bằng VietQR Napas247:**
   - Mã QR đã nhúng sẵn số tiền `1,400,000 đ` và cú pháp chuẩn `COC KTX P102 G06 23020015`.
   - Sinh viên có thể bấm nút [Mở App Ngân hàng] để app tự động kích hoạt ứng dụng Mobile Banking trên máy.
4. **Cơ chế xác nhận Real-time:** Màn hình sử dụng SSE (Server-Sent Events) hoặc Polling mỗi 3 giây. Khi tài khoản ngân hàng KTX nhận được tiền, màn hình lập tức phát hiệu ứng chúc mừng (Confetti) và chuyển thẳng vào **Trang chủ Cổng Sinh viên (`STU-03`)**.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Ký hợp đồng: `POST /api/v1/portal/contracts/{contractId}/sign`
```json
{
  "contractId": "HD-2026-P102G06",
  "signatureBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "agreedTerms": true,
  "signedAt": "2026-10-06T20:35:00Z"
}
```

#### Response (HTTP 200):
```json
{
  "success": true,
  "message": "Đã ký hợp đồng điện tử thành công. Vui lòng thanh toán cọc giữ chỗ.",
  "data": {
    "contractStatus": "SIGNED_PENDING_DEPOSIT",
    "depositRequired": 1400000,
    "qrCodeUrl": "https://img.vietqr.io/image/970422-0912345678-compact2.png?amount=1400000&addInfo=COC%20KTX%20P102%20G06%2023020015"
  }
}
```
