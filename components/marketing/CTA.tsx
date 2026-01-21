'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-16 border-t border-dark-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 md:p-12 rounded-3xl bg-dark-900 border border-dark-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Dakikalar içinde yayınlanın
              </h2>
              <p className="text-gray-400 mt-2">
                Ödeme akışını kurun, ürünlerinizi ekleyin ve satın almaya başlayın.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button size="lg">
                  Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  İletişim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
