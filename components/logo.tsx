import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <div className={cn('flex items-center gap-2 font-display font-semibold', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sprout size={iconSize} />
      </span>
      <span className={cn('tracking-tight text-foreground', textSize)}>
        Crop<span className="text-primary">Wise</span>
      </span>
    </div>
  );
}
