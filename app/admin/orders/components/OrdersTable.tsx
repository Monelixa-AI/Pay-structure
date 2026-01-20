'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Column } from '@/components/ui';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Eye } from 'lucide-react';
import type { Order } from '@/types';

interface OrdersTableProps {
  orders: Order[];
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();

  const columns: Column<Order>[] = [
    {
      key: 'created_at',
      label: 'Tarih',
      sortable: true,
      render: (order) => (
        <span className="text-gray-400 text-sm">
          {formatDate(order.created_at, true)}
        </span>
      ),
    },
    {
      key: 'customer_email',
      label: 'Musteri',
      render: (order) => (
        <div>
          <p className="text-white font-medium">
            {order.customer?.full_name || order.metadata?.customer_name || 'Musteri'}
          </p>
          <p className="text-xs text-gray-500">
            {order.customer?.email || order.customer_email || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'product_id',
      label: 'Urun',
      render: (order) => (
        <span className="text-white">
          {order.product?.name || order.product_id?.slice(0, 8) || '-'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Tutar',
      sortable: true,
      render: (order) => (
        <span className="font-medium text-white">
          {formatCurrency(order.amount, order.currency)}
        </span>
      ),
    },
    {
      key: 'payment_provider',
      label: 'Saglayici',
      render: (order) => (
        <span className="text-gray-400 text-sm uppercase">
          {order.payment_provider}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Durum',
      render: (order) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      keyField="id"
      searchPlaceholder="Siparis ara..."
      emptyMessage="Henus siparis yok."
      actions={(order) => (
        <button
          onClick={() => router.push(`/admin/orders/${order.id}`)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-gray-400" />
        </button>
      )}
    />
  );
}
