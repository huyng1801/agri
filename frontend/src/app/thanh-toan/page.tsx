import { PublicStaticPage } from '@/components/public-static-page';
import { CheckoutClient } from '@/components/checkout-client';

export default function CheckoutPage() {
  return (
    <PublicStaticPage title="Thanh toán COD" description="MVP hỗ trợ COD — thanh toán khi nhận hàng. HTX sẽ liên hệ xác nhận sau khi đặt đơn.">
      <CheckoutClient />
    </PublicStaticPage>
  );
}
