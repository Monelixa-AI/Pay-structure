import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Product } from '@/types';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import Stats from '@/components/marketing/Stats';
import PricingSection from '@/components/marketing/PricingSection';
import Testimonials from '@/components/marketing/Testimonials';
import FAQ from '@/components/marketing/FAQ';
import CTA from '@/components/marketing/CTA';
import ProductCard from '@/components/marketing/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(6);

  if (error) return [];
  return (data || []) as Product[];
}

export default async function MarketingHomePage() {
  const products = await getProducts();
  const featured = products.slice(0, 3);

  return (
    <div>
      <Hero />
      <Features />
      <Stats />

      {featured.length > 0 && (
        <section className="py-16 border-t border-dark-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-bold text-white">Öne çıkan ürünler</h2>
              <p className="text-gray-400 mt-3">
                En çok tercih edilen planlarla hızlıca başlayın.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PricingSection
        products={products}
        title="Abonelik planları"
        subtitle="Aylık veya yıllık ödeme seçenekleri."
      />

      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
