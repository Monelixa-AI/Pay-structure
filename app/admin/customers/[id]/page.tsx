import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Button, Card } from '@/components/ui';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

async function getCustomer(id: string) {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

async function getCustomerOrders(customerId: string) {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, product:products(id, name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10);
  return data || [];
}

async function getCustomerSubscriptions(customerId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*, product:products(id, name, price, currency, billing_period)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, orders, subscriptions] = await Promise.all([
    getCustomer(params.id),
    getCustomerOrders(params.id),
    getCustomerSubscriptions(params.id),
  ]);

  if (!customer) {
    notFound();
  }

  const completedOrders = orders.filter((o: any) => o.status === 'completed');
  const totalSpent = completedOrders.reduce(
    (sum: number, o: any) => sum + Number(o.amount || 0),
    0
  );
  const activeSubs = subscriptions.filter((s: any) => s.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {customer.full_name || 'Müşteri'}
          </h1>
          <p className="text-gray-400 mt-1">{customer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">E-posta</p>
                  <p className="text-white">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg">
                <Phone className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Telefon</p>
                  <p className="text-white">{customer.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Stripe</p>
                  <p className="text-white font-mono text-sm truncate">
                    {customer.stripe_customer_id || 'Bağlı değil'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dark-800 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Kayıt</p>
                  <p className="text-white text-sm">
                    {formatDate(customer.created_at, true)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Son Siparişler</h3>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  Tüm Siparişler
                </Button>
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-400">Bu müşteriye ait sipariş yok.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-dark-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-dark-800 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Sipariş</th>
                      <th className="px-4 py-3">Ürün</th>
                      <th className="px-4 py-3">Tutar</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Tarih</th>
                      <th className="px-4 py-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="bg-dark-900">
                        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {order.product?.name || 'Ürün'}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {formatCurrency(order.amount, order.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {formatDate(order.created_at, true)}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              Gör
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Abonelikler</h3>
            {subscriptions.length === 0 ? (
              <p className="text-gray-400">Bu müşteriye ait abonelik yok.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-dark-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-dark-800 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Yenileme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {subscriptions.map((sub: any) => (
                      <tr key={sub.id} className="bg-dark-900">
                        <td className="px-4 py-3 text-gray-300">
                          {sub.product?.name || 'Plan'}
                          {sub.product?.price && (
                            <span className="text-xs text-gray-500 ml-2">
                              {formatCurrency(
                                sub.product.price,
                                sub.product.currency || 'TRY'
                              )}
                              /{sub.product.billing_period === 'monthly' ? 'ay' : 'yıl'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              sub.status
                            )}`}
                          >
                            {getStatusLabel(sub.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {sub.current_period_end
                            ? formatDate(sub.current_period_end, true)
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Özet</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Sipariş</span>
                <span className="text-white font-semibold">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tamamlanan</span>
                <span className="text-white font-semibold">
                  {completedOrders.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Aktif Abonelik</span>
                <span className="text-white font-semibold">{activeSubs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Toplam Harcama</span>
                <span className="text-white font-semibold">
                  {orders.length > 0
                    ? formatCurrency(totalSpent, orders[0].currency || 'TRY')
                    : formatCurrency(0, 'TRY')}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Hızlı İşlemler
            </h3>
            <div className="space-y-3">
              <Link href="/admin/orders">
                <Button variant="secondary" className="w-full">
                  Siparişleri Gör
                </Button>
              </Link>
              <Link href="/admin/subscriptions">
                <Button variant="secondary" className="w-full">
                  Abonelikleri Gör
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
