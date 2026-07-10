import Link from 'next/link';
import { Calendar, CheckCircle2, Eye, MapPin, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { DEFAULT_PRODUCT_IMAGE, PublicImage } from '@/components/public-image';
import { PublicLogo } from '@/components/public-logo';
import { formatDate } from '@/lib/format';
import { Badge, cn, Panel } from '@/components/ui';

type Passport = {
  passportCode: string;
  qrDataUrl?: string;
  viewCount: number;
  verified: boolean;
  cooperative: {
    name: string;
    address?: string;
    phone?: string;
  };
  product: {
    name: string;
    description?: string;
    unit: string;
    price: string;
    thumbnail?: {
      publicUrl?: string | null;
    } | null;
    zone?: {
      name: string;
      address?: string;
      areaM2?: string;
    };
    farmingLogs: Array<{
      id: string;
      logDate: string;
      activityType: string;
      description: string;
      imagesJson?: unknown[];
      zone?: {
        name: string;
      } | null;
      actor?: {
        fullName: string;
      } | null;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer?: string;
      expiresAt?: string;
      file?: {
        publicUrl?: string | null;
      } | null;
    }>;
  };
};

async function getPassport(code: string) {
  try {
    const response = await fetch(`${API_URL}/public/passports/${encodeURIComponent(code)}`, {
      cache: 'no-store'
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<Passport>;
    return body.data;
  } catch {
    return null;
  }
}

type PublicPassportPageProps = {
  params: Promise<{ code: string }>;
};

export default async function PublicPassportPage({ params }: PublicPassportPageProps) {
  const { code } = await params;
  const passport = await getPassport(code);
  if (!passport) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Panel className="max-w-md text-center">
          <QrCode className="mx-auto text-rose-600" size={44} aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-bold">Không tìm thấy Passport</h1>
          <Link className="mt-4 inline-block font-semibold text-leaf" href="/">
            Về trang chủ
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[90rem] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 shadow-sm sm:mb-4 sm:px-4 lg:px-6 lg:py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-leaf">
          <PublicLogo size={28} className="ring-1 ring-slate-200" />
          HTXONLINE
        </Link>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/san-pham" className="text-slate-600 hover:text-leaf">
            Xem sản phẩm
          </Link>
          <Link href="/" className="text-slate-600 hover:text-leaf">
            Trang chủ
          </Link>
        </div>
      </header>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <div className="xl:grid xl:grid-cols-[minmax(0,1.02fr)_minmax(26rem,0.98fr)]">
          <div className="bg-leaf p-4 text-white sm:p-5 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between xl:flex-col xl:justify-between">
              <div className="min-w-0">
                <Badge className="bg-white text-leaf">
                  <CheckCircle2 className="mr-1 inline" size={14} aria-hidden="true" />
                  Đã xác thực
                </Badge>
                <h1 className="mt-3 max-w-[11ch] text-[2rem] font-bold leading-[1.05] sm:mt-4 sm:max-w-none sm:text-3xl lg:max-w-[12ch] lg:text-[3.6rem] lg:leading-[0.96]">
                  {passport.product.name}
                </h1>
                <p className="mt-2 max-w-2xl text-white/85 lg:text-xl">{passport.cooperative.name}</p>
              </div>
              {passport.qrDataUrl && (
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                  <img
                    src={passport.qrDataUrl}
                    width={132}
                    height={132}
                    alt={`QR ${passport.passportCode}`}
                    className="h-20 w-20 rounded-md bg-white p-1 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:mt-8">
              <Info icon={QrCode} label="Mã" value={passport.passportCode} valueClassName="font-mono tracking-[0.04em] lg:whitespace-nowrap" />
              <Info icon={MapPin} label="Vùng trồng" value={passport.product.zone?.name ?? 'Đang cập nhật'} />
              <Info icon={Eye} label="Lượt xem" value={String(passport.viewCount + 1)} />
            </div>
          </div>

          <PublicImage
            src={passport.product.thumbnail?.publicUrl}
            alt={passport.product.name}
            fallback={DEFAULT_PRODUCT_IMAGE}
            priority
            wrapperClassName="aspect-[16/9] w-full xl:h-full xl:min-h-[28rem] xl:aspect-auto"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.9fr)]">
        <div className="grid gap-3 sm:gap-4">
          <Panel>
            <h2 className="text-lg font-bold">Thông tin sản phẩm</h2>
            <p className="mt-2 max-w-4xl leading-7 text-slate-700">{passport.product.description || 'Thông tin sản phẩm đang được HTX cập nhật.'}</p>
            {passport.product.zone && (
              <div className="mt-3 rounded-md bg-mint p-3 text-sm">
                <strong>{passport.product.zone.name}</strong>
                <span className="block text-slate-700">{passport.product.zone.address}</span>
              </div>
            )}
          </Panel>

          <Panel>
            <h2 className="text-lg font-bold">Timeline truy xuất</h2>
            <div className="mt-3 grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
              {passport.product.farmingLogs.map((log, index) => (
                <div key={log.id} className="grid grid-cols-[28px_1fr] gap-2.5 sm:grid-cols-[32px_1fr] sm:gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-leaf text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm">{index + 1}</span>
                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Badge className="bg-mint text-leaf">{log.activityType}</Badge>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Calendar size={14} aria-hidden="true" />
                        {formatDate(log.logDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-[0.98rem] leading-6 text-slate-700">{log.description}</p>
                    {(log.zone?.name || log.actor?.fullName) && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {[log.zone?.name, log.actor?.fullName].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {logImages(log.imagesJson).length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {logImages(log.imagesJson).slice(0, 6).map((image, imageIndex) => (
                          <PublicImage
                            key={`${log.id}-${imageIndex}`}
                            src={image.url}
                            alt={`Ảnh nhật ký ${index + 1}`}
                            fallback={DEFAULT_PRODUCT_IMAGE}
                            decorative
                            wrapperClassName="aspect-square w-full rounded-md"
                            className="h-full w-full object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {passport.product.farmingLogs.length === 0 && <p className="text-slate-600">Chưa có nhật ký công khai.</p>}
            </div>
          </Panel>
        </div>

        <div className="grid gap-3 self-start sm:gap-4 xl:sticky xl:top-6">
          <Panel>
            <h2 className="text-lg font-bold">Chứng nhận</h2>
            <div className="mt-3 grid gap-2">
              {passport.product.certifications.map((cert) => (
                <div key={cert.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <strong>{cert.name}</strong>
                  <span className="block text-slate-600">
                    {cert.issuer || 'Đơn vị cấp'} · Hết hạn {formatDate(cert.expiresAt)}
                  </span>
                  {cert.file?.publicUrl && (
                    <a href={cert.file.publicUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-leaf">
                      Xem tài liệu chứng nhận
                    </a>
                  )}
                </div>
              ))}
              {passport.product.certifications.length === 0 && <p className="text-slate-600">Chưa có chứng nhận công khai.</p>}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-lg font-bold">HTX sản xuất</h2>
            <p className="mt-2 font-semibold">{passport.cooperative.name}</p>
            <p className="text-slate-600">{passport.cooperative.address}</p>
            <p className="text-slate-600">{passport.cooperative.phone}</p>
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
  valueClassName
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 shrink-0 text-leaf" size={18} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className={cn('mt-1 break-words text-[0.98rem] font-bold leading-6 text-ink sm:text-base', valueClassName)}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function logImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string') {
        return { url: String((item as { url: string }).url) };
      }
      return null;
    })
    .filter((item): item is { url: string } => Boolean(item?.url));
}
