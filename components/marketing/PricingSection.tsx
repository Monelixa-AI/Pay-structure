'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/types';
import PricingToggle from './PricingToggle';
import PricingCard from './PricingCard';

interface PricingSectionProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function PricingSection({
  products,
  title = 'Fiyatlandirma',
  subtitle = 'Size uygun planlari karsilastirin.',
}: PricingSectionProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const visibleProducts = useMemo(() => {
    const subscriptions = products.filter((product) => product.type === 'subscription');
    if (subscriptions.length === 0) return products;
    const filtered = subscriptions.filter(
      (product) => product.billing_period === period
    );
    return filtered.length > 0 ? filtered : subscriptions;
  }, [products, period]);

  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 mt-3">{subtitle}</p>
        </div>
        <div className="flex items-center justify-center mb-10">
          <PricingToggle value={period} onChange={setPeriod} />
        </div>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product, index) => (
              <PricingCard
                key={product.id}
                product={product}
                featured={index === 1 || product.is_featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            Henuz plan eklenmemis.
          </div>
        )}
      </div>
    </section>
  );
}
