import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ProductCard from '@/components/marketing/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Ürünler | Monelixa',
  description: 'Dijital ürünlerimizi keşfedin.',
};

async function getProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            Ürünlerimiz
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Dijital Ürünler
          </h1>
          <p className="text-lg text-gray-400">
            İhtiyacınıza uygun dijital çözümleri keşfedin.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium">
            Tümü
          </button>
          <button className="px-4 py-2 bg-dark-800 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
            Abonelikler
          </button>
          <button className="px-4 py-2 bg-dark-800 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
            Tek Seferlik
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-gray-500">BOX</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Henüz ürün yok</h3>
            <p className="text-gray-400">
              Yakında yeni ürünler eklenecek. Bizi takipte kalın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
