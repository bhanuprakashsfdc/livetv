import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Share2,
  Search,
  Radio,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Tv,
  Globe,
} from 'lucide-react';
import {
  AppRoute,
  Channel,
  ChannelCategory,
  PlayerSettings,
} from '../types/channel';
import { VideoPlayer } from '../components/VideoPlayer';
import { ChannelEmblem } from '../components/ChannelEmblem';
import { LiveBadge } from '../components/LiveBadge';

interface LivePlayerPageProps {
  channel: Channel;
  channels: Channel[];
  favoriteIds: string[];
  settings: PlayerSettings;
  onSelectChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onSaveCustomStream: (channelId: string, url: string) => void;
  onNavigate: (route: AppRoute) => void;
  onNotify: (message: string) => void;
}

const FILTER_TABS: ('All' | ChannelCategory)[] = [
  'All',
  'News',
  'Entertainment',
  'Movies',
  'Devotional',
  'Music',
  'Kids',
  'Educational',
];

export const LivePlayerPage: React.FC<LivePlayerPageProps> = ({
  channel,
  channels,
  favoriteIds,
  settings,
  onSelectChannel,
  onToggleFavorite,
  onSaveCustomStream,
  onNavigate,
  onNotify,
}) => {
  const [switcherFilter, setSwitcherFilter] = useState<'All' | ChannelCategory>('All');
  const [switcherQuery, setSwitcherQuery] = useState('');
  const [switcherLimit, setSwitcherLimit] = useState(60);

  const isFavorite = favoriteIds.includes(channel.id);
  const resolvedStreamUrl =
    settings.customStreams[channel.id] ?? channel.streamUrl;

  useEffect(() => {
    setSwitcherLimit(60);
  }, [switcherFilter, switcherQuery, channels.length]);

  const filteredChannels = useMemo(() => {
    return channels.filter((item) => {
      const matchesCategory =
        switcherFilter === 'All' || item.category === switcherFilter;
      const q = switcherQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subGenre.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        item.channelNumber.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [channels, switcherFilter, switcherQuery]);

  const visibleSwitcherChannels = useMemo(
    () => filteredChannels.slice(0, switcherLimit),
    [filteredChannels, switcherLimit]
  );

  const currentIndex = channels.findIndex((c) => c.id === channel.id);

  const switchRelative = useCallback(
    (delta: number) => {
      if (channels.length === 0) return;
      const baseIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (baseIndex + delta + channels.length) % channels.length;
      onSelectChannel(channels[nextIndex]);
    },
    [channels, currentIndex, onSelectChannel]
  );

  const handlePrevChannel = useCallback(() => {
    switchRelative(-1);
  }, [switchRelative]);

  const handleNextChannel = useCallback(() => {
    switchRelative(1);
  }, [switchRelative]);

  // Smart TV / Keyboard channel zapping (Alt+Up/Down or remote ChannelUp/ChannelDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ChannelUp' || (e.altKey && e.key === 'ArrowUp')) {
        e.preventDefault();
        switchRelative(-1);
      } else if (e.key === 'ChannelDown' || (e.altKey && e.key === 'ArrowDown')) {
        e.preventDefault();
        switchRelative(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [switchRelative]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#watch/${channel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${channel.name} — Telugu Live TV`,
          text: `Watch ${channel.name} on Telugu Live TV`,
          url: shareUrl,
        });
        return;
      }
    } catch {
      // Fall back to clipboard
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      onNotify(`Link copied for ${channel.name}`);
    } catch {
      onNotify(`Share link ready: #watch/${channel.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Compact Breadcrumb / Channel Zapping Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate({ view: 'home' })}
          className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums text-[#9CA3AF] mr-1">
            CH {channel.channelNumber}
          </span>
          <button
            type="button"
            onClick={() => switchRelative(-1)}
            aria-label="Previous channel"
            className="h-9 px-3 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-xs font-medium text-white inline-flex items-center gap-1 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <button
            type="button"
            onClick={() => switchRelative(1)}
            aria-label="Next channel"
            className="h-9 px-3 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-xs font-medium text-white inline-flex items-center gap-1 transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split: Player + Info on Left, Channel Switcher on Right (Desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: 16:9 Player + Channel Details */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          <VideoPlayer
            channel={channel}
            resolvedStreamUrl={resolvedStreamUrl}
            defaultVolume={settings.defaultVolume}
            autoReconnect={settings.autoReconnect}
            showWatermark={settings.showWatermark}
            onSaveCustomStream={onSaveCustomStream}
            onNotify={onNotify}
            onPrevChannel={handlePrevChannel}
            onNextChannel={handleNextChannel}
          />

          {/* Player Information Panel */}
          <div className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <ChannelEmblem
                  shortCode={channel.shortCode}
                  accentColor={channel.accentColor}
                  logo={channel.logo}
                  name={channel.name}
                  size="lg"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-bold text-xl sm:text-2xl text-white tracking-tight truncate">
                      {channel.name}
                    </h1>
                    {channel.isLive && <LiveBadge />}
                  </div>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                    {channel.category} · {channel.subGenre} · {channel.quality} · {channel.region}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(channel.id)}
                  className={`h-10 px-4 rounded-lg border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                    isFavorite
                      ? 'bg-[#E50914] border-[#E50914] text-white'
                      : 'bg-[#111827] border-[#2C364B] hover:border-[#374151] text-white'
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isFavorite ? 'currentColor' : 'none'}
                  />
                  <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-10 px-4 rounded-lg bg-[#111827] border border-[#2C364B] hover:border-[#374151] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-[#D1D5DB] leading-relaxed">
              {channel.description}
            </p>

            {/* Live Stream Metadata Strip (from iptv-org data points) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1F2937]">
              <div className="flex items-start gap-3">
                <Radio className="w-4 h-4 text-[#E50914] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    Broadcast Stream
                  </p>
                  <p className="text-sm font-semibold text-white truncate mt-0.5">
                    {channel.quality} HLS ·{' '}
                    {channel.alternateStreams.length}{' '}
                    {channel.alternateStreams.length === 1 ? 'feed' : 'feeds'}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {channel.isGeoBlocked
                      ? 'Geo-restricted region'
                      : channel.not247
                        ? 'Scheduled hours'
                        : '24×7 Free-to-Air'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tv className="w-4 h-4 text-[#F5B942] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    EPG Guide ID
                  </p>
                  <p className="text-sm font-mono font-semibold text-white truncate mt-0.5">
                    {channel.tvgId}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Group: {channel.rawGroupTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-[#60A5FA] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#9CA3AF]">
                    Source Directory
                  </p>
                  <p className="text-sm font-semibold text-white truncate mt-0.5">
                    {channel.sourceName} Public M3U
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {channel.region} · {channel.country}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop) / Below Player (Mobile): Up Next & Instant Channel Switcher */}
        <aside className="xl:col-span-4 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col overflow-hidden xl:max-h-[760px]">
          <div className="p-4 border-b border-[#1F2937] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base text-white">
                Up Next &amp; Other Channels
              </h2>
              <span className="text-xs font-mono tabular-nums text-[#9CA3AF]">
                {filteredChannels.length} live
              </span>
            </div>

            {/* Quick channel filter search */}
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={switcherQuery}
                onChange={(e) => setSwitcherQuery(e.target.value)}
                placeholder="Switch channel..."
                aria-label="Filter channels in player"
                className="w-full h-9 bg-[#080B12] border border-[#1F2937] focus:border-[#E50914] rounded-lg pl-9 pr-3 text-xs text-white placeholder-[#9CA3AF] focus:outline-none"
              />
            </div>

            {/* Category filter strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {FILTER_TABS.map((cat) => {
                const active = switcherFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSwitcherFilter(cat)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-[#E50914] text-white'
                        : 'bg-[#171D2A] text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto divide-y divide-[#1F2937] flex-1">
            {filteredChannels.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9CA3AF]">
                No channels match &ldquo;{switcherQuery}&rdquo;.
              </div>
            ) : (
              <>
                {visibleSwitcherChannels.map((item) => {
                  const isCurrent = item.id === channel.id;
                  const itemHasCustom = Boolean(settings.customStreams[item.id]);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectChannel(item)}
                      aria-current={isCurrent ? 'true' : undefined}
                      className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors ${
                        isCurrent ? 'bg-[#1E2636]' : 'hover:bg-[#171D2A]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ChannelEmblem
                          shortCode={item.shortCode}
                          accentColor={item.accentColor}
                          logo={item.logo}
                          name={item.name}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white truncate">
                              {item.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F5B942] shrink-0">
                                Watching
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
                            {item.category} · {item.quality} · {item.region}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className="text-[11px] font-mono tabular-nums text-[#9CA3AF]">
                          {item.channelNumber}
                        </span>
                        {itemHasCustom && (
                          <span className="text-[10px] font-medium text-[#34D399]">
                            Custom
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {switcherLimit < filteredChannels.length && (
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => setSwitcherLimit((prev) => prev + 80)}
                      className="w-full py-2.5 px-3 rounded-lg bg-[#171D2A] border border-[#2C364B] hover:border-[#374151] text-xs font-semibold text-white transition-colors tabular-nums"
                    >
                      Show more ({(filteredChannels.length - switcherLimit).toLocaleString()} more)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
