import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Volume2,
  Link2,
  Trash2,
  Check,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { Channel, PlayerSettings, PlaylistMode } from '../types/channel';
import { IPTV_SOURCES } from '../data/data';
import { ChannelEmblem } from '../components/ChannelEmblem';

interface SettingsPageProps {
  channels: Channel[];
  settings: PlayerSettings;
  sourceUrl: string;
  loading: boolean;
  onUpdateSettings: (next: Partial<PlayerSettings>) => void;
  onSaveCustomStream: (channelId: string, url: string) => void;
  onRefreshPlaylist: () => void;
  onClearFavorites: () => void;
  onClearHistory: () => void;
  onNotify: (message: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  channels,
  settings,
  sourceUrl,
  loading,
  onUpdateSettings,
  onSaveCustomStream,
  onRefreshPlaylist,
  onClearFavorites,
  onClearHistory,
  onNotify,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0]?.id ?? '');
  const [streamInput, setStreamInput] = useState(
    settings.customStreams[channels[0]?.id ?? ''] ?? ''
  );
  const [playlistUrlDraft, setPlaylistUrlDraft] = useState(
    settings.customPlaylistUrl
  );

  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
      setStreamInput(settings.customStreams[channels[0].id] ?? '');
    }
  }, [channels, selectedChannelId, settings.customStreams]);

  useEffect(() => {
    setPlaylistUrlDraft(settings.customPlaylistUrl);
  }, [settings.customPlaylistUrl]);

  const handleChannelSelect = (id: string) => {
    setSelectedChannelId(id);
    setStreamInput(settings.customStreams[id] ?? '');
  };

  const handleStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannelId) return;
    const cleaned = streamInput.trim();
    if (cleaned && !/^https?:\/\//i.test(cleaned)) {
      onNotify('Enter a valid http:// or https:// HLS (.m3u8) URL.');
      return;
    }
    onSaveCustomStream(selectedChannelId, cleaned);
    const ch = channels.find((c) => c.id === selectedChannelId);
    onNotify(
      cleaned
        ? `Saved custom HLS stream for ${ch?.name ?? 'channel'}.`
        : `Restored iptv-org stream for ${ch?.name ?? 'channel'}.`
    );
  };

  const handlePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = playlistUrlDraft.trim();
    if (cleaned && !/^https?:\/\//i.test(cleaned)) {
      onNotify('Enter a valid http:// or https:// M3U playlist URL.');
      return;
    }
    onUpdateSettings({ customPlaylistUrl: cleaned });
    onNotify(
      cleaned
        ? 'Loaded custom M3U playlist source.'
        : 'Restored default iptv-org playlist source.'
    );
  };

  const configuredList = channels.filter((c) => Boolean(settings.customStreams[c.id]));

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <p className="text-xs font-semibold text-[#F5B942] tracking-wide">
          Preferences
        </p>
        <h1 className="font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
          Settings
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Configure live iptv-org playlists, Smart TV ergonomics, and playback defaults. Stored locally with no account required.
        </p>
      </div>

      {/* Live iptv-org Playlist Source Section */}
      <section className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Radio className="w-5 h-5 text-[#E50914] mt-0.5 shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Live Channel Source (iptv-org)
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Channels are fetched dynamically from open-source{' '}
                <code className="font-mono text-[#F5B942]">iptv-org/iptv</code> M3U playlists—never hardcoded in components.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefreshPlaylist}
            className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-[#374151] text-xs font-semibold text-white transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Playlist</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['telugu', 'india'] as PlaylistMode[]).map((mode) => {
            const active =
              !settings.customPlaylistUrl && settings.playlistMode === mode;
            const meta = IPTV_SOURCES[mode];
            return (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  onUpdateSettings({ playlistMode: mode, customPlaylistUrl: '' })
                }
                className={`p-4 rounded-xl border text-left transition-colors ${
                  active
                    ? 'bg-[#E50914]/15 border-[#E50914] text-white'
                    : 'bg-[#111827] border-[#1F2937] hover:border-[#374151] text-[#D1D5DB]'
                }`}
              >
                <div className="text-sm font-semibold text-white">{meta.label}</div>
                <div className="text-xs text-[#9CA3AF] mt-1">{meta.description}</div>
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handlePlaylistSubmit}
          className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#1F2937]"
        >
          <input
            type="url"
            value={playlistUrlDraft}
            onChange={(e) => setPlaylistUrlDraft(e.target.value)}
            placeholder="Optional custom M3U URL (e.g. https://iptv-org.github.io/iptv/languages/tel.m3u)"
            aria-label="Custom M3U playlist URL"
            className="flex-1 h-11 px-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>Apply Source</span>
          </button>
        </form>

        <p className="text-[11px] font-mono text-[#9CA3AF] truncate">
          Active endpoint: {sourceUrl} ({channels.length} channels loaded)
        </p>
      </section>

      {/* Playback & Viewing Preferences */}
      <section className="rounded-2xl bg-[#171D2A] border border-[#1F2937] divide-y divide-[#1F2937]">
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Monitor className="w-5 h-5 text-[#F5B942] mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                Smart TV / Large Display Mode
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Scales typography and strengthens remote-control focus outlines for living-room screens.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.smartTvMode}
            onClick={() =>
              onUpdateSettings({ smartTvMode: !settings.smartTvMode })
            }
            className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 ${
              settings.smartTvMode ? 'bg-[#E50914]' : 'bg-[#374151]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.smartTvMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Auto-Reconnect on Stream Drop
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Automatically attempts recovery if a live HLS stream experiences network jitter.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.autoReconnect}
            onClick={() =>
              onUpdateSettings({ autoReconnect: !settings.autoReconnect })
            }
            className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 ${
              settings.autoReconnect ? 'bg-[#E50914]' : 'bg-[#374151]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoReconnect ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Channel Logo Watermark
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Display subtle channel badge watermark inside the top-right corner of the video player.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.showWatermark}
            onClick={() =>
              onUpdateSettings({ showWatermark: !settings.showWatermark })
            }
            className={`w-12 h-7 rounded-full transition-colors p-1 shrink-0 ${
              settings.showWatermark ? 'bg-[#E50914]' : 'bg-[#374151]'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showWatermark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Volume2 className="w-5 h-5 text-[#9CA3AF] mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-white">
                Default Player Volume
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Starting volume level when switching to a live broadcast.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.defaultVolume}
              onChange={(e) =>
                onUpdateSettings({ defaultVolume: parseFloat(e.target.value) })
              }
              aria-label="Default volume"
              className="w-36 accent-[#E50914] cursor-pointer"
            />
            <span className="w-10 text-right text-xs font-mono tabular-nums text-white">
              {Math.round(settings.defaultVolume * 100)}%
            </span>
          </div>
        </div>
      </section>

      {/* Per-Channel Stream Override */}
      <section className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-[#E50914] mt-0.5 shrink-0" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Per-Channel HLS Stream Overrides
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
              Override any channel with a custom broadcaster-authorized <code className="font-mono text-[#F5B942]">.m3u8</code> URL locally in your browser.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleStreamSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1"
        >
          <select
            value={selectedChannelId}
            onChange={(e) => handleChannelSelect(e.target.value)}
            aria-label="Select channel"
            disabled={channels.length === 0}
            className="md:col-span-4 h-11 px-3 rounded-lg bg-[#111827] border border-[#1F2937] text-sm text-white focus:border-[#E50914] focus:outline-none disabled:opacity-50"
          >
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.channelNumber} · {ch.name}
              </option>
            ))}
          </select>

          <input
            type="url"
            value={streamInput}
            onChange={(e) => setStreamInput(e.target.value)}
            placeholder="https://broadcaster.example.com/live/index.m3u8"
            aria-label="Authorized HLS stream URL"
            className="md:col-span-6 h-11 px-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!selectedChannelId}
            className="md:col-span-2 h-11 px-4 rounded-lg bg-[#E50914] hover:bg-[#C50812] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>Save URL</span>
          </button>
        </form>

        {configuredList.length > 0 && (
          <div className="pt-3 border-t border-[#1F2937] flex flex-col gap-2">
            <p className="text-xs font-medium text-[#9CA3AF]">
              Overridden streams ({configuredList.length})
            </p>
            {configuredList.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#111827] border border-[#1F2937]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ChannelEmblem
                    shortCode={ch.shortCode}
                    accentColor={ch.accentColor}
                    logo={ch.logo}
                    name={ch.name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {ch.name}
                    </div>
                    <div className="text-xs font-mono text-[#9CA3AF] truncate">
                      {settings.customStreams[ch.id]}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCustomStream(ch.id, '');
                    if (ch.id === selectedChannelId) setStreamInput('');
                    onNotify(`Restored iptv-org stream for ${ch.name}.`);
                  }}
                  aria-label={`Remove stream override for ${ch.name}`}
                  className="p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[#171D2A]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Local Browser Data */}
      <section className="rounded-2xl bg-[#171D2A] border border-[#1F2937] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Local Browser Storage</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Favorites and watch history are stored only on this device.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onClearFavorites}
            className="px-4 py-2 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-[#374151] text-xs font-semibold text-[#D1D5DB] hover:text-white transition-colors"
          >
            Clear Favorites
          </button>
          <button
            type="button"
            onClick={onClearHistory}
            className="px-4 py-2 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-[#374151] text-xs font-semibold text-[#D1D5DB] hover:text-white transition-colors"
          >
            Clear Watch History
          </button>
        </div>
      </section>
    </div>
  );
};
