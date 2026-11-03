# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-02
## BẢNG ĐIỀU KHIỂN TỔNG QUAN & PHÂN TÍCH KPI (DASHBOARD)

- **Mã màn hình:** `ADM-02`
- **Tên màn hình:** Bảng điều khiển Quản trị & Chỉ số vận hành KTX
- **Đường dẫn (Route):** `/admin/dashboard`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX
- **Mã Use Case liên kết:** `UC-29`, `UC-30`, `UC-31`, `UC-32`
- **Mã yêu cầu chức năng (FR):** `FR-23`, `FR-24`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+-------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm nhanh (MSSV, Phòng, HĐ)... | [Thông báo (3)] [Trần Quản Lý (Admin) v]             |
+------------+------------------------------------------------------------------------------------------+
| SIDEBAR    | TOPBAR BREADCRUMB: Quản trị > Bảng điều khiển tổng quan        [Tháng 10/2026 v] [Tòa A v]|
|            |------------------------------------------------------------------------------------------|
| * Tổng quan| [ 4 THẺ CHỈ SỐ KPI CHÍNH ]                                                               |
|   Phòng &  | +--------------------+ +--------------------+ +--------------------+ +-----------------+ |
|   Giường   | | TỔNG SỨC CHỨA      | | DOANH THU THÁNG    | | NỢ PHÍ QUÁ HẠN     | | SỰ CỐ KHẨN CẤP  | |
|   Sinh viên| | 158/180 Giường     | | 145,200,000 đ      | | 12 Sinh viên       | | 4 Phiếu mới     | |
|   Hợp đồng | | Lấp đầy: 87.7%     | | Đã thu: 65%        | | Tổng: 18,400,000 đ | | 2 Ca khẩn cấp   | |
|   Điện nước| | [+3.2% so tháng tr]| | [-4.1% dự kiến]    | | [Xem danh sách ->] | | [Xem ngay ->]   | |
|   Hóa đơn  | +--------------------+ +--------------------+ +--------------------+ +-----------------+ |
|   Sự cố    |------------------------------------------------------------------------------------------|
|   Báo cáo  | [ KHU VỰC BIỂU ĐỒ TRỰC QUAN (CHARTS) ]                                                   |
|   Cài đặt  | +-----------------------------------------------+ +------------------------------------+ |
|            | | TỶ LỆ LẤP ĐẦY THEO TẦNG (Bullet Chart)        | | DOANH THU THEO KỲ (Bar Chart)      | |
|            | | Tầng 1: [=========================] 95% (38)  | | [Cột: Tiền phòng | Tiền điện/nước] | |
|            | | Tầng 2: [======================   ] 88% (35)  | | T7: 135tr | T8: 142tr | T9: 148tr  | |
|            | | Tầng 3: [====================     ] 80% (32)  | | T10 (Hiện tại): 145.2tr            | |
|            | +-----------------------------------------------+ +------------------------------------+ |
|            |------------------------------------------------------------------------------------------|
|            | [ 2 BẢNG TÓM TẮT ĐIỀU HÀNH NHANH ]                                                       |
|            | +-----------------------------------------------+ +------------------------------------+ |
|            | | CẢNH BÁO NỢ TIỀN QUÁ HẠN (> 5 NGÀY)           | | YÊU CẦU SỬA CHỮA CHỜ TIẾP NHẬN     | |
|            | | MSSV    | Tên SV    | Phòng | Số tiền | Ngày  | | Mã    | Phòng | Sự cố     | Ưu tiên| |
|            | | 2021001 | Nguyễn A  | P.302 | 1,520k  | 6 ngày| | TK102 | P.204 | Chập điện | [KHẨN] | |
|            | | 2021045 | Lê Thị B  | P.105 | 1,850k  | 8 ngày| | TK105 | P.301 | Gãy vòi   | [VÀNG] | |
|            | | [Nút: Gửi thông báo nhắc nợ hàng loạt]        | | [Nút: Điều phối thợ ngay]          | |
|            | +-----------------------------------------------+ +------------------------------------+ |
+------------+------------------------------------------------------------------------------------------+
```

---

### 2. Cây Cấu Trúc Thành Phần (Component Hierarchy)

```text
AdminDashboardPage
├── AdminLayout (Sidebar, TopHeader, MainContainer)
│   ├── BreadcrumbNavigation
│   ├── FilterToolbar (MonthYearPicker, BuildingSelector)
│   ├── KpiMetricsSection
│   │   ├── MetricCard (OccupancyRate, icon: Bed, delta: +3.2%)
│   │   ├── MetricCard (MonthlyRevenue, icon: Currency, progress: 65%)
│   │   ├── MetricCard (OverdueDebts, icon: WarningAlert, color: Danger)
│   │   └── MetricCard (EmergencyTickets, icon: Wrench, color: Warning)
│   ├── AnalyticsChartsSection (Grid 2 cols)
│   │   ├── OccupancyByFloorChart (Accessible Bullet/Bar Chart with Fallback Table)
│   │   └── RevenueTrendChart (Grouped Bar Chart - Room fee vs Utilities)
│   └── OperationalSummarySection (Grid 2 cols)
│       ├── OverdueDebtorsMiniTable
│       │   ├── TableHeader & Rows
│       │   └── BulkReminderActionButton
│       └── PendingTicketsMiniTable
│           ├── TableHeader & Badges
│           └── QuickDispatchActionButton
```

---

### 3. Danh Mục Dữ Liệu & Thao Tác (Data & Interactions)

| Khối giao diện | Thành phần | Mô tả dữ liệu | Hành động tương tác (Action) |
|----------------|------------|---------------|------------------------------|
| **Bộ lọc kỳ** | Dropdown Month | Tháng 01..12 / Năm 2026 | Tự động làm mới toàn bộ KPI và biểu đồ khi đổi |
| **KPI Sức chứa** | Thẻ 1 | 158 giường có khách / 180 tổng giường | Click chuyển hướng sang màn hình `ADM-03` |
| **KPI Doanh thu** | Thẻ 2 | Tổng tiền hóa đơn đã xuất trong tháng | Click chuyển sang màn hình `ADM-09` |
| **KPI Nợ quá hạn** | Thẻ 3 | Số sinh viên quá hạn nộp > 5 ngày | Mở Drawer danh sách sinh viên nợ cước |
| **KPI Sự cố** | Thẻ 4 | Số phiếu báo hỏng trạng thái `MỚI` | Click chuyển sang màn hình `ADM-10` |
| **Nhắc nợ nhanh** | Button | Nút "Gửi thông báo nhắc nợ" | Gửi push notification & email nhắc nợ hàng loạt |

---

### 4. Quản Lý Trạng Thái Giao Diện (UI States)

1. **Loading State:** 
   - 4 Thẻ KPI hiển thị Skeleton khối vuông bo góc (shimmer effect).
   - Khung biểu đồ hiển thị Skeleton placeholder có `aria-busy="true"`.
2. **Empty State:**
   - Khi KTX mới khởi tạo chưa có dữ liệu: Hiển thị banner chào mừng + 3 nút hành động khởi tạo: [Thêm phòng đầu tiên], [Thiết lập đơn giá điện nước], [Nhập danh sách sinh viên].
3. **Data Refresh:**
   - Cơ chế polling nhẹ mỗi 60 giây hoặc Websocket để cập nhật sự cố khẩn cấp và giao dịch thanh toán VietQR mới mà không cần F5 trang.

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `GET /api/v1/admin/dashboard/summary?month=10&year=2026&buildingId=BLD-A`

#### Response Mẫu (HTTP 200):
```json
{
  "success": true,
  "data": {
    "kpi": {
      "totalBeds": 180,
      "occupiedBeds": 158,
      "occupancyRate": 87.77,
      "occupancyGrowthPercent": 3.2,
      "expectedRevenue": 145200000,
      "collectedRevenue": 94380000,
      "collectionPercent": 65.0,
      "overdueDebtorsCount": 12,
      "totalOverdueAmount": 18400000,
      "pendingTicketsCount": 4,
      "urgentTicketsCount": 2
    },
    "occupancyByFloor": [
      { "floor": "Tầng 1", "occupied": 38, "total": 40, "rate": 95.0 },
      { "floor": "Tầng 2", "occupied": 35, "total": 40, "rate": 87.5 },
      { "floor": "Tầng 3", "occupied": 32, "total": 40, "rate": 80.0 }
    ],
    "overdueDebtors": [
      { "studentId": "2021001", "name": "Nguyễn Văn A", "room": "P.302", "bed": "G01", "amount": 1520000, "overdueDays": 6 },
      { "studentId": "2021045", "name": "Lê Thị B", "room": "P.105", "bed": "G03", "amount": 1850000, "overdueDays": 8 }
    ]
  }
}
```
