import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Heart,
  ArrowUpDown,
  X,
  RefreshCw,
  Globe,
  MapPin,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Channel, ChannelCategory, PlaylistMode } from '../types/channel';
import { CATEGORIES, IPTV_SOURCES } from '../data/data';
import { ChannelCard } from '../components/ChannelCard';
import { MediaImage } from '../components/MediaImage';

interface DirectoryPageProps {
  channels: Channel[];
  loading: boolean;
  playlistMode: PlaylistMode;
  activeSources: string[];
  initialCategory?: ChannelCategory;
  favoriteIds: string[];
  customStreams: Record<string, string>;
  onWatchChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onSelectCategory: (category?: ChannelCategory) => void;
  onChangePlaylistMode: (mode: PlaylistMode) => void;
  onRefresh: () => void;
}

type SortOption = 'popularity' | 'alpha-asc' | 'alpha-desc';
type ViewMode = 'grid' | 'list';

const PAGE_SIZE = 48;

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  channels,
  loading,
  playlistMode,
  activeSources,
  initialCategory,
  favoriteIds,
  customStreams,
  onWatchChannel,
  onToggleFavorite,
  onSelectCategory,
  onChangePlaylistMode,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ChannelCategory>(
    initialCategory ?? 'All'
  );
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    setSelectedCategory(initialCategory ?? 'All');
  }, [initialCategory]);

  // Reset secondary filters & pagination when switching playlist modes
  useEffect(() => {
    setSelectedRegion('All');
    setSelectedSource('All');
    setVisibleCount(PAGE_SIZE);
  }, [playlistMode]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, selectedRegion, selectedSource, favoritesOnly, query, sortBy]);

  const activeCategoryMeta = useMemo(
    () =>
      selectedCategory === 'All'
        ? null
        : CATEGORIES.find((c) => c.id === selectedCategory) ?? null,
    [selectedCategory]
  );

  // Dynamically build available regions & GitHub HLS sources sorted by count
  const availableRegions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of channels) {
      counts.set(ch.region, (counts.get(ch.region) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [channels]);

  const availableSources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of channels) {
      const uniqueForChannel = new Set(ch.alternateStreams.map((s) => s.sourceName));
      uniqueForChannel.add(ch.sourceName);
      for (const src of uniqueForChannel) {
        counts.set(src, (counts.get(src) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [channels]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ch of channels) {
      counts[ch.category] = (counts[ch.category] ?? 0) + 1;
    }
    return counts;
  }, [channels]);

  const filteredChannels = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = channels.filter((ch) => {
      if (selectedCategory !== 'All' && ch.category !== selectedCategory) {
        return false;
      }
      if (selectedRegion !== 'All' && ch.region !== selectedRegion) {
        return false;
      }
      if (
        selectedSource !== 'All' &&
        ch.sourceName !== selectedSource &&
        !ch.alternateStreams.some((s) => s.sourceName === selectedSource)
      ) {
        return false;
      }
      if (favoritesOnly && !favoriteIds.includes(ch.id)) {
        return false;
      }
      if (!q) return true;
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.subGenre.toLowerCase().includes(q) ||
        ch.tvgId.toLowerCase().includes(q) ||
        ch.region.toLowerCase().includes(q) ||
        ch.country.toLowerCase().includes(q) ||
        ch.sourceName.toLowerCase().includes(q) ||
        ch.channelNumber.includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'alpha-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'alpha-desc') return b.name.localeCompare(a.name);
      return a.popularityRank - b.popularityRank;
    });
  }, [
    channels,
    selectedCategory,
    selectedRegion,
    selectedSource,
    favoritesOnly,
    favoriteIds,
    query,
    sortBy,
  ]);

  const displayedChannels = useMemo(
    () => filteredChannels.slice(0, visibleCount),
    [filteredChannels, visibleCount]
  );

  const hasMore = visibleCount < filteredChannels.length;

  const handleCategoryChange = (cat: 'All' | ChannelCategory) => {
    setSelectedCategory(cat);
    onSelectCategory(cat === 'All' ? undefined : cat);
  };

  const hasActiveFilters =
    favoritesOnly ||
    Boolean(query) ||
    selectedCategory !== 'All' ||
    selectedRegion !== 'All' ||
    selectedSource !== 'All';

  const modeTitle =
    playlistMode === 'global'
      ? 'All Global Channels'
      : playlistMode === 'india'
        ? 'All India Channels'
        : 'All Telugu Channels';

  return (
    <div className="flex flex-col gap-6">
      {/* Editorial Category Banner or All Channels Header */}
      {activeCategoryMeta ? (
        <section className="relative rounded-2xl overflow-hidden bg-[#111827] border border-[#1F2937]">
          <div className="absolute inset-0">
            <MediaImage
              src={activeCategoryMeta.thumbnail}
              alt={activeCategoryMeta.title}
              fallbackLabel={activeCategoryMeta.title}
              className="w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B12] via-[#080B12]/85 to-[#080B12]/40" />
          </div>
          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
                {IPTV_SOURCES[playlistMode].label} Category
              </p>
              <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                {activeCategoryMeta.title}
              </h1>
              <p className="text-sm text-[#D1D5DB] mt-2 leading-relaxed">
                {activeCategoryMeta.description}
              </p>
            </div>

            <div
              className="inline-flex items-center p-1 rounded-lg bg-[#080B12]/85 backdrop-blur-md border border-[#2C364B] self-start lg:self-end"
              role="group"
              aria-label="Channel feed mode"
            >
              {(['telugu', 'india', 'global'] as PlaylistMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChangePlaylistMode(m)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    playlistMode === m
                      ? 'bg-[#E50914] text-white'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {m === 'global' && <Globe className="w-3.5 h-3.5" />}
                  <span>{IPTV_SOURCES[m].label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Live Multi-Source GitHub HLS Directory
              {activeSources.length > 0 ? ` · ${activeSources.join(' · ')}` : ''}
            </p>
            <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
              {modeTitle}
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              {IPTV_SOURCES[playlistMode].description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div
              className="inline-flex items-center p-1 rounded-lg bg-[#111827] border border-[#1F2937]"
              role="group"
              aria-label="Channel feed mode"
            >
              <button
                type="button"
                onClick={() => onChangePlaylistMode('telugu')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  playlistMode === 'telugu'
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Telugu Live
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylistMode('india')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  playlistMode === 'india'
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                India Mode
              </button>
              <button
                type="button"
                onClick={() => onChangePlaylistMode('global')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  playlistMode === 'global'
                    ? 'bg-[#E50914] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Global Mode</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh playlists"
              className="h-9 px-3 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-xs font-medium text-[#D1D5DB] hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </section>
      )}

      {/* Filter & Controls Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-[#111827] border border-[#1F2937] p-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => handleCategoryChange('All')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors tabular-nums ${
              selectedCategory === 'All'
                ? 'bg-[#E50914] text-white'
                : 'bg-[#171D2A] text-[#9CA3AF] hover:text-white'
            }`}
          >
            All Channels ({channels.length.toLocaleString()})
          </button>
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors tabular-nums ${
                  active
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#171D2A] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {cat.title} ({count.toLocaleString()})
              </button>
            );
          })}
        </div>

        {/* Search + Country + GitHub Source + Sort + Favorites + Grid/List Controls */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="relative flex-1 xl:max-w-md">
            <Search
              className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                playlistMode === 'global'
                  ? 'Filter by channel, country, source, or number...'
                  : 'Filter channels by name, group, or number...'
              }
              aria-label="Filter channel directory"
              className="w-full h-10 bg-[#080B12] border border-[#1F2937] focus:border-[#E50914] rounded-lg pl-10 pr-9 text-sm text-white placeholder-[#9CA3AF] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#9CA3AF] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Country / Region Filter (shown whenever multiple regions exist) */}
            {availableRegions.length > 1 && (
              <div className="relative flex items-center">
                <MapPin
                  className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  aria-label="Filter by region or country"
                  className="h-10 pl-8 pr-7 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs font-medium text-white focus:border-[#E50914] focus:outline-none cursor-pointer max-w-[180px]"
                >
                  <option value="All">All Regions ({availableRegions.length})</option>
                  {availableRegions.map((reg) => (
                    <option key={reg.name} value={reg.name}>
                      {reg.name} ({reg.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* GitHub HLS Source Filter */}
            {availableSources.length > 1 && (
              <div className="relative flex items-center">
                <Layers
                  className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  aria-label="Filter by GitHub HLS source"
                  className="h-10 pl-8 pr-7 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs font-medium text-white focus:border-[#E50914] focus:outline-none cursor-pointer"
                >
                  <option value="All">All HLS Sources</option>
                  {availableSources.map((src) => (
                    <option key={src.name} value={src.name}>
                      {src.name} ({src.count.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown
                className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort channels"
                className="h-10 pl-8 pr-7 rounded-lg bg-[#080B12] border border-[#1F2937] text-xs font-medium text-white focus:border-[#E50914] focus:outline-none cursor-pointer"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="alpha-asc">Sort: A – Z</option>
                <option value="alpha-desc">Sort: Z – A</option>
              </select>
            </div>

            {/* Favorites Filter Toggle */}
            <button
              type="button"
              onClick={() => setFavoritesOnly((prev) => !prev)}
              aria-pressed={favoritesOnly}
              className={`h-10 px-3.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                favoritesOnly
                  ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                  : 'bg-[#080B12] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:border-[#374151]'
              }`}
            >
              <Heart
                className="w-3.5 h-3.5"
                fill={favoritesOnly ? '#E50914' : 'none'}
              />
              <span>Favorites</span>
            </button>

            {/* Grid / List View Switcher */}
            <div
              className="inline-flex items-center p-1 rounded-lg bg-[#080B12] border border-[#1F2937]"
              role="group"
              aria-label="Layout view"
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#171D2A] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#171D2A] text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
        <span className="tabular-nums">
          {loading && channels.length === 0 ? (
            `Syncing ${IPTV_SOURCES[playlistMode].label} playlists from GitHub...`
          ) : (
            <>
              Showing{' '}
              <strong className="text-white">
                {displayedChannels.length.toLocaleString()}
              </strong>{' '}
              of{' '}
              <strong className="text-white">
                {filteredChannels.length.toLocaleString()}
              </strong>{' '}
              {filteredChannels.length === 1 ? 'channel' : 'channels'}
            </>
          )}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFavoritesOnly(false);
              setSelectedRegion('All');
              setSelectedSource('All');
              handleCategoryChange('All');
            }}
            className="text-[#F5B942] hover:underline"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Channel Grid / List or Loading / Empty State */}
      {loading && channels.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#171D2A] border border-[#1F2937] overflow-hidden animate-pulse"
            >
              <div className="aspect-video w-full bg-[#111827]" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-36 bg-[#1F2937] rounded" />
                <div className="h-3 w-28 bg-[#1F2937] rounded" />
                <div className="h-10 w-full bg-[#1F2937] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-10 text-center flex flex-col items-center gap-3">
          <p className="text-base font-semibold text-white">No channels found</p>
          <p className="text-sm text-[#9CA3AF] max-w-md">
            Try clearing your search query, region filter, or switching to another mode.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFavoritesOnly(false);
              setSelectedRegion('All');
              setSelectedSource('All');
              handleCategoryChange('All');
            }}
            className="mt-2 px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors"
          >
            Show All Channels
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  variant="directory-grid"
                  isFavorite={favoriteIds.includes(channel.id)}
                  hasCustomStream={Boolean(customStreams[channel.id])}
                  onWatch={onWatchChannel}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  variant="directory-list"
                  isFavorite={favoriteIds.includes(channel.id)}
                  hasCustomStream={Boolean(customStreams[channel.id])}
                  onWatch={onWatchChannel}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#171D2A] border border-[#2C364B] hover:border-[#374151] hover:bg-[#1E2636] text-sm font-semibold text-white transition-colors tabular-nums"
              >
                <ChevronDown className="w-4 h-4 text-[#F5B942]" />
                <span>
                  Load More Channels ({(filteredChannels.length - visibleCount).toLocaleString()} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
