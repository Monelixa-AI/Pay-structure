'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import { ShoppingCart, Star, Clock, Wallet } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const period = product.billing_period === 'monthly' ? 'ay' : 'yil';

  // Sure secenekleri veya sabit sure var mi?
  const hasDurationOptions = product.duration_options && product.duration_options.length > 0;
  const hasFixedDuration = product.subscription_duration && product.subscription_duration > 0;
  const hasDuration = hasDurationOptions || hasFixedDuration;

  // Fiyat gosterimi icin hesaplama
  const getPriceDisplay = () => {
    if (product.type === 'one_time') {
      return {
        price: formatCurrency(product.price, product.currency),
        subtitle: null,
      };
    }

    // Sinirsiz subscription
    if (!hasDuration) {
      return {
        price: formatCurrency(product.price, product.currency),
        subtitle: `/ ${period}`,
      };
    }

    // Sure secenekleri varsa
    if (hasDurationOptions) {
      const minDuration = Math.min(...product.duration_options!);
      const maxDuration = Math.max(...product.duration_options!);
      return {
        price: formatCurrency(product.price, product.currency),
        subtitle: `/ ${period}`,
        durationInfo: `${minDuration}-${maxDuration} ${period} arasi secenekler`,
      };
    }

    // Sabit sureli subscription
    return {
      price: formatCurrency(product.price, product.currency),
      subtitle: `/ ${period}`,
      durationInfo: `${product.subscription_duration} ${period}`,
    };
  };

  const priceDisplay = getPriceDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden hover:border-brand-500/40 hover:shadow-brand transition-all"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-video bg-dark-800">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
              <span className="text-6xl font-bold text-dark-600">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {product.is_featured && (
              <Badge variant="warning">
                <Star className="w-3 h-3 mr-1 fill-current" />
                One Cikan
              </Badge>
            )}
            {product.type === 'subscription' && (
              <Badge variant="default">Abonelik</Badge>
            )}
            {hasDuration && (
              <Badge variant="info">
                <Clock className="w-3 h-3 mr-1" />
                Sureli
              </Badge>
            )}
            {product.allow_payment_mode_choice && (
              <Badge variant="success">
                <Wallet className="w-3 h-3 mr-1" />
                Esnek Odeme
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {product.description || 'Urun aciklamasi bulunmuyor.'}
        </p>

        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {priceDisplay.price}
            </span>
            {priceDisplay.subtitle && (
              <span className="text-gray-500 text-sm">
                {priceDisplay.subtitle}
              </span>
            )}
          </div>
          {priceDisplay.durationInfo && (
            <p className="text-xs text-brand-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {priceDisplay.durationInfo}
            </p>
          )}
        </div>

        {/* Sure secenekleri preview */}
        {hasDurationOptions && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.duration_options!.slice(0, 4).map((duration) => (
              <span
                key={duration}
                className="px-2 py-0.5 bg-dark-800 text-gray-400 text-xs rounded-md"
              >
                {duration} {period}
              </span>
            ))}
            {product.duration_options!.length > 4 && (
              <span className="px-2 py-0.5 bg-dark-800 text-gray-500 text-xs rounded-md">
                +{product.duration_options!.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Detaylar
            </Button>
          </Link>
          <Link href={`/checkout/${product.id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Satin Al
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
