'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Textarea, Switch, Button } from '@/components/ui';
import toast from 'react-hot-toast';
import type { EmailTemplate } from '@/types';

interface EmailTemplateFormProps {
  template: EmailTemplate;
}

export default function EmailTemplateForm({ template }: EmailTemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: template.subject || '',
    body_html: template.body_html || '',
    is_active: template.is_active,
  });

  const variables = Array.isArray(template.variables) ? template.variables : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/email-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.subject,
          body_html: formData.body_html,
          is_active: formData.is_active,
          variables,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      toast.success('Template updated');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Template name" value={template.name} disabled />
          <Switch
            checked={formData.is_active}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, is_active: checked }))
            }
            label="Active"
            description="Template will be used for sending."
          />
        </div>
        <Input
          label="Subject"
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
          placeholder="Subject line"
          required
        />
        <Textarea
          label="HTML body"
          value={formData.body_html}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, body_html: e.target.value }))
          }
          rows={12}
          className="font-mono text-sm"
        />
        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Variables</p>
          {variables.length === 0 ? (
            <p className="text-sm text-gray-500">No variables.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <span
                  key={variable}
                  className="px-2.5 py-1 rounded-full text-xs border border-dark-700 text-gray-300"
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Use variables in subject/body as shown above.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
