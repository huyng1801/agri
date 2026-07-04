import { PublicStaticPage } from '@/components/public-static-page';
import { Button, Input, Panel } from '@/components/ui';

export default function OrderLookupPage() {
  return (
    <PublicStaticPage title="Tra cứu đơn hàng" description="Nhập mã đơn hàng và số điện thoại để xem trạng thái đơn COD.">
      <Panel>
        <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-1 text-sm font-semibold">
            <span>Mã đơn hàng</span>
            <Input placeholder="ORD-..." />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Số điện thoại</span>
            <Input inputMode="tel" />
          </label>
          <Button className="self-end" type="button">
            Tra cứu
          </Button>
        </form>
      </Panel>
    </PublicStaticPage>
  );
}
