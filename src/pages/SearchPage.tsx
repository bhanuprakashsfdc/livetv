import React, { useMemo, useState, useEffect } from 'react';
import { Search, Tv, ChevronDown } from 'lucide-react';
import { Channel, PlaylistMode } from '../types/channel';
import { ChannelCard } from '../components/ChannelCard';

interface SearchPageProps {
  query: string;
  playlistMode: PlaylistMode;
  channels: Channel[];
  favoriteIds: string[];
  customStreams: Record<string, string>;
  onQueryChange: (q: string) => void;
  onWatchChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const TELUGU_SUGGESTIONS = [
  'TV9',
  'DD Saptagiri',
  'News',
  'Devotional',
  'SVBC',
  'ETV',
  '1080p',
];

const GLOBAL_SUGGESTIONS = [
  'BBC',
  'Al Jazeera',
  'Euronews',
  'Bloomberg',
  'Movies',
  'News',
  'India',
  'United States',
];

const PAGE_SIZE = 40;

export const SearchPage: React.FC<SearchPageProps> = ({
  query,
  playlistMode,
  channels,
  favoriteIds,
  customStreams,
  onQueryChange,
  onWatchChannel,
  onToggleFavorite,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, playlistMode]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter(
      (ch) =>
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        ch.subGenre.toLowerCase().includes(q) ||
        ch.rawGroupTitle.toLowerCase().includes(q) ||
        ch.tvgId.toLowerCase().includes(q) ||
        ch.quality.toLowerCase().includes(q) ||
        ch.region.toLowerCase().includes(q) ||
        ch.country.toLowerCase().includes(q) ||
        ch.sourceName.toLowerCase().includes(q)
    );
  }, [query, channels]);

  const visibleResults = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount]
  );

  const suggestions =
    playlistMode === 'global' ? GLOBAL_SUGGESTIONS : TELUGU_SUGGESTIONS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">
          {playlistMode === 'global'
            ? 'Search Global Channels'
            : playlistMode === 'india'
              ? 'Search Indian Channels'
              : 'Search Telugu Channels'}
        </h1>
        <div className="relative max-w-xl">
          <Search
            className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              playlistMode === 'global'
                ? 'Search global channels, countries, or GitHub sources...'
                : 'Search live channels...'
            }
            aria-label="Search live channels"
            className="w-full h-12 bg-[#111827] border border-[#1F2937] focus:border-[#E50914] rounded-xl pl-11 pr-4 text-sm text-white placeholder-[#9CA3AF] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9CA3AF] mr-1">Quick searches:</span>
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onQueryChange(term)}
              className="px-3 py-1.5 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-xs text-[#D1D5DB] hover:text-white transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-[#9CA3AF] tabular-nums">
        {query.trim() ? (
          <>
            Found <strong className="text-white">{results.length.toLocaleString()}</strong>{' '}
            {results.length === 1 ? 'channel' : 'channels'} for &ldquo;{query.trim()}&rdquo;
          </>
        ) : (
          <>
            Showing {visibleResults.length.toLocaleString()} of{' '}
            {results.length.toLocaleString()} live channels
          </>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#171D2A] border border-[#1F2937] flex items-center justify-center">
            <Tv className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <h2 className="text-base font-semibold text-white">
            No matching channels found
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-md">
            We couldn&apos;t find any channel matching &ldquo;{query}&rdquo;. Try searching by channel name, country, genre, or source.
          </p>
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="mt-2 px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {visibleResults.map((channel) => (
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

          {visibleCount < results.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#171D2A] border border-[#2C364B] hover:border-[#374151] hover:bg-[#1E2636] text-sm font-semibold text-white transition-colors tabular-nums"
              >
                <ChevronDown className="w-4 h-4 text-[#F5B942]" />
                <span>
                  Load More Results ({(results.length - visibleCount).toLocaleString()} remaining)
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
