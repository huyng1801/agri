'use client';

import { ResourcePage } from '@/components/resource-page';
import { planSchema } from '@/schemas/forms';

export default function SubscriptionPlansPage() {
  return (
    <ResourcePage
      config={{
        title: 'Gói dịch vụ',
        endpoint: '/subscription-plans',
        schema: planSchema,
        primary: 'name',
        secondary: ['maxProducts', 'maxMembers'],
        amountField: 'priceMonthly',
        statusField: 'isActive',
        fields: [
          { name: 'name', label: 'Tên gói' },
          { name: 'slug', label: 'Slug' },
          { name: 'priceMonthly', label: 'Giá tháng', type: 'number' },
          { name: 'priceYearly', label: 'Giá năm', type: 'number' },
          { name: 'maxCooperatives', label: 'Số HTX tối đa', type: 'number' },
          { name: 'maxProducts', label: 'Số sản phẩm tối đa', type: 'number' },
          { name: 'maxMembers', label: 'Số thành viên tối đa', type: 'number' },
          { name: 'maxZones', label: 'Số vùng tối đa', type: 'number' },
          { name: 'isActive', label: 'Đang bật', type: 'select', options: ['true', 'false'] }
        ]
      }}
    />
  );
}
