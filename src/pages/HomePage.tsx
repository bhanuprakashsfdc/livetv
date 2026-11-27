import React from 'react';
import {
  Play,
  Compass,
  History,
  PlayCircle,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import {
  AppRoute,
  Channel,
  ChannelCategory,
  PlaylistMode,
  WatchHistoryEntry,
} from '../types/channel';
import {
  CATEGORIES,
  HERO_BANNER_IMAGE,
  IPTV_SOURCES,
  formatRelativeWatchTime,
} from '../data/data';
import { LiveBadge } from '../components/LiveBadge';
import { ChannelCarousel } from '../components/ChannelCarousel';
import { ChannelCard } from '../components/ChannelCard';
import { CategoryCard } from '../components/CategoryCard';
import { ChannelEmblem } from '../components/ChannelEmblem';
import { MediaImage } from '../components/MediaImage';

interface HomePageProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  playlistMode: PlaylistMode;
  activeSources: string[];
  favoriteIds: string[];
  watchHistory: WatchHistoryEntry[];
  customStreams: Record<string, string>;
  onWatchChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onChangePlaylistMode: (mode: PlaylistMode) => void;
  onRefresh: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  channels,
  loading,
  error,
  playlistMode,
  activeSources,
  favoriteIds,
  watchHistory,
  customStreams,
  onWatchChannel,
  onToggleFavorite,
  onChangePlaylistMode,
  onRefresh,
  onNavigate,
}) => {
  const liveNowChannels = channels.filter((c) => c.featuredInLiveRail);
  const displayLiveRail =
    liveNowChannels.length > 0 ? liveNowChannels : channels.slice(0, 12);

  const popularChannels = [...channels]
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, 8);

  const recentEntries = watchHistory
    .map((entry) => {
      const ch = channels.find((c) => c.id === entry.channelId);
      return ch ? { channel: ch, watchedAt: entry.watchedAt } : null;
    })
    .filter(
      (item): item is { channel: Channel; watchedAt: number } => item !== null
    );

  const getCategoryCount = (cat: ChannelCategory) =>
    channels.filter((c) => c.category === cat).length;

  const firstFeaturedChannel = displayLiveRail[0] ?? channels[0];

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {/* 1. Featured Hero Banner */}
      <section className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#111827] border border-[#1F2937]">
        <div className="absolute inset-0">
          <MediaImage
            src={HERO_BANNER_IMAGE}
            alt="Telugu television broadcast control studio in Hyderabad"
            fallbackLabel="Telugu Live TV"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B12] via-[#080B12]/85 to-[#080B12]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-[#080B12]/40" />
        </div>

        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-12 lg:py-16 max-w-3xl flex flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <LiveBadge label="LIVE NOW" size="md" />
            <span className="text-xs text-[#D1D5DB] font-medium tabular-nums">
              {loading
                ? `Syncing ${IPTV_SOURCES[playlistMode].label} GitHub HLS playlists...`
                : `${channels.length.toLocaleString()} ${IPTV_SOURCES[playlistMode].label} channels${
                    activeSources.length > 0 ? ` · ${activeSources.join(' + ')}` : ''
                  }`}
            </span>
          </div>

          <h1 className="font-bold text-3xl sm:text-4xl lg:text-[48px] leading-[1.12] tracking-[-0.02em] text-white">
            {playlistMode === 'global'
              ? 'Watch Global TV Live'
              : playlistMode === 'india'
                ? 'Watch Indian TV Live'
                : 'Watch Telugu TV Live'}
          </h1>

          <p className="text-base sm:text-xl font-medium text-[#E5E7EB]">
            {playlistMode === 'global'
              ? 'Worldwide live channels from Free-TV, iptv-org, Samsung TV Plus & Pluto TV.'
              : playlistMode === 'india'
                ? 'Indian national & regional live channels, all in one place.'
                : 'Your favorite Telugu channels, all in one place.'}
          </p>

          <p className="text-sm sm:text-base text-[#9CA3AF] max-w-xl leading-relaxed">
            {playlistMode === 'global'
              ? 'Explore thousands of free-to-air & FAST live HLS broadcasts across 100+ countries with multi-source GitHub failover.'
              : 'All Your Favorite Telugu TV Channels. One Place. Free to Watch.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={!firstFeaturedChannel}
              onClick={() =>
                firstFeaturedChannel && onWatchChannel(firstFeaturedChannel)
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E50914] hover:bg-[#C50812] disabled:opacity-50 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Live</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate({ view: 'directory' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#171D2A]/90 backdrop-blur-md border border-[#2C364B] hover:bg-[#1E2636] hover:border-[#374151] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Compass className="w-4 h-4 text-[#F5B942]" />
              <span>All Channels</span>
            </button>

            {/* Telugu / India / Global Mode Switcher */}
            <div
              className="inline-flex items-center p-1 rounded-lg bg-[#080B12]/80 backdrop-blur-md border border-[#2C364B]"
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
          </div>
        </div>
      </section>

      {/* Error State Banner if live iptv-org fetch fails */}
      {error && channels.length === 0 && (
        <section className="rounded-2xl bg-[#171D2A] border border-[#E50914]/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF8A90] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                Could not fetch live iptv-org channel playlist
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Sync</span>
          </button>
        </section>
      )}

      {/* 2. LIVE NOW Section */}
      <ChannelCarousel
        title="LIVE NOW"
        subtitle={
          loading
            ? 'Loading live streams...'
            : `${displayLiveRail.length} featured · ${channels.length} total`
        }
        titlePrefix={
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#E50914] shrink-0"
            aria-hidden="true"
          />
        }
        action={
          <div className="flex items-center gap-3 mr-1">
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh live channel playlist"
              className="text-xs font-medium text-[#9CA3AF] hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ view: 'directory' })}
              className="text-xs font-medium text-[#9CA3AF] hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      >
        {loading && channels.length === 0
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[290px] sm:w-[320px] rounded-2xl bg-[#171D2A] border border-[#1F2937] overflow-hidden animate-pulse"
              >
                <div className="aspect-video w-full bg-[#111827]" />
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-[#1F2937] rounded" />
                    <div className="h-3 w-24 bg-[#1F2937] rounded" />
                  </div>
                  <div className="h-8 w-20 bg-[#1F2937] rounded-lg" />
                </div>
              </div>
            ))
          : displayLiveRail.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                variant="live-carousel"
                isFavorite={favoriteIds.includes(channel.id)}
                hasCustomStream={Boolean(customStreams[channel.id])}
                onWatch={onWatchChannel}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
      </ChannelCarousel>

      {/* 3. Browse by Category */}
      <section className="flex flex-col gap-4" id="browse-categories">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
              Curated Genres
            </p>
            <h2 className="font-semibold text-xl md:text-2xl text-white tracking-tight mt-1">
              Browse by Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'directory' })}
            className="text-xs font-medium text-[#9CA3AF] hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <span>All categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              channelCount={getCategoryCount(category.id)}
              spanWide={category.id === 'Educational'}
              onSelect={(cat) => onNavigate({ view: 'directory', category: cat })}
            />
          ))}
        </div>
      </section>

      {/* 4. Popular Channels */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#E50914] tracking-wide">
              Most Watched
            </p>
            <h2 className="font-semibold text-xl md:text-2xl text-white tracking-tight mt-1">
              Popular Channels
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'directory' })}
            className="text-xs font-medium text-[#9CA3AF] hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
          >
            <span>Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading && channels.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-20 rounded-2xl bg-[#171D2A] border border-[#1F2937] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                variant="popular-compact"
                isFavorite={favoriteIds.includes(channel.id)}
                hasCustomStream={Boolean(customStreams[channel.id])}
                onWatch={onWatchChannel}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Recently Watched */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#9CA3AF]" />
            <h2 className="font-semibold text-xl md:text-2xl text-white tracking-tight">
              Recently Watched
            </h2>
          </div>
          {recentEntries.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate({ view: 'recent' })}
              className="text-xs font-medium text-[#9CA3AF] hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <span>Full history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentEntries.length === 0 ? (
          <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6 text-sm text-[#9CA3AF]">
            Channels you open in the Live TV player will appear here for quick access.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentEntries.map(({ channel, watchedAt }) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onWatchChannel(channel)}
                className="flex-shrink-0 w-64 sm:w-72 rounded-2xl bg-[#111827] border border-[#1F2937] hover:border-[#374151] hover:bg-[#171D2A] p-4 flex items-center gap-3.5 text-left transition-colors group"
              >
                <ChannelEmblem
                  shortCode={channel.shortCode}
                  accentColor={channel.accentColor}
                  logo={channel.logo}
                  name={channel.name}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
                    {formatRelativeWatchTime(watchedAt)}
                  </p>
                </div>
                <PlayCircle className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#E50914] shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
