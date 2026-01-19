'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Setup2FAPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // ─────────────────────────────────────────────────────────────────
  // Generate 2FA Secret
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    generateSecret();
  }, []);

  const generateSecret = async () => {
    try {
      const response = await fetch('/api/auth/generate-2fa', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
      } else {
        toast.error('2FA oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      toast.error('Bir hata oluştu.');
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Copy Secret
  // ─────────────────────────────────────────────────────────────────
  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Kod kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────
  // Verify and Enable
  // ─────────────────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/enable-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          code: verificationCode,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setStep(3);
        toast.success('2FA başarıyla etkinleştirildi!');
      } else {
        setError('Geçersiz doğrulama kodu. Tekrar deneyin.');
      }
    } catch (error) {
      toast.error('Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            İki Faktörlü Doğrulama Kurulumu
          </h1>
          <p className="text-gray-400 mt-2">
            Hesabınızı daha güvenli hale getirin
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    step >= s
                      ? 'bg-brand-500 text-white'
                      : 'bg-dark-800 text-gray-500'
                  }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-0.5 mx-1
                    ${step > s ? 'bg-brand-500' : 'bg-dark-700'}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Step 1: Scan QR Code */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white mb-2">
                  1. QR Kodunu Tarayın
                </h2>
                <p className="text-sm text-gray-400">
                  Google Authenticator, Authy veya benzeri bir uygulama kullanarak
                  aşağıdaki QR kodunu tarayın.
                </p>
              </div>
              {qrCode && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  veya bu kodu manuel girin:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-dark-800 rounded-lg text-brand-400 font-mono text-sm">
                    {secret}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copySecret}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Devam Et
              </Button>
            </motion.div>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white mb-2">
                  2. Doğrulama Kodunu Girin
                </h2>
                <p className="text-sm text-gray-400">
                  Authenticator uygulamanızda görünen 6 haneli kodu girin.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <Input
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  error={error}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    Doğrula
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  2FA Başarıyla Etkinleştirildi!
                </h2>
                <p className="text-gray-400">
                  Hesabınız artık iki faktörlü doğrulama ile korunuyor.
                </p>
              </div>
              {/* Warning */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-left">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500 mb-1">Önemli!</p>
                    <p className="text-yellow-500/80">
                      Authenticator uygulamanıza erişimi kaybederseniz hesabınıza
                      giriş yapamayabilirsiniz. Yedek kodlarınızı güvenli bir
                      yerde saklayın.
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => router.push('/admin')} className="w-full">
                Admin Paneline Git
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}