# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-04
## QUẢN LÝ DANH MỤC PHÒNG, TIỆN NGHI & SỨC CHỨA

- **Mã màn hình:** `ADM-04`
- **Tên màn hình:** Quản lý Danh mục Phòng & Thiết lập Tiện nghi
- **Đường dẫn (Route):** `/admin/rooms-management`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-02`, `UC-03`, `UC-04`, `UC-05`
- **Mã yêu cầu chức năng (FR):** `FR-02`, `FR-03`, `FR-04`, `FR-05`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm số phòng, tầng... [Enter]                         | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN LÝ DANH MỤC PHÒNG                                     [+ THÊM PHÒNG MỚI] [Xuất Excel] |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| BỘ LỌC DỮ LIỆU:                                                                            |
| * Phòng &  | [Tòa nhà: Tất cả v] [Tầng: Tất cả v] [Loại phòng: 4/6/8 giường v] [Trạng thái: Tất cả v]   |
|   Giường   |--------------------------------------------------------------------------------------------|
|   Sinh viên| BẢNG DỮ LIỆU DANH MỤC PHÒNG (DATA TABLE)                                                   |
|   Hợp đồng | +-------+------+------------+-----------+-------------+---------+---------------+--------+ |
|   Điện nước| | SỐ PH | TẦNG | LOẠI PHÒNG | GIỚI TÍNH | ĐƠN GIÁ/TH  | GIƯỜNG  | TIỆN NGHI     | T.THÁI | |
|   Hóa đơn  | +-------+------+------------+-----------+-------------+---------+---------------+--------+ |
|   Sự cố    | | P.101 | T1   | 4 Giường   | [NỮ]      | 1,600,000 đ | 4/4 Kín | ĐH, Nóng lạnh | Đang ở | |
|   Báo cáo  | | P.102 | T1   | 6 Giường   | [NỮ]      | 1,400,000 đ | 4/6 Còn | ĐH, Tủ sắt    | Đang ở | |
|   Cài đặt  | | P.201 | T2   | 6 Giường   | [NAM]     | 1,400,000 đ | 0/6 Trố | ĐH, Ban công  | Trống  | |
|            | | P.202 | T2   | 8 Giường   | [NAM]     | 1,100,000 đ | 0/8 Trố | Quạt, Tủ sắt  | Bảo trì| |
|            | +-------+------+------------+-----------+-------------+---------+---------------+--------+ |
|            | Hiển thị 1-10 trên tổng số 28 phòng                [<<] [<] [1] [2] [3] [>] [>>]           |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Cây Cấu Trúc Thành Phần (Component Hierarchy)

```text
RoomManagementPage
├── AdminLayout
│   ├── PageHeaderWithActions (Title, AddRoomButton, ExportButton)
│   ├── FilterToolbar (BuildingSelect, FloorSelect, RoomTypeSelect, StatusSelect, SearchInput)
│   ├── RoomDataTable (Sticky Header, Striped rows, Action column)
│   │   ├── TableHeaders
│   │   ├── TableBodyRows
│   │   │   └── RoomRowItem (RoomCode, Floor, Type, GenderBadge, Price, BedRatio, AmenitiesBadges, Status, Actions)
│   │   └── TablePagination (PageSizeDropdown, PageNavigation)
│   ├── AddEditRoomModal (Dialog popup)
│   │   ├── RoomBasicInfoFields (Number, Floor, Building)
│   │   ├── RoomTypeAndGenderFields (TotalBeds, LowerUpperRatio, GenderPolicy)
│   │   ├── PricingFields (BaseBedPrice, DepositAmount)
│   │   ├── AmenitiesCheckboxGroup (AC, Heater, Fridge, Balcony, Desk...)
│   │   └── ModalFooterButtons (Cancel, SaveButton)
│   └── DeleteRoomConfirmationModal (Cảnh báo nghiệp vụ)
```

---

### 3. Danh Mục Trường Dữ Liệu Form Thêm / Sửa Phòng

| Tên trường | Kiểu | Bắt buộc | Ràng buộc kiểm tra (Validation) |
|------------|------|----------|--------------------------------|
| `roomNumber` | String | Có | Định dạng chuẩn: `P.xxx` (Ví dụ: `P.301`). Không trùng lặp. |
| `buildingId` | Select | Có | Chọn Tòa nhà (Tòa A, Tòa B) |
| `floor` | Number | Có | Tầng 1 đến 10 |
| `genderPolicy` | Select | Có | `MALE` (Nam) hoặc `FEMALE` (Nữ) |
| `roomType` | Select | Có | `4_BEDS`, `6_BEDS`, `8_BEDS`, `SLEEPBOX` |
| `totalBeds` | Number | Có | Tự động điền theo loại phòng (4, 6, 8) |
| `basePricePerBed`| Currency | Có | Giá thuê 1 giường/tháng, >= 500,000 VNĐ |
| `depositPerBed` | Currency | Có | Tiền đặt cọc giữ chỗ tiêu chuẩn (VD: 1 tháng tiền phòng) |
| `amenities` | Array[String] | Không | Danh sách tiện nghi chọn từ checkbox |
| `status` | Select | Có | `AVAILABLE` (Trống), `OCCUPIED` (Đang ở), `MAINTENANCE` (Bảo trì), `DAMAGED` (Hỏng hóc) |

---

### 4. Quy Tắc Nghiệp Vụ Xóa Phòng (Business Constraint - FR-04)

- **Quy tắc an toàn dữ liệu:** Hệ thống **nghiêm cấm xóa phòng** nếu phòng thỏa mãn một trong các điều kiện sau:
  1. `occupiedBeds > 0` (Đang có ít nhất 1 sinh viên cư trú).
  2. Tồn tại ít nhất 1 hợp đồng thuê phòng ở trạng thái `ACTIVE` hoặc `PENDING_DEPOSIT`.
- **Hành vi trên giao diện:**
  - Nút [Xóa phòng] bị vô hiệu hóa (màu xám mờ) kèm Tooltip: *"Không thể xóa: Phòng đang có người ở hoặc tồn tại hợp đồng hiệu lực"*.
  - Nếu phòng trống hoàn toàn: Bấm [Xóa] sẽ bật Modal cảnh báo đỏ 2 bước yêu cầu gõ lại mã phòng để xác nhận xóa vĩnh viễn.

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Tạo mới: `POST /api/v1/admin/rooms`
```json
{
  "roomNumber": "P.305",
  "buildingId": "BLD-A",
  "floor": 3,
  "genderPolicy": "MALE",
  "roomType": "6_BEDS",
  "totalBeds": 6,
  "basePricePerBed": 1400000,
  "depositPerBed": 1400000,
  "amenities": ["AIR_CONDITIONER", "WATER_HEATER", "INDIVIDUAL_LOCKER", "BALCONY"]
}
```

#### Response Thành công (HTTP 201):
```json
{
  "success": true,
  "message": "Tạo phòng P.305 thành công với 6 vị trí giường tự động (G01 đến G06).",
  "data": {
    "roomId": "ROOM-A-305",
    "roomNumber": "P.305",
    "status": "AVAILABLE",
    "createdAt": "2026-10-06T20:00:00Z"
  }
}
```
