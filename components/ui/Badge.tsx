import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  secondary: 'bg-dark-800 text-gray-300 border-dark-600',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
