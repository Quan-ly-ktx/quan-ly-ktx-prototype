# HỆ THỐNG ĐẶC TẢ CHI TIẾT GIAO DIỆN & LUỒNG NGHIỆP VỤ (SCREEN SPECIFICATIONS INDEX)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TƯ NHÂN (PDMS)

> Tài liệu này đóng vai trò làm **Mục lục điều hướng (Master Index)** kết nối toàn bộ 21 file đặc tả giao diện chi tiết thuộc 3 phân hệ người dùng. Các file được thiết kế theo chuẩn kỹ thuật chuyên sâu để **AI Coding Agent / Frontend Developer** có thể đọc và hiện thực hóa giao diện trọn vẹn, bám sát tài liệu SRS ([TÀI LIỆU SRS QUẢN LÝ KTX SINH VIÊN(1).pdf](file:///d:/Quan_ly_ktx/T%C3%80I%20LI%E1%BB%86U%20SRS%20QU%E1%BA%A2N%20L%C3%9D%20KTX%20SINH%20VI%C3%8AN(1).pdf)) và Design System [MASTER (1).md](file:///d:/Quan_ly_ktx/MASTER%20(1).md).

---

## 1. PHÂN HỆ BAN QUẢN LÝ & CHỦ KTX (DESKTOP WEB DASHBOARD)

| Mã màn hình | Tên màn hình | Đường dẫn Route | Mã Use Case / FR | Liên kết file đặc tả chi tiết |
|-------------|--------------|-----------------|------------------|--------------------------------|
| **ADM-01** | Đăng nhập & Xác thực Quản trị | `/admin/login` | `UC-35, 36, 38, 39` / `FR-27, 28, 30` | [ADM-01_DangNhap_XacThuc.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-01_DangNhap_XacThuc.md) |
| **ADM-02** | Bảng điều khiển Tổng quan & KPI | `/admin/dashboard` | `UC-29, 30, 31, 32` / `FR-23, 24` | [ADM-02_Dashboard_TongQuan.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-02_Dashboard_TongQuan.md) |
| **ADM-03** | Sơ đồ Ma trận Phòng & Giường | `/admin/rooms-matrix` | `UC-01, 06, 10, 13` / `FR-01, 08, 11` | [ADM-03_SoDo_Phong_Giuong.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-03_SoDo_Phong_Giuong.md) *(Bài toán #1)* |
| **ADM-04** | Quản lý Danh mục Phòng & Tiện nghi | `/admin/rooms-management` | `UC-02, 03, 04, 05` / `FR-02, 03, 04, 05` | [ADM-04_QuanLy_DanhMuc_Phong.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-04_QuanLy_DanhMuc_Phong.md) |
| **ADM-05** | Quản lý Hồ sơ Sinh viên & Cư trú | `/admin/students` | `UC-07, 08, 09` / `FR-06, 07, 08` | [ADM-05_HoSo_SinhVien.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-05_HoSo_SinhVien.md) |
| **ADM-06** | Tiếp nhận Đơn & Xếp phòng Thông minh | `/admin/applications-allocation` | `UC-11, 12, 13, 15` / `FR-09, 10, 11, 12` | [ADM-06_TiepNhan_XepPhong.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-06_TiepNhan_XepPhong.md) *(Bài toán #3)* |
| **ADM-07** | Hợp đồng, Đổi phòng & Thanh lý Checkout | `/admin/contracts-lifecycle` | `UC-15, 16, 17, 18` / `FR-13, 14, 15, 16` | [ADM-07_HopDong_DoiPhong_Checkout.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-07_HopDong_DoiPhong_Checkout.md) |
| **ADM-08** | Chốt Điện Nước & Phân bổ Theo Ngày | `/admin/utilities-meter-reading`| `UC-42` / `FR-17, 25` | [ADM-08_ChotDienNuoc_PhanBoTheoNgay.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-08_ChotDienNuoc_PhanBoTheoNgay.md) *(Bài toán #2)* |
| **ADM-09** | Quản lý Hóa đơn & Đối soát VietQR | `/admin/billing-invoices` | `UC-42, 43` / `FR-17, 18, 24` | [ADM-09_HoaDon_DoiSoat_VietQR.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-09_HoaDon_DoiSoat_VietQR.md) *(Bài toán #4)* |
| **ADM-10** | Điều phối Sự cố & Kỷ luật Nội quy | `/admin/maintenance-discipline` | `UC-20, 21, 22, 23` / `FR-19, 20, 21, 22` | [ADM-10_DieuPhoi_SuCo_KyLuat.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-10_DieuPhoi_SuCo_KyLuat.md) *(Bài toán #5)* |
| **ADM-11** | Báo cáo Thống kê & Xuất dữ liệu | `/admin/reports-analytics` | `UC-29, 30, 31, 32, 33, 34` / `FR-23-26` | [ADM-11_BaoCao_ThongKe.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-11_BaoCao_ThongKe.md) |
| **ADM-12** | Quản trị Tài khoản & Phân quyền RBAC | `/admin/system-rbac` | `UC-37` / `FR-29` | [ADM-12_QuanTri_PhanQuyen_RBAC.md](file:///d:/Quan_ly_ktx/docs/screens/admin/ADM-12_QuanTri_PhanQuyen_RBAC.md) |

---

## 2. PHÂN HỆ CỔNG THÔNG TIN SINH VIÊN (MOBILE WEB PORTAL)

| Mã màn hình | Tên màn hình | Đường dẫn Route | Mã Use Case / FR | Liên kết file đặc tả chi tiết |
|-------------|--------------|-----------------|------------------|--------------------------------|
| **STU-01** | Đăng ký Giữ chỗ Trực tuyến (Wizard) | `/portal/register` | `UC-11` / `FR-09` | [STU-01_DangKy_GiuCho_Online.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-01_DangKy_GiuCho_Online.md) |
| **STU-02** | Ký Hợp đồng Điện tử & Nộp cọc VietQR | `/portal/contracts/:id/sign` | `UC-13, 15` / `FR-12, 13` | [STU-02_KyHopDong_NopCoc_VietQR.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-02_KyHopDong_NopCoc_VietQR.md) |
| **STU-03** | Trang chủ Cổng Sinh viên & Thẻ phòng | `/portal/home` | `UC-40, 44` / `FR-31, 33` | [STU-03_TrangChu_ThePhong.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-03_TrangChu_ThePhong.md) |
| **STU-04** | Chi tiết Tiền phòng & VietQR Động | `/portal/invoices/:id` | `UC-42, 43` / `FR-17, 18` | [STU-04_ChiTiet_HoaDon_VietQR.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-04_ChiTiet_HoaDon_VietQR.md) |
| **STU-05** | Báo hỏng Thiết bị kèm Chụp ảnh | `/portal/maintenance` | `UC-19, 24` / `FR-19` | [STU-05_BaoHong_VatTu.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-05_BaoHong_VatTu.md) |
| **STU-06** | Đơn xin Đổi phòng, Gia hạn & Trả phòng | `/portal/requests` | `UC-14, 16, 17, 18` / `FR-14, 15, 16` | [STU-06_DoiPhong_GiaHan_TraPhong.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-06_DoiPhong_GiaHan_TraPhong.md) |
| **STU-07** | Hộp thư Thông báo & Lịch sử Kỷ luật | `/portal/notifications` | `UC-22, 44` / `FR-22, 33` | [STU-07_ThongBao_BienBan_KyLuat.md](file:///d:/Quan_ly_ktx/docs/screens/student/STU-07_ThongBao_BienBan_KyLuat.md) |

---

## 3. PHÂN HỆ NHÂN VIÊN KỸ THUẬT (MOBILE/TABLET WORKSPACE)

| Mã màn hình | Tên màn hình | Đường dẫn Route | Mã Use Case / FR | Liên kết file đặc tả chi tiết |
|-------------|--------------|-----------------|------------------|--------------------------------|
| **TEC-01** | Danh sách Nhiệm vụ Sửa chữa Kỹ thuật | `/technician/tasks` | `UC-20, 21` / `FR-20, 21` | [TEC-01_DanhSach_NhiemVu_SuaChua.md](file:///d:/Quan_ly_ktx/docs/screens/technician/TEC-01_DanhSach_NhiemVu_SuaChua.md) |
| **TEC-02** | Chi tiết Xử lý & Nghiệm thu Sự cố | `/technician/tasks/:id/complete`| `UC-21, 26` / `FR-21` | [TEC-02_ChiTiet_NghiemThu_SuCo.md](file:///d:/Quan_ly_ktx/docs/screens/technician/TEC-02_ChiTiet_NghiemThu_SuCo.md) |

---

## 4. TÀI LIỆU NỀN TẢNG LIÊN QUAN

- [UI_UX_SPECIFICATION.md](file:///d:/Quan_ly_ktx/UI_UX_SPECIFICATION.md) — Tổng quan kiến trúc hệ thống, 4 luồng tuần tự (Sequence Diagrams) và Ma trận truy vết 44 Use Cases.
- [MASTER (1).md](file:///d:/Quan_ly_ktx/MASTER%20(1).md) — Design System Master: Bảng màu Xanh - Trắng, Typography, Elevation, 8pt Grid, và Quy chuẩn UI/UX Pro Max.
