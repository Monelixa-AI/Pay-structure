'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card } from '@/components/ui';
import { SecurityBadges } from '@/components/SecurityBadges';
import {
  Mail,
  Lock,
  Shield,
  AlertCircle,
  Chrome,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempSession, setTempSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    if (error === 'unauthorized') {
      toast.error('Bu sayfaya erişim yetkiniz yok.');
    }
  }, [error]);

  // ─────────────────────────────────────────────────────────────────
  // Email/Password Login
  // ─────────────────────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Admin kontrolü
      const response = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });
      const result = await response.json();

      if (!result.isAdmin) {
        await supabase.auth.signOut();
        setErrors({ email: 'Bu hesap admin yetkisine sahip değil.' });
        setIsLoading(false);
        return;
      }

      // 2FA kontrolü
      if (result.twoFactorEnabled) {
        setTempSession(data);
        setShow2FA(true);
        setIsLoading(false);
        return;
      }

      // 2FA yoksa direkt yönlendir
      toast.success('Giriş başarılı!');
      router.push(redirect);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ password: 'E-posta veya şifre hatalı.' });
      } else {
        toast.error('Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // 2FA Verification
  // ─────────────────────────────────────────────────────────────────
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempSession.user.id,
          code: formData.twoFactorCode,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        setErrors({ twoFactorCode: 'Geçersiz doğrulama kodu.' });
        setIsLoading(false);
        return;
      }

      toast.success('Giriş başarılı!');
      router.push(redirect);
    } catch (error) {
      toast.error('Doğrulama yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Google Login
  // ─────────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?redirect=${redirect}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error('Google ile giriş yapılırken bir hata oluştu.');
      setIsGoogleLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render 2FA Form
  // ─────────────────────────────────────────────────────────────────
  if (show2FA) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                İki Faktörlü Doğrulama
              </h1>
              <p className="text-gray-400 mt-2">
                Authenticator uygulamanızdaki 6 haneli kodu girin.
              </p>
            </div>
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <Input
                label="Doğrulama Kodu"
                placeholder="000000"
                value={formData.twoFactorCode}
                onChange={(e) =>
                  setFormData({ ...formData, twoFactorCode: e.target.value })
                }
                error={errors.twoFactorCode}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
              <Button type="submit" isLoading={isLoading} className="w-full">
                Doğrula ve Giriş Yap
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShow2FA(false);
                  setTempSession(null);
                  supabase.auth.signOut();
                }}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                ← Geri Dön
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Render Login Form
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Monelixa</h1>
          <p className="text-gray-400 mt-2">Admin Paneline Giriş</p>
        </div>

        <Card className="p-8">
          {/* Google Login */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            isLoading={isGoogleLoading}
            className="w-full mb-6"
            leftIcon={<Chrome className="w-5 h-5" />}
          >
            Google ile Giriş Yap
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-900 text-gray-500">veya</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              placeholder="admin@monelixa.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />
            <Input
              label="Şifre"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Giriş Yap
            </Button>
          </form>
        </Card>

        {/* Security Info */}
        <div className="mt-6">
          <SecurityBadges variant="compact" />
        </div>

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-dark-900/50 border border-dark-700 rounded-lg"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-400">
              <p className="font-medium text-yellow-500 mb-1">Güvenlik Uyarısı</p>
              <p>
                Bu alan sadece yetkili yöneticiler içindir. Tüm giriş
                denemeleri kayıt altına alınmaktadır.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}