'use client';

import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  ring?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  className,
}: AvatarProps) {
  const px = sizeMap[size];

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden',
        'flex items-center justify-center font-semibold',
        ring && 'ring-2 ring-accent ring-offset-2 ring-offset-bg-base',
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'h-full w-full flex items-center justify-center text-white',
            textSizeMap[size]
          )}
          style={{ backgroundColor: getColorFromName(name) }}
        >
          {getInitials(name || '?')}
        </div>
      )}
    </div>
  );
}
