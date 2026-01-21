'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { Logo, LogoIcon } from '@/components/Logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/pricing', label: 'Fiyatlandırma' },
  { href: '/products', label: 'Ürünler' },
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact', label: 'İletişim' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-dark-950/90 border-b border-dark-800 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon size="md" />
          <Logo size="sm" className="hidden sm:flex" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Güvenli ödeme
          </div>
          <Link href="/login">
            <Button size="sm">Giriş</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 rounded-lg border border-dark-700 text-gray-300 hover:text-white hover:border-dark-600"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 transition-opacity',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setIsOpen(false)}
        />
        <div className="absolute top-0 right-0 w-72 h-full bg-dark-950 border-l border-dark-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg border border-dark-700 text-gray-300 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Giriş</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
