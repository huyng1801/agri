'use client';

import { ResourcePage } from '@/components/resource-page';
import { productSchema } from '@/schemas/forms';

export default function ProductsPage() {
  return (
    <ResourcePage
      config={{
        title: 'Sản phẩm',
        endpoint: '/products',
        schema: productSchema,
        primary: 'name',
        secondary: ['unit', 'zone'],
        amountField: 'price',
        createRoles: ['ADMIN_HTX', 'MEMBER_HTX'],
        fields: [
          { name: 'cooperativeId', label: 'ID HTX' },
          { name: 'categoryId', label: 'ID danh mục' },
          { name: 'code', label: 'Mã sản phẩm' },
          { name: 'name', label: 'Tên sản phẩm' },
          { name: 'slug', label: 'Slug' },
          { name: 'price', label: 'Giá', type: 'number' },
          { name: 'unit', label: 'Đơn vị', type: 'select', options: ['kg', 'g', 'tấn', 'bao', 'thùng', 'hộp', 'chai', 'bó', 'cái'] },
          { name: 'status', label: 'Trạng thái', type: 'select', options: ['DRAFT', 'PUBLISHED', 'HIDDEN', 'ARCHIVED'] },
          { name: 'zoneId', label: 'ID vùng trồng' },
          { name: 'farmerId', label: 'ID nông dân' },
          { name: 'description', label: 'Mô tả', type: 'textarea' },
          { name: 'packagingInfo', label: 'Đóng gói', type: 'textarea' },
          { name: 'specification', label: 'Quy cách', type: 'textarea' }
        ]
      }}
    />
  );
}
