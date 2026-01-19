import { getSettings } from '@/lib/supabase/admin';
import BrandingForm from './components/BrandingForm';
import { Image } from 'lucide-react';

export default async function BrandingPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Image className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Logo ve Marka</h1>
          <p className="text-gray-400 mt-1">
            Sitenizin logosunu ve marka renklerini yonetin
          </p>
        </div>
      </div>

      <BrandingForm settings={settings} />
    </div>
  );
}
