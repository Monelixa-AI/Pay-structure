'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight, ShieldCheck, Zap, CreditCard } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Yeni nesil odeme altyapisi
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Dijital urunlerinizi
              <span className="text-brand-500"> kolayca satin</span>
            </h1>
            <p className="text-lg text-gray-400 mt-4 max-w-xl">
              Monelixa ile abonelik ve tek seferlik odemeleri tek panelden
              yonetin. Stripe ve PayTR entegrasyonu, otomatik fatura ve
              bildirimler tek pakette.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/login">
                <Button size="lg">
                  Hemen Basla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="secondary" size="lg">
                  Urunleri Incele
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                PCI DSS uyumlu
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Aninda kurulum
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/20 to-orange-500/10 blur-3xl" />
            <div className="relative bg-dark-900 border border-dark-700 rounded-3xl p-8">
              <div className="space-y-4">
                <div className="h-10 bg-dark-800 rounded-lg" />
                <div className="h-10 bg-dark-800 rounded-lg" />
                <div className="h-10 bg-dark-800 rounded-lg" />
              </div>
              <div className="mt-6 p-4 bg-dark-800 rounded-xl border border-dark-700">
                <p className="text-sm text-gray-400">Aylik gelir</p>
                <p className="text-3xl font-bold text-white mt-2">TRY 124,500</p>
                <div className="mt-4 h-2 bg-dark-700 rounded-full">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-brand-500 to-orange-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">+18% son 30 gun</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
