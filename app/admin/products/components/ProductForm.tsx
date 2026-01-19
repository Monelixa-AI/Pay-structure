'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  FileUpload,
  Card,
} from '@/components/ui';
import { Plus, X, GripVertical, Clock, CreditCard, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product, Currency, BillingPeriod, SubscriptionPaymentMode } from '@/types';

interface ProductFormProps {
  product?: Product | null;
  onSuccess?: () => void;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ Turk Lirasi (TRY)' },
  { value: 'USD', label: '$ Amerikan Dolari (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
];

const typeOptions = [
  { value: 'one_time', label: 'Tek Seferlik Odeme' },
  { value: 'subscription', label: 'Abonelik' },
];

const billingOptions = [
  { value: 'monthly', label: 'Aylik' },
  { value: 'yearly', label: 'Yillik' },
];

const durationTypeOptions = [
  { value: 'unlimited', label: 'Suresiz (Iptal edene kadar)' },
  { value: 'fixed', label: 'Sabit Sureli' },
  { value: 'user_choice', label: 'Kullanici Secer' },
];

const paymentModeOptions = [
  { value: 'recurring', label: 'Tekrarli Odeme (Her periyod oде)' },
  { value: 'upfront', label: 'Pesin Odeme (Toplam tutar tek seferde)' },
];

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'TRY' as Currency,
    type: 'one_time' as 'one_time' | 'subscription',
    billing_period: 'monthly' as BillingPeriod,
    features: [''] as string[],
    image_url: '' as string | null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    // Süreli subscription alanları
    duration_type: 'unlimited' as 'unlimited' | 'fixed' | 'user_choice',
    subscription_duration: '' as string, // Sabit süre için (ay)
    duration_options: '' as string, // Kullanıcı seçenekleri için (virgülle ayrılmış)
    allow_payment_mode_choice: false,
    default_payment_mode: 'recurring' as SubscriptionPaymentMode,
  });

  useEffect(() => {
    if (product) {
      // Determine duration type from product data
      let durationType: 'unlimited' | 'fixed' | 'user_choice' = 'unlimited';
      if (product.duration_options && product.duration_options.length > 0) {
        durationType = 'user_choice';
      } else if (product.subscription_duration) {
        durationType = 'fixed';
      }

      setFormData({
        name: product.name,
        description: product.description || '',
        price: String(product.price),
        currency: product.currency,
        type: product.type,
        billing_period: product.billing_period || 'monthly',
        features: product.features?.length ? product.features : [''],
        image_url: product.image_url,
        is_active: product.is_active,
        is_featured: product.is_featured,
        sort_order: product.sort_order,
        duration_type: durationType,
        subscription_duration: product.subscription_duration ? String(product.subscription_duration) : '',
        duration_options: product.duration_options ? product.duration_options.join(', ') : '',
        allow_payment_mode_choice: product.allow_payment_mode_choice || false,
        default_payment_mode: product.default_payment_mode || 'recurring',
      });
    }
  }, [product]);

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('bucket', 'products');
    formDataUpload.append('folder', 'images');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, image_url: result.url }));
        return result.url;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Urun adi zorunludur';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Gecerli bir fiyat girin';
    }

    // Subscription validations
    if (formData.type === 'subscription') {
      if (formData.duration_type === 'fixed' && !formData.subscription_duration) {
        newErrors.subscription_duration = 'Sabit sure belirtin';
      }
      if (formData.duration_type === 'user_choice' && !formData.duration_options.trim()) {
        newErrors.duration_options = 'En az bir sure secenegi girin';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Parse duration options from comma-separated string
      let durationOptionsArray: number[] | null = null;
      if (formData.type === 'subscription' && formData.duration_type === 'user_choice') {
        durationOptionsArray = formData.duration_options
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n) && n > 0);
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        type: formData.type,
        billing_period: formData.type === 'subscription' ? formData.billing_period : null,
        features: formData.features.filter((f) => f.trim()),
        image_url: formData.image_url,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        sort_order: formData.sort_order,
        // Subscription duration fields
        subscription_duration:
          formData.type === 'subscription' && formData.duration_type === 'fixed'
            ? parseInt(formData.subscription_duration)
            : null,
        duration_options:
          formData.type === 'subscription' && formData.duration_type === 'user_choice'
            ? durationOptionsArray
            : null,
        allow_payment_mode_choice:
          formData.type === 'subscription' ? formData.allow_payment_mode_choice : false,
        default_payment_mode:
          formData.type === 'subscription' ? formData.default_payment_mode : 'recurring',
      };

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(product ? 'Urun guncellendi!' : 'Urun olusturuldu!');
      onSuccess?.();
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate example price based on settings
  const calculateExamplePrice = () => {
    if (formData.type !== 'subscription' || !formData.price) return null;
    const price = parseFloat(formData.price);
    const period = formData.billing_period === 'monthly' ? 'ay' : 'yil';

    if (formData.duration_type === 'unlimited') {
      return `${price.toFixed(2)} / ${period} (suresiz)`;
    }

    if (formData.duration_type === 'fixed') {
      const duration = parseInt(formData.subscription_duration) || 0;
      if (duration > 0) {
        const total = price * duration;
        return formData.default_payment_mode === 'upfront'
          ? `Toplam: ${total.toFixed(2)} (${duration} ${period} pesin)`
          : `${price.toFixed(2)} / ${period} x ${duration} = ${total.toFixed(2)}`;
      }
    }

    if (formData.duration_type === 'user_choice') {
      const options = formData.duration_options.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (options.length > 0) {
        return `Kullanici secenekleri: ${options.join(', ')} ${period}`;
      }
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Urun Bilgileri
            </h3>
            <div className="space-y-6">
              <Input
                label="Urun Adi"
                placeholder="orn: Premium Danismanlik"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                error={errors.name}
                required
              />
              <Textarea
                label="Aciklama"
                placeholder="Urun aciklamasini yazin..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fiyat"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  error={errors.price}
                  required
                />
                <Select
                  label="Para Birimi"
                  options={currencyOptions}
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currency: e.target.value as Currency,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Odeme Tipi"
                  options={typeOptions}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'one_time' | 'subscription',
                    })
                  }
                />
                {formData.type === 'subscription' && (
                  <Select
                    label="Faturalandirma Periyodu"
                    options={billingOptions}
                    value={formData.billing_period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_period: e.target.value as BillingPeriod,
                      })
                    }
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Süreli Subscription Ayarları */}
          {formData.type === 'subscription' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-semibold text-white">Abonelik Suresi Ayarlari</h3>
              </div>

              <div className="space-y-6">
                <Select
                  label="Sure Tipi"
                  options={durationTypeOptions}
                  value={formData.duration_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_type: e.target.value as 'unlimited' | 'fixed' | 'user_choice',
                    })
                  }
                />

                {formData.duration_type === 'fixed' && (
                  <Input
                    label={`Abonelik Suresi (${formData.billing_period === 'monthly' ? 'ay' : 'yil'})`}
                    type="number"
                    min="1"
                    placeholder="orn: 6"
                    value={formData.subscription_duration}
                    onChange={(e) =>
                      setFormData({ ...formData, subscription_duration: e.target.value })
                    }
                    error={errors.subscription_duration}
                    helperText="Abonelik bu sure sonunda otomatik sona erer"
                  />
                )}

                {formData.duration_type === 'user_choice' && (
                  <Input
                    label={`Sure Secenekleri (${formData.billing_period === 'monthly' ? 'ay' : 'yil'}, virgülle ayirin)`}
                    placeholder="orn: 3, 6, 12"
                    value={formData.duration_options}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_options: e.target.value })
                    }
                    error={errors.duration_options}
                    helperText="Kullanici bu seceneklerden birini secebilir"
                  />
                )}

                {formData.duration_type !== 'unlimited' && (
                  <>
                    <div className="border-t border-dark-700 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-brand-500" />
                        <h4 className="font-medium text-white">Odeme Modu</h4>
                      </div>

                      <Switch
                        checked={formData.allow_payment_mode_choice}
                        onChange={(checked) =>
                          setFormData({ ...formData, allow_payment_mode_choice: checked })
                        }
                        label="Kullanici Odeme Modunu Secebilsin"
                        description="Aktifse kullanici pesin veya taksitli odeme secebilir"
                      />

                      <div className="mt-4">
                        <Select
                          label={formData.allow_payment_mode_choice ? "Varsayilan Odeme Modu" : "Odeme Modu"}
                          options={paymentModeOptions}
                          value={formData.default_payment_mode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              default_payment_mode: e.target.value as SubscriptionPaymentMode,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Örnek Fiyat Hesaplaması */}
                    {calculateExamplePrice() && (
                      <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Ornek Fiyatlandirma</p>
                            <p className="text-sm text-gray-400 mt-1">{calculateExamplePrice()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Ozellikler</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addFeature}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Ekle
              </Button>
            </div>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <GripVertical className="w-5 h-5 text-gray-600 cursor-grab" />
                  <Input
                    placeholder={`Ozellik ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Urun Gorseli
            </h3>
            <FileUpload
              accept="image/*"
              maxSize={5}
              currentImage={formData.image_url}
              onUpload={handleImageUpload}
              onRemove={() => setFormData({ ...formData, image_url: null })}
              aspectRatio="video"
            />
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Ayarlar</h3>
            <div className="space-y-4">
              <Switch
                checked={formData.is_active}
                onChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                label="Aktif"
                description="Urun sitede goruntulensin"
              />
              <Switch
                checked={formData.is_featured}
                onChange={(checked) =>
                  setFormData({ ...formData, is_featured: checked })
                }
                label="One Cikan"
                description="Ana sayfada goster"
              />
              <Input
                label="Siralama"
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                helperText="Kucuk sayi once gosterilir"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-dark-700">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Iptal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'Guncelle' : 'Olustur'}
        </Button>
      </div>
    </form>
  );
}
