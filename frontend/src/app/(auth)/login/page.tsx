'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel } from '@/components/ui';
import { PublicLogo } from '@/components/public-logo';
import { login } from '@/lib/api';
import { dashboardUrlForRoles } from '@/lib/domain';
import { loginSchema } from '@/schemas/forms';

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  async function onSubmit(values: LoginValues) {
    setError('');
    try {
      const result = await login(values.email, values.password);
      const nextUrl = dashboardUrlForRoles(result.user.roles, window.location.origin);
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
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <Panel className="w-full max-w-md">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 text-center">
            <PublicLogo size={56} className="mx-auto ring-1 ring-slate-200" />
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-sm text-slate-600">HTXONLINE — Sàn nông sản số cho hợp tác xã</p>
          </div>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input data-testid="login-email-input" type="email" autoComplete="email" {...form.register('email')} />
            {form.formState.errors.email && <span className="text-rose-600">{form.formState.errors.email.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Mật khẩu</span>
            <Input data-testid="login-password-input" type="password" autoComplete="current-password" {...form.register('password')} />
            {form.formState.errors.password && <span className="text-rose-600">{form.formState.errors.password.message}</span>}
          </label>
          {error && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button data-testid="login-submit-button" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <LogIn size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? 'Đang đăng nhập' : 'Đăng nhập'}
          </Button>
          <div className="flex justify-between text-sm">
            <Link className="font-semibold text-leaf" href="/register">
              Tạo tài khoản
            </Link>
            <Link className="font-semibold text-leaf" href="/">
              Trang chủ
            </Link>
          </div>
        </form>
      </Panel>
    </main>
  );
}
