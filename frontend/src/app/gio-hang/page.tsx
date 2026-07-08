import type { Metadata } from 'next';
import { PublicStaticPage } from '@/components/public-static-page';
import { CartClient } from '@/components/cart-client';

export const metadata: Metadata = {
  title: 'Giỏ hàng | HTXONLINE',
  description: 'Xem sản phẩm đã thêm, điều chỉnh số lượng và chuyển sang thanh toán COD.',
  alternates: { canonical: 'https://htxonline.vn/gio-hang' }
};

export default function CartPage() {
  return (
    <PublicStaticPage title="Giỏ hàng" description="Xem sản phẩm đã thêm, điều chỉnh số lượng và chuyển sang thanh toán COD.">
      <CartClient />
    </PublicStaticPage>
  );
}
