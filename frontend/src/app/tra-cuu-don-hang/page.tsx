import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { OrderLookupClient } from '@/components/order-lookup-client';

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng | HTXONLINE',
  description: 'Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD trên HTXONLINE.',
  alternates: { canonical: 'https://htxonline.vn/tra-cuu-don-hang' }
};

export default function OrderLookupPage() {
  return (
    <PublicStaticPage title="Tra cứu đơn hàng" description="Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD.">
      <OrderLookupClient />
    </PublicStaticPage>
  );
}
