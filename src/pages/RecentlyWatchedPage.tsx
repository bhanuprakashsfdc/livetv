import React from 'react';
import { History, Play, Trash2, Compass } from 'lucide-react';
import { AppRoute, Channel, WatchHistoryEntry } from '../types/channel';
import { formatRelativeWatchTime } from '../data/data';
import { ChannelEmblem } from '../components/ChannelEmblem';
import { LiveBadge } from '../components/LiveBadge';

interface RecentlyWatchedPageProps {
  channels: Channel[];
  watchHistory: WatchHistoryEntry[];
  onWatchChannel: (channel: Channel) => void;
  onClearHistory: () => void;
  onNavigate: (route: AppRoute) => void;
}

export const RecentlyWatchedPage: React.FC<RecentlyWatchedPageProps> = ({
  channels,
  watchHistory,
  onWatchChannel,
  onClearHistory,
  onNavigate,
}) => {
  const entries = watchHistory
    .map((item) => {
      const ch = channels.find((c) => c.id === item.channelId);
      return ch ? { channel: ch, watchedAt: item.watchedAt } : null;
    })
    .filter(
      (item): item is { channel: Channel; watchedAt: number } => item !== null
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
            Continue Watching
          </p>
          <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
            Recently Watched
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Your viewing history is kept privately in your browser.
          </p>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-xs font-semibold text-[#D1D5DB] hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#171D2A] border border-[#1F2937] flex items-center justify-center">
            <History className="w-6 h-6 text-[#9CA3AF]" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            No watch history yet
          </h2>
          <p className="text-sm text-[#9CA3AF] max-w-md">
            Start watching any live Telugu channel and it will appear here so you can jump back in anytime.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'directory' })}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-sm font-semibold transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Channels</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map(({ channel, watchedAt }) => (
            <div
              key={channel.id}
              className="rounded-xl bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <ChannelEmblem
                  shortCode={channel.shortCode}
                  accentColor={channel.accentColor}
                  logo={channel.logo}
                  name={channel.name}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-semibold text-base text-white truncate">
                      {channel.name}
                    </h2>
                    {channel.isLive && <LiveBadge />}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {channel.category} · {channel.quality} · {formatRelativeWatchTime(watchedAt)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onWatchChannel(channel)}
                className="self-end sm:self-center h-10 px-4 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Live</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
