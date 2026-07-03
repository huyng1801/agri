# PLAN.md — AGRI PASSPORT SaaS Web Mobile First

> Phiên bản: V1.0  
> Mục tiêu: Xây dựng hệ thống SaaS quản lý, truy xuất nguồn gốc và thu phí theo HTX.  
> Phạm vi: **Chỉ làm web**, không làm app native. Web phải **mobile-first**, mượt như app native, dễ dùng, tiết kiệm chi phí, triển khai bằng Docker trên VPS.

---

## 0. Chốt định hướng

### 0.1. Chốt sản phẩm

Agri Passport là hệ thống SaaS dành cho:

- Người mua: xem sản phẩm, quét QR, xem truy xuất nguồn gốc.
- Nông dân / thành viên HTX: nhập nhật ký canh tác, quản lý sản phẩm, cập nhật thông tin vùng trồng.
- Admin HTX: quản lý HTX, thành viên, sản phẩm, đơn hàng, QR Passport, báo cáo.
- Super Admin hệ thống: quản lý toàn bộ HTX, tài khoản, gói dịch vụ, hóa đơn, doanh thu, cấu hình hệ thống.

### 0.2. Chốt mô hình kinh doanh

Hệ thống có cơ chế bán gói SaaS cho **HTX**.

Ở bản đầu:

- Có gói Free.
- Có gói Basic / Pro / Enterprise.
- Admin có thể tạo, sửa, gán gói cho từng HTX.
- Có hóa đơn/gia hạn thủ công.
- **Chưa cần khóa tính năng theo gói**.
- Chỉ cần lưu thông tin gói, ngày bắt đầu, ngày hết hạn, trạng thái thanh toán để quản lý thu phí.

Sau này mới bật giới hạn theo gói:

- Giới hạn số sản phẩm.
- Giới hạn số thành viên.
- Giới hạn số vùng trồng.
- Giới hạn QR Passport.
- Giới hạn báo cáo nâng cao.

### 0.3. Chốt kỹ thuật

```txt
Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- PWA-ready
- Mobile-first responsive
- Không làm app native

Backend:
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- JWT Auth
- RBAC
- Swagger/OpenAPI
- class-validator
- Helmet, rate limit, CORS

Storage/CDN:
- Cloudflare R2
- Cloudflare CDN/DNS/WAF
- Presigned URL upload

Deploy:
- VPS Ubuntu
- Docker
- Docker Compose
- Nginx reverse proxy
- Cloudflare SSL
- PostgreSQL container hoặc managed PostgreSQL
- Redis container

Testing:
- Backend unit test
- Backend integration test
- Frontend component test
- Form validation test
- E2E Playwright test
- API test
- Build test
- Docker smoke test
```

---

## 1. Nguyên tắc phát triển

### 1.1. Web-only, không native app

Không phát triển Android/iOS native ở giai đoạn này.

Thay vào đó, web cần đạt các yêu cầu:

- Mobile-first từ đầu.
- Giao diện chạm tốt trên điện thoại.
- Nút bấm đủ lớn.
- Form ngắn, dễ nhập.
- Tốc độ tải nhanh.
- Có skeleton loading.
- Có toast thông báo.
- Có modal bottom-sheet trên mobile.
- Có PWA manifest để sau này cài ra màn hình chính nếu cần.
- Trải nghiệm mượt như app native nhưng vẫn là website.

### 1.2. Ưu tiên chi phí thấp

Sử dụng hạ tầng đã có:

- VPS.
- Tên miền.
- Cloudflare DNS/CDN/WAF.
- Cloudflare R2.
- Docker để dễ deploy và rollback.

Không dùng dịch vụ đắt tiền ở MVP nếu chưa cần.

### 1.3. Validation phải thật kỹ

Mọi form đều phải có 2 lớp validation:

- Frontend: React Hook Form + Zod.
- Backend: DTO + class-validator + kiểm tra nghiệp vụ trong service.

Mục tiêu quality gate:

- 100% test case đã định nghĩa phải pass trước khi deploy production.
- Không hiểu là “phần mềm chắc chắn không có bug”, mà là toàn bộ kịch bản kiểm thử bắt buộc đều phải chạy xanh.

### 1.4. Không phá hệ thống khi mở rộng

Ngay từ đầu phải thiết kế theo SaaS nhiều HTX:

- Mỗi dữ liệu nghiệp vụ cần có `cooperative_id` nếu thuộc HTX.
- Query luôn filter theo `cooperative_id`.
- Super Admin mới được xem xuyên HTX.
- Admin HTX chỉ thấy dữ liệu HTX của mình.

---

## 2. Kiến trúc tổng quan

```txt
Người dùng Mobile/Web
        |
        v
Cloudflare DNS + CDN + WAF
        |
        v
Nginx Reverse Proxy trên VPS
        |
        +--------------------+
        |                    |
        v                    v
Next.js Frontend        NestJS Backend API
        |                    |
        |                    +------ PostgreSQL
        |                    |
        |                    +------ Redis / BullMQ
        |                    |
        |                    +------ Cloudflare R2
        |
        v
UI Mobile First / PWA-ready
```

### 2.1. Luồng upload ảnh/video/tài liệu

```txt
Frontend yêu cầu upload
        |
        v
Backend kiểm tra quyền + loại file
        |
        v
Backend tạo presigned URL R2
        |
        v
Frontend upload trực tiếp lên R2
        |
        v
Backend lưu metadata file vào PostgreSQL
```

Lợi ích:

- Giảm tải VPS.
- Không phải lưu file lớn trên server.
- Dễ CDN.
- Dễ backup metadata.

### 2.2. Luồng QR Passport

```txt
Admin HTX tạo sản phẩm
        |
        v
Nhập vùng trồng, nhật ký, chứng nhận, ảnh
        |
        v
Tạo Traceability Passport
        |
        v
Sinh mã QR
        |
        v
Người mua quét QR
        |
        v
Trang public hiển thị nguồn gốc sản phẩm
```

### 2.3. Luồng gói SaaS HTX

```txt
Super Admin tạo gói
        |
        v
Super Admin gán gói cho HTX
        |
        v
Sinh hóa đơn hoặc ghi nhận thanh toán
        |
        v
HTX sử dụng hệ thống
        |
        v
Theo dõi ngày hết hạn / trạng thái gói
```

Ở MVP:

- Gói chỉ để quản lý thu phí.
- Chưa cần chặn tính năng.
- Có cảnh báo “gói sắp hết hạn”.

---

## 3. Stack chi tiết

### 3.1. Frontend

Công nghệ:

```txt
- Next.js App Router
- TypeScript strict
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Lucide Icons
- Framer Motion
- PWA-ready
```

Lý do chọn:

- Next.js phù hợp làm web dashboard, SEO page public, route rõ ràng.
- TypeScript giúp giảm bug.
- Tailwind + shadcn/ui làm UI nhanh, đẹp, đồng bộ.
- React Hook Form + Zod xử lý validation tốt.
- TanStack Query quản lý trạng thái API hiệu quả.
- PWA-ready giúp web có cảm giác như app mà không cần làm app native.

Quy tắc UI mobile-first:

- Thiết kế từ màn 360px trước, sau đó mở rộng tablet/desktop.
- Navbar mobile dạng bottom navigation hoặc hamburger.
- Form chia bước nếu quá dài.
- Table trên mobile chuyển thành card list.
- Nút chính luôn rõ ràng, nằm vùng dễ chạm.
- Không dùng modal quá rộng trên mobile; ưu tiên bottom sheet.
- Loading phải có skeleton.
- Tất cả thao tác quan trọng có confirm dialog.
- Tất cả lỗi validation hiển thị ngay dưới input.
- Không để text quá nhỏ dưới 14px trên mobile.

### 3.2. Backend

Công nghệ:

```txt
- NestJS
- TypeScript strict
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ
- JWT access token + refresh token
- RBAC
- Swagger/OpenAPI
- class-validator
- helmet
- throttler/rate limit
```

Lý do chọn:

- NestJS có cấu trúc module rõ ràng, phù hợp dự án nhiều nghiệp vụ.
- Prisma thao tác PostgreSQL nhanh, dễ migration.
- Redis dùng cache, queue, rate limit.
- BullMQ dùng xử lý nền: gửi email, tạo QR, xử lý ảnh, sinh báo cáo.
- Swagger giúp frontend/tester đọc API nhanh.
- DTO validation giúp kiểm tra input nghiêm ngặt.

### 3.3. Database

Chọn PostgreSQL vì:

- Phù hợp hệ thống SaaS nhiều quan hệ dữ liệu.
- Hỗ trợ JSONB tốt cho metadata.
- Index mạnh.
- Transaction tốt.
- Dễ mở rộng báo cáo.
- Prisma hỗ trợ tốt.

Khuyến nghị MVP:

```txt
postgres:16-alpine
```

### 3.4. Storage

Dùng Cloudflare R2 để lưu:

- Ảnh sản phẩm.
- Ảnh vùng trồng.
- Ảnh nhật ký canh tác.
- Video ngắn nếu có.
- File chứng nhận.
- PDF xuất báo cáo.
- QR image nếu muốn lưu dạng file.

Không lưu file upload trực tiếp trong VPS, trừ file tạm.

### 3.5. CDN, DNS, SSL

Dùng Cloudflare:

- DNS quản lý tên miền.
- CDN cache file public.
- WAF chống request xấu.
- SSL/TLS.
- Rate limit cơ bản.
- Proxy domain về VPS.

Khuyến nghị:

```txt
SSL/TLS mode: Full (strict)
```

### 3.6. Docker

Toàn bộ hệ thống chạy bằng Docker Compose:

```txt
frontend
backend
postgres
redis
nginx
backup
```

Lợi ích:

- Dễ deploy.
- Dễ rollback.
- Dễ reset VPS.
- Không bị lệ thuộc môi trường máy chủ.
- Một lệnh có thể chạy lại toàn bộ.

---

## 4. Cấu trúc thư mục repo

```txt
agri-passport/
  README.md
  PLAN.md
  .env.example
  docker-compose.yml
  docker-compose.prod.yml

  nginx/
    prod.conf
    snippets/
      security-headers.conf

  scripts/
    init-vps.sh
    deploy.sh
    reset-vps-old-site.sh
    backup-db.sh
    restore-db.sh
    smoke.sh

  backend/
    Dockerfile
    package.json
    tsconfig.json
    prisma/
      schema.prisma
      migrations/
      seed.ts
    src/
      main.ts
      app.module.ts
      common/
        decorators/
        guards/
        filters/
        interceptors/
        pipes/
        utils/
      modules/
        auth/
        users/
        roles/
        cooperatives/
        members/
        subscription-plans/
        subscriptions/
        invoices/
        products/
        categories/
        zones/
        farming-logs/
        traceability/
        orders/
        payments/
        files/
        reports/
        notifications/
        settings/
        audit-logs/
        public-passport/
      tests/
        unit/
        integration/
        e2e/

  frontend/
    Dockerfile
    package.json
    next.config.ts
    src/
      app/
      components/
      features/
      hooks/
      lib/
      schemas/
      services/
      stores/
      styles/
      tests/
```

---

## 5. Module chức năng

### 5.1. Auth Module

Chức năng:

- Đăng ký.
- Đăng nhập.
- Đăng xuất.
- Refresh token.
- Quên mật khẩu.
- Đổi mật khẩu.
- Lấy thông tin người dùng hiện tại.
- Kiểm tra quyền.

API:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

Validation:

- Email đúng định dạng.
- Password tối thiểu 8 ký tự.
- Không cho email trùng.
- Refresh token hợp lệ.
- Reset token chưa hết hạn.

### 5.2. User & RBAC Module

Vai trò mặc định:

```txt
SUPER_ADMIN
ADMIN_HTX
MEMBER_HTX
FARMER
BUYER
```

Quy tắc:

- Super Admin xem toàn hệ thống.
- Admin HTX chỉ xem HTX của mình.
- Thành viên HTX chỉ xem dữ liệu được cấp quyền.
- Người mua chỉ xem public passport và đơn của mình.

### 5.3. Cooperative Module

Quản lý HTX.

Chức năng:

- Tạo HTX.
- Sửa HTX.
- Xem danh sách HTX.
- Xem chi tiết HTX.
- Bật/tắt HTX.
- Gán admin HTX.
- Xem trạng thái gói.

Fields chính:

```txt
id
code
name
tax_code
phone
email
address
province
district
ward
representative_name
status
created_at
updated_at
```

Validation:

- Tên HTX bắt buộc.
- Mã HTX duy nhất.
- Số điện thoại hợp lệ.
- Email hợp lệ nếu có.
- Mã số thuế không trùng nếu có.

### 5.4. Subscription Plan Module

Super Admin quản lý gói.

| Gói | Giá | Số HTX | Số sản phẩm | Quyền lợi |
|---|---:|---:|---:|---|
| Free | 0đ | 1 | 10 | Đăng sản phẩm, QR truy xuất cơ bản |
| Basic | 299.000đ/tháng | 1 | 100 | QR Passport, hồ sơ vùng trồng, hỗ trợ cơ bản |
| Pro | 999.000đ/tháng | 1 | Không giới hạn | Báo cáo, QR Passport, hỗ trợ ưu tiên |
| Enterprise | Liên hệ | Nhiều HTX | Không giới hạn | Xuất khẩu, tùy chỉnh, hợp đồng riêng |

Bản đầu chưa cần khóa tính năng theo gói, nhưng database phải có cột để sau này bật giới hạn.

Fields:

```txt
id
name
slug
price_monthly
price_yearly
max_cooperatives
max_products
max_members
max_zones
features_json
is_active
created_at
updated_at
```

API:

```txt
GET    /api/v1/subscription-plans
POST   /api/v1/subscription-plans
GET    /api/v1/subscription-plans/:id
PATCH  /api/v1/subscription-plans/:id
DELETE /api/v1/subscription-plans/:id
```

### 5.5. Cooperative Subscription Module

Gán gói cho HTX.

Fields:

```txt
id
cooperative_id
plan_id
status
start_date
end_date
auto_renew
note
created_by
created_at
updated_at
```

Status:

```txt
ACTIVE
TRIAL
EXPIRED
CANCELLED
SUSPENDED
```

API:

```txt
POST  /api/v1/cooperatives/:id/subscription
GET   /api/v1/cooperatives/:id/subscription
PATCH /api/v1/cooperatives/:id/subscription
POST  /api/v1/cooperatives/:id/subscription/renew
POST  /api/v1/cooperatives/:id/subscription/cancel
```

### 5.6. Invoice Module

Quản lý hóa đơn thu phí HTX.

Fields:

```txt
id
cooperative_id
subscription_id
invoice_code
amount
currency
status
due_date
paid_at
payment_method
note
created_at
updated_at
```

Status:

```txt
DRAFT
UNPAID
PAID
OVERDUE
CANCELLED
```

Bản đầu:

- Cho Super Admin tạo hóa đơn thủ công.
- Cho đánh dấu đã thanh toán.
- Chưa cần tích hợp cổng thanh toán online.
- Có thể xuất PDF hóa đơn sau.

### 5.7. Product Module

Fields:

```txt
id
cooperative_id
category_id
name
slug
description
price
unit
status
thumbnail_file_id
created_by
created_at
updated_at
```

Status:

```txt
DRAFT
PUBLISHED
HIDDEN
ARCHIVED
```

Validation:

- Tên sản phẩm bắt buộc.
- Giá >= 0.
- Đơn vị bắt buộc.
- Slug duy nhất trong HTX.
- Chỉ Admin HTX/thành viên có quyền mới được sửa.

### 5.8. Zone Module

Fields:

```txt
id
cooperative_id
name
code
address
area_m2
geojson
latitude
longitude
status
created_at
updated_at
```

Validation:

- Tên vùng bắt buộc.
- Diện tích > 0 nếu nhập.
- Tọa độ hợp lệ.
- GeoJSON hợp lệ nếu có.

### 5.9. Farming Log Module

Fields:

```txt
id
cooperative_id
product_id
zone_id
actor_id
log_date
activity_type
description
input_materials_json
images_json
status
created_at
updated_at
```

Activity type:

```txt
SEEDING
WATERING
FERTILIZING
PEST_CONTROL
HARVESTING
PACKAGING
TRANSPORT
OTHER
```

Validation:

- Ngày nhật ký không được lớn hơn hiện tại.
- Nội dung bắt buộc.
- Product phải thuộc cùng HTX.
- Zone phải thuộc cùng HTX.
- File ảnh đúng định dạng.

### 5.10. Traceability Passport Module

Fields:

```txt
id
cooperative_id
product_id
passport_code
public_slug
qr_file_id
status
published_at
expired_at
created_at
updated_at
```

API public:

```txt
GET /api/v1/public/passports/:code
```

Trang frontend:

```txt
/public/passport/[code]
```

### 5.11. File Module

Fields:

```txt
id
cooperative_id
owner_id
bucket
object_key
public_url
mime_type
size_bytes
checksum
visibility
created_at
updated_at
```

API:

```txt
POST /api/v1/files/presign-upload
POST /api/v1/files/confirm-upload
GET  /api/v1/files/:id
DELETE /api/v1/files/:id
```

Validation:

- Chỉ cho MIME type hợp lệ.
- Giới hạn dung lượng.
- Không cho upload file thực thi.
- Kiểm tra quyền HTX.

---

## 6. Database schema khởi tạo

Các bảng lõi:

```txt
users
roles
permissions
role_permissions
user_roles
cooperatives
cooperative_members
subscription_plans
cooperative_subscriptions
subscription_invoices
products
product_categories
product_images
zones
farming_logs
farming_log_files
traceability_passports
passport_certifications
passport_events
orders
order_items
payments
files
notifications
reports
settings
audit_logs
```

### 6.1. Quy tắc multi-tenant

Các bảng nghiệp vụ phải có:

```txt
cooperative_id
```

Ví dụ:

```txt
products.cooperative_id
zones.cooperative_id
farming_logs.cooperative_id
traceability_passports.cooperative_id
orders.cooperative_id
files.cooperative_id
```

Service backend phải luôn filter:

```ts
where: {
  cooperativeId: currentUser.cooperativeId
}
```

Trừ khi user là `SUPER_ADMIN`.

### 6.2. Index bắt buộc

```sql
CREATE INDEX idx_products_cooperative_id ON products(cooperative_id);
CREATE INDEX idx_zones_cooperative_id ON zones(cooperative_id);
CREATE INDEX idx_farming_logs_cooperative_id ON farming_logs(cooperative_id);
CREATE INDEX idx_passports_code ON traceability_passports(passport_code);
CREATE INDEX idx_subscriptions_cooperative_id ON cooperative_subscriptions(cooperative_id);
CREATE INDEX idx_invoices_cooperative_id ON subscription_invoices(cooperative_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
```

---

## 7. API chuẩn

API prefix:

```txt
/api/v1
```

Response chuẩn:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

Error chuẩn:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

Pagination:

```txt
GET /api/v1/products?page=1&limit=20&search=gao&status=PUBLISHED
```

Response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 8. UI/UX mobile-first

### 8.1. Layout chính

Public site:

- Trang chủ.
- Danh sách sản phẩm.
- Chi tiết sản phẩm.
- Trang quét QR Passport.
- Đăng nhập/đăng ký.

Dashboard HTX mobile:

```txt
Bottom navigation:
- Tổng quan
- Sản phẩm
- Nhật ký
- QR
- Tài khoản
```

Dashboard HTX desktop:

```txt
Sidebar:
- Dashboard
- HTX
- Thành viên
- Sản phẩm
- Vùng trồng
- Nhật ký
- QR Passport
- Đơn hàng
- Báo cáo
- Cài đặt
```

Super Admin:

```txt
- Tổng quan hệ thống
- Quản lý HTX
- Gói dịch vụ
- Gán gói HTX
- Hóa đơn
- Người dùng
- Báo cáo doanh thu
- Cấu hình hệ thống
```

### 8.2. Form UX

Quy tắc:

- Form dài chia thành step.
- Có autosave draft nếu phù hợp.
- Có loading state khi submit.
- Disable nút submit khi đang xử lý.
- Lỗi form hiển thị dưới input.
- Lỗi API hiển thị toast + alert box.
- Thành công hiển thị toast.
- Không mất dữ liệu khi lỗi validation.
- Input số có format tiền/diện tích rõ ràng.
- Upload file có preview.
- Mobile dùng camera/file picker dễ thao tác.

---

## 9. Validation matrix bắt buộc

### 9.1. Auth

| Form | Case | Kết quả mong muốn |
|---|---|---|
| Đăng nhập | Email rỗng | Báo lỗi |
| Đăng nhập | Email sai định dạng | Báo lỗi |
| Đăng nhập | Password rỗng | Báo lỗi |
| Đăng nhập | Sai tài khoản | Báo lỗi chung |
| Đăng ký | Email trùng | Báo lỗi |
| Đăng ký | Password < 8 ký tự | Báo lỗi |
| Quên mật khẩu | Email không tồn tại | Báo thông báo an toàn |
| Reset mật khẩu | Token hết hạn | Báo lỗi |

### 9.2. HTX

| Case | Kết quả mong muốn |
|---|---|
| Tên HTX rỗng | Báo lỗi |
| Mã HTX trùng | Báo lỗi |
| SĐT sai định dạng | Báo lỗi |
| Email sai định dạng | Báo lỗi |
| Tạo HTX hợp lệ | Thành công |
| Admin HTX xem HTX khác | 403 |

### 9.3. Gói SaaS

| Case | Kết quả mong muốn |
|---|---|
| Giá âm | Báo lỗi |
| max_products âm | Báo lỗi |
| Slug gói trùng | Báo lỗi |
| Gói inactive | Không cho gán mới |
| Gán gói hợp lệ | Thành công |
| Gia hạn ngày kết thúc nhỏ hơn ngày bắt đầu | Báo lỗi |

### 9.4. Hóa đơn

| Case | Kết quả mong muốn |
|---|---|
| Amount âm | Báo lỗi |
| Due date sai | Báo lỗi |
| Mark paid hóa đơn cancelled | Báo lỗi |
| Mark paid hóa đơn unpaid | Thành công |
| User không phải Super Admin sửa hóa đơn | 403 |

### 9.5. Sản phẩm

| Case | Kết quả mong muốn |
|---|---|
| Tên rỗng | Báo lỗi |
| Giá âm | Báo lỗi |
| Unit rỗng | Báo lỗi |
| Category không tồn tại | Báo lỗi |
| Upload file sai định dạng | Báo lỗi |
| Tạo sản phẩm hợp lệ | Thành công |
| Admin HTX A sửa sản phẩm HTX B | 403 |

### 9.6. Vùng trồng

| Case | Kết quả mong muốn |
|---|---|
| Tên vùng rỗng | Báo lỗi |
| Diện tích <= 0 | Báo lỗi |
| Latitude ngoài khoảng -90 đến 90 | Báo lỗi |
| Longitude ngoài khoảng -180 đến 180 | Báo lỗi |
| GeoJSON sai | Báo lỗi |
| Tạo vùng hợp lệ | Thành công |

### 9.7. Nhật ký canh tác

| Case | Kết quả mong muốn |
|---|---|
| Ngày lớn hơn hiện tại | Báo lỗi |
| Nội dung rỗng | Báo lỗi |
| Product khác HTX | 403 |
| Zone khác HTX | 403 |
| File quá lớn | Báo lỗi |
| Tạo log hợp lệ | Thành công |

### 9.8. QR Passport

| Case | Kết quả mong muốn |
|---|---|
| Product không tồn tại | Báo lỗi |
| Product khác HTX | 403 |
| Passport code trùng | Tự sinh code khác hoặc báo lỗi |
| Public passport tồn tại | Hiển thị đúng |
| Public passport bị ẩn | Không hiển thị |

---

## 10. Testing strategy

### 10.1. Backend test

Dùng:

```txt
Jest
Supertest
Testcontainers hoặc PostgreSQL test container
```

Test bắt buộc:

```txt
- Unit test service
- Unit test guard
- Unit test validation DTO
- Integration test API
- Auth test
- RBAC test
- Multi-tenant isolation test
- Prisma transaction test
- Upload presigned URL test
```

Lệnh:

```bash
cd backend
npm run test
npm run test:cov
npm run test:e2e
```

Quality gate:

```txt
- Unit test pass 100%
- Integration test pass 100%
- E2E API pass 100%
- Không có lỗi TypeScript
- Không có lỗi ESLint nghiêm trọng
```

### 10.2. Frontend test

Dùng:

```txt
Vitest
React Testing Library
Playwright
```

Test bắt buộc:

```txt
- Component render test
- Form validation test
- API loading/error/success state
- Mobile responsive snapshot cơ bản
- Route protection test
```

Lệnh:

```bash
cd frontend
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

### 10.3. E2E test bằng Playwright

Flow bắt buộc:

```txt
1. Super Admin đăng nhập.
2. Tạo HTX.
3. Tạo gói Free.
4. Tạo gói Basic.
5. Gán gói Basic cho HTX.
6. Tạo tài khoản Admin HTX.
7. Admin HTX đăng nhập.
8. Tạo sản phẩm.
9. Upload ảnh sản phẩm.
10. Tạo vùng trồng.
11. Tạo nhật ký canh tác.
12. Tạo QR Passport.
13. Mở trang public QR Passport.
14. Super Admin tạo hóa đơn.
15. Super Admin mark paid hóa đơn.
16. Kiểm tra báo cáo doanh thu.
```

Mobile E2E bắt buộc:

```txt
- iPhone viewport 390x844
- Android viewport 412x915
- Form sản phẩm trên mobile
- Quét/xem QR Passport trên mobile
- Dashboard HTX trên mobile
```

### 10.4. CI/CD test

GitHub Actions phải chạy:

```txt
- Install deps
- Backend lint
- Backend typecheck
- Backend unit test
- Backend integration test
- Frontend lint
- Frontend typecheck
- Frontend unit test
- Playwright E2E
- Docker build
```

Không cho merge nếu test fail.

---

## 11. Docker Compose production

File: `docker-compose.prod.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: agri_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - agri_internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: agri_redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    networks:
      - agri_internal
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: agri_backend
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - agri_internal
    expose:
      - "3001"
    command: sh -c "npx prisma migrate deploy && node dist/main.js"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: agri_frontend
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      - backend
    networks:
      - agri_internal
    expose:
      - "3000"

  nginx:
    image: nginx:1.27-alpine
    container_name: agri_nginx
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./nginx/logs:/var/log/nginx
    networks:
      - agri_internal

  backup:
    image: postgres:16-alpine
    container_name: agri_backup
    restart: unless-stopped
    env_file:
      - .env.production
    volumes:
      - ./backups:/backups
      - ./scripts/backup-db.sh:/backup-db.sh:ro
    networks:
      - agri_internal
    entrypoint: ["/bin/sh", "-c"]
    command: "while true; do /backup-db.sh; sleep 86400; done"

volumes:
  postgres_data:
  redis_data:

networks:
  agri_internal:
    driver: bridge
```

---

## 12. Dockerfile backend

File: `backend/Dockerfile`

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

---

## 13. Dockerfile frontend

File: `frontend/Dockerfile`

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 14. Nginx production config

File: `nginx/prod.conf`

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://backend:3001/health;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Nếu dùng SSL tại Nginx, thêm cert vào `nginx/certs`.

Nếu dùng Cloudflare proxy + SSL ở edge, vẫn nên cấu hình SSL đúng tại origin để dùng Full Strict.

---

## 15. Environment variables

File: `.env.production`

```env
# App
NODE_ENV=production
APP_NAME=Agri Passport
APP_URL=https://YOUR_DOMAIN.com
FRONTEND_URL=https://YOUR_DOMAIN.com
API_URL=https://YOUR_DOMAIN.com/api/v1

# PostgreSQL
POSTGRES_DB=agri_passport
POSTGRES_USER=agri_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DATABASE_URL=postgresql://agri_user:CHANGE_ME_STRONG_PASSWORD@postgres:5432/agri_passport?schema=public

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# JWT
JWT_ACCESS_SECRET=CHANGE_ME_ACCESS_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudflare R2
R2_ACCOUNT_ID=CHANGE_ME
R2_ACCESS_KEY_ID=CHANGE_ME
R2_SECRET_ACCESS_KEY=CHANGE_ME
R2_BUCKET=agri-passport
R2_PUBLIC_BASE_URL=https://cdn.YOUR_DOMAIN.com

# Security
CORS_ORIGIN=https://YOUR_DOMAIN.com
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=120

# Super Admin seed
SEED_SUPER_ADMIN_EMAIL=admin@YOUR_DOMAIN.com
SEED_SUPER_ADMIN_PASSWORD=CHANGE_ME_ADMIN_PASSWORD
```

---

## 16. Cloudflare setup

### 16.1. DNS

Tạo bản ghi:

```txt
A     @       VPS_IP      Proxied
CNAME www     @           Proxied
CNAME cdn     R2_PUBLIC_DOMAIN hoặc custom R2 domain
```

### 16.2. SSL/TLS

Khuyến nghị:

```txt
SSL/TLS mode: Full (strict)
Always Use HTTPS: ON
Automatic HTTPS Rewrites: ON
```

### 16.3. R2 bucket

Tạo bucket:

```txt
agri-passport
```

Folder logic:

```txt
products/
zones/
farming-logs/
certifications/
passports/
reports/
avatars/
tmp/
```

CORS mẫu:

```json
[
  {
    "AllowedOrigins": ["https://YOUR_DOMAIN.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["Content-Type", "Authorization", "x-amz-*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 17. Reset VPS cũ

> Cảnh báo: phần này có thể xóa site cũ. Chỉ chạy khi đã chắc chắn bỏ site hiện tại. Nên backup trước khi xóa.

### 17.1. Biến cần đổi

```bash
export APP_DIR="/opt/agri-passport"
export OLD_BACKUP_DIR="/root/old-site-backup-$(date +%Y%m%d-%H%M%S)"
export DOMAIN="YOUR_DOMAIN.com"
```

### 17.2. SSH vào VPS

```bash
ssh root@YOUR_VPS_IP
```

### 17.3. Kiểm tra dịch vụ đang chạy

```bash
whoami
hostname
lsb_release -a || cat /etc/os-release

ss -tulpn | grep -E ':80|:443|:3000|:3001|:5432|:6379' || true
docker ps -a || true
systemctl status nginx --no-pager || true
pm2 list || true
ls -la /var/www || true
ls -la /etc/nginx/sites-enabled || true
```

### 17.4. Backup site cũ trước khi xóa

```bash
mkdir -p "$OLD_BACKUP_DIR"

cp -a /var/www "$OLD_BACKUP_DIR/var-www" 2>/dev/null || true
cp -a /etc/nginx "$OLD_BACKUP_DIR/nginx" 2>/dev/null || true
docker ps -a > "$OLD_BACKUP_DIR/docker-ps.txt" 2>/dev/null || true
pm2 list > "$OLD_BACKUP_DIR/pm2-list.txt" 2>/dev/null || true
crontab -l > "$OLD_BACKUP_DIR/crontab.txt" 2>/dev/null || true

echo "Backup saved to: $OLD_BACKUP_DIR"
```

### 17.5. Dừng site cũ

Nếu site cũ chạy Docker:

```bash
docker ps
```

Nếu có docker compose ở thư mục cũ:

```bash
find / -name "docker-compose.yml" -o -name "compose.yml" 2>/dev/null
```

Vào đúng thư mục cũ rồi chạy:

```bash
docker compose down
```

Nếu không biết, chỉ dừng container không cần thiết:

```bash
docker stop $(docker ps -q) 2>/dev/null || true
```

Nếu có PM2:

```bash
pm2 stop all || true
pm2 delete all || true
pm2 save || true
```

Nếu có Nginx system cũ:

```bash
systemctl stop nginx || true
```

### 17.6. Xóa cấu hình Nginx cũ

```bash
mkdir -p /root/nginx-old-disabled
mv /etc/nginx/sites-enabled/* /root/nginx-old-disabled/ 2>/dev/null || true
mv /etc/nginx/conf.d/*.conf /root/nginx-old-disabled/ 2>/dev/null || true
```

### 17.7. Xóa thư mục web cũ nếu chắc chắn

Kiểm tra trước:

```bash
ls -la /var/www
```

Nếu chắc chắn bỏ:

```bash
rm -rf /var/www/*
```

### 17.8. Dọn Docker cũ

Cẩn thận: lệnh này xóa container/image/network không dùng.

```bash
docker system prune -af
```

Không chạy `docker volume prune` nếu chưa backup database cũ.

Nếu chắc chắn bỏ hết volume cũ:

```bash
docker volume ls
# Chỉ chạy nếu chắc chắn:
# docker volume prune -f
```

---

## 18. Cài đặt VPS mới

### 18.1. Update hệ thống

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg git ufw htop unzip jq
```

### 18.2. Cài Docker theo apt repository

```bash
install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update

apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version
```

### 18.3. Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

Không mở trực tiếp PostgreSQL/Redis ra ngoài.

---

## 19. Deploy production

### 19.1. Tạo thư mục app

```bash
mkdir -p /opt/agri-passport
cd /opt/agri-passport
```

### 19.2. Clone code

```bash
git clone YOUR_GIT_REPO_URL .
```

Hoặc upload source lên VPS rồi giải nén.

### 19.3. Tạo env

```bash
cp .env.example .env.production
nano .env.production
```

Bắt buộc đổi:

```txt
DOMAIN
POSTGRES_PASSWORD
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
R2 keys
SEED_SUPER_ADMIN_EMAIL
SEED_SUPER_ADMIN_PASSWORD
```

Sinh secret nhanh:

```bash
openssl rand -base64 48
```

### 19.4. Sửa Nginx domain

```bash
nano nginx/prod.conf
```

Đổi:

```txt
YOUR_DOMAIN.com
```

thành domain thật.

### 19.5. Build và chạy

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Kiểm tra:

```bash
docker compose -f docker-compose.prod.yml ps
docker logs agri_backend --tail=100
docker logs agri_frontend --tail=100
docker logs agri_nginx --tail=100
```

### 19.6. Chạy seed Super Admin

```bash
docker exec -it agri_backend npm run seed:prod
```

### 19.7. Smoke test

```bash
curl -I http://localhost
curl http://localhost/health
curl https://YOUR_DOMAIN.com/health
```

Frontend:

```txt
https://YOUR_DOMAIN.com
```

Swagger:

```txt
https://YOUR_DOMAIN.com/api/docs
```

---

## 20. Script deploy

File: `scripts/deploy.sh`

```bash
#!/usr/bin/env bash
set -e

APP_DIR="/opt/agri-passport"

cd "$APP_DIR"

echo "Pull latest code..."
git pull

echo "Build and restart containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Run migrations..."
docker exec agri_backend npx prisma migrate deploy

echo "Health check..."
sleep 5
docker compose -f docker-compose.prod.yml ps
curl -f http://localhost/health || exit 1

echo "Deploy done."
```

Cấp quyền:

```bash
chmod +x scripts/deploy.sh
```

Chạy:

```bash
./scripts/deploy.sh
```

---

## 21. Backup PostgreSQL

File: `scripts/backup-db.sh`

```bash
#!/usr/bin/env sh
set -e

BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d-%H%M%S")
FILE="$BACKUP_DIR/agri-passport-$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h postgres \
  -U "$POSTGRES_USER" \
  "$POSTGRES_DB" | gzip > "$FILE"

find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete

echo "Backup created: $FILE"
```

Restore:

```bash
gunzip -c backups/agri-passport-YYYYMMDD-HHMMSS.sql.gz | \
docker exec -i agri_postgres psql -U agri_user -d agri_passport
```

---

## 22. Monitoring tối thiểu

### 22.1. Health endpoints

Backend cần có:

```txt
GET /health
GET /api/v1/health
```

Trả về:

```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "time": "2026-xx-xxT00:00:00Z"
}
```

### 22.2. Log

```bash
docker logs agri_backend --tail=200 -f
docker logs agri_frontend --tail=200 -f
docker logs agri_nginx --tail=200 -f
docker logs agri_postgres --tail=100 -f
```

### 22.3. Disk/RAM

```bash
df -h
du -sh /opt/agri-passport/*
docker system df
htop
docker stats
```

---

## 23. Security checklist

### 23.1. VPS

- SSH dùng key, hạn chế password login nếu có thể.
- Chỉ mở port 22, 80, 443.
- PostgreSQL không public.
- Redis không public.
- Backup định kỳ.
- Update hệ thống định kỳ.
- Không để `.env.production` public.

### 23.2. Backend

- Helmet.
- CORS đúng domain.
- Rate limit login.
- JWT secret mạnh.
- Refresh token có rotation nếu làm được.
- Password hash bằng bcrypt/argon2.
- DTO validation toàn bộ endpoint.
- Prisma query không nối chuỗi SQL bừa.
- RBAC guard toàn bộ route admin.
- Audit log thao tác quan trọng.

### 23.3. Frontend

- Không lưu access token trong localStorage nếu có thể tránh.
- Nếu dùng cookie: HttpOnly, Secure, SameSite.
- Không hiển thị lỗi nhạy cảm.
- Không expose secret frontend.
- Validate input trước khi gửi.

### 23.4. R2

- Presigned URL ngắn hạn.
- Giới hạn Content-Type.
- Giới hạn size.
- Bucket private mặc định nếu file không cần public.
- Public passport chỉ expose file public cần thiết.

---

## 24. Quy trình phát triển phần mềm

### 24.1. Giai đoạn 1 — Phân tích

Deliverables:

- Danh sách actor.
- Danh sách use case.
- ERD.
- API contract.
- UI sitemap.
- Validation matrix.
- Test plan.

### 24.2. Giai đoạn 2 — Setup nền tảng

Deliverables:

- Monorepo.
- Docker dev.
- PostgreSQL.
- Redis.
- NestJS base.
- Next.js base.
- Auth base.
- Swagger.
- CI pipeline.

### 24.3. Giai đoạn 3 — Core SaaS

Deliverables:

- User/RBAC.
- HTX.
- Gói dịch vụ.
- Gán gói.
- Hóa đơn.
- Dashboard Super Admin.

### 24.4. Giai đoạn 4 — Agri Passport

Deliverables:

- Sản phẩm.
- Vùng trồng.
- Nhật ký canh tác.
- File upload R2.
- QR Passport.
- Trang public passport.

### 24.5. Giai đoạn 5 — Mobile-first polish

Deliverables:

- Responsive toàn bộ màn.
- Bottom nav mobile.
- Card table mobile.
- Skeleton loading.
- Toast/confirm.
- Empty state.
- Error state.

### 24.6. Giai đoạn 6 — Testing

Deliverables:

- Backend unit/integration pass.
- Frontend component/form pass.
- Playwright E2E pass.
- Validation từng form pass.
- Mobile viewport pass.
- Docker build pass.

### 24.7. Giai đoạn 7 — Deploy

Deliverables:

- VPS reset sạch.
- Docker installed.
- Cloudflare DNS.
- R2 configured.
- Production env.
- App chạy HTTPS.
- Backup DB.
- Smoke test.
- Tài liệu bàn giao.

---

## 25. Definition of Done

Một chức năng chỉ được coi là xong khi:

```txt
- Có UI mobile-first.
- Có API backend.
- Có DTO validation.
- Có frontend validation.
- Có phân quyền.
- Có loading/error/success state.
- Có test case.
- Test pass.
- Không lỗi TypeScript.
- Không lỗi lint nghiêm trọng.
- Có log lỗi backend.
- Có audit log nếu là thao tác quan trọng.
```

---

## 26. Checklist trước khi production

```txt
[ ] Domain trỏ đúng VPS.
[ ] Cloudflare proxy bật.
[ ] SSL hoạt động.
[ ] Docker compose up xanh.
[ ] Backend health OK.
[ ] Frontend mở được.
[ ] Swagger mở được hoặc khóa nếu không muốn public.
[ ] PostgreSQL migrate xong.
[ ] Super Admin seed xong.
[ ] R2 upload test OK.
[ ] Tạo HTX test OK.
[ ] Tạo gói test OK.
[ ] Gán gói HTX OK.
[ ] Tạo sản phẩm OK.
[ ] Upload ảnh OK.
[ ] Tạo QR Passport OK.
[ ] Public passport mở được.
[ ] Backup DB chạy OK.
[ ] Playwright E2E pass.
[ ] Mobile test pass.
[ ] Không lộ .env.
[ ] Port 5432/6379 không public.
```

---

## 27. Lệnh vận hành nhanh

Start:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

Restart backend:

```bash
docker restart agri_backend
```

Xem log backend:

```bash
docker logs agri_backend -f --tail=200
```

Migrate:

```bash
docker exec -it agri_backend npx prisma migrate deploy
```

Backup DB:

```bash
docker exec -it agri_backup /backup-db.sh
```

---

## 28. Roadmap sau MVP

Sau khi MVP ổn định:

```txt
- Khóa tính năng theo gói.
- Thanh toán online VNPay/MoMo/ZaloPay.
- SMS OTP.
- App mobile native nếu thật sự cần.
- Offline-first cho nông dân.
- AI tạo mô tả sản phẩm.
- OCR chứng nhận.
- Bản đồ vùng trồng nâng cao.
- Báo cáo xuất khẩu.
- Tem QR hàng loạt.
- API public cho đối tác.
```

---

## 29. Chốt cuối

Stack chính thức:

```txt
Web-only SaaS
Mobile-first
Next.js + NestJS + PostgreSQL + Prisma + Redis
Docker Compose trên VPS
Cloudflare DNS/CDN/WAF + R2 Storage
Có gói SaaS theo HTX để thu phí
Bản đầu chưa cần khóa tính năng theo gói
Auto test backend/frontend/E2E
Validation 2 lớp cho mọi form
Triển khai production bằng Docker
```

Ưu tiên:

```txt
1. Dễ dùng.
2. Chi phí thấp.
3. Dễ deploy.
4. Dễ backup.
5. Dễ mở rộng.
6. Mobile mượt như app native.
7. Test kỹ, pass 100% test case đã định nghĩa.
```
