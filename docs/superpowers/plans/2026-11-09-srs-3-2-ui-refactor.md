# KTX Hub SRS 3.2 UI Refactor — Implementation Plan

> **Dành cho người triển khai:** thực hiện từng nhóm theo `superpowers:subagent-driven-development` hoặc `superpowers:executing-plans`; chỉ bắt đầu sau khi kế hoạch được duyệt. Không commit nếu chưa được yêu cầu.

**Mục tiêu:** Refactor toàn bộ prototype React/TypeScript hiện tại thành mẫu FE tương tác đầy đủ cho mọi yêu cầu Phase 1 của SRS 3.2 Final, có thể bàn giao cho FE triển khai song song với BE; không cắt thành MVP.

**Kiến trúc:** Giữ ứng dụng hiện có và xây lại mô hình miền, fixture và các thao tác mock theo nghiệp vụ; tất cả màn hình đọc/ghi cùng một nguồn trạng thái và định danh ổn định. Tách contract nghiệp vụ khỏi adapter mock và adapter API; dùng mock độc lập cho prototype, còn API và bảo đảm an ninh/toàn vẹn thực là công việc phối hợp với BE, không tuyên bố đã hoàn thành chỉ vì UI mô phỏng được.

**Tech stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Node test runner hiện có; browser smoke trên Chrome, responsive. Chỉ bổ sung thư viện sau khi đánh giá nếu thực sự cần, ví dụ QR/VietQR hoặc xuất `.xlsx`/PDF.

**Đặc tả chuẩn đã kiểm tra trực tiếp trong repository ngày 09/11/2026:** [`docs/SRS.md`](../../SRS.md) tự xác định **3.2 — FINAL** ở dòng 9–11; [`docs/Conceptual-ERD.md`](../../Conceptual-ERD.md) tự xác định **3.4 — FINAL**, đồng bộ SRS 3.2 ở dòng 8–11; [`docs/Logical-ERD.md`](../../Logical-ERD.md) tự xác định **v3.5 — FINAL**, dùng SRS 3.2 và Conceptual 3.4 ở dòng 8–15. Đây là xác nhận theo nội dung ba tệp tại thời điểm khảo sát, không phải xác minh độc lập với bản gốc ngoài repository. Tên tham chiếu phiên bản trong nội dung, kể cả nhắc `Logical-ERD.md` cũ, không làm thay đổi phiên bản ghi ở đầu tệp hiện tại. SRS ưu tiên khi có khác biệt; các tài liệu đích không chứng minh backend đã triển khai.

## Ràng buộc chung

- Đầy đủ FR-01–FR-10 và FR-12–FR-27; FR-11 được ghi nhận nhưng hoãn Phase 2. Bao phủ BR-01–BR-11; không tạo booking, quản lý nhiều cơ sở, tiện ích tính riêng, thu phạt, thông báo Manager soạn, ký số, webhook hay tự động nhận tiền.
- Manager desktop; Tenant mobile-first có đúng bốn tab Phòng, Hóa đơn, Phương tiện, Báo hỏng; Technician mobile/tablet. Không dựa duy nhất vào màu để truyền trạng thái; hỗ trợ bàn phím, nhãn, focus và trạng thái lỗi.
- Prototype chạy ở mock mode độc lập; trạng thái có thể được lưu local cho demo, phải có cách reset an toàn dữ liệu demo và các fixture độc lập cho các tình huống. Không đưa thông tin cá nhân, tài khoản ngân hàng hoặc mật khẩu thật vào fixture.
- Trạng thái và kết quả trong mock phải đồng nhất giữa các vai trò, dùng ID chứ không nối theo tên; tránh báo thành công giả. Lỗi tải/lưu API phải hiện rõ, không lặng lẽ thay dữ liệu thật bằng dữ liệu demo.
- UI kiểm tra để hướng dẫn người dùng, không thay thế các kiểm tra phía BE về quyền, chủ sở hữu, trạng thái cư trú, đồng thời, transaction, mã bảo vệ, mật khẩu/OTP và lưu tệp private.
- Tệp hợp đồng, ảnh giấy đăng ký xe, minh chứng chuyển khoản, ảnh hiện trường và ảnh nghiệm thu đều là dữ liệu private: BE kiểm tra JWT, role và quyền sở hữu trước mỗi lần cấp URL ký OCI tối đa 15 phút; lưu object key bền vững, không lưu URL ký như địa chỉ cố định hoặc public. Mock chỉ mô phỏng, không chứng minh cơ chế bảo vệ thật.
- Mã trạng thái nghiệp vụ map rõ sang tiếng Việt. Ngày và kỳ tính theo `Asia/Ho_Chi_Minh`; tiền VND nguyên, không dùng phép tính dấu phẩy động khi tổng hợp.
- Màn hình tải/rỗng/không có quyền/lỗi và tương tác vô hiệu phải có thông điệp có thể hiểu được. Khi cập nhật thất bại không để state hiển thị thành công.
- Chỉ gắn nhãn kết quả bảo mật, tích hợp, hiệu năng là đã đạt khi được kiểm chứng trên BE/môi trường tương ứng. Các con số NFR là mục tiêu SRS, không phải kết quả khảo sát.

## Kết quả khảo sát hiện trạng

- `src/App.tsx:22–63,84–105`: state xe riêng trong `localStorage`, còn chấp nhận role `student`; ba portal đã tồn tại. `src/contexts/DormDataContext.tsx:38–61,75–91` khởi tạo dữ liệu mẫu, giữ dữ liệu khi tải lỗi và có nhánh trả kết quả local khi cập nhật ticket thất bại.
- `src/types/room.ts:10–27` lưu giá ở Bed/override và `deletedAt`; `src/types/tenant.ts:1–16,45–56` gộp thông tin hợp đồng hiện hành vào Tenant, chưa thể hiện các phụ lục; `src/types/invoice.ts:15–41` thiếu `contractId`/`billingPeriod` và loại TenantInvoice còn điện/nước riêng.
- Tiếp nhận ở `src/pages/admin/tenants/TenantsPage.tsx:105–155` chỉ thêm Tenant, dùng mật khẩu cố định và `:661` sao chép email thành tên đăng nhập. `ContractsPage.tsx:209–254` gia hạn/checkout local theo tên; checkout chưa chọn trạng thái Bed.
- `src/pages/admin/financial/FinancialPage.tsx:115–123` chỉ toast khi xuất và gọi chỉ số là lợi nhuận ròng; KPI ở `src/pages/admin/dashboard/DashboardKPIs.tsx:4–37` là số cố định.
- `src/pages/tenant/TenantPortalPage.tsx:45–53,85–126` dùng người thuê demo/lọc theo tên hoặc phòng; `src/pages/tenant/ReportPage.tsx:7` dùng danh mục sự cố cũ. QR hiện được vẽ giả trong `src/components/common/QrCode.tsx`; minh chứng và ảnh sự cố chưa được truyền đầy đủ.
- Chạy Vite và quan sát browser: form hiện ghi `Tài khoản Gmail`; nút mẫu Người thuê điền `tenant@gmail.com`, trong khi SRS quy định Tenant dùng CCCD. Đây là quan sát UI, không phải xác minh đăng nhập hoặc BE.
- README mô tả dual-mode và một số API; khảo sát không xác nhận backend, Redis, OCI hay scheduler đã đúng SRS. Cần xác minh với hợp đồng BE trước khi gắn mode API.

## Review focus — tình huống có khả năng gây lỗi

1. Hai Tenant cùng tên hoặc ở cùng phòng: mọi lịch sử, hóa đơn, xe và phiếu phải theo ID và đúng chủ sở hữu — kiểm tra ở Task 1, 4, 7, 8.
2. Ngày cuối tháng/ngày 25 và timezone Việt Nam: gia hạn sau batch, hạn 05, onboarding ngày 01, báo cáo kỳ cũ — kiểm tra ở Task 4, 5, 6.
3. Xung đột hoặc dữ liệu đã đổi sau khi mở form: từ chối và hiển thị lỗi, không áp thành công cục bộ — kiểm tra Task 2, 4, 5, 7.
4. Checkout còn nợ hoặc phương tiện chờ cấp: vẫn checkout, thu hồi xe, giữ chứng từ và quyền gửi minh chứng — kiểm tra Task 4, 5, 8.
5. Tệp hợp đồng, giấy xe, minh chứng và ảnh sự cố/nghiệm thu: xử lý file không hợp lệ theo giới hạn từng nghiệp vụ; khi URL hết hạn phải xin URL mới sau kiểm tra quyền, người không có quyền không được xem. Mock không chứng minh OCI thật — kiểm tra ở Task 4, 5, 7, 8, 9.

## Cấu trúc và quy ước thực hiện

- Sửa `src/types/{auth,room,tenant,invoice,incident}.ts`, bổ sung types nghiệp vụ tập trung tại `src/types/` khi cần. Domain model phản ánh Room/Bed, User/Tenant/Staff, Contract/Renewal/Document, Invoice/Receipt, Expense, Ticket/Part, Vehicle, Violation, Notification; tách ID kỹ thuật khỏi mã hiển thị.
- Chuyển nghiệp vụ xuyên màn hình vào `src/services/dormService.ts` và `src/services/mock/`; phân chia theo module nếu cần. Không dùng `saveTenants`/`saveInvoices` ghi đè nguyên mảng để giả lập hành động nghiệp vụ. Adapter `src/services/api/` chỉ theo contract BE đã thống nhất, không tự khẳng định endpoint đề xuất đang tồn tại.
- `src/contexts/DormDataContext.tsx` và `src/App.tsx` kết nối state chung; các màn hình dưới `src/pages/admin/`, `src/pages/tenant/`, `src/pages/technician/`, `src/pages/auth/` dùng cùng nguồn. Giữ component tái sử dụng hiện có nếu phù hợp; tách file lớn theo trách nhiệm khi sửa.
- `src/test/`: bảo trì kiểm thử domain hiện có và chỉ thêm regression test cho ranh giới/trạng thái có nguy cơ; không kiểm thử câu chữ hay chi tiết triển khai. `npm test`, `npm run build`, `npx tsc --noEmit`; build Vite không thay thế kiểm tra kiểu.
- Cập nhật `docs/API_INTEGRATION_PLAN.md` ngay ở Task 1 để bàn giao contract sơ bộ cho FE/BE; Task 9 tổng hợp, đối chiếu và nghiệm thu bản cuối. Đồng bộ `README.md` và tài liệu handoff khi hoàn thành; không ghi thông tin nhạy cảm thật.

## Ma trận từng FR → hiện trạng → nhiệm vụ

Ký hiệu: **M** = UI/mock một phần hoặc có dấu hiệu cũ; **C** = có client/UI nhưng cần xác minh và refactor; **H** = hoãn. Không mục nào dưới đây được coi là đã hoàn chỉnh đầu cuối chỉ từ khảo sát.

| FR | Yêu cầu cần bàn giao | Hiện trạng | Task |
|---|---|---|---|
| 01 | Ma trận phòng/giường, drawer, bảo trì, xếp khách | M: occupancy suy từ Tenant, available có thể gồm bảo trì | 3 |
| 02 | Tạo Room + đúng 4/6/8 Bed và tiện nghi | M: có form/preview, thiếu bảo vệ mã và đồng bộ | 3 |
| 03 | Sửa giá/mã/giới tính/tiện nghi; khóa tầng/sức chứa | M: UI cho sửa tầng/sức chứa, API thiếu mã/tiện nghi | 3 |
| 04 | Xóa nhầm an toàn; archive/restore; bảo vệ mã | M: mô hình deletedAt, thiếu restore và kiểm tra lịch sử | 3 |
| 05 | Tìm/lọc Room, danh sách lưu trữ | M: có lọc, thiếu danh sách khôi phục | 3 |
| 06 | Hồ sơ Tenant, quyền sửa và lịch sử | M: ghép theo tên, thiếu một số trường và sửa theo quyền | 4, 8 |
| 07 | Tenant sau checkout xem lịch sử, gửi proof nợ | M: portal không phân nhánh cư trú | 4, 5, 8 |
| 08 | Đăng ký xe, cấp/thu hồi, lịch sử và tái dùng mã thẻ | M: bắt giấy tờ mọi loại, có đường mất lịch sử, thiếu kiểm tra mã | 8 |
| 09 | Onboarding ngày 01 + User/Contract/Bed/invoice đầu | M: chỉ tạo Tenant, mật khẩu cố định, không xử lý khách cũ | 4 |
| 10 | Tài liệu hợp đồng đa tệp, quyền xem/xóa, private | M: object URL local, chưa contract file private | 4, 9 |
| 11 | Chuyển phòng | H: Phase 2; loại bỏ điểm vào còn lộ trong Phase 1 | 8 |
| 12 | Gia hạn phụ lục, khóa giá, điều kiện công nợ | M: đổi hạn local, thiếu phụ lục/giá/kiểm tra | 4 |
| 13 | Checkout chọn Bed, thu hồi xe, giữ nợ/lịch sử | M: cập nhật cục bộ, tự cho giường sẵn sàng | 4, 8 |
| 14 | Chi phí và chênh lệch thu–chi, xuất XLSX/PDF | M: nhãn lợi nhuận ròng, tổng chưa theo kỳ, xuất chỉ toast | 6 |
| 15 | Hóa đơn đầu, batch 25, lọc và chạy lại | M: có danh sách, thiếu contract/kỳ và luồng batch mock | 4, 5 |
| 16 | VietQR, proof, đối soát, xác nhận tiền mặt | M: QR giả, proof không truyền file đầy đủ | 5 |
| 17 | Tenant cư trú báo hỏng | M: danh mục cũ, ảnh boolean, lọc phiếu theo phòng | 7 |
| 18 | Phân công, xử lý, ảnh và linh kiện thực dùng | M: thiếu lọc assignee, vật tư và ảnh thực | 7 |
| 19 | Biên bản vi phạm cho Tenant đang ở, không thu phạt | M: nhập tên/phòng tự do, state rời, ngày cố định | 7 |
| 20 | Dashboard bốn KPI: doanh thu theo kỳ; ba KPI còn lại theo thời điểm xem | M: bốn thẻ số tĩnh, bộ lọc chưa tác động | 6 |
| 21 | Login CCCD/email, RBAC | C: có client; mock/nhãn đăng nhập cũ | 2 |
| 22 | Logout | C: xóa client/có request; revoke server chưa xác minh | 2 |
| 23 | Manager quản lý Technician | M: danh sách/tạo/khóa, thiếu sửa và mật khẩu ngẫu nhiên một lần | 2 |
| 24 | Đổi mật khẩu cũ; quên bằng OTP 6 số/5 phút | M: UI có nhánh chỉ toast, forgot thiên về email | 2 |
| 25 | Thẻ phòng, bạn cùng phòng, trạng thái checkout | M: dữ liệu Tenant/demo cố định | 8 |
| 26 | Tab hóa đơn của Tenant, lịch sử và proof | M: lọc theo tên/fallback demo | 5, 8 |
| 27 | Thông báo tự sinh và vi phạm cá nhân | M: thông báo/vi phạm mẫu độc lập, có nhãn chung | 7, 8 |

## Ma trận BR → điểm kiểm soát

| BR | Invariant và task sở hữu |
|---|---|
| 01 | Bed 4/6/8, ID bất biến, ba trạng thái, mã/Slot Key, archive, occupancy gồm bảo trì trong mẫu số: Task 1, 3, 4, 6. |
| 02 | Phòng Nam/Nữ; chỉ đổi chính sách khi không cư trú và không hợp đồng chiếm chỗ; ghép khách đúng giới: Task 3, 4. |
| 03 | Tiền thuê trọn gói, snapshot giá, thu theo kỳ hóa đơn, chi phí một lần, không gọi lợi nhuận: Task 4–6. |
| 04 | Gia hạn/thuê lại không còn nợ/chờ; checkout vẫn cho nợ, giữ lịch sử, chọn trạng thái Bed, không tự giải phóng: Task 4, 5, 8. |
| 05 | Onboarding 01, hóa đơn đầu, batch 25/hạn 05, 3 trạng thái, VietQR/tiền mặt xác nhận thủ công và một phiếu thu: Task 4, 5. |
| 06 | Sáu loại, ba ưu tiên, bốn trạng thái, đúng Technician, chi phí vật tư: Task 7. |
| 07 | Vi phạm của Tenant đang cư trú; phạt chỉ ghi nhận, không thành khoản thu: Task 7, 8. |
| 08 | Lịch sử, ràng buộc duy nhất và cập nhật nhất quán; BE chịu trách nhiệm transaction thật: Task 1, 3–9. |
| 09 | CCCD/email, email unique toàn User, mật khẩu một lần, change không OTP/forgot OTP, giữ tài khoản checkout: Task 2, 4, 8. |
| 10 | Tối đa một xe chưa thu hồi, chứng từ theo loại, thẻ tái sử dụng, lịch sử: Task 4, 8. |
| 11 | Ba role, kiểm tra quyền/chủ sở hữu/cư trú ở BE; chỉ thông báo tự sinh: Task 2, 7–9. |

## Thứ tự phụ thuộc

Task 1 → bàn giao contract sơ bộ cho FE/BE → Task 2 và Task 3 → Task 4 → Task 5 → Task 6; Task 6 cũng phụ thuộc dữ liệu ticket/parts từ Task 7. Sau Task 1–2, Task 7 có thể làm song song với Task 3–5 theo contract sơ bộ; Task 8 tích hợp Task 4, 5, 7; Task 9 cập nhật và nghiệm thu contract cuối. Chia người theo module nhưng một người chịu trách nhiệm tích hợp contract/state chung; không để mỗi portal tạo dữ liệu độc lập.

### Task 1 — Mô hình nghiệp vụ và mock có thể bàn giao

**Files:** `src/types/*`, `src/services/dormService.ts`, `src/services/mock/mockDormService.ts`, `src/services/mock/mockData.ts`, `src/contexts/DormDataContext.tsx`, `src/App.tsx`, `src/test/domain.test.ts`, `docs/API_INTEGRATION_PLAN.md`.

**Contract cần thống nhất trước khi sửa UI:**
- `User` có `id`, `role`, email và trạng thái; Tenant có `userId`, CCCD, `residentStatus`; Staff có `userId`. `Room` có `id`, code, floor, capacity, gender, basePrice, archived; Bed có `id`, `roomId`, bedCode, slotKey, status; không lưu giá độc lập của Bed.
- `Contract` có `id`, `tenantId`, `bedId`, snapshot mã, điều khoản gốc và status; `Renewal` gắn `contractId`, kỳ, giá cố định; `Document` gắn contract và renewal nếu là phụ lục. Invoice có `id`, `contractId`, `billingPeriod`, `dueOn`, amount, status và proof; receipt gắn invoice, method, amount, confirmer, time. Không dùng tên hay mã hiển thị làm khóa quan hệ.
- Ticket gắn reporterTenantId/roomId/bedId tùy chọn/assigneeStaffId tùy chọn, có part lines; Vehicle gắn tenantId và card status; Violation và Notification gắn tenantId. Kiểu file mock giữ nội dung xem được trong phiên hoặc kho demo, không coi object URL là URL OCI lâu dài.
- Các thao tác được mô hình thành lệnh có tên theo nghiệp vụ: create/update/archive/restore/delete Room, update Bed maintenance, onboard, renew, checkout, issue invoices/retry, submit/reject/confirm proof, confirm cash, register/issue/revoke vehicle, assign/start/complete ticket, record violation. Trả kết quả hoặc lỗi có nghĩa; các thao tác nhiều thực thể thay đổi snapshot mock cùng nhau.
- [ ] Ngay khi chốt domain model, cập nhật `docs/API_INTEGRATION_PLAN.md` thành **contract sơ bộ bàn giao FE/BE**: ID và quan hệ, enum, DTO/request/response mẫu cho từng module, lỗi/quyền và các chuyển trạng thái chính; gồm contract file private chung. Ghi rõ endpoint/payload chỉ là đề xuất cho đến khi FE/BE thống nhất, có phiên bản/ngày và người hoặc nhóm tiếp nhận. Bàn giao trước khi đợi Task 9; ghi nhận và đồng bộ các thay đổi contract trong các task sau.

- [ ] Chuyển fixture và mọi consumer sang các ID và mã trạng thái trên; dọn kiểu/caller cũ đã lỗi thời, không duy trì song song TenantInvoice điện/nước riêng.
- [ ] Xây mock store có các fixture Tenant đang ở, đã checkout còn nợ, khách cũ, Bed bảo trì, hợp đồng/phụ lục nhiều kỳ, vé chưa phân công, xe đã thu hồi; cung cấp reset dữ liệu demo có xác nhận.
- [ ] Kiểm tra hai Tenant trùng tên không nhận nhầm dữ liệu; lỗi lệnh mock không thay đổi một phần trạng thái. Thực thi `npm test` sau khi cập nhật các kiểm thử hành vi liên quan.
- [ ] Tách chế độ API/mocks rõ ràng; khi API thất bại hiển thị lỗi/cho thử lại, không thay bằng mock hoặc trả thành công local.

### Task 2 — Xác thực, quyền UI và Technician

**Files:** `src/pages/auth/LoginPage.tsx`, `src/pages/technician/PasswordPage.tsx`, `src/pages/technician/SettingsTab.tsx`, `src/pages/admin/technicians/TechnicianAccountsPage.tsx`, `src/components/` modal đổi mật khẩu hiện có, `src/contexts/AuthContext.tsx`, `src/services/authService.ts`, `src/services/technicianService.ts`, `src/types/auth.ts`.

**Consumes:** User/Staff và mock store từ Task 1. **Produces:** phiên demo theo `userId`, ba role và trạng thái cư trú; các lệnh Technician và mật khẩu theo hợp đồng nghiệp vụ, với adapter API tách biệt.

- [ ] Sửa login một form `Email hoặc CCCD`: Tenant chỉ CCCD 12 chữ số; staff email. Demo có tài khoản cho cả ba role và Tenant checkout; không dùng mật khẩu cố định trong luồng cấp tài khoản mới. Lỗi đăng nhập/quên mật khẩu không tiết lộ tài khoản có tồn tại.
- [ ] Đổi mật khẩu cần mật khẩu cũ/mới/xác nhận, không OTP; thành công mô phỏng đăng xuất lại. Forgot nhập CCCD hoặc email, mô phỏng OTP 6 số, 5 phút, dùng một lần và giới hạn thử; UI phân biệt rõ gửi/không gửi email thật trong mock. Manager hỗ trợ đổi email/cấp lại mật khẩu sau xác minh ngoài hệ thống; không có đổi email Manager hoặc tự đổi email Tenant/Technician.
- [ ] Technician: tìm/lọc, xem/sửa tên/điện thoại/email, tạo mật khẩu ngẫu nhiên chỉ hiện một lần, khóa/kích hoạt. Mock khóa ngăn đăng nhập/phiên demo tiếp theo; không giả vờ chứng minh Redis revoke. Không tự phân công lại ticket.
- [ ] Kiểm tra CCCD Tenant, email staff, email Tenant không đăng nhập, mật khẩu cũ sai, OTP hết hạn/dùng lại, tài khoản bị khóa; bảo đảm không có `student` role. BE xác minh hash, rate-limit, token rotation/revoke, chống dò và RBAC.

### Task 3 — Phòng, giường và mã phòng

**Files:** `src/pages/admin/rooms/*`, `src/utils/roomCalculations.ts`, `src/services/mock/`, `src/services/api/adapters/roomAdapter.ts`, `src/types/room.ts`.

**Consumes:** Room/Bed và các lệnh Task 1. **Produces:** slot được chọn bằng Room ID + Bed ID cho onboarding.

- [ ] Matrix/drawer và tìm kiếm theo tầng/giới tính/mã: đếm trạng thái Bed thật; mẫu số occupancy gồm Bed bảo trì ở Room hoạt động; `AVAILABLE` không gồm bảo trì. Chỉ `AVAILABLE ↔ MAINTENANCE`, chỉ xếp khách từ Bed sẵn sàng, prefill ID vị trí.
- [ ] Form tạo đúng 4/6/8 Bed G01…; tiện nghi số lượng dương; edit khóa tầng/sức chứa. Giá mới chỉ đổi giá tiêu chuẩn; mã/giới tính chỉ đổi nếu không cư trú và không có hợp đồng chiếm chỗ. Mock đổi slot key đồng bộ mà giữ snapshot cũ.
- [ ] Phân biệt xóa phòng tạo nhầm chưa từng có nghiệp vụ với archive và restore; Room archived không hiện trong matrix và không nhận khách, giữ ID/trạng thái Bed. Registry mock giữ mã có lịch sử, cho tái dùng mã cũ chưa có nghiệp vụ sau đổi/xóa hợp lệ.
- [ ] Kiểm tra Bed trùng mã ở hai Room vẫn cập nhật đúng theo ID; phòng bảo trì, archive/restore, phòng có lịch sử, mã đã/không có lịch sử; lỗi cạnh tranh từ BE được hiển thị. BE thực thi uniqueness và atomicity thật.

### Task 4 — Onboarding, hồ sơ, hợp đồng, tài liệu, checkout

**Files:** `src/pages/admin/tenants/TenantsPage.tsx`, `src/pages/admin/contracts/ContractsPage.tsx`, `src/pages/admin/rooms/RoomDetailDrawer.tsx`, `src/services/mock/`, `src/types/tenant.ts`, `src/test/domain.test.ts`.

**Consumes:** Room/Bed selection Task 3 và model Task 1. **Produces:** Tenant/User, Contract/Renewal, Invoice và Bed state thống nhất; contract documents cho Tenant portal.

- [ ] Onboarding chỉ ngày 01 theo giờ cơ sở, tìm CCCD và phân biệt khách mới/khách cũ; cấm giường không sẵn sàng, giới không phù hợp, Tenant/Bed đã có hợp đồng, nợ/chờ xác nhận. Ghi đồng thời hồ sơ User nếu mới, hợp đồng, Bed `OCCUPIED`, invoice tháng đầu hạn 05; hiện mật khẩu sinh ngẫu nhiên đúng một lần và CCCD đăng nhập.
- [ ] Hồ sơ Manager tìm/lọc theo phòng/trạng thái, xem hợp đồng/công nợ/vi phạm theo ID; cho sửa các trường theo bảng FR-06 và xử lý xung đột CCCD/email/giới tính. Tài khoản cũ được tái dùng, không tạo hồ sơ độc lập.
- [ ] Gia hạn trước hết hạn, chỉ khi không có `Nợ`/`Chờ xác nhận`, ngày kết thúc cuối tháng sau hạn cũ; tạo phụ lục từ ngày 01 kế tiếp với giá phòng lúc ký, không sửa giá cũ/hóa đơn. Nếu **phụ lục của hợp đồng hiện hành được ký sau batch hóa đơn ngày 25** nhưng trước khi hết hạn, mô phỏng phát hành bù kỳ tháng tiếp theo đủ điều kiện và chưa có hóa đơn, không trùng (Logical ERD §6 T05). Đây không phải onboarding trễ: không tạo Tenant/Contract mới giữa tháng, không bắt đầu thuê ngoài ngày 01.
- [ ] Checkout xác nhận bàn giao, bắt buộc chọn `AVAILABLE` hoặc `MAINTENANCE` không chọn sẵn; thu hồi cả xe chờ cấp lẫn đã cấp; giữ nguyên trạng thái hóa đơn và lịch sử, không tự giải phóng vì hết hạn. Cho checkout khi còn nợ/chờ.
- [ ] Tài liệu: nhiều file `.jpg/.jpeg/.png/.webp/.pdf/.doc/.docx` tối đa 10 MB/tệp, phân loại và gắn đúng renewal; upload sau, Manager xóa tệp nhầm, Tenant chỉ xem tệp của mình. Áp dụng quy tắc file private chung: object key bền vững; BE kiểm tra JWT/role/quyền sở hữu trước khi cấp URL OCI ký tối đa 15 phút, xin lại khi hết hạn; mock chỉ là lưu trữ demo.
- [ ] Kiểm tra ngày 01/ngày khác, khách cũ còn nợ, xung đột Bed, giá hợp đồng khi giá phòng đổi, phụ lục sau 25, checkout còn nợ và xe chờ cấp, file sai định dạng/giới hạn. BE chịu transaction và concurrent access thật.

### Task 5 — Hóa đơn và thanh toán

**Files:** `src/pages/admin/invoices/InvoicesPage.tsx`, `src/pages/tenant/{TenantInvoicesPage,PaymentProofPanel}.tsx`, `src/components/common/QrCode.tsx`, `src/types/invoice.ts`, `src/services/mock/`.

**Consumes:** Invoice/Contract Task 4. **Produces:** proof, receipt, trạng thái dùng chung cho Manager/Tenant và Task 6.

- [ ] Liệt kê/lọc theo `Nợ`, `Chờ xác nhận`, `Đã thu`; tìm mã, khách, phòng, CCCD, email theo ID; quá hạn là chỉ báo cho `Nợ` có dueOn trước ngày địa phương, không phải status và không gồm `Chờ xác nhận`.
- [ ] Mô phỏng batch ngày 25 00:00 cho tháng tới trong hạn và chưa checkout; retry chỉ bù thiếu theo `(contractId,billingPeriod)`, đúng snapshot giá. Trường hợp **phụ lục hợp đồng hiện hành ký sau batch ngày 25** được bù kỳ tiếp theo đủ điều kiện theo Task 4; không cho onboarding trễ ngày 01 hay thuê giữa tháng. Không giả định browser là scheduler BE; cung cấp thao tác demo xác định thời điểm/fixture và nêu phụ thuộc BE.
- [ ] VietQR dùng payload hợp lệ số tài khoản demo, số tiền và mã invoice; có tải ảnh/copy. Đánh dấu rõ QR demo không dùng trả tiền thật. Gửi file proof thật vào mock, `Nợ → Chờ xác nhận`, chưa tạo receipt; Manager đối soát thủ công và xác nhận `→ Đã thu` hoặc từ chối `→ Nợ`.
- [ ] Minh chứng chuyển khoản áp dụng quy tắc file private chung: object key, BE kiểm tra JWT/role/quyền sở hữu khi cấp URL OCI ký tối đa 15 phút, xin URL mới khi hết hạn; mock không tuyên bố đã thực thi bảo mật OCI.
- [ ] Thu tiền mặt chỉ `Nợ → Đã thu`, hiển thị mã/khách/số tiền trước xác nhận; cả hai cách chỉ tạo tối đa một receipt đúng số tiền và người xác nhận. Không một phần/trả dư/hoàn tiền, không tự xác nhận VietQR. Tenant checkout vẫn xem và gửi proof nợ.
- [ ] Kiểm tra chuyển trạng thái hợp lệ/không hợp lệ, gửi lại sau từ chối, hai lần xác nhận, hóa đơn quá hạn/chờ xác nhận, hóa đơn kỳ cũ được thanh toán muộn; quét/giải mã QR demo để xác nhận payload, không thực hiện chuyển khoản.

### Task 6 — Chi phí, báo cáo và Dashboard

**Files:** `src/pages/admin/financial/FinancialPage.tsx`, `src/utils/financialCalculations.ts`, `src/pages/admin/dashboard/{DashboardPage,DashboardKPIs,DashboardCharts,DashboardInsights}.tsx`, `src/types/invoice.ts`.

**Consumes:** Invoice/Receipt Task 5, ticket completed/parts Task 7, Room/Bed Task 3. **Produces:** bảng tổng hợp thống nhất theo kỳ và báo cáo có thể tải.

- [ ] CRUD chi phí điện/nước/Internet/khác, lọc theo thời gian/loại, chứng từ tùy chọn. Doanh thu chỉ invoice `Đã thu` theo `billingPeriod`; chi phí theo `expenseDate`; vật tư ticket completed theo ngày hoàn thành địa phương; không trùng chi phí, không cộng cọc/phạt.
- [ ] Đổi toàn bộ nhãn thành `Chênh lệch thu – chi ghi nhận`, giải thích không phải lợi nhuận ròng. Xuất `.xlsx` và PDF thực với phạm vi dữ liệu đã chọn; không chỉ toast. Dữ liệu demo được đánh dấu rõ trong file.
- [ ] Dashboard có đúng bốn KPI SRS. **Doanh thu kỳ vọng/đã thu** lấy theo kỳ hóa đơn được chọn và gắn nhãn kỳ đó. **Tỷ lệ lấp đầy**, **công nợ quá hạn** và **số sự cố đang mở** phản ánh trạng thái tại thời điểm xem, có nhãn thời điểm/phạm vi tương ứng; không lọc chúng theo tháng đã chọn. Không gắn trạng thái Bed hôm nay nhãn tháng trước và không thêm yêu cầu lưu snapshot lịch sử ngoài SRS; không thêm KPI thứ năm.
- [ ] Kiểm tra chọn kỳ hóa đơn cũ chỉ đổi KPI doanh thu, không đổi hoặc gắn nhãn kỳ cũ cho ba KPI trạng thái hiện tại; invoice tháng cũ thu tháng mới, chi phí khác tháng, ticket chưa/đã hoàn thành, bảo trì trong mẫu số và invoice chờ xác nhận không tính nợ quá hạn. Mở hai file xuất và kiểm tra nội dung/số liệu.

### Task 7 — Sự cố, kỹ thuật và vi phạm

**Files:** `src/pages/admin/incidents/IncidentsPage.tsx`, `src/pages/tenant/ReportPage.tsx`, `src/pages/technician/{TechnicianPage,TicketListPage,TicketDetailPage}.tsx`, `src/types/incident.ts`, `src/services/mock/`.

**Consumes:** User/Tenant/Staff Task 1–2. **Produces:** ticket/parts/violation và sự kiện notification cho Task 6, 8.

- [ ] Tenant đang cư trú tạo phiếu cá nhân, chọn đúng sáu loại và ba ưu tiên, mô tả/ảnh; Room theo cư trú, Bed có thể không có. Trạng thái ban đầu chưa phân công, danh sách chỉ theo reporter ID.
- [ ] Manager phân công Technician đang hoạt động, đổi ưu tiên/hạn hoặc phân công lại trước hoàn thành. Technician chỉ thấy phiếu hiện được giao; chưa hoàn thành trước, ưu tiên giảm dần, cùng mức tạo sớm trước; không còn quyền với phiếu đã chuyển người.
- [ ] Technician bắt đầu rồi hoàn thành, nhập kết quả, ảnh nghiệm thu, 0..N vật tư tên/số lượng/đơn giá; tổng tự tính, không vật tư = 0. Không mở lại/nghiệm thu nhiều cấp; lưu file demo thực thay boolean.
- [ ] Ảnh hiện trường và nghiệm thu áp dụng quy tắc file private chung: object key bền vững, BE kiểm tra JWT/role/quyền sở hữu trước URL OCI ký tối đa 15 phút và cấp lại khi hết hạn; mock chỉ minh họa.
- [ ] Manager chọn Tenant đang cư trú, nhập ngày, một trong sáu loại, hình thức/số tiền khi phạt; lưu vi phạm theo ID, tạo notification cá nhân. Không bắt Room, không tạo invoice/payment cho tiền phạt.
- [ ] Kiểm tra hai Tenant cùng phòng, đổi assignee, sắp thứ tự đồng mức, hoàn thành không vật tư, chưa đủ ảnh/kết quả, vi phạm sau checkout bị từ chối và phạt không tạo nợ.

### Task 8 — Portal Tenant, xe và thông báo

**Files:** `src/pages/tenant/{TenantPortalPage,RoomPage,TenantVehiclesPage,NotificationsDrawer,tenantConstants,RequestModal}.tsx`, `src/pages/admin/vehicles/VehiclesPage.tsx`, `src/App.tsx`.

**Consumes:** phiên Task 2, Contract Task 4, Invoice Task 5, Ticket/Violation Task 7. **Produces:** portal tương tác nhất quán theo ID, bao gồm trường hợp checkout.

- [ ] Bốn tab đúng SRS, inbox riêng không phải tab thứ năm; bỏ entry chuyển phòng và yêu cầu ngoài Phase 1. Tenant đang ở thấy phòng/giường/hạn/công nợ, người cùng phòng chỉ họ tên/mã Bed. Tenant checkout không thấy phòng cũ/bạn cùng phòng, vẫn vào hợp đồng/tài liệu/hóa đơn/vi phạm/thông báo và gửi proof nợ.
- [ ] Hồ sơ Tenant chỉ sửa SĐT/địa chỉ/liên hệ khẩn cấp; định danh/email chỉ xem và liên hệ Manager. Không hiển thị dữ liệu người khác khi hai người trùng tên hoặc cùng phòng.
- [ ] Xe: năm loại SRS, hai ảnh và biển bắt buộc với ba loại xe có đăng ký, tùy chọn cho xe đạp/xe đạp điện không đăng ký; chỉ một xe chưa thu hồi; cấp mã duy nhất trong xe chưa thu hồi, thu hồi rồi tái dùng được; giữ lịch sử, không xóa/ghi đè. Checkout chặn đăng ký mới.
- [ ] Ảnh hai mặt giấy đăng ký xe áp dụng quy tắc file private chung: object key bền vững, BE kiểm tra JWT/role/quyền sở hữu trước URL OCI ký tối đa 15 phút và cấp lại khi hết hạn; mock chỉ minh họa.
- [ ] Inbox nhận sự kiện hóa đơn/nhắc nợ/xác nhận/từ chối/vi phạm, đọc theo Tenant ID, giữ lịch sử sau checkout; không Manager soạn hoặc tin sinh hoạt mới sau checkout. Không làm SMS/Zalo/push/email nghiệp vụ.
- [ ] Kiểm tra từng trạng thái cư trú, hai Tenant cùng tên, đăng ký xe khi có xe chờ, thu hồi rồi đăng ký lại, trùng/tái dùng thẻ và quyền xem thông báo/vi phạm riêng.

### Task 9 — Contract FE/BE, kiểm chứng và bàn giao

**Files:** `docs/API_INTEGRATION_PLAN.md`, `README.md`, các file adapter và tài liệu liên quan được thay đổi khi triển khai.

- [ ] Đối chiếu từng FR và BR trong hai ma trận trên với mã cuối và checklist nghiệm thu; mọi FR Phase 1 có đường đi, trạng thái, lỗi, quyền và fixture; FR-11 không có điểm vào Phase 1.
- [ ] Tổng hợp, cập nhật và nghiệm thu **contract sơ bộ đã bàn giao từ Task 1** theo từng module: ID, trường, enum, request/response mẫu, validation error, quyền, trạng thái, quan hệ và lịch sử thay đổi; endpoint cụ thể là **đề xuất chờ BE thống nhất**, không coi API hiện có là phù hợp chỉ vì trùng tên. Nêu trách nhiệm BE: transaction/concurrency, lịch/billing retry, quyền và thu hồi token, OTP/email, đối soát thủ công và báo cáo.
- [ ] Nghiệm thu contract file private chung cho hợp đồng, ảnh giấy xe, minh chứng thanh toán, ảnh hiện trường và ảnh nghiệm thu: object key thay URL cố định; BE kiểm tra JWT/role/quyền sở hữu trước khi cấp URL OCI ký tối đa 15 phút; xử lý xin URL mới sau hết hạn. Với mock kiểm tra hành vi UI bằng tình huống mô phỏng; chỉ nghiệm thu quyền/OCI thật khi có BE và môi trường tích hợp.
- [ ] Ghi rõ API mode hiện thực đến đâu; không cung cấp fallback mock âm thầm cho lỗi API. Không yêu cầu reset DB hay sửa BE trong công việc UI này.
- [ ] Chạy `npm test`, `npx tsc --noEmit`, `npm run build`. Chạy ứng dụng mock, xác minh trên browser desktop và mobile/tablet: login từng role; tạo Room → onboarding → invoice đầu → proof/duyệt → gia hạn → checkout còn nợ → Tenant cũ gửi proof; xe và thẻ; sự cố → phân công → hoàn thành; vi phạm → inbox; báo cáo/xuất file. Dùng fixture/đồng hồ demo để kiểm tra ngày 01/25, không phụ thuộc ngày thực.
- [ ] Kiểm tra responsive, tương tác bàn phím, tên control/focus, trạng thái loading/error/empty; ghi kết quả và các giới hạn chưa xác minh. Xác minh file xuất/QR bằng cách đọc/giải mã, không chỉ kiểm tra nút/toast.
- [ ] Cập nhật hướng dẫn chạy/reset, dữ liệu demo, danh sách hành vi mô phỏng, việc FE/BE phải hoàn thiện khi tích hợp và các kết quả đã kiểm chứng. Không tuyên bố an ninh, concurrency, OCI, Redis, email hoặc NFR đã đạt chỉ từ prototype.

## Điều kiện hoàn thành

1. Toàn bộ FR Phase 1 và BR trong ma trận có UI/luồng mock tương tác đúng hành vi đã mô tả; dữ liệu xuyên role và sau chuyển trạng thái nhất quán. Không có chức năng ngoài Phase 1 được trình bày là khả dụng.
2. Từng bước kiểm tra ở Task 9 thực hiện được; mọi lỗi và khác biệt không giải quyết phải ghi rõ, không đánh dấu hoàn thành giả.
3. FE nhận được mã prototype, hướng dẫn và contract; BE nhận được danh sách invariant/transaction/permission cần thực thi. Tích hợp BE thật và nghiệm thu NFR là các cổng kiểm chứng riêng, không mặc định đã đạt khi bàn giao prototype.
