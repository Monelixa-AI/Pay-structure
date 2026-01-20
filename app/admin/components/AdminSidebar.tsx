'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Mail,
  Shield,
  ChevronDown,
  Image,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  admin: AdminUser;
}

const menuItems = [
  {
    title: 'Genel',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Urunler', href: '/admin/products', icon: Package },
      { name: 'Abonelikler', href: '/admin/subscriptions', icon: CreditCard },
      { name: 'Siparisler', href: '/admin/orders', icon: FileText },
      { name: 'Musteriler', href: '/admin/customers', icon: Users },
    ],
  },
  {
    title: 'Iletisim',
    items: [
      { name: 'Mesajlar', href: '/admin/contacts', icon: MessageSquare },
      { name: 'Email Sablonlari', href: '/admin/email-templates', icon: Mail },
      { name: 'Email Logs', href: '/admin/email-logs', icon: Mail },
    ],
  },
  {
    title: 'Ayarlar',
    items: [
      { name: 'Genel Ayarlar', href: '/admin/settings', icon: Settings },
      { name: 'Logo & Marka', href: '/admin/settings/branding', icon: Image },
      { name: 'Odeme Ayarlari', href: '/admin/settings/payments', icon: CreditCard },
      { name: 'Email Ayarlari', href: '/admin/settings/email', icon: Mail },
      { name: 'Guvenlik', href: '/admin/settings/security', icon: Shield },
    ],
  },
];

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Genel',
    'Ayarlar',
  ]);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-center border-b border-dark-700">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">Monelixa</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuItems.map((group) => (
          <div key={group.title}>
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400"
            >
              {group.title}
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  expandedGroups.includes(group.title) && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {expandedGroups.includes(group.title) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                            isActive
                              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                              : 'text-gray-400 hover:text-white hover:bg-dark-800'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
            <span className="text-brand-400 font-medium">
              {admin.full_name?.[0] || admin.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {admin.full_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          </div>
          {admin.two_factor_enabled && (
            <span title="2FA active">
              <Shield className="w-4 h-4 text-green-400" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-800 border border-dark-700 rounded-lg"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-dark-700 z-50 flex flex-col"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-dark-900 border-r border-dark-700 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
