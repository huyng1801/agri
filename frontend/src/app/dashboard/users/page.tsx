'use client';

import { ResourcePage } from '@/components/resource-page';
import { userSchema } from '@/schemas/forms';

export default function UsersPage() {
  return (
    <ResourcePage
      config={{
        title: 'Thành viên',
        endpoint: '/users',
        schema: userSchema,
        primary: 'fullName',
        secondary: ['email', 'phone'],
        fields: [
          { name: 'fullName', label: 'Họ tên' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'password', label: 'Mật khẩu', type: 'password' },
          { name: 'phone', label: 'Số điện thoại' },
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'role', label: 'Vai trò', type: 'select', options: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER', 'BUYER', 'SUPER_ADMIN'] },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'INACTIVE', 'LOCKED'] }
        ]
      }}
    />
  );
}
