import { getSettings } from '@/lib/supabase/admin';
import EmailSettingsForm from './components/EmailSettingsForm';
import { Mail } from 'lucide-react';

export default async function EmailSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Mail className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Email Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure sender details and notifications.
          </p>
        </div>
      </div>
      <EmailSettingsForm settings={settings} />
    </div>
  );
}
