'use client';

import { useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { Button, Input, Textarea } from './ui';

const phonePattern = /^(0|\+84)[0-9]{8,10}$/;

export function PublicContactForm({ sourcePath = '/lien-he' }: { sourcePath?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');
    setError('');

    const form = event.currentTarget;
    const payload = new FormData(form);
    const fullName = String(payload.get('fullName') || '').trim();
    const phone = String(payload.get('phone') || '').trim();
    const email = String(payload.get('email') || '').trim();
    const message = String(payload.get('message') || '').trim();

    if (!fullName) return setError('Họ tên là bắt buộc');
    if (!phonePattern.test(phone)) return setError('Số điện thoại Việt Nam không hợp lệ');
    if (message.length < 10) return setError('Nội dung liên hệ cần tối thiểu 10 ký tự');

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/contacts/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email: email || undefined,
          message,
          sourcePath
        })
      });
      const body = (await response.json().catch(() => null)) as ApiEnvelope<{ id: string }> | null;
      if (!response.ok || !body?.success) {
        throw new Error(body?.errors?.[0]?.message || body?.message || 'Không thể gửi liên hệ');
      }
      form.reset();
      setSuccess('Thông tin đã được gửi. Đội vận hành sẽ liên hệ với bạn trong thời gian sớm nhất.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi liên hệ');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <label className="space-y-1 text-sm font-semibold">
        <span>Họ tên</span>
        <Input data-testid="contact-name-input" name="fullName" required />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Số điện thoại</span>
        <Input data-testid="contact-phone-input" name="phone" required inputMode="tel" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Email</span>
        <Input data-testid="contact-email-input" name="email" type="email" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Nội dung</span>
        <Textarea data-testid="contact-message-input" name="message" required />
      </label>
      {success && <div data-testid="toast-success" className="rounded-md bg-mint p-3 text-sm font-semibold text-leaf">{success}</div>}
      {error && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      <Button data-testid="contact-submit-button" type="submit" className="sm:w-max" disabled={submitting}>
        {submitting ? 'Đang gửi' : 'Gửi liên hệ'}
      </Button>
    </form>
  );
}
