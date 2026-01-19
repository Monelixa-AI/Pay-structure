import { supabaseAdmin } from '@/lib/supabase/admin';
import SubscriptionsTable from './components/SubscriptionsTable';
import { CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react';

async function getSubscriptions() {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(
      `
      *,
      product:products(id, name, price, currency, billing_period),
      customer:customers(id, email, full_name)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data;
}

async function getSubscriptionStats() {
  const { count: total } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true });

  const { count: active } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: cancelled } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled');

  const { count: pastDue } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'past_due');

  const { data: activeSubscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('product:products(price, billing_period)')
    .eq('status', 'active');

  const mrr =
    activeSubscriptions?.reduce((sum, sub: any) => {
      if (!sub.product) return sum;
      const monthlyPrice =
        sub.product.billing_period === 'yearly'
          ? sub.product.price / 12
          : sub.product.price;
      return sum + monthlyPrice;
    }, 0) || 0;

  return {
    total: total || 0,
    active: active || 0,
    cancelled: cancelled || 0,
    pastDue: pastDue || 0,
    mrr,
  };
}

export default async function SubscriptionsPage() {
  const [subscriptions, stats] = await Promise.all([
    getSubscriptions(),
    getSubscriptionStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <CreditCard className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Abonelikler</h1>
          <p className="text-gray-400 mt-1">
            Tum abonelikleri takip edin ve yonetin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Toplam</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-sm text-gray-500">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pastDue}</p>
              <p className="text-sm text-gray-500">Gecikmis</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              <p className="text-sm text-gray-500">Iptal</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                }).format(stats.mrr)}
              </p>
              <p className="text-sm text-gray-500">Aylik Gelir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <SubscriptionsTable subscriptions={subscriptions} />
      </div>
    </div>
  );
}
