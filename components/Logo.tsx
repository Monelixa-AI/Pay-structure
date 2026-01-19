'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'dark' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}

const sizes = {
  sm: { width: 100, height: 32 },
  md: { width: 140, height: 44 },
  lg: { width: 180, height: 56 },
  xl: { width: 220, height: 68 },
};

export function Logo({
  variant = 'default',
  size = 'md',
  className,
  logoUrl,
  logoDarkUrl,
}: LogoProps) {
  const { width, height } = sizes[size];

  const url = variant === 'dark' ? (logoDarkUrl || logoUrl) : logoUrl;

  if (url) {
    return (
      <Image
        src={url}
        alt="Monelixa"
        width={width}
        height={height}
        className={cn('object-contain', className)}
        priority
      />
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <span
        className={cn(
          'font-bold gradient-text',
          size === 'sm' && 'text-xl',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          size === 'xl' && 'text-4xl'
        )}
      >
        Monelixa
      </span>
    </div>
  );
}

export function LogoIcon({
  size = 'md',
  className,
  faviconUrl,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  faviconUrl?: string | null;
}) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };
  const iconSize = iconSizes[size];

  if (faviconUrl) {
    return (
      <Image
        src={faviconUrl}
        alt="Monelixa"
        width={iconSize}
        height={iconSize}
        className={cn('object-contain', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-orange-500',
        className
      )}
      style={{ width: iconSize, height: iconSize }}
    >
      <span
        className="font-bold text-white"
        style={{ fontSize: iconSize * 0.5 }}
      >
        M
      </span>
    </div>
  );
}
