'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input, Card, Spinner } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { formatCurrency } from '@/lib/utils';
import { Lock, CreditCard, Shield, ChevronRight, Clock, Wallet, RefreshCw, CheckCircle2, ShieldCheck, Globe, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, SubscriptionPaymentMode } from '@/types';
import type { PaymentProvider } from '@/types/payments';

// Stripe Logo - Text based for better rendering
const StripeLogo = ({ className }: { className?: string }) => (
  <span className={`font-bold tracking-tight ${className}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    stripe
  </span>
);

// PayTR Logo - Text based for better rendering
const PayTRLogo = ({ className }: { className?: string }) => (
  <span className={`font-bold tracking-tight ${className}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    PayTR
  </span>
);

// Visa Logo
const VisaLogo = ({ className }: { className?: string }) => (
  <img src="/visa.svg" alt="Visa" className={className} />
);

// Mastercard Logo
const MastercardLogo = ({ className }: { className?: string }) => (
  <img src="/mastercard.svg" alt="Mastercard" className={className} />
);

interface CheckoutPageProps {
  params: { productId: string };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([]);
  const [allowProviderSwitch, setAllowProviderSwitch] = useState(false);

  // Sureli subscription icin state'ler
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<SubscriptionPaymentMode>('recurring');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`/api/products/${params.productId}`);
        const productData = await productRes.json();
        if (!productData.success || !productData.data.is_active) {
          toast.error('Urun bulunamadi');
          router.push('/');
          return;
        }
        const productInfo = productData.data as Product;
        setProduct(productInfo);

        // Varsayilan degerleri ayarla
        if (productInfo.type === 'subscription') {
          // Sure secimi
          if (productInfo.duration_options && productInfo.duration_options.length > 0) {
            setSelectedDuration(productInfo.duration_options[0]);
          } else if (productInfo.subscription_duration) {
            setSelectedDuration(productInfo.subscription_duration);
          }

          // Odeme modu
          setSelectedPaymentMode(productInfo.default_payment_mode || 'recurring');
        }

        const settingsRes = await fetch('/api/settings/payments');
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          const providers: PaymentProvider[] = [];
          if (settingsData.data.stripeEnabled) providers.push('stripe');
          if (settingsData.data.paytrEnabled) providers.push('paytr');
          setAvailableProviders(providers);
          setAllowProviderSwitch(Boolean(settingsData.data.allowProviderSwitch));
          if (providers.length > 0) {
            setSelectedProvider(
              settingsData.data.defaultProvider || providers[0]
            );
          }
        }
      } catch (error) {
        toast.error('Bir hata olustu');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.productId, router]);

  // Fiyat hesaplamasi
  const pricing = useMemo(() => {
    if (!product) return null;

    const basePrice = product.price;
    const period = product.billing_period === 'monthly' ? 'ay' : 'yil';

    // One-time urun
    if (product.type === 'one_time') {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice,
        displayPrice: formatCurrency(basePrice, product.currency),
        subtitle: null,
      };
    }

    // Sinirsiz subscription
    if (!product.subscription_duration && (!product.duration_options || product.duration_options.length === 0)) {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice,
        displayPrice: formatCurrency(basePrice, product.currency),
        subtitle: `/ ${period}`,
        isRecurring: true,
      };
    }

    // Sureli subscription
    const duration = selectedDuration || product.subscription_duration || 1;
    const totalPrice = basePrice * duration;

    if (selectedPaymentMode === 'upfront') {
      // Pesin odeme
      return {
        unitPrice: basePrice,
        totalPrice: totalPrice,
        displayPrice: formatCurrency(totalPrice, product.currency),
        subtitle: `(${duration} ${period} pesin)`,
        duration,
        isRecurring: false,
      };
    } else {
      // Tekrarli odeme
      return {
        unitPrice: basePrice,
        totalPrice: basePrice,
        displayPrice: formatCurrency(basePrice, product.currency),
        subtitle: `/ ${period} (${duration} ${period} boyunca)`,
        duration,
        isRecurring: true,
        totalAmount: totalPrice,
      };
    }
  }, [product, selectedDuration, selectedPaymentMode]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('E-posta adresi gereklidir');
      return;
    }

    setIsProcessing(true);
    try {
      const endpoint =
        selectedProvider === 'stripe'
          ? '/api/checkout/stripe'
          : '/api/checkout/paytr';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          // Sureli subscription parametreleri
          subscriptionDuration: selectedDuration,
          paymentMode: selectedPaymentMode,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      if (selectedProvider === 'stripe' && result.url) {
        window.location.href = result.url;
        return;
      }

      if (selectedProvider === 'paytr' && result.iframeUrl) {
        window.location.href = result.iframeUrl;
        return;
      }

      throw new Error('Invalid response');
    } catch (error: any) {
      toast.error(error.message || 'Odeme baslatilamadi');
      setIsProcessing(false);
    }
  };

  // Sureli subscription icin kullanici secenekleri gosterilecek mi?
  const showDurationOptions = product?.type === 'subscription' &&
    product.duration_options &&
    product.duration_options.length > 0;

  const showPaymentModeOptions = product?.type === 'subscription' &&
    product.allow_payment_mode_choice &&
    (product.subscription_duration || (product.duration_options && product.duration_options.length > 0));

  const hasDuration = product?.type === 'subscription' &&
    (product.subscription_duration || (product.duration_options && product.duration_options.length > 0));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const period = product.billing_period === 'monthly' ? 'ay' : 'yil';

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white">Guvenli Odeme</h1>
          <p className="text-gray-400 mt-2">
            Bilgileriniz 256-bit SSL ile korunmaktadir
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Kolon - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Musteri Bilgileri
              </h2>
              <form onSubmit={handleCheckout} className="space-y-4">
                <Input
                  label="E-posta Adresi"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <Input
                  label="Ad Soyad"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {selectedProvider === 'paytr' && (
                  <Input
                    label="Telefon"
                    type="tel"
                    placeholder="0532 123 4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                )}

                {/* Sure Secimi */}
                {showDurationOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Abonelik Suresi
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {product.duration_options!.map((duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => setSelectedDuration(duration)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedDuration === duration
                              ? 'border-brand-500 bg-brand-500/10'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <p className="text-lg font-bold text-white">{duration}</p>
                          <p className="text-xs text-gray-500">{period}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Odeme Modu Secimi */}
                {showPaymentModeOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Wallet className="w-4 h-4 inline mr-2" />
                      Odeme Sekli
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('recurring')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPaymentMode === 'recurring'
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <RefreshCw className="w-5 h-5 text-brand-400 mb-2" />
                        <p className="text-sm font-medium text-white">Aylik Ode</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Her {period} {formatCurrency(product.price, product.currency)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMode('upfront')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPaymentMode === 'upfront'
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <Wallet className="w-5 h-5 text-green-400 mb-2" />
                        <p className="text-sm font-medium text-white">Pesin Ode</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Toplam {formatCurrency(product.price * (selectedDuration || 1), product.currency)}
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {allowProviderSwitch && availableProviders.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Odeme Yontemi
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableProviders.includes('stripe') && (
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('stripe')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedProvider === 'stripe'
                              ? 'border-brand-500 bg-brand-500/10'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <StripeLogo className="h-6 mx-auto mb-2 text-white" />
                          <p className="text-xs text-gray-500">Uluslararasi</p>
                        </button>
                      )}
                      {availableProviders.includes('paytr') && (
                        <button
                          type="button"
                          onClick={() => setSelectedProvider('paytr')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedProvider === 'paytr'
                              ? 'border-brand-500 bg-brand-500/10'
                              : 'border-dark-600 hover:border-dark-500'
                          }`}
                        >
                          <PayTRLogo className="h-6 mx-auto mb-2 text-white" />
                          <p className="text-xs text-gray-500">Turkiye</p>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6"
                  isLoading={isProcessing}
                  leftIcon={<Lock className="w-5 h-5" />}
                >
                  {isProcessing ? 'Isleniyor...' : 'Odemeye Gec'}
                </Button>
              </form>

              {/* Kart Logolari */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-dark-700">
                <VisaLogo className="h-6 text-gray-500 hover:text-white transition-colors" />
                <MastercardLogo className="h-8" />
                <div className="h-6 w-px bg-dark-600" />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>256-bit SSL</span>
                </div>
              </div>
            </Card>

            {/* Guvenlik Bilgileri Karti */}
            <Card className="p-5 bg-gradient-to-br from-dark-900 to-dark-800 border-dark-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Guvenli Odeme Altyapisi</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Odemeleriniz dunya capinda guvenilen{' '}
                    <span className="text-white font-medium">Stripe</span> ve{' '}
                    <span className="text-white font-medium">PayTR</span> altyapilari uzerinden gerceklestirilmektedir.
                    Kart bilgileriniz bizimle paylasilmaz.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sag Kolon - Siparis Ozeti */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Siparis Ozeti
              </h2>

              <div className="flex gap-4 pb-6 border-b border-dark-700">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-dark-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-dark-500">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  {product.type === 'subscription' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-block px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded-full">
                        {product.billing_period === 'monthly' ? 'Aylik' : 'Yillik'} Abonelik
                      </span>
                      {hasDuration && selectedDuration && (
                        <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {selectedDuration} {period}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="py-6 border-b border-dark-700">
                  <p className="text-sm text-gray-400 mb-3">Dahil Olanlar</p>
                  <ul className="space-y-2">
                    {product.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-6">
                {/* Fiyat detaylari */}
                {pricing && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Birim Fiyati</span>
                      <span className="text-white">
                        {formatCurrency(pricing.unitPrice, product.currency)}
                        {product.type === 'subscription' && <span className="text-gray-500"> / {period}</span>}
                      </span>
                    </div>

                    {hasDuration && selectedDuration && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Sure</span>
                        <span className="text-white">{selectedDuration} {period}</span>
                      </div>
                    )}

                    {selectedPaymentMode === 'recurring' && pricing.isRecurring && pricing.totalAmount && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Toplam Tutar</span>
                        <span className="text-gray-400">
                          {formatCurrency(pricing.totalAmount, product.currency)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                      <span className="text-lg font-semibold text-white">
                        {selectedPaymentMode === 'upfront' ? 'Toplam' : 'Odenecek'}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">
                          {pricing.displayPrice}
                        </span>
                        {pricing.subtitle && (
                          <p className="text-sm text-gray-500">{pricing.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 text-center">
                <Globe className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Dunya Capinda</p>
                <p className="text-sm font-medium text-white">Gecerli Odeme</p>
              </div>
              <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 text-center">
                <Fingerprint className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">3D Secure</p>
                <p className="text-sm font-medium text-white">Korumali</p>
              </div>
            </div>

            {/* Payment Provider Info */}
            <Card className="p-4 bg-dark-900/30 border-dark-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedProvider === 'stripe' ? (
                    <>
                      <div className="p-2 bg-[#635BFF]/10 rounded-lg">
                        <StripeLogo className="text-lg text-[#635BFF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Stripe ile Odeme</p>
                        <p className="text-xs text-gray-500">190+ ulkede gecerli, PCI DSS uyumlu</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <PayTRLogo className="text-lg text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">PayTR ile Odeme</p>
                        <p className="text-xs text-gray-500">BDDK lisansli, Turkiye'nin guvenilir odeme sistemi</p>
                      </div>
                    </>
                  )}
                </div>
                <Lock className="w-5 h-5 text-green-500" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Security Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-dark-800"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">256-bit SSL Sertifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">PCI DSS Uyumlu</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-400">Kart Bilgileriniz Saklanmaz</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-4">
            Odemeleriniz Stripe ve PayTR guvenli odeme altyapilari uzerinden islenmektedir.
            Tum islemler bankacilik standartlarina uygun olarak gerceklestirilir.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
