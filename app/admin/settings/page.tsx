import { getSettings } from '@/lib/supabase/admin';
import GeneralSettingsForm from './components/GeneralSettingsForm';
import { Settings } from 'lucide-react';

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-500/20 rounded-xl">
          <Settings className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Genel Ayarlar</h1>
          <p className="text-gray-400 mt-1">
            Site ayarlarini ve tercihlerini yonetin
          </p>
        </div>
      </div>

      <GeneralSettingsForm settings={settings} />
    </div>
  );
}
