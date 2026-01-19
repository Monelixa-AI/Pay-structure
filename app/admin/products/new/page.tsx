import ProductForm from '../components/ProductForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
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
          <h1 className="text-2xl font-bold text-white">Yeni Urun</h1>
          <p className="text-gray-400 mt-1">
            Yeni bir urun veya abonelik plani olusturun
          </p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
