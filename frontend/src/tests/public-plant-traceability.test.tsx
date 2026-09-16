import { render, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicProductTracePage, PublicTreePassportPage } from '@/components/public-plant-traceability';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock('@/components/public-shell', () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => <div data-testid="public-shell">{children}</div>
}));

vi.mock('@/components/gis-map', () => ({
  GisMap: ({ markers, privacyLabel }: { markers: Array<{ latitude?: number | string | null; longitude?: number | string | null }>; privacyLabel?: string }) => {
    const validMarkers = markers.filter((marker) => marker.latitude !== null && marker.latitude !== undefined && marker.longitude !== null && marker.longitude !== undefined);
    return <div data-testid="gis-map" data-marker-count={validMarkers.length}>{privacyLabel}</div>;
  }
}));

const publicTree = {
  verified: true,
  traceability: { code: 'TREE-XOI-VLM-01-000001', publicUrl: 'https://example.test/cay/XOI-VLM-01-000001', qrDataUrl: 'data:image/png;base64,qr' },
  tree: {
    treeCode: 'XOI-VLM-01-000001',
    cropType: { name: 'Xoài' },
    variety: 'Cát Chu',
    plantedDate: '2020-01-01T00:00:00.000Z',
    status: 'ACTIVE',
    publicUrl: 'https://example.test/cay/XOI-VLM-01-000001',
    ownerName: 'HTX Nông nghiệp Demo',
    images: [{ url: 'https://cdn.example.test/tree.jpg', caption: 'Ảnh cây demo' }],
    zone: { name: 'Vườn công khai', address: 'Đồng Tháp', latitude: 10.45, longitude: 105.72 },
    events: [],
    harvests: []
  }
};

const publicProduct = {
  verified: true,
  traceability: { code: 'BATCH-SP-2026-000001', publicUrl: 'https://example.test/truy-xuat/SP-2026-000001' },
  product: {
    name: 'Xoài Cát Chu',
    code: 'XOAI-001',
    description: 'Xoài truy xuất theo lô.',
    unit: 'kg',
    quantity: 100,
    productCode: 'SP-2026-000001',
    packagingDate: null,
    lotCode: 'LO-2026-000001',
    harvestDate: '2026-08-20T00:00:00.000Z',
    treeCount: 1
  },
  lot: {
    lotCode: 'LO-2026-000001',
    zone: { name: 'Vườn công khai', address: 'Đồng Tháp', latitude: 10.45, longitude: 105.72 },
    cropType: { name: 'Xoài' },
    harvestDate: '2026-08-20T00:00:00.000Z',
    totalQuantity: 100
  },
  trees: [
    {
      ...publicTree.tree,
      allocatedQuantity: 100,
      allocatedUnit: 'kg'
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('public plant traceability GIS', () => {
  it('renders a region-level GIS map on a public tree passport', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ data: publicTree }) } as Response);

    render(await PublicTreePassportPage({ treeCode: publicTree.tree.treeCode }));

    expect(screen.getByTestId('public-tree-gis')).toBeInTheDocument();
    expect(screen.getByTestId('gis-map')).toHaveAttribute('data-marker-count', '1');
    expect(screen.getByText(/không được công khai/i)).toBeInTheDocument();
    expect(screen.getByText('HTX Nông nghiệp Demo')).toBeInTheDocument();
    expect(screen.getByText('6 năm')).toBeInTheDocument();
    expect(screen.getByTestId('public-tree-images')).toContainElement(screen.getByAltText('Ảnh cây demo'));
    expect(screen.getByTestId('public-tree-cultivation-history')).toBeInTheDocument();
    expect(screen.getByTestId('public-tree-harvest-history')).toBeInTheDocument();
    expect(screen.getByAltText('QR cây XOI-VLM-01-000001')).toBeInTheDocument();
  });

  it('renders a region-level GIS map on a public product trace page', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ data: publicProduct }) } as Response);

    render(await PublicProductTracePage({ productCode: publicProduct.product.productCode }));

    expect(screen.getByTestId('public-product-gis')).toBeInTheDocument();
    expect(screen.getByTestId('gis-map')).toHaveAttribute('data-marker-count', '1');
  });
});
