import React from 'react';

interface BrandLogoProps {
  showTagline?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  showTagline = false,
  compact = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-left group focus-visible:rounded-lg shrink-0"
      aria-label="Telugu Live TV Home"
    >
      <div
        className={`${
          compact ? 'w-8 h-8' : 'w-9 h-9'
        } rounded-lg bg-[#171D2A] border border-[#2A3346] flex items-center justify-center shrink-0 group-hover:border-[#E50914]/60 transition-colors`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <rect
            x="2.5"
            y="5.5"
            width="23"
            height="15.5"
            rx="3"
            stroke="#E50914"
            strokeWidth="2"
          />
          <path d="M12 10.2L17.2 13.25L12 16.3V10.2Z" fill="#FFFFFF" />
          <path
            d="M9 23.5H19"
            stroke="#F5B942"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-[15px] leading-tight text-white tracking-tight whitespace-nowrap">
          Telugu Live TV
        </div>
        {showTagline && (
          <div className="text-[11px] leading-tight text-[#9CA3AF] mt-0.5 whitespace-nowrap">
            Mana Telugu Entertainment
          </div>
        )}
      </div>
    </button>
  );
};
