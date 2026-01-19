'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Select, Switch, Button, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';
import type { SiteSettings } from '@/types';

interface GeneralSettingsFormProps {
  settings: SiteSettings;
}

const currencyOptions = [
  { value: 'TRY', label: '\u20ba Turk Lirasi (TRY)' },
  { value: 'USD', label: '$ Amerikan Dolari (USD)' },
  { value: 'EUR', label: '\u20ac Euro (EUR)' },
];

const languageOptions = [
  { value: 'tr', label: 'Turkce' },
  { value: 'en', label: 'English' },
];

export default function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    site_name: settings.site_name || 'Monelixa',
    site_description: settings.site_description || '',
    contact_email: settings.contact_email || '',
    support_email: settings.support_email || '',
    currency: settings.currency || 'TRY',
    language: settings.language || 'tr',
    maintenance_mode: settings.maintenance_mode || false,
    meta_title: settings.meta_title || '',
    meta_description: settings.meta_description || '',
  });

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
      toast.success('Ayarlar kaydedildi!');
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
        <h3 className="text-lg font-semibold text-white mb-6">Site Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Site Adi"
            value={formData.site_name}
            onChange={(e) =>
              setFormData({ ...formData, site_name: e.target.value })
            }
            placeholder="Monelixa"
          />
          <Select
            label="Varsayilan Dil"
            options={languageOptions}
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
          />
          <div className="md:col-span-2">
            <Textarea
              label="Site Aciklamasi"
              value={formData.site_description}
              onChange={(e) =>
                setFormData({ ...formData, site_description: e.target.value })
              }
              placeholder="Siteniz hakkinda kisa bir aciklama..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Iletisim Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Iletisim E-postasi"
            type="email"
            value={formData.contact_email}
            onChange={(e) =>
              setFormData({ ...formData, contact_email: e.target.value })
            }
            placeholder="info@monelixa.com"
          />
          <Input
            label="Destek E-postasi"
            type="email"
            value={formData.support_email}
            onChange={(e) =>
              setFormData({ ...formData, support_email: e.target.value })
            }
            placeholder="support@monelixa.com"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Odeme Ayarlari</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Varsayilan Para Birimi"
            options={currencyOptions}
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">SEO Ayarlari</h3>
        <div className="space-y-6">
          <Input
            label="Meta Baslik"
            value={formData.meta_title}
            onChange={(e) =>
              setFormData({ ...formData, meta_title: e.target.value })
            }
            placeholder="Monelixa - Dijital Abonelik Platformu"
            helperText="Arama motorlarinda gorunen baslik (50-60 karakter)"
          />
          <Textarea
            label="Meta Aciklama"
            value={formData.meta_description}
            onChange={(e) =>
              setFormData({ ...formData, meta_description: e.target.value })
            }
            placeholder="Guvenli ve kolay abonelik yonetimi..."
            rows={3}
            helperText="Arama motorlarinda gorunen aciklama (150-160 karakter)"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Bakim Modu</h3>
        <Switch
          checked={formData.maintenance_mode}
          onChange={(checked) =>
            setFormData({ ...formData, maintenance_mode: checked })
          }
          label="Bakim Modunu Aktiflestir"
          description="Aktif oldugunda, ziyaretciler bakim sayfasi gorecektir. Admin erisimi etkilenmez."
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Ayarlari Kaydet
        </Button>
      </div>
    </form>
  );
}
