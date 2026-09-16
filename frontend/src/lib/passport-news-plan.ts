export type PassportNewsPlanItem = {
  category: string;
  categorySlug: string;
  title: string;
  slug: string;
};

// Editorial topics from “Tin tức - Agripassport.docx”. The plan is only
// available in the Passport editor so topics cannot be assigned to another site.
export const PASSPORT_NEWS_PLAN: readonly PassportNewsPlanItem[] = [
  { category: 'Nông nghiệp', categorySlug: 'chuyen-doi-so', title: 'Nhật ký sản xuất điện tử là gì? Lợi ích cho nông hộ và hợp tác xã', slug: 'nhat-ky-san-xuat-dien-tu' },
  { category: 'Nông nghiệp', categorySlug: 'chuyen-doi-so', title: 'Số hóa vùng trồng: Vì sao dữ liệu từng khu vực sản xuất ngày càng quan trọng?', slug: 'so-hoa-vung-trong-du-lieu-khu-vuc-san-xuat' },
  { category: 'Nông nghiệp', categorySlug: 'chuyen-doi-so', title: 'Quản lý mùa vụ bằng dữ liệu: Giải pháp giúp hợp tác xã giảm sai sót trong sản xuất', slug: 'quan-ly-mua-vu-bang-du-lieu' },
  { category: 'Nông nghiệp', categorySlug: 'chuyen-doi-so', title: 'Từ nhật ký canh tác đến hồ sơ sản phẩm: Cách chuẩn hóa dữ liệu nông nghiệp', slug: 'tu-nhat-ky-canh-tac-den-ho-so-san-pham' },
  { category: 'Nông nghiệp', categorySlug: 'chuyen-doi-so', title: '5 bước xây dựng quy trình quản lý sản xuất nông nghiệp bằng dữ liệu số', slug: '5-buoc-xay-dung-quy-trinh-quan-ly-san-xuat-nong-nghiep' },
  { category: 'Truy xuất', categorySlug: 'truy-xuat-nguon-goc', title: 'Hồ sơ truy xuất sản phẩm gồm những gì? Hướng dẫn xây dựng từ A - Z', slug: 'ho-so-truy-xuat-san-pham-gom-nhung-gi' },
  { category: 'Truy xuất', categorySlug: 'truy-xuat-nguon-goc', title: 'Truy xuất nguồn gốc cho nông sản cần cập nhật dữ liệu ở những công đoạn nào?', slug: 'truy-xuat-nguon-goc-can-cap-nhat-du-lieu-cong-doan-nao' },
  { category: 'Truy xuất', categorySlug: 'truy-xuat-nguon-goc', title: 'Tem truy xuất điện tử khác gì tem thông tin sản phẩm thông thường?', slug: 'tem-truy-xuat-dien-tu-khac-gi-tem-thong-tin-san-pham' },
  { category: 'Truy xuất', categorySlug: 'truy-xuat-nguon-goc', title: 'Doanh nghiệp và hợp tác xã cần chuẩn bị gì trước khi triển khai truy xuất nguồn gốc?', slug: 'doanh-nghiep-hop-tac-xa-can-chuan-bi-truoc-truy-xuat' },
  { category: 'Truy xuất', categorySlug: 'truy-xuat-nguon-goc', title: 'Làm thế nào để xây dựng hệ thống truy xuất đơn giản nhưng hiệu quả cho nông sản?', slug: 'xay-dung-he-thong-truy-xuat-don-gian-hieu-qua' },
  { category: 'Hợp tác', categorySlug: 'tin-htx', title: 'Hồ sơ hợp tác xã cần có những thông tin gì để tăng độ tin cậy với đối tác?', slug: 'ho-so-hop-tac-xa-can-co-thong-tin-gi' },
  { category: 'Hợp tác', categorySlug: 'tin-htx', title: 'Hợp tác xã có nhiều sản phẩm nên quản lý thông tin sản phẩm như thế nào?', slug: 'hop-tac-xa-nhieu-san-pham-quan-ly-thong-tin-the-nao' },
  { category: 'Hợp tác', categorySlug: 'tin-htx', title: 'Cách giới thiệu hợp tác xã và vùng sản xuất chuyên nghiệp trên nền tảng số', slug: 'gioi-thieu-hop-tac-xa-vung-san-xuat-tren-nen-tang-so' },
  { category: 'Hợp tác', categorySlug: 'tin-htx', title: '5 dữ liệu hợp tác xã nên chuẩn hóa trước khi kết nối với nhà phân phối', slug: '5-du-lieu-hop-tac-xa-nen-chuan-hoa' },
  { category: 'Hợp tác', categorySlug: 'tin-htx', title: 'Hợp tác xã muốn tìm đầu ra cho nông sản nên chuẩn bị hồ sơ số như thế nào?', slug: 'hop-tac-xa-tim-dau-ra-chuan-bi-ho-so-so' },
  { category: 'Sản phẩm', categorySlug: 'kien-thuc-nong-nghiep', title: 'Hồ sơ số sản phẩm nông sản là gì? Vì sao mỗi sản phẩm nên có một hồ sơ riêng?', slug: 'ho-so-so-san-pham-nong-san-la-gi' },
  { category: 'Sản phẩm', categorySlug: 'kien-thuc-nong-nghiep', title: 'Một hồ sơ sản phẩm nông nghiệp chuyên nghiệp cần những nội dung nào?', slug: 'ho-so-san-pham-nong-nghiep-chuyen-nghiep-can-noi-dung-gi' },
  { category: 'Sản phẩm', categorySlug: 'kien-thuc-nong-nghiep', title: 'Cách xây dựng câu chuyện sản phẩm để tăng niềm tin với người tiêu dùng', slug: 'xay-dung-cau-chuyen-san-pham-nong-nghiep' },
  { category: 'Sản phẩm', categorySlug: 'kien-thuc-nong-nghiep', title: 'Từ hình ảnh đến thông tin sản xuất: 8 yếu tố giúp hồ sơ nông sản chuyên nghiệp hơn', slug: '8-yeu-to-giup-ho-so-nong-san-chuyen-nghiep' },
  { category: 'Sản phẩm', categorySlug: 'kien-thuc-nong-nghiep', title: 'Số hóa danh mục sản phẩm giúp hợp tác xã quản lý và giới thiệu nông sản như thế nào?', slug: 'so-hoa-danh-muc-san-pham-hop-tac-xa' },
  { category: 'Thị trường', categorySlug: 'tin-thi-truong', title: 'Nông sản muốn vào hệ thống phân phối cần chuẩn bị hồ sơ sản phẩm như thế nào?', slug: 'nong-san-vao-he-thong-phan-phoi-can-ho-so-gi' },
  { category: 'Thị trường', categorySlug: 'tin-thi-truong', title: 'Nhà phân phối quan tâm những thông tin gì khi lựa chọn nông sản từ hợp tác xã?', slug: 'nha-phan-phoi-quan-tam-thong-tin-gi' },
  { category: 'Thị trường', categorySlug: 'tin-thi-truong', title: 'Cách xây dựng hình ảnh chuyên nghiệp cho nông sản địa phương trên môi trường số', slug: 'xay-dung-hinh-anh-nong-san-dia-phuong-tren-moi-truong-so' },
  { category: 'Thị trường', categorySlug: 'tin-thi-truong', title: 'Từ sản phẩm địa phương đến khách hàng mới: Vai trò của nền tảng số trong tiêu thụ nông sản', slug: 'san-pham-dia-phuong-den-khach-hang-moi' },
  { category: 'Thị trường', categorySlug: 'tin-thi-truong', title: 'Hợp tác xã có thể dùng dữ liệu sản phẩm để tăng cơ hội kết nối với đối tác như thế nào?', slug: 'du-lieu-san-pham-tang-co-hoi-ket-noi-doi-tac' },
  { category: 'Kiến thức', categorySlug: 'kien-thuc-nong-nghiep', title: 'QR Passport khác gì mã QR thông thường? Những điều cần biết', slug: 'qr-passport-khac-gi-ma-qr-thong-thuong' },
  { category: 'Kiến thức', categorySlug: 'kien-thuc-nong-nghiep', title: 'Hồ sơ số sản phẩm là gì? Giải thích đơn giản cho người mới bắt đầu', slug: 'ho-so-so-san-pham-la-gi' },
  { category: 'Kiến thức', categorySlug: 'kien-thuc-nong-nghiep', title: 'Dữ liệu sản phẩm gồm những gì? Hướng dẫn cho hợp tác xã và doanh nghiệp', slug: 'du-lieu-san-pham-gom-nhung-gi' },
  { category: 'Kiến thức', categorySlug: 'kien-thuc-nong-nghiep', title: 'Mã vùng trồng là gì và có vai trò gì trong chuỗi giá trị nông sản?', slug: 'ma-vung-trong-la-gi' },
  { category: 'Kiến thức', categorySlug: 'kien-thuc-nong-nghiep', title: 'Chuỗi cung ứng nông sản là gì? Vì sao cần minh bạch thông tin trong từng khâu?', slug: 'chuoi-cung-ung-nong-san-la-gi' }
] as const;
