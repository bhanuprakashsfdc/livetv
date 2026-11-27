import React from 'react';
import { Heart, Compass } from 'lucide-react';
import { AppRoute, Channel } from '../types/channel';
import { ChannelCard } from '../components/ChannelCard';

interface FavoritesPageProps {
  channels: Channel[];
  favoriteIds: string[];
  customStreams: Record<string, string>;
  onWatchChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  channels,
  favoriteIds,
  customStreams,
  onWatchChannel,
  onToggleFavorite,
  onNavigate,
}) => {
  const favoriteChannels = channels.filter((ch) => favoriteIds.includes(ch.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#E50914] tracking-wide">
            Saved Lineup
          </p>
          <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
            Favorites
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Quick access to your preferred Telugu channels — stored locally with no login required.
          </p>
        </div>

        {favoriteChannels.length > 0 && (
          <span className="text-xs font-mono tabular-nums text-[#9CA3AF]">
            {favoriteChannels.length} saved{' '}
            {favoriteChannels.length === 1 ? 'channel' : 'channels'}
          </span>
        )}
      </div>

      {favoriteChannels.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#171D2A] border border-[#1F2937] flex items-center justify-center">
            <Heart className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Your favorite channels will appear here.
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-md">
            Tap the heart icon on any Telugu channel card or inside the Live TV player to pin it to your personal watchlist.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'directory' })}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-sm font-semibold transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Channels</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              variant="directory-grid"
              isFavorite={true}
              hasCustomStream={Boolean(customStreams[channel.id])}
              onWatch={onWatchChannel}
              onToggleFavorite={onToggleFavorite}
              showRemoveFavoriteLabel
            />
          ))}
        </div>
      )}
    </div>
  );
};
