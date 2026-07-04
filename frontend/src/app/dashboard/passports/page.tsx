'use client';

import { ResourcePage } from '@/components/resource-page';
import { passportSchema } from '@/schemas/forms';

export default function PassportsPage() {
  return (
    <ResourcePage
      config={{
        title: 'QR Passport',
        endpoint: '/passports',
        schema: passportSchema,
        primary: 'passportCode',
        secondary: ['product', 'viewCount'],
        dateField: 'publishedAt',
        createRoles: ['ADMIN_HTX', 'MEMBER_HTX'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'productId', label: 'ID sản phẩm' },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'PUBLISHED', 'HIDDEN', 'EXPIRED'] },
          { name: 'expiredAt', label: 'Ngày hết hạn', type: 'date' }
        ]
      }}
    />
  );
}
