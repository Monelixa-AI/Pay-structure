import { supabaseAdmin } from '@/lib/supabase/admin';
import EmailLogsTable from './components/EmailLogsTable';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

async function getEmailLogs() {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }

  return data || [];
}

async function getEmailStats() {
  const { count: total } = await supabaseAdmin
    .from('email_logs')
    .select('*', { count: 'exact', head: true });

  const { count: sent } = await supabaseAdmin
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent');

  const { count: failed } = await supabaseAdmin
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  const { count: pending } = await supabaseAdmin
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .is('sent_at', null)
    .eq('status', 'sent');

  return {
    total: total || 0,
    sent: sent || 0,
    failed: failed || 0,
    pending: pending || 0,
  };
}

export default async function EmailLogsPage() {
  const [logs, stats] = await Promise.all([getEmailLogs(), getEmailStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Mail className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Email Logs</h1>
          <p className="text-gray-400 mt-1">
            Track all outgoing email activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.sent}</p>
              <p className="text-sm text-gray-500">Sent</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <EmailLogsTable logs={logs} />
      </div>
    </div>
  );
}
