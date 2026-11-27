import React, { useRef, useEffect } from 'react';
import { Menu, Search, X, LayoutGrid, Globe } from 'lucide-react';
import { AppRoute, PlaylistMode } from '../types/channel';
import { BrandLogo } from './BrandLogo';

interface TopHeaderProps {
  searchQuery: string;
  playlistMode: PlaylistMode;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onChangePlaylistMode: (mode: PlaylistMode) => void;
  onOpenDrawer: () => void;
  onNavigate: (route: AppRoute) => void;
  route: AppRoute;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  playlistMode,
  onSearchChange,
  onSearchSubmit,
  onChangePlaylistMode,
  onOpenDrawer,
  onNavigate,
  route,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSlashShortcut = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleSlashShortcut);
    return () => window.removeEventListener('keydown', handleSlashShortcut);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchQuery);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 md:h-16 bg-[#080B12]/90 backdrop-blur-xl border-b border-[#1F2937] z-30">
      <div className="h-full w-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Tablet drawer toggle + compact mobile/tablet brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            className="hidden md:flex lg:hidden w-10 h-10 rounded-lg items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-[#171D2A] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden">
            <BrandLogo compact onClick={() => onNavigate({ view: 'home' })} />
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'directory' })}
              className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                route.view === 'directory' && !route.category
                  ? 'text-white'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              All Channels
            </button>
            <button
              type="button"
              onClick={() => {
                if (playlistMode !== 'global') {
                  onChangePlaylistMode('global');
                }
                onNavigate({ view: 'directory' });
              }}
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                playlistMode === 'global'
                  ? 'text-[#F5B942]'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Mode</span>
            </button>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-md relative">
          <Search
            className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              playlistMode === 'global'
                ? 'Search global channels, countries, or genres...'
                : playlistMode === 'india'
                  ? 'Search Indian channels...'
                  : 'Search Telugu channels...'
            }
            aria-label="Search live channels"
            className="w-full h-10 bg-[#111827] border border-[#1F2937] focus:border-[#E50914] rounded-lg pl-10 pr-9 text-sm text-white placeholder-[#9CA3AF] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#9CA3AF] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate({ view: 'directory' })}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] hover:bg-[#1E2636] text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#F5B942]" />
            <span>Channel Directory</span>
          </button>
        </div>
      </div>
    </header>
  );
};
