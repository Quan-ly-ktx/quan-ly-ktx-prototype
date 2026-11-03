# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-06
## TIẾP NHẬN ĐƠN ĐĂNG KÝ & XẾP PHÒNG THÔNG MINH (ALLOCATION ENGINE)
*Giải quyết Bài toán cốt lõi #3 của KTX: Kiểm soát cách ly giới tính 100% & Khởi tạo Hợp đồng cọc*

- **Mã màn hình:** `ADM-06`
- **Tên màn hình:** Xét duyệt Đơn & Phân bổ Giường KTX
- **Đường dẫn (Route):** `/admin/applications-allocation`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-11`, `UC-12`, `UC-13`, `UC-15`
- **Mã yêu cầu chức năng (FR):** `FR-09`, `FR-10`, `FR-11`, `FR-12`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm mã đơn, tên sinh viên... [Enter]                  | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | TIẾP NHẬN ĐƠN & PHÂN BỔ PHÒNG                                                              |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| HÀNG ĐỢI ĐƠN CHỜ DUYỆT (SẮP XẾP THEO DIỆN ƯU TIÊN):                                       |
|   Phòng &  | [Tất cả đơn (15)] [Chờ duyệt (8)] [Đã duyệt chờ xếp (4)] [Đã từ chối (3)]                  |
|   Giường   | +---------+--------------------+------+---------------+-------------+--------------------+ |
|   Sinh viên| | MÃ ĐƠN  | HỌ TÊN SINH VIÊN   | GIỚI | DIỆN ƯU TIÊN  | LOẠI PHÒNG  | THAO TÁC           | |
| * Xếp phòng| +---------+--------------------+------+---------------+-------------+--------------------+ |
|   Hợp đồng | | APP-102 | Nguyễn Thị Mai     | [NỮ] | Con Liệt sĩ   | 6 Giường    | [DUYỆT & XẾP PHÒNG]| |
|   Điện nước| | APP-105 | Trần Văn Hùng      | [NAM]| Hộ nghèo      | 4 Giường    | [DUYỆT & XẾP PHÒNG]| |
|   Hóa đơn  | | APP-108 | Phạm Thu Hương     | [NỮ] | SV Năm nhất   | Sleepbox    | [DUYỆT & XẾP PHÒNG]| |
|   Sự cố    | +---------+--------------------+------+---------------+-------------+--------------------+ |
|   Báo cáo  |--------------------------------------------------------------------------------------------|
|   Cài đặt  | POPUP MODAL: XẾP GIƯỜNG CHO SINH VIÊN NGUYỄN THỊ MAI (GIỚI TÍNH: NỮ)                       |
|            | +----------------------------------------------------------------------------------------+ |
|            | | QUY TẮC CÁCH LY GIỚI TÍNH 100%: Hệ thống CHỈ hiển thị phòng dành cho [NỮ]             | |
|            | |                                                                                        | |
|            | | CHỌN PHÒNG NỮ CÒN CHỖ TRỐNG:                                                           | |
|            | | (o) Phòng P.102 (Tòa A - Tầng 1) - Còn 2/6 giường trống - 1,400,000 đ/tháng            | |
|            | |     Vị trí giường còn trống:  [Giường 05 (Tầng trên)]  [(o) Giường 06 (Tầng dưới)]    | |
|            | | ( ) Phòng P.104 (Tòa A - Tầng 1) - Còn 1/4 giường trống - 1,600,000 đ/tháng            | |
|            | |                                                                                        | |
|            | | [!] CÁC PHÒNG NAM (P.201, P.202, P.301...): ĐÃ BỊ KHÓA HOÀN TOÀN (VÔ HIỆU HÓA)        | |
|            | |                                                                                        | |
|            | | THIẾT LẬP HỢP ĐỒNG & TIỀN CỌC:                                                         | |
|            | | Thời hạn hợp đồng: [01/10/2026] đến [30/06/2027] (9 tháng)                             | |
|            | | Tiền cọc giữ chỗ: [ 1,400,000 VNĐ ]                                                    | |
|            | |                                                                                        | |
|            | | [ HỦY BỎ ]                       [ XÁC NHẬN XẾP GIƯỜNG & PHÁT HÀNH HỢP ĐỒNG CỌC ]      | |
|            | +----------------------------------------------------------------------------------------+ |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Thuật Toán & Quy Tắc Cách Ly Giới Tính 100% (Gender Isolation Engine - FR-11)

```text
               [ Đơn đăng ký: Sinh viên có giới tính = G ]
                                   │
                                   ▼
        [ Truy vấn danh sách tất cả các phòng trong hệ thống ]
                                   │
            ┌──────────────────────┴──────────────────────┐
            ▼                                             ▼
  Phòng có genderPolicy == G                    Phòng có genderPolicy != G
            │                                             │
            ▼                                             ▼
   Kiểm tra số giường trống:                     KHÓA TUYỆT ĐỐI (DISABLED)
   totalBeds - occupiedBeds > 0                  Không thể click / Không hiển thị
            │
            ▼
 [ Hiển thị trên danh sách lựa chọn ]
 [ Cho phép chọn giường cụ thể ]
```

---

### 3. Quy Trình Tự Động Hóa Sau Khi Xếp Giường Thành Công (FR-12)

Khi cán bộ quản lý nhấn nút **[XÁC NHẬN XẾP GIƯỜNG & PHÁT HÀNH HỢP ĐỒNG CỌC]**:

1. **Khóa giường tạm thời (Reserved Lock):** Giường được chọn (VD: `P.102-G06`) chuyển sang trạng thái `RESERVED` trong 48 giờ để chờ sinh viên nộp cọc.
2. **Khởi tạo Hợp đồng điện tử (E-Contract Draft):** Hệ thống tự động sinh số hợp đồng (VD: `HD-2026-P102G06`) với đầy đủ điều khoản và thông tin hai bên.
3. **Sinh mã VietQR thu tiền cọc động:** Khởi tạo yêu cầu thanh toán Napas247 với nội dung chuyển khoản: `COC KTX P102 G06 <MSSV>`.
4. **Phát thông báo:** Hệ thống gửi Email & Thông báo qua App cho sinh viên kèm đường link ký hợp đồng và mã QR nộp tiền cọc.

---

### 4. Danh Mục Trường Dữ Liệu Form Xếp Phòng

| Trường dữ liệu | Kiểu | Bắt buộc | Ràng buộc nghiệp vụ |
|----------------|------|----------|---------------------|
| `applicationId` | String | Có | Mã đơn đăng ký (VD: `APP-102`) |
| `studentGender` | Enum | Có | `MALE` hoặc `FEMALE` (Khóa cố định từ hồ sơ) |
| `selectedRoomId` | Select | Có | Chỉ được chọn từ danh sách phòng có `genderPolicy == studentGender` |
| `selectedBedId` | Select | Có | Chọn vị trí giường đang ở trạng thái `VACANT` |
| `contractStartDate`| Date | Có | Ngày bắt đầu tính tiền ở |
| `contractEndDate` | Date | Có | Ngày kết thúc kỳ hạn cư trú |
| `monthlyRent` | Currency | Có | Tự động lấy từ đơn giá của phòng đã chọn |
| `depositAmount` | Currency | Có | Tiền đặt cọc giữ chỗ (mặc định 1 tháng tiền phòng) |
| `notes` | String | Không | Ghi chú thêm (VD: "Sinh viên muốn ở giường dưới vì lý do sức khỏe") |

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `POST /api/v1/admin/allocations/assign`
```json
{
  "applicationId": "APP-102",
  "studentId": "STU-102",
  "studentGender": "FEMALE",
  "roomId": "ROOM-102",
  "bedId": "BED-102-06",
  "contractStartDate": "2026-10-01",
  "contractEndDate": "2027-06-30",
  "monthlyRent": 1400000,
  "depositAmount": 1400000
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Xếp phòng thành công! Đã chuyển trạng thái Giường sang RESERVED và phát hành Hợp đồng điện tử.",
  "data": {
    "contractId": "HD-2026-P102G06",
    "depositInvoiceId": "INV-DEP-102",
    "qrCodeUrl": "https://img.vietqr.io/image/970422-0912345678-compact2.png?amount=1400000&addInfo=COC%20KTX%20P102%20G06&accountName=BAN%20QUAN%20LY%20KTX",
    "paymentDeadline": "2026-10-08T23:59:59Z"
  }
}
```
