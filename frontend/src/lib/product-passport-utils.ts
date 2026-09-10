import type { PublicProduct } from '@/components/public-marketplace';

export const FARMING_ACTIVITY_MAP: Record<string, string> = {
  SEEDING: 'Gieo hạt / Xuống giống',
  PLANTING: 'Xuống giống / Trồng cây',
  WATERING: 'Tưới nước',
  IRRIGATION: 'Tưới nước & Tiêu úng',
  FERTILIZING: 'Bón phân',
  SPRAYING: 'Phun thuốc sinh học',
  PEST_CONTROL: 'Phòng trừ sâu bệnh',
  PRUNING: 'Cắt tỉa cành',
  WEEDING: 'Làm cỏ / Xới đất',
  FLOWERING: 'Thời kỳ ra hoa',
  FRUITING: 'Thời kỳ đậu quả',
  INSPECTION: 'Kiểm tra sinh trưởng',
  HARVESTING: 'Thu hoạch',
  PACKAGING: 'Đóng gói bao bì',
  TRANSPORT: 'Vận chuyển / Phân phối',
  PROCESSING: 'Sơ chế & Chế biến',
  STORAGE: 'Bảo quản lưu kho',
  OTHER: 'Hoạt động canh tác'
};

export function translateActivityType(type?: string | null): string {
  if (!type) return 'Hoạt động canh tác';
  const upper = type.toUpperCase().trim();
  if (FARMING_ACTIVITY_MAP[upper]) return FARMING_ACTIVITY_MAP[upper];
  return upper
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(' ');
}

export function sanitizeLogDescription(text?: string | null): string {
  if (!text) return '';
  let result = text;
  for (const [key, val] of Object.entries(FARMING_ACTIVITY_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, val.toLowerCase());
  }
  result = result.replace(/\s+/g, ' ').trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}

export function deduplicateCertifications(
  certs: NonNullable<PublicProduct['certifications']>
) {
  const seen = new Set<string>();
  const unique: typeof certs = [];

  for (const cert of certs) {
    const signature = [
      (cert.name || '').trim().toLowerCase(),
      (cert.issuer || '').trim().toLowerCase(),
      cert.expiresAt ? new Date(cert.expiresAt).toISOString().slice(0, 10) : '',
      cert.file?.publicUrl || cert.file?.objectKey || ''
    ].join('|');

    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(cert);
    }
  }

  return unique;
}
