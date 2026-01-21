import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Product } from '@/types';
import PricingSection from '@/components/marketing/PricingSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Fiyatlandırma | Monelixa',
  description: 'Aylık ve yıllık abonelik planlarını karşılaştırın.',
};

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data || []) as Product[];
}

export default async function PricingPage() {
  const products = await getProducts();

  return (
    <div className="pt-24 pb-16">
      <PricingSection
        products={products}
        title="Planlar ve fiyatlar"
        subtitle="İhtiyacınıza göre esnek planlar."
      />
    </div>
  );
}
