'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const variants = {
  primary: `
    bg-gradient-to-r from-brand-500 to-orange-500 text-white
    hover:opacity-90 shadow-brand hover:shadow-brand-lg
    active:scale-[0.98]
  `,
  secondary: `
    bg-dark-800 text-white border border-dark-600
    hover:bg-dark-700 hover:border-dark-500
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-gray-400 
    hover:text-white hover:bg-dark-800
  `,
  danger: `
    bg-red-500/20 text-red-400 border border-red-500/30
    hover:bg-red-500/30
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent border border-brand-500 text-brand-500
    hover:bg-brand-500/10
    active:scale-[0.98]
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';