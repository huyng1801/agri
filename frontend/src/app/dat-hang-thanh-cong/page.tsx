import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PublicStaticPage } from '@/components/public-static-page';
import { Button, Panel } from '@/components/ui';

export default function OrderSuccessPage() {
  return (
    <PublicStaticPage title="Đặt hàng thành công" description="HTX hoặc bộ phận vận hành sẽ liên hệ xác nhận đơn hàng.">
      <Panel className="text-center">
        <CheckCircle2 className="mx-auto text-leaf" size={44} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">Cảm ơn bạn đã đặt hàng</h2>
        <p className="mt-2 text-sm text-slate-600">Thông tin đơn hàng sẽ hiển thị tại đây sau khi flow COD được nối backend.</p>
        <Link href="/san-pham" className="mt-4 inline-flex">
          <Button>Tiếp tục mua hàng</Button>
        </Link>
      </Panel>
    </PublicStaticPage>
  );
}
