import { PublicStaticPage } from '@/components/public-static-page';
import { CheckoutClient } from '@/components/checkout-client';
import { buildPublicMetadata } from '@/lib/page-metadata';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Thanh toán COD',
    description: 'Đặt hàng COD trên HTXONLINE — thanh toán khi nhận hàng, HTX sẽ liên hệ xác nhận.',
    path: '/thanh-toan'
  });
}

export default function CheckoutPage() {
  return (
    <PublicStaticPage title="Thanh toán COD" description="Thanh toán khi nhận hàng — HTX sẽ liên hệ xác nhận sau khi bạn đặt đơn.">
      <CheckoutClient />
    </PublicStaticPage>
  );
}
