# ĐẶC TẢ CHI TIẾT MÀN HÌNH: ADM-01
## ĐĂNG NHẬP, ĐĂNG XUẤT & XÁC THỰC QUẢN TRỊ (AUTHENTICATION)

- **Mã màn hình:** `ADM-01`
- **Tên màn hình:** Đăng nhập & Khôi phục mật khẩu Quản lý
- **Đường dẫn (Route):** `/admin/login`, `/admin/forgot-password`
- **Tác nhân chính:** Ban Quản lý, Chủ KTX, Nhân viên Kỹ thuật
- **Mã Use Case liên kết:** `UC-35`, `UC-36`, `UC-38`, `UC-39`
- **Mã yêu cầu chức năng (FR):** `FR-27`, `FR-28`, `FR-30`

---

### 1. Sơ Đồ Bố Cục Wireframe ASCII (Desktop Viewport >= 1024px)

```text
+------------------------------------------+------------------------------------------+
|                 CỘT TRÁI                 |                 CỘT PHẢI                 |
|             (Brand Showcase)             |               (Auth Form)                |
|                                          |                                          |
|  [Logo KTX Hub]                          |  Chào mừng trở lại!                      |
|  HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ TƯ NHÂN      |  Đăng nhập để quản lý cơ sở KTX          |
|                                          |                                          |
|  * Nền xanh gradient (#1D4ED8 -> #1E40AF)|  +------------------------------------+  |
|  * Minh họa đồ họa 3D phẳng:             |  | Tên đăng nhập / Email             |  |
|    Tòa nhà, Sơ đồ phòng, Giường          |  | [ admin@ktxhub.vn                ] |  |
|  * Các chỉ số nổi bật:                   |  +------------------------------------+  |
|    - 99.8% Tỷ lệ vận hành ổn định        |  | Mật khẩu                          |  |
|    - Đối soát VietQR tự động 24/7        |  | [ ••••••••••••              (👁) ] |  |
|    - Tự động chia điện nước theo ngày    |  +------------------------------------+  |
|                                          |  [X] Ghi nhớ đăng nhập   [Quên mật khẩu?]|
|                                          |                                          |
|                                          |  +------------------------------------+  |
|                                          |  | [ ĐĂNG NHẬP VÀO HỆ THỐNG ]         |  |
|                                          |  +------------------------------------+  |
|                                          |                                          |
|                                          |  Hotline hỗ trợ kỹ thuật: 1900 6868      |
+------------------------------------------+------------------------------------------+
```

---

### 2. Cây Cấu Trúc Thành Phần (Component Hierarchy)

```text
AdminLoginPage
├── BrandBannerColumn (Desktop only, 50% width)
│   ├── AppLogo
│   ├── ValuePropositionList
│   └── TrustMetricsBadge
└── LoginFormColumn (50% width on Desktop, 100% on Mobile)
    ├── AuthHeader (Title, Subtitle)
    ├── ErrorSummaryAlert (role="alert", hidden khi không có lỗi)
    ├── LoginForm
    │   ├── FormField (Username / Email)
    │   ├── FormField (Password with PasswordToggleVisibility)
    │   ├── FormActionsRow
    │   │   ├── Checkbox (Remember me)
    │   │   └── TextLink (Forgot password trigger)
    │   └── SubmitButton (Primary Blue, loading state)
    └── ForgotPasswordModal (Lazy-loaded)
        ├── Step1_EnterEmail
        ├── Step2_VerifyOTP (6 digits input)
        └── Step3_ResetPassword
```

---

### 3. Danh Mục Trường Dữ Liệu & Quy Tắc Kiểm Tra (Validation Rules)

| Tên trường | Kiểu dữ liệu | Bắt buộc | Quy tắc kiểm tra (Validation) | Thông báo lỗi hiển thị |
|------------|--------------|----------|-------------------------------|------------------------|
| `usernameOrEmail` | String | Có | Không để trống, độ dài >= 4 ký tự | "Vui lòng nhập tên đăng nhập hoặc email" |
| `password` | Password | Có | Độ dài >= 6 ký tự | "Mật khẩu phải chứa ít nhất 6 ký tự" |
| `rememberMe` | Boolean | Không | Mặc định `false` | N/A |
| `otpCode` (Modal) | String (6 số) | Có (khi quên MK) | Đúng 6 chữ số `^\d{6}$` | "Mã xác thực OTP gồm đúng 6 chữ số" |
| `newPassword` (Modal) | Password | Có (khi quên MK) | >= 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt | "Mật khẩu mới chưa đủ độ mạnh theo quy định" |

---

### 4. Quản Lý Trạng Thái Giao Diện (UI States)

1. **Initial / Idle State:** 
   - Con trỏ chuột tự động focus vào trường `usernameOrEmail`.
   - Nút Submit ở trạng thái sẵn sàng (`background: #1D4ED8`).
2. **Loading / Submitting State:**
   - Nút Submit hiển thị spinner quay nhẹ, text chuyển thành "Đang xác thực...".
   - Tất cả các trường input bị `disabled` tạm thời để chống click đúp.
3. **Error State (Xác thực thất bại):**
   - Rung nhẹ (shake animation) form đăng nhập.
   - Hiển thị Alert đỏ `--danger-600` ở đầu form: "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.".
   - Viền input mật khẩu chuyển sang viền đỏ `#DC2626`.
4. **Forgot Password Flow:**
   - Modal mở trượt từ giữa màn hình, giữ Focus Trap bên trong.
   - Nhập email -> Gửi OTP đếm ngược 60 giây (`Resend OTP in 59s...`).
   - Nhập OTP thành công -> Cho phép tạo mật khẩu mới -> Thông báo thành công và tự động đóng modal.

---

### 5. Cấu Trúc Dữ Liệu API & Mock Contract

#### Request: `POST /api/v1/auth/login`
```json
{
  "usernameOrEmail": "admin@ktxhub.vn",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

#### Response Thành công (HTTP 200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "refreshToken": "d7a8e9f0-b1c2...",
    "expiresIn": 86400,
    "user": {
      "id": "USR-ADM-001",
      "fullName": "Trần Văn Quản Lý",
      "email": "admin@ktxhub.vn",
      "role": "MANAGER",
      "avatarUrl": "/assets/avatars/admin.png",
      "permissions": ["ROOM_MANAGE", "BED_ALLOCATE", "BILLING_MANAGE", "DISCIPLINE_MANAGE"]
    }
  }
}
```
