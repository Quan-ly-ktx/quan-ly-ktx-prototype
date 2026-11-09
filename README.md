# KTX Hub - Hệ Thống Quản Lý Ký Túc Xá Tư Nhân (PDMS)

Dự án Frontend Prototype xây dựng trên nền tảng **React 19**, **TypeScript**, **Tailwind CSS v4**, và **Vite 8**. Ứng dụng hỗ trợ kiến trúc **Dual-Mode** linh hoạt, cho phép chạy hoàn toàn độc lập với Mock Data hoặc kết nối trực tiếp với hệ thống Backend Spring Boot REST API.

> **Trạng thái refactor SRS 3.2:** Prototype đang được cập nhật, chưa hoàn chỉnh để bàn giao theo toàn bộ SRS. Đặc biệt các luồng onboarding/hợp đồng/checkout, định danh và lưu trữ dữ liệu xuyên vai trò, xử lý sự cố, báo cáo thu–chi và xuất XLSX/PDF chưa được xác nhận hoàn chỉnh. Mock không chứng minh RBAC, transaction, OTP/email, lưu tệp OCI hay đối soát ngân hàng thật. Contract FE/BE dự kiến xem tại `docs/API_INTEGRATION_PLAN.md`; các mô tả tích hợp cũ bên dưới chỉ là tài liệu lịch sử cần đối chiếu lại.

---

## 🚀 Cấu Hình Dual-Mode (Mock vs. Live Backend)

Hệ thống cung cấp cơ chế chuyển đổi chế độ vận hành thông qua biến môi trường trong file `.env` (hoặc copy từ `.env.example`):

```bash
cp .env.example .env
```

### 1. `VITE_USE_MOCK=true` (Mặc định - Standalone Mock Mode)
- **Mục đích**: Chạy demo, phát triển giao diện và kiểm thử độc lập mà không cần khởi động Spring Boot backend.
- **Cơ chế**: Toàn bộ dữ liệu được khởi tạo từ bộ dữ liệu mẫu trong `src/services/mock/mockData.ts` và lưu trữ trạng thái tại `localStorage` của trình duyệt.
- Có dữ liệu demo cho Manager (`manager@gmail.com`), Tenant đang thuê (`079203001187`), Tenant đã checkout (`000000000001`), và Technician (`thinh.vv@ktxhub.vn`). Tất cả dùng mật khẩu demo: `Demo1234!`.

### 2. `VITE_USE_MOCK=false` (Backend API Integration Mode)
- **Mục đích**: Kết nối trực tiếp tới Backend Spring Boot đang chạy tại máy local hoặc staging server.
- **Cơ chế**:
  - Frontend gọi các API endpoints tương đối qua tiền tố `/api/v1/...`.
  - Vite dev server tự động kích hoạt **Reverse Proxy** chuyển tiếp các request `/api` sang `http://localhost:8080` (hoặc cấu hình tại `VITE_API_BASE_URL`), triệt tiêu hoàn toàn rào cản CORS trong môi trường dev.
  - Tự động đính kèm JWT Bearer Token, kiểm soát token lifecycle (lưu trữ an toàn tại `localStorage`, xử lý refresh token tự động khi nhận mã `401 Unauthorized`).

---

## 🧩 Danh Sách Phân Hệ Tích Hợp (Module Breakdown)

Hệ thống được thiết kế theo mô hình **Hybrid Adapter Architecture**:

### 🟢 Phân Hệ Tích Hợp Backend Thật (Real Backend Endpoints)
Khi `VITE_USE_MOCK=false`, các phân hệ sau giao tiếp 100% với Spring Boot backend:
1. **Xác thực & Quản trị Phiên (Auth & Session Lifecycle)**:
   - Đăng nhập JWT (`POST /api/v1/auth/login`).
   - Đăng xuất & thu hồi token (`POST /api/v1/auth/logout`).
   - Tự động làm mới phiên làm việc (`POST /api/v1/auth/refresh-token`).
   - Đồng bộ hồ sơ tài khoản hiện tại (`GET /api/v1/users/me`).
   - Đổi mật khẩu (`POST /api/v1/auth/change-password`).
   - Quy trình khôi phục mật khẩu qua mã OTP (`POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/verify-forgot-password-otp`, `POST /api/v1/auth/reset-password`).
2. **Sơ Đồ Ma Trận Phòng & Giường (Room Matrix & Layout)**:
   - Tải danh sách phòng & ma trận giường thời gian thực (`GET /api/v1/admin/rooms/matrix`).
   - Thêm phòng mới (`POST /api/v1/admin/rooms`).
   - Cập nhật thông tin phòng & đơn giá (`PUT /api/v1/admin/rooms/{id}`).
   - Đưa phòng vào kho lưu trữ (`DELETE /api/v1/admin/rooms/{id}`).
3. **Trạng Thái Vận Hành Giường (Bed Maintenance & Status Lifecycle)**:
   - Bật/tắt bảo trì giường ngủ tức thì (`PATCH /api/v1/admin/beds/{id}/status`).
4. **Quản Lý Tài Khoản Nhân Viên Kỹ Thuật (Technician Accounts)**:
   - Danh sách tài khoản kỹ thuật viên có phân trang & tìm kiếm (`GET /api/v1/users/technicians`).
   - Tạo mới tài khoản kỹ thuật viên (`POST /api/v1/users/technicians`).
   - Lấy chi tiết kỹ thuật viên (`GET /api/v1/users/technicians/{id}`).
   - Cập nhật thông tin cá nhân kỹ thuật viên (`PUT /api/v1/users/technicians/{id}`).
   - Khóa / Kích hoạt lại tài khoản (`PATCH /api/v1/users/technicians/{id}/status`).

### 🟡 Phân Hệ Dự Phòng Mock / Fallback (Hybrid Mode)
Các phân hệ nghiệp vụ sau duy trì cơ chế Fallback mượt mà bằng Mock Data cục bộ trong khi chờ Backend hoàn thiện các API tương ứng:
- **Quản lý Hồ sơ Sinh viên & Cư trú (Tenants)**
- **Hóa đơn Tiền phòng & Đối soát VietQR (Invoices)**
- **Vòng đời Hợp đồng & Xếp phòng (Contracts & Allocation)**
- **Điều phối Sự cố & Báo hỏng (Incidents & Maintenance Tickets)**

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 20 trở lên (khuyến nghị Node.js v22).
- **Trình quản lý gói**: `npm` hoặc `pnpm`.

### Cài Đặt Thư Viện
```bash
npm install
```

### Khởi Chạy Môi Trường Phát Triển (Development)
```bash
npm run dev
```
Ứng dụng sẽ khả dụng tại: `http://localhost:5173`.

### Chạy Kiểm Thử Tự Động (Unit & Integration Tests)
Chạy toàn bộ bộ kiểm thử tự động (116 tests) bảo đảm không phát sinh lỗi hồi quy (zero-regression):
```bash
npm test
```

### Đóng Gói Ứng Dụng (Production Build)
Biên dịch mã nguồn với TypeScript & Vite:
```bash
npm run build
```
Mã nguồn sau đóng gói được đặt tại thư mục `dist/`.
