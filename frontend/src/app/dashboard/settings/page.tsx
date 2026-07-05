'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Panel, Textarea } from '@/components/ui';
import { apiFetch } from '@/lib/api';

const settingSchema = z.object({
  key: z.string().min(1, 'Key bắt buộc'),
  value: z.string().min(2, 'JSON bắt buộc'),
  description: z.string().optional()
});

type SettingValues = z.infer<typeof settingSchema>;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ['settings'], queryFn: () => apiFetch<Array<Record<string, unknown>>>('/settings') });
  const form = useForm<SettingValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      key: 'public.siteProfile',
      value: '{"appName":"HTXONLINE","hotline":"0900000000","hotlineDisplay":"0900 000 000","supportEmail":"support@htxonline.vn","address":"Viet Nam","zaloUrl":"https://zalo.me","messengerUrl":"","mapEmbedUrl":"","faqs":[{"question":"HTXONLINE ho tro gi cho hop tac xa?","answer":"Quan ly san pham, QR truy xuat va don COD tren cung mot nen tang."}]}',
      description: 'Thong tin public cua sàn, footer, lien he va floating actions'
    }
  });
  const mutation = useMutation({
    mutationFn: (values: SettingValues) =>
      apiFetch('/settings', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          value: JSON.parse(values.value)
        })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] })
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Cài đặt</h1>
      <Panel className="bg-slate-50 shadow-none">
        <h2 className="text-lg font-bold text-ink">Gợi ý cấu hình public.siteProfile</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Khóa này đang điều khiển hotline, Zalo, email, FAQ và floating contact trên htxonline.vn.</p>
      </Panel>
      <Panel>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <label className="space-y-1 text-sm font-semibold">
            <span>Key</span>
            <Input {...form.register('key')} />
            {form.formState.errors.key && <span className="text-rose-600">{form.formState.errors.key.message}</span>}
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Mô tả</span>
            <Input {...form.register('description')} />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>JSON</span>
            <Textarea {...form.register('value')} />
            {form.formState.errors.value && <span className="text-rose-600">{form.formState.errors.value.message}</span>}
          </label>
          {mutation.isError && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700 sm:col-span-2">{(mutation.error as Error).message}</div>}
          <Button className="sm:w-max" disabled={mutation.isPending}>
            <Save size={18} aria-hidden="true" />
            Lưu
          </Button>
        </form>
      </Panel>
      <div className="grid gap-3 md:grid-cols-2">
        {settings.data?.data.map((setting) => (
          <Panel key={String(setting.key)}>
            <h2 className="font-bold">{String(setting.key)}</h2>
            <pre className="mt-2 overflow-auto rounded-md bg-slate-50 p-3 text-xs">{JSON.stringify(setting.value, null, 2)}</pre>
          </Panel>
        ))}
      </div>
    </div>
  );
}
