'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { Button, Input, Textarea, cn } from './ui';

const phonePattern = /^(0|\+84)[0-9]{8,10}$/;

const HELP_TOPICS = [
  { id: 'digitalize', label: 'Số hóa hợp tác xã & quản lý dữ liệu' },
  { id: 'product-publish', label: 'Đưa sản phẩm lên Agripassport' },
  { id: 'commerce', label: 'Kết nối tiêu thụ / bán hàng COD' },
  { id: 'other', label: 'Tôi có nhu cầu khác, cần được tư vấn thêm' }
] as const;

type PublicContactFormProps = {
  sourcePath?: string;
  variant?: 'default' | 'hero' | 'contact';
};

export function PublicContactForm({ sourcePath = '/lien-he', variant = 'default' }: PublicContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState<string>(HELP_TOPICS[0].id);
  const isHero = variant === 'hero';
  const isContact = variant === 'contact';

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
      <form className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:gap-5" onSubmit={submit}>
        <div className="min-w-0 rounded-[1.8rem] bg-[linear-gradient(145deg,#0d1325_0%,#14253a_38%,#245f3e_100%)] p-5 text-white shadow-[0_24px_60px_rgba(13,19,37,0.22)] sm:p-6">
          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/80">
            Tư vấn nhanh
          </div>
          <h2 className="mt-3 text-[1.45rem] font-extrabold leading-[1.05] sm:text-[1.9rem]">Bạn muốn đội vận hành hỗ trợ phần nào trước?</h2>
          <p className="mt-3 text-sm leading-7 text-white/78 sm:text-[0.96rem]">
            Chọn đúng nhu cầu để chúng tôi phản hồi nhanh hơn, ưu tiên triển khai sát mô hình HTX hoặc sản phẩm của bạn.
          </p>
          <div className="mt-5 grid gap-3">
            {HELP_TOPICS.map((item) => {
              const selected = topic === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-[1.25rem] border px-3.5 py-3.5 text-sm transition',
                    selected
                      ? 'border-white/18 bg-white/16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'border-white/10 bg-black/16 text-white/82 hover:border-white/18 hover:bg-white/10'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                      selected ? 'border-[#d9f99d] bg-[#d9f99d]' : 'border-white/35 bg-transparent'
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <input type="radio" name="topic" value={item.id} checked={selected} onChange={() => setTopic(item.id)} className="sr-only" />
                  <span className="leading-6 font-medium">{item.label}</span>
                </label>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { label: 'Phản hồi', value: 'Trong ngày' },
              { label: 'Triển khai', value: 'Sàn + QR' },
              { label: 'Ưu tiên', value: 'Mobile-first' }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-white/10 bg-white/10 p-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">{item.label}</p>
                <p className="mt-1.5 text-sm font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 gap-4 rounded-[1.8rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Điền thông tin</p>
            <h3 className="mt-2 text-[1.25rem] font-extrabold leading-tight text-ink sm:text-[1.6rem]">Chúng tôi sẽ liên hệ lại sớm nhất.</h3>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Họ tên / Tên HTX</span>
            <Input data-testid="contact-name-input" name="fullName" required className="bg-[var(--surface-0)]" placeholder="VD: HTX Lúa ST25 Đồng Tháp" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Số điện thoại</span>
            <Input data-testid="contact-phone-input" name="phone" required inputMode="tel" className="bg-[var(--surface-0)]" placeholder="0907 001 200" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Email</span>
            <Input data-testid="contact-email-input" name="email" type="email" className="bg-[var(--surface-0)]" placeholder="ban@htx.vn" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Nội dung</span>
            <Textarea data-testid="contact-message-input" name="message" required className="min-h-32 bg-[var(--surface-0)]" placeholder="Mô tả ngắn nhu cầu của bạn..." />
          </label>
          {success && (
            <div data-testid="toast-success" className="rounded-[1.2rem] bg-mint p-3 text-sm font-semibold text-leaf">
              {success}
            </div>
          )}
          {error && (
            <div data-testid="toast-error" className="rounded-[1.2rem] bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
          <Button data-testid="contact-submit-button" type="submit" className="mt-1 min-h-12 w-full justify-center rounded-[1.15rem]" disabled={submitting}>
            {submitting ? 'Đang gửi' : 'Liên hệ ngay'}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </form>
    );
  }

  if (isContact) {
    return (
      <form className="grid gap-4 rounded-[2rem] border border-[#e7e3d7] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-6" onSubmit={submit}>
        <div className="border-b border-[#ece8dd] pb-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#2b8a3e]">Điền thông tin</p>
          <h2 className="mt-2 text-[1.45rem] font-extrabold leading-[1.06] text-[#1f2233] sm:text-[1.95rem]">Để lại thông tin để được tư vấn</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-[0.96rem]">
            Chọn đúng nhu cầu của bạn, đội vận hành sẽ phản hồi trong thời gian sớm nhất và hướng dẫn luồng triển khai phù hợp.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Họ tên / Tên HTX</span>
            <Input data-testid="contact-name-input" name="fullName" required className="bg-white" placeholder="VD: HTX Lúa ST25 Đồng Tháp" />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
            <span>Số điện thoại</span>
            <Input data-testid="contact-phone-input" name="phone" required inputMode="tel" className="bg-white" placeholder="0907 001 200" />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          <span>Email</span>
          <Input data-testid="contact-email-input" name="email" type="email" className="bg-white" placeholder="ban@htx.vn" />
        </label>

        <div className="grid gap-2.5">
          <p className="text-sm font-semibold text-ink">Nhu cầu hỗ trợ</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {HELP_TOPICS.map((item) => {
              const selected = topic === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-3.5 py-3 text-sm transition',
                    selected ? 'border-[#1f9b4b] bg-[#f5fbf4] text-[#1f2233]' : 'border-[#e6eadf] bg-white text-slate-600 hover:border-[#b7d6bf]'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                      selected ? 'border-[#1f9b4b] bg-[#1f9b4b]' : 'border-[#c8d4c8] bg-white'
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <input type="radio" name="topic" value={item.id} checked={selected} onChange={() => setTopic(item.id)} className="sr-only" />
                  <span className="leading-6 font-medium">{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          <span>Nội dung</span>
          <Textarea data-testid="contact-message-input" name="message" required className="min-h-36 bg-white" placeholder="Mô tả ngắn mô hình HTX, sản phẩm hoặc nhu cầu hỗ trợ của bạn..." />
        </label>

        {success && (
          <div data-testid="toast-success" className="rounded-[1.2rem] bg-mint p-3 text-sm font-semibold text-leaf">
            {success}
          </div>
        )}
        {error && (
          <div data-testid="toast-error" className="rounded-[1.2rem] bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <Button data-testid="contact-submit-button" type="submit" className="min-h-12 w-full justify-center rounded-full" disabled={submitting}>
          {submitting ? 'Đang gửi' : 'Gửi liên hệ'}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </form>
    );
  }

  return (
    <form className="grid gap-3 rounded-[1.6rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] p-4 shadow-[var(--shadow-card)] sm:p-5" onSubmit={submit}>
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
      {success && <div data-testid="toast-success" className="rounded-[1.1rem] bg-mint p-3 text-sm font-semibold text-leaf">{success}</div>}
      {error && <div data-testid="toast-error" className="rounded-[1.1rem] bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      <Button data-testid="contact-submit-button" type="submit" className="min-h-11 justify-center sm:w-max" disabled={submitting}>
        {submitting ? 'Đang gửi' : 'Gửi liên hệ'}
      </Button>
    </form>
  );
}
