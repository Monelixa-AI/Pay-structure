import { supabaseAdmin } from '@/lib/supabase/admin';
import ContactsTable from './components/ContactsTable';
import { MessageSquare, Clock, CheckCircle, Archive } from 'lucide-react';

async function getMessages() {
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }

  return data || [];
}

async function getMessageStats() {
  const { count: total } = await supabaseAdmin
    .from('contact_messages')
    .select('*', { count: 'exact', head: true });

  const { count: newCount } = await supabaseAdmin
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  const { count: repliedCount } = await supabaseAdmin
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'replied');

  const { count: archivedCount } = await supabaseAdmin
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'archived');

  return {
    total: total || 0,
    newCount: newCount || 0,
    repliedCount: repliedCount || 0,
    archivedCount: archivedCount || 0,
  };
}

export default async function ContactsPage() {
  const [messages, stats] = await Promise.all([getMessages(), getMessageStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-500/20 rounded-xl">
          <MessageSquare className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-gray-400 mt-1">Review and reply to contact forms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.newCount}</p>
              <p className="text-sm text-gray-500">New</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.repliedCount}</p>
              <p className="text-sm text-gray-500">Replied</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <Archive className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.archivedCount}</p>
              <p className="text-sm text-gray-500">Archived</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <ContactsTable messages={messages} />
      </div>
    </div>
  );
}
