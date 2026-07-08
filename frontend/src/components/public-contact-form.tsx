'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { Button, Input, Textarea, cn } from './ui';

const phonePattern = /^(0|\+84)[0-9]{8,10}$/;

const HELP_TOPICS = [
  { id: 'join-marketplace', label: 'Tôi muốn tham gia sàn HTXONLINE' },
  { id: 'qr-trace', label: 'Tôi cần tư vấn QR Passport / truy xuất nguồn gốc' },
  { id: 'order-support', label: 'Tôi cần hỗ trợ đơn hàng COD' },
  { id: 'other', label: 'Tôi có nhu cầu khác, cần được tư vấn thêm' }
] as const;

type PublicContactFormProps = {
  sourcePath?: string;
  variant?: 'default' | 'hero';
};

export function PublicContactForm({ sourcePath = '/lien-he', variant = 'default' }: PublicContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState<string>(HELP_TOPICS[0].id);
  const isHero = variant === 'hero';

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
    const topicLabel = HELP_TOPICS.find((item) => item.id === topic)?.label ?? topic;
    const composedMessage = `[${topicLabel}]\n${message}`;

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
          message: composedMessage,
          sourcePath
        })
      });
      const body = (await response.json().catch(() => null)) as ApiEnvelope<{ id: string }> | null;
      if (!response.ok || !body?.success) {
        throw new Error(body?.errors?.[0]?.message || body?.message || 'Không thể gửi liên hệ');
      }
      form.reset();
      setTopic(HELP_TOPICS[0].id);
      setSuccess('Thông tin đã được gửi. Đội vận hành sẽ liên hệ với bạn trong thời gian sớm nhất.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi liên hệ');
    } finally {
      setSubmitting(false);
    }
  }

  if (isHero) {
    return (
      <form className="grid gap-8 lg:grid-cols-2 lg:gap-10" onSubmit={submit}>
        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">Bạn muốn HTXONLINE hỗ trợ gì?</h2>
          <p className="mt-2 text-sm leading-6 text-white/85">Chọn nhu cầu phù hợp để đội vận hành tư vấn nhanh hơn.</p>
          <div className="mt-5 grid gap-3">
            {HELP_TOPICS.map((item) => {
              const selected = topic === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3.5 text-sm transition',
                    selected
                      ? 'border-white/70 bg-white/18 text-white shadow-sm'
                      : 'border-white/25 bg-white/8 text-white/92 hover:border-white/45 hover:bg-white/12'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                      selected ? 'border-white bg-white' : 'border-white/70 bg-transparent'
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span className="h-2.5 w-2.5 rounded-full bg-leaf" /> : null}
                  </span>
                  <input
                    type="radio"
                    name="topic"
                    value={item.id}
                    checked={selected}
                    onChange={() => setTopic(item.id)}
                    className="sr-only"
                  />
                  <span className="leading-6">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid min-w-0 gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-white">
            <span>Họ tên / Tên HTX</span>
            <Input
              data-testid="contact-name-input"
              name="fullName"
              required
              className="border border-transparent bg-white text-ink placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/25"
              placeholder="VD: HTX Lúa ST25 Đồng Tháp"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-white">
            <span>Số điện thoại</span>
            <Input
              data-testid="contact-phone-input"
              name="phone"
              required
              inputMode="tel"
              className="border border-transparent bg-white text-ink placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/25"
              placeholder="0900 000 000"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-white">
            <span>Email</span>
            <Input
              data-testid="contact-email-input"
              name="email"
              type="email"
              className="border border-transparent bg-white text-ink placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/25"
              placeholder="ban@htx.vn"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-white">
            <span>Nội dung</span>
            <Textarea
              data-testid="contact-message-input"
              name="message"
              required
              className="min-h-28 border border-transparent bg-white text-ink placeholder:text-slate-400 focus:border-white focus:ring-4 focus:ring-white/25"
              placeholder="Mô tả ngắn nhu cầu của bạn..."
            />
          </label>
          {success && <div data-testid="toast-success" className="rounded-xl bg-mint p-3 text-sm font-semibold text-leaf">{success}</div>}
          {error && <div data-testid="toast-error" className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
          <Button
            data-testid="contact-submit-button"
            type="submit"
            className="mt-1 w-full border border-white/20 bg-white text-leaf shadow-sm hover:bg-mint sm:w-max"
            disabled={submitting}
          >
            {submitting ? 'Đang gửi' : 'Liên hệ ngay'}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </form>
    );
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
