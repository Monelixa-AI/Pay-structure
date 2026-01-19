'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Button, Card } from '@/components/ui';
import { Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (!accessToken) {
      toast.error('Gecersiz veya suresi dolmus baglanti');
      router.push('/forgot-password');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Sifreler eslesmiyor');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Sifre en az 8 karakter olmalidir');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          <h1 className="text-2xl font-bold text-white mb-2">Sifre Guncellendi!</h1>
          <p className="text-gray-400 mb-6">
            Sifreniz basariyla guncellendi. Giris sayfasina yonlendiriliyorsunuz...
          </p>
          <Link href="/login" className="text-brand-400 hover:text-brand-300">
            Hemen giris yap
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
          <p className="text-gray-400 mt-2">Yeni sifrenizi belirleyin</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Yeni Sifre"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Yeni Sifre (Tekrar)"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <p className="text-xs text-gray-400">Sifreniz en az 8 karakter olmalidir.</p>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sifreyi Guncelle
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
