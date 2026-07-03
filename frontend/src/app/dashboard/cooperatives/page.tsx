'use client';

import { ResourcePage } from '@/components/resource-page';
import { cooperativeSchema } from '@/schemas/forms';

export default function CooperativesPage() {
  return (
    <ResourcePage
      config={{
        title: 'HTX',
        endpoint: '/cooperatives',
        schema: cooperativeSchema,
        primary: 'name',
        secondary: ['phone', 'address'],
        fields: [
          { name: 'name', label: 'Tên HTX' },
          { name: 'code', label: 'Mã HTX' },
          { name: 'taxCode', label: 'Mã số thuế' },
          { name: 'phone', label: 'Số điện thoại' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'address', label: 'Địa chỉ' },
          { name: 'province', label: 'Tỉnh/thành' },
          { name: 'district', label: 'Quận/huyện' },
          { name: 'ward', label: 'Xã/phường' },
          { name: 'representative', label: 'Người đại diện' },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'] }
        ]
      }}
    />
  );
}
