'use client';

import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface PricingCardProps {
  product: Product;
  featured?: boolean;
}

export default function PricingCard({ product, featured }: PricingCardProps) {
  const features =
    product.features?.length > 0
      ? product.features.slice(0, 5)
      : ['Tanimli urun haklari', 'Email bildirimi', '7/24 destek'];

  return (
    <div
      className={`p-6 rounded-2xl border ${
        featured
          ? 'border-brand-500/50 bg-dark-900 shadow-brand'
          : 'border-dark-700 bg-dark-900'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        {product.is_featured && <Badge variant="warning">One Cikan</Badge>}
      </div>

      <p className="text-sm text-gray-400 mb-6">
        {product.description || 'Plan detaylari yakinda eklenecek.'}
      </p>

      <div className="flex items-end gap-2 mb-6">
        <span className="text-3xl font-bold text-white">
          {formatCurrency(product.price, product.currency)}
        </span>
        {product.type === 'subscription' && (
          <span className="text-sm text-gray-500">
            /{product.billing_period === 'yearly' ? 'yil' : 'ay'}
          </span>
        )}
      </div>

      <Link href={`/checkout/${product.id}`}>
        <Button className="w-full" variant={featured ? 'primary' : 'secondary'}>
          Satin Al
        </Button>
      </Link>

      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="mt-0.5 p-1 rounded-full bg-green-500/10">
              <Check className="w-3 h-3 text-green-400" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
