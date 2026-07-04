import { PublicStaticPage } from '@/components/public-static-page';
import { Button, Input, Panel, Textarea } from '@/components/ui';

export default function CheckoutPage() {
  return (
    <PublicStaticPage title="Thanh toán COD" description="MVP hỗ trợ COD — thanh toán khi nhận hàng. HTX sẽ liên hệ xác nhận sau khi đặt đơn.">
      <Panel>
        <form className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">
            <span>Họ tên</span>
            <Input required />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Số điện thoại</span>
            <Input required inputMode="tel" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Email</span>
            <Input type="email" />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Tỉnh/thành</span>
            <Input required />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>Địa chỉ chi tiết</span>
            <Input required />
          </label>
          <label className="space-y-1 text-sm font-semibold sm:col-span-2">
            <span>Ghi chú</span>
            <Textarea />
          </label>
          <div className="rounded-md bg-mint p-3 text-sm font-semibold text-leaf sm:col-span-2">Phương thức thanh toán: COD — Thanh toán khi nhận hàng</div>
          <Button className="sm:w-max" type="button">
            Đặt hàng
          </Button>
        </form>
      </Panel>
    </PublicStaticPage>
  );
}
