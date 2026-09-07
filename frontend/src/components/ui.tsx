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
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'inverse' | 'inverse-ghost' }) {
  return (
    <button
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 rounded-[1.15rem] px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'brand-gradient-bg text-[var(--brand-on-primary)] shadow-[0_16px_32px_rgba(15,81,91,0.18)] hover:-translate-y-0.5 hover:brightness-[1.04]',
        variant === 'ghost' && 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:-translate-y-0.5 hover:bg-[var(--surface-elevated)]',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
        variant === 'inverse' && 'bg-white text-[var(--brand-primary-hover)] shadow-[0_16px_32px_rgba(8,38,23,0.18)] hover:-translate-y-0.5 hover:bg-[var(--brand-primary-subtle)]',
        variant === 'inverse-ghost' && 'border border-white/35 bg-white/10 text-white shadow-none hover:-translate-y-0.5 hover:bg-white/18 hover:text-white',
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
        'touch-target block w-full rounded-[1.05rem] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]',
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
        'touch-target block w-full rounded-[1.05rem] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]',
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
        'block min-h-24 w-full rounded-[1.05rem] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-subtle)]',
        className
      )}
      {...props}
    />
  );
});

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', className)}>{children}</span>;
}

export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section
      className={cn(
        'rounded-[1.7rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
