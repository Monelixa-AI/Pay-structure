'use client';

import { useState } from 'react';
import { DataTable, Column, Badge, Modal } from '@/components/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailLog {
  id: string;
  type: string;
  to_email: string;
  subject: string;
  status: 'sent' | 'failed';
  message_id?: string;
  error?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  created_at: string;
}

interface EmailLogsTableProps {
  logs: EmailLog[];
}

export default function EmailLogsTable({ logs }: EmailLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [isResending, setIsResending] = useState(false);

  const typeLabels: Record<string, string> = {
    welcome: 'Welcome',
    payment_success: 'Payment success',
    payment_failed: 'Payment failed',
    subscription_created: 'Subscription created',
    subscription_cancelled: 'Subscription cancelled',
    subscription_renewal: 'Subscription renewal',
    password_reset: 'Password reset',
    contact_form: 'Contact form',
    contact_reply: 'Contact reply',
    custom: 'Custom',
    test: 'Test',
  };

  const typeColors: Record<string, string> = {
    welcome: 'bg-blue-500/20 text-blue-400',
    payment_success: 'bg-green-500/20 text-green-400',
    payment_failed: 'bg-red-500/20 text-red-400',
    subscription_created: 'bg-purple-500/20 text-purple-400',
    subscription_cancelled: 'bg-orange-500/20 text-orange-400',
    subscription_renewal: 'bg-cyan-500/20 text-cyan-400',
    password_reset: 'bg-yellow-500/20 text-yellow-400',
    contact_form: 'bg-pink-500/20 text-pink-400',
    contact_reply: 'bg-indigo-500/20 text-indigo-400',
    custom: 'bg-gray-500/20 text-gray-400',
    test: 'bg-dark-600 text-gray-300',
  };

  const handleResend = async (log: EmailLog) => {
    setIsResending(true);
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: log.to_email,
          subject: log.subject,
          html: '<p>This email was re-sent.</p>',
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      toast.success('Email re-sent');
    } catch (error: any) {
      toast.error(error.message || 'Resend failed');
    } finally {
      setIsResending(false);
    }
  };

  const columns: Column<EmailLog>[] = [
    {
      key: 'type',
      label: 'Type',
      render: (log) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            typeColors[log.type] || typeColors.custom
          }`}
        >
          {typeLabels[log.type] || log.type}
        </span>
      ),
    },
    {
      key: 'to_email',
      label: 'Recipient',
      render: (log) => <span className="text-white">{log.to_email}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (log) => (
        <span className="text-gray-300 truncate max-w-[200px] block">
          {log.subject}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (log) => (
        <Badge variant={log.status === 'sent' ? 'success' : 'error'}>
          {log.status === 'sent' ? 'Sent' : 'Failed'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (log) => (
        <div>
          <p className="text-gray-400 text-sm">{formatRelativeTime(log.created_at)}</p>
          <p className="text-gray-500 text-xs">{formatDate(log.created_at, true)}</p>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={logs}
        keyField="id"
        searchPlaceholder="Search email..."
        emptyMessage="No emails sent yet."
        actions={(log) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLog(log)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              title="Details"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
            {log.status === 'failed' && (
              <button
                onClick={() => handleResend(log)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                title="Resend"
                disabled={isResending}
              >
                <RefreshCw
                  className={`w-4 h-4 text-gray-400 ${isResending ? 'animate-spin' : ''}`}
                />
              </button>
            )}
          </div>
        )}
      />

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Email details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Type</label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    typeColors[selectedLog.type] || typeColors.custom
                  }`}
                >
                  {typeLabels[selectedLog.type] || selectedLog.type}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                <Badge variant={selectedLog.status === 'sent' ? 'success' : 'error'}>
                  {selectedLog.status === 'sent' ? 'Sent' : 'Failed'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Recipient</label>
              <p className="text-white">{selectedLog.to_email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Subject</label>
              <p className="text-white">{selectedLog.subject}</p>
            </div>
            {selectedLog.message_id && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Message ID</label>
                <p className="text-gray-300 font-mono text-sm">{selectedLog.message_id}</p>
              </div>
            )}
            {selectedLog.error && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Error</label>
                <p className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">
                  {selectedLog.error}
                </p>
              </div>
            )}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">Metadata</label>
                <pre className="text-gray-300 bg-dark-800 p-3 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Created</label>
                <p className="text-gray-300 text-sm">{formatDate(selectedLog.created_at, true)}</p>
              </div>
              {selectedLog.sent_at && (
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Sent</label>
                  <p className="text-gray-300 text-sm">{formatDate(selectedLog.sent_at, true)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
