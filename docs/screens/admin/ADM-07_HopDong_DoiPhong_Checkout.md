# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-07
## QUẢN LÝ HỢP ĐỒNG, GIA HẠN, ĐỔI PHÒNG & THANH LÝ CHECKOUT

- **Mã màn hình:** `ADM-07`
- **Tên màn hình:** Quản lý Vòng đời Hợp đồng & Thanh lý Trả phòng
- **Đường dẫn (Route):** `/admin/contracts-lifecycle`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-15`, `UC-16`, `UC-17`, `UC-18`
- **Mã yêu cầu chức năng (FR):** `FR-13`, `FR-14`, `FR-15`, `FR-16`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm mã HĐ, tên SV, số phòng... [Enter]                | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN LÝ VÒNG ĐỜI HỢP ĐỒNG & THANH LÝ PHÒNG                                                 |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| TAB CHUYỂN ĐỔI NGHIỆP VỤ:                                                                  |
|   Phòng &  | [1. HỢP ĐỒNG ĐANG HIỆU LỰC (158)] [2. YÊU CẦU ĐỔI PHÒNG (3)] [3. THANH LÝ & TRẢ PHÒNG (5)]|
|   Giường   |--------------------------------------------------------------------------------------------|
|   Sinh viên| GIAO DIỆN TAB 3: TIẾP NHẬN ĐƠN TRẢ PHÒNG & QUYẾT TOÁN HOÀN CỌC (CHECKOUT)                  |
|   Xếp phòng| +---------+--------------------+-----------+------------+------------+--------------------+ |
| * Hợp đồng | | MÃ ĐƠN  | HỌ TÊN SINH VIÊN   | PHÒNG/G   | NGÀY TRẢ   | TIỀN CỌC   | TRẠNG THÁI KIỂM KÊ | |
|   Điện nước| +---------+--------------------+-----------+------------+------------+--------------------+ |
|   Hóa đơn  | | OUT-201 | Hoàng Văn Khải     | P.302-G03 | 15/10/2026 | 1,500,000 đ| [TIẾN HÀNH KIỂM KÊ]| |
|   Sự cố    | | OUT-204 | Đặng Mỹ Linh       | P.105-G01 | 20/10/2026 | 1,400,000 đ| [Chờ sinh viên ký] | |
|   Báo cáo  | +---------+--------------------+-----------+------------+------------+--------------------+ |
|   Cài đặt  |--------------------------------------------------------------------------------------------|
|            | FORM QUYẾT TOÁN CHI PHÍ TRẢ PHÒNG (CHECKOUT SETTLEMENT):                                   |
|            | +----------------------------------------------------------------------------------------+ |
|            | | BIÊN BẢN KIỂM KÊ TÀI SẢN BÀN GIAO PHÒNG P.302 - GIƯỜNG 03                              | |
|            | | [X] Chìa khóa phòng & thẻ từ vào cổng: Đầy đủ (0 đ)                                    | |
|            | | [X] Đệm & dát giường: Nguyên vẹn (0 đ)                                                 | |
|            | | [!] Khóa tủ cá nhân: Bị gãy chốt hỏng -> Đền bù: [ 100,000 VNĐ ] (kèm ảnh minh chứng)   | |
|            | |                                                                                        | |
|            | | BẢNG QUYẾT TOÁN TÀI CHÍNH HOÀN CỌC:                                                    | |
|            | | 1. Tiền đặt cọc ban đầu đang giữ:          + 1,500,000 VNĐ                             | |
|            | | 2. Tiền điện/nước kỳ cuối (15 ngày ở):     -   115,000 VNĐ                             | |
|            | | 3. Tiền khấu trừ đền bù hỏng hóc:          -   100,000 VNĐ                             | |
|            | | ------------------------------------------------------------------                     | |
|            | | TỔNG SỐ TIỀN THỰC TẾ HOÀN LẠI SINH VIÊN:   = 1,285,000 VNĐ                             | |
|            | |                                                                                        | |
|            | | Số tài khoản nhận hoàn cọc: 1903456789 - Techcombank (Chủ TK: HOANG VAN KHAI)          | |
|            | |                                                                                        | |
|            | | [ HỦY ]                     [ XÁC NHẬN HOÀN CỌC & GIẢI PHÓNG GIƯỜNG VỀ TRỐNG ]         | |
|            | +----------------------------------------------------------------------------------------+ |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Ba Phân Hệ Nghiệp Vụ Chính (Sub-Modules)

#### Phân hệ 1: Quản lý & Gia hạn Hợp đồng (UC-16 / FR-14)
- Bảng danh sách hợp đồng hiệu lực.
- Lọc các hợp đồng **sắp hết hạn trong vòng 15 ngày** (Badge màu cam).
- Nút [Mời gia hạn]: Hệ thống tự động gửi thông báo đến app của sinh viên hỏi nguyện vọng gia hạn thêm 1 kỳ hoặc 1 năm.
- Khi sinh viên đồng ý -> Quản lý bấm [Gia hạn hợp đồng] -> Cập nhật ngày kết thúc mới mà không cần thu cọc lại.

#### Phân hệ 2: Xử lý Yêu cầu Đổi phòng (UC-18 / FR-15)
- Tiếp nhận đơn xin chuyển phòng từ sinh viên (lý do: đổi tầng, sang ở cùng bạn...).
- **Quy tắc:** Chỉ được chuyển sang giường đang `VACANT` trong phòng **cùng giới tính**.
- Tự động điều chỉnh chênh lệch tiền phòng (nếu đổi sang loại phòng đắt/rẻ hơn).

#### Phân hệ 3: Thanh lý & Trả phòng Checkout (UC-17 / FR-16)
- **Quy tắc nghiệp vụ hoàn cọc:**
  $$\text{Tiền hoàn cọc} = \text{Tiền cọc gốc} - \text{Tiền điện nước chưa thanh toán} - \text{Tiền bồi thường vật tư hỏng}$$
- Khi bấm nút **[XÁC NHẬN HOÀN CỌC & GIẢI PHÓNG GIƯỜNG VỀ TRỐNG]**:
  1. Hợp đồng chuyển sang trạng thái `TERMINATED`.
  2. Hồ sơ sinh viên chuyển sang `CHECKED_OUT`.
  3. Trạng thái vị trí giường lập tức chuyển về `VACANT` (Trống) trên sơ đồ `ADM-03`.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Hoàn tất Checkout: `POST /api/v1/admin/contracts/checkout`
```json
{
  "contractId": "HD-2026-P302G03",
  "studentId": "STU-001",
  "checkoutDate": "2026-10-15",
  "initialDeposit": 1500000,
  "utilityDeduction": 115000,
  "damageDeduction": 100000,
  "damageNote": "Bị gãy chốt khóa tủ cá nhân",
  "damageEvidenceUrl": "/uploads/damages/lock-broken.jpg",
  "finalRefundAmount": 1285000,
  "bankAccount": {
    "bankCode": "TCB",
    "accountNumber": "1903456789",
    "accountHolder": "HOANG VAN KHAI"
  }
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Thanh lý hợp đồng thành công. Giường P.302-G03 đã được giải phóng về trạng thái TRỐNG.",
  "data": {
    "refundReceiptId": "REC-REFUND-201",
    "freedBedId": "BED-302-03",
    "newBedStatus": "VACANT"
  }
}
```
