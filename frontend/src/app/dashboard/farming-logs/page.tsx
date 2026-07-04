'use client';

import { ResourcePage } from '@/components/resource-page';
import { farmingLogSchema } from '@/schemas/forms';

export default function FarmingLogsPage() {
  return (
    <ResourcePage
      config={{
        title: 'Nhật ký',
        endpoint: '/farming-logs',
        schema: farmingLogSchema,
        primary: 'description',
        secondary: ['activityType', 'product'],
        dateField: 'logDate',
        createRoles: ['ADMIN_HTX', 'MEMBER_HTX', 'FARMER'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'productId', label: 'ID sản phẩm' },
          { name: 'zoneId', label: 'ID vùng trồng' },
          { name: 'logDate', label: 'Ngày nhật ký', type: 'date' },
          {
            name: 'activityType',
            label: 'Hoạt động',
            type: 'select',
            options: ['SEEDING', 'WATERING', 'FERTILIZING', 'PEST_CONTROL', 'HARVESTING', 'PACKAGING', 'TRANSPORT', 'OTHER']
          },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
          { name: 'description', label: 'Nội dung', type: 'textarea' }
        ]
      }}
    />
  );
}
