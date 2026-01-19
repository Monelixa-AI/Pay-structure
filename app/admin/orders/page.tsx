import { supabaseAdmin, getSettings } from '@/lib/supabase/admin';
import OrderStats from './components/OrderStats';
import OrdersTable from './components/OrdersTable';
import type { Order } from '@/types';

async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      customer:customers(id, email, full_name),
      product:products(id, name, price, currency, billing_period, type)
    `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []) as Order[];
}

async function getOrderStats() {
  const { count: total } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: completed } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  const { count: pending } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'processing']);

  const { count: failed } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  const { count: refunded } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'refunded');

  const { data: revenueData } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed');

  const revenue =
    revenueData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  return {
    total: total || 0,
    completed: completed || 0,
    pending: pending || 0,
    failed: failed || 0,
    refunded: refunded || 0,
    revenue,
  };
}

export default async function OrdersPage() {
  const [orders, stats, settings] = await Promise.all([
    getOrders(),
    getOrderStats(),
    getSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Siparisler</h1>
        <p className="text-gray-400 mt-1">
          Tum odeme ve siparis kayitlarini goruntuleyin
        </p>
      </div>

      <OrderStats
        stats={{
          ...stats,
          currency: settings.currency || 'TRY',
        }}
      />

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
