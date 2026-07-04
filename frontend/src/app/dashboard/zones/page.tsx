'use client';

import { ResourcePage } from '@/components/resource-page';
import { zoneSchema } from '@/schemas/forms';

export default function ZonesPage() {
  return (
    <ResourcePage
      config={{
        title: 'Vùng trồng',
        endpoint: '/zones',
        schema: zoneSchema,
        primary: 'name',
        secondary: ['code', 'areaM2'],
        createRoles: ['ADMIN_HTX', 'MEMBER_HTX'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'name', label: 'Tên vùng' },
          { name: 'code', label: 'Mã vùng' },
          { name: 'address', label: 'Địa chỉ' },
          { name: 'areaM2', label: 'Diện tích m2', type: 'number' },
          { name: 'latitude', label: 'Vĩ độ', type: 'number' },
          { name: 'longitude', label: 'Kinh độ', type: 'number' },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] }
        ]
      }}
    />
  );
}
