'use client';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 bg-dark-900 border rounded-lg text-white',
              'placeholder-gray-500 transition-all duration-200',
              'focus:outline-none focus:ring-1',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-dark-700 focus:border-brand-500 focus:ring-brand-500',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';