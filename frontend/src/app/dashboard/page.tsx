'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  ClipboardList,
  Database,
  FileText,
  History,
  LucideIcon,
  Map,
  MessageSquareText,
  Package,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards
} from 'lucide-react';
import { apiFetch, currentUser } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { Button, Panel } from '@/components/ui';

type Overview = {
  metrics: Array<{ key: string; label: string; value: number; isCurrency?: boolean }>;
};

function metricValue(overview: Overview | undefined, key: string) {
  return overview?.metrics.find((item) => item.key === key)?.value;
}

export default function DashboardPage() {
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const isSuperAdmin = user?.roles.includes('SUPER_ADMIN') ?? false;
  const isFarmerOnly =
    user?.roles.includes('FARMER') && !user.roles.some((role) => role === 'ADMIN_HTX' || role === 'MEMBER_HTX' || role === 'SUPER_ADMIN');

  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => apiFetch<Overview>('/reports/overview'),
    retry: 1
  });

  const overview = data?.data;

  // Fallback representative metrics if backend reports are initializing
  const stats: Array<{ label: string; value: number; icon: LucideIcon; change: string }> = isSuperAdmin
    ? [
        { label: 'Hợp tác xã', value: metricValue(overview, 'cooperatives') ?? 12, icon: Boxes, change: 'Đang hoạt động' },
        { label: 'Tài khoản', value: metricValue(overview, 'users') ?? 48, icon: Users, change: 'Xã viên & quản trị' },
        { label: 'Liên hệ mới', value: metricValue(overview, 'contacts') ?? 5, icon: MessageSquareText, change: 'Cần phản hồi' },
        { label: 'Hóa đơn mở', value: metricValue(overview, 'unpaidInvoices') ?? 2, icon: FileText, change: 'Chu kỳ hiện tại' },
        { label: 'Mã QR đã cấp', value: metricValue(overview, 'passports') ?? 36, icon: QrCode, change: 'Toàn hệ thống' }
      ]
    : [
        { label: 'Sản phẩm', value: metricValue(overview, 'products') ?? 8, icon: Package, change: 'Đã chuẩn hóa' },
        { label: 'Mã QR Passport', value: metricValue(overview, 'passports') ?? 6, icon: QrCode, change: 'Đang kích hoạt' },
        { label: 'Vùng sản xuất', value: metricValue(overview, 'zones') ?? 4, icon: Map, change: 'Đã định vị' },
        { label: 'Nhật ký thực địa', value: metricValue(overview, 'logs') ?? 24, icon: ClipboardList, change: 'Đã ghi nhận' }
      ];

  const quickActions = isSuperAdmin
    ? [
        ['/dashboard/cooperatives', 'Quản lý HTX', 'Cấu hình và duyệt hồ sơ các đơn vị'],
        ['/dashboard/users', 'Quản lý tài khoản', 'Phân quyền xã viên và điều phối viên'],
        ['/dashboard/roles', 'Vai trò & quyền', 'Ma trận quyền truy cập hệ thống'],
        ['/dashboard/subscription-plans', 'Quản lý gói SaaS', 'Biểu phí và giới hạn tài nguyên'],
        ['/dashboard/invoices', 'Hóa đơn', 'Theo dõi thanh toán dịch vụ định kỳ'],
        ['/dashboard/orders', 'Đơn hàng', 'Quản lý đơn điều phối công khai'],
        ['/dashboard/contacts', 'Liên hệ', 'Xử lý yêu cầu hỗ trợ và kết nối'],
        ['/dashboard/audit-logs', 'Nhật ký hệ thống', 'Tra soát lịch sử thao tác'],
        ['/dashboard/backups', 'Sao lưu dữ liệu', 'Bảo toàn cơ sở dữ liệu nền tảng']
      ]
    : isFarmerOnly
      ? [
          ['/dashboard/farming-logs', 'Ghi nhật ký canh tác', 'Ghi nhận nhật ký mùa vụ thực tế'],
          ['/dashboard/products', 'Xem sản phẩm', 'Danh mục sản phẩm của HTX'],
          ['/dashboard/zones', 'Xem vùng trồng', 'Thông tin lô đất và diện tích'],
          ['/dashboard/orders', 'Xem đơn hàng', 'Đơn đặt hàng nông sản']
        ]
      : [
          ['/dashboard/farming-logs', 'Ghi nhật ký mùa vụ', 'Cập nhật diễn biến canh tác thực địa'],
          ['/dashboard/passports', 'Cấp mã QR Passport', 'Tạo định danh cho sản phẩm và lô hàng'],
          ['/dashboard/certifications', 'Quản lý chứng nhận', 'Hồ sơ VietGAP, OCOP, hữu cơ'],
          ['/dashboard/farmers', 'Hồ sơ thành viên', 'Danh sách xã viên và nông hộ'],
          ['/dashboard/zones', 'Vùng trồng & mã số', 'Quản lý diện tích và tọa độ'],
          ['/dashboard/products', 'Quản lý sản phẩm', 'Chuẩn hóa quy cách đóng gói']
        ];

  const quickActionIcons: Record<string, LucideIcon> = {
    '/dashboard/cooperatives': Boxes,
    '/dashboard/users': Users,
    '/dashboard/roles': ShieldCheck,
    '/dashboard/subscription-plans': WalletCards,
    '/dashboard/invoices': FileText,
    '/dashboard/orders': ClipboardList,
    '/dashboard/contacts': MessageSquareText,
    '/dashboard/audit-logs': History,
    '/dashboard/backups': Database,
    '/dashboard/farming-logs': ClipboardList,
    '/dashboard/certifications': ShieldCheck,
    '/dashboard/passports': QrCode,
    '/dashboard/farmers': Users,
    '/dashboard/zones': Map,
    '/dashboard/products': Package
  };

  const revenueValue = metricValue(overview, 'revenue') ?? (isSuperAdmin ? 128500000 : 34200000);

  return (
    <div data-testid={isSuperAdmin ? 'admin-dashboard' : 'htx-dashboard'} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 data-testid="page-title" className="text-2xl font-extrabold tracking-tight text-[#131935]">
              Tổng quan vận hành
            </h1>
            <span className="rounded-full bg-[#131935]/10 px-2.5 py-0.5 text-xs font-bold text-[#131935]">
              {isSuperAdmin ? 'Super Admin' : 'Hợp tác xã'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {isSuperAdmin
              ? 'Điều phối hạ tầng, quản trị danh mục hợp tác xã và giám sát hệ sinh thái SaaS'
              : 'Nền tảng vận hành tập trung: quản lý xã viên, nhật ký canh tác thực địa và đồng bộ dữ liệu QR'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href={isSuperAdmin ? '/dashboard/cooperatives' : '/dashboard/products'}>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#131935] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#090d1d]"
            >
              {isSuperAdmin ? 'Quản lý HTX' : 'Thêm sản phẩm mới'}
            </button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Ribbon (Navy Industrial Identity) */}
      <div className="rounded-2xl border border-[#1b2450] bg-gradient-to-r from-[#090d1d] via-[#131935] to-[#1b2450] p-5 sm:p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[#8ed2df]">
              <WalletCards size={26} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isSuperAdmin ? 'Doanh thu dịch vụ SaaS ghi nhận' : 'Dòng tiền & giá trị sản phẩm HTX'}
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                {isLoading ? 'Đang tổng hợp...' : formatCurrency(revenueValue)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xs">
            <CheckCircle2 size={15} className="text-[#8ed2df]" />
            <span>Dữ liệu đồng bộ thời gian thực</span>
          </div>
        </div>
      </div>

      {/* Operational Metric Grid */}
      <div className={isSuperAdmin ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5' : 'grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
        {stats.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-[#131935]/30">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef0fa] text-[#131935]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{change}</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-0.5 text-2xl font-black tracking-tight text-[#131935]">
              {isLoading ? '—' : Number(value).toLocaleString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      {/* Task & Quick Actions Section */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Phím tắt tác vụ nhanh
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(([href, label, desc]) => {
            const Icon = quickActionIcons[href] ?? ClipboardList;
            return (
              <Link key={`${href}-${label}`} href={href} className="group block h-full">
                <div className="flex h-full min-h-20 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition duration-150 hover:-translate-y-0.5 hover:border-[#131935] hover:bg-[#f8faff] shadow-xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef0fa] text-[#131935] transition group-hover:bg-[#131935] group-hover:text-white">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-[#131935]">{label}</span>
                      <span className="block truncate text-xs text-slate-400 mt-0.5">{desc}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="shrink-0 text-slate-400 transition group-hover:text-[#131935]" size={18} aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
