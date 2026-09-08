import { clsx } from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'inverse' | 'inverse-ghost';
}) {
  return (
    <button
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 rounded-[var(--public-radius-control)] px-4 py-2.5 text-sm font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary-ring)] focus-visible:ring-offset-2',
        variant === 'primary' && 'bg-[var(--brand-primary)] text-white shadow-sm hover:bg-[var(--brand-primary-hover)]',
        variant === 'secondary' && 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white',
        variant === 'outline' && 'border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]',
        variant === 'ghost' && 'border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
        variant === 'danger' && 'bg-[var(--danger)] text-white hover:opacity-90',
        variant === 'inverse' && 'bg-white text-[var(--brand-primary)] shadow-sm hover:bg-slate-50',
        variant === 'inverse-ghost' && 'border border-white/25 bg-white/10 text-white hover:bg-white/20',
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'touch-target block w-full rounded-[var(--public-radius-control)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-ring)]',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'touch-target block w-full rounded-[var(--public-radius-control)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-ring)]',
        className
      )}
      {...props}
    />
  );
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'block min-h-24 w-full rounded-[var(--public-radius-control)] border border-[var(--border)] bg-white px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary-ring)]',
        className
      )}
      {...props}
    />
  );
});

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--public-radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-primary)]',
        className
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section
      className={cn(
        'rounded-[var(--public-radius-card)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--public-shadow-card)] sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
