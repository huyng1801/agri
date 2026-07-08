'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel } from '@/components/ui';
import { PublicAuthShell } from '@/components/public-auth-shell';
import { PublicLogo } from '@/components/public-logo';
import { apiFetch } from '@/lib/api';
import { registerSchema } from '@/schemas/forms';

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', phone: '' }
  });

  async function onSubmit(values: RegisterValues) {
    setError('');
    try {
      await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(values) });
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  }

  return (
    <PublicAuthShell>
      <Panel className="w-full max-w-md">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 text-center">
            <PublicLogo size={56} className="mx-auto ring-1 ring-slate-200 lg:hidden" />
            <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
            <p className="text-sm text-slate-600">Tham gia HTXONLINE để mua sản phẩm HTX minh bạch</p>
          </div>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Họ tên</span>
            <Input {...form.register('fullName')} />
            {form.formState.errors.fullName && <span className="text-rose-600">{form.formState.errors.fullName.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email && <span className="text-rose-600">{form.formState.errors.email.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Số điện thoại</span>
            <Input inputMode="tel" {...form.register('phone')} />
            {form.formState.errors.phone && <span className="text-rose-600">{form.formState.errors.phone.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-semibold">
            <span>Mật khẩu</span>
            <Input type="password" {...form.register('password')} />
            {form.formState.errors.password && <span className="text-rose-600">{form.formState.errors.password.message}</span>}
          </label>
          {error && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <UserPlus size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? 'Đang tạo' : 'Tạo tài khoản'}
          </Button>
          <div className="flex justify-between text-sm">
            <Link className="font-semibold text-leaf" href="/login">
              Đã có tài khoản
            </Link>
            <Link className="font-semibold text-leaf" href="/">
              Trang chủ
            </Link>
          </div>
        </form>
      </Panel>
    </PublicAuthShell>
  );
}
