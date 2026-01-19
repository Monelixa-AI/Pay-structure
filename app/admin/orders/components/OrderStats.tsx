'use client';

import { DollarSign, ShoppingCart, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    revenue: number;
    currency: string;
  };
}

export default function OrderStats({ stats }: OrderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Toplam</p>
          </div>
        </div>
      </div>
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-sm text-gray-500">Tamamlandi</p>
          </div>
        </div>
      </div>
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-gray-500">Bekliyor</p>
          </div>
        </div>
      </div>
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.failed}</p>
            <p className="text-sm text-gray-500">Basarisiz</p>
          </div>
        </div>
      </div>
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(stats.revenue, stats.currency)}
            </p>
            <p className="text-sm text-gray-500">Gelir</p>
          </div>
        </div>
      </div>
    </div>
  );
}
