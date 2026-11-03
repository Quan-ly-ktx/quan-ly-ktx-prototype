# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-03
## SƠ ĐỒ MA TRẬN PHÒNG & GIƯỜNG (ROOM & BED MATRIX)
*Giải quyết Bài toán cốt lõi #1 của KTX Tư nhân: Quản lý đến từng vị trí giường (Bed-level)*

- **Mã màn hình:** `ADM-03`
- **Tên màn hình:** Sơ đồ trực quan Phòng & Vị trí Giường
- **Đường dẫn (Route):** `/admin/rooms-matrix`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-01`, `UC-06`, `UC-10`, `UC-13`
- **Mã yêu cầu chức năng (FR):** `FR-01`, `FR-08`, `FR-11`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm số phòng, tên SV, MSSV... [Enter] | [Thông báo] [Trần Quản Lý (Admin) v]           |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | SƠ ĐỒ PHÒNG & GIƯỜNG (BED-LEVEL MATRIX)                                                    |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| BỘ LỌC ĐA CHIỀU:                                                                           |
| * Phòng &  | [Tòa A v] [Tầng: Tất cả | T1 | T2 | T3 ] [Giới tính: Tất cả | Nam | Nữ] [Trạng thái: Còn chỗ v] |
|   Giường   | Chú thích màu: (■ Xanh dương: Có người) (□ Nét đứt: Giường trống) (■ Cam: Đang bảo trì)   |
|   Sinh viên|--------------------------------------------------------------------------------------------|
|   Hợp đồng | LƯỚI THẺ PHÒNG (ROOM CARDS GRID - 3 HOẶC 4 CỘT)                +-------------------------+ |
|   Điện nước| +----------------------------+ +----------------------------+  | DRAWER CHI TIẾT PHÒNG   | |
|   Hóa đơn  | | PHÒNG P.301 - TÒA A        | | PHÒNG P.302 - TÒA A        |  | P.302 (TẦNG 3 - NAM)    | |
|   Sự cố    | | [Badge: NỮ]  [1,500,000 đ] | | [Badge: NAM] [1,500,000 đ] |  | Sức chứa: 4/6 Giường    | |
|   Báo cáo  | | Lấp đầy: 6/6 Giường (KÍN)  | | Lấp đầy: 4/6 Giường (CÒN 2)|  |-------------------------| |
|   Cài đặt  | | [====================] 100%| | [==============    ] 66.7% |  | DANH SÁCH GIƯỜNG:       | |
|            | | MA TRẬN 6 GIƯỜNG:          | | MA TRẬN 6 GIƯỜNG:          |  | * Giường 01 (Tầng dưới):| |
|            | | [G1: Lan]   [G2: Mai]      | | [G1: Nam]   [G2: Hùng]     |  |   Nguyễn Văn Nam        | |
|            | | [G3: Hương] [G4: Thảo]     | | [G3: Minh]  [G4: Tuấn]     |  |   MSSV: 2021001 - CNTT  | |
|            | | [G5: Yến]   [G6: Ngọc]     | | [G5: TRỐNG] [G6: TRỐNG]    |  |   HĐ: 01/09/25-30/06/26 | |
|            | | [Nút: Xem chi tiết ->]     | | [Nút: Xem chi tiết ->]     |  |   [Đổi phòng] [Checkout]| |
|            | +----------------------------+ +----------------------------+  | * Giường 02: Lê Văn Hùng| |
|            | +----------------------------+ +----------------------------+  | * Giường 05: [TRỐNG]    | |
|            | | PHÒNG P.303 - TÒA A        | | PHÒNG P.304 - TÒA A        |  |   [+ Xếp sinh viên vào] | |
|            | | [Badge: NAM] [1,200,000 đ] | | [Badge: BẢO TRÌ ĐIỀU HÒA]  |  | * Tiện nghi phòng:      | |
|            | | Lấp đầy: 2/4 Giường        | | Tạm dừng nhận khách        |  |   Điều hòa, Tủ cá nhân  | |
|            | +----------------------------+ +----------------------------+  +-------------------------+ |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Cây Cấu Trúc Thành Phần (Component Hierarchy)

```text
RoomBedMatrixPage
├── AdminLayout
│   ├── FilterBar
│   │   ├── BuildingDropdown
│   │   ├── FloorSegmentedButtons (All, 1, 2, 3...)
│   │   ├── GenderFilterSegmented (All, Male, Female)
│   │   ├── StatusDropdown (All, HasSlots, Full, Maintenance)
│   │   └── LegendIndicators (Occupied, Empty, Maintenance)
│   ├── RoomGridContainer (CSS Grid 3-4 cols)
│   │   └── RoomCardItem (Lặp cho từng phòng)
│   │       ├── RoomCardHeader (RoomNumber, GenderBadge, PriceTag)
│   │       ├── OccupancyProgressBar (Filled/Total)
│   │       ├── BedSlotMiniGrid (Slots 1..n)
│   │       │   └── BedSlotBadge (Occupied with initials / Empty with '+' icon / Maintenance)
│   │       └── CardFooter (QuickInspectButton)
│   └── RoomDetailSlideOver (Drawer 420px width, trượt từ mép phải)
│       ├── DrawerHeader (RoomCode, Building, CloseButton)
│       ├── BedListAccordion
│       │   └── BedDetailItem (BedNumber, OccupantAvatar, StudentName, MSSV, ContractDuration, Actions)
│       ├── RoomAmenitiesChips
│       └── DrawerActions (AddMaintenanceTicket, PrintRoomInventory)
```

---

### 3. Danh Mục Trường Dữ Liệu Thẻ Phòng & Vị Trí Giường

| Khối dữ liệu | Trường dữ liệu | Kiểu | Mô tả & Ràng buộc hiển thị |
|--------------|----------------|------|----------------------------|
| **Room Info**| `roomNumber` | String | Mã phòng: `P.301`, `P.302` |
| | `floor` | Number | Tầng 1..5 |
| | `genderPolicy` | Enum | `MALE` (Xanh dương) / `FEMALE` (Hồng/Cam) / `UNASSIGNED` |
| | `basePrice` | Number | Giá thuê 1 giường/tháng (VD: `1,500,000 đ`) |
| | `totalBeds` | Number | Tổng số giường (4, 6 hoặc 8 giường) |
| | `occupiedBeds` | Number | Số giường đang có khách ở |
| | `status` | Enum | `AVAILABLE` (còn chỗ), `FULL` (đầy), `MAINTENANCE` (bảo trì) |
| **Bed Slot** | `bedNumber` | String | `G01`, `G02`, `G03`... (kèm định danh Tầng trên / Tầng dưới) |
| | `isOccupied` | Boolean | `true` nếu có người đang ở |
| | `occupant` | Object | Thông tin sinh viên (Avatar, Họ tên, MSSV, SĐT, Ngày hết hạn HĐ) |
| | `bedStatus` | Enum | `OCCUPIED` (Có người), `VACANT` (Trống), `RESERVED` (Đã cọc chờ vào), `MAINTENANCE` (Hỏng) |

---

### 4. Luồng Tương Tác Cốt Lõi Trên Màn Hình

1. **Xem chi tiết phòng & giường (Inspect Flow):**
   - Người dùng click vào bất kỳ vùng nào trên `RoomCard` -> Mở `RoomDetailSlideOver` bên phải.
   - Hiển thị danh sách từng giường từ `G01` đến `G06`.
2. **Xếp phòng trực tiếp từ giường trống:**
   - Trong Drawer hoặc ngay trên thẻ phòng, click vào vị trí `[+ G05 TRỐNG]` -> Mở Modal [Xếp sinh viên vào giường P.302-G05].
   - **Hệ thống tự động lọc danh sách sinh viên chờ duyệt:** CHỈ hiển thị sinh viên có **giới tính khớp với phòng** (`MALE`).
3. **Thao tác nhanh trên giường có người:**
   - Tại dòng của sinh viên, menu 3 chấm cung cấp 3 hành động:
     - [Xem hồ sơ sinh viên]: Chuyển hướng sang `ADM-05`.
     - [Đổi sang phòng khác]: Mở dialog chọn phòng trống cùng giới tính.
     - [Thanh lý hợp đồng / Trả phòng]: Chuyển sang quy trình checkout `ADM-07`.

4. **Bảo trì độc lập từng vị trí giường:**
   - Tại Drawer chi tiết, mỗi vị trí giường trống (`VACANT`) có nút chuyển trạng thái [Bảo trì giường].
   - Ràng buộc: Giường chỉ được chuyển sang `MAINTENANCE` khi không có người ở. Giường đang có người ở (`OCCUPIED`) bị khóa chức năng bảo trì.
---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/admin/rooms/matrix?buildingId=BLD-A&floor=3&gender=MALE`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": [
    {
      "roomId": "ROOM-302",
      "roomNumber": "P.302",
      "building": "Tòa A",
      "floor": 3,
      "genderPolicy": "MALE",
      "basePrice": 1500000,
      "totalBeds": 6,
      "occupiedBeds": 4,
      "status": "AVAILABLE",
      "amenities": ["Điều hòa 1.5HP", "Bình nóng lạnh", "Tủ sắt 6 ngăn", "Wifi riêng"],
      "beds": [
        {
          "bedId": "BED-302-01",
          "bedNumber": "G01",
          "tier": "LOWER",
          "status": "OCCUPIED",
          "occupant": {
            "studentId": "2021001",
            "fullName": "Nguyễn Văn Nam",
            "phone": "0912345678",
            "faculty": "Công nghệ thông tin",
            "contractEnd": "2026-06-30"
          }
        },
        {
          "bedId": "BED-302-05",
          "bedNumber": "G05",
          "tier": "UPPER",
          "status": "VACANT",
          "occupant": null
        }
      ]
    }
  ]
}
```
