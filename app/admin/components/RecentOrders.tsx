'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-dark-900 border border-dark-700 rounded-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-dark-700">
        <div>
          <h3 className="text-lg font-semibold text-white">Son Siparişler</h3>
          <p className="text-sm text-gray-400 mt-1">
            En son gelen {orders.length} sipariş
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          Tümünü Gör
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-dark-700">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Henüz sipariş bulunmuyor.
          </div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-400">
                    {order.customer?.full_name?.[0] || '#'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white">
                    {order.customer?.full_name || 'Anonim'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.product?.name || 'Ürün'} •{' '}
                    {formatRelativeTime(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-white">
                  {formatCurrency(order.amount, order.currency)}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
