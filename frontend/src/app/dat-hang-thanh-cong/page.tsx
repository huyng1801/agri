import { Suspense } from 'react';
import { PublicStaticPage } from '@/components/public-static-page';
import { OrderSuccessClient } from '@/components/order-success-client';

export default function OrderSuccessPage() {
  return (
    <PublicStaticPage title="Đặt hàng thành công" description="HTX hoặc bộ phận vận hành sẽ liên hệ xác nhận đơn hàng.">
      <Suspense fallback={null}>
        <OrderSuccessClient />
      </Suspense>
    </PublicStaticPage>
  );
}
