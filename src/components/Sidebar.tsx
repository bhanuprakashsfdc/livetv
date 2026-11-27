import React from 'react';
import {
  Home,
  Radio,
  Newspaper,
  Tv,
  Film,
  Sparkles,
  Music,
  Smile,
  Heart,
  History,
  Settings,
  Info,
  Shield,
  X,
  LayoutGrid,
} from 'lucide-react';
import { AppRoute, ChannelCategory } from '../types/channel';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  favoritesCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: AppRoute;
  isActive: (route: AppRoute) => boolean;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  route,
  onNavigate,
  favoritesCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const categoryMatch = (cat: ChannelCategory) => (r: AppRoute) =>
    r.view === 'directory' && r.category === cat;

  const primaryItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: { view: 'home' },
      isActive: (r) => r.view === 'home',
    },
    {
      id: 'live',
      label: 'Live TV',
      icon: Radio,
      route: { view: 'live' },
      isActive: (r) => r.view === 'live',
    },
    {
      id: 'all-channels',
      label: 'All Channels',
      icon: LayoutGrid,
      route: { view: 'directory' },
      isActive: (r) => r.view === 'directory' && !r.category,
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      route: { view: 'directory', category: 'News' },
      isActive: categoryMatch('News'),
    },
    {
      id: 'entertainment',
      label: 'Entertainment',
      icon: Tv,
      route: { view: 'directory', category: 'Entertainment' },
      isActive: categoryMatch('Entertainment'),
    },
    {
      id: 'movies',
      label: 'Movies',
      icon: Film,
      route: { view: 'directory', category: 'Movies' },
      isActive: categoryMatch('Movies'),
    },
    {
      id: 'devotional',
      label: 'Devotional',
      icon: Sparkles,
      route: { view: 'directory', category: 'Devotional' },
      isActive: categoryMatch('Devotional'),
    },
    {
      id: 'music',
      label: 'Music',
      icon: Music,
      route: { view: 'directory', category: 'Music' },
      isActive: categoryMatch('Music'),
    },
    {
      id: 'kids',
      label: 'Kids',
      icon: Smile,
      route: { view: 'directory', category: 'Kids' },
      isActive: categoryMatch('Kids'),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      route: { view: 'favorites' },
      isActive: (r) => r.view === 'favorites',
      count: favoritesCount,
    },
    {
      id: 'recent',
      label: 'Recently Watched',
      icon: History,
      route: { view: 'recent' },
      isActive: (r) => r.view === 'recent',
    },
  ];

  const bottomItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      route: { view: 'settings' },
      isActive: (r) => r.view === 'settings',
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      route: { view: 'about' },
      isActive: (r) => r.view === 'about',
    },
    {
      id: 'privacy',
      label: 'Privacy Policy',
      icon: Shield,
      route: { view: 'privacy' },
      isActive: (r) => r.view === 'privacy',
    },
  ];

  const handleSelect = (nextRoute: AppRoute) => {
    onNavigate(nextRoute);
    onCloseMobile();
  };

  const renderNavButton = (item: NavItem) => {
    const active = item.isActive(route);
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.route)}
        aria-current={active ? 'page' : undefined}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? 'bg-[#E50914] text-white'
            : 'text-[#9CA3AF] hover:bg-[#171D2A] hover:text-white'
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <Icon className="w-[18px] h-[18px] shrink-0" />
          <span className="truncate">{item.label}</span>
        </span>
        {typeof item.count === 'number' && item.count > 0 && (
          <span
            className={`text-xs tabular-nums font-mono ${
              active ? 'text-white/90' : 'text-[#9CA3AF]'
            }`}
          >
            {item.count}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full py-5 px-4 overflow-y-auto no-scrollbar">
      <div>
        <div className="flex items-center justify-between px-1 mb-6">
          <BrandLogo showTagline onClick={() => handleSelect({ view: 'home' })} />
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-[#171D2A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex flex-col gap-1">
          {primaryItems.map(renderNavButton)}
        </nav>
      </div>

      <nav
        aria-label="Platform information"
        className="flex flex-col gap-1 pt-4 mt-6 border-t border-[#1F2937]"
      >
        {bottomItems.map(renderNavButton)}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop fixed left sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#0D111A] border-r border-[#1F2937] z-40">
        {sidebarContent}
      </aside>

      {/* Tablet / collapsible overlay sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[82vw] h-full bg-[#0D111A] border-r border-[#1F2937] z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
