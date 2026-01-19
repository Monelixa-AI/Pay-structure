'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input, Button, Card } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || 'Bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">E-posta Gonderildi!</h1>
          <p className="text-gray-400 mb-6">
            Sifre sifirlama baglantisi{' '}
            <strong className="text-white">{email}</strong> adresine gonderildi.
            Lutfen e-postanizi kontrol edin.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Giris sayfasina don
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              <span className="text-brand-500">M</span>onelixa
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Sifrenizi sifirlayin</p>
        </div>

        <Card className="p-8">
          <p className="text-gray-400 text-sm mb-6">
            E-posta adresinizi girin, size sifre sifirlama baglantisi gonderelim.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sifre Sifirlama Baglantisi Gonder
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Giris sayfasina don
          </Link>
        </p>
      </div>
    </div>
  );
}
