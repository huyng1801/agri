'use client';

import { ResourcePage } from '@/components/resource-page';
import { invoiceSchema } from '@/schemas/forms';

export default function InvoicesPage() {
  return (
    <ResourcePage
      config={{
        title: 'Hóa đơn',
        endpoint: '/invoices',
        schema: invoiceSchema,
        primary: 'invoiceCode',
        secondary: ['cooperativeId', 'currency'],
        amountField: 'amount',
        dateField: 'dueDate',
        createRoles: ['SUPER_ADMIN'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'subscriptionId', label: 'ID gói đã gán' },
          { name: 'amount', label: 'Số tiền', type: 'number' },
          { name: 'currency', label: 'Tiền tệ' },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELLED'] },
          { name: 'dueDate', label: 'Hạn thanh toán', type: 'date' },
          { name: 'paymentMethod', label: 'Phương thức' },
          { name: 'note', label: 'Ghi chú', type: 'textarea' }
        ]
      }}
    />
  );
}
