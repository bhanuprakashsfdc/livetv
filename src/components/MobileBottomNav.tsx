import React from 'react';
import { Home, Radio, LayoutGrid, Heart } from 'lucide-react';
import { AppRoute } from '../types/channel';

interface MobileBottomNavProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  route,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      active: route.view === 'home',
      onClick: () => onNavigate({ view: 'home' }),
    },
    {
      id: 'live',
      label: 'Live',
      icon: Radio,
      active: route.view === 'live',
      onClick: () => onNavigate({ view: 'live' }),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: LayoutGrid,
      active: route.view === 'directory' || route.view === 'search',
      onClick: () => onNavigate({ view: 'directory' }),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      active: route.view === 'favorites',
      onClick: () => onNavigate({ view: 'favorites' }),
    },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0D111A]/95 backdrop-blur-md border-t border-[#1F2937]"
    >
      <div className="grid grid-cols-4 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              aria-current={tab.active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors ${
                tab.active ? 'text-[#E50914]' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
