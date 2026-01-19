import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ProductsTable from './components/ProductsTable';
import { Button } from '@/components/ui';
import { Plus, Package, CreditCard, TrendingUp } from 'lucide-react';
import type { Product } from '@/types';

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

async function getProductStats() {
  const { count: total } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true });
  const { count: active } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  const { count: subscriptions } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'subscription');
  const { count: oneTime } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'one_time');

  return {
    total: total || 0,
    active: active || 0,
    subscriptions: subscriptions || 0,
    oneTime: oneTime || 0,
  };
}

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([getProducts(), getProductStats()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Urunler</h1>
          <p className="text-gray-400 mt-1">
            Tum urun ve abonelik planlarini yonetin
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button leftIcon={<Plus className="w-5 h-5" />}>Yeni Urun</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Toplam Urun</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-sm text-gray-500">Aktif Urun</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.subscriptions}</p>
              <p className="text-sm text-gray-500">Abonelik</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Package className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.oneTime}</p>
              <p className="text-sm text-gray-500">Tek Seferlik</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
