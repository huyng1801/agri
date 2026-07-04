'use client';

import { ResourcePage } from '@/components/resource-page';
import { orderSchema } from '@/schemas/forms';

export default function OrdersPage() {
  return (
    <ResourcePage
      config={{
        title: 'Đơn hàng COD',
        endpoint: '/orders',
        schema: orderSchema,
        primary: 'orderCode',
        secondary: ['cooperativeId', 'status'],
        amountField: 'totalAmount',
        createRoles: ['ADMIN_HTX'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'buyerId', label: 'ID người mua' },
          { name: 'orderCode', label: 'Mã đơn' },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'] },
          { name: 'totalAmount', label: 'Tổng tiền', type: 'number' },
          { name: 'note', label: 'Ghi chú', type: 'textarea' }
        ]
      }}
    />
  );
}
