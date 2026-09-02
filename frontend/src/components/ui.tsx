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
        variant === 'primary' && 'bg-[linear-gradient(135deg,#183225_0%,#224a35_52%,#2f7d4f_100%)] text-white shadow-[0_18px_38px_rgba(24,50,37,0.22)] hover:-translate-y-0.5 hover:brightness-[1.02]',
        variant === 'ghost' && 'border border-[#e4d8c3] bg-[rgba(255,253,248,0.96)] text-ink shadow-sm hover:-translate-y-0.5 hover:bg-white',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
        variant === 'inverse' && 'bg-white text-[#17442c] shadow-[0_16px_32px_rgba(8,38,23,0.22)] hover:-translate-y-0.5 hover:bg-[#eff9ed]',
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
        'touch-target block w-full rounded-[1.05rem] border border-[#e4d8c3] bg-[rgba(255,253,248,0.96)] px-3.5 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
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
        'touch-target block w-full rounded-[1.05rem] border border-[#e4d8c3] bg-[rgba(255,253,248,0.96)] px-3.5 py-2.5 text-base outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint',
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
        'block min-h-24 w-full rounded-[1.05rem] border border-[#e4d8c3] bg-[rgba(255,253,248,0.96)] px-3.5 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
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
        'rounded-[1.7rem] border border-[#e6d9c4] bg-[rgba(255,253,248,0.96)] p-4 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
