'use client';

import { cn } from '@/lib/utils';

interface PricingToggleProps {
  value: 'monthly' | 'yearly';
  onChange: (value: 'monthly' | 'yearly') => void;
}

export default function PricingToggle({ value, onChange }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-full p-1">
      {(['monthly', 'yearly'] as const).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            'px-4 py-2 text-sm rounded-full transition-colors',
            value === period
              ? 'bg-brand-500 text-white'
              : 'text-gray-400 hover:text-white'
          )}
          type="button"
        >
          {period === 'monthly' ? 'Aylik' : 'Yillik'}
        </button>
      ))}
    </div>
  );
}
