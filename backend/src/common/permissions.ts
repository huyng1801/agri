export type PermissionDefinition = {
  key: string;
  group: string;
  label: string;
};

export const PERMISSION_CATALOG = [
  { key: 'users.read', group: 'Tài khoản', label: 'Xem tài khoản' },
  { key: 'users.create', group: 'Tài khoản', label: 'Tạo tài khoản' },
  { key: 'users.update', group: 'Tài khoản', label: 'Cập nhật tài khoản' },
  { key: 'users.delete', group: 'Tài khoản', label: 'Khóa tài khoản' },
  { key: 'roles.read', group: 'Vai trò', label: 'Xem vai trò' },
  { key: 'roles.update', group: 'Vai trò', label: 'Cập nhật vai trò' },
  { key: 'permissions.read', group: 'Vai trò', label: 'Xem danh mục quyền' },
  { key: 'cooperatives.read', group: 'HTX', label: 'Xem HTX' },
  { key: 'cooperatives.create', group: 'HTX', label: 'Tạo HTX' },
  { key: 'cooperatives.update', group: 'HTX', label: 'Cập nhật HTX' },
  { key: 'cooperatives.delete', group: 'HTX', label: 'Xóa/ngừng HTX' },
  { key: 'cooperatives.assign_admin', group: 'HTX', label: 'Gán Admin HTX' },
  { key: 'subscription_plans.read', group: 'Gói SaaS', label: 'Xem gói' },
  { key: 'subscription_plans.create', group: 'Gói SaaS', label: 'Tạo gói' },
  { key: 'subscription_plans.update', group: 'Gói SaaS', label: 'Cập nhật gói' },
  { key: 'subscription_plans.delete', group: 'Gói SaaS', label: 'Xóa gói' },
  { key: 'subscriptions.read', group: 'Gói SaaS', label: 'Xem gói HTX' },
  { key: 'subscriptions.assign', group: 'Gói SaaS', label: 'Gán gói HTX' },
  { key: 'subscriptions.update', group: 'Gói SaaS', label: 'Cập nhật gói HTX' },
  { key: 'subscriptions.renew', group: 'Gói SaaS', label: 'Gia hạn gói HTX' },
  { key: 'subscriptions.cancel', group: 'Gói SaaS', label: 'Hủy gói HTX' },
  { key: 'invoices.read', group: 'Hóa đơn', label: 'Xem hóa đơn' },
  { key: 'invoices.create', group: 'Hóa đơn', label: 'Tạo hóa đơn' },
  { key: 'invoices.update', group: 'Hóa đơn', label: 'Cập nhật hóa đơn' },
  { key: 'invoices.mark_paid', group: 'Hóa đơn', label: 'Đánh dấu đã thu' },
  { key: 'invoices.mark_unpaid', group: 'Hóa đơn', label: 'Đánh dấu chưa thu' },
  { key: 'invoices.cancel', group: 'Hóa đơn', label: 'Hủy hóa đơn' },
  { key: 'product_categories.read', group: 'Danh mục sản phẩm', label: 'Xem danh mục' },
  { key: 'product_categories.create', group: 'Danh mục sản phẩm', label: 'Tạo danh mục' },
  { key: 'products.read', group: 'Sản phẩm', label: 'Xem sản phẩm' },
  { key: 'products.create', group: 'Sản phẩm', label: 'Tạo sản phẩm' },
  { key: 'products.update', group: 'Sản phẩm', label: 'Cập nhật sản phẩm' },
  { key: 'products.delete', group: 'Sản phẩm', label: 'Xóa sản phẩm' },
  { key: 'zones.read', group: 'Vùng trồng', label: 'Xem vùng trồng' },
  { key: 'zones.create', group: 'Vùng trồng', label: 'Tạo vùng trồng' },
  { key: 'zones.update', group: 'Vùng trồng', label: 'Cập nhật vùng trồng' },
  { key: 'zones.delete', group: 'Vùng trồng', label: 'Xóa vùng trồng' },
  { key: 'farming_logs.read', group: 'Nhật ký canh tác', label: 'Xem nhật ký' },
  { key: 'farming_logs.create', group: 'Nhật ký canh tác', label: 'Tạo nhật ký' },
  { key: 'farming_logs.update', group: 'Nhật ký canh tác', label: 'Cập nhật nhật ký' },
  { key: 'farming_logs.delete', group: 'Nhật ký canh tác', label: 'Xóa nhật ký' },
  { key: 'passports.read', group: 'QR Passport', label: 'Xem QR Passport' },
  { key: 'passports.create', group: 'QR Passport', label: 'Tạo QR Passport' },
  { key: 'passports.update', group: 'QR Passport', label: 'Cập nhật QR Passport' },
  { key: 'passports.delete', group: 'QR Passport', label: 'Xóa QR Passport' },
  { key: 'files.read', group: 'Tệp', label: 'Xem tệp' },
  { key: 'files.upload', group: 'Tệp', label: 'Upload tệp' },
  { key: 'files.delete', group: 'Tệp', label: 'Xóa tệp' },
  { key: 'orders.read', group: 'Đơn hàng', label: 'Xem đơn hàng' },
  { key: 'orders.create', group: 'Đơn hàng', label: 'Tạo đơn hàng' },
  { key: 'orders.update', group: 'Đơn hàng', label: 'Cập nhật đơn hàng' },
  { key: 'news.read', group: 'Tin tức', label: 'Xem tin tức' },
  { key: 'news.create', group: 'Tin tức', label: 'Tạo tin tức' },
  { key: 'news.update', group: 'Tin tức', label: 'Cập nhật tin tức' },
  { key: 'news.delete', group: 'Tin tức', label: 'Ẩn/xóa tin tức' },
  { key: 'reports.overview', group: 'Báo cáo', label: 'Xem tổng quan' },
  { key: 'reports.revenue', group: 'Báo cáo', label: 'Xem doanh thu' },
  { key: 'reports.snapshots', group: 'Báo cáo', label: 'Tạo snapshot báo cáo' },
  { key: 'settings.read', group: 'Hệ thống', label: 'Xem cài đặt' },
  { key: 'settings.update', group: 'Hệ thống', label: 'Cập nhật cài đặt' },
  { key: 'audit_logs.read', group: 'Hệ thống', label: 'Xem nhật ký hệ thống' },
  { key: 'backups.read', group: 'Sao lưu', label: 'Xem backup' },
  { key: 'backups.create', group: 'Sao lưu', label: 'Tạo backup' },
  { key: 'backups.download', group: 'Sao lưu', label: 'Tải backup' },
  { key: 'backups.restore', group: 'Sao lưu', label: 'Khôi phục backup' },
  { key: 'notifications.read', group: 'Thông báo', label: 'Xem thông báo' },
  { key: 'notifications.create', group: 'Thông báo', label: 'Tạo thông báo' },
  { key: 'notifications.update', group: 'Thông báo', label: 'Cập nhật thông báo' }
] satisfies PermissionDefinition[];

export const PERMISSION_KEYS = PERMISSION_CATALOG.map((item) => item.key);

export function hasPermission(granted: string[], required: string) {
  if (granted.includes('*') || granted.includes(required)) return true;
  const [namespace] = required.split('.');
  return granted.includes(`${namespace}.*`);
}

export function wildcardPermissions() {
  return Array.from(new Set(PERMISSION_KEYS.map((key) => `${key.split('.')[0]}.*`).concat('system.*')));
}
