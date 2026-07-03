# FUNCTION.md — AGRI PASSPORT SaaS: Đặc tả chức năng, Mobile UX & Checklist Testing

> Phiên bản: V1.0  
> Phạm vi: Web SaaS mobile-first, không làm app native.  
> Stack đã chốt: Next.js + NestJS + PostgreSQL + Prisma + Redis + Docker + Cloudflare R2/CDN.  
> Mục tiêu: Làm rõ toàn bộ chức năng hệ thống, cách bố trí giao diện tối ưu trên mobile, checklist validation/test/deploy để đảm bảo quy trình phát triển phần mềm chặt chẽ.

---

# 1. Mục tiêu file FUNCTION.md

File này dùng làm tài liệu trung tâm cho đội phát triển, tester và người nghiệm thu.

Mục tiêu:

- Mô tả đầy đủ chức năng của hệ thống Agri Passport.
- Phân chia chức năng theo từng nhóm người dùng.
- Định nghĩa cách bố trí màn hình để dễ dùng trên mobile.
- Liệt kê checklist validation từng form.
- Liệt kê checklist testing backend, frontend, E2E.
- Làm căn cứ nghiệm thu từng module.
- Đảm bảo hệ thống phát triển đúng hướng SaaS thu phí theo HTX.

---

# 2. Nguyên tắc chức năng tổng thể

## 2.1. Web-only, mobile-first

Hệ thống chỉ triển khai dưới dạng website.

Không làm:

- App Android native.
- App iOS native.
- Desktop app.

Nhưng giao diện website phải đạt cảm giác sử dụng như app:

- Tải nhanh.
- Nút rõ.
- Form dễ nhập.
- Trượt mượt.
- Có bottom navigation trên mobile.
- Có skeleton loading.
- Có toast thông báo.
- Có trạng thái loading/error/empty.
- Giao diện 360px vẫn dùng tốt.

## 2.2. SaaS theo HTX

Hệ thống được thiết kế cho nhiều HTX dùng chung một nền tảng.

Mỗi HTX có:

- Thông tin riêng.
- Thành viên riêng.
- Sản phẩm riêng.
- Vùng trồng riêng.
- Nhật ký sản xuất riêng.
- QR Passport riêng.
- Gói dịch vụ riêng.
- Hóa đơn riêng.

Super Admin có thể:

- Tạo HTX.
- Gán gói cho HTX.
- Gia hạn/hủy gói.
- Xem báo cáo tổng.
- Quản lý toàn bộ hệ thống.

## 2.3. Bản đầu chưa khóa tính năng theo gói

Ở MVP:

- Vẫn có gói Free, Basic, Pro, Enterprise.
- Admin vẫn quản lý gói và hóa đơn.
- HTX có trạng thái gói.
- Nhưng chưa cần chặn tính năng theo gói.

Sau MVP có thể bật:

- Giới hạn số sản phẩm.
- Giới hạn số thành viên.
- Giới hạn số QR.
- Giới hạn báo cáo.
- Giới hạn dung lượng file.

---

# 3. Nhóm người dùng và quyền tổng quan

## 3.1. Super Admin

Người quản lý toàn hệ thống.

Chức năng chính:

- Quản trị hệ thống.
- Quản lý HTX.
- Quản lý người dùng.
- Quản lý gói dịch vụ.
- Gán gói cho HTX.
- Quản lý hóa đơn.
- Xem báo cáo tổng.
- Cấu hình hệ thống.
- Xem nhật ký hệ thống.
- Sao lưu/khôi phục.

## 3.2. Admin HTX

Người quản lý một HTX cụ thể.

Chức năng chính:

- Quản lý thông tin HTX.
- Quản lý thành viên HTX.
- Quản lý nông dân.
- Quản lý sản phẩm.
- Quản lý vùng trồng.
- Quản lý nhật ký canh tác.
- Quản lý hồ sơ truy xuất.
- Tạo QR Passport.
- Xem báo cáo HTX.
- Theo dõi gói đang dùng.

## 3.3. Thành viên HTX

Người làm nghiệp vụ trong HTX.

Chức năng chính:

- Tạo/sửa sản phẩm nếu được cấp quyền.
- Nhập nhật ký canh tác.
- Upload ảnh minh chứng.
- Xem vùng trồng.
- Xem QR Passport.
- Theo dõi thông báo.

## 3.4. Nông dân

Người trực tiếp sản xuất.

Chức năng chính:

- Cập nhật thông tin cá nhân.
- Xem sản phẩm/vùng trồng được gán.
- Ghi nhật ký sản xuất.
- Upload ảnh minh chứng.
- Nhận thông báo/nhắc việc.
- Xem hướng dẫn canh tác.

## 3.5. Người mua

Người dùng public hoặc khách hàng.

Chức năng chính:

- Xem sản phẩm.
- Quét QR Passport.
- Xem truy xuất nguồn gốc.
- Xem chứng nhận.
- Theo dõi đơn hàng nếu có.
- Đánh giá sản phẩm nếu bật tính năng.

---

# 4. Sơ đồ phân cấp chức năng chi tiết

## 4.1. Quản trị hệ thống — Super Admin

### 4.1.1. Quản lý tài khoản

Chức năng:

- Danh sách tài khoản.
- Tạo tài khoản.
- Sửa tài khoản.
- Xóa/khóa tài khoản.
- Khóa/mở khóa tài khoản.
- Đổi mật khẩu.
- Phân quyền.
- Gán HTX cho tài khoản.
- Xem lịch sử đăng nhập.
- Xem lịch sử hoạt động.

Mobile UX:

- Danh sách tài khoản hiển thị dạng card.
- Có ô tìm kiếm cố định phía trên.
- Filter theo vai trò/trạng thái.
- Nút “Thêm tài khoản” đặt dạng floating action button.
- Trạng thái khóa/mở hiển thị bằng badge màu.
- Menu hành động dùng bottom sheet.

Validation:

- Email bắt buộc và đúng định dạng.
- Email không trùng.
- Tên người dùng bắt buộc.
- Mật khẩu tối thiểu 8 ký tự.
- Vai trò bắt buộc.
- Nếu là Admin HTX/Thành viên/Nông dân thì cần chọn HTX.
- Không cho xóa tài khoản Super Admin cuối cùng.

Testing:

- Tạo tài khoản hợp lệ.
- Tạo tài khoản thiếu email.
- Tạo tài khoản email sai.
- Tạo tài khoản email trùng.
- Khóa tài khoản.
- Tài khoản bị khóa không đăng nhập được.
- Super Admin không thể tự xóa chính mình.
- Người không có quyền không truy cập được module.

---

### 4.1.2. Quản lý vai trò

Chức năng:

- Danh sách vai trò.
- Tạo vai trò.
- Sửa vai trò.
- Xóa vai trò.
- Gán quyền cho vai trò.
- Xem người dùng thuộc vai trò.

Vai trò mặc định:

- SUPER_ADMIN.
- ADMIN_HTX.
- MEMBER_HTX.
- FARMER.
- BUYER.

Mobile UX:

- Vai trò hiển thị thành card.
- Quyền hiển thị theo nhóm accordion.
- Có nút tick chọn tất cả theo nhóm.
- Cảnh báo khi chỉnh vai trò quan trọng.

Validation:

- Tên vai trò bắt buộc.
- Slug vai trò không trùng.
- Không cho xóa vai trò hệ thống mặc định.
- Không cho bỏ quyền quản trị khỏi Super Admin nếu gây mất quyền truy cập.

Testing:

- Tạo vai trò mới.
- Gán quyền.
- Bỏ quyền.
- Role guard hoạt động đúng.
- User không có permission bị trả 403.

---

### 4.1.3. Quản lý quyền

Chức năng:

- Danh sách quyền.
- Nhóm quyền theo module.
- Xem quyền chi tiết.
- Gán quyền cho vai trò.
- Đồng bộ quyền mặc định khi deploy.

Nhóm quyền mẫu:

- users.read/create/update/delete.
- cooperatives.read/create/update/delete.
- products.read/create/update/delete.
- zones.read/create/update/delete.
- farming_logs.read/create/update/delete.
- passports.read/create/update/delete.
- subscription_plans.read/create/update/delete.
- invoices.read/create/update/delete.

Testing:

- Kiểm tra mỗi route có guard.
- Kiểm tra quyền đúng trả 200.
- Kiểm tra thiếu quyền trả 403.
- Kiểm tra token sai trả 401.

---

### 4.1.4. Cấu hình hệ thống

Chức năng:

- Thông tin hệ thống.
- Cấu hình tên website/logo.
- Cấu hình email.
- Cấu hình Cloudflare R2.
- Cấu hình thanh toán thủ công.
- Cấu hình bảo mật.
- Cấu hình thông báo.
- Cấu hình backup.

Mobile UX:

- Chia thành từng tab nhỏ.
- Mỗi nhóm cấu hình là card riêng.
- Với secret/key, mặc định che nội dung.
- Có nút test connection.

Validation:

- URL đúng định dạng.
- Email đúng định dạng.
- File logo đúng MIME.
- Không lưu secret rỗng nếu đang bật dịch vụ.
- CORS origin hợp lệ.

Testing:

- Lưu cấu hình hợp lệ.
- Lưu cấu hình sai URL.
- Upload logo sai định dạng.
- Test R2 connection thành công/thất bại.

---

### 4.1.5. Nhật ký hệ thống

Chức năng:

- Nhật ký đăng nhập.
- Nhật ký tạo/sửa/xóa dữ liệu.
- Nhật ký lỗi.
- Nhật ký phân quyền.
- Nhật ký thanh toán.
- Tìm kiếm/lọc theo user, hành động, thời gian.

Mobile UX:

- Hiển thị timeline.
- Mỗi log là một card.
- Có filter nhanh: Hôm nay, 7 ngày, 30 ngày.
- Có icon theo loại hành động.

Testing:

- Tạo sản phẩm sinh audit log.
- Sửa HTX sinh audit log.
- Mark paid hóa đơn sinh audit log.
- User thường không xem được audit log toàn hệ thống.

---

### 4.1.6. Sao lưu và khôi phục

Chức năng:

- Xem danh sách bản backup.
- Tạo backup thủ công.
- Tải backup.
- Cấu hình backup tự động.
- Khôi phục dữ liệu theo quyền Super Admin.

Mobile UX:

- Không ưu tiên thao tác restore trên mobile.
- Restore cần xác nhận 2 bước.
- Hiển thị cảnh báo rõ ràng.

Testing:

- Tạo backup thành công.
- Backup file tồn tại.
- Restore chỉ Super Admin được thực hiện.
- Không cho restore khi chưa xác nhận.

---

## 4.2. Quản lý thành viên và RBAC

### 4.2.1. Quản lý người dùng trong HTX

Chức năng:

- Danh sách người dùng thuộc HTX.
- Thêm người dùng.
- Gán vai trò.
- Cập nhật thông tin.
- Khóa/ngừng hoạt động.
- Đặt lại mật khẩu.
- Xem hoạt động.

Mobile UX:

- Danh sách thành viên dạng card.
- Tìm kiếm theo tên/số điện thoại.
- Filter theo vai trò.
- Hành động nhanh: gọi điện, nhắn tin, khóa tài khoản.

Validation:

- Tên bắt buộc.
- Số điện thoại hợp lệ.
- Email hợp lệ nếu có.
- Vai trò bắt buộc.
- Không cho Admin HTX tạo Super Admin.
- Không cho thành viên HTX xem HTX khác.

Testing:

- Admin HTX tạo thành viên.
- Admin HTX không tạo Super Admin.
- Thành viên HTX A không xem được HTX B.
- Khóa user thì user không đăng nhập được.

---

### 4.2.2. Phân quyền theo HTX

Chức năng:

- Gán vai trò trong phạm vi HTX.
- Gán quyền tùy chỉnh cho thành viên.
- Xem quyền hiện tại.
- Thu hồi quyền.

Quy tắc:

- Quyền trong HTX không ảnh hưởng HTX khác.
- Một user có thể thuộc nhiều HTX trong tương lai.
- MVP có thể mỗi user thuộc một HTX chính.

Testing:

- User HTX A chỉ thấy dữ liệu HTX A.
- Super Admin thấy tất cả.
- Admin HTX có quyền quản lý thành viên trong HTX.
- Thành viên không có quyền không sửa được sản phẩm.

---

### 4.2.3. Quản lý nhóm

Chức năng:

- Tạo nhóm.
- Thêm thành viên vào nhóm.
- Gán quyền cho nhóm.
- Xóa nhóm.

Ứng dụng:

- Nhóm sản xuất.
- Nhóm kiểm định.
- Nhóm bán hàng.
- Nhóm vận hành.

Mobile UX:

- Nhóm dạng list card.
- Click vào nhóm để xem thành viên.
- Thêm thành viên bằng search select.

Testing:

- Tạo nhóm.
- Thêm thành viên.
- Xóa thành viên khỏi nhóm.
- Quyền nhóm áp dụng đúng.

---

## 4.3. Quản lý HTX

### 4.3.1. Danh sách HTX

Chức năng:

- Xem danh sách HTX.
- Tìm kiếm HTX.
- Lọc theo trạng thái.
- Lọc theo gói dịch vụ.
- Xem nhanh số thành viên/sản phẩm/vùng trồng.

Mobile UX:

- Dạng card.
- Mỗi card có:
  - Tên HTX.
  - Mã HTX.
  - Gói hiện tại.
  - Trạng thái.
  - Số sản phẩm.
  - Nút xem chi tiết.
- Có search bar sticky.

Testing:

- Super Admin xem danh sách tất cả HTX.
- Admin HTX chỉ xem HTX mình.
- Filter theo gói đúng.
- Search đúng.

---

### 4.3.2. Thêm HTX

Form fields:

- Tên HTX.
- Mã HTX.
- Mã số thuế.
- Số điện thoại.
- Email.
- Địa chỉ.
- Tỉnh/thành.
- Quận/huyện.
- Xã/phường.
- Người đại diện.
- Trạng thái.

Mobile UX:

- Chia form thành 3 bước:
  1. Thông tin cơ bản.
  2. Địa chỉ.
  3. Người đại diện & xác nhận.
- Có thanh tiến trình.
- Có nút lưu nháp nếu cần.

Validation:

- Tên HTX bắt buộc.
- Mã HTX bắt buộc và duy nhất.
- SĐT đúng định dạng Việt Nam.
- Email đúng định dạng nếu nhập.
- Mã số thuế không trùng nếu nhập.
- Địa chỉ bắt buộc.
- Trạng thái hợp lệ.

Testing:

- Tạo HTX hợp lệ.
- Tên rỗng báo lỗi.
- Mã HTX trùng báo lỗi.
- Email sai báo lỗi.
- SĐT sai báo lỗi.
- Tạo HTX sinh audit log.

---

### 4.3.3. Chi tiết HTX

Chức năng:

- Xem thông tin HTX.
- Xem gói đang dùng.
- Xem thành viên.
- Xem sản phẩm.
- Xem vùng trồng.
- Xem báo cáo nhanh.
- Chỉnh sửa thông tin.
- Khóa/ngừng hoạt động.

Mobile UX:

- Header card: tên HTX + badge trạng thái.
- Tab ngang cuộn:
  - Tổng quan.
  - Thành viên.
  - Sản phẩm.
  - Vùng trồng.
  - Gói dịch vụ.
  - Hóa đơn.
- Số liệu quan trọng hiển thị bằng mini cards.

Testing:

- Xem chi tiết đúng.
- Sửa thông tin đúng.
- Ngừng hoạt động HTX.
- HTX ngừng hoạt động bị hạn chế đăng nhập nếu cấu hình bật.

---

### 4.3.4. Cấp nhật HTX

Validation giống thêm HTX.

Testing:

- Sửa tên HTX.
- Sửa địa chỉ.
- Không cho sửa mã HTX trùng.
- Admin HTX chỉ sửa HTX của mình.

---

### 4.3.5. Xóa/ngừng hoạt động HTX

MVP khuyến nghị không hard delete.

Dùng trạng thái:

- ACTIVE.
- INACTIVE.
- SUSPENDED.
- ARCHIVED.

Validation:

- Không xóa cứng HTX có dữ liệu.
- Ngừng hoạt động cần lý do.
- Super Admin mới được suspend HTX.

Testing:

- Suspend HTX thành công.
- Admin HTX không tự xóa HTX nếu không có quyền.
- Dữ liệu HTX archived không hiển thị public.

---

### 4.3.6. Phân quyền HTX

Chức năng:

- Gán Admin HTX.
- Gán thành viên.
- Gán vai trò.
- Xem quyền HTX.

Testing:

- Gán admin thành công.
- Admin mới đăng nhập thấy dashboard HTX.
- User bị gỡ khỏi HTX không xem được dữ liệu cũ.

---

### 4.3.7. Thống kê HTX

Chỉ số:

- Tổng sản phẩm.
- Tổng vùng trồng.
- Tổng nhật ký.
- Tổng QR Passport.
- Lượt xem QR.
- Gói đang dùng.
- Ngày hết hạn.
- Hóa đơn chưa thanh toán.

Mobile UX:

- Top 4 chỉ số quan trọng dạng card 2 cột.
- Biểu đồ đơn giản, không quá dày.
- Có lọc thời gian.

Testing:

- Số liệu đúng theo DB.
- Filter thời gian đúng.
- User khác HTX không xem được.

---

## 4.4. Quản lý nông dân

### 4.4.1. Danh sách nông dân

Chức năng:

- Xem danh sách.
- Tìm kiếm.
- Lọc theo vùng trồng.
- Lọc theo trạng thái.
- Xuất dữ liệu.

Mobile UX:

- Dạng card có avatar/tên/số điện thoại/vùng trồng.
- Có nút gọi nhanh.
- Filter dạng bottom sheet.

Testing:

- Danh sách đúng HTX.
- Search đúng.
- Filter đúng.

---

### 4.4.2. Thêm nông dân

Fields:

- Họ tên.
- Số điện thoại.
- CCCD/CMND.
- Địa chỉ.
- Ảnh đại diện.
- Vùng trồng phụ trách.
- Trạng thái.

Validation:

- Họ tên bắt buộc.
- SĐT hợp lệ.
- CCCD hợp lệ nếu nhập.
- Ảnh đúng định dạng.
- Vùng trồng phải thuộc cùng HTX.

Testing:

- Tạo nông dân hợp lệ.
- SĐT sai báo lỗi.
- Vùng trồng khác HTX báo 403.
- Upload ảnh sai định dạng báo lỗi.

---

### 4.4.3. Cập nhật nông dân

Chức năng:

- Cập nhật thông tin.
- Cập nhật liên hệ.
- Cập nhật ảnh.
- Gán vùng trồng.
- Ngừng hoạt động.

Testing:

- Sửa thông tin thành công.
- Ngừng hoạt động không xóa dữ liệu lịch sử.
- Audit log ghi lại.

---

### 4.4.4. Hộ gia đình

Chức năng:

- Thêm hộ gia đình.
- Cập nhật thành viên.
- Xem chi tiết hộ.
- Liên kết với nông dân.

Mobile UX:

- Dạng profile.
- Thành viên trong hộ hiển thị danh sách nhỏ.
- Có nút thêm thành viên nhanh.

---

### 4.4.5. Liên kết HTX

Chức năng:

- Gắn nông dân vào HTX.
- Gắn nông dân vào vùng trồng.
- Xem lịch sử liên kết.

Testing:

- Gắn thành công.
- Không gắn được vào HTX khác nếu không có quyền.
- Lịch sử liên kết ghi đúng.

---

## 4.5. Hộ chiếu sản phẩm — Product Passport

### 4.5.1. Danh sách sản phẩm

Chức năng:

- Danh sách sản phẩm.
- Tìm kiếm.
- Lọc theo danh mục.
- Lọc theo trạng thái.
- Xem nhanh QR.
- Xem nhanh số nhật ký.
- Xem nhanh lượt quét.

Mobile UX:

- Dạng card sản phẩm.
- Ảnh sản phẩm ở trên.
- Tên, trạng thái, giá, QR badge.
- Action nhanh:
  - Xem.
  - Sửa.
  - Tạo QR.
  - Chia sẻ.
- Không dùng table lớn trên mobile.

Validation/search:

- Search debounce 300ms.
- Filter giữ trạng thái khi quay lại.
- Infinite scroll hoặc pagination rõ ràng.

Testing:

- Danh sách sản phẩm đúng HTX.
- Search đúng.
- Filter đúng.
- Pagination đúng.

---

### 4.5.2. Tạo sản phẩm

Fields:

- Tên sản phẩm.
- Mã sản phẩm.
- Danh mục.
- Mô tả.
- Giá.
- Đơn vị.
- Ảnh sản phẩm.
- Vùng trồng.
- Nông dân phụ trách.
- Trạng thái.
- Thông tin quy cách.
- Thông tin đóng gói.

Mobile UX:

- Chia thành 4 bước:
  1. Thông tin cơ bản.
  2. Ảnh & mô tả.
  3. Vùng trồng & người phụ trách.
  4. Xác nhận & xuất bản.
- Upload ảnh có preview.
- Giá dùng numeric keyboard.
- Có nút “Lưu nháp”.

Validation:

- Tên sản phẩm bắt buộc.
- Mã sản phẩm duy nhất trong HTX.
- Giá >= 0.
- Đơn vị bắt buộc.
- Ảnh đúng định dạng jpg/png/webp.
- Dung lượng ảnh không quá giới hạn.
- Vùng trồng phải thuộc HTX.
- Nông dân phải thuộc HTX.

Testing:

- Tạo sản phẩm hợp lệ.
- Thiếu tên báo lỗi.
- Giá âm báo lỗi.
- Ảnh sai định dạng báo lỗi.
- Mã trùng báo lỗi.
- Tạo sản phẩm khác HTX bị chặn.

---

### 4.5.3. Chi tiết sản phẩm

Chức năng:

- Xem thông tin.
- Xem ảnh.
- Xem vùng trồng.
- Xem nhật ký.
- Xem QR Passport.
- Xem lịch sử cập nhật.
- Sửa sản phẩm.
- Ẩn/hiện sản phẩm.

Mobile UX:

- Header ảnh lớn.
- Tên sản phẩm + trạng thái.
- Quick actions dạng icon:
  - Sửa.
  - Tạo QR.
  - Chia sẻ.
  - Xuất PDF.
- Nội dung chia tab:
  - Tổng quan.
  - Nhật ký.
  - QR.
  - Chứng nhận.
  - Lịch sử.

Testing:

- Xem đúng sản phẩm.
- Sản phẩm ẩn không public.
- User khác HTX không xem được.

---

### 4.5.4. Nhà cung ứng / chuỗi cung ứng

Chức năng:

- Thêm nhà cung ứng.
- Gắn nhà cung ứng vào sản phẩm.
- Theo dõi vận chuyển.
- Thông tin phân phối.

Mobile UX:

- Timeline chuỗi cung ứng.
- Mỗi điểm là một card:
  - Tên đơn vị.
  - Vai trò.
  - Thời gian.
  - Ghi chú.

Testing:

- Thêm nhà cung ứng.
- Gắn vào sản phẩm.
- Public passport hiển thị đúng chuỗi cung ứng nếu bật.

---

### 4.5.5. Chứng nhận

Chức năng:

- Thêm chứng nhận.
- Upload file chứng nhận.
- Ngày cấp.
- Ngày hết hạn.
- Đơn vị cấp.
- Gắn chứng nhận vào sản phẩm/HTX/vùng trồng.

Validation:

- Tên chứng nhận bắt buộc.
- Ngày hết hạn > ngày cấp.
- File PDF/JPG/PNG hợp lệ.
- Không upload file quá dung lượng.

Testing:

- Upload chứng nhận hợp lệ.
- Ngày sai báo lỗi.
- File sai định dạng báo lỗi.
- Public passport hiển thị chứng nhận còn hiệu lực.

---

### 4.5.6. Nhật ký sản phẩm

Chức năng:

- Xem lịch sử cập nhật.
- Lịch sử truy xuất.
- Lịch sử thay đổi trạng thái.
- Lịch sử tạo QR.

UX:

- Timeline theo thời gian.
- Có icon theo loại sự kiện.

Testing:

- Tạo sản phẩm sinh log.
- Sửa sản phẩm sinh log.
- Tạo QR sinh log.

---

### 4.5.7. Xuất hộ chiếu

Chức năng:

- Xuất PDF.
- Xuất QR code.
- Chia sẻ link.
- Tải QR code.

Testing:

- QR mở đúng trang public.
- PDF có đủ thông tin.
- Link public không cần đăng nhập.
- Sản phẩm private không bị public nếu chưa xuất bản.

---

## 4.6. Hộ chiếu xoài — Xuất xứ

> Đây là module mẫu chuyên sâu cho một loại sản phẩm. Có thể dùng làm template cho các ngành hàng khác.

### 4.6.1. Vùng trồng xoài

Chức năng:

- Danh sách vùng.
- Thêm vùng.
- Cập nhật vùng.
- Bản đồ vùng.
- Diện tích.
- Tọa độ.

Mobile UX:

- Bản đồ không chiếm toàn màn hình quá lâu.
- Có danh sách vùng dạng card bên dưới.
- Click card thì focus vùng trên bản đồ.
- Cho nhập tọa độ hoặc chọn trên map.

Validation:

- Tên vùng bắt buộc.
- Diện tích > 0.
- Latitude -90 đến 90.
- Longitude -180 đến 180.
- GeoJSON hợp lệ nếu có.

Testing:

- Tạo vùng hợp lệ.
- Tọa độ sai báo lỗi.
- Diện tích sai báo lỗi.
- Bản đồ render trên mobile.

---

### 4.6.2. Cơ sở đóng gói

Chức năng:

- Danh sách cơ sở.
- Thêm cơ sở.
- Cập nhật.
- Giấy phép cơ sở.
- Liên kết sản phẩm.

Validation:

- Tên cơ sở bắt buộc.
- Mã cơ sở duy nhất.
- Giấy phép đúng định dạng.

---

### 4.6.3. Mã số vùng trồng

Chức năng:

- Tạo mã số.
- Cập nhật mã số.
- Xem lịch sử thay đổi.
- Gắn mã với vùng trồng.
- Gắn mã với hộ chiếu sản phẩm.

Validation:

- Mã số duy nhất trong HTX.
- Mã số đúng format nếu có quy định.
- Vùng trồng bắt buộc.

---

### 4.6.4. Truy xuất nguồn gốc xoài

Chức năng:

- Quét QR/code.
- Xem thông tin vùng.
- Xem thông tin lô hàng.
- Xem hành trình sản phẩm.
- Xem chứng nhận.

Mobile UX public:

- Tối ưu cho người mua.
- Không bắt đăng nhập.
- Trên đầu trang hiển thị:
  - Ảnh sản phẩm.
  - Tên sản phẩm.
  - HTX.
  - Badge xác thực.
- Dưới là timeline:
  - Vùng trồng.
  - Canh tác.
  - Thu hoạch.
  - Đóng gói.
  - Vận chuyển.
  - Phân phối.

Testing:

- QR hợp lệ mở đúng.
- QR sai báo không tìm thấy.
- Passport ẩn không hiển thị.
- Trang public tải dưới 3 giây.

---

### 4.6.5. Nhật ký canh tác xoài

Chức năng:

- Ghi chép canh tác.
- Lịch sử canh tác.
- Sử dụng vật tư.
- Ảnh minh chứng.

Validation:

- Ngày không lớn hơn hiện tại.
- Nội dung bắt buộc.
- Vật tư phải chọn từ danh mục nếu có.
- Ảnh đúng định dạng.

---

## 4.7. Hộ chiếu nông nghiệp

### 4.7.1. Hộ chiếu cây trồng

Chức năng:

- Tạo hộ chiếu.
- Thông tin cây trồng.
- Giống, nguồn gốc.
- Diện tích canh tác.
- Liên kết vùng trồng.
- Liên kết nhật ký.

Mobile UX:

- Dạng wizard.
- Có preview passport trước khi xuất bản.

Testing:

- Tạo hộ chiếu hợp lệ.
- Thiếu sản phẩm báo lỗi.
- Dữ liệu khác HTX báo 403.

---

### 4.7.2. Hồ sơ vật tư

Chức năng:

- Danh sách vật tư.
- Thêm vật tư.
- Nhà cung cấp.
- Hạn sử dụng.
- Số lượng.
- Liên kết nhật ký.

Validation:

- Tên vật tư bắt buộc.
- Số lượng >= 0.
- Hạn sử dụng hợp lệ.
- Nhà cung cấp hợp lệ.

---

### 4.7.3. Nhật ký canh tác tổng quát

Chức năng:

- Ghi chép công việc.
- Sử dụng vật tư.
- Tưới nước/bón phân/phun thuốc/thu hoạch.
- Ảnh minh chứng.
- Trạng thái kiểm tra.

UX mobile:

- Nút “Ghi nhật ký hôm nay” nổi bật.
- Form nhập nhanh.
- Cho chọn hoạt động bằng chip.
- Cho upload ảnh từ camera.
- Có lịch sử theo ngày.

Testing:

- Tạo log.
- Sửa log.
- Xóa/ẩn log.
- Ngày tương lai báo lỗi.
- Không có quyền bị 403.

---

### 4.7.4. Giám sát và nhật ký kiểm tra

Chức năng:

- Nhật ký kiểm tra.
- Nhật ký sự cố.
- Ảnh minh chứng.
- Kết quả đánh giá.
- Ghi chú người kiểm tra.

Testing:

- Tạo kiểm tra.
- Upload ảnh.
- Gắn sản phẩm/vùng trồng.
- Báo cáo tổng hợp đúng.

---

### 4.7.5. Đánh giá chất lượng

Chức năng:

- Tiêu chuẩn chất lượng.
- Kết quả kiểm định.
- Đánh giá nội bộ.
- Chứng nhận.

UX:

- Điểm đánh giá hiển thị rõ.
- Badge đạt/không đạt.
- Có file chứng nhận.

Testing:

- Nhập điểm hợp lệ.
- Điểm ngoài thang báo lỗi.
- File chứng nhận sai định dạng báo lỗi.

---

## 4.8. Nông dân số

### 4.8.1. Quản lý thông tin cá nhân

Chức năng:

- Thông tin cá nhân.
- Thông tin hộ gia đình.
- Thông tin đất đai.
- Thiết bị/máy móc.

Mobile UX:

- Dạng profile.
- Các nhóm thông tin dùng accordion.
- Ưu tiên nút cập nhật nhanh.

Testing:

- Cập nhật thông tin.
- SĐT sai báo lỗi.
- Ảnh đại diện upload được.

---

### 4.8.2. Nhật ký sản xuất

Chức năng:

- Ghi chép sản xuất.
- Lịch chăm sóc.
- Chi phí sản xuất.
- Doanh thu.

Mobile UX:

- Dashboard hôm nay.
- Nút ghi nhật ký.
- Nút thêm chi phí.
- Nút thêm doanh thu.
- Biểu đồ đơn giản.

Testing:

- Ghi chi phí.
- Ghi doanh thu.
- Số tiền âm báo lỗi.
- Báo cáo tổng đúng.

---

### 4.8.3. Thông báo và nhắc việc

Chức năng:

- Thông báo chung.
- Nhắc lịch canh tác.
- Cảnh báo thời tiết nếu có tích hợp.
- Nhắc chứng nhận hết hạn.

UX:

- Badge số thông báo.
- Push notification PWA nếu bật sau này.
- MVP dùng in-app notification/email.

Testing:

- Tạo thông báo.
- User nhận đúng thông báo.
- Đánh dấu đã đọc.
- Không nhận thông báo HTX khác.

---

### 4.8.4. Kết nối và chia sẻ

Chức năng:

- Chia sẻ hộ chiếu.
- Chia sẻ nhật ký.
- Chia sẻ báo cáo.
- Kết nối cộng đồng.

Testing:

- Link chia sẻ mở đúng.
- Dữ liệu private không bị lộ.
- Passport public chỉ hiện thông tin được phép.

---

### 4.8.5. Ứng dụng di động

Trong giai đoạn này không làm app native.

Yêu cầu thay thế:

- Web mobile-first.
- PWA-ready.
- Có manifest.
- Có icon.
- Có splash nếu cần.
- Có layout như app.

Testing:

- Mở tốt trên Chrome Android.
- Mở tốt trên Safari iOS.
- Add to Home Screen nếu bật PWA.
- Không vỡ layout ở 360px.

---

## 4.9. Liên kết nông dân

### 4.9.1. Kết nối nông dân

Chức năng:

- Tìm kiếm nông dân.
- Gửi lời mời kết nối.
- Duyệt kết nối.
- Danh sách kết nối.

Testing:

- Gửi lời mời.
- Duyệt lời mời.
- Từ chối lời mời.
- Không tạo kết nối trùng.

---

### 4.9.2. Hợp tác sản xuất

Chức năng:

- Tạo nhóm sản xuất.
- Phân công công việc.
- Theo dõi tiến độ.
- Đánh giá hiệu quả.

Mobile UX:

- Công việc dạng checklist.
- Có trạng thái:
  - Chưa làm.
  - Đang làm.
  - Hoàn thành.
  - Quá hạn.
- Nút cập nhật nhanh.

Testing:

- Tạo công việc.
- Phân công.
- Cập nhật trạng thái.
- Quá hạn hiển thị đúng.

---

### 4.9.3. Chia sẻ thông tin

Chức năng:

- Chia sẻ hộ chiếu.
- Chia sẻ nhật ký.
- Chia sẻ báo cáo.
- Chia sẻ kinh nghiệm.

Testing:

- Chia sẻ đúng quyền.
- User không được phép không xem được.

---

### 4.9.4. Thị trường tiêu thụ

Chức năng:

- Thông tin thị trường.
- Kết nối thương lái.
- Hợp đồng tiêu thụ.
- Lịch sử giao dịch.

MVP có thể làm mức cơ bản:

- Danh sách thông tin thị trường.
- Ghi chú thương lái.
- Theo dõi giao dịch thủ công.

---

### 4.9.5. Cộng đồng

Chức năng:

- Diễn đàn.
- Hỏi đáp.
- Chia sẻ kinh nghiệm.
- Tin tức nông nghiệp.

MVP có thể để sau nếu cần.

---

## 4.10. Thống kê và báo cáo

### 4.10.1. Thống kê tổng quan

Chỉ số:

- Số lượng HTX.
- Số lượng nông dân.
- Số sản phẩm.
- Diện tích canh tác.
- Sản lượng.
- Số QR Passport.
- Lượt quét QR.

Mobile UX:

- Card số liệu 2 cột.
- Biểu đồ đơn giản.
- Filter thời gian dạng chip:
  - Hôm nay.
  - 7 ngày.
  - 30 ngày.
  - Tùy chỉnh.

Testing:

- Số liệu đúng.
- Filter đúng.
- Super Admin xem toàn hệ thống.
- Admin HTX chỉ xem HTX của mình.

---

### 4.10.2. Báo cáo sản xuất

Chức năng:

- Báo cáo theo thời gian.
- Báo cáo theo cây trồng.
- Báo cáo theo HTX.
- Báo cáo theo vùng.

Testing:

- Lọc theo thời gian.
- Lọc theo vùng.
- Xuất Excel/PDF.
- Dữ liệu đúng HTX.

---

### 4.10.3. Báo cáo chất lượng

Chức năng:

- Chất lượng sản phẩm.
- Kết quả kiểm định.
- Chứng nhận.
- Tỷ lệ đạt/không đạt.

---

### 4.10.4. Báo cáo truy xuất

Chức năng:

- Lịch sử truy xuất.
- Truy xuất theo sản phẩm.
- Truy xuất theo vùng.
- Lượt quét QR.
- Thiết bị/quốc gia nếu thu thập được hợp lệ.

Testing:

- Quét QR tăng lượt xem.
- Báo cáo lượt xem đúng.
- Không ghi dữ liệu nhạy cảm không cần thiết.

---

### 4.10.5. Xuất báo cáo

Chức năng:

- Xuất Excel.
- Xuất PDF.
- In báo cáo.
- Lưu file vào R2 nếu cần.

Validation:

- Khoảng ngày hợp lệ.
- Không xuất dữ liệu HTX khác.
- File xuất không rỗng.

Testing:

- Xuất Excel mở được.
- Xuất PDF mở được.
- Report lớn không timeout.

---

### 4.10.6. Biểu đồ và Dashboard

Chức năng:

- Biểu đồ tổng quan.
- Dashboard theo quản trị.
- Cảnh báo KPI.

Mobile UX:

- Không nhồi quá nhiều biểu đồ trên màn nhỏ.
- Mỗi biểu đồ một card.
- Có tóm tắt bằng chữ trước biểu đồ.
- Biểu đồ có thể cuộn ngang nếu cần.

Testing:

- Chart render mobile.
- Không vỡ layout.
- Số liệu chart khớp API.

---

# 5. Chức năng chung toàn hệ thống

## 5.1. Tìm kiếm và lọc

Chức năng:

- Tìm kiếm nhanh.
- Tìm kiếm nâng cao.
- Lọc theo nhiều tiêu chí.
- Lưu bộ lọc.

Mobile UX:

- Search bar sticky.
- Filter mở bằng bottom sheet.
- Filter đang dùng hiển thị bằng chip.
- Có nút xóa tất cả filter.

Testing:

- Search đúng.
- Filter nhiều điều kiện đúng.
- Clear filter đúng.
- Không crash khi search rỗng.

---

## 5.2. Quản lý tệp

Chức năng:

- Tải lên.
- Xem trước.
- Tải xuống.
- Xóa tệp.
- Quản lý metadata file.

Mobile UX:

- Upload ảnh từ camera/thư viện.
- Có preview ảnh.
- Có thanh tiến trình upload.
- Có lỗi rõ nếu file quá lớn.

Validation:

- MIME type hợp lệ.
- Size giới hạn.
- Không cho file nguy hiểm.
- File thuộc đúng HTX.

Testing:

- Upload ảnh hợp lệ.
- Upload PDF hợp lệ.
- Upload exe bị chặn.
- Upload file quá lớn báo lỗi.
- Xóa file đúng quyền.

---

## 5.3. Thông báo

Chức năng:

- Thông báo hệ thống.
- Thông báo cá nhân.
- Email/SMS nếu bật.
- Cài đặt thông báo.
- Đánh dấu đã đọc.

Mobile UX:

- Icon chuông.
- Badge số lượng.
- Danh sách thông báo dạng timeline.
- Vuốt/nhấn để đánh dấu đã đọc.

Testing:

- Nhận thông báo.
- Đánh dấu đã đọc.
- Không nhận thông báo của HTX khác.

---

## 5.4. QR Code

Chức năng:

- Tạo QR code.
- Quét QR code.
- In QR code.
- Chia sẻ QR code.
- Tải QR code.

Mobile UX:

- Nút “Tạo QR” rõ ở chi tiết sản phẩm.
- QR hiển thị lớn, dễ lưu.
- Trang quét QR public tải nhanh.

Testing:

- QR mở đúng link.
- QR sai báo lỗi.
- Tải QR thành công.
- Passport bị ẩn không public.

---

## 5.5. Bản đồ

Chức năng:

- Xem bản đồ vùng trồng.
- Vẽ vùng trên bản đồ.
- Đo diện tích.
- Lưu tọa độ.

Mobile UX:

- Map có nút full screen.
- Tránh form dài chồng lên map.
- Có chế độ chọn điểm đơn giản.
- Nếu không dùng map được, cho nhập tọa độ thủ công.

Testing:

- Map render mobile.
- Tọa độ hợp lệ.
- GeoJSON lưu đúng.
- Reload vẫn thấy vùng.

---

## 5.6. Xuất/nhập dữ liệu

Chức năng:

- Nhập Excel.
- Kiểm tra dữ liệu.
- Xuất Excel/PDF.
- Đồng bộ dữ liệu.

Mobile UX:

- Tính năng nhập Excel có thể ưu tiên desktop.
- Mobile vẫn xem trạng thái import/export được.

Testing:

- Import file đúng.
- Import file sai format báo lỗi.
- Export không rỗng.
- Không export dữ liệu khác HTX.

---

## 5.7. Ghi chú và bình luận

Chức năng:

- Thêm ghi chú.
- Bình luận.
- Trả lời bình luận.
- Lịch sử thảo luận.

Testing:

- Thêm bình luận.
- Xóa bình luận đúng quyền.
- Không XSS trong bình luận.

---

## 5.8. Lịch và nhắc việc

Chức năng:

- Lịch canh tác.
- Lịch công việc.
- Nhắc việc.
- Đồng bộ lịch sau này nếu cần.

Mobile UX:

- Dạng danh sách “Hôm nay”.
- Calendar mini.
- Task card dễ tick hoàn thành.

Testing:

- Tạo lịch.
- Nhắc việc đúng thời gian.
- Đổi trạng thái task.

---

## 5.9. Bảo mật

Chức năng:

- Xác thực 2FA nếu bật sau MVP.
- Đổi mật khẩu.
- Phiên đăng nhập.
- Quản lý thiết bị truy cập.
- Rate limit.
- RBAC.
- Audit log.

Testing:

- Token hết hạn.
- Refresh token.
- Logout.
- Đổi mật khẩu.
- Route admin cần quyền.
- CSRF nếu dùng cookie.
- XSS escape.

---

# 6. Bố trí chức năng tối ưu trên mobile

## 6.1. Nguyên tắc màn hình mobile

Thiết kế ưu tiên màn hình:

```txt
360x800
390x844
412x915
```

Quy tắc:

- Không dùng bảng nhiều cột trên mobile.
- Dữ liệu danh sách chuyển thành card.
- Nút hành động chính đặt cố định phía dưới hoặc floating.
- Form chia step.
- Filter dùng bottom sheet.
- Modal dùng bottom sheet hoặc full-screen dialog.
- Text tối thiểu 14px.
- Nút tối thiểu 44px chiều cao.
- Khoảng cách input đủ rộng.
- Không bắt người dùng zoom.

---

## 6.2. Navigation mobile đề xuất

### Người mua

Bottom nav:

```txt
Trang chủ | Sản phẩm | Quét QR | Đơn hàng | Tài khoản
```

### Nông dân

Bottom nav:

```txt
Hôm nay | Nhật ký | Sản phẩm | Thông báo | Tôi
```

### Admin HTX

Bottom nav:

```txt
Tổng quan | Sản phẩm | Nhật ký | QR | Thêm
```

Trong “Thêm”:

```txt
HTX
Thành viên
Vùng trồng
Báo cáo
Gói dịch vụ
Cài đặt
```

### Super Admin

Mobile vẫn dùng được nhưng ưu tiên desktop/tablet cho quản trị nặng.

Bottom nav:

```txt
Tổng quan | HTX | Gói | Hóa đơn | Thêm
```

---

## 6.3. Dashboard mobile

### Admin HTX dashboard

Ưu tiên hiển thị:

1. Gói đang dùng + ngày hết hạn.
2. Tổng sản phẩm.
3. Tổng QR.
4. Nhật ký hôm nay.
5. Cảnh báo cần xử lý.
6. Lối tắt nhanh.

Layout:

```txt
[Card gói dịch vụ]
[2 cột chỉ số]
[Sản phẩm] [QR]
[Nhật ký]  [Vùng trồng]

[Việc cần làm hôm nay]
[Hoạt động mới nhất]
```

Quick actions:

```txt
+ Thêm sản phẩm
+ Ghi nhật ký
+ Tạo QR
+ Thêm nông dân
```

---

## 6.4. Danh sách trên mobile

Không dùng table kiểu desktop.

Dùng card:

```txt
[Tên sản phẩm]        [Badge trạng thái]
Mã: SP001
HTX: HTX A
QR: Đã tạo
Lượt quét: 120

[Xem] [Sửa] [QR]
```

Với danh sách HTX:

```txt
[Tên HTX]             [Active]
Gói: Basic
Sản phẩm: 87/100
Hết hạn: 30/12/2026

[Xem] [Gán gói] [Hóa đơn]
```

---

## 6.5. Form trên mobile

Form dài phải chia step.

Ví dụ form tạo sản phẩm:

```txt
Bước 1: Thông tin cơ bản
- Tên sản phẩm
- Mã sản phẩm
- Danh mục
- Đơn vị

Bước 2: Hình ảnh & mô tả
- Ảnh
- Mô tả
- Giá

Bước 3: Nguồn gốc
- Vùng trồng
- Nông dân
- Chứng nhận

Bước 4: Xác nhận
- Preview
- Lưu nháp / Xuất bản
```

Yêu cầu:

- Có nút Back/Next.
- Có progress.
- Không mất dữ liệu khi chuyển bước.
- Validate từng bước.
- Submit cuối validate lại toàn bộ.

---

## 6.6. Trang QR Passport public

Đây là trang quan trọng nhất cho người mua.

Mobile layout:

```txt
[Ảnh sản phẩm lớn]
[Tên sản phẩm]
[Badge: Đã xác thực]
[HTX sản xuất]

[Thông tin nhanh]
- Vùng trồng
- Ngày thu hoạch
- Mã lô
- Chứng nhận

[Timeline truy xuất]
1. Gieo trồng
2. Chăm sóc
3. Thu hoạch
4. Đóng gói
5. Vận chuyển

[Chứng nhận]
[Ảnh/video minh chứng]
[Thông tin HTX]
```

Yêu cầu:

- Không cần đăng nhập.
- Tải dưới 3 giây.
- Tối ưu SEO/share.
- QR sai có trang lỗi thân thiện.
- Sản phẩm không public không hiển thị dữ liệu nhạy cảm.

---

## 6.7. Admin web desktop

Desktop dùng sidebar.

Sidebar nhóm:

```txt
Tổng quan
Quản lý HTX
Sản phẩm
Vùng trồng
Nhật ký
QR Passport
Thành viên
Gói dịch vụ
Hóa đơn
Báo cáo
Cài đặt
```

Những màn có bảng lớn:

- Có pagination.
- Có search/filter.
- Có bulk actions.
- Có export.
- Có column visibility nếu cần.

---

# 7. Checklist validation toàn hệ thống

## 7.1. Validation frontend

Mỗi form phải có:

```txt
[ ] Schema Zod.
[ ] Error message tiếng Việt rõ ràng.
[ ] Validate khi blur hoặc submit.
[ ] Không submit khi invalid.
[ ] Loading state.
[ ] Disable submit khi đang xử lý.
[ ] Không mất dữ liệu khi API lỗi.
[ ] Toast thành công/thất bại.
```

## 7.2. Validation backend

Mỗi endpoint ghi dữ liệu phải có:

```txt
[ ] DTO class-validator.
[ ] Whitelist input.
[ ] Reject unknown field nếu cần.
[ ] Validate enum.
[ ] Validate UUID.
[ ] Validate date.
[ ] Validate số dương.
[ ] Validate quan hệ cùng HTX.
[ ] Validate quyền.
[ ] Validate nghiệp vụ.
[ ] Trả lỗi chuẩn JSON.
```

## 7.3. Validation bảo mật

```txt
[ ] Không tin dữ liệu frontend.
[ ] Escape text khi render.
[ ] Chống XSS.
[ ] Chống SQL injection qua Prisma.
[ ] Rate limit login.
[ ] CORS đúng domain.
[ ] File upload kiểm MIME/size.
[ ] Không lộ stack trace production.
```

---

# 8. Checklist testing backend

## 8.1. Unit test

```txt
[ ] AuthService.
[ ] UserService.
[ ] RBAC Guard.
[ ] CooperativeService.
[ ] SubscriptionPlanService.
[ ] SubscriptionService.
[ ] InvoiceService.
[ ] ProductService.
[ ] ZoneService.
[ ] FarmingLogService.
[ ] PassportService.
[ ] FileService.
```

## 8.2. Integration test API

```txt
[ ] POST /auth/login.
[ ] GET /auth/me.
[ ] CRUD HTX.
[ ] CRUD user.
[ ] CRUD plan.
[ ] Gán gói HTX.
[ ] Tạo hóa đơn.
[ ] Mark paid hóa đơn.
[ ] CRUD sản phẩm.
[ ] Upload presigned URL.
[ ] CRUD vùng trồng.
[ ] CRUD nhật ký.
[ ] Tạo QR Passport.
[ ] Public passport.
```

## 8.3. RBAC test

```txt
[ ] Super Admin xem toàn hệ thống.
[ ] Admin HTX chỉ xem HTX mình.
[ ] Thành viên không xem module bị cấm.
[ ] Nông dân chỉ xem dữ liệu được gán.
[ ] Người mua chỉ xem public.
[ ] Thiếu token trả 401.
[ ] Thiếu quyền trả 403.
```

## 8.4. Multi-tenant test

```txt
[ ] HTX A không xem sản phẩm HTX B.
[ ] HTX A không sửa nhật ký HTX B.
[ ] HTX A không xem hóa đơn HTX B.
[ ] HTX A không xem file private HTX B.
[ ] Super Admin xem được tất cả.
```

---

# 9. Checklist testing frontend

## 9.1. Component test

```txt
[ ] Button.
[ ] Input.
[ ] Select.
[ ] DatePicker.
[ ] FileUpload.
[ ] DataCard.
[ ] MobileBottomNav.
[ ] FilterBottomSheet.
[ ] Toast.
[ ] ConfirmDialog.
[ ] EmptyState.
[ ] ErrorState.
[ ] SkeletonLoading.
```

## 9.2. Form test

```txt
[ ] Login form.
[ ] Register form.
[ ] HTX form.
[ ] User form.
[ ] Plan form.
[ ] Subscription form.
[ ] Invoice form.
[ ] Product form.
[ ] Zone form.
[ ] Farming log form.
[ ] Certification form.
[ ] File upload form.
```

## 9.3. Responsive test

Viewport bắt buộc:

```txt
[ ] 360x800.
[ ] 390x844.
[ ] 412x915.
[ ] 768x1024.
[ ] 1366x768.
[ ] 1920x1080.
```

Kiểm tra:

```txt
[ ] Không vỡ layout.
[ ] Không tràn ngang.
[ ] Nút dễ bấm.
[ ] Form dễ nhập.
[ ] Bottom nav không che nội dung.
[ ] Modal/bottom sheet dùng tốt.
[ ] Card list thay table trên mobile.
```

---

# 10. Checklist E2E Playwright

## 10.1. Flow Super Admin

```txt
[ ] Login Super Admin.
[ ] Tạo HTX.
[ ] Tạo Admin HTX.
[ ] Tạo gói Free.
[ ] Tạo gói Basic.
[ ] Gán gói Basic cho HTX.
[ ] Tạo hóa đơn.
[ ] Mark paid hóa đơn.
[ ] Xem báo cáo doanh thu.
```

## 10.2. Flow Admin HTX

```txt
[ ] Login Admin HTX.
[ ] Xem dashboard.
[ ] Cập nhật thông tin HTX.
[ ] Thêm thành viên.
[ ] Thêm nông dân.
[ ] Tạo vùng trồng.
[ ] Tạo sản phẩm.
[ ] Upload ảnh sản phẩm.
[ ] Ghi nhật ký canh tác.
[ ] Tạo QR Passport.
[ ] Xem báo cáo HTX.
```

## 10.3. Flow Public QR

```txt
[ ] Mở link QR hợp lệ.
[ ] Xem thông tin sản phẩm.
[ ] Xem vùng trồng.
[ ] Xem nhật ký.
[ ] Xem chứng nhận.
[ ] Mở link QR sai.
[ ] Mở passport bị ẩn.
```

## 10.4. Flow mobile

```txt
[ ] Login trên viewport mobile.
[ ] Dashboard mobile không vỡ.
[ ] Tạo sản phẩm trên mobile.
[ ] Upload ảnh từ mobile.
[ ] Tạo nhật ký trên mobile.
[ ] Xem QR Passport trên mobile.
[ ] Bottom nav hoạt động.
[ ] Filter bottom sheet hoạt động.
```

---

# 11. Checklist performance

```txt
[ ] Trang public QR tải dưới 3 giây.
[ ] Dashboard tải dưới 3 giây với dữ liệu vừa.
[ ] API list có pagination.
[ ] Ảnh được resize/compress trước khi hiển thị.
[ ] R2/CDN dùng cho file public.
[ ] Redis cache cho dữ liệu public phổ biến nếu cần.
[ ] Không query N+1 nghiêm trọng.
[ ] Database có index cho cooperative_id.
```

---

# 12. Checklist deployment

```txt
[ ] Docker build backend thành công.
[ ] Docker build frontend thành công.
[ ] docker compose up thành công.
[ ] PostgreSQL healthy.
[ ] Redis healthy.
[ ] Backend healthy.
[ ] Frontend mở được.
[ ] Nginx proxy đúng.
[ ] Domain trỏ đúng.
[ ] Cloudflare proxy bật.
[ ] SSL hoạt động.
[ ] R2 upload test OK.
[ ] Migration chạy OK.
[ ] Seed Super Admin OK.
[ ] Backup DB chạy OK.
[ ] E2E production smoke pass.
```

---

# 13. Checklist nghiệm thu chức năng

Một module được nghiệm thu khi:

```txt
[ ] Có UI mobile-first.
[ ] Có API backend.
[ ] Có database migration.
[ ] Có validation frontend.
[ ] Có validation backend.
[ ] Có phân quyền.
[ ] Có audit log nếu thao tác quan trọng.
[ ] Có loading/error/empty state.
[ ] Có unit test.
[ ] Có integration test.
[ ] Có E2E test nếu là flow chính.
[ ] Pass lint.
[ ] Pass typecheck.
[ ] Pass build.
[ ] Không lỗi responsive mobile.
[ ] Có ghi chú hướng dẫn sử dụng.
```

---

# 14. Thứ tự triển khai đề xuất

## Giai đoạn 1 — Nền tảng

```txt
1. Setup monorepo.
2. Setup Docker dev/prod.
3. Setup PostgreSQL/Redis.
4. Setup NestJS base.
5. Setup Next.js base.
6. Setup auth.
7. Setup RBAC.
8. Setup Swagger.
9. Setup CI test.
```

## Giai đoạn 2 — SaaS HTX

```txt
1. Quản lý HTX.
2. Quản lý thành viên.
3. Quản lý gói.
4. Gán gói HTX.
5. Hóa đơn.
6. Dashboard Super Admin.
7. Dashboard Admin HTX.
```

## Giai đoạn 3 — Agri Passport core

```txt
1. Sản phẩm.
2. Vùng trồng.
3. Nông dân.
4. Nhật ký canh tác.
5. Chứng nhận.
6. File upload R2.
7. QR Passport.
8. Trang public QR.
```

## Giai đoạn 4 — Báo cáo & hoàn thiện

```txt
1. Báo cáo HTX.
2. Báo cáo Super Admin.
3. Xuất Excel/PDF.
4. Notification.
5. Audit log.
6. Mobile polish.
7. Performance.
8. Security.
9. E2E full flow.
10. Deploy production.
```

---

# 15. Ưu tiên MVP

Nếu cần làm nhanh, MVP nên có trước:

```txt
[ ] Auth.
[ ] RBAC.
[ ] Super Admin.
[ ] HTX.
[ ] Gói dịch vụ.
[ ] Gán gói HTX.
[ ] Hóa đơn thủ công.
[ ] Admin HTX.
[ ] Sản phẩm.
[ ] Vùng trồng.
[ ] Nông dân.
[ ] Nhật ký canh tác.
[ ] Upload ảnh R2.
[ ] QR Passport.
[ ] Trang public QR.
[ ] Dashboard mobile.
[ ] Test validation form chính.
[ ] E2E flow chính.
```

Tạm để sau MVP:

```txt
[ ] Diễn đàn cộng đồng.
[ ] Chat realtime.
[ ] Thanh toán online.
[ ] App native.
[ ] AI.
[ ] Offline-first.
[ ] CRM nâng cao.
[ ] Map vẽ vùng nâng cao nếu chưa cần.
```

---

# 16. Ghi chú quan trọng cho developer

- Không hard-code HTX trong query.
- Mọi dữ liệu nghiệp vụ phải kiểm `cooperative_id`.
- Không tin dữ liệu từ frontend.
- Không upload file qua backend nếu file lớn; dùng R2 presigned URL.
- Không để table desktop trên mobile.
- Không làm app native ở MVP.
- Không khóa tính năng theo gói ở bản đầu, nhưng database phải sẵn sàng.
- Không deploy khi test fail.
- Không public PostgreSQL/Redis.
- Không commit `.env.production`.
- Không bỏ qua validation form.

---

# 17. Kết luận

FUNCTION.md là tài liệu đặc tả chức năng và kiểm thử cốt lõi cho Agri Passport.

Mục tiêu cuối cùng:

```txt
Web SaaS mobile-first
Dễ dùng cho HTX, nông dân, người mua
Có thu phí theo HTX
Có QR truy xuất nguồn gốc
Có quản trị gói/hóa đơn
Có validation kỹ từng form
Có auto test backend/frontend/E2E
Triển khai bằng Docker trên VPS
Tối ưu chi phí với Cloudflare + R2
```
