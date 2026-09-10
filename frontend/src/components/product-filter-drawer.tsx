'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, QrCode } from 'lucide-react';
import { MobileBottomSheet } from './mobile-bottom-sheet';
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
  const filterBtnRef = useRef<HTMLButtonElement>(null);

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
    <div className="mb-6 sm:mb-8 space-y-3.5">
      {/* Category Chips Bar: Single horizontal scroll row */}
      {categoryOptions.length > 0 && (
        <div className="-mx-4 sm:-mx-1 overflow-x-auto px-4 sm:px-1 pb-1 no-scrollbar touch-action-manipulation">
          <div className="flex min-w-max items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Ngành hàng:
            </span>
            <Link
              href="/san-pham"
              aria-current={!initialFilters.category ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 items-center rounded-xl px-4 text-xs font-bold transition active:scale-95 touch-action-manipulation',
                !initialFilters.category
                  ? 'bg-[#0d7a28] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-[#0d7a28] hover:text-[#0d7a28]'
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
                    'inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-bold transition active:scale-95 touch-action-manipulation',
                    isActive
                      ? 'bg-[#0d7a28] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#0d7a28] hover:text-[#0d7a28]'
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
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <form action="/san-pham" method="GET" className="space-y-3">
          {/* Top Row: Search Input (>=16px font to prevent iOS zoom) + Mobile Filter Button + Desktop Submit */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                name="search"
                defaultValue={initialFilters.search ?? ''}
                placeholder="Tìm tên sản phẩm, giống cây, HTX..."
                aria-label="Tìm kiếm sản phẩm"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-base font-medium text-slate-900 outline-none transition focus:border-[#0d7a28] focus:bg-white focus:ring-2 focus:ring-[#0d7a28]/20 placeholder:text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Mobile Filter Toggle Button (hidden on desktop) */}
            <button
              ref={filterBtnRef}
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Mở bộ lọc nông sản"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 lg:hidden shadow-xs hover:border-[#0d7a28] active:scale-95 touch-action-manipulation"
            >
              <SlidersHorizontal size={16} className="text-[#0d7a28]" />
              <span>Lọc</span>
              {activeSecondaryFiltersCount > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[#0d7a28] text-[10px] font-extrabold text-white">
                  {activeSecondaryFiltersCount}
                </span>
              )}
            </button>

            {/* Desktop Submit Button */}
            <button
              type="submit"
              className="hidden lg:inline-flex h-12 items-center justify-center rounded-xl bg-[#0d7a28] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#0a6120]"
            >
              Tìm kiếm
            </button>

            {hasAnyFilter && (
              <Link
                href="/san-pham"
                className="hidden lg:inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={14} />
                <span>Xóa lọc</span>
              </Link>
            )}
          </div>

          {/* Desktop Filter Row: (hidden on mobile, visible on lg+) */}
          <div className="hidden lg:grid grid-cols-12 gap-3 pt-2.5 border-t border-slate-100 items-center">
            {/* Province input */}
            <div className="col-span-3">
              <input
                name="province"
                defaultValue={initialFilters.province ?? ''}
                placeholder="Tỉnh / Thành phố"
                aria-label="Lọc theo tỉnh thành"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0d7a28] focus:bg-white"
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
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0d7a28] focus:bg-white"
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
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0d7a28] focus:bg-white"
              />
            </div>

            {/* Sort */}
            <div className="col-span-2">
              <select
                name="sort"
                defaultValue={initialFilters.sort ?? ''}
                aria-label="Sắp xếp kết quả"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0d7a28] focus:bg-white"
              >
                <option value="">Mới nhất</option>
                <option value="price_asc">Giá: Thấp $\to$ Cao</option>
                <option value="price_desc">Giá: Cao $\to$ Thấp</option>
              </select>
            </div>

            {/* Has QR Checkbox */}
            <div className="col-span-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="hasQr"
                  value="true"
                  defaultChecked={initialFilters.hasQr === 'true'}
                  className="h-4 w-4 rounded border-slate-300 text-[#0d7a28] focus:ring-[#0d7a28]"
                />
                <span className="flex items-center gap-1">
                  <QrCode size={13} className="text-[#0d7a28]" />
                  <span>Chỉ có QR Passport</span>
                </span>
              </label>
            </div>
          </div>

          {/* Hidden inputs to preserve category */}
          {initialFilters.category && (
            <input type="hidden" name="category" value={initialFilters.category} />
          )}
        </form>
      </div>

      {/* =========================================================================
          NATIVE MOBILE FILTER BOTTOM SHEET (Sections 16, 17, 18, 19)
         ========================================================================= */}
      <MobileBottomSheet
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Bộ lọc nông sản"
        description="Tinh chỉnh tiêu chí tra cứu theo địa phương, khoảng giá và mã QR"
        triggerRef={filterBtnRef}
      >
        <form action="/san-pham" method="GET" className="space-y-4">
          {/* Preserve search and category */}
          {initialFilters.search && (
            <input type="hidden" name="search" value={initialFilters.search} />
          )}
          {initialFilters.category && (
            <input type="hidden" name="category" value={initialFilters.category} />
          )}

          {/* Province */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Địa bàn / Tỉnh thành
            </label>
            <input
              name="province"
              defaultValue={initialFilters.province ?? ''}
              placeholder="Ví dụ: Đắk Lắk, Tiền Giang, Sơn La..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-medium text-slate-900 outline-none focus:border-[#0d7a28] focus:bg-white"
            />
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Khoảng giá (VNĐ)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                name="minPrice"
                defaultValue={initialFilters.minPrice ?? ''}
                inputMode="numeric"
                placeholder="Giá từ"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-medium text-slate-900 outline-none focus:border-[#0d7a28] focus:bg-white"
              />
              <input
                name="maxPrice"
                defaultValue={initialFilters.maxPrice ?? ''}
                inputMode="numeric"
                placeholder="Đến"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-medium text-slate-900 outline-none focus:border-[#0d7a28] focus:bg-white"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Sắp xếp hiển thị
            </label>
            <select
              name="sort"
              defaultValue={initialFilters.sort ?? ''}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-medium text-slate-900 outline-none focus:border-[#0d7a28] focus:bg-white"
            >
              <option value="">Mới nhất cập nhật</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
          </div>

          {/* Has QR Checkbox */}
          <div className="rounded-xl border border-[#0d7a28]/20 bg-[#0d7a28]/06 p-3.5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="hasQr"
                value="true"
                defaultChecked={initialFilters.hasQr === 'true'}
                className="h-5 w-5 rounded border-slate-300 text-[#0d7a28] focus:ring-[#0d7a28]"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Chỉ nông sản có QR Passport
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Đã thẩm định và cấp mã truy xuất chính hãng
                </span>
              </div>
            </label>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="flex items-center gap-3 pt-3">
            <Link
              href="/san-pham"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex-1 inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition active:bg-slate-100"
            >
              Thiết lập lại
            </Link>

            <button
              type="submit"
              className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-[#0d7a28] text-xs font-bold text-white shadow-sm transition active:scale-98 hover:bg-[#0a6120]"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </form>
      </MobileBottomSheet>
    </div>
  );
}