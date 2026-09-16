'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel } from '@/components/ui';
import { PublicAuthShell } from '@/components/public-auth-shell';
import { apiFetch } from '@/lib/api';
import type { AuthPortal, PublicSiteKey } from '@/lib/domain';
import { registerSchema } from '@/schemas/forms';

type RegisterValues = z.infer<typeof registerSchema>;

function introCopyForPortal(portal: AuthPortal) {
  if (portal === 'PASSPORT') return 'Tạo tài khoản để quản lý hồ sơ và tra cứu nguồn gốc nông sản.';
  if (portal === 'HTX' || portal === 'ADMIN') return 'Tạo tài khoản để tham gia vận hành dữ liệu hợp tác xã.';
  return 'Tạo tài khoản để theo dõi đơn hàng và kết nối sản phẩm minh bạch.';
}

export default function RegisterForm({ initialPortal, siteKey }: { initialPortal: AuthPortal; siteKey: PublicSiteKey }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const portal = initialPortal;
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', phone: '' }
  });

  async function onSubmit(values: RegisterValues) {
    setError('');
    try {
      await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ ...values, portal }) });
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  }

  return (
    <PublicAuthShell siteKey={siteKey}>
      <Panel className="public-auth-card w-full max-w-md">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
            <p className="text-sm text-slate-600">{introCopyForPortal(portal)}</p>
          </div>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Họ tên</span>
            <Input
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.fullName)}
              aria-describedby={form.formState.errors.fullName ? 'register-full-name-error' : undefined}
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && <span id="register-full-name-error" role="alert" className="text-rose-600">{form.formState.errors.fullName.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              aria-describedby={form.formState.errors.email ? 'register-email-error' : undefined}
              {...form.register('email')}
            />
            {form.formState.errors.email && <span id="register-email-error" role="alert" className="text-rose-600">{form.formState.errors.email.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Số điện thoại</span>
            <Input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(form.formState.errors.phone)}
              aria-describedby={form.formState.errors.phone ? 'register-phone-error' : undefined}
              {...form.register('phone')}
            />
            {form.formState.errors.phone && <span id="register-phone-error" role="alert" className="text-rose-600">{form.formState.errors.phone.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Mật khẩu</span>
            <div className="relative">
              <Input
                className="pr-12"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                aria-describedby={form.formState.errors.password ? 'register-password-error' : undefined}
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
            {form.formState.errors.password && <span id="register-password-error" role="alert" className="text-rose-600">{form.formState.errors.password.message}</span>}
          </label>
          {error && <div role="alert" aria-live="polite" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <UserPlus size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? 'Đang tạo' : 'Tạo tài khoản'}
          </Button>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 font-semibold text-leaf transition hover:border-leaf hover:bg-mint" href="/login">
              Đã có tài khoản
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
