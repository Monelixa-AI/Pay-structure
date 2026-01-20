import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import ContactReplyForm from './components/ContactReplyForm';
import { ArrowLeft, Mail, User, MessageSquare, Clock } from 'lucide-react';

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

async function getContact(id: string) {
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contact = await getContact(params.id);

  if (!contact) {
    notFound();
  }

  if (contact.status === 'new') {
    await supabaseAdmin
      .from('contact_messages')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', contact.id);
    contact.status = 'read';
  }

  const statusLabel = statusLabels[contact.status] || contact.status;
  const statusVariant = statusVariants[contact.status] || 'default';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contacts"
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Message Detail</h1>
            <p className="text-gray-400 mt-1">
              {formatDate(contact.created_at, true)}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-400" />
              Message
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Subject
                </p>
                <p className="text-white">{contact.subject || '(no subject)'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Message
                </p>
                <p className="text-gray-200 whitespace-pre-wrap">
                  {contact.message}
                </p>
              </div>
            </div>
          </Card>

          {contact.reply_message ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Reply
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Sent at: {contact.replied_at ? formatDate(contact.replied_at, true) : '-'}
                </p>
                <p className="text-gray-200 whitespace-pre-wrap">
                  {contact.reply_message}
                </p>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Sender
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="text-white">{contact.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="text-white">{contact.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <a href={`mailto:${contact.email}`}>
                <Button variant="secondary" size="sm" className="w-full">
                  Reply via Email
                </Button>
              </a>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Timeline
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white">Created</p>
                <p>{formatDate(contact.created_at, true)}</p>
              </div>
              {contact.replied_at ? (
                <div>
                  <p className="text-white">Replied</p>
                  <p>{formatDate(contact.replied_at, true)}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              Send Reply
            </h3>
            <ContactReplyForm
              contactId={contact.id}
              contactEmail={contact.email}
              originalSubject={contact.subject || ''}
              originalMessage={contact.message || ''}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
