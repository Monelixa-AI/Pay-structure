import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Button, Badge, Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingCart,
  Check,
  Star,
  Shield,
  Zap,
  ArrowLeft,
  Clock,
  Users,
  RefreshCw,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', slug)
    .eq('is_active', true)
    .single();

  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return { title: 'Ürün Bulunamadı | Monelixa' };
  }

  return {
    title: `${product.name} | Monelixa`,
    description: product.description || `${product.name} - Monelixa`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) {
    notFound();
  }

  const features = product.features || [
    'Tüm temel özellikler',
    'E-posta desteği',
    'Otomatik güncellemeler',
    '7 gün para iade garantisi',
  ];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tüm Ürünler
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-video bg-dark-800 rounded-2xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
                  <span className="text-8xl font-bold text-dark-600">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.is_featured && (
                  <Badge variant="warning">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Öne Çıkan
                  </Badge>
                )}
                {product.type === 'subscription' && (
                  <Badge variant="default">Abonelik</Badge>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-4 bg-dark-900 rounded-xl border border-dark-700">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-2 p-4 bg-dark-900 rounded-xl border border-dark-700">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Anında Teslimat</span>
              </div>
              <div className="flex items-center gap-2 p-4 bg-dark-900 rounded-xl border border-dark-700">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">7 Gün İade</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400">(128 değerlendirme)</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            <p className="text-gray-400 text-lg mb-6">
              {product.description ||
                'Bu ürün hakkında detaylı bilgi için bizimle iletişime geçin.'}
            </p>

            <Card className="p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">
                  {formatCurrency(product.price, product.currency)}
                </span>
                {product.type === 'subscription' && (
                  <span className="text-gray-500">
                    /{product.billing_period === 'monthly' ? 'ay' : 'yıl'}
                  </span>
                )}
              </div>

              <Link href={`/checkout/${product.id}`}>
                <Button size="lg" className="w-full">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Hemen Satın Al
                </Button>
              </Link>
              <p className="text-center text-sm text-gray-500 mt-4">
                256-bit SSL ile güvenli ödeme
              </p>
            </Card>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Neler Dahil?</h3>
              <ul className="space-y-3">
                {features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="p-0.5 rounded-full bg-green-500/20 mt-0.5">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-dark-900 rounded-xl border border-dark-700">
                <Users className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">500+</p>
                <p className="text-xs text-gray-500">Aktif Kullanıcı</p>
              </div>
              <div className="text-center p-4 bg-dark-900 rounded-xl border border-dark-700">
                <Clock className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">24/7</p>
                <p className="text-xs text-gray-500">Destek</p>
              </div>
              <div className="text-center p-4 bg-dark-900 rounded-xl border border-dark-700">
                <Star className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">4.9</p>
                <p className="text-xs text-gray-500">Puan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
