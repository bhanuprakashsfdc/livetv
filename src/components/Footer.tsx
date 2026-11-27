import React from 'react';
import { AppRoute } from '../types/channel';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const links: { label: string; route: AppRoute }[] = [
    { label: 'About Telugu Live TV', route: { view: 'about' } },
    { label: 'Contact', route: { view: 'contact' } },
    { label: 'Privacy Policy', route: { view: 'privacy' } },
    { label: 'Terms of Service', route: { view: 'terms' } },
  ];

  return (
    <footer className="w-full bg-[#0D111A] border-t border-[#1F2937] mt-12 pb-20 md:pb-0">
      <div className="px-4 md:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#9CA3AF]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.route)}
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="text-[#9CA3AF]">
          © {new Date().getFullYear()} Telugu Live TV — Mana Telugu Entertainment. Free-to-air broadcaster directory.
        </div>
      </div>
    </footer>
  );
};
