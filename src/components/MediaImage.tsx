import React, { useState } from 'react';
import { Tv } from 'lucide-react';

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fallbackAccent?: string;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackLabel = 'Telugu Live TV',
  fallbackAccent = '#E50914',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-[#111827] text-center p-4 select-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 25%, ${fallbackAccent}22, transparent 60%)`,
        }}
        role="img"
        aria-label={alt}
      >
        <Tv className="w-7 h-7 text-[#9CA3AF] mb-2" strokeWidth={1.6} />
        <span className="text-xs font-medium text-[#9CA3AF] max-w-[85%] truncate">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
