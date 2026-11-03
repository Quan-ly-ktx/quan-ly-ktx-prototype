# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-12
## QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN TRUY CẬP (RBAC MANAGEMENT)

- **Mã màn hình:** `ADM-12`
- **Tên màn hình:** Quản lý Tài khoản & Phân quyền Hệ thống
- **Đường dẫn (Route):** `/admin/system-rbac`
- **Tác nhân chính:** Chủ KTX (Super Admin), Ban Quản lý cấp cao
- **Mã Use Case liên kết:** `UC-37`
- **Mã yêu cầu chức năng (FR):** `FR-29`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1280px)

```text
+---------------------------------------------------------------------------------------------------------+
| [Logo KTX Hub] | Tìm tài khoản nhân viên...                            | [Thông báo] [Chủ KTX (Super) v]|
+------------+--------------------------------------------------------------------------------------------+
| SIDEBAR    | QUẢN TRỊ TÀI KHOẢN & PHÂN QUYỀN HỆ THỐNG                     [+ Tạo tài khoản cán bộ mới]  |
|            |--------------------------------------------------------------------------------------------|
|   Tổng quan| DANH SÁCH TÀI KHOẢN CÁN BỘ & NHÂN SỰ NỘI BỘ:                                               |
|   Phòng &  | +-------------+--------------------+-----------------------+-------------+---------------+ |
|   Giường   | | TÊN ĐĂNG NHẬP| HỌ VÀ TÊN          | VAI TRÒ (ROLE)        | PHÒNG BAN   | TRẠNG THÁI    | |
|   Sinh viên| +-------------+--------------------+-----------------------+-------------+---------------+ |
|   Xếp phòng| | chuktx_hung | Trần Văn Hùng      | [CHỦ CƠ SỞ (OWNER)]   | Ban Giám đốc| [HOẠT ĐỘNG]   | |
|   Hợp đồng | | ql_thanh    | Lê Thị Thanh       | [QUẢN LÝ KTX (MANAGER)| Vận hành    | [HOẠT ĐỘNG]   | |
|   Điện nước| | kt_tuan     | Nguyễn Văn Tuấn    | [KỸ THUẬT VIÊN]       | Tổ Bảo trì  | [HOẠT ĐỘNG]   | |
|   Hóa đơn  | | ketoan_nga  | Phạm Thúy Nga      | [KẾ TOÁN (ACCOUNTANT)]| Tài chính   | [TẠM KHÓA]    | |
|   Sự cố    | +-------------+--------------------+-----------------------+-------------+---------------+ |
|   Báo cáo  |--------------------------------------------------------------------------------------------|
| * Cài đặt  | MA TRẬN PHÂN QUYỀN CHI TIẾT THEO VAI TRÒ (PERMISSION MATRIX):                              |
|            | +---------------------------+---------+-----------+------------+------------+            |
|            | | CHỨC NĂNG NGHIỆP VỤ       | CHỦ KTX | QUẢN LÝ   | KẾ TOÁN    | KỸ THUẬT   |            |
|            | +---------------------------+---------+-----------+------------+------------+            |
|            | | Xem Báo cáo Doanh thu     |   [X]   |    [X]    |    [X]     |    [ ]     |            |
|            | | Quản lý Danh mục Phòng    |   [X]   |    [X]    |    [ ]     |    [ ]     |            |
|            | | Xếp phòng & Duyệt Hợp đồng|   [X]   |    [X]    |    [ ]     |    [ ]     |            |
|            | | Chốt số Điện Nước         |   [X]   |    [X]    |    [ ]     |    [ ]     |            |
|            | | Gạch nợ & Thu tiền Hóa đơn|   [X]   |    [X]    |    [X]     |    [ ]     |            |
|            | | Tiếp nhận Phiếu Sửa chữa  |   [X]   |    [X]    |    [ ]     |    [X]     |            |
|            | | Lập Biên bản Kỷ luật      |   [X]   |    [X]    |    [ ]     |    [ ]     |            |
|            | | Phân quyền Tài khoản Admin|   [X]   |    [ ]    |    [ ]     |    [ ]     |            |
|            | +---------------------------+---------+-----------+------------+------------+            |
+------------+--------------------------------------------------------------------------------------------+
```

---

### 2. Danh Mục Vai Trò & Ma Trận Phân Quyền (RBAC Definitions)

1. **CHỦ CƠ SỞ (SUPER ADMIN / OWNER):**
   - Toàn quyền tối cao trên toàn hệ thống.
   - Được phân quyền tài khoản, xem mọi dòng tiền, cấu hình tài khoản ngân hàng nhận tiền VietQR.
2. **QUẢN LÝ KTX (MANAGER):**
   - Vận hành hằng ngày: Duyệt đơn, xếp giường cách ly giới tính, tạo hợp đồng, chốt số điện nước, lập biên bản vi phạm, giao việc sửa chữa.
   - Không được xóa tài khoản người dùng khác hoặc đổi thông tin ngân hàng của chủ cơ sở.
3. **KẾ TOÁN (ACCOUNTANT):**
   - Quản lý hóa đơn, đối soát sao kê ngân hàng, gạch nợ tiền mặt, xuất báo cáo tài chính.
4. **KỸ THUẬT VIÊN (TECHNICIAN):**
   - Chỉ được xem danh sách phiếu báo hỏng được giao, cập nhật tiến độ và chụp ảnh nghiệm thu.

---

### 3. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request Cập nhật trạng thái tài khoản: `PATCH /api/v1/admin/users/{userId}/status`
```json
{
  "userId": "USR-ADM-004",
  "status": "SUSPENDED",
  "reason": "Nhân viên nghỉ việc thai sản"
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "message": "Đã cập nhật trạng thái tài khoản USR-ADM-004 sang TẠM KHÓA thành công.",
  "data": {
    "userId": "USR-ADM-004",
    "status": "SUSPENDED",
    "updatedAt": "2026-10-06T20:25:00Z"
  }
}
```
