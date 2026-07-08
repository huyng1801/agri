import {
  FarmingActivityType,
  FileVisibility,
  NewsStatus,
  PassportStatus,
  PrismaClient,
  ProductStatus,
  RoleSlug
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const passportCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);
const DEMO_ADMIN_PASSWORD = process.env.SEED_DEMO_ADMIN_PASSWORD || 'Demo@2026';

function demoPhoto(seed: string, width = 900, height = 600) {
  return `https://picsum.photos/seed/htxonline-${seed}/${width}/${height}`;
}

function img(photoId: string, width = 900) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

async function assertImageUrls(urls: string[]) {
  const unique = [...new Set(urls)];
  const failures: string[] = [];
  for (const url of unique) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (!response.ok) failures.push(`${url} -> HTTP ${response.status}`);
    } catch (error) {
      failures.push(`${url} -> ${error instanceof Error ? error.message : 'fetch failed'}`);
    }
  }
  if (failures.length) {
    throw new Error(`Seed demo image URLs failed validation:\n${failures.join('\n')}`);
  }
}

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const GLOBAL_CATEGORIES = [
  ['Lúa gạo', 'lua-gao'],
  ['Rau củ quả', 'rau-cu'],
  ['Trái cây', 'trai-cay'],
  ['Cà phê', 'ca-phe'],
  ['Mật ong', 'mat-ong'],
  ['Thủy sản', 'thuy-san'],
  ['Gia cầm', 'gia-cam'],
  ['Trà & dược liệu', 'tra-duoc-lieu'],
  ['Nấm sạch', 'nam-sach']
] as const;

const PHOTOS = {
  farm: img('1464226184884-fa280b87c399', 1200),
  rice: demoPhoto('rice', 900, 600),
  riceField: demoPhoto('rice-field', 1200, 700),
  veg: demoPhoto('vegetables', 900, 600),
  vegBasket: demoPhoto('veg-basket', 900, 600),
  fruit: demoPhoto('fruit', 900, 600),
  mango: demoPhoto('mango', 900, 600),
  coffee: demoPhoto('coffee', 1200, 700),
  honey: demoPhoto('honey', 900, 600),
  fish: demoPhoto('fish', 900, 600),
  chicken: demoPhoto('chicken', 900, 600),
  tea: demoPhoto('tea', 900, 600),
  mushroom: demoPhoto('mushroom', 900, 600),
  orchard: demoPhoto('orchard', 1200, 700),
  market: img('1542838132-92c53300491e', 1200),
  harvest: img('1500937386664-56d1dfef3854', 1200),
  coopTeam: demoPhoto('coop-team', 900, 600),
  dragonfruit: demoPhoto('dragonfruit', 900, 600),
  pepper: img('1596040033229-a9821ebd058d'),
  shrimp: img('1559339352-11d035aa65de'),
  durian: demoPhoto('durian', 900, 600)
};

type DemoProduct = {
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  description: string;
};

type DemoCoop = {
  code: string;
  name: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  phone: string;
  email: string;
  representative: string;
  taxCode: string;
  avatarUrl: string;
  planSlug: 'basic' | 'pro';
  zones: Array<{ name: string; code: string; address: string; areaM2: number }>;
  products: DemoProduct[];
};

const DEMO_COOPERATIVES: DemoCoop[] = [
  {
    code: 'htx-lua-dong-thap',
    name: 'HTX Nông nghiệp hữu cơ Đồng Tháp',
    province: 'Đồng Tháp',
    district: 'Huyện Tháp Mười',
    ward: 'Xã Tân Thuận',
    address: 'Ấp 3, xã Tân Thuận, huyện Tháp Mười',
    phone: '02773841234',
    email: 'lienhe@htxlua-dongthap.vn',
    representative: 'Nguyễn Văn Minh',
    taxCode: '1400123456',
    avatarUrl: PHOTOS.riceField,
    planSlug: 'pro',
    zones: [
      { name: 'Vùng lúa ST25 Tháp Mười', code: 'VLM-01', address: 'Ruộng lúa ST25 ven kênh Xáng Xà No', areaM2: 125000 },
      { name: 'Vùng lúa Jasmine', code: 'VLM-02', address: 'Ruộng lúa Jasmine huyện Tháp Mười', areaM2: 86000 }
    ],
    products: [
      { name: 'Gạo ST25 hữu cơ', category: 'lua-gao', price: 28000, unit: 'kg', image: PHOTOS.rice, description: 'Gạo ST25 thơm dẻo, canh tác hữu cơ, có nhật ký canh tác và QR truy xuất.' },
      { name: 'Gạo Jasmine đặc sản', category: 'lua-gao', price: 22000, unit: 'kg', image: PHOTOS.riceField, description: 'Gạo Jasmine thơm nhẹ, phù hợp gia đình và nhà hàng.' },
      { name: 'Gạo lứt đỏ Đồng Tháp', category: 'lua-gao', price: 35000, unit: 'kg', image: PHOTOS.harvest, description: 'Gạo lứt đỏ giàu chất xơ, mài một lần giữ dinh dưỡng.' },
      { name: 'Cám gạo hữu cơ', category: 'lua-gao', price: 12000, unit: 'kg', image: PHOTOS.farm, description: 'Cám gạo tươi, dùng làm thức ăn gia súc hoặc phân bón vi sinh.' },
      { name: 'Bột gạo nguyên cám', category: 'lua-gao', price: 18000, unit: 'kg', image: PHOTOS.market, description: 'Bột gạo xay mịn từ lúa ST25, không pha tạp chất.' },
      { name: 'Rơm lúa ủ phân', category: 'lua-gao', price: 8000, unit: 'bó', image: PHOTOS.coopTeam, description: 'Rơm lúa sạch phục vụ ủ phân compost tại vườn.' }
    ]
  },
  {
    code: 'htx-rau-sach-cu-chi',
    name: 'HTX Rau sạch Củ Chi',
    province: 'TP. Hồ Chí Minh',
    district: 'Huyện Củ Chi',
    ward: 'Xã Tân Thạnh Tây',
    address: 'Khu nông nghiệp công nghệ cao Củ Chi, xã Tân Thạnh Tây',
    phone: '02837941234',
    email: 'contact@htxrausachcuchi.vn',
    representative: 'Trần Thị Hoa',
    taxCode: '0312345678',
    avatarUrl: PHOTOS.vegBasket,
    planSlug: 'pro',
    zones: [
      { name: 'Nhà màng rau ăn lá', code: 'NM-01', address: 'Nhà màng công nghệ cao khu A', areaM2: 22000 },
      { name: 'Vườn rau hữu cơ', code: 'VR-01', address: 'Vườn rau mở tự nhiên khu B', areaM2: 15000 }
    ],
    products: [
      { name: 'Rau muống sạch', category: 'rau-cu', price: 15000, unit: 'bó', image: PHOTOS.veg, description: 'Rau muống thu hoạch sáng, giao trong ngày nội thành.' },
      { name: 'Cải ngọt hữu cơ', category: 'rau-cu', price: 22000, unit: 'kg', image: PHOTOS.vegBasket, description: 'Cải ngọt canh tác VietGAP, không thuốc BVTV cấm.' },
      { name: 'Xà lách lô lô', category: 'rau-cu', price: 28000, unit: 'kg', image: PHOTOS.market, description: 'Xà lách giòn, đóng túi hút chân không.' },
      { name: 'Cà chua bi', category: 'rau-cu', price: 35000, unit: 'kg', image: PHOTOS.fruit, description: 'Cà chua bi ngọt, trồng nhà màng.' },
      { name: 'Ớt chuông 3 màu', category: 'rau-cu', price: 45000, unit: 'kg', image: PHOTOS.harvest, description: 'Ớt chuông tươi, dùng salad hoặc nấu ăn.' },
      { name: 'Combo rau tuần 5kg', category: 'rau-cu', price: 149000, unit: 'combo', image: PHOTOS.coopTeam, description: 'Combo rau theo mùa, giao tận nhà TP.HCM.' }
    ]
  },
  {
    code: 'htx-xoai-cat-hoa-loc',
    name: 'HTX Xoài Cát Hòa Lộc Tiền Giang',
    province: 'Tiền Giang',
    district: 'Huyện Cái Bè',
    ward: 'Xã Hòa Khánh',
    address: 'Vườn xoài Hòa Lộc, xã Hòa Khánh, huyện Cái Bè',
    phone: '02733851234',
    email: 'banhang@htxxoaicat.vn',
    representative: 'Lê Hoàng Nam',
    taxCode: '1200987654',
    avatarUrl: PHOTOS.mango,
    planSlug: 'basic',
    zones: [
      { name: 'Vườn xoài Hòa Lộc A', code: 'VX-01', address: 'Vườn xoài chính Hòa Khánh', areaM2: 98000 },
      { name: 'Vườn xoài xuất khẩu', code: 'VX-02', address: 'Vườn đạt GlobalGAP khu B', areaM2: 65000 }
    ],
    products: [
      { name: 'Xoài Cát Hòa Lộc loại 1', category: 'trai-cay', price: 55000, unit: 'kg', image: PHOTOS.mango, description: 'Xoài chín cây, vỏ vàng, cơm dày, thơm đặc trưng.' },
      { name: 'Xoài sấy dẻo', category: 'trai-cay', price: 120000, unit: 'hộp 500g', image: PHOTOS.fruit, description: 'Xoài sấy lạnh giữ hương vị tự nhiên.' },
      { name: 'Mật xoài chua ngọt', category: 'trai-cay', price: 45000, unit: 'chai', image: PHOTOS.market, description: 'Mật xoài làm thủ công từ xoài chín.' },
      { name: 'Xoài xanh om', category: 'trai-cay', price: 25000, unit: 'kg', image: PHOTOS.orchard, description: 'Xoài xanh giòn, phù hợp nấu canh chua.' },
      { name: 'Combo quà Tết xoài', category: 'trai-cay', price: 399000, unit: 'thùng', image: PHOTOS.coopTeam, description: 'Thùng quà 5kg xoài Cát Hòa Lộc đóng gói sang trọng.' }
    ]
  },
  {
    code: 'htx-ca-phe-buon-ma-thuot',
    name: 'HTX Cà phê Buôn Ma Thuột',
    province: 'Đắk Lắk',
    district: 'TP. Buôn Ma Thuột',
    ward: 'Phường Tân Lợi',
    address: 'Khu chế biến cà phê Tân Lợi, Buôn Ma Thuột',
    phone: '02623851234',
    email: 'sales@htxcaphebmt.vn',
    representative: 'Y Wăn Bya',
    taxCode: '6001234567',
    avatarUrl: PHOTOS.coffee,
    planSlug: 'pro',
    zones: [
      { name: 'Vườn cà phê Arabica', code: 'CP-01', address: 'Vườn Arabica cao nguyên M\'Drắk', areaM2: 180000 },
      { name: 'Vườn cà phê Robusta', code: 'CP-02', address: 'Vườn Robusta Buôn Hồ', areaM2: 220000 }
    ],
    products: [
      { name: 'Cà phê rang xay Arabica', category: 'ca-phe', price: 185000, unit: 'kg', image: PHOTOS.coffee, description: 'Hạt Arabica rang medium, hương hoa quả nhẹ.' },
      { name: 'Cà phê Robusta đặc sản', category: 'ca-phe', price: 145000, unit: 'kg', image: PHOTOS.harvest, description: 'Robusta Buôn Ma Thuột đậm vị, crema đẹp.' },
      { name: 'Cà phê hòa tan 3in1', category: 'ca-phe', price: 85000, unit: 'hộp 20 gói', image: PHOTOS.market, description: 'Cà phê 3in1 tiện lợi, hương vị đậm đà.' },
      { name: 'Bột cà phê nguyên chất', category: 'ca-phe', price: 165000, unit: 'kg', image: PHOTOS.farm, description: 'Bột cà phê xay mịn pha phin truyền thống.' },
      { name: 'Hạt cà phê xanh', category: 'ca-phe', price: 95000, unit: 'kg', image: PHOTOS.coopTeam, description: 'Hạt xanh sơ chế ướt, bán cho xưởng rang.' },
      { name: 'Cà phê chồn', category: 'ca-phe', price: 2500000, unit: 'kg', image: PHOTOS.coffee, description: 'Cà phê chồn chọn lọc, rang thủ công.' }
    ]
  },
  {
    code: 'htx-mat-ong-tay-nguyen',
    name: 'HTX Mật ong rừng Tây Nguyên',
    province: 'Gia Lai',
    district: 'Huyện Kbang',
    ward: 'Xã Kon Pne',
    address: 'Bản Kon Pne, huyện Kbang, tỉnh Gia Lai',
    phone: '02693861234',
    email: 'matong@htxtaynguyen.vn',
    representative: 'Rơ Mah H\'Lơn',
    taxCode: '5900876543',
    avatarUrl: PHOTOS.honey,
    planSlug: 'basic',
    zones: [
      { name: 'Khu nuôi ong rừng', code: 'ON-01', address: 'Rừng cây bạch đàn Kon Pne', areaM2: 450000 },
      { name: 'Trạm thu hoạch mật', code: 'TH-01', address: 'Trạm thu hoạch xã Kon Pne', areaM2: 1200 }
    ],
    products: [
      { name: 'Mật ong hoa cà phê', category: 'mat-ong', price: 320000, unit: 'chai 500ml', image: PHOTOS.honey, description: 'Mật ong thu từ hoa cà phê, vàng nhạt, thơm dịu.' },
      { name: 'Mật ong rừng nguyên chất', category: 'mat-ong', price: 380000, unit: 'chai 500ml', image: PHOTOS.orchard, description: 'Mật ong rừng Tây Nguyên, không pha đường.' },
      { name: 'Sáp ong thiên nhiên', category: 'mat-ong', price: 150000, unit: 'kg', image: PHOTOS.farm, description: 'Sáp ong nguyên tấm, dùng làm nến hoặc mỹ phẩm.' },
      { name: 'Phấn hoa ong', category: 'mat-ong', price: 220000, unit: 'hộp 200g', image: PHOTOS.market, description: 'Phấn hoa sấy lạnh, bổ sung dinh dưỡng.' },
      { name: 'Combo quà mật ong', category: 'mat-ong', price: 599000, unit: 'set', image: PHOTOS.coopTeam, description: 'Set 3 chai mật ong các loại hoa khác nhau.' }
    ]
  },
  {
    code: 'htx-thuy-san-ca-mau',
    name: 'HTX Thủy sản Cà Mau',
    province: 'Cà Mau',
    district: 'Huyện Đầm Dơi',
    ward: 'Xã Tân Thuận',
    address: 'Ao nuôi tôm Cà Mau, xã Tân Thuận, huyện Đầm Dơi',
    phone: '02903871234',
    email: 'thuysan@htxthuysancamau.vn',
    representative: 'Phạm Văn Tài',
    taxCode: '2000456789',
    avatarUrl: PHOTOS.shrimp,
    planSlug: 'pro',
    zones: [
      { name: 'Ao nuôi tôm càng xanh', code: 'TS-01', address: 'Ao nuôi tôm càng xanh Đầm Dơi', areaM2: 85000 },
      { name: 'Ao nuôi cá tra', code: 'TS-02', address: 'Ao cá tra liên kết xã Tân Thuận', areaM2: 120000 }
    ],
    products: [
      { name: 'Tôm càng xanh tươi', category: 'thuy-san', price: 320000, unit: 'kg', image: PHOTOS.shrimp, description: 'Tôm càng xanh size 20-25 con/kg, hấp hoặc nướng.' },
      { name: 'Cá tra fillet', category: 'thuy-san', price: 85000, unit: 'kg', image: PHOTOS.fish, description: 'Phi lê cá tra sạch, đóng gói hút chân không.' },
      { name: 'Mực một nắng', category: 'thuy-san', price: 280000, unit: 'kg', image: PHOTOS.market, description: 'Mực một nắng Cà Mau, rim me hoặc nướng.' },
      { name: 'Ba khía muối', category: 'thuy-san', price: 120000, unit: 'kg', image: PHOTOS.harvest, description: 'Ba khía muối đặc sản U Minh.' },
      { name: 'Cua biển Cà Mau', category: 'thuy-san', price: 450000, unit: 'kg', image: PHOTOS.fish, description: 'Cua gạch tươi sống, giao nội tỉnh.' },
      { name: 'Combo lẩu thủy sản', category: 'thuy-san', price: 499000, unit: 'set', image: PHOTOS.coopTeam, description: 'Set lẩu tôm, mực, cá cho 4-6 người.' }
    ]
  },
  {
    code: 'htx-ga-tha-vuon-bac-ninh',
    name: 'HTX Gà thả vườn Bắc Ninh',
    province: 'Bắc Ninh',
    district: 'Huyện Tiên Du',
    ward: 'Xã Việt Yên',
    address: 'Trang trại gà thả vườn Việt Yên, huyện Tiên Du',
    phone: '02223881234',
    email: 'ga@htxgathavuan.vn',
    representative: 'Hoàng Thị Lan',
    taxCode: '2700567890',
    avatarUrl: PHOTOS.chicken,
    planSlug: 'basic',
    zones: [
      { name: 'Chuồng gà thả vườn', code: 'GA-01', address: 'Khu chuồng gà mở Việt Yên', areaM2: 35000 },
      { name: 'Vườn cây ăn quả kết hợp', code: 'VQ-01', address: 'Vườn bưởi – gà thả tự do', areaM2: 28000 }
    ],
    products: [
      { name: 'Gà thả vườn nguyên con', category: 'gia-cam', price: 165000, unit: 'kg', image: PHOTOS.chicken, description: 'Gà thả vườn 1.2-1.5kg, thịt chắc, da giòn.' },
      { name: 'Trứng gà ta', category: 'gia-cam', price: 45000, unit: 'chục', image: PHOTOS.farm, description: 'Trứng gà ta tươi, vỏ hồng, lòng đỏ đậm.' },
      { name: 'Thịt gà fillet', category: 'gia-cam', price: 195000, unit: 'kg', image: PHOTOS.market, description: 'Phi lê ức gà sạch, đóng khay 500g.' },
      { name: 'Xúc xích gà thủ công', category: 'gia-cam', price: 85000, unit: 'kg', image: PHOTOS.harvest, description: 'Xúc xích gà không nitrit, hút chân không.' },
      { name: 'Combo gà luộc sẵn', category: 'gia-cam', price: 299000, unit: 'con', image: PHOTOS.coopTeam, description: 'Gà luộc sẵn kèm rau thơm, giao nóng.' }
    ]
  },
  {
    code: 'htx-lua-st25-soc-trang',
    name: 'HTX Lúa ST25 Sóc Trăng',
    province: 'Sóc Trăng',
    district: 'Huyện Mỹ Xuyên',
    ward: 'Xã Hòa Tú',
    address: 'Khu liên kết sản xuất ST25, xã Hòa Tú, Mỹ Xuyên',
    phone: '02993891234',
    email: 'st25@htxlua-st25.vn',
    representative: 'Võ Thanh Bình',
    taxCode: '2200678901',
    avatarUrl: PHOTOS.harvest,
    planSlug: 'pro',
    zones: [
      { name: 'Đồng lúa ST25 Hòa Tú', code: 'ST-01', address: 'Ruộng ST25 liên kết 120 hộ', areaM2: 210000 },
      { name: 'Kho lúa liên kết', code: 'KL-01', address: 'Kho trữ lúa tươi xã Hòa Tú', areaM2: 5000 }
    ],
    products: [
      { name: 'Gạo ST25 nguyên cơ', category: 'lua-gao', price: 30000, unit: 'kg', image: PHOTOS.rice, description: 'ST25 chính gốc Sóc Trăng, thơm dẻo đặc trưng.' },
      { name: 'Gạo ST25 túi 5kg', category: 'lua-gao', price: 145000, unit: 'túi', image: PHOTOS.riceField, description: 'Túi 5kg tiện dùng gia đình.' },
      { name: 'Gạo ST25 túi 25kg', category: 'lua-gao', price: 680000, unit: 'bao', image: PHOTOS.market, description: 'Bao 25kg giá sỉ cho đại lý.' },
      { name: 'Lúa tươi ST25', category: 'lua-gao', price: 8500, unit: 'kg', image: PHOTOS.farm, description: 'Lúa tươi bán cho nhà máy xay.' },
      { name: 'Cám gạo ST25', category: 'lua-gao', price: 10000, unit: 'kg', image: PHOTOS.coopTeam, description: 'Cám gạo phụ phẩm xay lúa ST25.' },
      { name: 'Gạo ST25 hữu cơ chứng nhận', category: 'lua-gao', price: 42000, unit: 'kg', image: PHOTOS.harvest, description: 'ST25 canh tác hữu cơ, có chứng nhận và QR.' }
    ]
  },
  {
    code: 'htx-nam-sach-da-lat',
    name: 'HTX Nấm sạch Đà Lạt',
    province: 'Lâm Đồng',
    district: 'TP. Đà Lạt',
    ward: 'Phường 8',
    address: 'Nhà màng nấm phường 8, TP. Đà Lạt',
    phone: '02633801234',
    email: 'nam@htxnamsachdalat.vn',
    representative: 'Đặng Minh Tuấn',
    taxCode: '5800789012',
    avatarUrl: PHOTOS.mushroom,
    planSlug: 'basic',
    zones: [
      { name: 'Nhà màng nấm hương', code: 'NM-01', address: 'Nhà màng nấm hương phường 8', areaM2: 8000 },
      { name: 'Phòng ươm giống', code: 'UG-01', address: 'Phòng ươm meo giống nấm', areaM2: 1200 }
    ],
    products: [
      { name: 'Nấm hương tươi', category: 'nam-sach', price: 95000, unit: 'kg', image: PHOTOS.mushroom, description: 'Nấm hương tươi thu hoạch hàng ngày.' },
      { name: 'Nấm rơm sạch', category: 'nam-sach', price: 45000, unit: 'kg', image: PHOTOS.veg, description: 'Nấm rơm trắng, giòn, đóng khay 500g.' },
      { name: 'Nấm kim châm', category: 'nam-sach', price: 38000, unit: 'kg', image: PHOTOS.market, description: 'Nấm kim châm vàng, phù hợp lẩu và salad.' },
      { name: 'Nấm sấy khô', category: 'nam-sach', price: 320000, unit: 'kg', image: PHOTOS.harvest, description: 'Nấm hương sấy khô, nấu canh hoặc xào.' },
      { name: 'Mycelium giống nấm', category: 'nam-sach', price: 85000, unit: 'túi', image: PHOTOS.coopTeam, description: 'Meo giống nấm hương cho hộ nuôi.' }
    ]
  },
  {
    code: 'htx-trai-cay-mien-tay',
    name: 'HTX Trái cây Miền Tây Vĩnh Long',
    province: 'Vĩnh Long',
    district: 'Huyện Long Hồ',
    ward: 'Xã Phú Hựu',
    address: 'Chợ nông sản Phú Hựu, huyện Long Hồ',
    phone: '02703811234',
    email: 'traicay@htxmiendong.vn',
    representative: 'Nguyễn Thị Mai',
    taxCode: '1500890123',
    avatarUrl: PHOTOS.fruit,
    planSlug: 'pro',
    zones: [
      { name: 'Vườn chôm chôm', code: 'CC-01', address: 'Vườn chôm chôm Phú Hựu', areaM2: 72000 },
      { name: 'Vườn nhãn Long Hồ', code: 'NH-01', address: 'Vườn nhãn xuồng Long Hồ', areaM2: 54000 }
    ],
    products: [
      { name: 'Chôm chôm Java', category: 'trai-cay', price: 35000, unit: 'kg', image: PHOTOS.fruit, description: 'Chôm chôm Java ngọt, múi dày, ít hạt.' },
      { name: 'Nhãn xuồng Long Hồ', category: 'trai-cay', price: 42000, unit: 'kg', image: PHOTOS.orchard, description: 'Nhãn xuồng cơm dày, vỏ nâu đẹp.' },
      { name: 'Bưởi da xanh', category: 'trai-cay', price: 28000, unit: 'kg', image: PHOTOS.mango, description: 'Bưởi da xanh múi mọng nước, ít hạt.' },
      { name: 'Thanh long ruột đỏ', category: 'trai-cay', price: 25000, unit: 'kg', image: PHOTOS.dragonfruit, description: 'Thanh long ruột đỏ ngọt, xuất khẩu và nội địa.' },
      { name: 'Sầu riêng Ri6', category: 'trai-cay', price: 95000, unit: 'kg', image: PHOTOS.durian, description: 'Sầu riêng Ri6 cơm vàng, béo ngậy.' },
      { name: 'Combo trái cây 5kg', category: 'trai-cay', price: 199000, unit: 'thùng', image: PHOTOS.coopTeam, description: 'Thùng trái cây theo mùa giao tận nhà.' }
    ]
  },
  {
    code: 'htx-hong-treo-gio-son-la',
    name: 'HTX Hồng treo gió Sơn La',
    province: 'Sơn La',
    district: 'Huyện Mộc Châu',
    ward: 'Xã Đông Sang',
    address: 'Vườn hồng Mộc Châu, xã Đông Sang',
    phone: '02123821234',
    email: 'hong@htxhongsonla.vn',
    representative: 'Bùi Văn Đức',
    taxCode: '4200901234',
    avatarUrl: PHOTOS.orchard,
    planSlug: 'basic',
    zones: [
      { name: 'Vườn hồng Đông Sang', code: 'HO-01', address: 'Vườn hồng treo gió Mộc Châu', areaM2: 48000 },
      { name: 'Nhà sấy hồng', code: 'SH-01', address: 'Nhà sấy hồng liên kết', areaM2: 2000 }
    ],
    products: [
      { name: 'Hồng treo gió Mộc Châu', category: 'trai-cay', price: 180000, unit: 'kg', image: PHOTOS.orchard, description: 'Hồng treo gió ngọt tự nhiên, không đường hóa học.' },
      { name: 'Hồng khô sấy lạnh', category: 'trai-cay', price: 220000, unit: 'kg', image: PHOTOS.fruit, description: 'Hồng sấy lạnh giữ màu và vitamin.' },
      { name: 'Mật hồng', category: 'trai-cay', price: 85000, unit: 'chai', image: PHOTOS.honey, description: 'Mật hồng nguyên chất từ hồng chín.' },
      { name: 'Hồng tươi giỏ quà', category: 'trai-cay', price: 299000, unit: 'giỏ', image: PHOTOS.coopTeam, description: 'Giỏ hồng tươi 3kg đóng quà.' }
    ]
  },
  {
    code: 'htx-tra-shan-tuyet-ha-giang',
    name: 'HTX Trà Shan Tuyết Hà Giang',
    province: 'Hà Giang',
    district: 'Huyện Vị Xuyên',
    ward: 'Xã Thượng Sơn',
    address: 'Đồi chè Shan Tuyết Thượng Sơn, Vị Xuyên',
    phone: '02193831234',
    email: 'tra@htxtrashantuyet.vn',
    representative: 'Lý Văn Phúc',
    taxCode: '0801012345',
    avatarUrl: PHOTOS.tea,
    planSlug: 'pro',
    zones: [
      { name: 'Đồi chè cổ thụ', code: 'CH-01', address: 'Đồi chè Shan Tuyết 800m', areaM2: 156000 },
      { name: 'Nhà máy sơ chế', code: 'SC-01', address: 'Nhà sơ chế chè Thượng Sơn', areaM2: 3500 }
    ],
    products: [
      { name: 'Trà Shan Tuyết thượng hạng', category: 'tra-duoc-lieu', price: 450000, unit: 'kg', image: PHOTOS.tea, description: 'Chè Shan Tuyết búp tuyết, hái thủ công đồi cao.' },
      { name: 'Trà Shan Tuyết túi 100g', category: 'tra-duoc-lieu', price: 95000, unit: 'túi', image: PHOTOS.harvest, description: 'Túi 100g tiện pha, hộp quà tặng.' },
      { name: 'Trà hoa vàng', category: 'tra-duoc-lieu', price: 320000, unit: 'kg', image: PHOTOS.orchard, description: 'Trà hoa vàng quý hiếm, vị ngọt hậu.' },
      { name: 'Trà atiso đỏ', category: 'tra-duoc-lieu', price: 180000, unit: 'kg', image: PHOTOS.market, description: 'Trà atiso đỏ Lâm Đồng phối hợp Shan Tuyết.' },
      { name: 'Combo trà quà tặng', category: 'tra-duoc-lieu', price: 599000, unit: 'hộp', image: PHOTOS.coopTeam, description: 'Hộp quà 4 loại trà đặc sản Tây Bắc.' },
      { name: 'Trà xanh Shan', category: 'tra-duoc-lieu', price: 280000, unit: 'kg', image: PHOTOS.tea, description: 'Trà xanh Shan sấy khô, vị thanh mát.' }
    ]
  }
];

const NEWS_ARTICLES = [
  {
    title: 'ST25 – niềm tự hào gạo Việt trên bàn ăn quốc tế',
    category: 'tin-thi-truong',
    cover: PHOTOS.rice,
    excerpt: 'Gạo ST25 không chỉ ngon mà còn gắn với hành trình truy xuất nguồn gốc minh bạch của nông dân Đồng bằng sông Cửu Long.'
  },
  {
    title: 'HTXONLINE giúp hợp tác xã bán hàng COD không cần website riêng',
    category: 'chuyen-doi-so',
    cover: PHOTOS.coopTeam,
    excerpt: 'Nền tảng HTXONLINE kết nối sản phẩm nông nghiệp địa phương với người tiêu dùng qua QR Passport và đơn hàng COD.'
  },
  {
    title: '5 bước truy xuất nguồn gốc rau củ an toàn cho gia đình',
    category: 'truy-xuat-nguon-goc',
    cover: PHOTOS.vegBasket,
    excerpt: 'Quét QR, xem nhật ký canh tác, kiểm tra vùng trồng và chứng nhận trước khi đưa rau vào bếp.'
  },
  {
    title: 'Xoài Cát Hòa Lộc: từ vườn cây đến thùng carton xuất khẩu',
    category: 'cau-chuyen-san-pham',
    cover: PHOTOS.mango,
    excerpt: 'Hành trình xoài Cát Hòa Lộc được đóng gói, dán tem QR và giao đến tay người mua trên cả nước.'
  },
  {
    title: 'Cà phê Buôn Ma Thuột và chuyển đổi số trong chế biến',
    category: 'kien-thuc-nong-nghiep',
    cover: PHOTOS.coffee,
    excerpt: 'Các HTX cà phê Đắk Lắk đang ứng dụng nhật ký sơ chế và QR để nâng giá trị thương hiệu.'
  },
  {
    title: 'Mật ong rừng Tây Nguyên: câu chuyện nuôi ong bền vững',
    category: 'cau-chuyen-san-pham',
    cover: PHOTOS.honey,
    excerpt: 'Nuôi ong kết hợp bảo vệ rừng, thu hoạch mật theo mùa và minh bạch nguồn gốc qua HTXONLINE.'
  },
  {
    title: 'Thủy sản Cà Mau: từ ao nuôi đến bàn ăn với QR truy xuất',
    category: 'tin-htx',
    cover: PHOTOS.shrimp,
    excerpt: 'HTX thủy sản Cà Mau triển khai nhật ký nuôi – thu hoạch – đóng gói trên một nền tảng.'
  },
  {
    title: 'Nấm sạch Đà Lạt: xu hướng tiêu dùng thực phẩm an toàn',
    category: 'tin-thi-truong',
    cover: PHOTOS.mushroom,
    excerpt: 'Nấm sạch nhà màng đáp ứng nhu cầu ăn sạch của người dân thành phố.'
  },
  {
    title: 'Hồng treo gió Sơn La – đặc sản núi rừng lên sàn TMĐT HTX',
    category: 'tin-htx',
    cover: PHOTOS.orchard,
    excerpt: 'Hồng Mộc Châu được đóng gói chuẩn, gắn QR và bán COD trên HTXONLINE.'
  },
  {
    title: 'Trà Shan Tuyết Hà Giang và hành trình chinh phục thị trường cao cấp',
    category: 'cau-chuyen-san-pham',
    cover: PHOTOS.tea,
    excerpt: 'Búp trà cổ thụ Shan Tuyết được truy xuất từ đồi chè đến ấm trà của người tiêu dùng.'
  },
  {
    title: 'Vì sao hợp tác xã nên có ảnh đại diện và hồ sơ public đầy đủ?',
    category: 'chuyen-doi-so',
    cover: PHOTOS.market,
    excerpt: 'Ảnh đại diện và thông tin minh bạch giúp người mua tin tưởng hơn khi chọn sản phẩm HTX.'
  },
  {
    title: 'Gà thả vườn Bắc Ninh: mô hình vừa chăn nuôi vừa du lịch nông thôn',
    category: 'tin-htx',
    cover: PHOTOS.chicken,
    excerpt: 'HTX kết hợp bán gà thả vườn online và tour tham quan trang trại.'
  }
] as const;

const DEMO_CODES = DEMO_COOPERATIVES.map((item) => item.code);

async function ensureCategories() {
  for (const [name, slug] of GLOBAL_CATEGORIES) {
    const existing = await prisma.productCategory.findFirst({ where: { slug, cooperativeId: null } });
    if (existing) {
      await prisma.productCategory.update({ where: { id: existing.id }, data: { name } });
      continue;
    }
    await prisma.productCategory.create({
      data: { name, slug, cooperativeId: null, description: `Danh mục ${name}` }
    });
  }
}

async function createSeedFile(cooperativeId: string, objectKey: string, publicUrl: string) {
  return prisma.fileAsset.upsert({
    where: { id: `seed-file-${objectKey}` },
    create: {
      id: `seed-file-${objectKey}`,
      cooperativeId,
      bucket: 'seed-demo',
      objectKey,
      publicUrl,
      mimeType: 'image/jpeg',
      sizeBytes: 180000,
      visibility: FileVisibility.PUBLIC
    },
    update: { publicUrl, visibility: FileVisibility.PUBLIC }
  });
}

async function resetDemoData() {
  const cooperatives = await prisma.cooperative.findMany({ where: { code: { in: DEMO_CODES } }, select: { id: true } });
  const coopIds = cooperatives.map((item) => item.id);
  if (!coopIds.length) return;

  await prisma.orderItem.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.payment.deleteMany({ where: { order: { cooperativeId: { in: coopIds } } } });
  await prisma.order.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.traceabilityPassport.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.farmingLog.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.certification.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.product.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.zone.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.cooperativeSubscription.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.cooperativeMember.deleteMany({ where: { cooperativeId: { in: coopIds } } });
  await prisma.fileAsset.deleteMany({ where: { cooperativeId: { in: coopIds } } });

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@demo.htxonline.vn' } },
    select: { id: true }
  });
  if (demoUsers.length) {
    await prisma.userRole.deleteMany({ where: { userId: { in: demoUsers.map((item) => item.id) } } });
    await prisma.user.deleteMany({ where: { id: { in: demoUsers.map((item) => item.id) } } });
  }

  await prisma.cooperative.deleteMany({ where: { id: { in: coopIds } } });
}

async function seedCooperative(demo: DemoCoop, planId: string, adminRoleId: string) {
  const cooperative = await prisma.cooperative.upsert({
    where: { code: demo.code },
    create: {
      code: demo.code,
      name: demo.name,
      taxCode: demo.taxCode,
      phone: demo.phone,
      email: demo.email,
      address: demo.address,
      province: demo.province,
      district: demo.district,
      ward: demo.ward,
      representative: demo.representative,
      avatarUrl: demo.avatarUrl,
      status: 'ACTIVE'
    },
    update: {
      name: demo.name,
      phone: demo.phone,
      email: demo.email,
      address: demo.address,
      province: demo.province,
      district: demo.district,
      ward: demo.ward,
      representative: demo.representative,
      avatarUrl: demo.avatarUrl,
      status: 'ACTIVE'
    }
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  const existingSub = await prisma.cooperativeSubscription.findFirst({
    where: { cooperativeId: cooperative.id, status: { in: ['ACTIVE', 'TRIAL'] } }
  });
  if (!existingSub) {
    await prisma.cooperativeSubscription.create({
      data: {
        cooperativeId: cooperative.id,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: true,
        note: 'Gói demo seed HTXONLINE'
      }
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  const adminEmail = `admin+${demo.code}@demo.htxonline.vn`;
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      fullName: `${demo.representative} (Admin)`,
      phone: demo.phone,
      passwordHash,
      cooperativeId: cooperative.id,
      status: 'ACTIVE'
    },
    update: {
      fullName: `${demo.representative} (Admin)`,
      phone: demo.phone,
      passwordHash,
      cooperativeId: cooperative.id,
      status: 'ACTIVE'
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRoleId } },
    create: { userId: admin.id, roleId: adminRoleId },
    update: {}
  });

  await prisma.cooperativeMember.upsert({
    where: { cooperativeId_userId: { cooperativeId: cooperative.id, userId: admin.id } },
    create: { cooperativeId: cooperative.id, userId: admin.id, title: RoleSlug.ADMIN_HTX, status: 'ACTIVE' },
    update: { status: 'ACTIVE', title: RoleSlug.ADMIN_HTX }
  });

  const zoneRecords = [];
  for (const zone of demo.zones) {
    const record = await prisma.zone.upsert({
      where: { cooperativeId_code: { cooperativeId: cooperative.id, code: zone.code } },
      create: {
        cooperativeId: cooperative.id,
        name: zone.name,
        code: zone.code,
        address: zone.address,
        areaM2: zone.areaM2,
        isPublic: true,
        status: 'ACTIVE'
      },
      update: {
        name: zone.name,
        address: zone.address,
        areaM2: zone.areaM2,
        isPublic: true,
        status: 'ACTIVE'
      }
    });
    zoneRecords.push(record);
  }

  const categories = await prisma.productCategory.findMany({ where: { cooperativeId: null } });
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item.id]));

  let productIndex = 0;
  for (const product of demo.products) {
    productIndex += 1;
    const slug = slugify(product.name);
    const code = `${demo.code.toUpperCase().replace(/-/g, '').slice(0, 6)}-${String(productIndex).padStart(3, '0')}`;
    const zone = zoneRecords[productIndex % zoneRecords.length];
    const categoryId = categoryBySlug.get(product.category);
    const objectKey = `${demo.code}/${slug}.jpg`;
    const thumbnail = await createSeedFile(cooperative.id, objectKey, product.image);

    const saved = await prisma.product.upsert({
      where: { cooperativeId_slug: { cooperativeId: cooperative.id, slug } },
      create: {
        cooperativeId: cooperative.id,
        categoryId,
        code,
        name: product.name,
        slug,
        description: product.description,
        price: product.price,
        unit: product.unit,
        status: ProductStatus.PUBLISHED,
        thumbnailFileId: thumbnail.id,
        zoneId: zone?.id,
        farmerId: admin.id,
        createdBy: admin.id,
        packagingInfo: 'Đóng gói tiêu chuẩn HTX',
        specification: 'Sản phẩm nông nghiệp địa phương, có QR truy xuất'
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        status: ProductStatus.PUBLISHED,
        thumbnailFileId: thumbnail.id,
        zoneId: zone?.id,
        categoryId
      }
    });

    const activities: FarmingActivityType[] = ['SEEDING', 'WATERING', 'FERTILIZING', 'HARVESTING', 'PACKAGING'];
    for (let i = 0; i < 3; i += 1) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - (i + 1) * 12);
      await prisma.farmingLog.create({
        data: {
          cooperativeId: cooperative.id,
          productId: saved.id,
          zoneId: zone?.id,
          actorId: admin.id,
          logDate,
          activityType: activities[i % activities.length],
          description: `Nhật ký ${activities[i % activities.length]} cho ${product.name} tại ${zone?.name ?? 'vùng trồng HTX'}.`,
          status: 'PUBLISHED',
          imagesJson: [{ url: product.image, caption: product.name }]
        }
      });
    }

    const publicSlug = `${slug}-${demo.code}`;
    await prisma.traceabilityPassport.upsert({
      where: { publicSlug },
      create: {
        cooperativeId: cooperative.id,
        productId: saved.id,
        passportCode: passportCode(),
        publicSlug,
        status: PassportStatus.PUBLISHED,
        publishedAt: new Date(),
        viewCount: 40 + productIndex * 7
      },
      update: {
        status: PassportStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    await prisma.certification.create({
      data: {
        cooperativeId: cooperative.id,
        productId: saved.id,
        zoneId: zone?.id,
        name: 'Chứng nhận an toàn nông sản',
        issuer: 'Trung tâm Kiểm nghiệm nông sản',
        issuedAt: new Date('2024-06-01'),
        expiresAt: new Date('2027-06-01'),
        isPublic: true,
        fileId: thumbnail.id
      }
    }).catch(() => undefined);
  }

  return cooperative;
}

async function seedNews(superAdminId: string) {
  const categories = await prisma.newsCategory.findMany();
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item.id]));

  for (const [index, article] of NEWS_ARTICLES.entries()) {
    const slug = slugify(article.title);
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - index * 3);
    await prisma.newsArticle.upsert({
      where: { slug },
      create: {
        categoryId: categoryBySlug.get(article.category),
        authorId: superAdminId,
        title: article.title,
        slug,
        excerpt: article.excerpt,
        bodyHtml: `<p>${article.excerpt}</p><p>Nội dung demo HTXONLINE – bài viết số ${index + 1} về nông nghiệp và hợp tác xã Việt Nam.</p>`,
        coverImageUrl: article.cover,
        coverImageAlt: article.title,
        status: NewsStatus.PUBLISHED,
        isFeatured: index < 4,
        showOnHome: index < 6,
        publishedAt,
        viewCount: 120 + index * 17,
        seoTitle: article.title,
        seoDescription: article.excerpt
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        coverImageUrl: article.cover,
        status: NewsStatus.PUBLISHED,
        isFeatured: index < 4,
        showOnHome: index < 6,
        publishedAt
      }
    });
  }
}

async function seedSampleOrders() {
  const products = await prisma.product.findMany({
    where: { cooperative: { code: { in: DEMO_CODES } }, status: 'PUBLISHED' },
    include: { cooperative: true },
    take: 24
  });

  const buyers = [
    { name: 'Nguyễn Thị Hồng', phone: '0909123456', province: 'TP. Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', address: '12 Nguyễn Huệ' },
    { name: 'Trần Văn Khoa', phone: '0918234567', province: 'Hà Nội', district: 'Cầu Giấy', ward: 'Dịch Vọng', address: '88 Xuân Thủy' },
    { name: 'Lê Minh Anh', phone: '0927345678', province: 'Đà Nẵng', district: 'Hải Châu', ward: 'Thạch Thang', address: '5 Trần Phú' },
    { name: 'Phạm Quốc Bảo', phone: '0936456789', province: 'Cần Thơ', district: 'Ninh Kiều', ward: 'An Hòa', address: '20 Nguyễn Văn Cừ' }
  ];

  for (let i = 0; i < 12; i += 1) {
    const product = products[i % products.length];
    const buyer = buyers[i % buyers.length];
    const quantity = 1 + (i % 4);
    const unitPrice = Number(product.price);
    const totalAmount = unitPrice * quantity;
    const orderCode = `DEMO-${Date.now().toString(36).toUpperCase()}-${i + 1}`;

    const order = await prisma.order.create({
      data: {
        cooperativeId: product.cooperativeId,
        orderCode,
        orderGroupCode: `GRP-DEMO-${Math.ceil((i + 1) / 2)}`,
        status: i % 3 === 0 ? 'CONFIRMED' : 'NEW',
        totalAmount,
        buyerName: buyer.name,
        buyerPhone: buyer.phone,
        province: buyer.province,
        district: buyer.district,
        ward: buyer.ward,
        address: buyer.address,
        paymentMethod: 'COD',
        note: 'Đơn hàng demo seed HTXONLINE'
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        cooperativeId: product.cooperativeId,
        quantity,
        unitPrice,
        status: order.status
      }
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: 'COD',
        status: 'PENDING'
      }
    });
  }
}

async function main() {
  if (process.env.SEED_DEMO_RESET === 'true') {
    console.log('Resetting previous demo cooperatives...');
    await resetDemoData();
  }

  await assertImageUrls(Object.values(PHOTOS));
  console.log(`Validated ${Object.keys(PHOTOS).length} demo image URLs`);

  await ensureCategories();

  const [basicPlan, proPlan, adminRole, superAdmin] = await Promise.all([
    prisma.subscriptionPlan.findUniqueOrThrow({ where: { slug: 'basic' } }),
    prisma.subscriptionPlan.findUniqueOrThrow({ where: { slug: 'pro' } }),
    prisma.role.findUniqueOrThrow({ where: { slug: RoleSlug.ADMIN_HTX } }),
    prisma.user.findFirst({ where: { roles: { some: { role: { slug: RoleSlug.SUPER_ADMIN } } } } })
  ]);

  let productTotal = 0;
  for (const demo of DEMO_COOPERATIVES) {
    const planId = demo.planSlug === 'pro' ? proPlan.id : basicPlan.id;
    await seedCooperative(demo, planId, adminRole.id);
    productTotal += demo.products.length;
    console.log(`Seeded ${demo.name} (${demo.products.length} sản phẩm)`);
  }

  if (superAdmin) {
    await seedNews(superAdmin.id);
    console.log(`Seeded ${NEWS_ARTICLES.length} bài tin tức`);
  }

  await seedSampleOrders();
  console.log('Seeded 12 đơn hàng demo COD');

  console.log('\nDemo seed hoàn tất:');
  console.log(`- ${DEMO_COOPERATIVES.length} hợp tác xã (có ảnh đại diện)`);
  console.log(`- ${productTotal} sản phẩm public (có ảnh thật)`);
  console.log(`- Admin HTX demo: admin+{ma-htx}@demo.htxonline.vn / ${DEMO_ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
