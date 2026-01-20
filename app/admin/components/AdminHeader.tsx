'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/types';
import {
  Bell,
  Search,
  LogOut,
  User,
  Shield,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminHeaderProps {
  admin: AdminUser;
}

export default function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      toast.success('Cikis yapildi');
      router.push('/login');
    } catch (error) {
      toast.error('Cikis yapilirken bir hata olustu');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* View Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Siteyi Gor
        </a>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
              <span className="text-brand-400 font-medium text-sm">
                {admin.full_name?.[0] || admin.email[0].toUpperCase()}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-dark-900 border border-dark-700 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-dark-700">
                    <p className="font-medium text-white">
                      {admin.full_name || 'Admin'}
                    </p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded-full">
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                      {admin.two_factor_enabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          <Shield className="w-3 h-3" />
                          2FA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/admin/settings/security');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profil Ayarlari
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Cikis yapiliyor...' : 'Cikis Yap'}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
