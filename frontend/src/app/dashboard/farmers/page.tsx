'use client';

import { ResourcePage } from '@/components/resource-page';
import { userSchema } from '@/schemas/forms';

export default function FarmersPage() {
  return (
    <ResourcePage
      config={{
        title: 'Nông dân',
        endpoint: '/users',
        baseQuery: { role: 'FARMER' },
        schema: userSchema,
        primary: 'fullName',
        secondary: ['email', 'phone'],
        createRoles: ['ADMIN_HTX'],
        fields: [
          { name: 'fullName', label: 'Họ tên' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Mật khẩu', type: 'password' },
          { name: 'phone', label: 'Số điện thoại' },
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'role', label: 'Vai trò', type: 'select', options: ['FARMER'] },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'INACTIVE', 'LOCKED'] }
        ]
      }}
    />
  );
}
