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
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  return (
    <button
      className={cn(
        'touch-target inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-leaf text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#266941]',
        variant === 'ghost' && 'border border-slate-200 bg-white/96 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-mint',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
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
        'touch-target block w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
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
        'touch-target block w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint',
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
        'block min-h-24 w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
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
    <section className={cn('rounded-2xl border border-slate-200/80 bg-white/96 p-5 shadow-[var(--shadow-card)] backdrop-blur-sm', className)} {...props}>
      {children}
    </section>
  );
}
