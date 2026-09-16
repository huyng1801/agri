import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './ui';

type PublicPaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  ariaLabel: string;
  className?: string;
  accentClassName?: string;
  hoverClassName?: string;
};

function visiblePages(currentPage: number, totalPages: number) {
  const pages = [1, 2, 3].filter((page) => page <= totalPages);
  if (currentPage > 3 && currentPage <= totalPages) pages.push(currentPage);
  return Array.from(new Set(pages));
}

export function PublicPagination({
  currentPage,
  totalPages,
  hrefForPage,
  ariaLabel,
  className,
  accentClassName = 'bg-[#0d7a28]',
  hoverClassName = 'hover:border-[#0d7a28] hover:text-[#0d7a28]'
}: PublicPaginationProps) {
  if (totalPages <= 1) return null;

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const pageNumbers = visiblePages(safeCurrentPage, totalPages);
  const baseButtonClass = 'grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-xl text-xs font-bold transition';
  const arrowClass = cn('grid h-11 w-11 min-h-11 min-w-11 place-items-center rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] shadow-xs transition', hoverClassName);

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center justify-center gap-2 border-t border-[var(--border)] pt-6', className)}>
      {safeCurrentPage > 1 && (
        <Link href={hrefForPage(safeCurrentPage - 1)} aria-label="Trang trước" className={arrowClass}>
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
      )}

      <div className="flex items-center gap-1.5">
        {pageNumbers.map((page) => {
          const isCurrent = page === safeCurrentPage;
          return (
            <Link
              key={page}
              href={hrefForPage(page)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                baseButtonClass,
                isCurrent
                  ? `${accentClassName} text-white shadow-xs`
                  : cn('border border-[var(--border)] bg-white text-[var(--text-secondary)]', hoverClassName)
              )}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {safeCurrentPage < totalPages && (
        <Link href={hrefForPage(safeCurrentPage + 1)} aria-label="Trang sau" className={arrowClass}>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
