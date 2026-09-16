import type { Metadata } from 'next';
import { type PublicSiteKey } from './domain';
import { defaultPublicSiteProfileForSite } from './public-site';
import { getRequestAbsoluteUrl, getRequestPublicSiteKey } from './request-site';

type PublicMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  openGraphTitle?: string;
  openGraphDescription?: string;
  type?: 'website' | 'article';
};

export function brandizeSiteText(value: string, siteKey: PublicSiteKey = 'agripassport') {
  if (!value) return '';
  const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const transform = (text: string) => {
    if (siteKey === 'htxonline') {
      return text
      .replace(/\bAGRIPASSPORT\b/gi, 'HTXONLINE')
      .replace(/\bAgri Passport\b/gi, 'HTXONLINE')
      .replace(/\bHỘ CHIẾU NÔNG NGHIỆP\b/gi, 'HTXONLINE');
    }
    if (siteKey === 'passport') {
      return text
        .replace(/\bHTXONLINE\b/gi, 'Hộ chiếu nông nghiệp')
        .replace(/\bAGRIPASSPORT\b/gi, 'Hộ chiếu nông nghiệp')
        .replace(/\bAgri Passport\b/gi, 'Hộ chiếu nông nghiệp')
        .replace(/\bHỘ CHIẾU NÔNG NGHIỆP\b/gi, 'Hộ chiếu nông nghiệp')
        .replace(/\bQR Passport\b/gi, 'QR truy xuất')
        .replace(/\bHTX\b/g, 'hợp tác xã')
        .replace(/\bBVTV\b/g, 'bảo vệ thực vật');
    }
    return text
      .replace(/\bHTXONLINE\b/gi, 'AGRIPASSPORT')
      .replace(/\bAgri Passport\b/gi, 'AGRIPASSPORT')
      .replace(/\bHỘ CHIẾU NÔNG NGHIỆP\b/gi, 'AGRIPASSPORT')
      .replace(/Đặt hàng COD/gi, 'Kết nối với HTX')
      .replace(/bán hàng COD/gi, 'kết nối thị trường')
      .replace(/đơn hàng COD/gi, 'yêu cầu hỗ trợ')
      .replace(/Thanh toán COD/gi, 'Gửi yêu cầu')
      .replace(/Tra cứu đơn hàng/gi, 'Theo dõi yêu cầu')
      .replace(/Giỏ hàng/gi, 'Danh sách sản phẩm')
      .replace(/\bCOD\b/gi, 'kết nối trực tiếp');
  };

  let cursor = 0;
  let result = '';
  for (const match of value.matchAll(emailPattern)) {
    const index = match.index ?? cursor;
    result += transform(value.slice(cursor, index));
    result += match[0];
    cursor = index + match[0].length;
  }
  return result + transform(value.slice(cursor));
}

export async function buildPublicMetadata(input: PublicMetadataInput): Promise<Metadata> {
  const siteKey = await getRequestPublicSiteKey();
  const profile = defaultPublicSiteProfileForSite(siteKey);
  const canonical = await getRequestAbsoluteUrl(input.path);
  const title = brandizeSiteText(input.title, siteKey);
  const description = brandizeSiteText(input.description, siteKey);
  const keywords = input.keywords?.map((keyword) => brandizeSiteText(keyword, siteKey));

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: brandizeSiteText(input.openGraphTitle || input.title, siteKey),
      description: brandizeSiteText(input.openGraphDescription || input.description, siteKey),
      url: canonical,
      siteName: profile.appName,
      locale: 'vi_VN',
      type: input.type || 'website'
    },
    twitter: {
      card: 'summary',
      title: brandizeSiteText(input.openGraphTitle || input.title, siteKey),
      description: brandizeSiteText(input.openGraphDescription || input.description, siteKey)
    }
  };
}
