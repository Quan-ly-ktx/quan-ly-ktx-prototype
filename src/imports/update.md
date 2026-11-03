# CẬP NHẬT ĐẶC TẢ UI/UX - HỆ THỐNG KTX (FEEDBACK LATEST)

Tài liệu này ghi nhận các thay đổi về luồng nghiệp vụ và giao diện (UI/UX) dựa trên yêu cầu mới nhất từ Leader, áp dụng cho cả phân hệ Quản lý và Sinh viên.

## 1. THAY ĐỔI LUỒNG ĐĂNG KÝ CỦA SINH VIÊN (STU-01)
Luồng đăng ký giữ chỗ trực tuyến của sinh viên sẽ được thiết kế lại hoàn toàn. Sinh viên sẽ được chủ động chọn phòng và giường ngay từ đầu thay vì chỉ gửi nguyện vọng.

**Luồng UI/UX mới (3 bước):**
*   **Bước 1 - Nhập thông tin cá nhân:** Bao gồm các trường bắt buộc: `Trường Đại học`, `CCCD`, `Số điện thoại`, `Giới tính`, `Email`. (Lưu ý: Không yêu cầu MSSV).
*   **Bước 2 - Chọn không gian lưu trú:** Hiển thị danh sách các phòng còn trống (phù hợp với Giới tính đã nhập ở Bước 1). Sau khi click chọn Phòng, hiển thị tiếp sơ đồ để chọn **Giường cụ thể** (VD: Chọn P.302 -> Chọn Giường G02).
*   **Bước 3 - Xác nhận:** Xem lại thông tin và bấm [Đăng ký thành công].

## 2. CẬP NHẬT PHÂN HỆ SINH VIÊN (STUDENT PORTAL)
*   **Bổ sung Tab Hóa đơn:** Thêm một tab/menu "Hóa đơn" riêng biệt trên thanh điều hướng của Sinh viên. Tab này hiển thị lịch sử các hóa đơn tiền phòng, tiền cọc, trạng thái thanh toán (Đã nộp/Nợ) để sinh viên dễ dàng theo dõi.
*   **Sửa đổi Form Báo hỏng (STU-05):** Trong biểu mẫu gửi yêu cầu sửa chữa sự cố, **LOẠI BỎ hoàn toàn** mục chọn "Mức độ khẩn cấp" (Thường / Cao / Khẩn cấp). Form chỉ giữ lại Loại sự cố, Mô tả và Hình ảnh đính kèm.

## 3. CẬP NHẬT PHÂN HỆ QUẢN LÝ (ADMIN PORTAL)
*   **Màn hình Quản lý Sự cố (ADM-10):** Tương tự như bên sinh viên, **LOẠI BỎ** các thẻ/badge phân loại mức độ khẩn cấp (Khẩn cấp, Cao, Thường) trên tất cả các ticket báo cáo sự cố (của cả danh sách chờ xử lý và đang xử lý).
*   **Màn hình Cài đặt & Phân quyền:** Trong form Thêm/Sửa nhân sự, **BỎ phần phân quyền chức năng** (các checkbox tick chọn quyền như: Xem bảng điều khiển, Quản lý phòng...). Chỉ cần giữ lại form tạo tài khoản và dropdown phân Vai trò (Role) cơ bản (VD: Quản lý / Kỹ thuật viên).

---
**Lưu ý cho Figma Make AI:**
Hãy tự động rà soát tất cả các component liên quan đến Ticket Sự cố để xóa bỏ badge "Mức độ". Ở form đăng ký, hãy đảm bảo luồng prototype cho phép click chuyển từ màn hình nhập thông tin sang màn hình chọn phòng/giường và không được yêu cầu nhập MSSV.