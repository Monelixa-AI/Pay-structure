'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconColor?: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconColor = 'text-brand-500',
  delay = 0,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!change || change === 0) return <Minus className="w-4 h-4" />;
    return change > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getTrendColor = () => {
    if (!change || change === 0) return 'text-gray-400';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-dark-600 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>

          {typeof change !== 'undefined' && (
            <div
              className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}
            >
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-dark-800', iconColor)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}