'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Customer } from '@/types';
import { Eye } from 'lucide-react';

interface CustomersTableProps {
  customers: Customer[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  const router = useRouter();

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      label: 'Müşteri',
      sortable: true,
      render: (customer) => (
        <div>
          <p className="text-white font-medium">
            {customer.full_name || 'Müşteri'}
          </p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (customer) => (
        <span className="text-gray-300">{customer.phone || '-'}</span>
      ),
    },
    {
      key: 'stripe_customer_id',
      label: 'Stripe',
      render: (customer) => (
        <Badge variant={customer.stripe_customer_id ? 'success' : 'default'}>
          {customer.stripe_customer_id ? 'Bağlı' : 'Yok'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Kayıt',
      sortable: true,
      render: (customer) => (
        <span className="text-gray-400 text-sm">
          {formatDate(customer.created_at, true)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      keyField="id"
      searchPlaceholder="Müşteri ara..."
      emptyMessage="Henüz müşteri yok."
      onRowClick={(customer) => router.push(`/admin/customers/${customer.id}`)}
      actions={(customer) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/customers/${customer.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
    />
  );
}
