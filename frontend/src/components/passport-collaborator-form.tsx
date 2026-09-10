'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { API_URL, type ApiEnvelope } from '@/lib/api';
import { Button, Input, Select, Textarea, cn } from './ui';

const phonePattern = /^(0|\+84)[0-9]{8,10}$/;

export function PassportCollaboratorForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');
    setError('');

    const form = event.currentTarget;
    const values = new FormData(form);
    const fullName = String(values.get('fullName') || '').trim();
    const phone = String(values.get('phone') || '').trim();
    const email = String(values.get('email') || '').trim();
    const province = String(values.get('province') || '').trim();
    const currentWork = String(values.get('currentWork') || '').trim();
    const businessContact = String(values.get('businessContact') || '').trim();
    const startTime = String(values.get('startTime') || '').trim();
    const note = String(values.get('note') || '').trim();

    if (!fullName) return setError('Họ và tên là bắt buộc');
    if (!phonePattern.test(phone)) return setError('Số điện thoại Việt Nam không hợp lệ');
    if (!email.includes('@')) return setError('Email không hợp lệ');
    if (!province) return setError('Vui lòng chọn tỉnh / thành phố');
    if (!currentWork) return setError('Vui lòng cho biết công việc hiện tại');
    if (!startTime) return setError('Vui lòng chọn thời gian có thể bắt đầu');
    if (!values.get('consent')) return setError('Bạn cần xác nhận thông tin trước khi gửi');

    const message = [
      '[Đăng ký cộng tác viên Hộ chiếu nông nghiệp]',
      `Tỉnh / Thành phố: ${province}`,
      `Công việc hiện tại: ${currentWork}`,
      `Nhóm doanh nghiệp thường tiếp xúc: ${businessContact || 'Chưa có'}`,
      `Thời gian có thể bắt đầu: ${startTime}`,
      note ? `Điều muốn trao đổi thêm: ${note}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/contacts/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, message, sourcePath: '/tuyen-cong-tac-vien' })
      });
      const body = (await response.json().catch(() => null)) as ApiEnvelope<{ id: string }> | null;
      if (!response.ok || !body?.success) {
        throw new Error(body?.errors?.[0]?.message || body?.message || 'Không thể gửi hồ sơ cộng tác');
      }
      form.reset();
      setSuccess('Đã nhận hồ sơ. Đội vận hành sẽ liên hệ lại với bạn trong thời gian sớm nhất.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi hồ sơ cộng tác');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      id="dang-ky"
      onSubmit={submit}
      className="grid gap-4 rounded-[2rem] border border-[var(--border)] bg-white p-5 shadow-[0_22px_52px_rgba(15,23,42,0.07)] sm:p-7"
    >
      <div className="border-b border-[var(--border)] pb-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">Thông tin của bạn</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <h2 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-[2rem]">Hồ sơ đăng ký</h2>
          <span className="shrink-0 rounded-full bg-[var(--brand-primary-subtle)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary-strong)]">Khoảng 2 phút</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Điền những thông tin cơ bản để chúng tôi hiểu cách đồng hành phù hợp với bạn.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <span>Họ và tên *</span>
          <Input data-testid="collaborator-name-input" name="fullName" required autoComplete="name" placeholder="Nguyễn Minh Anh" />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <span>Số điện thoại *</span>
          <Input data-testid="collaborator-phone-input" name="phone" required inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
        <span>Email *</span>
        <Input data-testid="collaborator-email-input" name="email" type="email" required autoComplete="email" placeholder="tenban@email.com" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <span>Tỉnh / Thành phố *</span>
          <Select data-testid="collaborator-province-input" name="province" defaultValue="" required>
            <option value="" disabled>Chọn tỉnh / thành phố</option>
            <option>Đồng Tháp</option>
            <option>Đà Nẵng</option>
            <option>Hà Nội</option>
            <option>Thành phố Hồ Chí Minh</option>
            <option>Tỉnh / thành phố khác</option>
          </Select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
          <span>Thời gian có thể bắt đầu *</span>
          <Select data-testid="collaborator-start-time-input" name="startTime" defaultValue="" required>
            <option value="" disabled>Chọn thời gian phù hợp</option>
            <option>Trong 3 ngày</option>
            <option>Trong 7 ngày</option>
            <option>Trong 30 ngày</option>
            <option>Cần trao đổi thêm</option>
          </Select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
        <span>Công việc hiện tại *</span>
        <Input data-testid="collaborator-work-input" name="currentWork" required placeholder="Ví dụ: kinh doanh, kế toán, quản lý HTX..." />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
        <span>Nhóm doanh nghiệp thường tiếp xúc</span>
        <Input data-testid="collaborator-network-input" name="businessContact" placeholder="Không bắt buộc" />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
        <span>Điều bạn muốn trao đổi thêm</span>
        <Textarea data-testid="collaborator-note-input" name="note" className="min-h-24" placeholder="Bạn muốn bắt đầu hoặc cần được hướng dẫn điều gì?" />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-[1rem] bg-[var(--surface-muted)] px-3.5 py-3 text-sm leading-6 text-[var(--text-secondary)]">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand-primary)]" />
        <span>Tôi xác nhận thông tin là chính xác và đồng ý để Hộ chiếu nông nghiệp liên hệ về chương trình cộng tác.</span>
      </label>

      {success ? <div data-testid="collaborator-success" className="rounded-[1rem] bg-[var(--brand-primary-subtle)] p-3 text-sm font-semibold text-[var(--brand-primary-strong)]">{success}</div> : null}
      {error ? <div data-testid="collaborator-error" className="rounded-[1rem] bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div> : null}

      <Button data-testid="collaborator-submit-button" type="submit" className={cn('min-h-12 w-full justify-center rounded-full', submitting && 'cursor-wait')} disabled={submitting}>
        {submitting ? 'Đang gửi hồ sơ' : 'Đăng ký cộng tác'}
        <ArrowRight size={17} aria-hidden="true" />
      </Button>
      <p className="text-center text-xs text-[var(--text-tertiary)]">Thông tin chỉ được dùng để phản hồi đăng ký và được bảo mật.</p>
    </form>
  );
}
