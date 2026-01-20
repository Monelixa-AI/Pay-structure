import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import EmailTemplateForm from '../components/EmailTemplateForm';
import { ArrowLeft } from 'lucide-react';
import type { EmailTemplate } from '@/types';

async function getTemplate(id: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as EmailTemplate;
}

export default async function EmailTemplateEditPage({
  params,
}: {
  params: { id: string };
}) {
  const template = await getTemplate(params.id);
  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/email-templates"
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Template</h1>
          <p className="text-gray-400 mt-1">{template.name}</p>
        </div>
      </div>
      <EmailTemplateForm template={template} />
    </div>
  );
}
