export function preparePassportNewsBody(bodyHtml: string) {
  return bodyHtml
    .replace(/https?:\/\/(?:www\.)?agripassport\.com\/?/gi, 'https://hochieunongnghiep.com')
    .replace(/\bAGRIPASSPORT\b/gi, 'Hộ chiếu nông nghiệp')
    .replace(/\bHTXONLINE\b/gi, 'lớp quản trị nội bộ')
    .replace(/\bCOD\b/gi, 'quy trình giao nhận')
    .replace(/\bGiỏ hàng\b/gi, 'danh mục sản phẩm')
    .replace(/Thanh toán quy trình giao nhận/gi, 'quy trình giao nhận');
}
