import type { Metadata } from 'next';
import Link from 'next/link';
import { cache } from 'react';
import { ArrowLeft, BadgeCheck, Leaf, MapPin, QrCode, Sprout, type LucideIcon } from 'lucide-react';
import { PublicShell } from '@/components/public-shell';
import { PublicPageHeader, PublicPageMain, publicCardClass } from '@/components/public-layout';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { cn } from '@/components/ui';

type FarmerSummary = {
  assignedZoneCount: number;
  areaM2: number | null;
  zonesWithArea: number;
  treeCount: number;
  varieties: Array<{ cropTypeName: string; variety: string | null; treeCount: number }>;
  seasonalProduction: Array<{
    seasonId: string | null;
    seasonName: string;
    harvestCount: number;
    recordedMassKg: number | null;
    otherUnits: Array<{ unit: string; quantity: number }>;
  }>;
};

type PublicFarmer = {
  publicUrl: string;
  qrDataUrl: string;
  farmer: {
    fullName: string;
    cooperative: { name: string; code: string };
    summary: FarmerSummary | null;
  };
};

type PageProps = { params: Promise<{ farmerId: string }> };

const getFarmer = cache(async (farmerId: string): Promise<PublicFarmer | null> => {
  try {
    const response = await fetch(`${API_URL}/public/farmers/${encodeURIComponent(farmerId)}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<PublicFarmer>;
    return body?.data ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { farmerId } = await params;
  const profile = await getFarmer(farmerId);
  if (!profile) return { title: 'Không tìm thấy hồ sơ nông hộ' };
  const title = `${profile.farmer.fullName} · Hồ sơ nông hộ`;
  const description = `Thông tin vùng trồng, cây/giống và sản lượng công khai của ${profile.farmer.fullName}, thuộc ${profile.farmer.cooperative.name}.`;
  return {
    title,
    description,
    alternates: { canonical: profile.publicUrl },
    openGraph: { title, description, url: profile.publicUrl, siteName: 'Hộ chiếu nông nghiệp', locale: 'vi_VN', type: 'profile' },
    twitter: { card: 'summary', title, description }
  };
}

export default async function PublicFarmerPage({ params }: PageProps) {
  const { farmerId } = await params;
  const profile = await getFarmer(farmerId);
  if (!profile) return <FarmerNotFound />;

  const { farmer } = profile;
  const summary = farmer.summary;
  return (
    <PublicShell>
      <PublicPageMain className="max-w-5xl">
        <Link href="/" className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]">
          <ArrowLeft size={16} aria-hidden="true" />Trang chủ
        </Link>
        <PublicPageHeader
          eyebrow="Hồ sơ nông hộ · QR cá nhân"
          title={farmer.fullName}
          description={`Thông tin sản xuất được công khai bởi ${farmer.cooperative.name}. Dữ liệu được tổng hợp từ các vùng đang hoạt động và được HTX cho phép hiển thị.`}
          action={<span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-[var(--brand-primary-subtle)] px-4 text-sm font-semibold text-[var(--brand-primary)]"><BadgeCheck size={17} aria-hidden="true" />Hồ sơ công khai</span>}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className={cn(publicCardClass, 'overflow-hidden bg-[linear-gradient(145deg,#073b2a_0%,#0d7a28_55%,#74b86b_100%)] p-6 text-white sm:p-8')}>
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80"><Sprout size={18} aria-hidden="true" />Nông hộ thuộc HTX</div>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{farmer.cooperative.name}</h2>
            <p className="mt-2 text-sm text-white/75">Mã HTX: {farmer.cooperative.code}</p>
            <div className="mt-6 grid gap-3 border-t border-white/20 pt-5 sm:grid-cols-3">
              <Metric icon={MapPin} label="Diện tích vùng công khai" value={formatArea(summary?.areaM2 ?? null)} />
              <Metric icon={Leaf} label="Cây đã xác minh" value={`${formatNumber(summary?.treeCount ?? 0)} cây`} />
              <Metric icon={Sprout} label="Vùng được phân công" value={`${formatNumber(summary?.assignedZoneCount ?? 0)} vùng`} />
            </div>
          </section>

          <aside className={cn(publicCardClass, 'flex flex-col items-center p-5 text-center')}>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]"><QrCode size={18} className="text-[var(--brand-primary)]" aria-hidden="true" />QR hồ sơ nông hộ</div>
            <img src={profile.qrDataUrl} alt={`QR hồ sơ của ${farmer.fullName}`} width={208} height={208} className="mt-3 h-52 w-52 rounded-xl border border-[var(--border)] bg-white p-2" />
            <a href={profile.qrDataUrl} download={`QR-nong-ho-${farmer.cooperative.code}.png`} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]">Tải ảnh QR</a>
          </aside>
        </div>

        <section className={cn(publicCardClass, 'mt-5 p-5 sm:p-7')}>
          <div className="flex items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--brand-primary)]">Cơ cấu cây trồng</p><h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">Giống và số cây</h2></div>
            <span className="rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)]">{summary?.varieties.length ?? 0} nhóm</span>
          </div>
          {summary?.varieties.length ? (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {summary.varieties.map((item) => (
                <li key={`${item.cropTypeName}-${item.variety ?? ''}`} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{item.cropTypeName}{item.variety ? ` · ${item.variety}` : ''}</span>
                  <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-sm text-[var(--text-secondary)]">{formatNumber(item.treeCount)} cây</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">Chưa có cây/giống được HTX xác minh để công khai.</p>}
        </section>

        <section className={cn(publicCardClass, 'mt-5 p-5 sm:p-7')}>
          <div className="border-b border-[var(--border)] pb-4"><p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--brand-primary)]">Theo mùa vụ</p><h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">Sản lượng đã ghi nhận</h2></div>
          {summary?.seasonalProduction.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summary.seasonalProduction.map((season, index) => (
                <article key={season.seasonId ?? `season-${index}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">{season.seasonName}</h3>
                  <p className="mt-2 text-lg font-bold text-[var(--brand-primary)]">{season.recordedMassKg === null ? 'Chưa có khối lượng' : `${formatNumber(season.recordedMassKg / 1000, 3)} tấn`}</p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">{formatNumber(season.harvestCount)} lượt thu hoạch</p>
                  {season.otherUnits.length ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{season.otherUnits.map((item) => `${formatNumber(item.quantity, 3)} ${item.unit}`).join(' · ')}</p> : null}
                </article>
              ))}
            </div>
          ) : <p className="mt-4 rounded-xl bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">Chưa có sản lượng theo mùa vụ được ghi nhận công khai.</p>}
        </section>

        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Phạm vi số liệu: chỉ gồm cây đã được HTX xác minh và vùng đang bật công khai. Diện tích, cây trồng và sản lượng được tổng hợp theo vùng HTX phân công; vùng dùng chung có thể xuất hiện trong nhiều hồ sơ, nên các số liệu này không mặc định là tài sản hay sản lượng riêng của một hộ.
        </p>
        <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">Cập nhật theo dữ liệu HTX ghi nhận · Không hiển thị email, số điện thoại hoặc tọa độ chính xác</p>
      </PublicPageMain>
    </PublicShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="rounded-xl border border-white/15 bg-white/10 p-3"><div className="flex items-center gap-2 text-xs text-white/70"><Icon size={15} aria-hidden="true" />{label}</div><p className="mt-2 text-lg font-bold">{value}</p></div>;
}

function FarmerNotFound() {
  return <PublicShell><PublicPageMain className="grid min-h-[65vh] max-w-xl place-items-center"><section className={cn(publicCardClass, 'w-full p-8 text-center')}><QrCode className="mx-auto text-[var(--brand-primary)]" size={40} aria-hidden="true" /><h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Không tìm thấy hồ sơ nông hộ</h1><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Hồ sơ có thể đã ngừng hoạt động hoặc chưa được phép công khai.</p><Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white">Về trang chủ</Link></section></PublicPageMain></PublicShell>;
}

function formatArea(areaM2: number | null) {
  return areaM2 === null ? 'Chưa cập nhật' : `${formatNumber(areaM2 / 10000, 2)} ha`;
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(value);
}
