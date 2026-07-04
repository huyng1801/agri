import Image from 'next/image';
import Link from 'next/link';
import { Calendar, CheckCircle2, Leaf, MapPin, QrCode } from 'lucide-react';
import { API_URL, ApiEnvelope } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Badge, Panel } from '@/components/ui';

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
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer?: string;
      expiresAt?: string;
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

export default async function PublicPassportPage({ params }: { params: { code: string } }) {
  const passport = await getPassport(params.code);
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
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-5">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
        <div className="bg-leaf p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge className="bg-white text-leaf">
                <CheckCircle2 className="mr-1 inline" size={14} aria-hidden="true" />
                Đã xác thực
              </Badge>
              <h1 className="mt-4 text-3xl font-bold">{passport.product.name}</h1>
              <p className="mt-2 text-white/85">{passport.cooperative.name}</p>
            </div>
            {passport.qrDataUrl && (
              <Image src={passport.qrDataUrl} width={96} height={96} alt={`QR ${passport.passportCode}`} className="rounded-md bg-white p-1" />
            )}
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3">
          <Info icon={QrCode} label="Mã" value={passport.passportCode} />
          <Info icon={MapPin} label="Vùng trồng" value={passport.product.zone?.name ?? 'Đang cập nhật'} />
          <Info icon={Leaf} label="Lượt xem" value={String(passport.viewCount + 1)} />
        </div>
      </section>

      <div className="mt-4 grid gap-4">
        <Panel>
          <h2 className="text-lg font-bold">Thông tin sản phẩm</h2>
          <p className="mt-2 leading-7 text-slate-700">{passport.product.description || 'Thông tin sản phẩm đang được HTX cập nhật.'}</p>
          {passport.product.zone && (
            <div className="mt-3 rounded-md bg-mint p-3 text-sm">
              <strong>{passport.product.zone.name}</strong>
              <span className="block text-slate-700">{passport.product.zone.address}</span>
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="text-lg font-bold">Timeline truy xuất</h2>
          <div className="mt-4 space-y-3">
            {passport.product.farmingLogs.map((log, index) => (
              <div key={log.id} className="grid grid-cols-[32px_1fr] gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-sm font-bold text-white">{index + 1}</span>
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className="bg-mint text-leaf">{log.activityType}</Badge>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Calendar size={14} aria-hidden="true" />
                      {formatDate(log.logDate)}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">{log.description}</p>
                </div>
              </div>
            ))}
            {passport.product.farmingLogs.length === 0 && <p className="text-slate-600">Chưa có nhật ký công khai.</p>}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-bold">Chứng nhận</h2>
          <div className="mt-3 grid gap-2">
            {passport.product.certifications.map((cert) => (
              <div key={cert.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <strong>{cert.name}</strong>
                <span className="block text-slate-600">
                  {cert.issuer || 'Đơn vị cấp'} · Hết hạn {formatDate(cert.expiresAt)}
                </span>
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
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof QrCode; label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <Icon className="text-leaf" size={20} aria-hidden="true" />
      <p className="mt-2 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words font-bold">{value}</p>
    </div>
  );
}
