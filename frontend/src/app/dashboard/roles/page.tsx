'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button, Input, Panel, Textarea } from '@/components/ui';

type Role = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  permissions: string[];
  isSystem: boolean;
};

type PermissionDefinition = {
  key: string;
  group: string;
  label: string;
};

type PermissionPayload = {
  permissions: PermissionDefinition[];
  wildcard: string[];
};

type RoleDraft = {
  name: string;
  description: string;
  permissions: string[];
};

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, RoleDraft>>({});
  const roles = useQuery({ queryKey: ['roles'], queryFn: () => apiFetch<Role[]>('/roles') });
  const catalog = useQuery({ queryKey: ['roles-permissions'], queryFn: () => apiFetch<PermissionPayload>('/roles/permissions') });
  const mutation = useMutation({
    mutationFn: ({ slug, draft }: { slug: string; draft: RoleDraft }) =>
      apiFetch<Role>(`/roles/${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        body: JSON.stringify(draft)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  });

  const roleItems = roles.data?.data ?? [];
  const permissions = catalog.data?.data.permissions ?? [];
  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  useEffect(() => {
    if (!roleItems.length) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const role of roleItems) {
        if (!next[role.slug]) {
          next[role.slug] = {
            name: role.name,
            description: role.description ?? '',
            permissions: expandPermissions(role.permissions, permissions)
          };
        }
      }
      return next;
    });
  }, [roleItems, permissions]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Vai trò & quyền</h1>
          <p className="text-sm text-slate-600">{permissions.length} quyền</p>
        </div>
        <Button variant="ghost" onClick={() => roles.refetch()} aria-label="Tải lại">
          <RefreshCcw size={18} aria-hidden="true" />
        </Button>
      </div>

      {(roles.isError || catalog.isError || mutation.isError) && (
        <Panel className="text-sm font-semibold text-rose-700">{errorMessage(roles.error ?? catalog.error ?? mutation.error)}</Panel>
      )}

      {(roles.isLoading || catalog.isLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-md border border-slate-200 bg-white p-4">
              <div className="h-5 w-1/3 rounded bg-slate-200" />
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="h-20 rounded bg-slate-100" />
                <div className="h-20 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {roleItems.map((role) => {
          const draft = drafts[role.slug];
          if (!draft) return null;
          return (
            <Panel key={role.slug} className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Tên vai trò</span>
                    <Input
                      value={draft.name}
                      onChange={(event) => updateDraft(role.slug, { name: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    <span>Mã vai trò</span>
                    <Input value={role.slug} disabled />
                  </label>
                  <label className="space-y-1 text-sm font-semibold sm:col-span-2">
                    <span>Mô tả</span>
                    <Textarea
                      value={draft.description}
                      onChange={(event) => updateDraft(role.slug, { description: event.target.value })}
                    />
                  </label>
                </div>
                <Button onClick={() => mutation.mutate({ slug: role.slug, draft })} disabled={mutation.isPending}>
                  <Save size={18} aria-hidden="true" />
                  {mutation.isPending ? 'Đang lưu' : 'Lưu'}
                </Button>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {groups.map(([group, items]) => (
                  <section key={group} className="rounded-md border border-slate-200 p-3">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                      <ShieldCheck size={16} aria-hidden="true" />
                      {group}
                    </h2>
                    <div className="mt-3 grid gap-2">
                      {items.map((permission) => (
                        <label key={permission.key} className="flex items-start gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-leaf focus:ring-leaf"
                            checked={draft.permissions.includes(permission.key)}
                            onChange={(event) => togglePermission(role.slug, permission.key, event.target.checked)}
                          />
                          <span>
                            <span className="block font-semibold">{permission.label}</span>
                            <span className="block break-all text-xs text-slate-500">{permission.key}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );

  function updateDraft(slug: string, patch: Partial<RoleDraft>) {
    setDrafts((current) => ({
      ...current,
      [slug]: {
        ...current[slug],
        ...patch
      }
    }));
  }

  function togglePermission(slug: string, permission: string, checked: boolean) {
    setDrafts((current) => {
      const draft = current[slug];
      const permissions = new Set(draft.permissions);
      if (checked) permissions.add(permission);
      else permissions.delete(permission);
      return {
        ...current,
        [slug]: {
          ...draft,
          permissions: Array.from(permissions).sort()
        }
      };
    });
  }
}

function groupPermissions(permissions: PermissionDefinition[]) {
  const groups = new Map<string, PermissionDefinition[]>();
  for (const permission of permissions) {
    const items = groups.get(permission.group) ?? [];
    items.push(permission);
    groups.set(permission.group, items);
  }
  return Array.from(groups.entries());
}

function expandPermissions(granted: string[], catalog: PermissionDefinition[]) {
  if (granted.includes('*')) return catalog.map((permission) => permission.key);
  const expanded = new Set<string>();
  for (const permission of catalog) {
    const [namespace] = permission.key.split('.');
    if (granted.includes(permission.key) || granted.includes(`${namespace}.*`)) {
      expanded.add(permission.key);
    }
  }
  return Array.from(expanded).sort();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
