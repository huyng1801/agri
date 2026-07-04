import { PublicStaticPage } from '@/components/public-static-page';
import { OrderLookupClient } from '@/components/order-lookup-client';

export default function OrderLookupPage() {
  return (
    <PublicStaticPage title="Tra cứu đơn hàng" description="Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD.">
      <OrderLookupClient />
    </PublicStaticPage>
  );
}
