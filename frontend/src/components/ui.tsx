import { clsx } from 'clsx';
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
        'touch-target inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-leaf text-white shadow-soft hover:bg-[#266941]',
        variant === 'ghost' && 'border border-slate-200 bg-white text-ink hover:bg-mint',
        variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700',
        className
      )}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'touch-target w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
        props.className
      )}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'touch-target w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint',
        props.className
      )}
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-base outline-none transition placeholder:text-slate-400 focus:border-leaf focus:ring-4 focus:ring-mint',
        props.className
      )}
      {...props}
    />
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', className)}>{children}</span>;
}

export function Panel({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section className={cn('rounded-md border border-slate-200 bg-white p-4 shadow-sm', className)} {...props}>
      {children}
    </section>
  );
}
