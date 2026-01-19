'use client';

import { useState, useEffect } from 'react';
import { Card, Select, Switch, Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import type { SettingsMap } from '@/types';

interface PaymentSettingsFormProps {
  settings: SettingsMap;
}

const providerOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paytr', label: 'PayTR' },
];

export default function PaymentSettingsForm({ settings }: PaymentSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [appUrl, setAppUrl] = useState('');
  const [formData, setFormData] = useState({
    default_payment_provider: settings.default_payment_provider || 'stripe',
    stripe_enabled: settings.stripe_enabled === 'true',
    paytr_enabled: settings.paytr_enabled === 'true',
    allow_provider_switch: settings.allow_provider_switch === 'true',
  });

  useEffect(() => {
    setAppUrl(process.env.NEXT_PUBLIC_APP_URL || window.location.origin);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success('Odeme ayarlari kaydedildi!');
    } catch (error: any) {
      toast.error(error.message || 'Bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Genel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Varsayilan Odeme Saglayici"
            options={providerOptions}
            value={formData.default_payment_provider}
            onChange={(e) =>
              setFormData({
                ...formData,
                default_payment_provider: e.target.value,
              })
            }
          />
          <div className="flex items-center">
            <Switch
              checked={formData.allow_provider_switch}
              onChange={(checked) =>
                setFormData({ ...formData, allow_provider_switch: checked })
              }
              label="Saglayici Secimine Izin Ver"
              description="Kullanici odeme saglayicisi secsin"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Stripe</h3>
        <div className="space-y-4">
          <Switch
            checked={formData.stripe_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, stripe_enabled: checked })
            }
            label="Stripe Aktif"
            description="Stripe ile odeme al"
          />
          <Input
            label="Stripe Webhook URL"
            value={`${appUrl}/api/webhooks/stripe`}
            readOnly
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">PayTR</h3>
        <div className="space-y-4">
          <Switch
            checked={formData.paytr_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, paytr_enabled: checked })
            }
            label="PayTR Aktif"
            description="PayTR ile odeme al"
          />
          <Input
            label="PayTR Bildirim URL"
            value={`${appUrl}/api/webhooks/paytr`}
            readOnly
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Ayarlari Kaydet
        </Button>
      </div>
    </form>
  );
}
