import { render, screen } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from '@/components/app-shell';
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

describe('AppShell role navigation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows system navigation without HTX operation links for Super Admin', () => {
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

    expect(screen.getAllByRole('link', { name: /HTX/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Gói/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Nhật ký hệ thống/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Sao lưu/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('link', { name: /Sản phẩm/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Vùng trồng/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /^Nhật ký$/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /^QR$/i })).toHaveLength(0);
  });

  it('shows HTX operation links for Admin HTX', () => {
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

    expect(screen.getAllByRole('link', { name: /Sản phẩm/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Vùng trồng/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Nhật ký/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^QR$/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole('link', { name: /Nhật ký hệ thống/i })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: /Sao lưu/i })).toHaveLength(0);
  });
});
