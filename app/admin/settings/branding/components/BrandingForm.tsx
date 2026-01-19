'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, FileUpload, Input } from '@/components/ui';
import { Logo, LogoIcon } from '@/components/Logo';
import toast from 'react-hot-toast';
import type { SiteSettings } from '@/types';

interface BrandingFormProps {
  settings: SiteSettings;
}

export default function BrandingForm({ settings }: BrandingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    logo_url: settings.logo_url || null,
    logo_dark_url: settings.logo_dark_url || null,
    favicon_url: settings.favicon_url || null,
    primary_color: settings.primary_color || '#ef4444',
    secondary_color: settings.secondary_color || '#f97316',
  });

  const handleLogoUpload = async (
    file: File,
    type: 'logo' | 'logo_dark' | 'favicon'
  ): Promise<string | null> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', 'branding');
    uploadFormData.append('folder', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      const result = await response.json();
      if (result.success) {
        const key = type === 'logo' ? 'logo_url' :
                    type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
        setFormData((prev) => ({ ...prev, [key]: result.url }));
        return result.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      toast.success('Marka ayarlari kaydedildi!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Onizleme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
              Acik Tema
            </p>
            <Logo
              size="lg"
              logoUrl={formData.logo_url}
              logoDarkUrl={formData.logo_dark_url}
            />
          </div>
          <div className="p-6 bg-dark-950 rounded-xl border border-dark-700">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
              Koyu Tema
            </p>
            <Logo
              size="lg"
              variant="dark"
              logoUrl={formData.logo_url}
              logoDarkUrl={formData.logo_dark_url}
            />
          </div>
          <div className="p-6 bg-dark-800 rounded-xl flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">
              Favicon
            </p>
            <LogoIcon size="lg" faviconUrl={formData.favicon_url} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Ana Logo</h3>
          <FileUpload
            accept="image/*"
            maxSize={2}
            currentImage={formData.logo_url}
            onUpload={(file) => handleLogoUpload(file, 'logo')}
            onRemove={() => setFormData({ ...formData, logo_url: null })}
            aspectRatio="video"
            helperText="Onerilen: 280x80px, PNG/SVG"
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Koyu Tema Logosu
          </h3>
          <FileUpload
            accept="image/*"
            maxSize={2}
            currentImage={formData.logo_dark_url}
            onUpload={(file) => handleLogoUpload(file, 'logo_dark')}
            onRemove={() => setFormData({ ...formData, logo_dark_url: null })}
            aspectRatio="video"
            helperText="Acik renkli logo (koyu arka plan icin)"
          />
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Favicon</h3>
          <FileUpload
            accept="image/*"
            maxSize={1}
            currentImage={formData.favicon_url}
            onUpload={(file) => handleLogoUpload(file, 'favicon')}
            onRemove={() => setFormData({ ...formData, favicon_url: null })}
            aspectRatio="square"
            helperText="Onerilen: 32x32px veya 64x64px"
          />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Marka Renkleri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ana Renk (Primary)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData({ ...formData, primary_color: e.target.value })
                }
                className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
              />
              <Input
                value={formData.primary_color}
                onChange={(e) =>
                  setFormData({ ...formData, primary_color: e.target.value })
                }
                placeholder="#ef4444"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ikincil Renk (Secondary)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData({ ...formData, secondary_color: e.target.value })
                }
                className="w-12 h-12 rounded-lg cursor-pointer border border-dark-600"
              />
              <Input
                value={formData.secondary_color}
                onChange={(e) =>
                  setFormData({ ...formData, secondary_color: e.target.value })
                }
                placeholder="#f97316"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-dark-800 rounded-xl">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
            Renk Onizleme
          </p>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-10 rounded-lg"
              style={{
                background: `linear-gradient(to right, ${formData.primary_color}, ${formData.secondary_color})`,
              }}
            />
            <Button size="sm" style={{ backgroundColor: formData.primary_color }}>
              Ornek Buton
            </Button>
            <span
              className="text-sm font-medium"
              style={{ color: formData.primary_color }}
            >
              Ornek Metin
            </span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Degisiklikleri Kaydet
        </Button>
      </div>
    </form>
  );
}
