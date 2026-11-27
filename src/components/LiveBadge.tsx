import React from 'react';

interface LiveBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  label = 'LIVE',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-[11px] tracking-[0.06em] rounded-md'
      : 'px-2 py-0.5 text-[10px] tracking-[0.06em] rounded';

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-[#E50914] text-white font-semibold uppercase leading-none whitespace-nowrap shrink-0 ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
