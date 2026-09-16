import type { PublicSiteKey } from './domain';

/** Keep Passport-facing labels readable without changing stored cooperative names. */
export function publicDisplayCopy(value: string, siteKey?: PublicSiteKey) {
  if (siteKey !== 'passport') return value;

  return value
    .replace(/\bHTX\b/g, 'hợp tác xã')
    .replace(/\bBVTV\b/g, 'bảo vệ thực vật')
    .replace(/^\s*hợp tác xã(?=\s|$)/, 'Hợp tác xã')
    .replace(/^HTX CÔNG KHAI$/i, 'Hợp tác xã công khai')
    .replace(/^HỒ SƠ HỢP TÁC XÃ$/i, 'Hồ sơ hợp tác xã')
    .replace(/\s*&\s*/g, ' và ');
}
