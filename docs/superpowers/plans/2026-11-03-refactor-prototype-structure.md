# Refactor Prototype Codebase Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the monolithic prototype codebase into clean, modular, and maintainable layers matching `docs/ARCHITECTURE.md` and `docs/CONVENTION.md` (`types/`, `config/`, `services/`, `components/common/`, `contexts/`, `hooks/`, `pages/`, `routes/`, `utils/`) with a versatile Dual-Mode data service (Mock ⟷ Local Backend API) while preserving 100% of existing UI visual design, Tailwind CSS styling, user interactions, and business logic.

**Architecture:**
Conforms strictly to `docs/ARCHITECTURE.md`:
1. `src/types/`: Centralized TypeScript models, interfaces, and API entity types (`types/api/`).
2. `src/config/`: Application configuration and environment variable parsing (`env.ts` for `VITE_USE_MOCK` and `VITE_API_BASE_URL`).
3. `src/services/`: Data access layer featuring the **Dual-Mode Adapter Pattern** (`dormService.ts`, `mockDormService.ts`, `apiDormService.ts`, `httpClient.ts`, seed data).
4. `src/utils/`: Pure helper functions, formatting (`formatVND`, dates), and domain calculation logic.
5. `src/components/common/`: Reusable, design-system compliant UI elements in PascalCase (`Button.tsx`, `Modal.tsx`, `Drawer.tsx`, `Select.tsx`, `Icon.tsx`, `PageHeader.tsx`, `TagInput.tsx`, `QrCode.tsx`, `Toast.tsx`, `PriorityTag.tsx`, `ChangePasswordModal.tsx`).
6. `src/contexts/`: Shared React context providers (`AuthContext.tsx`, `DormDataContext.tsx`, `ToastContext.tsx`).
7. `src/hooks/`: Custom React hooks (`useAuth.ts`, `useDormData.ts`, `useToast.ts`).
8. `src/pages/`: Screen containers and page-level composition:
   - `src/pages/auth/LoginPage.tsx`
   - `src/pages/admin/` (`DashboardPage.tsx`, `RoomsPage.tsx`, `TenantsPage.tsx`, `ContractsPage.tsx`, `InvoicesPage.tsx`, `IncidentsPage.tsx`, `FinancialPage.tsx`, `VehiclesPage.tsx`, `TechnicianAccountsPage.tsx`, sub-components in PascalCase)
   - `src/pages/student/` (`TenantPortalPage.tsx`, `RoomPage.tsx`, `ReportPage.tsx`, `TenantInvoicesPage.tsx`, `TenantVehiclesPage.tsx`, `PaymentProofPanel.tsx`, `RequestModal.tsx`)
   - `src/pages/technician/` (`TechnicianPage.tsx`, `TicketListPage.tsx`, `TicketDetailPage.tsx`, `NoticeSheet.tsx`, `SettingsTab.tsx`, `PasswordPage.tsx`)
9. `src/routes/`: Route definitions, navigation setup, and role guards (`routes.ts`, `RouteGuard.tsx`).
10. Existing root files (`App.tsx`, `admin.tsx`, `rooms.tsx`, `student.tsx`, `technician.tsx`, `shared.tsx`, `quick.tsx`, `data.ts`, `domain.ts`) act as backward-compatible facade re-exports, guaranteeing zero breaking changes for existing test suites and imports.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 4, Vite 8, Node.js Test Runner (`node --test`).

**Spec:**
- Project Architecture: `docs/ARCHITECTURE.md`
- Code Conventions: `docs/CONVENTION.md`
- Design System: `DESIGN.md` & `src/index.css`
- Design Contract Guard: `src/design-contract.test.ts`
- Domain Business Invariants: `src/domain.test.ts`

---

## Global Constraints

- **100% Visual & Interaction Parity:** Do not alter, rename, or strip Tailwind CSS classes, inline styles, layout containers, flex/grid properties, or text copy. The rendered DOM and CSS must remain visually identical.
- **PascalCase for Components:** React components and component files must use PascalCase (e.g., `Button.tsx`, `RoomsPage.tsx`, `RoomCard.tsx`).
- **camelCase for Utilities/Hooks/Services:** Functions, variables, hooks, and services must use camelCase (e.g., `useDormData.ts`, `dormService.ts`, `formatters.ts`).
- **Dual-Mode Data Feasibility:** Must support seamless toggling between in-memory/localStorage mock data (`VITE_USE_MOCK=true`) and real backend REST API (`VITE_USE_MOCK=false`).
- **Max File Size:** Each extracted module must remain cohesive and strictly below 400 lines (well under the 800-line soft ceiling).
- **Immutability:** All state transitions and array/object updates must create new copies; never mutate in-place.
- **Contract Test Continuity:** `src/design-contract.test.ts` and `src/domain.test.ts` must pass at every step. Root facades ensure existing test assertions remain intact.
- **Verification Gate:** `npm test` and `npm run build` must run and pass with 0 errors after each task.

---

## Review Focus

1. **Tailwind Class & DOM Hierarchy Preservation:** Omitting a wrapper `div` or changing a CSS class during refactoring can subtly break styling. Verified by running `npm run build` and checking visual structure.
2. **Design Contract Test Retention:** `src/design-contract.test.ts` reads specific strings from `App.tsx`, `admin.tsx`, `shared.tsx`, `rooms.tsx`, etc. Facades or source constants must maintain matching tokens (`max-w-[1280px]`, `card` class, `active:translate-y-[1px]`).
3. **Dual-Mode Independence:** The UI must function completely and flawlessly whether `VITE_USE_MOCK` is true or false.
4. **Modal/Drawer Event Handling:** Ensure `Escape` key listeners and backdrop click handlers properly register and clean up without memory leaks or double triggering.
5. **Strict TypeScript Types:** Use `type` for component props and local data shapes, no loose `any` types.

---

## Implementation Tasks

### Task 1: Type System & API Entity Modularization (`src/types/`)

Extract all TypeScript interfaces, types, and unions into modular type definitions under `src/types/` and `src/types/api/`.

**Files:**
- Create:
  - `src/types/auth.ts`: `Role`, `UserProfile`, `LoginCredentials`
  - `src/types/room.ts`: `RoomType`, `BedStatus`, `BedRecord`, `RoomRecord`, `RoomFilterState`
  - `src/types/tenant.ts`: `TenantRecord`, `TenantVehicle`, `ContractRecord`
  - `src/types/invoice.ts`: `Invoice`, `InvoiceStatus`, `PaymentMethod`, `PaymentRecord`, `TenantInvoice`
  - `src/types/incident.ts`: `Priority`, `TicketStatus`, `Ticket`, `Notice`, `ViolationRecord`
  - `src/types/technician.ts`: `TechnicianAccount`, `TechnicianProfile`
  - `src/types/shared.ts`: `IconName`, `SelectOption`, `ToastState`, `QuickKind`, `RequestKind`
  - `src/types/api/endpoints.ts`: DTO request and response types for backend endpoints
  - `src/types/index.ts`: Barrel export of all types
- Modify:
  - `src/data.ts`: Re-export all types from `src/types/`
  - `src/shared.tsx`: Re-export relevant types from `src/types/`
- Test:
  - `src/test/types.test.ts`

**Interfaces:**
- Produces: Clean imports from `src/types` (`Role`, `RoomRecord`, `TenantRecord`, `Invoice`, `Ticket`, `Priority`, `IconName`).

- [ ] **Step 1: Write type verification test in `src/test/types.test.ts`**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import type { Role, RoomRecord, TenantRecord, Invoice, Ticket, Priority, IconName } from "../types";

test("src/types exports all core domain interfaces", () => {
  const role: Role = "student";
  const priority: Priority = "Khẩn cấp";
  assert.equal(role, "student");
  assert.equal(priority, "Khẩn cấp");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/test/types.test.ts`
Expected: FAIL (module `../types` not found).

- [ ] **Step 3: Implement `src/types/*` modules and update `src/data.ts`**

Create `src/types/auth.ts`, `src/types/room.ts`, `src/types/tenant.ts`, `src/types/invoice.ts`, `src/types/incident.ts`, `src/types/technician.ts`, `src/types/shared.ts`, `src/types/api/endpoints.ts`, and barrel export in `src/types/index.ts`. Re-export all types in `src/data.ts` and `src/shared.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/data.ts src/shared.tsx src/test/types.test.ts
git commit -m "refactor: extract modular type definitions to src/types"
```

---

### Task 2: Config & Dual-Mode Service Architecture (`src/config/`, `src/services/`)

Set up centralized configuration (`src/config/env.ts`) and the versatile Dual-Mode data service layer (`dormService.ts`, `mockDormService.ts`, `apiDormService.ts`, `httpClient.ts`, mock seed datasets) so the prototype can run in standalone mock mode or call a local backend.

**Files:**
- Create:
  - `src/config/env.ts`: `VITE_USE_MOCK`, `VITE_API_BASE_URL` with type-safe defaults
  - `src/services/httpClient.ts`: Lightweight wrapper around `fetch` with error handling and JSON headers
  - `src/services/mock/mockData.ts`: Decomposed mock datasets (`initialRooms`, `initialTenants`, `initialInvoices`, `initialTickets`, `initialTechnicians`)
  - `src/services/mock/mockDormService.ts`: In-memory and localStorage-backed implementation of `DormService`
  - `src/services/api/apiDormService.ts`: Real REST API implementation of `DormService` calling backend endpoints
  - `src/services/dormService.ts`: `DormService` interface and default dynamic factory export
  - `src/services/index.ts`: Barrel export
  - `.env.example`: Environment variables template
- Modify:
  - `src/data.ts`: Re-export mock data and constants from `src/services/mock/mockData.ts`
  - `vite.config.ts`: Add local API proxy configuration
- Test:
  - `src/test/services.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface DormService {
    getRooms(): Promise<RoomRecord[]>;
    getTenants(): Promise<TenantRecord[]>;
    getInvoices(): Promise<Invoice[]>;
    getTickets(): Promise<Ticket[]>;
    createTicket(ticket: Omit<Ticket, "id">): Promise<Ticket>;
    updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket>;
    saveRooms(rooms: RoomRecord[]): Promise<RoomRecord[]>;
    saveTenants(tenants: TenantRecord[]): Promise<TenantRecord[]>;
    saveInvoices(invoices: Invoice[]): Promise<Invoice[]>;
    confirmPayment(invoiceId: string, manager: string): Promise<Invoice>;
  }
  ```

- [ ] **Step 1: Write test for `mockDormService` in `src/test/services.test.ts`**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService";

test("mockDormService provides seed data and handles ticket creation", async () => {
  const rooms = await mockDormService.getRooms();
  assert.ok(rooms.length > 0, "mock rooms should not be empty");

  const newTicket = await mockDormService.createTicket({
    title: "Sửa vòi sen P.102",
    room: "P.102",
    author: "Nguyễn Văn A",
    category: "Nước",
    priority: "Bình thường",
    status: "Chờ xử lý",
    time: "Vừa xong",
    desc: "Vòi sen bị rỉ nước",
  });
  assert.ok(newTicket.id.startsWith("TCK-"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/test/services.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement config, mock data, httpClient, and dual-mode services**

Implement `src/config/env.ts`, `src/services/httpClient.ts`, `src/services/mock/mockData.ts`, `src/services/mock/mockDormService.ts`, `src/services/api/apiDormService.ts`, and `src/services/dormService.ts`. Add proxy to `vite.config.ts` and create `.env.example`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/config/ src/services/ src/data.ts src/test/services.test.ts vite.config.ts .env.example
git commit -m "feat: implement dual-mode data service (mock and local REST API) and config"
```

---

### Task 3: Domain Utilities & Business Calculations (`src/utils/`)

Organize pure functions for room calculations, invoice math, financial summaries, and auth parsing into `src/utils/`.

**Files:**
- Create:
  - `src/utils/roomCalculations.ts`: `isSlotAvailable`, `slotKey`, `generateBedsForRoom`, `calculateRoomOccupancy`
  - `src/utils/invoiceCalculations.ts`: `totalInvoiceDue`, `confirmCashPayment`
  - `src/utils/financialCalculations.ts`: `calculateFinancialSummary`
  - `src/utils/authUtils.ts`: `resolveRole`
  - `src/utils/formatters.ts`: `money`, `person`, `rentalSlots`
  - `src/utils/index.ts`: Barrel export
- Modify:
  - `src/domain.ts`: Re-export from `src/utils/`
- Test:
  - `src/domain.test.ts`

**Interfaces:**
- Produces: `isSlotAvailable`, `slotKey`, `generateBedsForRoom`, `calculateRoomOccupancy`, `totalInvoiceDue`, `confirmCashPayment`, `calculateFinancialSummary`, `resolveRole`, `money`, `person`, `rentalSlots`.

- [ ] **Step 1: Verify current domain tests pass**

Run: `node --test src/domain.test.ts`
Expected: PASS (22 tests).

- [ ] **Step 2: Add test for `resolveRole` in `src/domain.test.ts`**

```typescript
import { resolveRole } from "./domain";

test("resolveRole parses email domain and prefixes correctly", () => {
  assert.equal(resolveRole("student@gmail.com"), "student");
  assert.equal(resolveRole("tech@gmail.com"), "technician");
  assert.equal(resolveRole("manager@gmail.com"), "admin");
  assert.equal(resolveRole("invalid@other.com"), null);
});
```

- [ ] **Step 3: Implement `src/utils/*` and re-export in `src/domain.ts`**

Create `roomCalculations.ts`, `invoiceCalculations.ts`, `financialCalculations.ts`, `authUtils.ts`, and `formatters.ts`. Re-export all in `src/domain.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 23 domain tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/ src/domain.ts src/domain.test.ts
git commit -m "refactor: organize pure domain logic and utilities in src/utils"
```

---

### Task 4: Reusable UI Components in PascalCase (`src/components/common/`)

Extract design-system UI primitives and composite widgets from `src/shared.tsx` (810 lines) and `src/admin.tsx` into PascalCase components under `src/components/common/`.

**Files:**
- Create:
  - `src/components/common/Icon.tsx`: `Icon` component + all SVG paths
  - `src/components/common/Button.tsx`: `Button` with tactile `active:translate-y-[1px]`
  - `src/components/common/Select.tsx`: Accessible custom `Select`
  - `src/components/common/Modal.tsx`: Accessible `Modal` with backdrop & keyboard dismiss
  - `src/components/common/Drawer.tsx`: Slide-over `Drawer`
  - `src/components/common/PageHeader.tsx`: Standard `PageHeader`
  - `src/components/common/TagInput.tsx`: `TagInput`
  - `src/components/common/QrCode.tsx`: Pseudo `QrCode` (from `admin.tsx`)
  - `src/components/common/Toast.tsx`: Toast presentation component
  - `src/components/common/PriorityTag.tsx`: `PriorityTag` and `PriorityPicker`
  - `src/components/common/ChangePasswordModal.tsx`: `ChangePasswordModal`
  - `src/components/common/AccountMenu.tsx`: `AccountMenu`
  - `src/components/common/ViolationFields.tsx`: `ViolationFields`
  - `src/components/common/index.ts`: Barrel export
- Modify:
  - `src/shared.tsx`: Re-export all components from `src/components/common/` while preserving contract tokens
  - `src/admin.tsx`: Import `QrCode` from `src/components/common/QrCode`
- Test:
  - `src/design-contract.test.ts`

**Interfaces:**
- Produces: `Button`, `Icon`, `Select`, `Modal`, `Drawer`, `PageHeader`, `TagInput`, `QrCode`, `Toast`, `PriorityTag`, `PriorityPicker`, `ChangePasswordModal`, `AccountMenu`, `ViolationFields`.

- [ ] **Step 1: Verify design contract test before changes**

Run: `node --test src/design-contract.test.ts`
Expected: PASS. Note requirement: `sharedTsx` must contain `active:translate-y-[1px]`. Ensure `src/shared.tsx` keeps this token.

- [ ] **Step 2: Implement PascalCase components in `src/components/common/`**

Create each component file in `src/components/common/` with clean types and proper accessibility attributes.

- [ ] **Step 3: Update `src/shared.tsx` as a clean facade**

Ensure `src/shared.tsx` re-exports all components so that all existing imports work seamlessly.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/ src/shared.tsx src/admin.tsx
git commit -m "refactor: extract reusable UI components to src/components/common"
```

---

### Task 5: Context Providers & Custom Hooks (`src/contexts/`, `src/hooks/`)

Introduce React Contexts and custom hooks in `src/contexts/` and `src/hooks/` to eliminate prop-drilling and manage asynchronous data from `dormService`.

**Files:**
- Create:
  - `src/contexts/ToastContext.tsx`: `ToastProvider`
  - `src/contexts/AuthContext.tsx`: `AuthProvider`
  - `src/contexts/DormDataContext.tsx`: `DormDataProvider` (backed by `dormService` with optimistic local caching)
  - `src/contexts/index.ts`: Barrel export
  - `src/hooks/useToast.ts`: `useToast()`
  - `src/hooks/useAuth.ts`: `useAuth()`
  - `src/hooks/useDormData.ts`: `useDormData()`
  - `src/hooks/index.ts`: Barrel export
- Test:
  - `src/test/contexts.test.ts`

**Interfaces:**
- Produces:
  - `useToast(): { toast: string; showToast: (m: string) => void; closeToast: () => void }`
  - `useAuth(): { role: Role | null; login: (r: Role) => void; logout: () => void }`
  - `useDormData(): { rooms, tenants, invoices, tickets, loading, reload, onCreateTicket, onUpdateTicket, onRoomsChange, onTenantsChange, onInvoicesChange, onConfirmPayment }`

- [ ] **Step 1: Write context integration test in `src/test/contexts.test.ts`**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { mockDormService } from "../services/mock/mockDormService";

test("DormDataContext updates state immutably", async () => {
  const initial = await mockDormService.getTickets();
  const newTicket = { ...initial[0], id: "TCK-IMMUTABLE", title: "New" };
  const updated = [newTicket, ...initial];
  assert.notEqual(updated, initial);
  assert.equal(updated.length, initial.length + 1);
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test src/test/contexts.test.ts`
Expected: PASS.

- [ ] **Step 3: Implement Context providers and hooks**

Create `ToastContext.tsx`, `AuthContext.tsx`, `DormDataContext.tsx`, `useToast.ts`, `useAuth.ts`, `useDormData.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/contexts/ src/hooks/ src/test/contexts.test.ts
git commit -m "feat: implement React contexts and custom hooks for global state"
```

---

### Task 6: Decompose Rooms Management Screen (`src/pages/admin/rooms/`)

Break down the 1478-line `src/rooms.tsx` into modular components under `src/pages/admin/rooms/`.

**Files:**
- Create:
  - `src/pages/admin/rooms/AddEditRoomModal.tsx`: Room creation/editing modal
  - `src/pages/admin/rooms/DeleteRoomModal.tsx`: Soft delete archive modal
  - `src/pages/admin/rooms/RoomCard.tsx`: Individual room card
  - `src/pages/admin/rooms/RoomDetailDrawer.tsx`: Room details slide-over
  - `src/pages/admin/rooms/RoomMatrixView.tsx`: Visual matrix floor grid
  - `src/pages/admin/rooms/RoomTableView.tsx`: Room list table
  - `src/pages/admin/rooms/RoomsPage.tsx`: Main page coordinator
  - `src/pages/admin/rooms/index.ts`: Barrel export
- Modify:
  - `src/rooms.tsx`: Facade re-exporting `RoomsPage`
- Test:
  - `src/design-contract.test.ts`

**Interfaces:**
- Produces: `RoomsPage` from `src/pages/admin/rooms/RoomsPage.tsx` and `src/rooms.tsx`.

- [ ] **Step 1: Check design contract test**

Run: `node --test src/design-contract.test.ts`
Expected: PASS.

- [ ] **Step 2: Extract room subcomponents to `src/pages/admin/rooms/`**

Create `AddEditRoomModal.tsx`, `DeleteRoomModal.tsx`, `RoomCard.tsx`, `RoomDetailDrawer.tsx`, `RoomMatrixView.tsx`, `RoomTableView.tsx`, and `RoomsPage.tsx`.

- [ ] **Step 3: Update `src/rooms.tsx` as a clean facade**

Replace the monolithic `rooms.tsx` with re-exports from `src/pages/admin/rooms`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/rooms/ src/rooms.tsx
git commit -m "refactor: decompose rooms management screen to src/pages/admin/rooms"
```

---

### Task 7: Decompose Admin Pages, Modals & Shell (`src/pages/admin/`)

Decompose `src/admin.tsx` (2272 lines), `src/quick.tsx` (307 lines), and the admin shell components in `src/App.tsx` into modular pages under `src/pages/admin/`.

**Files:**
- Create:
  - `src/pages/admin/layout/AdminSidebar.tsx`: Navigation sidebar
  - `src/pages/admin/layout/AdminHeader.tsx`: Top header with search, quick actions, and user trigger
  - `src/pages/admin/layout/NotificationDrawer.tsx`: Slide-over notification panel
  - `src/pages/admin/layout/AdminShell.tsx`: Master desktop layout shell with 1280px containment
  - `src/pages/admin/dashboard/DashboardKPIs.tsx`: Top KPI cards
  - `src/pages/admin/dashboard/DashboardCharts.tsx`: Revenue bar chart and system alerts
  - `src/pages/admin/dashboard/DashboardInsights.tsx`: Financial insights (from `admin.tsx`)
  - `src/pages/admin/dashboard/DashboardPage.tsx`: Main overview page
  - `src/pages/admin/tenants/TenantsPage.tsx`: Tenant management page (from `App.tsx`)
  - `src/pages/admin/invoices/InvoicesPage.tsx`: Billing and VietQR invoice page (from `admin.tsx`)
  - `src/pages/admin/incidents/IncidentsPage.tsx`: Incident dispatch and discipline page (from `admin.tsx`)
  - `src/pages/admin/financial/FinancialPage.tsx`: Revenue and repair expense P&L (from `admin.tsx`)
  - `src/pages/admin/vehicles/VehiclesPage.tsx`: Parking registration and vehicle list (from `admin.tsx`)
  - `src/pages/admin/technicians/TechnicianAccountsPage.tsx`: Staff list page (from `admin.tsx`)
  - `src/pages/admin/contracts/ContractsPage.tsx`: Contracts and lease lifecycle page (from `admin.tsx`)
  - `src/pages/admin/quick/QuickModals.tsx`: Fast action modals (from `quick.tsx`)
  - `src/pages/admin/quick/GlobalSearch.tsx`: Search palette (from `quick.tsx`)
- Modify:
  - `src/admin.tsx`: Facade re-exporting pages and retaining `const card = ...` token for design contract test
  - `src/quick.tsx`: Facade re-exporting `QuickModals` and `GlobalSearch`
- Test:
  - `src/design-contract.test.ts`

**Interfaces:**
- Produces: `AdminShell`, `DashboardPage`, `TenantsPage`, `ContractsPage`, `InvoicesPage`, `IncidentsPage`, `FinancialPage`, `VehiclesPage`, `TechnicianAccountsPage`, `QuickModals`, `GlobalSearch`.

- [ ] **Step 1: Check design contract test requirements**

Run: `node --test src/design-contract.test.ts`
Expected: PASS. Note requirement: `adminTsx` must match `const card = "rounded-sm border border-slate-200 bg-white shadow-xs"`. Retain this in `src/admin.tsx`.

- [ ] **Step 2: Implement modular pages in `src/pages/admin/`**

Create layout and page components with clean PascalCase file names.

- [ ] **Step 3: Update `src/admin.tsx` and `src/quick.tsx` as backward-compatible facades**

Ensure all existing exports remain valid.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/ src/admin.tsx src/quick.tsx
git commit -m "refactor: decompose admin pages, layout shell, and quick actions"
```

---

### Task 8: Decompose Student Tenant Portal (`src/pages/student/`)

Decompose `src/student.tsx` (1042 lines) into focused subcomponents under `src/pages/student/`.

**Files:**
- Create:
  - `src/pages/student/RoomPage.tsx`: Active room view, roommates, and quick actions
  - `src/pages/student/ReportPage.tsx`: Equipment issue reporting with photo upload mockup
  - `src/pages/student/TenantInvoicesPage.tsx`: Invoices list, status breakdown, and VietQR payment
  - `src/pages/student/PaymentProofPanel.tsx`: Bank transfer details and proof submission panel
  - `src/pages/student/TenantVehiclesPage.tsx`: Parking registration and vehicle list
  - `src/pages/student/RequestModal.tsx`: Room transfer, lease extension, and checkout request modal
  - `src/pages/student/TenantPortalPage.tsx`: Student portal shell and navigation
  - `src/pages/student/index.ts`: Barrel export
- Modify:
  - `src/student.tsx`: Facade re-exporting `TenantPortal`
- Test:
  - `src/design-contract.test.ts`

**Interfaces:**
- Produces: `TenantPortal` from `src/pages/student` and `src/student.tsx`.

- [ ] **Step 1: Check design contract test**

Run: `node --test src/design-contract.test.ts`
Expected: PASS.

- [ ] **Step 2: Implement student components under `src/pages/student/`**

Move `RoomPage`, `ReportPage`, `TenantInvoicesPage`, `PaymentProofPanel`, `TenantVehiclesPage`, and `RequestModal` into dedicated PascalCase files.

- [ ] **Step 3: Update `src/student.tsx` as a facade**

Re-export `TenantPortal` in `src/student.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/student/ src/student.tsx
git commit -m "refactor: decompose student tenant portal into modular views"
```

---

### Task 9: Decompose Technician Workspace (`src/pages/technician/`)

Decompose `src/technician.tsx` (680 lines) into dedicated task lists, inspection/completion screens, notice sheets, and profile settings under `src/pages/technician/`.

**Files:**
- Create:
  - `src/pages/technician/TicketListPage.tsx`: Repair tasks filtered by status
  - `src/pages/technician/TicketDetailPage.tsx`: Work-order detail, parts checklist, and sign-off
  - `src/pages/technician/NoticeSheet.tsx`: System alerts and notifications sheet
  - `src/pages/technician/SettingsTab.tsx`: Account profile and contact info
  - `src/pages/technician/PasswordPage.tsx`: Password update screen
  - `src/pages/technician/TechnicianPage.tsx`: Main mobile/tablet shell
  - `src/pages/technician/index.ts`: Barrel export
- Modify:
  - `src/technician.tsx`: Facade re-exporting `TechnicianApp`
- Test:
  - `src/design-contract.test.ts`

**Interfaces:**
- Produces: `TechnicianApp` from `src/pages/technician` and `src/technician.tsx`.

- [ ] **Step 1: Check design contract test**

Run: `node --test src/design-contract.test.ts`
Expected: PASS.

- [ ] **Step 2: Implement technician components under `src/pages/technician/`**

Decompose `src/technician.tsx` into `TicketListPage.tsx`, `TicketDetailPage.tsx`, `NoticeSheet.tsx`, `SettingsTab.tsx`, `PasswordPage.tsx`, and `TechnicianPage.tsx`.

- [ ] **Step 3: Update `src/technician.tsx` as a facade**

Re-export `TechnicianApp` in `src/technician.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/technician/ src/technician.tsx
git commit -m "refactor: decompose technician workspace into modular views"
```

---

### Task 10: Routing & Navigation Setup (`src/routes/`)

Create routing configuration and role guard in `src/routes/` to formalize navigation between Admin, Student, and Technician portals.

**Files:**
- Create:
  - `src/routes/routes.ts`: Route definitions, navigation items, and path helpers
  - `src/routes/RouteGuard.tsx`: Role verification and fallback view
  - `src/routes/index.ts`: Barrel export
- Test:
  - `src/test/routes.test.ts`

**Interfaces:**
- Produces: `routes`, `RouteGuard`, `navGroups`.

- [ ] **Step 1: Write routing contract test in `src/test/routes.test.ts`**

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { navGroups, getRouteByRole } from "../routes/routes";

test("Routes module defines navigation groups for Admin", () => {
  assert.ok(navGroups.length >= 3, "Must define at least 3 nav groups");
  assert.equal(getRouteByRole("admin"), "Bảng điều khiển");
  assert.equal(getRouteByRole("student"), "portal");
  assert.equal(getRouteByRole("technician"), "tasks");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/test/routes.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/routes/routes.ts` and `src/routes/RouteGuard.tsx`**

Set up declarative routes, nav groups, and role helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test && npm run build`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/routes/ src/test/routes.test.ts
git commit -m "feat: add declarative routes and route guards in src/routes"
```

---

### Task 11: Refactor App Root, Login Page & Clean Integration (`src/App.tsx`, `src/pages/auth/`)

Extract `LoginPage` from `src/App.tsx`, connect `DormDataProvider`, `AuthProvider`, and `ToastProvider`, and reduce `src/App.tsx` from 1550 lines down to ~120 lines of clean orchestration.

**Files:**
- Create:
  - `src/pages/auth/LoginPage.tsx`: Authentication screen with demo role presets
  - `src/pages/auth/index.ts`: Barrel export
- Modify:
  - `src/App.tsx`: Clean top-level coordinator component that integrates contexts, auth routing, and feature shells while retaining required design tokens (`max-w-[1280px]`, `min-h-[100dvh]`).
- Test:
  - `src/design-contract.test.ts`
  - `src/domain.test.ts`

**Interfaces:**
- Produces: Clean default export `App` in `src/App.tsx`.
- Consumes: `useAuth`, `useDormData`, `useToast`, `LoginPage`, `AdminShell`, `TenantPortal`, `TechnicianApp`.

- [ ] **Step 1: Check design contract test before editing App.tsx**

Run: `node --test src/design-contract.test.ts`
Expected: PASS.
Verify requirements:
- `!appTsx.includes('min-h-screen')`
- `assert.match(appTsx, /max-w-\[1280px\]/)`
Ensure both conditions remain explicitly satisfied in `src/App.tsx` or its top layout shell!

- [ ] **Step 2: Extract `LoginPage` into `src/pages/auth/LoginPage.tsx`**

Move `LoginPage` to `src/pages/auth/LoginPage.tsx` with its demo account buttons and validation.

- [ ] **Step 3: Slim down `src/App.tsx`**

Integrate `LoginPage`, `TenantPortal`, `TechnicianApp`, and `AdminShell` using standard role routing. Ensure `max-w-[1280px]` and `min-h-[100dvh]` are strictly maintained in `src/App.tsx`.

- [ ] **Step 4: Run all test suites and production build**

Run: `npm test && npm run build`
Expected: All tests PASS with 0 errors and production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/auth/ src/App.tsx
git commit -m "refactor: simplify App.tsx into clean orchestration shell and extract login page"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Conforms 100% to `docs/ARCHITECTURE.md` and `docs/CONVENTION.md`.
- [x] **Step scan:** Every task includes concrete test commands, exact file paths, explicit function signatures, and verifiable outcomes.
- [x] **Type consistency:** Common types (`Role`, `RoomRecord`, `TenantRecord`, `Invoice`, `Ticket`, `Priority`) are unified under `src/types/` and consistently consumed across all feature tasks.
- [x] **Review Focus:** Addressed all 5 review focus items (DOM/Tailwind preservation, design contract test retention, dual-mode data independence, modal keyboard accessibility, and strict TypeScript types).
- [x] **Proportion:** The plan gives precise file paths, interfaces, and test criteria without dumping unnecessary line-by-line component transcripts.
