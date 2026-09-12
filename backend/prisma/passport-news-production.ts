import { EDITORIAL_NEWS_ARTICLES } from './editorial-news';
import { EDITORIAL_NEWS_EXPANSION } from './editorial-news-expansion';
import { SEASON_MANAGEMENT_NEWS } from './editorial-news-season';
import { PASSPORT_EDITORIAL_NEWS_ARTICLES } from './editorial-news-passport';
import { PASSPORT_NEWS_CATALOG } from './passport-news-catalog';

// This article is kept here so the production seed does not import seed-demo.ts.
// Its wording follows the supplied Word source and excludes contact/footer copy.
const NONG_SAN_VIET_ARTICLE = {
  title: 'Nông sản Việt cần gì để mở rộng thị trường trong nước và quốc tế?',
  slug: 'nong-san-viet-can-gi-de-mo-rong-thi-truong-trong-nuoc-quoc-te',
  category: 'tin-thi-truong',
  coverKey: 'riceField',
  excerpt: 'Muốn đi xa, nông sản Việt cần hồ sơ sản phẩm đáng tin cậy, dữ liệu minh bạch, chất lượng ổn định và năng lực đáp ứng từng thị trường.',
  focusKeyword: 'nông sản Việt mở rộng thị trường',
  seoDescription: 'Muốn nông sản Việt đi xa, cần chuẩn hóa dữ liệu, minh bạch nguồn gốc, nâng chất lượng, chuẩn hóa vùng trồng và xây dựng hồ sơ sản phẩm đủ tin cậy cho người mua.',
  bodyHtml: `<p>Nông sản Việt Nam ngày càng hiện diện mạnh trên thị trường trong nước và quốc tế. Nhiều ngành hàng đã hình thành vùng sản xuất lớn, có doanh nghiệp chế biến, hợp tác xã và hệ thống phân phối tham gia sâu hơn vào chuỗi giá trị. Tuy nhiên, khi người mua yêu cầu ngày càng cao về chất lượng, an toàn, tính ổn định và minh bạch, câu hỏi không còn chỉ là “nông sản có ngon không?” mà là “ai sản xuất, sản xuất ở đâu, theo quy trình nào, lô hàng này có dữ liệu gì để chứng minh?”.</p><p>Đây là điểm chuyển quan trọng: nông sản muốn mở rộng thị trường phải chuyển từ tư duy bán một sản phẩm sang xây dựng một hồ sơ sản phẩm có thể kiểm chứng.</p><h2>1. Nông sản phải có hồ sơ rõ ràng</h2><p>Một sản phẩm muốn vào siêu thị, sàn thương mại điện tử, chuỗi bán lẻ, nhà hàng hay thị trường xuất khẩu cần nhiều hơn một cái tên và một bao bì đẹp. Người mua cần biết sản phẩm là gì, của đơn vị nào, đến từ vùng nào, tiêu chuẩn nào, quy cách ra sao và có thể kiểm tra thông tin ở đâu.</p><p>Một hồ sơ nông sản cơ bản nên có:</p><ul><li>Thông tin hợp tác xã, doanh nghiệp hoặc hộ sản xuất.</li><li>Tên sản phẩm, nhóm sản phẩm, mùa vụ và quy cách đóng gói.</li><li>Thông tin vùng sản xuất và phạm vi vùng trồng.</li><li>Quy trình sản xuất, nhật ký canh tác hoặc các dữ liệu liên quan.</li><li>Chứng nhận, tiêu chuẩn và tài liệu chất lượng nếu có.</li><li>Thông tin lô hàng, ngày sản xuất, thu hoạch và đóng gói khi phù hợp.</li><li>Hình ảnh sản phẩm, câu chuyện vùng sản xuất và thông tin liên hệ.</li><li>Mã QR hoặc cơ chế tra cứu thuận tiện cho người mua.</li></ul><p>Dữ liệu phải được chuẩn hóa trước khi công khai. QR chỉ có giá trị khi phía sau nó là dữ liệu rõ ràng, nhất quán và có trách nhiệm.</p><h2>2. Truy xuất nguồn gốc phải trở thành năng lực vận hành</h2><p>Truy xuất nguồn gốc không chỉ để người tiêu dùng quét QR. Về bản chất, đó là khả năng trả lời nhanh và có bằng chứng cho các câu hỏi: sản phẩm đến từ đâu, qua những khâu nào, thuộc lô nào và ai chịu trách nhiệm về dữ liệu.</p><p>Vì vậy, hợp tác xã và doanh nghiệp nên bắt đầu từ dữ liệu gốc về vùng sản xuất, thành viên, sản phẩm, nhật ký, lô hàng, chứng nhận và các hồ sơ liên quan. Khi dữ liệu gốc tốt, lớp QR công khai mới thực sự có giá trị.</p><h2>3. Chất lượng phải ổn định, không chỉ đạt một lần</h2><p>Thị trường nội địa có thể chấp nhận một số khác biệt giữa các vụ mùa, nhưng các kênh bán lẻ và thị trường quốc tế thường đòi hỏi mức độ ổn định cao hơn. Người mua không chỉ mua một mẻ hàng ngon nhất mà cần khả năng cung ứng lặp lại với chất lượng tương đương.</p><ul><li>Chuẩn hóa quy trình sản xuất và thu hoạch.</li><li>Quản lý vật tư đầu vào và thời điểm sử dụng.</li><li>Kiểm soát sau thu hoạch, phân loại và đóng gói.</li><li>Quản lý lô hàng để có thể đối soát.</li><li>Theo dõi phản hồi từ khách hàng và đối tác.</li><li>Xây dựng quy trình xử lý khi phát hiện sai lệch.</li></ul><h2>4. Vùng trồng phải trở thành một tài sản dữ liệu</h2><p>Với nhiều nông sản, câu chuyện về vùng trồng chính là một phần của giá trị sản phẩm. “Xoài từ đâu?”, “gạo của vùng nào?”, “trà từ vùng nào?” không còn chỉ là câu hỏi kể chuyện thương hiệu, đó còn là câu hỏi về khả năng xác định nguồn hàng.</p><p>Một vùng sản xuất được số hóa tốt giúp hợp tác xã trả lời được có bao nhiêu diện tích, bao nhiêu thành viên, sản lượng dự kiến, mùa vụ, sản phẩm nào đang được sản xuất và lô hàng nào đang được đưa ra thị trường. Đây là nền tảng để chuyển từ bán hàng theo cảm tính sang lập kế hoạch cung ứng dựa trên dữ liệu.</p><h2>5. Bao bì và thương hiệu phải giúp người mua hiểu nhanh</h2><p>Một sản phẩm tốt nhưng bao bì thiếu thông tin, hình ảnh thiếu nhất quán hoặc câu chuyện thương hiệu không rõ ràng sẽ khó tạo niềm tin. Đặc biệt trên môi trường số, người mua thường quyết định trong vài giây đầu tiên.</p><ul><li>Tên sản phẩm dễ nhớ, nhất quán.</li><li>Thông tin đơn vị sản xuất rõ ràng.</li><li>Quy cách và hướng dẫn bảo quản phù hợp.</li><li>QR truy xuất đặt ở vị trí dễ quét.</li><li>Hình ảnh thật, thống nhất giữa website, mạng xã hội và bao bì.</li><li>Câu chuyện sản phẩm ngắn gọn nhưng có bằng chứng.</li></ul><h2>6. Muốn đi quốc tế, phải chuẩn bị dữ liệu ngay từ trong nước</h2><p>Một sai lầm phổ biến là chỉ nghĩ đến truy xuất và hồ sơ chất lượng khi đã có đơn hàng xuất khẩu. Cách làm hiệu quả hơn là xây dựng dữ liệu ngay từ đầu, sau đó nâng cấp theo yêu cầu từng thị trường.</p><p>Mỗi thị trường có thể có yêu cầu riêng về an toàn thực phẩm, dư lượng, kiểm dịch, bao bì, ghi nhãn, tiêu chuẩn kỹ thuật, hồ sơ vùng sản xuất và truy xuất. Do đó, doanh nghiệp và hợp tác xã cần coi dữ liệu là hạ tầng xuất khẩu: càng chuẩn hóa sớm, chi phí chuyển đổi khi mở thị trường mới càng thấp.</p><h2>7. Hộ chiếu nông nghiệp có thể đóng vai trò gì?</h2><p>Hộ chiếu nông nghiệp được định hướng là lớp hồ sơ số giúp hợp tác xã, nông hộ và doanh nghiệp chuẩn hóa thông tin sản phẩm, công khai đúng phần cần thiết và kết nối QR truy xuất trên cùng một hệ thống dữ liệu.</p><p>Điểm cốt lõi của mô hình là quản trị dữ liệu trước, công khai đúng lớp sau. Dữ liệu sản phẩm được chuẩn hóa rồi có thể liên kết với vùng sản xuất, nhật ký, thu hoạch, lô hàng và mã truy xuất để người mua tra cứu thuận tiện.</p><ul><li>Chuẩn hóa thông tin hợp tác xã, vùng sản xuất và sản phẩm.</li><li>Tạo hồ sơ sản phẩm có cấu trúc rõ ràng.</li><li>Kết nối QR để người mua tra cứu nhanh trên điện thoại.</li><li>Đưa sản phẩm lên môi trường số và hỗ trợ kết nối tiêu thụ.</li><li>Tạo nền tảng dữ liệu để hợp tác xã từng bước nâng cấp năng lực thị trường.</li></ul><h2>8. Mô hình 5 lớp để một nông sản sẵn sàng mở rộng thị trường</h2><div class="table-wrap"><table><thead><tr><th>Lớp</th><th>Cần chuẩn bị</th><th>Kết quả</th></tr></thead><tbody><tr><td>Sản xuất</td><td>Quy trình, vùng, nhật ký, vật tư</td><td>Chất lượng ổn định</td></tr><tr><td>Dữ liệu</td><td>Đơn vị, sản phẩm, vùng, lô, chứng nhận</td><td>Hồ sơ kiểm chứng được</td></tr><tr><td>Minh bạch</td><td>QR và thông tin công khai</td><td>Tăng niềm tin</td></tr><tr><td>Thương mại</td><td>Bao bì, hình ảnh, giá, kênh bán</td><td>Dễ tiếp cận người mua</td></tr><tr><td>Thị trường</td><td>Tiêu chuẩn, đối tác, logistics</td><td>Có khả năng mở rộng</td></tr></tbody></table></div><h2>9. Hợp tác xã nên bắt đầu từ đâu nếu nguồn lực còn hạn chế?</h2><ol><li>Chọn một đến ba sản phẩm chủ lực.</li><li>Chuẩn hóa thông tin hợp tác xã và vùng sản xuất.</li><li>Lập danh sách dữ liệu tối thiểu cần thu thập.</li><li>Chuẩn hóa hồ sơ từng sản phẩm và lô.</li><li>Mở QR truy xuất cho sản phẩm đã đủ dữ liệu.</li><li>Đưa sản phẩm lên kênh số và thử nghiệm bán hàng.</li><li>Ghi nhận phản hồi, đơn hàng và dữ liệu thị trường.</li><li>Sau khi quy trình ổn định, mở rộng sang sản phẩm và vùng sản xuất khác.</li></ol><h2>10. Nông sản Việt muốn đi xa phải đi bằng dữ liệu</h2><p>Thị trường trong nước và quốc tế đang mở ra nhiều cơ hội, nhưng cơ hội sẽ thuộc về những sản phẩm có khả năng chứng minh giá trị chứ không chỉ kể về giá trị. Một quả xoài ngon, một túi gạo chất lượng hay một hộp trà đặc sản cần một hệ thống dữ liệu phía sau để người mua tin tưởng.</p><p>Vì vậy, bài toán của nông sản Việt không chỉ là sản xuất nhiều hơn. Đó là sản xuất chuẩn hơn, ghi nhận tốt hơn, minh bạch hơn và kết nối thị trường hiệu quả hơn.</p><p>Hộ chiếu nông nghiệp hướng đến một cách tiếp cận đơn giản: mỗi sản phẩm có một hồ sơ rõ ràng, mỗi vùng sản xuất có dữ liệu, mỗi QR dẫn đến thông tin có ý nghĩa và mỗi hợp tác xã có thể từng bước xây dựng năng lực bán hàng bằng dữ liệu.</p><p>Khi nông sản có “hộ chiếu dữ liệu”, câu chuyện từ vùng sản xuất đến người mua sẽ rõ ràng hơn và cánh cửa bước vào những thị trường lớn cũng rộng hơn.</p>`
} as const;

const NONG_SAN_VIET_ARTICLE_WITH_SOURCE_CONTEXT = {
  ...NONG_SAN_VIET_ARTICLE,
  bodyHtml: NONG_SAN_VIET_ARTICLE.bodyHtml.replace(
    '<h2>1. Nông sản phải có hồ sơ rõ ràng</h2>',
    '<p>Theo thông tin công bố trong tư liệu nguồn, đến giữa tháng 6/2026, hệ thống truy xuất nguồn gốc nông sản đã được triển khai tại 26 tỉnh, thành phố, với 18.500 sản phẩm thuộc 112 nhóm sản phẩm; hệ thống quản lý 919 lô hàng, 547 hộ sản xuất, 255 vùng trồng và 149 doanh nghiệp.</p><h2>1. Nông sản phải có hồ sơ rõ ràng</h2>'
  )
} as const;

const sourceArticles = [
  ...EDITORIAL_NEWS_ARTICLES,
  ...EDITORIAL_NEWS_EXPANSION,
  SEASON_MANAGEMENT_NEWS,
  ...PASSPORT_EDITORIAL_NEWS_ARTICLES,
  NONG_SAN_VIET_ARTICLE_WITH_SOURCE_CONTEXT
];

const sourceBySlug = new Map(sourceArticles.map((article) => [article.slug, article]));

for (const item of PASSPORT_NEWS_CATALOG) {
  if (!sourceBySlug.has(item.slug)) {
    throw new Error(`Passport news catalog is missing article source: ${item.slug}`);
  }
}

// Catalog order is the publication order used by both production and demo seeds.
export const PASSPORT_PRODUCTION_ARTICLES = PASSPORT_NEWS_CATALOG.map((item) => ({
  ...sourceBySlug.get(item.slug)!,
  category: item.category
}));

const coverFiles: Record<string, string> = {
  riceField: 'field-qr.webp',
  fieldQr: 'field-qr.webp',
  vegBasket: 'produce-label.webp',
  produceLabel: 'produce-label.webp',
  marketData: 'market-data.webp',
  mango: 'market-data.webp',
  coffee: 'field-qr.webp',
  cooperativeData: 'cooperative-data.webp',
  farm: 'cooperative-data.webp',
  orchard: 'cooperative-data.webp',
  market: 'market-data.webp',
  harvest: 'field-qr.webp',
  coopTeam: 'cooperative-data.webp',
  durian: 'market-data.webp'
};

export function passportNewsCoverUrl(coverKey: string) {
  const file = coverFiles[coverKey];
  if (!file) throw new Error(`Unknown Passport news cover key: ${coverKey}`);
  return `/news/${file}`;
}
