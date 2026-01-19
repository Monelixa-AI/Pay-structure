'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 bg-dark-900 border rounded-lg text-white',
            'placeholder-gray-500 transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-1',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-dark-700 focus:border-brand-500 focus:ring-brand-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          rows={4}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
