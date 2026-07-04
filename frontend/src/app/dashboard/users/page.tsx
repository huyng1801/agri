'use client';

import { ResourcePage } from '@/components/resource-page';
import { currentUser } from '@/lib/api';
import { userSchema } from '@/schemas/forms';

export default function UsersPage() {
  const user = typeof window !== 'undefined' ? currentUser() : null;
  const roleOptions = user?.roles.includes('SUPER_ADMIN')
    ? ['SUPER_ADMIN', 'ADMIN_HTX', 'MEMBER_HTX', 'FARMER', 'BUYER']
    : ['MEMBER_HTX', 'FARMER', 'BUYER'];

  return (
    <ResourcePage
      config={{
        title: user?.roles.includes('SUPER_ADMIN') ? 'Người dùng hệ thống' : 'Thành viên HTX',
        endpoint: '/users',
        schema: userSchema,
        primary: 'fullName',
        secondary: ['email', 'phone'],
        createRoles: ['SUPER_ADMIN', 'ADMIN_HTX'],
        fields: [
          { name: 'fullName', label: 'Họ tên' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Mật khẩu', type: 'password' },
          { name: 'phone', label: 'Số điện thoại' },
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'role', label: 'Vai trò', type: 'select', options: roleOptions },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'INACTIVE', 'LOCKED'] }
        ]
      }}
    />
  );
}
