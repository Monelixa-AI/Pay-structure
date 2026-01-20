import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

async function getOrder(id: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      product:products(*),
      customer:customers(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);
  if (!order) {
    notFound();
  }

  const statusConfig: Record<
    string,
    { color: string; icon: any; label: string }
  > = {
    pending: { color: 'warning', icon: Clock, label: 'Bekliyor' },
    processing: { color: 'default', icon: RefreshCw, label: 'Isleniyor' },
    completed: { color: 'success', icon: CheckCircle, label: 'Tamamlandi' },
    failed: { color: 'error', icon: XCircle, label: 'Basarisiz' },
    refunded: { color: 'secondary', icon: RefreshCw, label: 'Iade Edildi' },
    cancelled: { color: 'secondary', icon: XCircle, label: 'Iptal' },
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Siparis #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-gray-400 mt-1">
              {formatDate(order.created_at, true)}
            </p>
          </div>
        </div>
        <Badge variant={status.color as any} className="text-sm px-3 py-1">
          <StatusIcon className="w-4 h-4 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-400" />
              Urun Bilgisi
            </h3>

            <div className="flex items-start gap-4">
              {order.product?.image_url ? (
                <img
                  src={order.product.image_url}
                  alt={order.product.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-dark-700 flex items-center justify-center">
                  <span className="text-4xl">BOX</span>
                </div>
              )}

              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white">
                  {order.product?.name || 'Urun'}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {order.product?.description || 'Aciklama yok'}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(order.amount, order.currency)}
                  </span>
                  {order.product?.type === 'subscription' && (
                    <Badge variant="default">
                      {order.product.billing_period === 'monthly' ? 'Aylik' : 'Yillik'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              Odeme Bilgisi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Odeme Saglayicisi
                </p>
                <p className="text-white font-medium">
                  {order.payment_provider === 'stripe' ? 'Stripe' : 'PayTR'}
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Session ID
                </p>
                <p className="text-white font-mono text-sm truncate">
                  {order.provider_session_id || '-'}
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Payment ID
                </p>
                <p className="text-white font-mono text-sm truncate">
                  {order.provider_payment_id || '-'}
                </p>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Tutar
                </p>
                <p className="text-white font-semibold">
                  {formatCurrency(order.amount, order.currency)}
                </p>
              </div>
            </div>

            {order.metadata && Object.keys(order.metadata).length > 0 && (
              <div className="mt-4 p-4 bg-dark-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Metadata
                </p>
                <pre className="text-sm text-gray-300 overflow-auto">
                  {JSON.stringify(order.metadata, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Musteri
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  E-posta
                </p>
                <p className="text-white">
                  {order.customer?.email || order.customer_email}
                </p>
              </div>

              {(order.customer?.full_name || order.metadata?.customer_name) && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Ad Soyad
                  </p>
                  <p className="text-white">
                    {order.customer?.full_name || order.metadata?.customer_name}
                  </p>
                </div>
              )}

              {order.customer?.id && (
                <Link href={`/admin/customers/${order.customer.id}`}>
                  <Button variant="secondary" size="sm" className="w-full mt-2">
                    Musteri Detayi
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Zaman Cizelgesi
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm text-white">Siparis Olusturuldu</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.created_at, true)}
                  </p>
                </div>
              </div>

              {order.updated_at && order.updated_at !== order.created_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-white">Son Guncelleme</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.updated_at, true)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Aksiyonlar</h3>
            <div className="space-y-3">
              {order.status === 'completed' && (
                <Button variant="secondary" className="w-full">
                  Iade Yap
                </Button>
              )}

              {order.payment_provider === 'stripe' && order.provider_payment_id && (
                <a
                  href={`https://dashboard.stripe.com/payments/${order.provider_payment_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="w-full">
                    Stripe'da Goruntule
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
