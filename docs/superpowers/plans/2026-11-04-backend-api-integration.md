# Backend REST API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp toàn diện các REST API hiện có của Backend Spring Boot (`http://localhost:8080/api/v1`) vào KTX Hub Frontend Prototype theo kiến trúc Service Adapter & Dual-Mode, bảo tồn 100% giao diện và duy trì pass toàn bộ test suites.

**Architecture:** Sử dụng Service Adapter Pattern kết hợp HTTP Client Interceptor (JWT Bearer Token, Auto Refresh Token, Spring Boot Error Standardization). Xây dựng lớp DTO Adapters hai chiều để chuyển đổi giữa mô hình backend (OpenAPI 3.1.0) và mô hình prototype hiện tại, đồng thời hỗ trợ Hybrid Fallback cho các module chưa có REST Controller ở backend (Tenants, Invoices, Contracts, Incidents).

**Tech Stack:** React 19, TypeScript 5.7, Vite 8 proxy, Node.js Native Test Runner (`node:test`), Tailwind CSS v4.

**Spec:** `docs/API_INTEGRATION_PLAN.md`

## Global Constraints

- **Bảo tồn 100% giao diện (Zero Visual Regression):** Giữ nguyên toàn bộ CSS classes, màu sắc (`#007BFF`, v.v.), font chữ, padding, margin và border radius.
- **Tính bất biến (Immutability):** Cập nhật state luôn tạo object/array mới, tuyệt đối không mutate trực tiếp.
- **Dual-Mode Contract:** Hoạt động ổn định khi `VITE_USE_MOCK=true` (độc lập, không cần backend) và `VITE_USE_MOCK=false` (gọi REST API thật).
- **Kiểm thử & Build sạch:** `npm test` và `npm run build` phải pass 100% sau mỗi task mà không có lỗi lint hoặc TypeScript.

## Review Focus

1. **Token hết hạn (401 Unauthorized) trong lúc người dùng thao tác:** `httpClient` phải tự động gọi refresh token, lấy lại access token mới và retry request đang dở dang mà không bắt người dùng đăng nhập lại; nếu refresh token cũng hết hạn thì đăng xuất sạch và chuyển về Login.
2. **Lỗi kiểm tra ràng buộc nghiệp vụ (Validation & Business Errors 400/409/422):** Thông điệp từ Spring Boot `DetailedErrorResponse` (`errors` map hoặc `message`) phải được hiển thị chính xác lên giao diện Toast thay vì crash hoặc nuốt lỗi.
3. **Phòng có người ở (Locked Bed / Room):** Thao tác chuyển bảo trì giường có khách hoặc xóa phòng đang có người phải nhận lỗi từ backend và hiển thị cảnh báo đúng quy tắc BR-01 / BR-04.
4. **Định dạng dữ liệu không đồng nhất (Enums & IDs):** `roomNumber` ⟷ `code`, `FOUR_BEDS` ⟷ `"4 giường"`, `MALE` ⟷ `"Nam"`, UUID ⟷ String phải được adapter map trơn tru cả 2 chiều đọc và ghi.
5. **Khả năng fallback khi backend ngắt kết nối đột ngột:** Khi `VITE_USE_MOCK=false` nhưng backend sập hoặc trả về lỗi mạng, ứng dụng không được vỡ trắng trang mà hiển thị thông báo lỗi lịch sự và giữ nguyên state hiện tại.

---

### Task 1: Type Definitions & OpenAPI DTO Contracts

**Files:**
- Modify: `src/types/api/endpoints.ts`
- Modify: `src/types/auth.ts`
- Test: `src/test/types.test.ts`

**Interfaces:**
- Consumes: OpenAPI 3.1.0 schemas từ `http://localhost:8080/v3/api-docs`.
- Produces: TypeScript types cho `SingleResponse<T>`, `PageResponse<T>`, `DetailedErrorResponse`, `RoomDetailResponse`, `RoomSummaryResponse`, `BedSlotResponse`, `OccupantSummaryResponse`, `CreateRoomRequest`, `UpdateRoomRequest`, `UpdateBedStatusRequest`, `AuthResponse`, `UserProfileResponse`, `TechnicianResponse`, `CreateTechnicianRequest`, `UpdateTechnicianRequest`.

- [ ] **Step 1: Write the failing test**

Thêm test kiểm tra tính hợp lệ và cấu trúc của các DTO types mới trong `src/test/types.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import type {
  SingleResponse,
  PageResponse,
  RoomDetailResponse,
  AuthResponse,
  TechnicianResponse,
} from "../types/api/endpoints.ts";

test("DTO types validate backend response contracts", () => {
  const mockAuthRes: SingleResponse<AuthResponse> = {
    httpStatus: "OK",
    message: "Success",
    data: {
      accessToken: "token123",
      refreshToken: "refresh123",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: "u-1",
        username: "admin",
        email: "admin@ktxhub.vn",
        phone: "0900123456",
        role: "MANAGER",
        status: "ACTIVE",
      },
    },
  };
  assert.equal(mockAuthRes.data.user.role, "MANAGER");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL do các kiểu `SingleResponse`, `AuthResponse`, v.v. chưa được export từ `src/types/api/endpoints.ts`.

- [ ] **Step 3: Implement DTO interfaces in `src/types/api/endpoints.ts` and `src/types/auth.ts`**

Cập nhật `src/types/api/endpoints.ts` với đầy đủ định nghĩa interface bám sát OpenAPI spec:
- `SingleResponse<T>`, `PageResponse<T>`, `DetailedErrorResponse`, `SuccessResponse`
- `BackendRoomType` (`"FOUR_BEDS" | "SIX_BEDS" | "EIGHT_BEDS"`), `BackendGenderPolicy` (`"MALE" | "FEMALE"`)
- `RoomDetailResponse`, `RoomSummaryResponse`, `BedSlotResponse`, `OccupantSummaryResponse`
- `CreateRoomRequest`, `UpdateRoomRequest`, `UpdateBedStatusRequest`
- `AuthResponse`, `UserProfileResponse`, `LoginRequest`, `ChangePasswordRequest`, `ForgotPasswordRequest`, `VerifyOtpRequest`, `ResetPasswordRequest`
- `TechnicianResponse`, `CreateTechnicianRequest`, `UpdateTechnicianRequest`, `UpdateTechnicianStatusRequest`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/types/api/endpoints.ts src/types/auth.ts src/test/types.test.ts
git commit -m "feat(types): add complete OpenAPI backend DTO contracts"
```

---

### Task 2: Token Storage & HTTP Client Upgrade

**Files:**
- Create: `src/services/api/tokenStorage.ts`
- Modify: `src/services/httpClient.ts`
- Test: `src/test/tokenStorage.test.ts`
- Test: `src/test/httpClient.test.ts`

**Interfaces:**
- Consumes: `localStorage`, `src/types/api/endpoints.ts` (`AuthResponse`, `DetailedErrorResponse`).
- Produces: `tokenStorage` (`getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`), `httpClient` (với Authorization header, 401 refresh interceptor và typed `ApiError`).

- [ ] **Step 1: Write the failing test**

Tạo `src/test/tokenStorage.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { tokenStorage } from "../services/api/tokenStorage.ts";

test("tokenStorage saves, retrieves, and clears tokens correctly", () => {
  tokenStorage.setTokens({
    accessToken: "test_access",
    refreshToken: "test_refresh",
    tokenType: "Bearer",
    expiresIn: 3600,
  });

  assert.equal(tokenStorage.getAccessToken(), "test_access");
  assert.equal(tokenStorage.getRefreshToken(), "test_refresh");

  tokenStorage.clearTokens();
  assert.equal(tokenStorage.getAccessToken(), null);
  assert.equal(tokenStorage.getRefreshToken(), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL với lỗi không tìm thấy module `tokenStorage.ts`.

- [ ] **Step 3: Implement `tokenStorage.ts` and upgrade `httpClient.ts`**

1. Tạo `src/services/api/tokenStorage.ts` quản lý việc lưu và đọc `accessToken` và `refreshToken` an toàn trên `localStorage` (hoặc fallback in-memory khi không có `window.localStorage`).
2. Nâng cấp `src/services/httpClient.ts`:
   - Gắn header `Authorization: Bearer <accessToken>` khi `accessToken` tồn tại.
   - Khi request nhận về status `401` và có `refreshToken`, phát request gọi `POST /api/v1/auth/refresh-token`. Nếu thành công, cập nhật tokens mới và retry lại request gốc; nếu thất bại, gọi `tokenStorage.clearTokens()`.
   - Trích xuất chi tiết `DetailedErrorResponse` đưa vào `ApiError.data` để UI dễ đọc `errorCode` và thông báo lỗi tiếng Việt.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/services/api/tokenStorage.ts src/services/httpClient.ts src/test/tokenStorage.test.ts src/test/httpClient.test.ts
git commit -m "feat(http): add token storage and JWT refresh interceptor to httpClient"
```

---

### Task 3: Auth Service & Context Integration

**Files:**
- Create: `src/services/authService.ts`
- Create: `src/services/api/adapters/authAdapter.ts`
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/pages/auth/LoginPage.tsx`
- Test: `src/test/authAdapter.test.ts`
- Test: `src/test/authService.test.ts`

**Interfaces:**
- Consumes: `httpClient`, `tokenStorage`, `src/types/api/endpoints.ts`.
- Produces: `authService` (`login`, `logout`, `getMe`, `forgotPassword`, `verifyForgotPasswordOtp`, `resetPassword`, `changePassword`), `AuthContext` cập nhật trạng thái đăng nhập thực tế.

- [ ] **Step 1: Write the failing test**

Tạo `src/test/authAdapter.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { toFrontendRole, toBackendRole } from "../services/api/adapters/authAdapter.ts";

test("authAdapter converts role between backend and frontend correctly", () => {
  assert.equal(toFrontendRole("MANAGER"), "manager");
  assert.equal(toFrontendRole("TECHNICIAN"), "technician");
  assert.equal(toFrontendRole("TENANT"), "student");

  assert.equal(toBackendRole("manager"), "MANAGER");
  assert.equal(toBackendRole("technician"), "TECHNICIAN");
  assert.equal(toBackendRole("student"), "TENANT");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL do chưa có file `src/services/api/adapters/authAdapter.ts`.

- [ ] **Step 3: Implement `authAdapter.ts`, `authService.ts`, and wire into `AuthContext.tsx` & `LoginPage.tsx`**

1. Tạo `src/services/api/adapters/authAdapter.ts` chuyển đổi vai trò và profile.
2. Tạo `src/services/authService.ts` gọi các endpoint `/api/v1/auth/*` và `/api/v1/users/me`.
3. Cập nhật `src/contexts/AuthContext.tsx` để cung cấp `login(credentials)`, `logout()`, `currentUser`, và `role`.
4. Cập nhật `src/pages/auth/LoginPage.tsx`:
   - Kết nối form submit vào `authService.login({ identifier: email, password })`.
   - Kết nối modal Quên mật khẩu 3 bước vào `forgotPassword`, `verifyForgotPasswordOtp`, `resetPassword`.
   - Giữ lại các nút bấm nhanh Demo Account (Quản lý, Sinh viên, Kỹ thuật viên) để test nhanh khi dev.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/services/authService.ts src/services/api/adapters/authAdapter.ts src/contexts/AuthContext.tsx src/pages/auth/LoginPage.tsx src/test/authAdapter.test.ts src/test/authService.test.ts
git commit -m "feat(auth): integrate backend authentication and password recovery lifecycle"
```

---

### Task 4: Room & Bed Data Adapters

**Files:**
- Create: `src/services/api/adapters/roomAdapter.ts`
- Test: `src/test/roomAdapter.test.ts`

**Interfaces:**
- Consumes: `RoomDetailResponse`, `RoomSummaryResponse`, `BedSlotResponse`, `CreateRoomRequest`, `UpdateRoomRequest` từ `src/types/api/endpoints.ts`.
- Produces:
  - `toFrontendRoomRecord(detail: RoomDetailResponse): RoomRecord`
  - `toFrontendBedRecord(bed: BedSlotResponse): BedRecord`
  - `toBackendCreateRoomRequest(room: RoomRecord): CreateRoomRequest`
  - `toBackendUpdateRoomRequest(room: RoomRecord): UpdateRoomRequest`
  - `toFrontendRoomType(type: BackendRoomType): RoomType`
  - `toBackendRoomType(type: RoomType): BackendRoomType`
  - `toFrontendGender(gender: BackendGenderPolicy): RoomGender`
  - `toBackendGenderPolicy(gender: RoomGender): BackendGenderPolicy`

- [ ] **Step 1: Write the failing test**

Tạo `src/test/roomAdapter.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import {
  toFrontendRoomRecord,
  toBackendCreateRoomRequest,
} from "../services/api/adapters/roomAdapter.ts";
import type { RoomDetailResponse } from "../types/api/endpoints.ts";

test("roomAdapter converts RoomDetailResponse to RoomRecord with beds correctly", () => {
  const detail: RoomDetailResponse = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    roomNumber: "P.101",
    floor: 1,
    roomType: "FOUR_BEDS",
    genderPolicy: "MALE",
    totalBeds: 4,
    occupiedBeds: 1,
    basePrice: 1500000,
    amenities: [{ amenityId: "a1", code: "AC", name: "Máy lạnh", category: "Appliance", quantity: 1 }],
    beds: [
      { id: "b1", bedCode: "G01", slotKey: "P.101-G01", price: 1500000, status: "OCCUPIED" },
      { id: "b2", bedCode: "G02", slotKey: "P.101-G02", price: 1500000, status: "AVAILABLE" },
    ],
  };

  const room = toFrontendRoomRecord(detail);
  assert.equal(room.code, "P.101");
  assert.equal(room.type, "4 giường");
  assert.equal(room.gender, "Nam");
  assert.equal(room.total, 4);
  assert.equal(room.amenities.length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL do chưa có file `src/services/api/adapters/roomAdapter.ts`.

- [ ] **Step 3: Implement `src/services/api/adapters/roomAdapter.ts`**

Xây dựng các pure functions chuyển đổi 2 chiều chính xác, xử lý đúng các enum (`FOUR_BEDS` ⟷ `"4 giường"`, `MALE` ⟷ `"Nam"`), ánh xạ tiện nghi `amenities`, và trích xuất danh sách giường cũng như thông tin người ở nếu có.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/services/api/adapters/roomAdapter.ts src/test/roomAdapter.test.ts
git commit -m "feat(adapter): add bi-directional room and bed data mappers"
```

---

### Task 5: Room & Bed REST API Service Integration

**Files:**
- Modify: `src/services/api/apiDormService.ts`
- Modify: `src/services/dormService.ts`
- Modify: `src/contexts/DormDataContext.tsx`
- Modify: `src/pages/admin/rooms/RoomsPage.tsx`
- Test: `src/test/apiDormService.test.ts`
- Test: `src/test/services.test.ts`

**Interfaces:**
- Consumes: `httpClient`, `roomAdapter`, REST endpoints (`/api/v1/admin/rooms/matrix`, `/api/v1/admin/rooms`, `/api/v1/admin/beds/{id}/status`).
- Produces: `DormService` mở rộng hỗ trợ CRUD phòng và giường qua backend thật, cập nhật context mượt mà.

- [ ] **Step 1: Write the failing test**

Tạo `src/test/apiDormService.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { apiDormService } from "../services/api/apiDormService.ts";

test("apiDormService has methods for room matrix and bed status", () => {
  assert.equal(typeof apiDormService.getRooms, "function");
  assert.equal(typeof apiDormService.createRoom, "function");
  assert.equal(typeof apiDormService.updateRoom, "function");
  assert.equal(typeof apiDormService.deleteRoom, "function");
  assert.equal(typeof apiDormService.updateBedStatus, "function");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL do các phương thức `createRoom`, `updateRoom`, `deleteRoom`, `updateBedStatus` chưa được định nghĩa trên `apiDormService`.

- [ ] **Step 3: Implement methods in `apiDormService.ts` and connect with `DormDataContext.tsx` & `RoomsPage.tsx`**

1. Cập nhật `apiDormService.ts`:
   - `getRooms()`: gọi `GET /admin/rooms/matrix`, map qua `toFrontendRoomRecord`.
   - `createRoom(room)`: gọi `POST /admin/rooms`.
   - `updateRoom(id, room)`: gọi `PUT /admin/rooms/{id}`.
   - `deleteRoom(id)`: gọi `DELETE /admin/rooms/{id}`.
   - `updateBedStatus(bedId, status)`: gọi `PATCH /admin/beds/{id}/status`.
2. Bổ sung các phương thức này vào `DormService` interface và `mockDormService.ts` để đảm bảo 100% tương thích cả 2 chế độ Mock và Real API.
3. Cập nhật `DormDataContext.tsx` và `RoomsPage.tsx` để gọi trực tiếp các phương thức tạo/sửa/xóa phòng và đổi bảo trì giường qua service thay vì chỉ thay đổi state mảng `rooms` đơn thuần.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/services/api/apiDormService.ts src/services/dormService.ts src/services/mock/mockDormService.ts src/contexts/DormDataContext.tsx src/pages/admin/rooms/RoomsPage.tsx src/test/apiDormService.test.ts src/test/services.test.ts
git commit -m "feat(rooms): integrate real room matrix and bed status endpoints into service and UI"
```

---

### Task 6: Technician Management Service & UI Integration

**Files:**
- Create: `src/services/technicianService.ts`
- Modify: `src/pages/admin/technicians/TechnicianAccountsPage.tsx`
- Test: `src/test/technicianService.test.ts`

**Interfaces:**
- Consumes: `httpClient`, REST endpoints (`/api/v1/users/technicians`, `/api/v1/users/technicians/{id}/status`).
- Produces: `technicianService` (`getTechnicians`, `createTechnician`, `updateTechnician`, `toggleStatus`), `TechnicianAccountsPage` hiển thị dữ liệu trực tiếp từ backend.

- [ ] **Step 1: Write the failing test**

Tạo `src/test/technicianService.test.ts`:

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { technicianService } from "../services/technicianService.ts";

test("technicianService defines CRUD methods for staff accounts", () => {
  assert.equal(typeof technicianService.getTechnicians, "function");
  assert.equal(typeof technicianService.createTechnician, "function");
  assert.equal(typeof technicianService.updateTechnician, "function");
  assert.equal(typeof technicianService.toggleStatus, "function");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL do chưa có file `src/services/technicianService.ts`.

- [ ] **Step 3: Implement `technicianService.ts` and wire into `TechnicianAccountsPage.tsx`**

1. Tạo `src/services/technicianService.ts` gọi các endpoint:
   - `getTechnicians(params)`: `GET /api/v1/users/technicians` (hỗ trợ phân trang, tìm kiếm, lọc active).
   - `createTechnician(req)`: `POST /api/v1/users/technicians`.
   - `updateTechnician(id, req)`: `PUT /api/v1/users/technicians/{id}`.
   - `toggleStatus(id, active)`: `PATCH /api/v1/users/technicians/{id}/status`.
2. Cập nhật `src/pages/admin/technicians/TechnicianAccountsPage.tsx`:
   - Tải danh sách kỹ thuật viên từ `technicianService` khi mở trang.
   - Khi tạo mới, sửa hoặc bấm Khóa/Mở khóa, gọi hàm tương ứng trên service, hiển thị Toast kết quả hoặc thông báo lỗi từ backend.
   - Giữ nguyên 100% layout, classes Tailwind, drawer chi tiết và badge hiển thị trạng thái.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS 100%

- [ ] **Step 5: Commit**

```bash
git add src/services/technicianService.ts src/pages/admin/technicians/TechnicianAccountsPage.tsx src/test/technicianService.test.ts
git commit -m "feat(technicians): connect technician account management to backend REST endpoints"
```

---

### Task 7: End-to-End Smoke Verification & Zero-Regression QA

**Files:**
- Modify: `.env.example`
- Modify: `README.md` (nếu cần hướng dẫn bật backend)
- Test: Toàn bộ test suite (`src/test/*.test.ts`)

**Interfaces:**
- Consumes: Môi trường local backend `http://localhost:8080/api/v1`.
- Produces: Báo cáo nghiệm thu tích hợp đầy đủ, không phát sinh lỗi giao diện hoặc build.

- [ ] **Step 1: Run full unit test suite**

Run: `npm test`
Expected: All 35+ tests pass (0 failures, 0 errors).

- [ ] **Step 2: Run TypeScript and Vite production build**

Run: `npm run build`
Expected: Build thành công trong < 1 giây, 0 type errors.

- [ ] **Step 3: Verify Dual-Mode Switching**

1. Kiểm tra với `VITE_USE_MOCK=true`: chạy mượt mà, đầy đủ dữ liệu mẫu độc lập.
2. Kiểm tra với `VITE_USE_MOCK=false`: kết nối trơn tru tới backend `http://localhost:8080` qua proxy `/api`.

- [ ] **Step 4: Commit**

```bash
git add .env.example README.md
git commit -m "chore: finalize backend integration and dual-mode environment documentation"
```
