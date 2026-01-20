import { supabaseAdmin, getSettings } from '@/lib/supabase/admin';
import StatsCard from './components/StatsCard';
import RevenueChart from './components/RevenueChart';
import RecentOrders from './components/RecentOrders';
import { formatCurrency, calculatePercentageChange } from '@/lib/utils';
import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import type { DashboardStats, ChartData, Order } from '@/types';

// ─────────────────────────────────────────────────────────────────
// Fetch Dashboard Stats
// ─────────────────────────────────────────────────────────────────
async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Bu ay toplam gelir
  const { data: currentRevenue } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());

  const totalRevenue =
    currentRevenue?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

  // Gecen ay toplam gelir
  const { data: lastRevenue } = await supabaseAdmin
    .from('orders')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  const lastMonthRevenue =
    lastRevenue?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

  // Bu ay siparis sayisi
  const { count: currentOrders } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  // Gecen ay siparis sayisi
  const { count: lastOrders } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  // Aktif abonelikler
  const { count: activeSubscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Bu ay yeni musteriler
  const { count: newCustomers } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  // Gecen ay yeni musteriler
  const { count: lastCustomers } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());

  return {
    totalRevenue,
    totalOrders: currentOrders || 0,
    activeSubscriptions: activeSubscriptions || 0,
    newCustomers: newCustomers || 0,
    revenueChange: calculatePercentageChange(totalRevenue, lastMonthRevenue),
    ordersChange: calculatePercentageChange(currentOrders || 0, lastOrders || 0),
    subscriptionsChange: 0,
    customersChange: calculatePercentageChange(
      newCustomers || 0,
      lastCustomers || 0
    ),
  };
}

// ─────────────────────────────────────────────────────────────────
// Fetch Chart Data (Son 90 gun)
// ─────────────────────────────────────────────────────────────────
async function getChartData(): Promise<ChartData[]> {
  const days = 90;
  const data: ChartData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    data.push({
      date: date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      }),
      revenue: orders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0,
      orders: orders?.length || 0,
    });
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────
// Fetch Recent Orders
// ─────────────────────────────────────────────────────────────────
async function getRecentOrders(): Promise<Order[]> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      customer:customers(*),
      product:products(*)
    `
    )
    .order('created_at', { ascending: false })
    .limit(5);

  return (data || []) as Order[];
}

// ─────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const [stats, chartData, recentOrders, settings] = await Promise.all([
    getDashboardStats(),
    getChartData(),
    getRecentOrders(),
    getSettings(),
  ]);

  const currency = settings.currency || 'TRY';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Hos geldiniz! Iste genel bakis.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Toplam Gelir"
          value={formatCurrency(stats.totalRevenue, currency)}
          change={stats.revenueChange}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="text-green-400"
          delay={0}
        />
        <StatsCard
          title="Siparisler"
          value={stats.totalOrders}
          change={stats.ordersChange}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconColor="text-blue-400"
          delay={0.1}
        />
        <StatsCard
          title="Aktif Abonelikler"
          value={stats.activeSubscriptions}
          change={stats.subscriptionsChange}
          icon={<CreditCard className="w-6 h-6" />}
          iconColor="text-purple-400"
          delay={0.2}
        />
        <StatsCard
          title="Yeni Musteriler"
          value={stats.newCustomers}
          change={stats.customersChange}
          icon={<Users className="w-6 h-6" />}
          iconColor="text-orange-400"
          delay={0.3}
        />
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} />
        </div>
        <div>
          <RecentOrders orders={recentOrders} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Yeni Urun Ekle"
          description="Yeni bir abonelik plani olusturun"
          href="/admin/products"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <QuickActionCard
          title="Ayarlari Duzenle"
          description="Site ve odeme ayarlarini yonetin"
          href="/admin/settings"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <QuickActionCard
          title="Mesajlari Kontrol Et"
          description="Gelen iletisim formlarini gorun"
          href="/admin/contacts"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quick Action Card
// ─────────────────────────────────────────────────────────────────
function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-dark-900 border border-dark-700 rounded-xl hover:border-brand-500/50 hover:shadow-brand transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-500/20 rounded-lg text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </a>
  );
}
