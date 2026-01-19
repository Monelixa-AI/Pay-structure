'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Spinner } from '@/components/ui';
import { Logo } from '@/components/Logo';
import { CheckCircle, Download, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f97316', '#22c55e'],
    });

    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 text-center">
          <Logo size="md" className="mx-auto mb-6" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2">Odeme Basarili!</h1>
          <p className="text-gray-400 mb-6">
            Siparisiniz basariyla alindi. Tesekkur ederiz!
          </p>

          {isLoading ? (
            <div className="py-6">
              <Spinner size="md" />
            </div>
          ) : order ? (
            <div className="bg-dark-800 rounded-xl p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Siparis No</span>
                <span className="text-sm font-mono text-white">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Urun</span>
                <span className="text-sm text-white">
                  {order.product?.name || 'Urun'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Tutar</span>
                <span className="text-sm font-semibold text-white">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: order.currency,
                  }).format(order.amount)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
            <Mail className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-300">
              Onay e-postasi gonderildi
            </p>
          </div>

          <div className="space-y-3">
            {order?.invoice_url && (
              <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                  Fatura Indir
                </Button>
              </a>
            )}
            <Link href="/">
              <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Ana Sayfaya Don
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
