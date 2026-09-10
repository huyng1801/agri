'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from './ui';

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string; // default max-h-[90dvh]
  className?: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxHeight = 'max-h-[88dvh]',
  className,
  triggerRef
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`bottom-sheet-title-${Math.random().toString(36).slice(2, 9)}`).current;

  // Handle ESC key and Body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto focus first interactive element in sheet
    const timer = setTimeout(() => {
      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);

      // Return focus to trigger element
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        className={cn(
          'relative flex w-full flex-col rounded-t-[24px] border-t border-slate-200/80 bg-white shadow-2xl animate-in slide-in-from-bottom-5 duration-250',
          maxHeight,
          className
        )}
        style={{
          paddingBottom: 'max(1rem, var(--safe-bottom, 0px))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Drag Handle Pill */}
        <div className="pt-3 pb-1 cursor-grab active:cursor-grabbing flex justify-center w-full">
          <span className="h-1.5 w-11 rounded-full bg-slate-300 block" />
        </div>

        {/* Header with Title & Close Button */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-5 py-3 border-b border-slate-100 shrink-0">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="text-base font-bold text-[#131935] truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng bảng điều khiển"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a28]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
          {children}
        </div>

        {/* Sticky Footer Area (if provided) */}
        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
