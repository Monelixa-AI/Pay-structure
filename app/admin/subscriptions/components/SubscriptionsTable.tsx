'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Column, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface SubscriptionsTableProps {
  subscriptions: any[];
}

export default function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
  const router = useRouter();

  const statusColors: Record<
    string,
    'default' | 'success' | 'error' | 'warning' | 'secondary'
  > = {
    active: 'success',
    cancelled: 'secondary',
    past_due: 'error',
    paused: 'warning',
    trialing: 'default',
    expired: 'secondary',
  };

  const statusLabels: Record<string, string> = {
    active: 'Aktif',
    cancelled: 'Iptal',
    past_due: 'Gecikmis',
    paused: 'Duraklatilmis',
    trialing: 'Deneme',
    expired: 'Suresi Dolmus',
  };

  const columns: Column<any>[] = [
    {
      key: 'customer',
      label: 'Musteri',
      render: (sub) => (
        <div>
          <p className="text-white font-medium">
            {sub.customer?.full_name || sub.customer?.email}
          </p>
          {sub.customer?.full_name && (
            <p className="text-xs text-gray-500">{sub.customer.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Plan',
      render: (sub) => (
        <div>
          <p className="text-white">{sub.product?.name || 'Plan'}</p>
          <p className="text-xs text-gray-500">
            {formatCurrency(sub.product?.price || 0, sub.product?.currency || 'TRY')}
            /{sub.product?.billing_period === 'monthly' ? 'ay' : 'yil'}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (sub) => (
        <div className="flex flex-col gap-1">
          <Badge variant={statusColors[sub.status] || 'default'}>
            {statusLabels[sub.status] || sub.status}
          </Badge>
          {sub.cancel_at_period_end && (
            <span className="text-xs text-yellow-400">
              Donem sonunda iptal
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'current_period_end',
      label: 'Yenileme Tarihi',
      sortable: true,
      render: (sub) => (
        <span className="text-gray-400 text-sm">
          {sub.current_period_end ? formatDate(sub.current_period_end) : '-'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Baslangic',
      sortable: true,
      render: (sub) => (
        <span className="text-gray-400 text-sm">{formatDate(sub.created_at)}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={subscriptions}
      keyField="id"
      searchPlaceholder="Abonelik ara..."
      emptyMessage="Henus abonelik yok."
      actions={(sub) => (
        <button
          onClick={() => router.push(`/admin/subscriptions/${sub.id}`)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-gray-400" />
        </button>
      )}
    />
  );
}
