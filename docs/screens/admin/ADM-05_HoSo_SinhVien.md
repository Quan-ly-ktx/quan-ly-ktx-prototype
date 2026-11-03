# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-05
## QUẢN LÝ HỒ SƠ SINH VIÊN & CƯ TRÚ (STUDENT MANAGEMENT)

- **Mã màn hình:** `ADM-05`
- **Tên màn hình:** Quản lý Hồ sơ Sinh viên & Tình trạng Cư trú
- **Đường dẫn (Route):** `/admin/students`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-07`, `UC-08`, `UC-09`
- **Mã yêu cầu chức năng (FR):** `FR-06`, `FR-07`, `FR-08`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm MSSV, Họ tên, SĐT, Số CCCD, Phòng... [Enter]      | [Thông báo] [Trần Quản Lý v]   |
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN LÝ HỒ SƠ SINH VIÊN NỘI TRÚ                            [+ Thêm sinh viên] [Xuất Excel] |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| BỘ LỌC ĐA CHIỀU:                                                                           |
|   Phòng &  | [Trường ĐH / Khoa: Tất cả v] [Phòng: Tất cả v] [Trạng thái: Đang ở v] [Giới tính: Tất cả v]|
|   Giường   |--------------------------------------------------------------------------------------------|
| * Sinh viên| BẢNG DỮ LIỆU SINH VIÊN (DATA TABLE)                                                        |
|   Hợp đồng | +---------+--------------------+------+-----------+-----------+------------+-------------+ |
|   Điện nước| | MSSV    | HỌ VÀ TÊN          | GIỚI | SĐT       | PHÒNG/G   | HẠN HỢP ĐỒNG| TRẠNG THÁI | |
|   Hóa đơn  | +---------+--------------------+------+-----------+-----------+------------+-------------+ |
|   Sự cố    | | 2021001 | Nguyễn Văn Nam     | Nam  | 0912345678| P.302-G01 | 30/06/2026 | [Đang ở]    | |
|   Báo cáo  | | 2021045 | Trần Thị Thảo      | Nữ   | 0987654321| P.102-G04 | 15/01/2026 | [Sắp hết HĐ]| |
|   Cài đặt  | | 2020888 | Lê Minh Tuấn       | Nam  | 0903112233| P.302-G04 | 30/06/2026 | [Đang ở]    | |
|            | | 2019999 | Hoàng Anh Quân     | Nam  | 0933445566| P.201-G02 | 31/08/2025 | [Đã rời KTX]| |
|            | +---------+--------------------+------+-----------+-----------+------------+-------------+ |
|            | Hiển thị 1-10 trên tổng số 158 sinh viên          [<<] [<] [1] [2] [3] [>] [>>]            |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Cây Cấu Trúc Thành Phần & Modal Chi Tiết Hồ Sơ

```text
StudentManagementPage
├── AdminLayout
│   ├── SearchAndFilterBar (SearchInput, FacultySelect, RoomSelect, StatusSegmented)
│   ├── StudentDataTable
│   │   ├── TableHeaders (Sortable by MSSV, Name, Room, ContractEnd)
│   │   └── StudentRowItem (Avatar, FullName, MSSV, Phone, RoomBed, BadgeStatus, ActionsDropdown)
│   └── StudentProfileModal (Large Dialog - 3 Tabs)
│       ├── ModalHeader (StudentName, MSSV, StatusBadge, CloseButton)
│       ├── TabNavigation ([1. Thông tin cá nhân] [2. Hợp đồng & Cọc] [3. Kỷ luật & Vi phạm])
│       ├── TabContent_1_PersonalInfo
│       │   ├── IdentityInfo (CCCD number, Date of birth, Hometown, Faculty)
│       │   ├── IDCardImagesPreview (Front/Back photo with zoom)
│       │   └── EmergencyContactBlock (ParentName, Relationship, EmergencyPhone, HomeAddress)
│       ├── TabContent_2_ContractAndBilling
│       │   ├── CurrentContractCard (Room, Bed, Price, DepositHeld, StartDate, EndDate)
│       │   └── BillingHistoryTable (Months, Amount, VietQR Transaction ID, Status)
│       └── TabContent_3_DisciplineHistory
│           └── IncidentList (Date, ViolationType, DemeritPoints, FineAmount, EvidenceImage)
```

---

### 3. Danh Mục Trường Dữ Liệu Hồ Sơ Sinh Viên

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả & Quy tắc kiểm tra |
|----------------|------|----------|--------------------------|
| `studentCode` | String | Có | Mã số sinh viên (MSSV) - Duy nhất |
| `fullName` | String | Có | Họ và tên đầy đủ |
| `gender` | Enum | Có | `MALE` hoặc `FEMALE` |
| `dateOfBirth` | Date | Có | Định dạng DD/MM/YYYY |
| `idCardNumber` | String | Có | Số CCCD (đúng 12 chữ số) |
| `idCardImages` | Array[URL]| Có | 2 ảnh mặt trước và mặt sau CCCD |
| `phoneNumber` | String | Có | Số điện thoại di động chính chủ |
| `email` | String | Có | Email sinh viên để nhận thông báo / hóa đơn |
| `university` | String | Có | Trường đại học đang theo học |
| `faculty` | String | Có | Khoa / Chuyên ngành |
| `emergencyName`| String | Có | Tên bố/mẹ hoặc người giám hộ |
| `emergencyPhone`| String | Có | Số điện thoại liên hệ khẩn cấp |
| `currentRoom` | String | Không | Phòng và giường đang ở (Ví dụ: `P.302-G01`) |
| `residentStatus`| Enum | Có | `ACTIVE` (Đang ở), `RESERVED` (Chờ vào), `CHECKED_OUT` (Đã rời đi) |

---

### 4. Quy Tắc Nghiệp Vụ Chuyển Trạng Thái Hồ Sơ (FR-07)

- Khi sinh viên hoàn tất thủ tục trả phòng (Checkout - `ADM-07`), hệ thống tự động:
  1. Chuyển `residentStatus` từ `ACTIVE` sang `CHECKED_OUT` ("Đã rời KTX").
  2. Xóa liên kết cư trú trên giường để giải phóng giường về trạng thái `VACANT` (Trống).
  3. Hồ sơ cá nhân và lịch sử thanh toán được lưu trữ vĩnh viễn trong kho lưu trữ (Archive) để đối soát lịch sử khi cần.

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/admin/students?page=1&limit=10&status=ACTIVE&search=2021001`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": {
    "total": 1,
    "items": [
      {
        "studentId": "STU-001",
        "studentCode": "2021001",
        "fullName": "Nguyễn Văn Nam",
        "gender": "MALE",
        "phoneNumber": "0912345678",
        "email": "nam.nv2021001@sis.hust.edu.vn",
        "idCardNumber": "001202012345",
        "roomBed": "P.302 - G01",
        "contractEndDate": "2026-06-30",
        "residentStatus": "ACTIVE",
        "emergencyContact": {
          "name": "Nguyễn Văn Hùng (Bố)",
          "phone": "0903456789",
          "address": "Xã Tân Triều, Huyện Thanh Trì, Hà Nội"
        }
      }
    ]
  }
}
```
