import { supabaseAdmin } from '@/lib/supabase/admin';
import CustomersTable from './components/CustomersTable';
import { Users, UserPlus, CreditCard } from 'lucide-react';
import type { Customer } from '@/types';

async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data as Customer[];
}

async function getCustomerStats() {
  const { count: total } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: newThisMonth } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  const { count: withStripe } = await supabaseAdmin
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .not('stripe_customer_id', 'is', null);

  return {
    total: total || 0,
    newThisMonth: newThisMonth || 0,
    withStripe: withStripe || 0,
  };
}

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([
    getCustomers(),
    getCustomerStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Müşteriler</h1>
          <p className="text-gray-400 mt-1">
            Kayıtlı tüm müşterileri görüntüleyin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Toplam Müşteri</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.newThisMonth}
              </p>
              <p className="text-sm text-gray-500">Bu Ay Yeni</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.withStripe}
              </p>
              <p className="text-sm text-gray-500">Stripe Bağlı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
