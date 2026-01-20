'use client';

import { useRouter } from 'next/navigation';
import { DataTable, Column, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Edit } from 'lucide-react';
import type { EmailTemplate } from '@/types';

interface EmailTemplatesTableProps {
  templates: EmailTemplate[];
}

export default function EmailTemplatesTable({
  templates,
}: EmailTemplatesTableProps) {
  const router = useRouter();

  const columns: Column<EmailTemplate>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (template) => (
        <span className="text-white font-mono text-sm">{template.name}</span>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (template) => (
        <span className="text-gray-300">{template.subject}</span>
      ),
    },
    {
      key: 'variables',
      label: 'Vars',
      render: (template) => (
        <span className="text-gray-400 text-sm">
          {Array.isArray(template.variables) ? template.variables.length : 0}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (template) => (
        <Badge variant={template.is_active ? 'success' : 'error'}>
          {template.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      render: (template) => (
        <span className="text-gray-400 text-sm">
          {formatDate(template.updated_at, true)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={templates}
      keyField="id"
      searchPlaceholder="Search templates..."
      emptyMessage="No templates found."
      onRowClick={(template) => router.push(`/admin/email-templates/${template.id}`)}
      actions={(template) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/email-templates/${template.id}`)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
    />
  );
}
