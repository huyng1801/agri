import { API_URL, type ApiEnvelope } from '@/lib/api';
import { cooperativesFromProducts, publicListItems, type PublicCooperative, type PublicProduct } from '@/components/public-marketplace';

type ProductListPayload = PublicProduct[] | { data?: PublicProduct[] };

type CatalogMeta = {
  total?: number;
};

export type PublicCatalog = {
  products: PublicProduct[];
  cooperatives: PublicCooperative[];
  totalProducts: number;
};

export const STANDARD_PRODUCTS: PublicProduct[] = [
  {
    id: 'prod-01-tra-shan',
    code: 'SP-TRA-SHAN-01',
    name: 'Trà Xanh Shan Tuyết Cổ Thụ Hà Giang',
    slug: 'tra-xanh-shan',
    description: 'Búp trà Shan Tuyết 1 tôm 1 lá thu hái từ cây chè cổ thụ trên 100 năm tuổi tại dãy Tây Côn Lĩnh ở độ cao trên 1.400m, búp phủ tuyết trắng tinh khiết, hương thơm thanh khiết của núi rừng và hậu vị ngọt sâu lắng.',
    price: 350000,
    unit: 'Hộp 200g',
    cooperative: {
      id: 'htx-tra-ha-giang',
      name: 'HTX Chế biến Trà Shan Tuyết Hà Giang',
      code: 'htx-tra-shan-tuyet-ha-giang',
      province: 'Hà Giang',
      phone: '0912 345 678',
      avatarUrl: '/icons/cooperative-default.svg'
    },
    category: {
      name: 'Trà & Dược liệu',
      slug: 'tra-duoc-lieu'
    },
    zone: {
      name: 'Vùng chè cổ thụ Tây Côn Lĩnh',
      address: 'Xã Cao Bồ, Huyện Vị Xuyên, Tỉnh Hà Giang',
      areaM2: 120000
    },
    passports: [
      {
        passportCode: 'DEMO-PASSPORT',
        publicSlug: 'tra-xanh-shan'
      }
    ],
    farmingLogs: [
      {
        id: 'log-01',
        logDate: '2026-04-10T06:00:00.000Z',
        activityType: 'Thu hoạch',
        description: 'Thu hái búp 1 tôm 1 lá vào sáng sớm khi sương núi chưa tan, chọn lọc thủ công từng búp đạt chuẩn.'
      },
      {
        id: 'log-02',
        logDate: '2026-04-12T14:30:00.000Z',
        activityType: 'Chế biến & Sao suốt',
        description: 'Làm héo tự nhiên trên nong tre, sao diệt men và lên hương truyền thống bằng củi gỗ thơm.'
      },
      {
        id: 'log-03',
        logDate: '2026-04-15T09:00:00.000Z',
        activityType: 'Đóng gói & Cấp mã QR',
        description: 'Đóng túi thiếc hút chân không, dán tem QR Hộ Chiếu Nông Nghiệp truy xuất nguồn gốc từng hộp trà.'
      }
    ],
    certifications: [
      {
        id: 'cert-01',
        name: 'Chứng nhận OCOP 4 Sao Tỉnh Hà Giang',
        issuer: 'UBND Tỉnh Hà Giang',
        expiresAt: '2027-12-31'
      },
      {
        id: 'cert-02',
        name: 'Chứng nhận VietGAP Trồng trọt & Chế biến',
        issuer: 'Trung tâm Giám định Chất lượng Nông nghiệp',
        expiresAt: '2028-06-30'
      }
    ]
  },
  {
    id: 'prod-02-gao-st25',
    code: 'SP-GAO-ST25-02',
    name: 'Gạo ST25 Hữu Cơ Đồng Tháp',
    slug: 'gao-st25-huu-co',
    description: 'Giống lúa tiến vua ST25 được canh tác theo mô hình sinh thái tôm - lúa an toàn tại Đồng Tháp Mười, hạt dài trắng trong, cơm dẻo mềm thơm mùi lá dứa tự nhiên.',
    price: 180000,
    unit: 'Túi 5kg',
    cooperative: {
      id: 'htx-lua-dong-thap-id',
      name: 'HTX Nông Nghiệp Lúa Vàng Đồng Tháp',
      code: 'htx-lua-dong-thap',
      province: 'Đồng Tháp',
      phone: '0907 001 200',
      avatarUrl: '/icons/cooperative-default.svg'
    },
    category: {
      name: 'Lúa gạo & Nông sản khô',
      slug: 'lua-gao'
    },
    zone: {
      name: 'Cánh đồng mẫu lớn Tam Nông',
      address: 'Xã Phú Cường, Huyện Tam Nông, Tỉnh Đồng Tháp',
      areaM2: 500000
    },
    passports: [
      {
        passportCode: 'PASSPORT-ST25',
        publicSlug: 'gao-st25-huu-co'
      }
    ],
    farmingLogs: [
      {
        id: 'log-04',
        logDate: '2026-01-15T07:00:00.000Z',
        activityType: 'Gieo sạ hữu cơ',
        description: 'Xuống giống ST25 chuẩn xác nhận từ Viện lúa ĐBSCL, sử dụng phân bón hữu cơ vi sinh.'
      },
      {
        id: 'log-05',
        logDate: '2026-05-18T10:00:00.000Z',
        activityType: 'Thu hoạch cơ giới hóa',
        description: 'Thu hoạch bằng máy liên hợp đạt độ ẩm tiêu chuẩn 14%, vận chuyển về nhà máy sấy lạnh trong 6h.'
      }
    ],
    certifications: [
      {
        id: 'cert-03',
        name: 'Chứng nhận Hữu cơ Quốc gia TCVN 11041',
        issuer: 'Tổ chức Chứng nhận Nông nghiệp Hữu cơ',
        expiresAt: '2027-11-20'
      },
      {
        id: 'cert-04',
        name: 'OCOP 5 Sao Tiêu biểu Đồng Tháp',
        issuer: 'Bộ Nông nghiệp & PTNT',
        expiresAt: '2028-05-15'
      }
    ]
  },
  {
    id: 'prod-03-xoai-cat-chu',
    code: 'SP-XOAI-CC-03',
    name: 'Xoài Cát Chu Cao Lãnh',
    slug: 'xoai-cat-chu-cao-lanh',
    description: 'Xoài Cát Chu truyền thống nổi tiếng của xứ xoài Cao Lãnh, thịt dày, hột nhỏ, ngọt đậm đà và thoang thoảng hương thơm đặc trưng của đất cù lao ven sông Tiền.',
    price: 65000,
    unit: 'Kg',
    cooperative: {
      id: 'htx-xoai-my-xuong-id',
      name: 'HTX Xoài Mỹ Xương',
      code: 'htx-xoai-my-xuong',
      province: 'Đồng Tháp',
      phone: '0939 123 456',
      avatarUrl: '/icons/cooperative-default.svg'
    },
    category: {
      name: 'Trái cây tươi',
      slug: 'trai-cay-tuoi'
    },
    zone: {
      name: 'Vùng chỉ dẫn địa lý Xoài Cao Lãnh',
      address: 'Xã Mỹ Xương, Huyện Cao Lãnh, Tỉnh Đồng Tháp',
      areaM2: 350000
    },
    passports: [
      {
        passportCode: 'PASSPORT-XOAI-CC',
        publicSlug: 'xoai-cat-chu-cao-lanh'
      }
    ],
    farmingLogs: [
      {
        id: 'log-06',
        logDate: '2026-03-05T08:00:00.000Z',
        activityType: 'Bao trái sinh học',
        description: 'Tiến hành bao trái bằng bao giấy chuyên dụng hai lớp để ngăn chặn sâu bệnh hại tự nhiên.'
      }
    ],
    certifications: [
      {
        id: 'cert-05',
        name: 'Chỉ dẫn Địa lý Xoài Cao Lãnh',
        issuer: 'Cục Sở hữu Trí tuệ Việt Nam',
        expiresAt: '2029-01-01'
      }
    ]
  },
  {
    id: 'prod-04-cam-ham-yen',
    code: 'SP-CAM-HY-04',
    name: 'Cam Sành Hàm Yên',
    slug: 'cam-sanh-ham-yen',
    description: 'Cam sành Hàm Yên mọng nước, tép cam vàng óng, vị ngọt thanh mát đậm vị phù sa miền núi, giàu Vitamin C tự nhiên.',
    price: 45000,
    unit: 'Kg',
    cooperative: {
      id: 'htx-cam-ham-yen-id',
      name: 'HTX Cam Sành Hàm Yên',
      code: 'htx-cam-sanh-ham-yen',
      province: 'Tuyên Quang',
      phone: '0988 776 655',
      avatarUrl: '/icons/cooperative-default.svg'
    },
    category: {
      name: 'Trái cây tươi',
      slug: 'trai-cay-tuoi'
    },
    zone: {
      name: 'Vùng chuyên canh đồi cam Hàm Yên',
      address: 'Thị trấn Tân Yên, Huyện Hàm Yên, Tỉnh Tuyên Quang',
      areaM2: 250000
    },
    passports: [
      {
        passportCode: 'PASSPORT-CAM-HY',
        publicSlug: 'cam-sanh-ham-yen'
      }
    ],
    farmingLogs: [],
    certifications: [
      {
        id: 'cert-06',
        name: 'Chứng nhận VietGAP Vùng Cam Hàm Yên',
        issuer: 'Sở NN&PTNT Tuyên Quang',
        expiresAt: '2027-09-30'
      }
    ]
  }
];

export const STANDARD_COOPERATIVES: PublicCooperative[] = cooperativesFromProducts(STANDARD_PRODUCTS);

export async function fetchPublicCatalog(limit = 100): Promise<PublicCatalog> {
  try {
    const response = await fetch(`${API_URL}/products/public?limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) {
      return {
        products: STANDARD_PRODUCTS.slice(0, limit),
        cooperatives: STANDARD_COOPERATIVES,
        totalProducts: STANDARD_PRODUCTS.length
      };
    }
    const body = (await response.json()) as ApiEnvelope<ProductListPayload> & { meta?: CatalogMeta };
    const products = publicListItems(body.data);
    if (!products.length) {
      return {
        products: STANDARD_PRODUCTS.slice(0, limit),
        cooperatives: STANDARD_COOPERATIVES,
        totalProducts: STANDARD_PRODUCTS.length
      };
    }
    const cooperatives = cooperativesFromProducts(products);
    return {
      products,
      cooperatives,
      totalProducts: body.meta?.total ?? products.length
    };
  } catch {
    return {
      products: STANDARD_PRODUCTS.slice(0, limit),
      cooperatives: STANDARD_COOPERATIVES,
      totalProducts: STANDARD_PRODUCTS.length
    };
  }
}

export async function fetchProductsForCooperative(code: string, limit = 100): Promise<PublicProduct[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit), cooperative: code });
    const response = await fetch(`${API_URL}/products/public?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      return STANDARD_PRODUCTS.filter((p) => p.cooperative?.code === code);
    }
    const body = (await response.json()) as ApiEnvelope<ProductListPayload>;
    const products = publicListItems(body.data);
    if (!products.length) {
      return STANDARD_PRODUCTS.filter((p) => p.cooperative?.code === code);
    }
    return products;
  } catch {
    return STANDARD_PRODUCTS.filter((p) => p.cooperative?.code === code);
  }
}
