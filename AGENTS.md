# AGENTS.md — KTX Hub Frontend Prototype (`dorm-management-prototype`)

Tài liệu hướng dẫn kỹ thuật bắt buộc dành cho AI Coding Agent và Kỹ sư Frontend khi khảo sát, phát triển, thêm tính năng, bảo trì hoặc kết nối API Backend trong repository **`dorm-management-prototype`**.

---

## 1. Định danh & Bản chất Dự án (Project Identity & Purpose)

> ⚠️ **LƯU Ý QUAN TRỌNG VỀ PHẠM VI:**  
> Dự án này là **BẢN NGUYÊN MẪU GIAO DIỆN (FRONTEND PROTOTYPE)**, không phải là ứng dụng production hoàn chỉnh.  
> - **Mục tiêu chính:** Hiện thực hóa giao diện tương tác trực quan, mô phỏng đầy đủ luồng nghiệp vụ UI/UX theo tài liệu SRS (`docs/screens/`) và Design System (`DESIGN.md`).
> - **Mục tiêu phụ:** Đóng vai trò môi trường kiểm thử (Testing Sandbox) giúp team FE code độc lập và hỗ trợ dev Backend cắm nối thử nghiệm REST API cục bộ trước khi tích hợp vào hệ thống thật.

- **Tên dự án:** KTX Hub Prototype (Private Dormitory Management System - PDMS Prototype).
- **Công nghệ nền tảng:** React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`).
- **Phân hệ người dùng hỗ trợ:**
  1. **Quản trị viên / Chủ KTX (`manager`):** Desktop Web Dashboard (Sơ đồ ma trận phòng & giường, danh mục người thuê, hợp đồng, hóa đơn VietQR, báo cáo tài chính, sự cố & kỷ luật).
  2. **Sinh viên / Khách thuê (`student`):** Mobile Web Portal (Xem phòng & bạn cùng phòng, thanh toán hóa đơn VietQR + nộp minh chứng, báo hỏng vật tư, đăng ký xe máy).
  3. **Kỹ thuật viên (`technician`):** Mobile/Tablet Workspace (Tiếp nhận phiếu sửa chữa, phân loại ưu tiên, cập nhật vật tư chi phí và nghiệm thu hoàn thành).

---

## 2. Cơ chế Kép: Mock Data ⟷ Local Backend API (Dual-Mode Architecture)

Dự án được thiết kế theo **Service Adapter Pattern** để đáp ứng hoàn hảo hai nhu cầu làm việc song song:

```mermaid
flowchart TD
    UI["Giao diện UI (Pages, Components & Contexts)\nKhông phụ thuộc vào nguồn dữ liệu"]
    Service["src/services/dormService.ts\n(Contract Interface thống nhất)"]
    EnvCheck{"Kiểm tra biến môi trường\nVITE_USE_MOCK === 'true'?"}

    MockService["src/services/mock/mockDormService.ts\n(Chế độ MOCK)\n• In-memory seed data\n• Tự động đồng bộ localStorage\n• Không cần cài Backend hay DB"]
    ApiService["src/services/api/apiDormService.ts\n(Chế độ BACKEND API)\n• Gọi REST API qua httpClient\n• Tự động map DTO\n• Kết nối Backend local"]

    UI --> Service
    Service --> EnvCheck
    EnvCheck -->|true (Mặc định)| MockService
    EnvCheck -->|false| ApiService
    ApiService -->|Vite Proxy /api| Backend["Backend Spring Boot Local\nhttp://localhost:8080/api/v1"]
```

### 2.1. Chế độ 1: Mock Data Độc lập (`VITE_USE_MOCK=true`)
- **Mục đích:** Khi push lên GitHub hoặc bàn giao cho team Frontend làm việc, bất kỳ ai clone code về cũng có thể chạy ngay với dữ liệu mẫu đầy đủ mà **không cần cài đặt Java, Maven, PostgreSQL hay chạy Backend**.
- **Cơ chế lưu trữ:** Sử dụng dữ liệu khởi tạo từ `src/services/mock/mockData.ts` kết hợp tự động lưu vào `localStorage` trình duyệt. Khi người dùng thêm phòng, chuyển trạng thái giường sang bảo trì, xác nhận thanh toán hoặc tạo phiếu sửa chữa, dữ liệu **vẫn tồn tại sau khi F5 trình duyệt**.

### 2.2. Chế độ 2: Kết nối Backend Local (`VITE_USE_MOCK=false`)
- **Mục đích:** Khi dev xong các endpoint Backend (ví dụ Java Spring Boot trong repository `dormitory-management`), lập trình viên có thể cắm nối trực tiếp prototype để test kiểm tra tính tương thích của API và luồng dữ liệu end-to-end.
- **Cơ chế hoạt động:**
  - `src/services/api/apiDormService.ts` sẽ phát các request HTTP thật (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) thông qua `src/services/httpClient.ts`.
  - Cấu hình Proxy trong `vite.config.ts` tự động chuyển tiếp toàn bộ request bắt đầu bằng `/api` sang `http://localhost:8080` (hoặc URL cấu hình qua `VITE_API_BASE_URL`), triệt tiêu 100% lỗi CORS khi dev local.

### 2.3. Hướng dẫn chuyển đổi chế độ trong `.env`

Tạo file `.env` ở thư mục gốc (tham khảo `.env.example`):

```bash
# -------------------------------------------------------------
# 1. Chạy MOCK độc lập (Mặc định khi clone repo):
# -------------------------------------------------------------
VITE_USE_MOCK=true

# -------------------------------------------------------------
# 2. Chuyển sang gọi BACKEND REST API Local:
# -------------------------------------------------------------
# VITE_USE_MOCK=false
# VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 3. Cấu trúc Thư mục Chuẩn (Target Architecture)

Tuân thủ nghiêm ngặt theo đặc tả **`docs/ARCHITECTURE.md`** và quy ước **`docs/CONVENTION.md`**:

```text
src/
├── App.tsx                     # Root component: bọc Providers, điều phối vai trò người dùng (~150 dòng)
├── main.tsx                    # Entry point React 19 mount vào thẻ #root
├── index.css                   # Tailwind CSS v4 engine & tokens thiết kế từ DESIGN.md
├── vite-env.d.ts               # Khai báo TypeScript cho Vite
│
├── components/                 # UI components tái sử dụng (Domain-agnostic)
│   └── common/                 # Button, Modal, Drawer, Icon, Select, PageHeader, TagInput, QrCode, Toast...
│
├── config/                     # Quản lý cấu hình tập trung
│   └── env.ts                  # Đọc type-safe các biến môi trường VITE_*
│
├── contexts/                   # Quản lý State toàn cục qua React Context
│   ├── AuthContext.tsx         # Trạng thái đăng nhập và role hiện tại (manager/student/technician)
│   ├── DormDataContext.tsx    # State dữ liệu ký túc xá (phòng, người thuê, hóa đơn, sự cố)
│   └── ToastContext.tsx        # Trạng thái thông báo Toast toàn hệ thống
│
├── hooks/                      # Custom React hooks (bọc context và logic dùng lại)
│   ├── useAuth.ts
│   ├── useDormData.ts
│   └── useToast.ts
│
├── pages/                      # Màn hình chức năng phân cấp theo Use Case
│   ├── admin/                  # Phân hệ Quản trị (Desktop Web Dashboard)
│   │   ├── rooms/              # Sơ đồ ma trận & bảng phòng (RoomsPage, RoomCard, AddEditModal...)
│   │   ├── tenants/            # Quản lý hồ sơ người thuê (TenantsPage)
│   │   ├── contracts/          # Hợp đồng lưu trú (ContractsPage)
│   │   ├── invoices/           # Hóa đơn & đối soát VietQR (InvoicesPage)
│   │   ├── financial/          # Báo cáo tổng hợp thu chi (FinancialPage)
│   │   ├── incidents/          # Xử lý sự cố & kỷ luật (IncidentsPage)
│   │   ├── vehicles/           # Quản lý phương tiện & thẻ xe (VehiclesPage)
│   │   ├── technicians/        # Quản lý nhân viên kỹ thuật (TechnicianAccountsPage)
│   │   ├── dashboard/          # Tổng quan KPI & biểu đồ doanh thu (DashboardPage)
│   │   ├── quick/              # Thao tác nhanh & tìm kiếm toàn hệ thống (QuickModals, GlobalSearch)
│   │   └── layout/             # Khung sườn trang (AdminShell, AdminSidebar, AdminHeader)
│   │
│   ├── student/                # Phân hệ Sinh viên / Khách thuê (Mobile Web Portal)
│   │   ├── TenantPortalPage.tsx# Khung sườn Cổng thông tin người thuê
│   │   ├── RoomPage.tsx        # Chi tiết phòng, giường và bạn cùng phòng
│   │   ├── TenantInvoicesPage.tsx # Hóa đơn & thanh toán VietQR
│   │   ├── PaymentProofPanel.tsx  # Tải ảnh minh chứng chuyển khoản
│   │   ├── ReportPage.tsx      # Báo hỏng thiết bị kèm ảnh hiện trạng
│   │   ├── TenantVehiclesPage.tsx # Khai báo xe máy kèm ảnh cà vẹt
│   │   └── RequestModal.tsx    # Yêu cầu gia hạn, chuyển phòng, trả phòng
│   │
│   ├── technician/             # Phân hệ Nhân viên Kỹ thuật (Mobile Workspace)
│   │   ├── TechnicianPage.tsx  # Khung sườn ứng dụng kỹ thuật viên
│   │   ├── TicketListPage.tsx  # Danh sách phiếu chia theo Mới giao / Đang xử lý / Hoàn thành
│   │   ├── TicketDetailPage.tsx# Chi tiết tiếp nhận, nghiệm thu vật tư & xác nhận hoàn thành
│   │   ├── NoticeSheet.tsx     # Bảng thông báo công việc khẩn cấp
│   │   └── SettingsTab.tsx     # Thông tin cá nhân & đổi mật khẩu
│   │
│   └── auth/                   # Phân hệ Xác thực
│       └── LoginPage.tsx       # Màn hình đăng nhập kèm nút chọn nhanh Demo Account
│
├── routes/                     # Định nghĩa Route, Menu điều hướng & RouteGuard
│   ├── routes.ts
│   └── RouteGuard.tsx
│
├── services/                   # Tầng truy xuất dữ liệu (Data Access Layer)
│   ├── dormService.ts          # Contract Interface & Factory chuyển đổi chế độ
│   ├── mock/                   # Hiện thực Mock Data (in-memory + localStorage)
│   │   ├── mockDormService.ts
│   │   └── mockData.ts
│   ├── api/                    # Hiện thực gọi Backend REST API thật
│   │   └── apiDormService.ts
│   └── httpClient.ts           # Wrapper Fetch chuẩn hóa xử lý lỗi, headers JSON
│
├── types/                      # Định nghĩa kiểu dữ liệu TypeScript tập trung
│   ├── auth.ts, room.ts, tenant.ts, invoice.ts, incident.ts, technician.ts, shared.ts
│   └── api/endpoints.ts        # DTO request / response từ Backend
│
├── utils/                      # Pure utilities (Hàm thuần túy, không chứa JSX/React)
│   ├── roomCalculations.ts     # Tính toán lấp đầy, sinh giường G01..G0n, kiểm tra slot trống
│   ├── invoiceCalculations.ts  # Tính tiền phạt trễ hạn, xác nhận tiền mặt
│   ├── financialCalculations.ts# Tính toán doanh thu thực thu, chi phí sửa chữa, lợi nhuận
│   ├── authUtils.ts            # Phân giải vai trò người dùng từ email
│   └── formatters.ts           # Định dạng tiền tệ (1.500.000 đ), tỷ lệ phần trăm
│
└── test/                       # Bộ kiểm thử tự động
    ├── design-contract.test.ts # Kiểm tra tuân thủ Design Tokens & Do's/Don'ts
    ├── domain.test.ts          # Kiểm tra logic nghiệp vụ bất biến
    ├── services.test.ts        # Kiểm tra hoạt động của tầng Dual-Mode Service
    ├── types.test.ts           # Kiểm tra độ toàn vẹn của Type System
    ├── contexts.test.ts        # Kiểm tra tính Immutability của Context
    └── routes.test.ts          # Kiểm tra cấu hình điều hướng
```

---

## 4. Quy tắc Bất biến khi Code (Core Invariants & Conventions)

Bất kỳ AI Agent nào khi chỉnh sửa hoặc mở rộng dự án này **BẮT BUỘC** tuân thủ các quy tắc sau:

1. **BẢO TỒN 100% GIAO DIỆN (Zero Visual Regression):**
   - Tuyệt đối không thay đổi, xóa bỏ hoặc tự ý sửa các class Tailwind CSS, mã màu hex (`#007BFF`, `#212529`, v.v.), font chữ (Inter, JetBrains Mono), border-radius (`rounded-sm`), hay padding/margin đã được định hình.
   - Luôn đảm bảo khung bao chính có độ rộng tối đa `max-w-[1280px]` và chiều cao view tối thiểu `min-h-[100dvh]` (không dùng `min-h-screen`).
2. **QUY ƯỚC ĐẶT TÊN (Naming Conventions):**
   - **PascalCase:** Dành cho tất cả React component và file chứa component (`Button.tsx`, `RoomsPage.tsx`, `AddEditRoomModal.tsx`).
   - **camelCase:** Dành cho hooks (`useAuth.ts`), services (`dormService.ts`), utilities (`roomCalculations.ts`), biến và hàm.
3. **BẢO TỒN TÍNH BẤT BIẾN (Immutability):**
   - Khi cập nhật state (danh sách phòng, người thuê, hóa đơn, sự cố), luôn tạo bản sao mới bằng spread operator (`[...items]`, `{ ...target }`), không bao giờ mutate trực tiếp mảng/object cũ.
4. **RANH GIỚI DỮ LIỆU & TRÁCH NHIỆM ĐƠN LẺ:**
   - UI component chỉ gọi hàm thông qua `useDormData()`, `useAuth()`, hoặc tầng `src/services/`. Không viết logic gọi API `fetch` trực tiếp bên trong component giao diện.
   - Hàm tính toán logic nghiệp vụ phải là pure function đặt trong `src/utils/` để có thể viết unit test độc lập.
5. **KIỂM TRA CHẤT LƯỢNG TRƯỚC KHI BÀN GIAO:**
   - Sau bất kỳ thao tác chỉnh sửa code nào, **BẮT BUỘC chạy và đảm bảo 2 lệnh sau hoàn toàn pass**:
     ```bash
     npm test          # Kiểm tra toàn bộ 29+ test suites (0 errors)
     npm run build     # Đảm bảo TypeScript compile và Vite build thành công (<300ms)
     ```

---

## 5. Tài liệu Nền tảng Tham chiếu

- **`docs/ARCHITECTURE.md`**: Cấu trúc thư mục chi tiết và phân bổ trách nhiệm từng tầng.
- **`docs/CONVENTION.md`**: Quy tắc viết mã chi tiết (React, TypeScript, CSS, Accessibility).
- **`DESIGN.md`**: Bảng mã màu, tỷ lệ typography, radius và danh sách các điều cấm trong thiết kế.
- **`docs/screens/`**: Chi tiết 21 màn hình đặc tả luồng nghiệp vụ của 3 phân hệ.
- **`docs/superpowers/plans/2026-11-03-refactor-prototype-structure.md`**: Kế hoạch và hồ sơ 11 bước refactor hoàn chỉnh.
