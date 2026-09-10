# Ma trận đồng bộ giải pháp hữu ích

Tài liệu này đối chiếu phần mềm với bản mô tả giải pháp hữu ích về hệ thống định danh và truy xuất theo cá thể cây. Ma trận chỉ chứng minh sự đồng bộ kỹ thuật của phần mềm; không thay thế việc tra cứu, thẩm định pháp lý hoặc đánh giá khả năng bảo hộ.

| Mục trong bản mô tả | Entity / cơ chế | API | Giao diện | Kiểm thử |
| --- | --- | --- | --- | --- |
| Bộ định danh cá thể cây | `Tree.id`, `Tree.treeCode` unique, mã dạng `CROP-ZONE-SEQ` | `POST/PATCH /trees` | Tạo hộ chiếu cây, chi tiết cây | Sinh mã cây, cấm đổi mã, unique database |
| Bộ thu thập dữ liệu | `TreeEvent`, `TreeInput`, actor, ảnh và metadata | `POST/PATCH /trees/:id/events` | Nhật ký cây | Ngày quá khứ/hiện tại, tenant và quyền |
| Cơ sở dữ liệu hồ sơ cây | `Tree` liên kết `Cooperative`, `Zone`, `CropType` | `GET /trees`, `GET /trees/:id` | Danh sách và hộ chiếu cây | Tenant isolation |
| Bộ liên kết dữ liệu | `Tree -> Harvest -> LotTree -> Lot -> ProductBatch` | `POST /trees/:id/harvests`, `POST /lots/:id/trees`, `POST /product-batches` | Thu hoạch, lô sản phẩm, mã truy xuất | Chặn phân bổ vượt thu hoạch |
| Danh mục dùng chung | `CropType` seed 8 loại cây, có thể mở rộng | `GET/POST/PATCH /crop-types` | Select loại cây, cấu hình quản trị | Seed idempotent |
| Mã truy xuất | `TraceabilityCode`, `TREE` hoặc `PRODUCT_BATCH`, QR URL hiện tại | `GET/POST/PATCH /traceability-codes` | QR cây, QR sản phẩm, trạng thái public | Public readiness, QR public |
| Bộ giao diện truy xuất | Public DTO lọc vùng, tọa độ làm mờ và dữ liệu đã duyệt | `GET /public/trees/:treeCode`, `GET /public/trace/products/:productCode` | `/cay/{treeCode}`, `/truy-xuat/{productCode}` | Không lộ tọa độ chính xác/nội bộ |
| Bảo toàn lịch sử | Archive status + `AuditLogsService`, không xóa cứng bản ghi public mới | PATCH/DELETE archive endpoints | Trạng thái lưu trữ trong dashboard | Audit và giữ tương thích QR cũ |
| Phân quyền | `FARMER`, `ADMIN_HTX`, `MEMBER_HTX`, `SUPER_ADMIN`; chuẩn bị `ENTERPRISE`, `AUTHORITY` | Guards + permission catalog | Menu dashboard theo vai trò | Role/permission route tests |
| Tương thích hệ thống cũ | Giữ `Product`, `Zone`, `FarmingLog`, `TraceabilityPassport` | `/passport`, `/qr` và API cũ không đổi | Màn hình sản phẩm/vùng/QR cũ | Regression Playwright |

## Chuỗi kỹ thuật MVP

`Tạo vùng -> tạo cây -> mã cây bất biến -> nhật ký -> thu hoạch -> phân bổ vào lô -> ProductBatch -> QR -> truy xuất sản phẩm về cây`.

Migration `20260910120000_tree_traceability` chỉ tạo thêm enum, bảng, index và foreign key. Các bảng cũ không bị xóa hoặc đổi cấu trúc.
