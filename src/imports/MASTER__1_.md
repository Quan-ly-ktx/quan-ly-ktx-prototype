# KTX Hub Design System (Modern Clean SaaS - Blue & White)
*Được nâng cấp và bảo chứng bởi tiêu chuẩn UI/UX Pro Max*

Project: Hệ thống Quản lý Ký túc xá (Dormitory Management System)  
Brand Color: `#1D4ED8` (Royal Blue) & `#FFFFFF` (Pure White)  
Style Direction: Modern Clean SaaS & Dashboard Portal (Giao diện phẳng hiện đại, viền tinh tế, bóng đổ nhẹ, tối ưu hóa cho dữ liệu bảng biểu quản lý và cổng sinh viên tự phục vụ)

---

## 1) Nguyên Tắc Thiết Kế Cốt Lõi & Tâm Lý Học UX (Core Principles & UX Laws)

Áp dụng các quy luật tâm lý học nhận thức và tiêu chuẩn trải nghiệm người dùng cao cấp (Nielsen Norman & UI/UX Pro Max):

- **Trực quan & Hiệu quả (Data-First & Clarity):** Tối ưu hóa việc hiển thị dữ liệu phòng, giường, hợp đồng và hóa đơn điện nước. Thông tin quan trọng (tỷ lệ lấp đầy, tiền nợ quá hạn, phòng sự cố) phải nắm bắt được trong vòng **3 giây**.
- **Quy luật Fitts (Fitts's Law):** Các nút hành động chính (Duyệt đơn, Đóng tiền, Thêm sinh viên) phải có kích thước đủ lớn, đặt ở vị trí dễ chạm tới. Vùng tương tác tối thiểu đạt **44x44px** (web/mobile).
- **Quy luật Hick (Hick's Law) & Giảm tải nhận thức:** Đơn giản hóa các luồng nghiệp vụ phức tạp. Form đăng ký phòng hoặc xét duyệt sinh viên nội trú được chia thành các bước rõ ràng (Multi-step wizard) thay vì một biểu mẫu quá dài.
- **Quy luật Vùng chung & Gần gũi (Law of Common Region & Proximity):** Sử dụng các thẻ thẻ (Cards) có đường viền tinh tế và khoảng cách đồng nhất để nhóm các thông tin liên quan (ví dụ: thông tin phòng ở, danh sách bạn cùng phòng, chỉ số điện nước).
- **Phản hồi trạng thái tức thì (Visibility of System Status):** Hệ thống luôn phản hồi trạng thái tương tác trong vòng **80ms – 150ms** (hover, active, submit spinner). Sinh viên và quản lý luôn biết hành động của mình đã được xử lý hay chưa.
- **Phòng ngừa & Phục hồi lỗi (Error Prevention & Recovery):** 
  - Hành động phá hủy nguy hiểm (Xóa dữ liệu, Chấm dứt hợp đồng, Cắt điện nước) **bắt buộc phải có hộp thoại xác nhận 2 bước (Confirmation Modal)** ghi rõ hậu quả.
  - Hỗ trợ thao tác hoàn tác (Undo toast) cho các hành động nhanh.
- **Tính khả dụng theo phân hệ (Dual-Portal Usability):**
  - *Cổng Quản trị viên (Admin):* Chặt chẽ, mật độ thông tin cao (Compact density), thao tác nhanh bằng phím tắt và chuột trên Desktop.
  - *Cổng Sinh viên (Student Portal):* Thân thiện, trực quan, hỗ trợ tối đa thao tác 1 chạm trên màn hình cảm ứng di động (Mobile-first).

---

## 2) Hệ Thống Màu Sắc (Color System - 60-30-10 Rule)

### Tỷ lệ phối màu chuẩn hóa
- **Nền & Bề mặt trung tính (White & Slate Neutrals):** 75% – 80% (không gian sáng sủa, thoáng đãng, chống mỏi mắt)
- **Màu thương hiệu Xanh dương (Primary Blue):** 15% – 20% (thanh điều hướng, nút chính, trạng thái active)
- **Màu trạng thái nghiệp vụ (Semantic Status):** 5% – 10% (trạng thái phòng, hóa đơn, cảnh báo)

### Bảng màu thương hiệu (Brand Palette)

| Vai trò | CSS Token | Mã Hex | Ứng dụng |
|---------|-----------|--------|----------|
| **Brand Primary (Chính)** | `--brand-600` | `#1D4ED8` | Nút bấm chính (CTA), tiêu đề nổi bật, trạng thái active |
| **Brand Hover** | `--brand-700` | `#1E40AF` | Trạng thái hover/press của các nút chính |
| **Brand Light / Accent** | `--brand-500` | `#2563EB` | Liên kết (links), icon nổi bật, thanh tiến trình |
| **Brand Soft Tint** | `--brand-50` | `#EFF6FF` | Nền menu đang chọn, badge nhẹ, hover dòng bảng |
| **Brand Border Subtlety**| `--brand-200` | `#BFDBFE` | Đường viền thẻ active, viền focus input |

### Bảng màu trung tính & Bề mặt (Neutrals & Surfaces)

| Vai trò | CSS Token | Mã Hex | Ứng dụng |
|---------|-----------|--------|----------|
| **Text Primary** | `--slate-900` | `#0F172A` | Tiêu đề trang, văn bản nội dung chính (tương phản 14:1) |
| **Text Secondary** | `--slate-700` | `#334155` | Nhãn form, văn bản phụ, tiêu đề cột bảng |
| **Text Muted** | `--slate-500` | `#64748B` | Chú thích, placeholder, timestamp, breadcrumbs |
| **Border Default** | `--slate-200` | `#E2E8F0` | Đường phân cách, viền input, viền bảng |
| **Border Subtle** | `--slate-100` | `#F1F5F9` | Đường kẻ chia dòng nhẹ |
| **Surface Background** | `--slate-50` | `#F8FAFC` | Nền tổng thể toàn bộ ứng dụng |
| **Surface Card/Modal** | `--surface-white` | `#FFFFFF` | Nền thẻ (card), bảng dữ liệu, hộp thoại modal, sidebar |

### Màu trạng thái nghiệp vụ KTX (Semantic & Status Colors)

| Nghiệp vụ | CSS Token | Mã Hex | Nền Badge (Soft) | Ứng dụng trong KTX |
|-----------|-----------|--------|------------------|-------------------|
| **Thành công / Còn chỗ** | `--success-600` | `#059669` | `#ECFDF5` (`--success-50`) | Phòng còn chỗ, đã nộp tiền, hợp đồng hiệu lực, duyệt đơn |
| **Cảnh báo / Sắp hết hạn** | `--warning-600` | `#D97706` | `#FFFBEB` (`--warning-50`) | Hợp đồng sắp hết hạn (< 15 ngày), hóa đơn chưa nộp |
| **Nguy hiểm / Đã đầy / Nợ** | `--danger-600` | `#DC2626` | `#FEF2F2` (`--danger-50`) | Phòng kín chỗ, nợ tiền quá hạn, thiết bị hỏng, kỷ luật |
| **Thông tin / Bảo trì** | `--info-600` | `#0284C7` | `#F0F9FF` (`--info-50`) | Giường đang sửa chữa, thông báo chung từ ban quản lý |
| **Chờ xử lý / Đóng băng** | `--neutral-600` | `#4B5563` | `#F3F4F6` (`--neutral-100`)| Phòng tạm khóa, sinh viên tạm vắng |

---

## 3) Hệ Thống Phông Chữ (Typography Standards)

Sử dụng bộ phông chữ hiện đại, hỗ trợ chuẩn Unicode Tiếng Việt:
- **Heading & Tiêu đề:** `Plus Jakarta Sans`
- **Body & Dữ liệu bảng (Data UI):** `Inter`
- **Mã số (Mã phòng, MSSV, Hóa đơn):** `JetBrains Mono`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
```

### Thang đo kích thước chữ (Type Scale)

| Token | Phông chữ | Cỡ chữ / Line Height | Trọng số (Weight) | Ứng dụng |
|-------|-----------|----------------------|-------------------|----------|
| `--text-h1` | Plus Jakarta Sans | 28px / 36px | 700 (Bold) | Tiêu đề chính màn hình Dashboard |
| `--text-h2` | Plus Jakarta Sans | 22px / 30px | 700 (Bold) | Tiêu đề phân khu, tên tòa nhà (Tòa A, B...) |
| `--text-h3` | Plus Jakarta Sans | 18px / 26px | 600 (Semibold) | Tiêu đề thẻ Card, tên phòng, modal header |
| `--text-body` | Inter | 14px / 20px | 400 (Regular) | Nội dung form, chi tiết sinh viên, cell bảng |
| `--text-body-medium` | Inter | 14px / 20px | 500 (Medium) | Nhãn nút bấm, giá trị quan trọng, cell tiêu đề |
| `--text-sm` | Inter | 12px / 16px | 400 (Regular) | Metadata, ngày tạo, ghi chú nhỏ, helper text |
| `--text-badge` | Inter | 12px / 16px | 600 (Semibold) | Nhãn trạng thái (Pills / Badges) |
| `--text-code` | JetBrains Mono | 13px / 18px | 500 (Medium) | Mã SV, Mã phòng (P.302-A), Mã giao dịch |

*Quy tắc độ dài dòng đọc (Measure):* Giới hạn đoạn văn bản từ **50 đến 75 ký tự (khoảng 65ch)** để người dùng không bị mỏi mắt khi đọc nội quy KTX hoặc thông báo dài.

---

## 4) Hệ Thống Khoảng Cách & Z-Index (Spacing Grid & Layering)

### Nhịp điệu khoảng cách chuẩn 8pt (8-Point Grid System)

Tuân thủ nghiêm ngặt nhịp điệu bội số của 4/8px để tạo sự cân xứng hoàn hảo:

| Token | Kích thước | Ứng dụng |
|-------|------------|----------|
| `--space-1` | `4px` | Khoảng cách icon và text phụ, viền đệm nhỏ |
| `--space-2` | `8px` | Padding trong badge, khoảng cách giữa các button nhỏ |
| `--space-3` | `12px` | Padding ô input, khoảng cách giữa các phần tử form |
| `--space-4` | `16px` | Padding trong card di động, margin giữa các khối nhỏ |
| `--space-5` | `20px` | Padding tiêu chuẩn của Table Cell và Card Desktop |
| `--space-6` | `24px` | Khoảng cách giữa các cột lưới (Grid gap), padding Card lớn |
| `--space-8` | `32px` | Padding trang tổng thể, khoảng cách giữa các phân đoạn |
| `--space-12`| `48px` | Khoảng cách phân cách giữa các section lớn |

### Hệ thống phân tầng Z-Index (Strict Z-Index Scale)

Tránh tuyệt đối việc đặt `z-[9999]` tùy tiện gây xung đột hiển thị menu và hộp thoại:

| Phân lớp | Giá trị | Ứng dụng |
|----------|---------|----------|
| `--z-normal` | `1` | Phần tử nổi thông thường, active border |
| `--z-dropdown` | `10` | Menu thả xuống, Select option popover |
| `--z-sticky` | `20` | Sticky Header bảng dữ liệu, Thanh Topbar cố định |
| `--z-drawer` | `30` | Drawer trượt bên phải hiển thị chi tiết phòng/giường |
| `--z-modal-backdrop` | `40` | Lớp nền mờ tối của Modal |
| `--z-modal` | `41` | Cửa sổ Modal xác nhận, Form popup |
| `--z-toast` | `50` | Thông báo nổi góc màn hình (Toast/Alert) |
| `--z-tooltip` | `60` | Tooltip giải thích chỉ số |

---

## 5) Hệ Thống Đổ Bóng, Bề Mặt & Bo Góc (Elevation & Radius)

### Đổ bóng khuếch tán chuẩn SaaS (Multi-layered Soft Elevation)

| Token | Giá trị Shadow | Ứng dụng |
|-------|----------------|----------|
| `--shadow-xs` | `0 1px 2px 0 rgba(15, 23, 42, 0.05)` | Viền nút bấm phụ, inputs ở trạng thái nghỉ |
| `--shadow-sm` | `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)` | Thẻ phòng (Room cards), hàng dữ liệu |
| `--shadow-md` | `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.06)` | Dropdown menus, popover, KPI cards |
| `--shadow-lg` | `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` | Modal dialogs, Drawer trượt chi tiết phòng |
| `--shadow-focus`| `0 0 0 3px rgba(37, 99, 235, 0.2)` | Vòng sáng focus bàn phím & input active |

### Hệ thống bo góc (Border Radius)

| Token | Giá trị | Ứng dụng |
|-------|---------|----------|
| `--radius-sm` | `6px` | Tag nhỏ, checkbox, badge trạng thái |
| `--radius-md` | `8px` | Nút bấm, ô nhập liệu (input, select), dropdown |
| `--radius-lg` | `12px` | Thẻ thống kê (KPI Card), Thẻ phòng (Room Item) |
| `--radius-xl` | `16px` | Bảng dữ liệu container, Hộp thoại Modal |
| `--radius-full`| `9999px`| Avatar sinh viên, nút icon tròn, pill badge tròn |

---

## 6) Quy Chuẩn Biểu Tượng & Đồ Họa (Iconography Standards)

Tuân thủ nghiêm ngặt quy tắc chuyên nghiệp từ UI/UX Pro Max:

- **Tuyệt đối không dùng Emoji làm icon cấu trúc:** Không sử dụng các emoji như 🏠, 👤, 💰 làm icon menu hoặc điều hướng.
- **Thư viện chuẩn:** Ưu tiên vector SVG đồng bộ từ **Phosphor Icons** (`@phosphor-icons/react`) hoặc **Heroicons / Lucide**.
- **Kỷ luật Phong cách (Outline vs Filled):** 
  - Toàn bộ menu và control mặc định dùng phong cách **Outline/Regular (1.5px hoặc 2px stroke)**.
  - Chỉ chuyển sang dạng **Filled (đậm)** khi phần tử đang ở trạng thái `active` hoặc `selected`.
- **Kích thước token chuẩn:**
  - `icon-sm`: 16px (bên trong badge, trong bảng dữ liệu)
  - `icon-md`: 20px (bên trong ô input, nút bấm, menu)
  - `icon-lg`: 24px (icon chính trên header, thanh tabbar)
  - `icon-xl`: 32px - 40px (icon minh họa trong thẻ KPI, empty state)
- **Vùng chạm tối thiểu (Touch Target):** Các nút chỉ có icon (như nút Đóng, Xóa) phải có vùng bọc tối thiểu **44x44px** để bấm chính xác trên di động.
- **Tiếp cận:** Icon mang tính trang trí cạnh chữ phải có `aria-hidden="true"`; icon độc lập không có chữ phải có `aria-label` tương ứng.

---

## 7) Tiêu Chuẩn Tiếp Cận & Khả Năng Sử Dụng (Accessibility & WCAG 2.2 AA)

Đảm bảo sản phẩm tiếp cận được với mọi đối tượng, bao gồm cán bộ lớn tuổi và người khiếm khuyết:

- **Độ tương phản chuẩn WCAG 2.1 AA:**
  - Văn bản thông thường (dưới 18px): Tỷ lệ tương phản tối thiểu **4.5:1** so với nền.
  - Tiêu đề lớn (trên 18px bold / 24px regular): Tỷ lệ tương phản tối thiểu **3.0:1**.
  - Các thành phần điều khiển (viền input, nút bấm): Tối thiểu **3.0:1**.
- **Điều hướng Bàn phím & Focus Management:**
  - Tất cả các nút, link, input phải có chỉ báo focus rõ ràng: `outline: 2px solid #2563EB; outline-offset: 2px;` hoặc `ring-2 ring-blue-500`.
  - Không bao giờ dùng `outline: none` mà không có kiểu dáng thay thế.
  - Khi mở Modal hoặc Drawer, tiêu điểm bàn phím phải bị giữ bên trong (**Focus Trap**), phím `Escape` tự động đóng hộp thoại và trả focus về nút kích hoạt ban đầu.
  - Thanh Header hoặc Footer cố định không được che khuất phần tử đang nhận tiêu điểm (Focus Not Obscured).
- **Quy chuẩn Form & Thông báo lỗi (Accessible Forms):**
  - Mọi trường nhập liệu đều phải có `<label>` gắn liên kết qua `for`/`id` (không chỉ dựa vào placeholder).
  - Khi gửi form thất bại, hiển thị **Khối tổng hợp lỗi (Focusable Error Summary)** ở đầu form với `role="alert"` và `tabindex="-1"`, kèm link nhảy trực tiếp đến trường sai dữ liệu.
  - Thông báo lỗi inline phải có icon cảnh báo và mô tả cụ thể lý do (không chỉ đổi viền đỏ).
- **Hỗ trợ Giảm chuyển động (Prefers Reduced Motion):**
  - Tôn trọng thiết lập hệ điều hành qua `@media (prefers-reduced-motion: reduce)`: chuyển toàn bộ hiệu ứng chuyển động về dạng tức thì (`duration: 0.01ms`) để tránh gây chóng mặt.

---

## 8) Quy Chuẩn Trạng Thái Dữ Liệu & Phản Hồi (Data States & Feedback)

Mọi màn hình và bảng dữ liệu KTX phải xử lý trọn vẹn **4 trạng thái**:

1. **Trạng thái Đang tải (Loading State):**
   - Sử dụng **Skeleton Screen** mô phỏng cấu trúc của bảng/thẻ phòng thay vì Spinner tròn xoay chớp giật.
   - Thêm thuộc tính `aria-busy="true"` vào vùng dữ liệu đang tải.
2. **Trạng thái Trống (Empty State):**
   - Khi tìm kiếm không ra sinh viên, hoặc phòng chưa có ai ở:
   - Hiển thị hình minh họa vector nhẹ nhàng + Tiêu đề ngắn gọn + Hướng dẫn hành động tiếp theo (Ví dụ: *"Chưa có sinh viên nào trong phòng này. Nhấn [Xếp phòng] để thêm sinh viên"*).
3. **Trạng thái Lỗi mạng/Hệ thống (Error State):**
   - Giải thích rõ ràng sự cố bằng tiếng Việt dễ hiểu kèm mã lỗi kỹ thuật nhỏ bên dưới.
   - Luôn có nút **"Thử lại" (Retry)** hoặc **"Liên hệ hỗ trợ"**.
4. **Trạng thái Thành công (Success Feedback):**
   - Toast thông báo nhẹ nhàng ở góc màn hình, tự biến mất sau 3 giây hoặc có nút đóng nhanh.

---

## 9) Quy Chuẩn Các Thành Phần UI Đặc Thù KTX (KTX Component Specs)

### 1. Thẻ Sơ Đồ Phòng & Giường (Room & Bed Grid Matrix)
- **Cấu trúc:** Thẻ hiển thị mã phòng (Ví dụ: `P.402 - Nam`), số giường trống (ví dụ: `3/6 chỗ`), tiến trình lấp đầy (progress bar mini).
- **Phân loại màu viền/header theo trạng thái:**
  - *Còn chỗ:* Viền xanh lá nhẹ, badge `--success-600` (`#059669`).
  - *Đã đầy:* Viền trung tính `--slate-200`, badge `--danger-600` (`#DC2626`).
  - *Đang bảo trì:* Viền sọc chéo nhẹ, badge `--info-600` (`#0284C7`).
- **Tương tác:** Click phòng mở Drawer trượt bên phải hiển thị chi tiết từng giường (Giường 01, Giường 02 kèm ảnh/MSSV/Khoa của sinh viên đang ở).

### 2. Thẻ Thống Kê Tổng Quan (KPI Metric Cards)
- Nền trắng `--surface-white`, bo góc `--radius-lg`, đổ bóng `--shadow-sm`.
- Icon tròn bên trái với nền `--brand-50` và icon màu `--brand-600`.
- Hiển thị: Tổng số giường, Tỷ lệ lấp đầy (Occupancy %), Số hóa đơn chưa thanh toán, Yêu cầu sửa chữa cần xử lý. Đi kèm tỷ lệ tăng/giảm so với tháng trước.

### 3. Bảng Dữ Liệu Nghiệp Vụ (Data Tables)
- Dành cho: Quản lý sinh viên nội trú, hợp đồng, chỉ số điện nước hàng tháng.
- **Header:** Nền `--slate-50`, chữ `--slate-700`, font-size 13px, sticky khi cuộn.
- **Row:** Chiều cao chuẩn 48px - 52px, viền dưới 1px `--slate-100`. Hover chuyển sang nền xanh dương dịu (`#F8FAFC`).
- **Mã số:** Định dạng bằng phông `JetBrains Mono` dễ đối soát.
- **Hành động nhanh (Quick Actions):** Cột cố định bên phải (Xem chi tiết, Xuất phiếu thu, Gia hạn hợp đồng, Đổi phòng).

### 4. Nút Bấm (Button System)
- **Primary Button (Nút chính):** Nền `--brand-600` (`#1D4ED8`), chữ trắng, bo góc 8px. Hover: `--brand-700` (`#1E40AF`).
- **Secondary Button (Nút phụ):** Nền trắng, viền 1px `--slate-200`, chữ `--slate-700`. Hover: nền `--slate-50`, viền `--slate-300`.
- **Destructive Button (Nút nguy hiểm):** Nền đỏ `--danger-600` hoặc chữ đỏ viền đỏ nhạt (khi chấm dứt hợp đồng, xử lý kỷ luật). Bắt buộc có modal xác nhận trước khi thực thi.

### 5. Cổng Dịch Vụ Sinh Viên (Student Self-Service Portal)
- Thiết kế dạng thẻ trực quan (Card-based UI):
  - **Thẻ phòng của tôi:** Xem bạn cùng phòng, chỉ số điện nước tháng này, hạn đóng tiền phòng.
  - **Mã QR thanh toán nhanh:** Tích hợp mã VietQR động trực quan trên nền trắng có logo KTX.
  - **Form báo hỏng thiết bị (Ticket / Request):** Kèm nút chụp/tải ảnh hiện trạng bóng đèn, vòi nước hỏng, kèm timeline theo dõi thợ sửa chữa.

---

## 10) Quy Chuẩn Biểu Đồ & Trực Quan Hóa Số Liệu KTX (Data Visualization)

- **Biểu đồ Tỷ lệ Lấp đầy & Chỉ tiêu thu phí (Occupancy & Revenue):**
  - Ưu tiên **Bullet Chart** hoặc **Donut Chart** tối giản.
  - Sử dụng màu xanh dương `--brand-600` cho thực tế đạt được và đường kẻ đen/xám cho chỉ tiêu.
- **Khả năng tiếp cận biểu đồ (Accessible Data Viz):**
  - Không dựa duy nhất vào màu sắc; luôn đính kèm nhãn số phần trăm cụ thể (`85% (850/1000 giường)`).
  - Cung cấp bảng dữ liệu rút gọn tương đương (Data Table Fallback) bên dưới hoặc nút chuyển đổi dạng xem bảng cho người dùng sử dụng trình đọc màn hình.

---

## 11) Bố Cục Giao Diện Đa Phân Hệ (Layout Architecture)

### 1. Phân hệ Quản trị viên (Admin Workspace)
- **Sidebar (Trái):**
  - Chiều rộng 260px (thu gọn xuống 72px khi cần mở rộng diện tích bảng biểu).
  - Tùy chọn 1: Nền Navy sang trọng (`#0F172A`) với icon trắng sáng để tạo chiều sâu quản trị.
  - Tùy chọn 2: Nền Trắng tinh tế (`#FFFFFF`) viền phải `--slate-200`, menu item active dùng nền `--brand-50` và chữ `--brand-600`.
- **Top Bar (Trên cùng):**
  - Breadcrumb định vị (Ví dụ: `Quản lý phòng > Tòa nhà H1 > Tầng 3`).
  - Thanh tìm kiếm thông minh: Tìm nhanh sinh viên theo MSSV, Số CCCD, Mã phòng.
  - Chuông thông báo (Sự cố mới, sinh viên xin ra/vào muộn).
  - Avatar & Thông tin cán bộ quản lý.
- **Main Canvas:** Nền `--slate-50` (`#F8FAFC`), padding 24px - 32px.

### 2. Phân hệ Sinh viên (Student Portal)
- Thanh điều hướng trên cùng (Top Navigation) trên Desktop hoặc Bottom Navigation Bar trên Mobile.
- Giao diện thân thiện, ưu tiên thao tác 1 chạm: Thanh toán phí, Đăng ký gửi xe, Báo hỏng thiết bị, Xin nghỉ phép qua đêm.

---

## 12) Các Quy Tắc Chống Lỗi Thiết Kế (Anti-Patterns)

- **Tránh nhuộm xanh toàn bộ màn hình:** Không dùng nền xanh dương đậm cho vùng nội dung bảng tính lớn, sẽ gây mỏi mắt cho ban quản lý khi làm việc liên tục 8 tiếng.
- **Không dùng style Claymorphism (3D đất sét):** Không sử dụng bóng dày 2 chiều kiểu đồ chơi cho dữ liệu hành chính quản lý KTX.
- **Không ẩn trạng thái thanh toán và an toàn:** Tuyệt đối không biểu diễn tình trạng nợ phí hoặc phòng hỏng hóc chỉ bằng màu sắc mà luôn phải đi kèm Text Label rõ ràng (chuẩn WCAG 2.1).
- **Tránh bảng dữ liệu quá chật chội:** Đảm bảo khoảng cách đệm (cell padding tối thiểu 12px dọc) để tránh nhấp nhầm khi thao tác nhiều hàng.
- **Không dùng `cursor: default` trên các phần tử bấm được:** Luôn áp dụng `cursor: pointer` cho nút, thẻ click được, hàng bảng có thể mở chi tiết.
- **Không dùng `z-index` quá lớn ngẫu nhiên:** Nghiêm cấm đặt `z-[9999]` cho các phần tử thông thường, phải tuân thủ bảng bậc phân tầng Z-Index tại mục 4.

---

## 13) Bảng Kiểm Tra Chất Lượng Trước Khi Bàn Giao (Pre-Delivery UI/UX Checklist)

Trước khi nghiệm thu và đưa giao diện vào hoạt động, lập trình viên/designer phải rà soát toàn bộ danh mục sau:

### Trực quan & Nhận diện (Visual Quality)
- [ ] Không có Emoji nào bị sử dụng làm icon chức năng hoặc điều hướng (dùng Vector Phosphor/Lucide).
- [ ] Toàn bộ icon sử dụng đồng nhất một bộ và phong cách (stroke width 1.5px/2px).
- [ ] Độ tương phản chữ nội dung đạt tối thiểu 4.5:1 so với nền (chữ đen/xám đậm trên nền trắng).
- [ ] Tất cả nút bấm và thẻ có hiệu ứng hover mượt mà với thời gian từ 150ms – 250ms.

### Tương tác & Trải nghiệm (Interaction)
- [ ] Vùng chạm của tất cả nút bấm và icon trên di động đạt tối thiểu 44x44px.
- [ ] Phím tắt hoặc thao tác bấm bàn phím hiển thị vòng sáng focus rõ nét (`ring-2 ring-blue-500`).
- [ ] Hộp thoại Modal có Focus Trap và đóng được bằng phím `Escape`.
- [ ] Các hành động xóa sinh viên hoặc hủy hợp đồng có Modal xác nhận cảnh báo 2 bước.

### Tiếp cận & Khả năng đọc (Accessibility)
- [ ] Các icon trang trí cạnh chữ có thuộc tính `aria-hidden="true"`.
- [ ] Biểu mẫu có nhãn label rõ ràng và thông báo lỗi hiển thị bằng văn bản (không chỉ đổi viền đỏ).
- [ ] Form submit lỗi kích hoạt khối thông báo tổng hợp lỗi có thể nhận focus ở đầu trang (`role="alert"`).
- [ ] Hỗ trợ `@media (prefers-reduced-motion: reduce)` không gây vỡ giao diện.

### Bố cục & Đa thiết bị (Responsive Layout)
- [ ] Kiểm tra giao diện hoạt động hoàn hảo trên các độ phân giải: Mobile (375px), Tablet (768px), Laptop (1024px) và Màn hình lớn (1440px).
- [ ] Bảng dữ liệu dài trên màn hình nhỏ có thanh cuộn ngang mượt mà kèm cột cố định (sticky action column).
- [ ] Giữ đúng nhịp khoảng cách 8pt (padding/margin là bội số của 4 hoặc 8).

---

## 14) Ghi Chú Triển Khai (Source of Truth)

- File [MASTER (1).md](file:///d:/Quan_ly_ktx/MASTER%20(1).md) này là tài liệu chuẩn (**Master Design System Source of Truth**) cho toàn bộ giao diện dự án **Quản lý ký túc xá**.
- Khi phát triển các trang con (ví dụ: Trang sơ đồ phòng, Trang quản lý điện nước, Trang sinh viên nộp phí), các biến CSS `:root` và component phải kế thừa trực tiếp từ bảng đặc tả này.
