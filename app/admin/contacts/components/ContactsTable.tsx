'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Badge, type Column } from '@/components/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived' | string;
  created_at: string;
  replied_at: string | null;
}

interface ContactsTableProps {
  messages: ContactMessage[];
}

const statusLabels: Record<string, string> = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  new: 'warning',
  read: 'info',
  replied: 'success',
  archived: 'secondary',
};

export default function ContactsTable({ messages }: ContactsTableProps) {
  const router = useRouter();

  const columns: Column<ContactMessage>[] = [
    {
      key: 'name',
      label: 'Sender',
      render: (item) => (
        <div>
          <p className="text-white font-medium">{item.name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (item) => (
        <div className="max-w-[320px]">
          <p className="text-gray-200">{item.subject || '(no subject)'}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{item.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={statusVariants[item.status] || 'default'}>
          {statusLabels[item.status] || item.status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Received',
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-gray-300 text-sm">{formatRelativeTime(item.created_at)}</p>
          <p className="text-xs text-gray-500">{formatDate(item.created_at, true)}</p>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={messages}
      keyField="id"
      searchPlaceholder="Search messages..."
      emptyMessage="No messages yet."
      onRowClick={(item) => router.push(`/admin/contacts/${item.id}`)}
      actions={(item) => (
        <button
          onClick={() => router.push(`/admin/contacts/${item.id}`)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          title="View"
        >
          <Eye className="w-4 h-4 text-gray-400" />
        </button>
      )}
    />
  );
}
