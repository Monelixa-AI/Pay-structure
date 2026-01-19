import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, CreditCard, User, Calendar } from 'lucide-react';

async function getSubscription(id: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
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

export default async function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const subscription = await getSubscription(params.id);
  if (!subscription) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    active: 'Aktif',
    cancelled: 'Iptal',
    past_due: 'Gecikmis',
    paused: 'Duraklatilmis',
    trialing: 'Deneme',
    expired: 'Suresi Dolmus',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/subscriptions"
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Abonelik Detayi</h1>
          <p className="text-gray-400 mt-1">{subscription.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-400" />
              Plan Bilgisi
            </h3>
            <div>
              <p className="text-white font-medium">
                {subscription.product?.name || 'Plan'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {formatCurrency(
                  subscription.product?.price || 0,
                  subscription.product?.currency || 'TRY'
                )}
                /{subscription.product?.billing_period === 'monthly' ? 'ay' : 'yil'}
              </p>
              {subscription.product?.description && (
                <p className="text-sm text-gray-500 mt-2">
                  {subscription.product.description}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Donem Bilgisi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Baslangic
                </p>
                <p className="text-white">
                  {subscription.current_period_start
                    ? formatDate(subscription.current_period_start)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Bitis
                </p>
                <p className="text-white">
                  {subscription.current_period_end
                    ? formatDate(subscription.current_period_end)
                    : '-'}
                </p>
              </div>
            </div>
            {subscription.cancel_at_period_end && (
              <p className="text-sm text-yellow-400 mt-3">
                Donem sonunda iptal edilecek
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Musteri
            </h3>
            <div>
              <p className="text-white">
                {subscription.customer?.full_name || 'Musteri'}
              </p>
              <p className="text-sm text-gray-500">
                {subscription.customer?.email || '-'}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Durum</h3>
            <Badge variant="default">
              {statusLabels[subscription.status] || subscription.status}
            </Badge>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Aksiyonlar</h3>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full">
                Abonelik Islemleri
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
