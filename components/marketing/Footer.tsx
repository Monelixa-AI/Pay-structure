import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';
import { Shield, Lock, CreditCard } from 'lucide-react';

const productLinks = [
  { href: '/pricing', label: 'Fiyatlandirma' },
  { href: '/products', label: 'Urunler' },
  { href: '/about', label: 'Hakkimizda' },
];

const supportLinks = [
  { href: '/contact', label: 'Iletisim' },
  { href: '/terms', label: 'Kullanim Sartlari' },
  { href: '/privacy', label: 'Gizlilik Politikasi' },
];

export default function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <LogoIcon size="md" />
              <span className="text-lg font-semibold text-white">Monelixa</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Dijital urunlerinizi guvenle satin. Stripe ve PayTR entegrasyonu
              ile tek noktadan odeme altyapisi.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Cloudflare
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                PCI DSS
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Urunler</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Destek</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Monelixa. Tum haklari saklidir.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              LinkedIn
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
