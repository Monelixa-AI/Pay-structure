import { supabaseAdmin } from '@/lib/supabase/admin';
import EmailTemplatesTable from './components/EmailTemplatesTable';
import { Mail } from 'lucide-react';
import type { EmailTemplate } from '@/types';

async function getTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Email templates fetch error:', error);
    return [];
  }

  return (data || []) as EmailTemplate[];
}

export default async function EmailTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-500/20 rounded-xl">
          <Mail className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          <p className="text-gray-400 mt-1">
            Manage email subjects and HTML templates.
          </p>
        </div>
      </div>
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <EmailTemplatesTable templates={templates} />
      </div>
    </div>
  );
}
