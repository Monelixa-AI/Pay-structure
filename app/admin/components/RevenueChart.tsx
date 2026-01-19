'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import type { ChartData } from '@/types';

interface RevenueChartProps {
  data: ChartData[];
}

type Period = '7d' | '30d' | '90d';

export default function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<Period>('30d');
  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7 Gün' },
    { value: '30d', label: '30 Gün' },
    { value: '90d', label: '90 Gün' },
  ];

  // Filter data based on period
  const filteredData = (() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return data.slice(-days);
  })();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-white font-semibold">
            {formatCurrency(payload[0].value, 'TRY')}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-dark-900 border border-dark-700 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Gelir Grafiği</h3>
          <p className="text-sm text-gray-400 mt-1">Zaman bazlı gelir analizi</p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-dark-800 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-all',
                period === p.value
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `\u20ba${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
