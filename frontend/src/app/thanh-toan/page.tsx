import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { CheckoutClient } from '@/components/checkout-client';

export const metadata: Metadata = {
  title: 'Thanh toán COD | HTXONLINE',
  description: 'Đặt hàng COD trên HTXONLINE — thanh toán khi nhận hàng, HTX sẽ liên hệ xác nhận.',
  alternates: { canonical: 'https://htxonline.vn/thanh-toan' }
};

export default function CheckoutPage() {
  return (
    <PublicStaticPage title="Thanh toán COD" description="Thanh toán khi nhận hàng — HTX sẽ liên hệ xác nhận sau khi bạn đặt đơn.">
      <CheckoutClient />
    </PublicStaticPage>
  );
}
