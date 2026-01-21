'use client';

import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityBadgesProps {
  showCloudflare?: boolean;
  variant?: 'compact' | 'full';
}

export function SecurityBadges({
  showCloudflare = true,
  variant = 'compact',
}: SecurityBadgesProps) {
  const badges = [
    {
      icon: Lock,
      text: '256-bit SSL',
      color: 'text-green-400',
    },
    {
      icon: Shield,
      text: showCloudflare ? 'Cloudflare Korumalı' : 'Güvenli',
      color: 'text-blue-400',
    },
    {
      icon: CreditCard,
      text: 'PCI DSS Uyumlu',
      color: 'text-purple-400',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-1.5 text-xs text-gray-400"
          >
            <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
            <span>{badge.text}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="font-medium text-white">Güvenlik Sertifikaları</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 bg-dark-800 rounded-lg"
          >
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-sm text-gray-300">{badge.text}</span>
          </motion.div>
        ))}
      </div>
      {showCloudflare && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Bu sayfa Cloudflare ile son güvenlik teknolojileri kullanılarak
          korunmaktadır.
        </p>
      )}
    </div>
  );
}

// Stripe güvenlik bilgisi komponenti
export function StripeSecurity() {
  return (
    <div className="bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg
          className="w-10 h-6"
          viewBox="0 0 60 25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#635BFF"
            d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a12.54 12.54 0 0 1-4.56.82c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.76zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM34.78 18.92h4.22V5.42h-4.22v13.5zm0-15.47h4.22V0h-4.22v3.45zM41.46 18.92h4.22V5.42h-4.22v13.5zm0-15.47h4.22V0h-4.22v3.45zm-29.1 4.27c0-1.3.28-2.23.83-2.8.55-.56 1.32-.84 2.32-.84.95 0 1.72.26 2.33.8.6.52.9 1.32.9 2.38v.24c0 1.07-.3 1.87-.9 2.4-.6.54-1.38.8-2.33.8-1 0-1.77-.28-2.32-.84-.55-.57-.83-1.5-.83-2.8v-.34zm-4.22 1.3c0 2.15.57 3.73 1.7 4.75 1.14 1.02 2.81 1.53 5.01 1.53 2.2 0 3.87-.5 5.01-1.52 1.13-1.02 1.7-2.6 1.7-4.76v-.95c0-2.15-.57-3.73-1.7-4.75-1.14-1.02-2.81-1.53-5.01-1.53-2.2 0-3.87.5-5.01 1.52-1.13 1.02-1.7 2.6-1.7 4.76v.95zM0 18.92h4.22v-8.2c0-.57.2-1.04.57-1.4.39-.36.87-.54 1.45-.54.7 0 1.2.23 1.52.69.32.46.48 1.17.48 2.14v7.31h4.22v-8.2c0-.57.19-1.04.56-1.4.37-.36.85-.54 1.43-.54.7 0 1.22.22 1.54.67.32.46.49 1.17.49 2.16v7.31h4.22v-8c0-1.95-.42-3.4-1.27-4.35-.85-.94-2.1-1.42-3.75-1.42-.9 0-1.74.2-2.52.6-.78.4-1.4.95-1.85 1.66h-.06c-.38-.7-.92-1.25-1.63-1.64-.7-.4-1.49-.6-2.37-.6-.82 0-1.56.17-2.22.52-.66.35-1.18.83-1.57 1.44h-.06V5.42H0v13.5z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-300">Powered by Stripe</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        Tüm ödeme işlemleri Stripe tarafından güvenli bir şekilde
        gerçekleştirilir. Kart bilgileriniz bizim sunucularımızda saklanmaz,
        doğrudan Stripe altyapısı üzerinden işlenir.
      </p>
      <div className="flex items-center justify-center gap-4 mt-3">
        <img src="/visa.svg" alt="Visa" className="h-8" />
        <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
        <img src="/amex.svg" alt="Amex" className="h-8" />
      </div>
    </div>
  );
}
