import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import ProductForm from '../components/ProductForm';
import { ArrowLeft } from 'lucide-react';
import type { Product } from '@/types';

async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Product;
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Urunu Duzenle</h1>
          <p className="text-gray-400 mt-1">{product.name}</p>
        </div>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
