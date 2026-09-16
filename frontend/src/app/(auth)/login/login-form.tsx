'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel } from '@/components/ui';
import { PublicAuthShell } from '@/components/public-auth-shell';
import { login } from '@/lib/api';
import type { AuthPortal, PublicSiteKey } from '@/lib/domain';
import { dashboardUrlForRoles } from '@/lib/domain';
import { loginSchema } from '@/schemas/forms';

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm({ initialPortal, siteKey }: { initialPortal: AuthPortal; siteKey: PublicSiteKey }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const portal = initialPortal;
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  async function onSubmit(values: LoginValues) {
    setError('');
    try {
      const result = await login(values.email, values.password, portal);
      const nextUrl = dashboardUrlForRoles(result.user.roles, window.location.origin, result.user.portal ?? portal);
      if (nextUrl.startsWith('http')) {
        window.location.assign(nextUrl);
      } else {
        router.replace(nextUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  }

  return (
    <PublicAuthShell siteKey={siteKey}>
      <Panel className="public-auth-card w-full max-w-md">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-sm text-slate-600">
              {portal === 'ADMIN'
                ? 'HTXONLINE — Khu vực quản trị hệ thống'
                : portal === 'HTX'
                  ? 'HTXONLINE — Khu vực vận hành HTX'
                  : portal === 'PASSPORT'
                    ? 'HỘ CHIẾU NÔNG NGHIỆP — Tra cứu QR và sản phẩm'
                    : 'AGRIPASSPORT — Nền tảng dữ liệu sản phẩm nông nghiệp'}
            </p>
          </div>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input
              data-testid="login-email-input"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              aria-describedby={form.formState.errors.email ? 'login-email-error' : undefined}
              {...form.register('email')}
            />
            {form.formState.errors.email && <span id="login-email-error" role="alert" className="text-rose-600">{form.formState.errors.email.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Mật khẩu</span>
            <div className="relative">
              <Input
                data-testid="login-password-input"
                className="pr-12"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                aria-describedby={form.formState.errors.password ? 'login-password-error' : undefined}
                {...form.register('password')}
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 grid h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)]"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {form.formState.errors.password && <span id="login-password-error" role="alert" className="text-rose-600">{form.formState.errors.password.message}</span>}
          </label>
          {error && <div role="alert" aria-live="polite" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button data-testid="login-submit-button" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <LogIn size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? 'Đang đăng nhập' : 'Đăng nhập'}
          </Button>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-leaf transition hover:border-leaf hover:bg-mint" href="/register">
              Tạo tài khoản
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-leaf transition hover:border-leaf hover:bg-mint" href="/">
              Trang chủ
            </Link>
          </div>
        </form>
      </Panel>
    </PublicAuthShell>
  );
}
