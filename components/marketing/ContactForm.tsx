'use client';

import { useState } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 bg-dark-900 border border-dark-700 rounded-2xl text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Mesajiniz alindi</h3>
        <p className="text-gray-400 mb-6">
          En kisa surede size geri donecegiz.
        </p>
        <Button
          variant="secondary"
          onClick={() => setIsSuccess(false)}
        >
          Yeni mesaj gonder
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-dark-900 border border-dark-700 rounded-2xl space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ad Soyad"
          placeholder="Adiniz Soyadiniz"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <Input
        label="Konu"
        placeholder="Mesaj konusu"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
      />
      <Textarea
        label="Mesaj"
        placeholder="Mesajinizi yazin..."
        rows={6}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        <Send className="w-4 h-4 mr-2" />
        Mesaj Gonder
      </Button>
    </form>
  );
}
