'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, Search, SlidersHorizontal, X, QrCode, Check } from 'lucide-react';
import { cn } from './ui';

export type ProductFilterValues = {
  search?: string;
  category?: string;
  cooperative?: string;
  province?: string;
  minPrice?: string;
  maxPrice?: string;
  hasQr?: string;
  sort?: string;
};

export function ProductFilterBar({
  initialFilters = {},
  categoryOptions = []
}: {
  initialFilters?: ProductFilterValues;
  categoryOptions?: Array<{ name: string; slug: string }>;
}) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Count active secondary filters (excluding search and category which have separate visible controls)
  const activeSecondaryFiltersCount = [
    Boolean(initialFilters.province),
    Boolean(initialFilters.minPrice || initialFilters.maxPrice),
    Boolean(initialFilters.hasQr === 'true'),
    Boolean(initialFilters.sort)
  ].filter(Boolean).length;

  const hasAnyFilter = Boolean(
    initialFilters.search ||
    initialFilters.category ||
    initialFilters.province ||
    initialFilters.minPrice ||
    initialFilters.maxPrice ||
    initialFilters.hasQr === 'true' ||
    initialFilters.sort
  );

  return (
    <div className="mb-8 space-y-4">
      {/* Category Chips Bar */}
      {categoryOptions.length > 0 && (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mr-1">
              Ngành hàng:
            </span>
            <Link
              href="/san-pham"
              aria-current={!initialFilters.category ? 'page' : undefined}
              className={cn(
                'inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition',
                !initialFilters.category
                  ? 'bg-[#0d7a28] text-white shadow-xs'
                  : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#0d7a28] hover:text-[#0d7a28]'
              )}
            >
              Tất cả ngành hàng
            </Link>
            {categoryOptions.map((cat) => {
              const isActive = initialFilters.category === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/san-pham?category=${encodeURIComponent(cat.slug)}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-bold transition',
                    isActive
                      ? 'bg-[#0d7a28] text-white shadow-xs'
                      : 'border border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[#0d7a28] hover:text-[#0d7a28]'
                  )}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Search & Filter Component */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-3.5 sm:p-4 shadow-xs">
        <form action="/san-pham" method="GET" className="space-y-3">
          {/* Top Row: Search Input + Mobile Filter Button + Desktop Submit */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                aria-hidden="true"
              />
              <input
                name="search"
                defaultValue={initialFilters.search ?? ''}
                placeholder="Tìm tên sản phẩm, giống cây, hợp tác xã..."
                aria-label="Tìm kiếm sản phẩm"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[#0d7a28] focus:bg-white focus:ring-2 focus:ring-[#0d7a28]/20"
              />
            </div>

            {/* Mobile Filter Toggle Button (hidden on desktop) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-white px-3.5 text-xs font-bold text-[var(--text-primary)] lg:hidden shadow-xs hover:border-[#0d7a28] hover:text-[#0d7a28]"
            >
              <SlidersHorizontal size={15} />
              <span>Bộ lọc</span>
              {activeSecondaryFiltersCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#0d7a28] text-[10px] font-extrabold text-white">
                  {activeSecondaryFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Submit Button */}
            <button
              type="submit"
              className="hidden lg:inline-flex h-11 items-center justify-center rounded-xl bg-[#0d7a28] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#0a6120]"
            >
              Tìm kiếm
            </button>

            {hasAnyFilter && (
              <Link
                href="/san-pham"
                className="hidden lg:inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-slate-100"
              >
                <X size={14} />
                <span>Xóa lọc</span>
              </Link>
            )}
          </div>

          {/* Desktop Filter Row: (hidden on mobile, visible on lg+) */}
          <div className="hidden lg:grid grid-cols-12 gap-3 pt-2 border-t border-[var(--border-subtle)] items-center">
            {/* Province input */}
            <div className="col-span-3">
              <input
                name="province"
                defaultValue={initialFilters.province ?? ''}
                placeholder="Tỉnh / Thành phố"
                aria-label="Lọc theo tỉnh thành"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#0d7a28] focus:bg-white"
              />
            </div>

            {/* Price min */}
            <div className="col-span-2">
              <input
                name="minPrice"
                defaultValue={initialFilters.minPrice ?? ''}
                inputMode="numeric"
                placeholder="Giá từ (đ)"
                aria-label="Giá tối thiểu"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#0d7a28] focus:bg-white"
              />
            </div>

            {/* Price max */}
            <div className="col-span-2">
              <input
                name="maxPrice"
                defaultValue={initialFilters.maxPrice ?? ''}
                inputMode="numeric"
                placeholder="Giá đến (đ)"
                aria-label="Giá tối đa"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#0d7a28] focus:bg-white"
              />
            </div>

            {/* Sort */}
            <div className="col-span-2">
              <select
                name="sort"
                defaultValue={initialFilters.sort ?? ''}
                aria-label="Sắp xếp kết quả"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[#0d7a28] focus:bg-white"
              >
                <option value="">Sắp xếp: Mới nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
              </select>
            </div>

            {/* QR Checkbox */}
            <div className="col-span-3 flex items-center justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[var(--text-primary)]">
                <input
                  type="checkbox"
                  name="hasQr"
                  value="true"
                  defaultChecked={initialFilters.hasQr === 'true'}
                  className="h-4 w-4 rounded border-[var(--border-strong)] text-[#0d7a28] focus:ring-[#0d7a28]"
                />
                <span className="flex items-center gap-1">
                  <QrCode size={13} className="text-[#0d7a28]" />
                  <span>Chỉ sản phẩm có QR Passport</span>
                </span>
              </label>
            </div>
          </div>

          {/* Hidden inputs to preserve category / cooperative */}
          {initialFilters.category && (
            <input type="hidden" name="category" value={initialFilters.category} />
          )}
          {initialFilters.cooperative && (
            <input type="hidden" name="cooperative" value={initialFilters.cooperative} />
          )}
        </form>
      </div>

      {/* =========================================================================
          MOBILE BOTTOM SHEET / DRAWER FOR ADVANCED FILTERS
         ========================================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          <div
            className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-[var(--border)] bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Bộ lọc nâng cao"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#0d7a28]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Bộ lọc nâng cao</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                aria-label="Đóng bộ lọc"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Filter Form */}
            <form action="/san-pham" method="GET" className="mt-5 space-y-5">
              {/* Carry over existing search and category */}
              {initialFilters.search && (
                <input type="hidden" name="search" value={initialFilters.search} />
              )}
              {initialFilters.category && (
                <input type="hidden" name="category" value={initialFilters.category} />
              )}

              {/* Province */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Tỉnh / Thành phố
                </label>
                <input
                  name="province"
                  defaultValue={initialFilters.province ?? ''}
                  placeholder="Ví dụ: Đắk Lắk, Lâm Đồng, Sơn La..."
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[#0d7a28] focus:bg-white"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Khoảng giá (VNĐ)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="minPrice"
                    defaultValue={initialFilters.minPrice ?? ''}
                    inputMode="numeric"
                    placeholder="Từ"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[#0d7a28] focus:bg-white"
                  />
                  <input
                    name="maxPrice"
                    defaultValue={initialFilters.maxPrice ?? ''}
                    inputMode="numeric"
                    placeholder="Đến"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[#0d7a28] focus:bg-white"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                  Sắp xếp hiển thị
                </label>
                <select
                  name="sort"
                  defaultValue={initialFilters.sort ?? ''}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[#0d7a28] focus:bg-white"
                >
                  <option value="">Mới nhất cập nhật</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
              </div>

              {/* Has QR Checkbox */}
              <div className="rounded-xl border border-[#0d7a28]/20 bg-[#0d7a28]/5 p-3.5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="hasQr"
                    value="true"
                    defaultChecked={initialFilters.hasQr === 'true'}
                    className="h-5 w-5 rounded border-[var(--border-strong)] text-[#0d7a28] focus:ring-[#0d7a28]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">
                      Chỉ hiển thị sản phẩm có QR Passport
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5">
                      Đã hoàn tất hồ sơ kiểm định và cấp mã truy xuất
                    </span>
                  </div>
                </label>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
                <Link
                  href="/san-pham"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex-1 inline-flex h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-xs font-bold text-[var(--text-secondary)] transition hover:bg-slate-100"
                >
                  Thiết lập lại
                </Link>

                <button
                  type="submit"
                  className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-[#0d7a28] text-xs font-bold text-white shadow-md transition hover:bg-[#0a6120]"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}