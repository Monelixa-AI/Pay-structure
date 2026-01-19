'use client';

import { useState } from 'react';
import { Card, Input, Switch, Button } from '@/components/ui';
import toast from 'react-hot-toast';
import type { SettingsMap } from '@/types';

interface EmailSettingsFormProps {
  settings: SettingsMap;
}

export default function EmailSettingsForm({ settings }: EmailSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [formData, setFormData] = useState({
    email_enabled: settings.email_enabled !== 'false',
    email_from_name: settings.email_from_name || 'Monelixa',
    email_from_address: settings.email_from_address || '',
    email_reply_to: settings.email_reply_to || '',
    email_welcome_enabled: settings.email_welcome_enabled !== 'false',
    email_payment_enabled: settings.email_payment_enabled !== 'false',
    email_subscription_enabled: settings.email_subscription_enabled !== 'false',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success('Email settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Enter a test email address');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success('Test email sent');
    } catch (error: any) {
      toast.error(error.message || 'Test email failed');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Switch
            checked={formData.email_enabled}
            onChange={(checked) => setFormData({ ...formData, email_enabled: checked })}
            label="Email enabled"
            description="Enable outbound emails"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Sender</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="From name"
            value={formData.email_from_name}
            onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })}
            placeholder="Monelixa"
          />
          <Input
            label="From address"
            type="email"
            value={formData.email_from_address}
            onChange={(e) => setFormData({ ...formData, email_from_address: e.target.value })}
            placeholder="noreply@monelixa.com"
          />
          <Input
            label="Reply-to"
            type="email"
            value={formData.email_reply_to}
            onChange={(e) => setFormData({ ...formData, email_reply_to: e.target.value })}
            placeholder="support@monelixa.com"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Notifications</h3>
        <div className="grid grid-cols-1 gap-4">
          <Switch
            checked={formData.email_welcome_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, email_welcome_enabled: checked })
            }
            label="Welcome email"
            description="Send welcome email after signup"
          />
          <Switch
            checked={formData.email_payment_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, email_payment_enabled: checked })
            }
            label="Payment emails"
            description="Send payment success and failure emails"
          />
          <Switch
            checked={formData.email_subscription_enabled}
            onChange={(checked) =>
              setFormData({ ...formData, email_subscription_enabled: checked })
            }
            label="Subscription emails"
            description="Send subscription lifecycle emails"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Test email</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            label="Recipient"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              isLoading={isTesting}
              onClick={handleTest}
            >
              Send test
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
