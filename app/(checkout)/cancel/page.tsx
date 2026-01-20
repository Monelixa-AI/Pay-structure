'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, Button, Spinner } from '@/components/ui';
import { XCircle, ArrowLeft } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Odeme Iptal Edildi</h1>
          <p className="text-gray-400 mb-6">
            Odeme islemi tamamlanmadi. Dilerseniz tekrar deneyebilirsiniz.
          </p>

          {orderId && (
            <div className="bg-dark-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400">Siparis No</p>
              <p className="text-sm font-mono text-white">
                #{orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          )}

          <Link href="/">
            <Button className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Ana Sayfaya Don
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <Spinner size="lg" />
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CancelContent />
    </Suspense>
  );
}
