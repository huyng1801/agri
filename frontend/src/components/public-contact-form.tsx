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

    if (!fullName) return setError('Ho ten la bat buoc');
    if (!phonePattern.test(phone)) return setError('So dien thoai Viet Nam khong hop le');
    if (message.length < 10) return setError('Noi dung lien he can toi thieu 10 ky tu');

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
        throw new Error(body?.errors?.[0]?.message || body?.message || 'Khong the gui lien he');
      }
      form.reset();
      setSuccess('Thong tin da duoc gui. Doi van hanh se lien he voi ban trong thoi gian som nhat.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Khong the gui lien he');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <label className="space-y-1 text-sm font-semibold">
        <span>Ho ten</span>
        <Input data-testid="contact-name-input" name="fullName" required />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>So dien thoai</span>
        <Input data-testid="contact-phone-input" name="phone" required inputMode="tel" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Email</span>
        <Input data-testid="contact-email-input" name="email" type="email" />
      </label>
      <label className="space-y-1 text-sm font-semibold">
        <span>Noi dung</span>
        <Textarea data-testid="contact-message-input" name="message" required />
      </label>
      {success && <div data-testid="toast-success" className="rounded-md bg-mint p-3 text-sm font-semibold text-leaf">{success}</div>}
      {error && <div data-testid="toast-error" className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      <Button data-testid="contact-submit-button" type="submit" className="sm:w-max" disabled={submitting}>
        {submitting ? 'Dang gui' : 'Gui lien he'}
      </Button>
    </form>
  );
}
