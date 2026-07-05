import { render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CooperativeDetailPage from '@/app/htx/[code]/page';
import { AppShell } from '@/components/app-shell';
import { ProductCard, type PublicProduct } from '@/components/public-marketplace';
import { Button } from '@/components/ui';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ replace: vi.fn() })
}));

describe('Button', () => {
  it('renders accessible button text', () => {
    render(<Button>Lưu</Button>);
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
  });
});

describe('ProductCard', () => {
  it('uses the product thumbnail returned by the API', () => {
    const product: PublicProduct = {
      id: 'product-1',
      code: 'SP001',
      name: 'Gạo thơm',
      slug: 'gao-thom',
      price: 120000,
      unit: 'kg',
      thumbnail: {
        id: 'file-1',
        publicUrl: 'https://cdn.htxonline.vn/coop/gao-thom.webp'
      }
    };

    render(<ProductCard product={product} />);

    expect(screen.getByTestId('product-card-image').getAttribute('style')).toContain('https://cdn.htxonline.vn/coop/gao-thom.webp');
  });
});

describe('AppShell role navigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows system navigation without HTX operation links for Super Admin', async () => {
    window.localStorage.setItem(
      'agri_user',
      JSON.stringify({
        id: 'super-admin',
        email: 'admin@example.com',
        fullName: 'Super Admin',
        cooperativeId: null,
        roles: ['SUPER_ADMIN'],
        permissions: []
      })
    );

    render(<AppShell>Dashboard</AppShell>);

    expect((await screen.findAllByRole('link', { name: /HTX/i })).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Gói/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Vai trò & quyền/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Tin tức/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Nhật ký hệ thống/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Sao lưu/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('link', { name: /Sản phẩm/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Chứng nhận/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Vùng trồng/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /^Nhật ký$/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /^QR$/i })).toHaveLength(0);
  });

  it('shows HTX operation links for Admin HTX', async () => {
    window.localStorage.setItem(
      'agri_user',
      JSON.stringify({
        id: 'admin-htx',
        email: 'htx@example.com',
        fullName: 'Admin HTX',
        cooperativeId: 'coop-id',
        roles: ['ADMIN_HTX'],
        permissions: []
      })
    );

    render(<AppShell>Dashboard</AppShell>);

    expect((await screen.findAllByRole('link', { name: /Sản phẩm/i })).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Chứng nhận/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Vùng trồng/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Nhật ký/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^QR$/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('link', { name: /Vai trò & quyền/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Tin tức/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Nhật ký hệ thống/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Sao lưu/i })).toHaveLength(0);
  });
});

describe('CooperativeDetailPage', () => {
  it('renders public products and public zones for the requested cooperative', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'OK',
        data: [
          {
            id: 'product-1',
            code: 'SP-HTX-001',
            name: 'Xoai Cat Chu',
            slug: 'xoai-cat-chu',
            price: 45000,
            unit: 'kg',
            cooperative: {
              id: 'coop-1',
              name: 'HTX Cao Lanh',
              code: 'HTX-CAO-LANH',
              province: 'Dong Thap',
              phone: '0912345678'
            },
            zone: {
              id: 'zone-1',
              name: 'Vung xoai huu co',
              address: 'Cao Lanh, Dong Thap',
              areaM2: 5200
            },
            category: {
              name: 'Trai cay',
              slug: 'trai-cay'
            }
          }
        ]
      })
    } as Response);

    render(await CooperativeDetailPage({ params: Promise.resolve({ code: 'HTX-CAO-LANH' }) }));

    expect(screen.getByRole('heading', { name: 'HTX Cao Lanh' })).toBeInTheDocument();
    expect(screen.getByText('Sản phẩm public của HTX')).toBeInTheDocument();
    expect(screen.getByText('Vùng trồng công khai')).toBeInTheDocument();
    expect(screen.getByText('Vung xoai huu co')).toBeInTheDocument();
    expect(screen.getByText('Xoai Cat Chu')).toBeInTheDocument();

    fetchMock.mockRestore();
  });
});
