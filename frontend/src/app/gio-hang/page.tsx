import { PublicStaticPage } from '@/components/public-static-page';
import { CartClient } from '@/components/cart-client';
import { buildPublicMetadata } from '@/lib/page-metadata';

export async function generateMetadata() {
  return buildPublicMetadata({
    title: 'Giỏ hàng',
    description: 'Xem sản phẩm đã thêm, điều chỉnh số lượng và chuyển sang thanh toán COD.',
    path: '/gio-hang'
  });
}

export default function CartPage() {
  return (
    <PublicStaticPage title="Giỏ hàng" description="Xem sản phẩm đã thêm, điều chỉnh số lượng và chuyển sang thanh toán COD.">
      <CartClient />
    </PublicStaticPage>
  );
}
