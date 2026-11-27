import React from 'react';
import { Heart, Play, Radio, Trash2 } from 'lucide-react';
import { Channel } from '../types/channel';
import { ChannelEmblem } from './ChannelEmblem';
import { LiveBadge } from './LiveBadge';
import { MediaImage } from './MediaImage';

interface ChannelCardProps {
  channel: Channel;
  variant: 'live-carousel' | 'popular-compact' | 'directory-grid' | 'directory-list';
  isFavorite: boolean;
  hasCustomStream?: boolean;
  onWatch: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  showRemoveFavoriteLabel?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  variant,
  isFavorite,
  hasCustomStream = false,
  onWatch,
  onToggleFavorite,
  showRemoveFavoriteLabel = false,
}) => {
  const availabilityText = hasCustomStream
    ? `Custom HLS · ${channel.quality}`
    : channel.isGeoBlocked
      ? `${channel.quality} · Geo-restricted`
      : `${channel.quality} · Free to Air`;

  if (variant === 'live-carousel') {
    return (
      <article className="flex-shrink-0 w-[290px] sm:w-[320px] rounded-2xl bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] overflow-hidden transition-transform duration-200 hover:scale-[1.015] group">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onWatch(channel)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onWatch(channel);
            }
          }}
          className="relative aspect-video w-full bg-[#080B12] overflow-hidden cursor-pointer"
          aria-label={`Watch ${channel.name} live`}
        >
          <MediaImage
            src={channel.thumbnail}
            alt={`${channel.name} live broadcast preview`}
            fallbackLabel={channel.name}
            fallbackAccent={channel.accentColor}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171D2A] via-black/30 to-black/20" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {channel.isLive && <LiveBadge />}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            aria-label={
              isFavorite
                ? `Remove ${channel.name} from favorites`
                : `Add ${channel.name} to favorites`
            }
            className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-[#080B12]/75 backdrop-blur-md flex items-center justify-center transition-colors ${
              isFavorite ? 'text-[#E50914]' : 'text-white/80 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="absolute bottom-3 left-3">
            <ChannelEmblem
              shortCode={channel.shortCode}
              accentColor={channel.accentColor}
              logo={channel.logo}
              name={channel.name}
              size="md"
              className="bg-[#080B12]/90 backdrop-blur-md border-white/15"
            />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-white truncate">
              {channel.name}
            </h3>
            <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
              {channel.category} · {channel.quality}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onWatch(channel)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch</span>
          </button>
        </div>
      </article>
    );
  }

  if (variant === 'popular-compact') {
    return (
      <div className="rounded-2xl bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] hover:bg-[#1E2636] p-4 flex items-center justify-between gap-3 transition-colors group">
        <button
          type="button"
          onClick={() => onWatch(channel)}
          className="flex items-center gap-3.5 min-w-0 flex-1 text-left"
        >
          <ChannelEmblem
            shortCode={channel.shortCode}
            accentColor={channel.accentColor}
            logo={channel.logo}
            name={channel.name}
            size="md"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[15px] text-white truncate">
              {channel.name}
            </h3>
            <p className="text-xs text-[#9CA3AF] truncate mt-0.5">
              {channel.category} · {availabilityText}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(channel.id)}
          aria-label={
            isFavorite
              ? `Remove ${channel.name} from favorites`
              : `Add ${channel.name} to favorites`
          }
          className={`w-10 h-10 rounded-full bg-[#111827] border border-[#1F2937] flex items-center justify-center shrink-0 transition-colors ${
            isFavorite
              ? 'text-[#E50914] border-[#E50914]/40'
              : 'text-[#9CA3AF] hover:text-white hover:border-[#374151]'
          }`}
        >
          <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  }

  if (variant === 'directory-list') {
    return (
      <div className="rounded-xl bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <span className="hidden md:inline-block w-10 text-xs font-mono tabular-nums text-[#9CA3AF]">
            {channel.channelNumber}
          </span>
          <ChannelEmblem
            shortCode={channel.shortCode}
            accentColor={channel.accentColor}
            logo={channel.logo}
            name={channel.name}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-[15px] text-white truncate">
                {channel.name}
              </h3>
              {channel.isLive && <LiveBadge />}
            </div>
            <p className="text-xs text-[#9CA3AF] truncate mt-1">
              {channel.category} · {channel.subGenre} · {availabilityText}
              {channel.alternateStreams.length > 1
                ? ` · ${channel.alternateStreams.length} feeds`
                : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onToggleFavorite(channel.id)}
            aria-label={
              isFavorite
                ? `Remove ${channel.name} from favorites`
                : `Add ${channel.name} to favorites`
            }
            className={`h-10 px-3 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isFavorite
                ? 'bg-[#E50914]/15 border-[#E50914]/40 text-[#FF8A90]'
                : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:border-[#374151]'
            }`}
          >
            {showRemoveFavoriteLabel ? (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </>
            ) : (
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            )}
          </button>

          <button
            type="button"
            onClick={() => onWatch(channel)}
            className="h-10 px-4 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Live</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-2xl bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] overflow-hidden flex flex-col transition-transform duration-200 hover:scale-[1.01] group">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onWatch(channel)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onWatch(channel);
          }
        }}
        className="relative aspect-video w-full bg-[#080B12] overflow-hidden cursor-pointer"
        aria-label={`Watch ${channel.name} live`}
      >
        <MediaImage
          src={channel.thumbnail}
          alt={`${channel.name} broadcast preview`}
          fallbackLabel={channel.name}
          fallbackAccent={channel.accentColor}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171D2A] via-black/30 to-black/20" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {channel.isLive && <LiveBadge />}
        </div>
        <span className="absolute top-3 right-3 text-[11px] font-mono tabular-nums text-white/90 bg-[#080B12]/75 backdrop-blur-md px-2 py-0.5 rounded">
          {channel.quality}
        </span>
        <div className="absolute bottom-3 left-3">
          <ChannelEmblem
            shortCode={channel.shortCode}
            accentColor={channel.accentColor}
            logo={channel.logo}
            name={channel.name}
            size="md"
            className="bg-[#080B12]/90 backdrop-blur-md border-white/15"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-white truncate">
            {channel.name}
          </h3>
          <p className="text-xs text-[#9CA3AF] truncate mt-1">
            {channel.category} · {availabilityText}
          </p>
          <p className="text-xs text-[#D1D5DB] truncate mt-2 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#F5B942] shrink-0" />
            <span className="truncate">
              CH {channel.channelNumber} · {channel.subGenre}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onWatch(channel)}
            className="flex-1 h-10 px-4 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Live</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(channel.id)}
            aria-label={
              isFavorite
                ? `Remove ${channel.name} from favorites`
                : `Add ${channel.name} to favorites`
            }
            className={`h-10 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition-colors shrink-0 ${
              isFavorite
                ? 'bg-[#E50914]/15 border-[#E50914]/40 text-[#FF8A90]'
                : 'bg-[#111827] border-[#1F2937] text-[#9CA3AF] hover:text-white hover:border-[#374151]'
            }`}
          >
            {showRemoveFavoriteLabel ? (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </>
            ) : (
              <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
