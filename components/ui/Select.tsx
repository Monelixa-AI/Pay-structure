'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 bg-dark-900 border rounded-lg text-white',
              'appearance-none cursor-pointer transition-all duration-200',
              'focus:outline-none focus:ring-1',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-dark-700 focus:border-brand-500 focus:ring-brand-500',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-dark-900"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
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

Select.displayName = 'Select';
