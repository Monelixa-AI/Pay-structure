'use client';

import { Product, CURRENCY_SYMBOLS, Currency } from '@/types';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const currencySymbol = CURRENCY_SYMBOLS[product.currency as Currency] || '\u20ba';

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col h-full">
        {/* Product Icon */}
        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-primary-600" />
        </div>
        {/* Product Info */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 flex-grow">
          {product.description || 'Açıklama bulunmuyor.'}
        </p>
        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="text-2xl font-bold text-primary-600">
            {currencySymbol}
            {product.price.toFixed(2)}
          </div>
          <Link
            href={`/checkout/${product.id}`}
            className="btn-primary flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Satın Al</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
