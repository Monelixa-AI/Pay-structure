'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Column, Badge, Button, Modal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${deleteModal.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      toast.success('Ürün silindi!');
      setDeleteModal(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      label: 'Ürün',
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center">
              <span className="text-gray-500 text-xs">BOX</span>
            </div>
          )}
          <div>
            <p className="font-medium text-white">{product.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">
              {product.description || 'Açıklama yok'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Fiyat',
      sortable: true,
      render: (product) => (
        <span className="font-medium text-white">
          {formatCurrency(product.price, product.currency)}
          {product.type === 'subscription' && (
            <span className="text-gray-500 text-sm">
              /{product.billing_period === 'monthly' ? 'ay' : 'yıl'}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Tip',
      render: (product) => (
        <Badge
          variant={product.type === 'subscription' ? 'default' : 'secondary'}
        >
          {product.type === 'subscription' ? 'Abonelik' : 'Tek Seferlik'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Durum',
      render: (product) => (
        <Badge variant={product.is_active ? 'success' : 'error'}>
          {product.is_active ? 'Aktif' : 'Pasif'}
        </Badge>
      ),
    },
    {
      key: 'is_featured',
      label: 'Öne Çıkan',
      render: (product) =>
        product.is_featured ? (
          <span className="text-yellow-400">⭐</span>
        ) : (
          <span className="text-gray-600">-</span>
        ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        keyField="id"
        searchPlaceholder="Ürün ara..."
        emptyMessage="Henüz ürün eklenmemiş."
        onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
        actions={(product) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/products/${product.id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModal(product)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Ürünü Sil"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            <span className="font-medium text-white">{deleteModal?.name}</span>{' '}
            ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
