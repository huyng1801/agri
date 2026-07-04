import { PublicStaticPage } from '@/components/public-static-page';
import { Button, Input, Panel, Textarea } from '@/components/ui';

export default function ContactPage() {
  return (
    <PublicStaticPage title="Liên hệ" description="Gửi thông tin để HTXONLINE tư vấn tham gia sàn hoặc hỗ trợ đơn hàng.">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Panel>
          <form className="grid gap-3">
            <label className="space-y-1 text-sm font-semibold">
              <span>Họ tên</span>
              <Input />
            </label>
            <label className="space-y-1 text-sm font-semibold">
              <span>Số điện thoại</span>
              <Input inputMode="tel" />
            </label>
            <label className="space-y-1 text-sm font-semibold">
              <span>Email</span>
              <Input type="email" />
            </label>
            <label className="space-y-1 text-sm font-semibold">
              <span>Nội dung</span>
              <Textarea />
            </label>
            <Button type="button" className="sm:w-max">Gửi liên hệ</Button>
          </form>
        </Panel>
        <Panel>
          <h2 className="text-lg font-bold">Thông tin nhanh</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>Hotline: 0900 000 000</p>
            <p>Zalo: HTXONLINE</p>
            <p>Email: support@htxonline.vn</p>
            <p>Địa chỉ: Việt Nam</p>
          </div>
        </Panel>
      </div>
    </PublicStaticPage>
  );
}
