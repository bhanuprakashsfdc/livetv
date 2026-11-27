import React, { useState, useEffect } from 'react';

interface ChannelEmblemProps {
  shortCode: string;
  accentColor: string;
  logo?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChannelEmblem: React.FC<ChannelEmblemProps> = ({
  shortCode,
  accentColor,
  logo,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [logo]);

  const dims =
    size === 'sm'
      ? 'w-9 h-9 text-[11px] rounded-lg'
      : size === 'lg'
        ? 'w-14 h-14 text-sm rounded-xl'
        : 'w-11 h-11 text-xs rounded-xl';

  if (logo && !imgFailed) {
    return (
      <div
        className={`${dims} bg-[#111827] border border-[#2C364B] flex items-center justify-center overflow-hidden p-1.5 shrink-0 select-none ${className}`}
      >
        <img
          src={logo}
          alt={name ? `${name} logo` : `${shortCode} logo`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${dims} bg-[#1E2636] border border-[#2C364B] flex items-center justify-center font-bold tracking-tight shrink-0 select-none ${className}`}
      style={{ color: accentColor }}
      aria-hidden="true"
    >
      {shortCode}
    </div>
  );
};
