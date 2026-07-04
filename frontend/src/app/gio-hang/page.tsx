import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Button, Panel } from '@/components/ui';

export default function CartPage() {
  return (
    <PublicStaticPage title="Giỏ hàng" description="Xem sản phẩm đã thêm, điều chỉnh số lượng và chuyển sang thanh toán COD.">
      <Panel className="text-center">
        <ShoppingCart className="mx-auto text-leaf" size={40} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">Giỏ hàng đang trống</h2>
        <p className="mt-2 text-sm text-slate-600">Chọn sản phẩm public từ HTX để bắt đầu đặt hàng.</p>
        <Link href="/san-pham" className="mt-4 inline-flex">
          <Button>Xem sản phẩm</Button>
        </Link>
      </Panel>
    </PublicStaticPage>
  );
}
