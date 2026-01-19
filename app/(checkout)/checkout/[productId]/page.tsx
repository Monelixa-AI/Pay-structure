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
  <svg className={className} viewBox="0 0 50 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.13 15.58h-3.88L17.6.42h3.88l-2.35 15.16zM13.07.42L9.35 10.8l-.44-2.24L7.6 2.07S7.44.42 5.36.42H.07L0 .72s2.28.47 4.95 2.07l4.12 15.79h4.05L17.2.42h-4.13zM45.94.42h-3.22c-1 0-1.74.29-2.18 1.33l-6.17 14.83h4.36l.87-2.39h5.32l.5 2.39h3.85L45.94.42zm-5.12 10.5l2.2-6.03 1.25 6.03h-3.45zM35.95 4.21l.6-3.45S34.47.01 32.3.01c-2.32 0-7.83 1.01-7.83 5.94 0 4.64 6.48 4.7 6.48 7.14s-5.81 2-7.72.46l-.62 3.6s2.12.99 5.35.99c3.24 0 8.1-1.67 8.1-6.14 0-4.67-6.54-5.1-6.54-7.14s4.56-1.76 6.43-.65z"/>
  </svg>
);

// Mastercard Logo
const MastercardLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 25" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12.5" cy="12.5" r="12.5" fill="#EB001B"/>
    <circle cx="27.5" cy="12.5" r="12.5" fill="#F79E1B"/>
    <path d="M20 4.37a12.44 12.44 0 0 0-4.5 8.13 12.44 12.44 0 0 0 4.5 8.13 12.44 12.44 0 0 0 4.5-8.13A12.44 12.44 0 0 0 20 4.37z" fill="#FF5F00"/>
  </svg>
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

  // Süreli subscription için state'ler
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
          toast.error('Ürün bulunamadı');
          router.push('/');
          return;
        }
        const productInfo = productData.data as Product;
        setProduct(productInfo);

        // Varsayılan değerleri ayarla
        if (productInfo.type === 'subscription') {
          // Süre seçimi
          if (productInfo.duration_options && productInfo.duration_options.length > 0) {
            setSelectedDuration(productInfo.duration_options[0]);
          } else if (productInfo.subscription_duration) {
            setSelectedDuration(productInfo.subscription_duration);
          }

          // Ödeme modu
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
        toast.error('Bir hata oluştu');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.productId, router]);

  // Fiyat hesaplaması
  const pricing = useMemo(() => {
    if (!product) return null;

    const basePrice = product.price;
    const period = product.billing_period === 'monthly' ? 'ay' : 'yil';

    // One-time ürün
    if (product.type === 'one_time') {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice,
        displayPrice: formatCurrency(basePrice, product.currency),
        subtitle: null,
      };
    }

    // Sınırsız subscription
    if (!product.subscription_duration && (!product.duration_options || product.duration_options.length === 0)) {
      return {
        unitPrice: basePrice,
        totalPrice: basePrice,
        displayPrice: formatCurrency(basePrice, product.currency),
        subtitle: `/ ${period}`,
        isRecurring: true,
      };
    }

    // Süreli subscription
    const duration = selectedDuration || product.subscription_duration || 1;
    const totalPrice = basePrice * duration;

    if (selectedPaymentMode === 'upfront') {
      // Peşin ödeme
      return {
        unitPrice: basePrice,
        totalPrice: totalPrice,
        displayPrice: formatCurrency(totalPrice, product.currency),
        subtitle: `(${duration} ${period} peşin)`,
        duration,
        isRecurring: false,
      };
    } else {
      // Tekrarlı ödeme
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
          // Süreli subscription parametreleri
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
      toast.error(error.message || 'Ödeme başlatılamadı');
      setIsProcessing(false);
    }
  };

  // Süreli subscription için kullanıcı seçenekleri gösterilecek mi?
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
          <h1 className="text-2xl font-bold text-white">Güvenli Ödeme</h1>
          <p className="text-gray-400 mt-2">
            Bilgileriniz 256-bit SSL ile korunmaktadır
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
                Müşteri Bilgileri
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

                {/* Süre Seçimi */}
                {showDurationOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Abonelik Süresi
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

                {/* Ödeme Modu Seçimi */}
                {showPaymentModeOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <Wallet className="w-4 h-4 inline mr-2" />
                      Ödeme Şekli
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
                        <p className="text-sm font-medium text-white">Aylık Öde</p>
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
                        <p className="text-sm font-medium text-white">Peşin Öde</p>
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
                      Ödeme Yöntemi
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
                          <p className="text-xs text-gray-500">Uluslararası</p>
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
                          <p className="text-xs text-gray-500">Türkiye</p>
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
                  {isProcessing ? 'İşleniyor...' : 'Ödemeye Geç'}
                </Button>
              </form>

              {/* Kart Logoları */}
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

            {/* Güvenlik Bilgileri Kartı */}
            <Card className="p-5 bg-gradient-to-br from-dark-900 to-dark-800 border-dark-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Güvenli Ödeme Altyapısı</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Ödemeleriniz dünya çapında güvenilen{' '}
                    <span className="text-white font-medium">Stripe</span> ve{' '}
                    <span className="text-white font-medium">PayTR</span> altyapıları üzerinden gerçekleştirilmektedir.
                    Kart bilgileriniz bizimle paylaşılmaz.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sağ Kolon - Sipariş Özeti */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Sipariş Özeti
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
                        {product.billing_period === 'monthly' ? 'Aylık' : 'Yıllık'} Abonelik
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
                {/* Fiyat detayları */}
                {pricing && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Birim Fiyatı</span>
                      <span className="text-white">
                        {formatCurrency(pricing.unitPrice, product.currency)}
                        {product.type === 'subscription' && <span className="text-gray-500"> / {period}</span>}
                      </span>
                    </div>

                    {hasDuration && selectedDuration && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Süre</span>
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
                        {selectedPaymentMode === 'upfront' ? 'Toplam' : 'Ödenecek'}
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
                <p className="text-xs text-gray-400">Dünya Çapında</p>
                <p className="text-sm font-medium text-white">Geçerli Ödeme</p>
              </div>
              <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-4 text-center">
                <Fingerprint className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">3D Secure</p>
                <p className="text-sm font-medium text-white">Korumalı</p>
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
                        <p className="text-sm font-medium text-white">Stripe ile Ödeme</p>
                        <p className="text-xs text-gray-500">190+ ülkede geçerli, PCI DSS uyumlu</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <PayTRLogo className="text-lg text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">PayTR ile Ödeme</p>
                        <p className="text-xs text-gray-500">BDDK lisanslı, Türkiye'nin güvenilir ödeme sistemi</p>
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
              <span className="text-sm text-gray-400">256-bit SSL Sertifikası</span>
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
            Ödemeleriniz Stripe ve PayTR güvenli ödeme altyapıları üzerinden işlenmektedir.
            Tüm işlemler bankacılık standartlarına uygun olarak gerçekleştirilir.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
