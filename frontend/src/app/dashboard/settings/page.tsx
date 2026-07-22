'use client';

import type { ClipboardEvent, DragEvent, ReactNode } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Save, ServerCog, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel, Textarea, cn } from '@/components/ui';
import { apiFetch } from '@/lib/api';

type SettingRecord = { key: string; value: unknown; description?: string | null };
type TabId = 'profile' | 'public' | 'email' | 'r2' | 'security' | 'notifications' | 'backup';

const defaultMapEmbedUrl =
  'https://www.openstreetmap.org/export/embed.html?bbox=105.668%2C10.3958%2C105.768%2C10.4958&layer=mapnik&marker=10.4458%2C105.718';
const standardAddress = 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp';
const standardHotlineDisplay = '0907 001 200';
const standardSupportEmail = 'Agripassport@gmail.com';

const publicProfileSchema = z.object({
  appName: z.string().min(1),
  hotline: z.string().min(1),
  hotlineDisplay: z.string().optional(),
  supportEmail: z.string().email(),
  address: z.string().min(1),
  messengerUrl: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  faqText: z.string().optional(),
  homeBadge: z.string().min(1),
  homeTitle: z.string().min(1),
  homeDescription: z.string().min(1),
  homeImageUrl: z.string().optional(),
  homeImageAlt: z.string().optional(),
  introTitle: z.string().min(1),
  introDescription: z.string().min(1),
  introImageUrl: z.string().optional(),
  introImageAlt: z.string().optional(),
  aboutTitle: z.string().min(1),
  aboutDescription: z.string().min(1),
  aboutImageUrl: z.string().optional(),
  aboutImageAlt: z.string().optional(),
  contactTitle: z.string().min(1),
  contactDescription: z.string().min(1),
  contactImageUrl: z.string().optional(),
  contactImageAlt: z.string().optional()
});

const systemProfileSchema = z.object({
  appName: z.string().min(1),
  supportEmail: z.string().email(),
  timezone: z.string().optional()
});

const emailSchema = z.object({
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional()
});

const r2Schema = z.object({
  bucket: z.string().optional(),
  publicBaseUrl: z.string().optional(),
  note: z.string().optional()
});

const securitySchema = z.object({
  sessionHours: z.string().optional(),
  corsOrigins: z.string().optional(),
  rateLimitMax: z.string().optional()
});

const notificationsSchema = z.object({
  orderAlerts: z.boolean().optional(),
  invoiceAlerts: z.boolean().optional(),
  contactAlerts: z.boolean().optional()
});

const backupSchema = z.object({
  enabled: z.boolean().optional(),
  schedule: z.string().optional(),
  retentionDays: z.string().optional()
});

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('public');
  const [r2Message, setR2Message] = useState('');

  const settings = useQuery({ queryKey: ['settings'], queryFn: () => apiFetch<SettingRecord[]>('/settings') });
  const settingsMap = useMemo(() => {
    const map = new Map<string, SettingRecord>();
    for (const item of settings.data?.data ?? []) map.set(item.key, item);
    return map;
  }, [settings.data?.data]);

  const publicForm = useForm({
    resolver: zodResolver(publicProfileSchema),
    values: objectToPublicForm(settingsMap.get('public.siteProfile')?.value)
  });
  const profileForm = useForm({
    resolver: zodResolver(systemProfileSchema),
    values: objectToProfileForm(settingsMap.get('system.profile')?.value)
  });
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    values: objectToEmailForm(settingsMap.get('system.email')?.value)
  });
  const r2Form = useForm({
    resolver: zodResolver(r2Schema),
    values: objectToR2Form(settingsMap.get('system.r2')?.value)
  });
  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    values: objectToSecurityForm(settingsMap.get('system.security')?.value)
  });
  const notificationsForm = useForm({
    resolver: zodResolver(notificationsSchema),
    values: objectToNotificationsForm(settingsMap.get('system.notifications')?.value)
  });
  const backupForm = useForm({
    resolver: zodResolver(backupSchema),
    values: objectToBackupForm(settingsMap.get('system.backup')?.value)
  });
  const watchedAddress = publicForm.watch('address');
  const watchedHotlineDisplay = publicForm.watch('hotlineDisplay');
  const watchedSupportEmail = publicForm.watch('supportEmail');
  const watchedHomeTitle = publicForm.watch('homeTitle');
  const watchedIntroTitle = publicForm.watch('introTitle');
  const watchedAboutTitle = publicForm.watch('aboutTitle');
  const watchedContactTitle = publicForm.watch('contactTitle');
  const watchedFaqText = publicForm.watch('faqText');
  const publicPageCards = [
    { id: 'home', label: 'Trang ch?', href: '/', title: watchedHomeTitle, note: 'Hero, badge, tim kiem va CTA dau tien' },
    { id: 'intro', label: 'Gi?i thi?u', href: '/gioi-thieu', title: watchedIntroTitle, note: 'Trang gi?i thi?u ng?n g?n cho ng??i m?i v?o xem' },
    { id: 'about', label: 'V? ch?ng t?i', href: '/ve-chung-toi', title: watchedAboutTitle, note: 'Trang nang luc, phap ly va thong tin lien he mo rong' },
    { id: 'contact', label: 'Li?n h?', href: '/lien-he', title: watchedContactTitle, note: 'Hotline, email, dia chi, map va FAQ' }
  ];
  const policyPageCards = [
    { id: 'terms', label: 'Dieu khoan su dung', href: '/dieu-khoan-su-dung' },
    { id: 'privacy', label: 'Chinh sach bao mat', href: '/chinh-sach-bao-mat' },
    { id: 'returns', label: 'Chinh sach doi tra', href: '/chinh-sach-doi-tra' },
    { id: 'operations', label: 'Chinh sach van hanh', href: '/chinh-sach-van-hanh' }
  ];
  const faqCount = (watchedFaqText || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;
  const contactMatchesStandard =
    normalizePlainText(watchedAddress) === normalizePlainText(standardAddress) &&
    normalizePlainText(watchedHotlineDisplay) === normalizePlainText(standardHotlineDisplay) &&
    normalizePlainText(watchedSupportEmail) === normalizePlainText(standardSupportEmail);

  const saveMutation = useMutation({
    mutationFn: (payload: { key: string; value: Record<string, unknown>; description?: string }) =>
      apiFetch('/settings', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });

  const testR2 = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; message: string }>('/settings/test-r2', { method: 'POST' }),
    onSuccess: (result) => setR2Message(result.data.message)
  });

  async function uploadPublicAsset(file: File) {
    const presign = await apiFetch<{ uploadUrl: string; publicUrl?: string; objectKey: string }>('/files/presign-upload', {
      method: 'POST',
      body: JSON.stringify({ fileName: file.name, mimeType: file.type, sizeBytes: file.size, visibility: 'PUBLIC' })
    });
    await fetch(presign.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    const confirmed = await apiFetch<{ publicUrl?: string }>('/files/confirm-upload', {
      method: 'POST',
      body: JSON.stringify({
        objectKey: presign.data.objectKey,
        mimeType: file.type,
        sizeBytes: file.size,
        visibility: 'PUBLIC',
        publicUrl: presign.data.publicUrl
      })
    });
    return confirmed.data.publicUrl ?? presign.data.publicUrl ?? '';
  }

  async function uploadLogo(file: File) {
    publicForm.setValue('logoUrl', await uploadPublicAsset(file));
  }

  async function uploadPublicImage(file: File, field: keyof z.infer<typeof publicProfileSchema>) {
    publicForm.setValue(field, await uploadPublicAsset(file));
  }

  function applyStandardContactBundle() {
    publicForm.setValue('hotline', '0907001200');
    publicForm.setValue('hotlineDisplay', standardHotlineDisplay);
    publicForm.setValue('supportEmail', standardSupportEmail);
    publicForm.setValue('address', standardAddress);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">C?i ??t h? th?ng</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`settings-tab-${item.id}`}
            className={cn('rounded-full px-3 py-1 text-sm font-semibold', tab === item.id ? 'bg-leaf text-white' : 'bg-slate-100 text-slate-600')}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Panel>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={profileForm.handleSubmit((values) =>
              saveMutation.mutate({ key: 'system.profile', value: values, description: 'Ho so he thong' })
            )}
          >
            <Field label="Ten he thong"><Input {...profileForm.register('appName')} /></Field>
            <Field label="Email ho tro"><Input type="email" {...profileForm.register('supportEmail')} /></Field>
            <Field label="Mui gio"><Input {...profileForm.register('timezone')} placeholder="Asia/Ho_Chi_Minh" /></Field>
            <SaveButton pending={saveMutation.isPending} />
          </form>
        </Panel>
      )}

      {tab === 'public' && (
        <div className="space-y-4">
          <Panel className="space-y-3 border-mint/70 bg-mint/40">
            <h2 className="text-lg font-bold text-ink">C?p nh?t n?i dung public kh?ng c?n s?a code</h2>
            <p className="text-sm leading-6 text-slate-700">
              Tab n?y d?ng ?? s?a logo, hotline, email, ??a ch?, b?n ??, FAQ v? n?i dung hero c?c trang public. H? s? HTX/s?n ph?m s?a trong dashboard,
              con bai blog public sua tai khu vuc Tin tuc cua Super Admin.
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                ['1', 'S?a li?n h? v? footer', 'C?p nh?t hotline, email, ??a ch? v? b?n ?? ?? hi?n ??ng nh?t tr?n footer v? trang li?n h?.'],
                ['2', 'D?n ?nh v?o t?ng m?c', 'Ch? c?n Ctrl+V ho?c k?o th? ?nh v?o ? ?nh l? h? th?ng t? upload v? c?p nh?t URL.'],
                ['3', 'M? trang public ?? xem', 'Sau khi l?u, b?m c?c n?t xem nhanh b?n d??i ?? ki?m tra ngay tr?n mobile/desktop.']
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-leaf/75">Buoc {step}</p>
                  <p className="mt-1 text-sm font-bold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link href="/dashboard/news" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                So?n blog nhanh
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
              <Link href="/dashboard/cooperatives" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                S?a h? s? HTX
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
              <Link href="/dashboard/products" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                S?a s?n ph?m
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/80 bg-white/92 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">B?ng ?i?u khi?n n?i dung public</p>
                    <p className="mt-1 text-sm font-bold text-ink">M?i trang public ch?nh ??u c? n?t xem nhanh v? m? t? ng?n ?? b?n s?a ??ng ch?, kh?ng c?n nh? c?u tr?c code.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{publicPageCards.length} trang chinh</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {publicPageCards.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink">{item.label}</p>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p>
                        </div>
                        <Link href={item.href} target="_blank" className="inline-flex min-h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                          Xem
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/92 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Th?ng tin chu?n t? docs</p>
                    <p className="mt-1 text-sm font-bold text-ink">??a ch?, hotline v? email n?y ?ang ???c d?ng xuy?n su?t cho footer, li?n h? v? c?c trang ch?nh s?ch.</p>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', contactMatchesStandard ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900')}>
                    {contactMatchesStandard ? '?ang ??ng chu?n' : 'C?n ??i chi?u l?i'}
                  </span>
                </div>
                <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p><span className="font-bold text-ink">Dia chi:</span> {standardAddress}</p>
                  <p><span className="font-bold text-ink">Hotline:</span> {standardHotlineDisplay}</p>
                  <p><span className="font-bold text-ink">Email:</span> {standardSupportEmail}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={applyStandardContactBundle}>
                    ?p d?ng b? th?ng tin chu?n
                  </Button>
                  <Link href="/lien-he" target="_blank" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                    Xem trang li?n h?
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">FAQ ?ang c?</p>
                    <p className="mt-1 text-lg font-bold text-ink">{faqCount}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">M?i d?ng trong ? FAQ s? ra 1 c?p h?i ??p tr?n trang li?n h?.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Trang policy</p>
                    <p className="mt-1 text-lg font-bold text-ink">4 trang</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">?i?u kho?n, b?o m?t, ??i tr? v? v?n h?nh s? t? ??ng l?y b? th?ng tin li?n h? ? ??y.</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {policyPageCards.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:bg-white hover:text-leaf"
                    >
                      {item.label}
                      <ExternalLink size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={publicForm.handleSubmit((values) => {
                const faqs = (values.faqText || '')
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [question, answer] = line.split('|');
                    return { question: question?.trim() ?? '', answer: answer?.trim() ?? '' };
                  })
                  .filter((item) => item.question && item.answer);

                saveMutation.mutate({
                  key: 'public.siteProfile',
                  value: {
                    appName: values.appName,
                    hotline: values.hotline,
                    hotlineDisplay: values.hotlineDisplay,
                    supportEmail: values.supportEmail,
                    address: values.address,
                    messengerUrl: values.messengerUrl,
                    mapEmbedUrl: values.mapEmbedUrl,
                    logoUrl: values.logoUrl,
                    faqs,
                    zaloUrl: '',
                    pageContent: {
                      homeBadge: values.homeBadge,
                      homeTitle: values.homeTitle,
                      homeDescription: values.homeDescription,
                      homeImageUrl: values.homeImageUrl,
                      homeImageAlt: values.homeImageAlt,
                      introTitle: values.introTitle,
                      introDescription: values.introDescription,
                      introImageUrl: values.introImageUrl,
                      introImageAlt: values.introImageAlt,
                      aboutTitle: values.aboutTitle,
                      aboutDescription: values.aboutDescription,
                      aboutImageUrl: values.aboutImageUrl,
                      aboutImageAlt: values.aboutImageAlt,
                      contactTitle: values.contactTitle,
                      contactDescription: values.contactDescription,
                      contactImageUrl: values.contactImageUrl,
                      contactImageAlt: values.contactImageAlt
                    }
                  },
                  description: 'Thong tin public san'
                });
              })}
            >
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">Thông tin liên hệ và footer</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Đây là nơi chỉnh hotline, email, địa chỉ, logo, FAQ và phần bản đồ hiển thị trên footer/trang liên hệ.</p>
                    <p className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
                      Zalo da duoc bo. Neu khong dung Messenger thi co the de trong o Messenger URL.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/" target="_blank" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">Xem trang chủ</Link>
                    <Link href="/lien-he" target="_blank" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">Xem trang liên hệ</Link>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Ten hien thi">
                    <Input {...publicForm.register('appName')} placeholder="HTXONLINE" />
                  </Field>
                  <Field label="Hotline">
                    <Input {...publicForm.register('hotline')} placeholder="0907001200" />
                  </Field>
                  <Field label="Hotline hien thi">
                    <Input {...publicForm.register('hotlineDisplay')} placeholder="0907 001 200" />
                  </Field>
                  <Field label="Email lien he">
                    <Input type="email" {...publicForm.register('supportEmail')} placeholder="Agripassport@gmail.com" />
                  </Field>
                  <Field label="Dia chi" className="sm:col-span-2">
                    <Input {...publicForm.register('address')} placeholder="So 130, To 8, Ap My Xuong, Xa My Tho, Tinh Dong Thap" />
                  </Field>
                  <Field label="M? nh?ng b?n ?? (iframe URL)">
                    <Input {...publicForm.register('mapEmbedUrl')} placeholder="https://www.openstreetmap.org/export/embed.html?..." />
                  </Field>
                  <Field label="Messenger URL">
                    <Input {...publicForm.register('messengerUrl')} placeholder="https://m.me/..." />
                  </Field>
                  <Field label="Logo URL" className="sm:col-span-2">
                    <div className="flex gap-2">
                      <Input {...publicForm.register('logoUrl')} />
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold">
                        <Upload size={16} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void uploadLogo(file);
                          }}
                        />
                      </label>
                    </div>
                  </Field>
                  {publicForm.watch('mapEmbedUrl') && (
                    <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-bold text-ink">Preview khu b?n ?? / footer</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Neu iframe map bi chan tren mot thiet bi nao do, footer van se hien preview dia diem va nut mo Google Maps. O ben duoi la iframe hien tai de doi chieu nhanh.
                      </p>
                      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <iframe
                          src={publicForm.watch('mapEmbedUrl')}
                          title="Map preview"
                          loading="lazy"
                          className="h-64 w-full border-0"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  )}
                  <Field label="FAQ (question|answer moi dong)" className="sm:col-span-2">
                    <Textarea
                      rows={5}
                      {...publicForm.register('faqText')}
                      placeholder={'HTXONLINE ho tro gi?|Ho tro dang san, QR Passport va don hang COD.\nLam sao de dang bai blog?|Mo dashboard Tin tuc, dan noi dung va bam Dang 1 cham.'}
                    />
                    <p className="text-xs font-semibold text-slate-500">
                      Moi dong la 1 cap <span className="font-bold">cau hoi|tra loi</span>. Vi du: <span className="font-bold">HTXONLINE la gi?|N?n t?ng s? cho h?p t?c x?.</span>
                    </p>
                  </Field>
                </div>
              </div>

              <details className="group sm:col-span-2" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Trang chủ</p>
                    <p className="mt-1 text-sm text-slate-600">Sửa badge, tiêu đề, mô tả và ảnh hero của trang đầu tiên người mua nhìn thấy.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mo</span>
                </summary>
                <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <Field label="Badge trang chu"><Input {...publicForm.register('homeBadge')} placeholder="N?n t?ng s? cho h?p t?c x?" /></Field>
                  <Field label="Ti?u ?? trang ch?"><Input {...publicForm.register('homeTitle')} placeholder="HTXONLINE gi?p h?p t?c x? b?n h?ng minh b?ch h?n tr?n m?i tr??ng s?." /></Field>
                  <Field label="M? t? trang ch?" className="sm:col-span-2">
                    <Textarea rows={3} {...publicForm.register('homeDescription')} placeholder="Cong khai san pham, mo QR Passport va van hanh don COD tren cung mot he thong gon, ro, de tin tuong." />
                  </Field>
                  <ImageField
                    label="?nh trang ch?"
                    urlValue={publicForm.watch('homeImageUrl')}
                    altValue={publicForm.watch('homeImageAlt')}
                    onUrlChange={(value) => publicForm.setValue('homeImageUrl', value)}
                    onAltChange={(value) => publicForm.setValue('homeImageAlt', value)}
                    onUpload={(file) => uploadPublicImage(file, 'homeImageUrl')}
                  />
                </div>
              </details>

              <details className="group sm:col-span-2" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Trang giới thiệu và Về chúng tôi</p>
                    <p className="mt-1 text-sm text-slate-600">Hai trang này dùng để kể câu chuyện thương hiệu, năng lực và định hướng của HTXONLINE.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/gioi-thieu" target="_blank" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">Xem Gi?i thi?u</Link>
                    <Link href="/ve-chung-toi" target="_blank" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">Xem V? ch?ng t?i</Link>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mo</span>
                  </div>
                </summary>
                <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <Field label="Ti?u ?? trang gi?i thi?u"><Input {...publicForm.register('introTitle')} placeholder="Gi?i thi?u HTXONLINE" /></Field>
                  <Field label="M? t? trang gi?i thi?u" className="sm:col-span-2">
                    <Textarea rows={3} {...publicForm.register('introDescription')} placeholder="Nen tang san nong san so va QR truy xuat nguon goc cho hop tac xa Viet Nam." />
                  </Field>
                  <ImageField
                    label="?nh trang gi?i thi?u"
                    urlValue={publicForm.watch('introImageUrl')}
                    altValue={publicForm.watch('introImageAlt')}
                    onUrlChange={(value) => publicForm.setValue('introImageUrl', value)}
                    onAltChange={(value) => publicForm.setValue('introImageAlt', value)}
                    onUpload={(file) => uploadPublicImage(file, 'introImageUrl')}
                  />
                  <Field label="Ti?u ?? trang v? ch?ng t?i"><Input {...publicForm.register('aboutTitle')} placeholder="Ch?ng t?i l? HTXONLINE" /></Field>
                  <Field label="M? t? trang v? ch?ng t?i" className="sm:col-span-2">
                    <Textarea rows={3} {...publicForm.register('aboutDescription')} placeholder="S?n n?ng s?n s? gi?p h?p t?c x? k?t n?i th? tr??ng, minh b?ch ngu?n g?c v? b?n h?ng COD hi?u qu?." />
                  </Field>
                  <ImageField
                    label="?nh trang v? ch?ng t?i"
                    urlValue={publicForm.watch('aboutImageUrl')}
                    altValue={publicForm.watch('aboutImageAlt')}
                    onUrlChange={(value) => publicForm.setValue('aboutImageUrl', value)}
                    onAltChange={(value) => publicForm.setValue('aboutImageAlt', value)}
                    onUpload={(file) => uploadPublicImage(file, 'aboutImageUrl')}
                  />
                </div>
              </details>

              <details className="group sm:col-span-2" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Trang liên hệ</p>
                    <p className="mt-1 text-sm text-slate-600">Sửa lời kêu gọi, mô tả hỗ trợ và ảnh minh họa của trang liên hệ.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mo</span>
                </summary>
                <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <Field label="Ti?u ?? trang li?n h?"><Input {...publicForm.register('contactTitle')} placeholder="H?y ?? HTXONLINE k?t n?i v? ??ng h?nh c?ng h?p t?c x? c?a b?n" /></Field>
                  <Field label="M? t? trang li?n h?" className="sm:col-span-2">
                    <Textarea rows={3} {...publicForm.register('contactDescription')} placeholder="T? v?n tham gia s?n, QR truy xu?t ngu?n g?c, h? tr? ??n h?ng COD v? v?n h?nh s? cho HTX." />
                  </Field>
                  <ImageField
                    label="?nh trang li?n h?"
                    urlValue={publicForm.watch('contactImageUrl')}
                    altValue={publicForm.watch('contactImageAlt')}
                    onUrlChange={(value) => publicForm.setValue('contactImageUrl', value)}
                    onAltChange={(value) => publicForm.setValue('contactImageAlt', value)}
                    onUpload={(file) => uploadPublicImage(file, 'contactImageUrl')}
                  />
                </div>
              </details>
              <SaveButton pending={saveMutation.isPending} />
            </form>
          </Panel>
        </div>
      )}

      {tab === 'email' && (
        <Panel>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={emailForm.handleSubmit((values) => saveMutation.mutate({ key: 'system.email', value: values, description: 'Cau hinh email' }))}
          >
            <Field label="Ten nguoi gui"><Input {...emailForm.register('fromName')} /></Field>
            <Field label="Email gui"><Input type="email" {...emailForm.register('fromEmail')} /></Field>
            <Field label="SMTP host"><Input {...emailForm.register('smtpHost')} /></Field>
            <Field label="SMTP port"><Input {...emailForm.register('smtpPort')} /></Field>
            <SaveButton pending={saveMutation.isPending} />
          </form>
        </Panel>
      )}

      {tab === 'r2' && (
        <Panel className="space-y-4">
          <p className="text-sm text-slate-600">Secret R2 v?n l?y t? bi?n m?i tr??ng production. Tab n?y l?u metadata v? test k?t n?i.</p>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={r2Form.handleSubmit((values) => saveMutation.mutate({ key: 'system.r2', value: values, description: 'Metadata R2' }))}
          >
            <Field label="Bucket"><Input {...r2Form.register('bucket')} placeholder={process.env.NEXT_PUBLIC_R2_BUCKET || 'agri-passport'} /></Field>
            <Field label="Public base URL"><Input {...r2Form.register('publicBaseUrl')} /></Field>
            <Field label="Ghi chu" className="sm:col-span-2"><Textarea {...r2Form.register('note')} /></Field>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <SaveButton pending={saveMutation.isPending} />
              <Button type="button" variant="ghost" data-testid="settings-test-r2-button" onClick={() => testR2.mutate()} disabled={testR2.isPending}>
                <ServerCog size={16} />
                Test ket noi R2
              </Button>
            </div>
          </form>
          {r2Message && <p className="text-sm font-semibold text-slate-700">{r2Message}</p>}
        </Panel>
      )}

      {tab === 'security' && (
        <Panel>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={securityForm.handleSubmit((values) => saveMutation.mutate({ key: 'system.security', value: values, description: 'Bao mat' }))}
          >
            <Field label="Session (gio)"><Input {...securityForm.register('sessionHours')} /></Field>
            <Field label="Rate limit max"><Input {...securityForm.register('rateLimitMax')} /></Field>
            <Field label="CORS origins" className="sm:col-span-2">
              <Textarea {...securityForm.register('corsOrigins')} placeholder="https://htxonline.vn,https://admin.htxonline.vn" />
            </Field>
            <SaveButton pending={saveMutation.isPending} />
          </form>
        </Panel>
      )}

      {tab === 'notifications' && (
        <Panel>
          <form
            className="space-y-3"
            onSubmit={notificationsForm.handleSubmit((values) =>
              saveMutation.mutate({ key: 'system.notifications', value: values, description: 'Thong bao' })
            )}
          >
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...notificationsForm.register('orderAlerts')} /> Canh bao don hang moi</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...notificationsForm.register('invoiceAlerts')} /> Canh bao hoa don qua han</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...notificationsForm.register('contactAlerts')} /> Canh bao lien he public</label>
            <SaveButton pending={saveMutation.isPending} />
          </form>
        </Panel>
      )}

      {tab === 'backup' && (
        <Panel>
          <form
            className="space-y-3"
            onSubmit={backupForm.handleSubmit((values) => saveMutation.mutate({ key: 'system.backup', value: values, description: 'Backup' }))}
          >
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...backupForm.register('enabled')} /> Bat backup tu dong</label>
            <Field label="Lich cron"><Input {...backupForm.register('schedule')} placeholder="0 2 * * *" /></Field>
            <Field label="Giu (ngay)"><Input {...backupForm.register('retentionDays')} /></Field>
            <SaveButton pending={saveMutation.isPending} />
          </form>
        </Panel>
      )}

      <Panel className="p-0">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="text-sm font-bold text-ink">Dữ liệu nâng cao</p>
              <p className="text-sm text-slate-600">Chỉ mở mục này khi cần kiểm tra dữ liệu hệ thống đã lưu sau khi bấm Lưu.</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 transition group-open:rotate-180">Mở</span>
          </summary>
          <div className="grid gap-3 border-t border-slate-100 px-4 pb-4 pt-4 md:grid-cols-2">
            {(settings.data?.data ?? []).map((setting) => (
              <Panel key={setting.key}>
                <h2 className="font-bold">{setting.key}</h2>
                <pre className="mt-2 overflow-auto rounded-md bg-slate-50 p-3 text-xs">{JSON.stringify(setting.value, null, 2)}</pre>
              </Panel>
            ))}
          </div>
        </details>
      </Panel>
    </div>
  );
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'H? s? s?n' },
  { id: 'public', label: 'Li?n h? public' },
  { id: 'email', label: 'Email' },
  { id: 'r2', label: 'R2' },
  { id: 'security', label: 'Bao mat' },
  { id: 'notifications', label: 'Thong bao' },
  { id: 'backup', label: 'Backup' }
];

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('space-y-1 text-sm font-semibold', className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="sm:w-max" disabled={pending}>
      <Save size={18} />
      {pending ? '?ang l?u' : 'L?u'}
    </Button>
  );
}

function ImageField({
  label,
  urlValue,
  altValue,
  onUrlChange,
  onAltChange,
  onUpload
}: {
  label: string;
  urlValue: string;
  altValue: string;
  onUrlChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onUpload: (file: File) => Promise<void> | void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  }

  async function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const file = Array.from(event.clipboardData?.items ?? [])
      .find((item) => item.type.startsWith('image/'))
      ?.getAsFile();
    if (!file) return;
    event.preventDefault();
    await handleFile(file);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = Array.from(event.dataTransfer.files ?? []).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    await handleFile(file);
  }

  return (
    <div className="grid gap-3 sm:col-span-2">
      <div
        tabIndex={0}
        onPaste={(event) => void handlePaste(event)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => void handleDrop(event)}
        className="rounded-2xl border border-dashed border-leaf/30 bg-mint/40 px-4 py-3 text-sm text-slate-700 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
      >
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-1 leading-6">
          Dán ảnh trực tiếp bằng <span className="font-semibold">Ctrl+V</span>, hoặc kéo ảnh vào đây để tự upload. {isUploading ? 'Đang upload ảnh...' : 'Ảnh mới sẽ cập nhật ngay vào ô URL bên dưới.'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
      <Field label={`${label} URL`}>
        <div className="flex gap-2">
          <Input value={urlValue} onChange={(event) => onUrlChange(event.target.value)} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold">
            <Upload size={16} />
            {isUploading ? '?ang upload' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
        </div>
      </Field>
      <Field label={`${label} alt`}>
        <Input value={altValue} onChange={(event) => onAltChange(event.target.value)} />
      </Field>
      </div>
      {urlValue && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 sm:max-w-md">
          <img src={urlValue} alt={altValue || label} className="aspect-[16/10] w-full rounded-xl object-cover" />
        </div>
      )}
    </div>
  );
}

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function normalizePlainText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function objectToPublicForm(value: unknown) {
  const object = asObject(value);
  const faqs = Array.isArray(object.faqs) ? object.faqs : [];
  const pageContent = asObject(object.pageContent);
  return {
    appName: String(object.appName ?? 'HTXONLINE'),
    hotline: String(object.hotline ?? '0907001200'),
    hotlineDisplay: String(object.hotlineDisplay ?? ''),
    supportEmail: String(object.supportEmail ?? 'Agripassport@gmail.com'),
    address: String(object.address ?? 'Số 130, Tổ 8, Ấp Mỹ Xương, Xã Mỹ Thọ, Tỉnh Đồng Tháp'),
    messengerUrl: String(object.messengerUrl ?? ''),
    mapEmbedUrl: String(object.mapEmbedUrl ?? defaultMapEmbedUrl),
    logoUrl: String(object.logoUrl ?? ''),
    faqText: faqs.map((item) => `${(item as { question?: string }).question ?? ''}|${(item as { answer?: string }).answer ?? ''}`).join('\n'),
    homeBadge: String(pageContent.homeBadge ?? 'N?n t?ng s? cho h?p t?c x?'),
    homeTitle: String(pageContent.homeTitle ?? 'HTXONLINE gi?p h?p t?c x? b?n h?ng minh b?ch h?n tr?n m?i tr??ng s?.'),
    homeDescription: String(
      pageContent.homeDescription ?? 'C?ng khai s?n ph?m, m? QR Passport cho ng??i mua v? v?n h?nh quy tr?nh ??n COD tr?n c?ng m?t h? th?ng g?n, r? v? d? tin t??ng.'
    ),
    homeImageUrl: String(pageContent.homeImageUrl ?? ''),
    homeImageAlt: String(pageContent.homeImageAlt ?? ''),
    introTitle: String(pageContent.introTitle ?? 'Gi?i thi?u HTXONLINE'),
    introDescription: String(pageContent.introDescription ?? 'Nen tang san nong san so va QR truy xuat nguon goc cho hop tac xa Viet Nam.'),
    introImageUrl: String(pageContent.introImageUrl ?? ''),
    introImageAlt: String(pageContent.introImageAlt ?? ''),
    aboutTitle: String(pageContent.aboutTitle ?? 'Ch?ng t?i l? HTXONLINE'),
    aboutDescription: String(pageContent.aboutDescription ?? 'S?n n?ng s?n s? gi?p h?p t?c x? k?t n?i th? tr??ng, minh b?ch ngu?n g?c v? b?n h?ng COD hi?u qu?.'),
    aboutImageUrl: String(pageContent.aboutImageUrl ?? ''),
    aboutImageAlt: String(pageContent.aboutImageAlt ?? ''),
    contactTitle: String(pageContent.contactTitle ?? 'H?y ?? HTXONLINE k?t n?i v? ??ng h?nh c?ng h?p t?c x? c?a b?n'),
    contactDescription: String(pageContent.contactDescription ?? 'T? v?n tham gia s?n, QR truy xu?t ngu?n g?c, h? tr? ??n h?ng COD v? v?n h?nh s? cho HTX.'),
    contactImageUrl: String(pageContent.contactImageUrl ?? ''),
    contactImageAlt: String(pageContent.contactImageAlt ?? '')
  };
}

function objectToProfileForm(value: unknown) {
  const object = asObject(value);
  return {
    appName: String(object.appName ?? 'HTXONLINE'),
    supportEmail: String(object.supportEmail ?? 'Agripassport@gmail.com'),
    timezone: String(object.timezone ?? 'Asia/Ho_Chi_Minh')
  };
}

function objectToEmailForm(value: unknown) {
  const object = asObject(value);
  return {
    fromName: String(object.fromName ?? 'HTXONLINE'),
    fromEmail: String(object.fromEmail ?? 'Agripassport@gmail.com'),
    smtpHost: String(object.smtpHost ?? ''),
    smtpPort: String(object.smtpPort ?? '587')
  };
}

function objectToR2Form(value: unknown) {
  const object = asObject(value);
  return { bucket: String(object.bucket ?? ''), publicBaseUrl: String(object.publicBaseUrl ?? ''), note: String(object.note ?? '') };
}

function objectToSecurityForm(value: unknown) {
  const object = asObject(value);
  return { sessionHours: String(object.sessionHours ?? '24'), corsOrigins: String(object.corsOrigins ?? ''), rateLimitMax: String(object.rateLimitMax ?? '120') };
}

function objectToNotificationsForm(value: unknown) {
  const object = asObject(value);
  return { orderAlerts: Boolean(object.orderAlerts ?? true), invoiceAlerts: Boolean(object.invoiceAlerts ?? true), contactAlerts: Boolean(object.contactAlerts ?? true) };
}

function objectToBackupForm(value: unknown) {
  const object = asObject(value);
  return { enabled: Boolean(object.enabled ?? true), schedule: String(object.schedule ?? '0 2 * * *'), retentionDays: String(object.retentionDays ?? '14') };
}
