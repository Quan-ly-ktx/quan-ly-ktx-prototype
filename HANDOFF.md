# Handoff — Narrow Task 1: nền tảng domain và mock

## Mục tiêu và phạm vi

Hoàn tất Narrow Task 1 của prototype KTX Hub theo `docs/SRS.md` v3.2 Final, `docs/Conceptual-ERD.md` v3.4 Final, `docs/Logical-ERD.md` v3.5 Final và `docs/superpowers/plans/2026-11-09-srs-3-2-ui-refactor.md`.

Người dùng đã yêu cầu **Freeze Scope & Stabilize**: chỉ hoàn tất vòng tích hợp và sửa lỗi chặn Task 1, kiểm tra, sau đó dừng và báo cáo. Không tự chuyển sang Task 2–8 hoặc mở thêm vòng refactor.

## Ràng buộc

- Giữ nguyên thay đổi hiện có. Không tự ý xóa thêm file; không khôi phục hoặc xóa vĩnh viễn `AGENTS.md` và `docs/screens/**` đang ở trạng thái deleted.
- Không commit, push, reset, clean hoặc thực hiện thao tác Git phá hủy dữ liệu. Không sửa Backend, Flyway hay Database.
- Không phát triển tiếp UI/workflow Task 2–8. Chỉ sửa consumer để tương thích model, loại quan hệ sai bằng tên/ID hoặc sửa lỗi build.
- Domain model và service signatures đã được freeze sau tích hợp; chỉ điều chỉnh khi có lỗi nghiêm trọng về quan hệ ID, nhất quán dữ liệu, typecheck hoặc build.
- Không tác động localStorage/dữ liệu trình duyệt thực của người dùng khi kiểm tra reset; dùng storage giả cô lập.
- Không tuyên bố `TASK 1 READY` nếu chưa có bằng chứng cho mọi điều kiện dừng.

## Trạng thái tích hợp

- Các phần ModelCore, SharedStores và ConsumerCompat đã được tích hợp; không còn subagent chạy theo handoff trước.
- Một mock snapshot tại `src/services/mock/mockStore.ts`, key `dorm_mock_snapshot_v2`, gồm rooms, tenants, contracts, invoices, vehicles, tickets, accounts, staff, violations, notifications và expenses. `updateMockSnapshot` ghi storage trước khi cập nhật memory; subscriber được gọi qua microtask.
- Migration legacy được thiết kế fail-closed khi thiếu ID quan hệ hoặc ID trùng nhưng khác nội dung; key cũ được giữ. Cần đối chiếu bằng chứng hành vi độc lập trước khi khẳng định hoàn tất.
- `Tenant.userId`, `Bed.roomId`, `Contract.tenantId/bedId`, `Invoice.contractId/billingPeriod`, `Ticket.reporterTenantId/roomId` là các quan hệ bắt buộc; `Ticket.bedId/assigneeStaffId` tùy chọn. `docs/API_INTEGRATION_PLAN.md` đã nêu hợp đồng dữ liệu và trách nhiệm BE.
- API mode không âm thầm fallback sang mock; endpoint chưa thống nhất trả lỗi unsupported. Chưa chứng minh BE thật hỗ trợ các endpoint đó.
- Các named command chính: `issueInvoices`, `submitInvoiceProof`, `rejectInvoiceProof`, `confirmInvoiceProof`, `confirmPayment`, `registerVehicle`, `issueVehicleCard`, `revokeVehicle`. Không dùng `saveInvoices`/`saveVehicles` ghi đè mảng.
- Một số ID fixture legacy vẫn theo dạng `NT-*`, `RM-*`, `SC-*`; giữ nguyên để tránh thay định danh dữ liệu cũ. Bed, Contract và fixture bổ sung dùng UUID ổn định.
- Các thay đổi Task 2–8 đã có từ trước chưa được nghiệm thu; không tự phát triển hoặc xóa chúng trong vòng này.

## Cập nhật gần nhất

- Sửa `src/utils/invoiceOwnership.ts` và consumer `src/pages/tenant/TenantPortalPage.tsx` để xác định quyền xem hóa đơn qua `Invoice.contractId → Contract.tenantId`, không tin `Invoice.tenantId` hiển thị. Test cùng tên và `tenantId` sai đã fail trước và pass sau sửa.
- Test Ticket bổ sung trường hợp thiếu reporter/room; test reset demo dùng storage giả cô lập; các test payment, service và fixture được cập nhật theo model/signature hiện tại.
- `src/test/contractLifecycle.test.ts` được bổ sung các collection rỗng còn thiếu trong fixture `MockSnapshot` để typecheck.

## Bằng chứng kiểm tra

- `npm test`: **96 passed, 0 failed**, chạy trước thay đổi cuối chỉ bổ sung collection rỗng vào fixture. Node cảnh báo experimental localStorage.
- Sau thay đổi fixture cuối: `node --test src/test/contractLifecycle.test.ts`: **4 passed**; `npx tsc --noEmit`: **thành công**.
- `npm run build`: **thành công** trước thay đổi fixture cuối; Vite cảnh báo chunk JS khoảng **2,65 MB**.
- Test ownership độc lập: fail trước sửa khi hóa đơn mang `tenantId` sai bị lộ; pass sau sửa.
- Chưa có smoke test UI thực tế cho ba role và reset có xác nhận. Chưa kiểm chứng độc lập đầy đủ migration fail-closed. Không suy luận Task 1 hoàn tất chỉ từ test/build.

## Việc còn lại

1. Đối chiếu điều kiện dừng Task 1 với mã và bằng chứng hiện có, nhất là migration/reset, quan hệ Ticket/Bed/Room, actor Technician được giao, consumer ba role và API không fallback. Chỉ sửa lỗi thực sự chặn Task 1; không mở rộng phạm vi.
2. Nếu cần, smoke test bằng storage/profile cô lập, không ghi đè dữ liệu người dùng. Kiểm tra cụ thể reset có xác nhận trên UI nếu có môi trường phù hợp.
3. Nếu cần bằng chứng đồng thời sau thay đổi fixture cuối, chạy lại `npm test`, `npx tsc --noEmit`, `npm run build`; không lặp vô hạn.
4. Kiểm tra trạng thái bằng `git status --short --untracked-files=all` và `git diff --stat` chỉ để báo cáo; không reset, clean, restore, commit hoặc push. Checkpoint cũ ghi 23 tracked deleted, nhưng con số cuối chưa được xác minh lại.
5. Báo cáo từng hạng mục Task 1 là DONE/PARTIAL/BLOCKED, kiểm tra đã chạy, giới hạn còn lại, Task 2–8 chưa nghiệm thu và khả năng handoff; sau đó dừng.

## File chính

`src/types/{auth,room,tenant,invoice,incident}.ts`; `src/services/dormService.ts`; `src/services/api/apiDormService.ts`; `src/services/mock/{mockStore,mockDormService,contractLifecycle,mockData,mockAuth,incidentStore}.ts`; `src/services/technicianService.ts`; `src/contexts/DormDataContext.tsx`; `src/App.tsx`; `src/utils/{roomCalculations,invoiceOwnership}.ts`.
