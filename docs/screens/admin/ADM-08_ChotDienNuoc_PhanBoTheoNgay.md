# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-08
## CHỐT CHỈ SỐ ĐIỆN NƯỚC & PHÂN BỔ CHI PHÍ THEO NGÀY THỰC Ở
*Giải quyết Bài toán cốt lõi #2 của KTX Tư nhân: Thuật toán tự động phân bổ tiền điện nước theo ngày*

- **Mã màn hình:** `ADM-08`
- **Tên màn hình:** Ghi nhận Chỉ số Công tơ & Phân bổ Hóa đơn Tiện ích
- **Đường dẫn (Route):** `/admin/utilities-meter-reading`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-42`
- **Mã yêu cầu chức năng (FR):** `FR-17`, `FR-25`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm phòng cần chốt số...                              | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | CHỐT CHỈ SỐ ĐIỆN NƯỚC THÁNG 10/2026 (KỲ: 01/10 ĐẾN 31/10)     [Tòa nhà: Tòa A v] [Tầng: 3 v] |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| BƯỚC 1: NHẬP CHỈ SỐ CÔNG TƠ ĐỒNG HỒ PHÒNG P.302 (ĐỒNG HỒ DÙNG CHUNG CẢ PHÒNG)              |
|   Phòng &  | +----------------------------------------------------------------------------------------+ |
|   Giường   | | TIỆN ÍCH  | CHỈ SỐ CŨ  | CHỈ SỐ MỚI | SẢN LƯỢNG TIÊU THỤ | ĐƠN GIÁ (VNĐ) | TỔNG TIỀN PHÒNG | |
|   Sinh viên| | ĐIỆN      | 1,420 kWh  | [ 1,650 ]  | = 230 kWh          | 3,500 đ/kWh   | = 805,000 đ     | |
|   Xếp phòng| | NƯỚC      | 85 m3      | [ 97    ]  | = 12 m3            | 20,000 đ/m3   | = 240,000 đ     | |
|   Hợp đồng | | DỊCH VỤ   | Wifi, Rác, Vệ sinh hành lang (Cố định): 80,000 đ/người / tháng             | |
| * Điện nước| | Ảnh chụp công tơ: [Tải ảnh đồng hồ điện] [Tải ảnh đồng hồ nước] (Minh chứng đối soát)   | |
|   Hóa đơn  | +----------------------------------------------------------------------------------------+ |
|   Sự cố    |--------------------------------------------------------------------------------------------|
|   Báo cáo  | BƯỚC 2: BẢNG TÍNH PHÂN BỔ TỰ ĐỘNG THEO SỐ NGÀY THỰC Ở CỦA TỪNG KHÁCH (PREVIEW TABLE)       |
|   Cài đặt  | Tổng ngày công tích lũy cả phòng = 30 + 30 + 30 + 30 + 15 + 15 = 150 ngày-khách            |
|            | Đơn giá điện/ngày = 805,000 / 150 = 5,366 đ/ngày | Nước/ngày = 240,000 / 150 = 1,600 đ/ngày |
|            | +---------+---------------+------+-------+-----------+----------+---------+--------------+ |
|            | | GIƯỜNG  | HỌ TÊN KHÁCH  | NGÀY Ở THỰC  | TIỀN ĐIỆN | TIỀN NƯỚC| DỊCH VỤ | TỔNG CẦN THU | |
|            | +---------+---------------+------+-------+-----------+----------+---------+--------------+ |
|            | | G01     | Nguyễn Nam    | 30 ngày (Đủ) | 161,000 đ | 48,000 đ | 80,000 đ| 289,000 đ    | |
|            | | G02     | Lê Hùng       | 30 ngày (Đủ) | 161,000 đ | 48,000 đ | 80,000 đ| 289,000 đ    | |
|            | | G03     | Hoàng Khải    | 15 ngày (Vào)|  80,500 đ | 24,000 đ | 40,000 đ| 144,500 đ    | |
|            | | G04     | Vũ Minh Tuấn  | 15 ngày (Ra) |  80,500 đ | 24,000 đ | 40,000 đ| 144,500 đ    | |
|            | +---------+---------------+------+-------+-----------+----------+---------+--------------+ |
|            | [ TÍNH TOÁN LẠI ]                 [ DUYỆT BẢNG TÍNH & PHÁT HÀNH HÓA ĐƠN VIETQR ĐỘNG -> ]   |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Thuật Toán Phân Bổ Chi Phí Công Bằng (Prorated Allocation Formula)

Đặc thù lớn nhất của KTX Tư nhân / Sleepbox là khách thuê vào và ra lệch ngày trong tháng. Nếu chia đều theo đầu người thì người ở nửa tháng sẽ bị thiệt thòi dẫn đến tranh chấp. Do đó, thuật toán của PDMS được định nghĩa chuẩn xác như sau:

#### Bước 1: Tính tổng số ngày thực tế lưu trú của cả phòng trong kỳ
$$\text{TotalResidentDays} = \sum_{i=1}^{N} \text{DaysStayed}_i$$
*(Trong đó: $N$ là tổng số khách có ở tại phòng trong kỳ; $\text{DaysStayed}_i$ là số ngày thực tế mà khách thứ $i$ có mặt).*

#### Bước 2: Tính đơn giá ngày cho Điện và Nước của phòng
$$\text{DailyElectricityRate} = \frac{\text{TotalElectricityCost}}{\text{TotalResidentDays}}$$
$$\text{DailyWaterRate} = \frac{\text{TotalWaterCost}}{\text{TotalResidentDays}}$$

#### Bước 3: Tính số tiền từng khách phải chi trả
$$\text{ElectricityShare}_i = \text{DailyElectricityRate} \times \text{DaysStayed}_i$$
$$\text{WaterShare}_i = \text{DailyWaterRate} \times \text{DaysStayed}_i$$
$$\text{ServiceFee}_i = \text{BaseServiceFee} \times \frac{\text{DaysStayed}_i}{\text{DaysInMonth}}$$
$$\text{TotalPayable}_i = \text{ElectricityShare}_i + \text{WaterShare}_i + \text{ServiceFee}_i$$

---

### 3. Danh Mục Trường Dữ Liệu Chốt Số

| Tên trường | Kiểu | Bắt buộc | Ràng buộc kiểm tra (Validation) |
|------------|------|----------|--------------------------------|
| `roomId` | Select | Có | Chọn phòng cần chốt số |
| `billingPeriod` | Month/Year| Có | Tháng/Năm tính tiền (VD: `10/2026`) |
| `oldElectricIndex` | Number | Có | Tự động lấy từ chỉ số mới của tháng trước |
| `newElectricIndex` | Number | Có | Bắt buộc `>= oldElectricIndex`. Nếu tiêu thụ tăng đột biến > 200% -> Hiện cảnh báo vàng kiểm tra lại. |
| `oldWaterIndex` | Number | Có | Lấy từ tháng trước |
| `newWaterIndex` | Number | Có | Bắt buộc `>= oldWaterIndex` |
| `meterPhotos` | Array[File]| Có | Tải lên ít nhất 1 ảnh chụp đồng hồ điện và 1 ảnh đồng hồ nước |
| `unitPriceElectric`| Currency | Có | Đơn giá điện (VD: `3,500 đ/kWh`) |
| `unitPriceWater` | Currency | Có | Đơn giá nước (VD: `20,000 đ/m3`) |

---

### 4. Quy Trình Tự Động Hóa Phát Hành Hóa Đơn Hàng Loạt

Khi người quản lý nhấn nút **[DUYỆT BẢNG TÍNH & PHÁT HÀNH HÓA ĐƠN VIETQR ĐỘNG]**:
1. Hệ thống tạo các bản ghi Hóa đơn định kỳ (`Invoice`) riêng biệt cho từng sinh viên trong phòng.
2. Tiền phòng tháng tiếp theo được tự động gộp chung vào hóa đơn:
   $$\text{Tổng hóa đơn} = \text{Tiền phòng} + \text{Tiền điện/nước phân bổ theo ngày}$$
3. Hệ thống tạo mã VietQR động đính kèm nội dung chuyển khoản chính xác: `KTX P302 G01 THANG10`.
4. Phát thông báo tức thì lên App sinh viên (`STU-04`) và gửi thông báo qua Email.

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `POST /api/v1/admin/utilities/calculate-and-issue`
```json
{
  "roomId": "ROOM-302",
  "period": "2026-10",
  "electric": {
    "oldIndex": 1420,
    "newIndex": 1650,
    "photoUrl": "/uploads/meters/p302-elec-202610.jpg"
  },
  "water": {
    "oldIndex": 85,
    "newIndex": 97,
    "photoUrl": "/uploads/meters/p302-water-202610.jpg"
  }
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Đã tính toán phân bổ cho 4 khách và phát hành 4 hóa đơn thành công.",
  "data": {
    "totalRoomExpense": 1045000,
    "invoicesGenerated": [
      {
        "invoiceId": "INV-202610-P302-G01",
        "studentId": "STU-001",
        "studentName": "Nguyễn Nam",
        "bed": "G01",
        "daysStayed": 30,
        "electricAmount": 161000,
        "waterAmount": 48000,
        "serviceAmount": 80000,
        "roomRentAmount": 1500000,
        "totalAmount": 1789000,
        "qrCodeUrl": "https://img.vietqr.io/image/970422-0912345678-compact2.png?amount=1789000&addInfo=KTX%20P302%20G01%20THANG10"
      }
    ]
  }
}
```
