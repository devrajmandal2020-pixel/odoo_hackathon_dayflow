import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, name, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const displayName = alt || name || '';
  const displayFallback = fallback || getInitials(displayName);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={displayName}
        onError={() => setImgError(true)}
        className={`
          rounded-full object-cover
          ring-2 ring-white shadow-sm
          ${sizes[size]}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full flex items-center justify-center
        bg-primary-light text-primary font-semibold
        ring-2 ring-white shadow-sm
        ${sizes[size]}
        ${className}
      `}
    >
      {displayFallback}
    </div>
  );
}
