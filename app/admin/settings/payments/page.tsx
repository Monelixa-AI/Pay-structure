import { getSettings } from '@/lib/supabase/admin';
import PaymentSettingsForm from './components/PaymentSettingsForm';
import { CreditCard } from 'lucide-react';

export default async function PaymentSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-500/20 rounded-xl">
          <CreditCard className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Odeme Ayarlari</h1>
          <p className="text-gray-400 mt-1">
            Odeme saglayicilarini ve secenekleri yonetin
          </p>
        </div>
      </div>

      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
