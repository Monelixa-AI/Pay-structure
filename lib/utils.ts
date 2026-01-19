import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'TRY'): string {
  const locales: Record<string, string> = {
    TRY: 'tr-TR',
    USD: 'en-US',
    EUR: 'de-DE',
  };

  return new Intl.NumberFormat(locales[currency] || 'tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Date formatting
export function formatDate(
  date: string | Date,
  optionsOrIncludeTime?: Intl.DateTimeFormatOptions | boolean
): string {
  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (typeof optionsOrIncludeTime === 'boolean') {
    if (optionsOrIncludeTime) {
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
    }
  } else if (optionsOrIncludeTime) {
    options = optionsOrIncludeTime;
  }

  return new Intl.DateTimeFormat('tr-TR', options).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az once';
  if (diffMins < 60) return `${diffMins} dakika once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;

  return formatDate(date);
}

// Percentage helpers
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function calculateDiscount(monthly: number, yearly: number): number {
  const yearlyMonthly = yearly / 12;
  return Math.round(((monthly - yearlyMonthly) / monthly) * 100);
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// String helpers
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\u011f/g, 'g')
    .replace(/\u00fc/g, 'u')
    .replace(/\u015f/g, 's')
    .replace(/\u0131/g, 'i')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00e7/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Status badge helpers
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    canceled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    past_due: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return colors[status] || colors.pending;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Aktif',
    completed: 'Tamamlandi',
    pending: 'Bekliyor',
    processing: 'Isleniyor',
    canceled: 'Iptal Edildi',
    cancelled: 'Iptal Edildi',
    failed: 'Basarisiz',
    refunded: 'Iade Edildi',
    past_due: 'Vadesi Gecmis',
    incomplete: 'Tamamlanmadi',
    expired: 'Suresi Dolmus',
  };

  return labels[status] || status;
}
