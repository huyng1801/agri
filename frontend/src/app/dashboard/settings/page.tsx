'use client';

import type { ReactNode } from 'react';
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
  const [tab, setTab] = useState<TabId>('profile');
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

  const saveMutation = useMutation({
    mutationFn: (payload: { key: string; value: Record<string, unknown>; description?: string }) =>
      apiFetch('/settings', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });

  const testR2 = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; message: string }>('/settings/test-r2', { method: 'POST' }),
    onSuccess: (result) => setR2Message(result.data.message)
  });

  async function uploadLogo(file: File) {
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
    publicForm.setValue('logoUrl', confirmed.data.publicUrl ?? presign.data.publicUrl ?? '');
  }

  async function uploadPublicImage(file: File, field: keyof z.infer<typeof publicProfileSchema>) {
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
    publicForm.setValue(field, confirmed.data.publicUrl ?? presign.data.publicUrl ?? '');
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Cai dat he thong</h1>
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
            <h2 className="text-lg font-bold text-ink">Cap nhat noi dung public khong can sua code</h2>
            <p className="text-sm leading-6 text-slate-700">
              Tab nay dung de sua logo, hotline, email, dia chi, ban do, FAQ va noi dung hero cac trang public. Ho so HTX/san pham sua trong dashboard,
              con bai blog public sua tai khu vuc Tin tuc cua Super Admin.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link href="/dashboard/news" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                Soan blog nhanh
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
              <Link href="/dashboard/cooperatives" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                Sua ho so HTX
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
              <Link href="/dashboard/products" className="inline-flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf">
                Sua san pham
                <ExternalLink size={16} aria-hidden="true" />
              </Link>
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
              <Field label="Ten hien thi"><Input {...publicForm.register('appName')} /></Field>
              <Field label="Hotline"><Input {...publicForm.register('hotline')} /></Field>
              <Field label="Hotline hien thi"><Input {...publicForm.register('hotlineDisplay')} /></Field>
              <Field label="Email lien he"><Input type="email" {...publicForm.register('supportEmail')} /></Field>
              <Field label="Dia chi"><Input {...publicForm.register('address')} /></Field>
              <Field label="Ma nhung ban do (iframe URL)"><Input {...publicForm.register('mapEmbedUrl')} /></Field>
              <Field label="Messenger URL"><Input {...publicForm.register('messengerUrl')} placeholder="https://m.me/..." /></Field>
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
              <Field label="FAQ (question|answer moi dong)" className="sm:col-span-2">
                <Textarea rows={5} {...publicForm.register('faqText')} />
              </Field>
              <Field label="Badge trang chu"><Input {...publicForm.register('homeBadge')} /></Field>
              <Field label="Tieu de trang chu"><Input {...publicForm.register('homeTitle')} /></Field>
              <Field label="Mo ta trang chu" className="sm:col-span-2">
                <Textarea rows={3} {...publicForm.register('homeDescription')} />
              </Field>
              <ImageField
                label="Anh trang chu"
                urlValue={publicForm.watch('homeImageUrl')}
                altValue={publicForm.watch('homeImageAlt')}
                onUrlChange={(value) => publicForm.setValue('homeImageUrl', value)}
                onAltChange={(value) => publicForm.setValue('homeImageAlt', value)}
                onUpload={(file) => void uploadPublicImage(file, 'homeImageUrl')}
              />
              <Field label="Tieu de trang gioi thieu"><Input {...publicForm.register('introTitle')} /></Field>
              <Field label="Mo ta trang gioi thieu" className="sm:col-span-2">
                <Textarea rows={3} {...publicForm.register('introDescription')} />
              </Field>
              <ImageField
                label="Anh trang gioi thieu"
                urlValue={publicForm.watch('introImageUrl')}
                altValue={publicForm.watch('introImageAlt')}
                onUrlChange={(value) => publicForm.setValue('introImageUrl', value)}
                onAltChange={(value) => publicForm.setValue('introImageAlt', value)}
                onUpload={(file) => void uploadPublicImage(file, 'introImageUrl')}
              />
              <Field label="Tieu de trang ve chung toi"><Input {...publicForm.register('aboutTitle')} /></Field>
              <Field label="Mo ta trang ve chung toi" className="sm:col-span-2">
                <Textarea rows={3} {...publicForm.register('aboutDescription')} />
              </Field>
              <ImageField
                label="Anh trang ve chung toi"
                urlValue={publicForm.watch('aboutImageUrl')}
                altValue={publicForm.watch('aboutImageAlt')}
                onUrlChange={(value) => publicForm.setValue('aboutImageUrl', value)}
                onAltChange={(value) => publicForm.setValue('aboutImageAlt', value)}
                onUpload={(file) => void uploadPublicImage(file, 'aboutImageUrl')}
              />
              <Field label="Tieu de trang lien he"><Input {...publicForm.register('contactTitle')} /></Field>
              <Field label="Mo ta trang lien he" className="sm:col-span-2">
                <Textarea rows={3} {...publicForm.register('contactDescription')} />
              </Field>
              <ImageField
                label="Anh trang lien he"
                urlValue={publicForm.watch('contactImageUrl')}
                altValue={publicForm.watch('contactImageAlt')}
                onUrlChange={(value) => publicForm.setValue('contactImageUrl', value)}
                onAltChange={(value) => publicForm.setValue('contactImageAlt', value)}
                onUpload={(file) => void uploadPublicImage(file, 'contactImageUrl')}
              />
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
          <p className="text-sm text-slate-600">Secret R2 van lay tu bien moi truong production. Tab nay luu metadata va test ket noi.</p>
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

      <div className="grid gap-3 md:grid-cols-2">
        {(settings.data?.data ?? []).map((setting) => (
          <Panel key={setting.key}>
            <h2 className="font-bold">{setting.key}</h2>
            <pre className="mt-2 overflow-auto rounded-md bg-slate-50 p-3 text-xs">{JSON.stringify(setting.value, null, 2)}</pre>
          </Panel>
        ))}
      </div>
    </div>
  );
}

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'Ho so san' },
  { id: 'public', label: 'Lien he public' },
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
      {pending ? 'Dang luu' : 'Luu'}
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
  onUpload: (file: File) => void;
}) {
  return (
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[1.2fr_0.8fr]">
      <Field label={`${label} URL`}>
        <div className="flex gap-2">
          <Input value={urlValue} onChange={(event) => onUrlChange(event.target.value)} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold">
            <Upload size={16} />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </label>
        </div>
      </Field>
      <Field label={`${label} alt`}>
        <Input value={altValue} onChange={(event) => onAltChange(event.target.value)} />
      </Field>
    </div>
  );
}

function asObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
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
    address: String(object.address ?? 'So 130, To 8, Ap My Xuong, Xa My Tho, Tinh Dong Thap'),
    messengerUrl: String(object.messengerUrl ?? ''),
    mapEmbedUrl: String(object.mapEmbedUrl ?? defaultMapEmbedUrl),
    logoUrl: String(object.logoUrl ?? ''),
    faqText: faqs.map((item) => `${(item as { question?: string }).question ?? ''}|${(item as { answer?: string }).answer ?? ''}`).join('\n'),
    homeBadge: String(pageContent.homeBadge ?? 'Nen tang so cho hop tac xa'),
    homeTitle: String(pageContent.homeTitle ?? 'HTXONLINE giup hop tac xa ban hang minh bach hon tren moi truong so.'),
    homeDescription: String(
      pageContent.homeDescription ?? 'Cong khai san pham, mo QR Passport cho nguoi mua va van hanh quy trinh don COD tren cung mot he thong gon, ro va de tin tuong.'
    ),
    homeImageUrl: String(pageContent.homeImageUrl ?? ''),
    homeImageAlt: String(pageContent.homeImageAlt ?? ''),
    introTitle: String(pageContent.introTitle ?? 'Gioi thieu HTXONLINE'),
    introDescription: String(pageContent.introDescription ?? 'Nen tang san nong san so va QR truy xuat nguon goc cho hop tac xa Viet Nam.'),
    introImageUrl: String(pageContent.introImageUrl ?? ''),
    introImageAlt: String(pageContent.introImageAlt ?? ''),
    aboutTitle: String(pageContent.aboutTitle ?? 'Chung toi la HTXONLINE'),
    aboutDescription: String(pageContent.aboutDescription ?? 'San nong san so giup hop tac xa ket noi thi truong, minh bach nguon goc va ban hang COD hieu qua.'),
    aboutImageUrl: String(pageContent.aboutImageUrl ?? ''),
    aboutImageAlt: String(pageContent.aboutImageAlt ?? ''),
    contactTitle: String(pageContent.contactTitle ?? 'Hay de HTXONLINE ket noi va dong hanh cung hop tac xa cua ban'),
    contactDescription: String(pageContent.contactDescription ?? 'Tu van tham gia san, QR truy xuat nguon goc, ho tro don hang COD va van hanh so cho HTX.'),
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
