import { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import {
  AppRoute,
  Channel,
  ChannelCategory,
  PlayerSettings,
  PlaylistMode,
  WatchHistoryEntry,
} from './types/channel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useIptvChannels } from './hooks/useIptvChannels';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LivePlayerPage } from './pages/LivePlayerPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RecentlyWatchedPage } from './pages/RecentlyWatchedPage';
import { SettingsPage } from './pages/SettingsPage';
import { InfoPage } from './pages/InfoPage';

const DEFAULT_SETTINGS: PlayerSettings = {
  autoReconnect: true,
  defaultVolume: 0.8,
  smartTvMode: false,
  showWatermark: true,
  playlistMode: 'telugu',
  customPlaylistUrl: '',
  customStreams: {},
};

function parseInitialRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('watch/')) {
    const channelId = hash.slice('watch/'.length).trim();
    if (channelId) {
      return { view: 'live', channelId };
    }
  }
  return { view: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(parseInitialRoute);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeChannelId, setActiveChannelId] = useState<string>(() => {
    const initial = parseInitialRoute();
    return initial.view === 'live' && initial.channelId ? initial.channelId : '';
  });

  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>(
    'tltv_favorites_v2',
    []
  );
  const [watchHistory, setWatchHistory] = useLocalStorage<WatchHistoryEntry[]>(
    'tltv_history_v2',
    []
  );
  const [storedSettings, setSettings] = useLocalStorage<PlayerSettings>(
    'tltv_settings_v2',
    DEFAULT_SETTINGS
  );

  // Merge defaults defensively in case older localStorage schema exists
  const settings: PlayerSettings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    customStreams: storedSettings.customStreams ?? {},
  };

  const {
    channels,
    loading,
    error,
    sourceUrl,
    refresh,
  } = useIptvChannels(settings.playlistMode, settings.customPlaylistUrl);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Keep activeChannelId synced with loaded channels
  useEffect(() => {
    if (channels.length > 0) {
      if (!activeChannelId || !channels.some((c) => c.id === activeChannelId)) {
        setActiveChannelId(channels[0].id);
      }
    }
  }, [channels, activeChannelId]);

  const navigate = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute);
    if (nextRoute.view === 'live' && nextRoute.channelId) {
      setActiveChannelId(nextRoute.channelId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const recordWatchHistory = useCallback(
    (channelId: string) => {
      setWatchHistory((prev) => {
        const filtered = prev.filter((item) => item.channelId !== channelId);
        return [{ channelId, watchedAt: Date.now() }, ...filtered].slice(0, 16);
      });
    },
    [setWatchHistory]
  );

  const handleWatchChannel = useCallback(
    (channel: Channel) => {
      setActiveChannelId(channel.id);
      recordWatchHistory(channel.id);
      setRoute({ view: 'live', channelId: channel.id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [recordWatchHistory]
  );

  const handleToggleFavorite = useCallback(
    (channelId: string) => {
      const ch = channels.find((c) => c.id === channelId);
      setFavoriteIds((prev) => {
        const exists = prev.includes(channelId);
        if (exists) {
          notify(`Removed ${ch?.name ?? 'channel'} from Favorites`);
          return prev.filter((id) => id !== channelId);
        }
        notify(`Added ${ch?.name ?? 'channel'} to Favorites`);
        return [channelId, ...prev];
      });
    },
    [channels, setFavoriteIds, notify]
  );

  const handleSaveCustomStream = useCallback(
    (channelId: string, url: string) => {
      setSettings((prev) => {
        const nextStreams = { ...(prev.customStreams ?? {}) };
        if (url) {
          nextStreams[channelId] = url;
        } else {
          delete nextStreams[channelId];
        }
        return { ...DEFAULT_SETTINGS, ...prev, customStreams: nextStreams };
      });
    },
    [setSettings]
  );

  const handleUpdateSettings = useCallback(
    (partial: Partial<PlayerSettings>) => {
      setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...partial }));
    },
    [setSettings]
  );

  const handleChangePlaylistMode = useCallback(
    (mode: PlaylistMode) => {
      handleUpdateSettings({ playlistMode: mode, customPlaylistUrl: '' });
      notify(
        mode === 'telugu'
          ? 'Switched to Telugu Live (iptv-org/languages/tel.m3u)'
          : 'Switched to India Mode (iptv-org/countries/in.m3u)'
      );
    },
    [handleUpdateSettings, notify]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setGlobalSearch(value);
      if (value.trim() && route.view !== 'search') {
        setRoute({ view: 'search', query: value });
      }
    },
    [route.view]
  );

  const handleSearchSubmit = useCallback((value: string) => {
    setGlobalSearch(value);
    setRoute({ view: 'search', query: value });
  }, []);

  const currentChannel =
    channels.find((c) => c.id === activeChannelId) ?? channels[0] ?? null;

  const handleDirectoryCategorySelect = useCallback((cat?: ChannelCategory) => {
    setRoute({ view: 'directory', category: cat });
  }, []);

  const handleManualRefresh = useCallback(() => {
    refresh();
    notify('Refreshing live playlist from iptv-org...');
  }, [refresh, notify]);

  return (
    <div
      className={`min-h-screen bg-[#080B12] text-white ${
        settings.smartTvMode ? 'tv-mode' : ''
      }`}
    >
      <Sidebar
        route={route}
        onNavigate={navigate}
        favoritesCount={favoriteIds.length}
        mobileOpen={drawerOpen}
        onCloseMobile={() => setDrawerOpen(false)}
      />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <TopHeader
          searchQuery={globalSearch}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onOpenDrawer={() => setDrawerOpen(true)}
          onNavigate={navigate}
          route={route}
        />

        <main className="flex-1 pt-20 md:pt-24 pb-8 px-4 md:px-6 lg:px-8 w-full max-w-[1600px] mx-auto">
          {route.view === 'home' && (
            <HomePage
              channels={channels}
              loading={loading}
              error={error}
              playlistMode={settings.playlistMode}
              favoriteIds={favoriteIds}
              watchHistory={watchHistory}
              customStreams={settings.customStreams}
              onWatchChannel={handleWatchChannel}
              onToggleFavorite={handleToggleFavorite}
              onChangePlaylistMode={handleChangePlaylistMode}
              onRefresh={handleManualRefresh}
              onNavigate={navigate}
            />
          )}

          {route.view === 'live' && (
            <>
              {currentChannel ? (
                <LivePlayerPage
                  channel={currentChannel}
                  channels={channels}
                  favoriteIds={favoriteIds}
                  settings={settings}
                  onSelectChannel={handleWatchChannel}
                  onToggleFavorite={handleToggleFavorite}
                  onSaveCustomStream={handleSaveCustomStream}
                  onNavigate={navigate}
                  onNotify={notify}
                />
              ) : loading ? (
                <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-10 h-10 rounded-full border-[3px] border-white/15 border-t-[#E50914] animate-spin" />
                  <p className="text-sm font-semibold text-white">
                    Loading live iptv-org Telugu channels...
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-12 flex flex-col items-center justify-center text-center gap-3">
                  <AlertTriangle className="w-7 h-7 text-[#FF8A90]" />
                  <p className="text-base font-semibold text-white">
                    Unable to load live channels
                  </p>
                  <p className="text-xs text-[#9CA3AF] max-w-md">
                    {error || 'No channels were returned from the playlist.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Sync</span>
                  </button>
                </div>
              )}
            </>
          )}

          {route.view === 'directory' && (
            <DirectoryPage
              channels={channels}
              loading={loading}
              playlistMode={settings.playlistMode}
              initialCategory={route.category}
              favoriteIds={favoriteIds}
              customStreams={settings.customStreams}
              onWatchChannel={handleWatchChannel}
              onToggleFavorite={handleToggleFavorite}
              onSelectCategory={handleDirectoryCategorySelect}
              onChangePlaylistMode={handleChangePlaylistMode}
              onRefresh={handleManualRefresh}
            />
          )}

          {route.view === 'search' && (
            <SearchPage
              query={globalSearch}
              channels={channels}
              favoriteIds={favoriteIds}
              customStreams={settings.customStreams}
              onQueryChange={setGlobalSearch}
              onWatchChannel={handleWatchChannel}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {route.view === 'favorites' && (
            <FavoritesPage
              channels={channels}
              favoriteIds={favoriteIds}
              customStreams={settings.customStreams}
              onWatchChannel={handleWatchChannel}
              onToggleFavorite={handleToggleFavorite}
              onNavigate={navigate}
            />
          )}

          {route.view === 'recent' && (
            <RecentlyWatchedPage
              channels={channels}
              watchHistory={watchHistory}
              onWatchChannel={handleWatchChannel}
              onClearHistory={() => {
                setWatchHistory([]);
                notify('Watch history cleared');
              }}
              onNavigate={navigate}
            />
          )}

          {route.view === 'settings' && (
            <SettingsPage
              channels={channels}
              settings={settings}
              sourceUrl={sourceUrl}
              loading={loading}
              onUpdateSettings={handleUpdateSettings}
              onSaveCustomStream={handleSaveCustomStream}
              onRefreshPlaylist={handleManualRefresh}
              onClearFavorites={() => {
                setFavoriteIds([]);
                notify('Favorites cleared');
              }}
              onClearHistory={() => {
                setWatchHistory([]);
                notify('Watch history cleared');
              }}
              onNotify={notify}
            />
          )}

          {(route.view === 'about' ||
            route.view === 'contact' ||
            route.view === 'privacy' ||
            route.view === 'terms') && (
            <InfoPage page={route.view} onNavigate={navigate} />
          )}
        </main>

        <Footer onNavigate={navigate} />
      </div>

      <MobileBottomNav route={route} onNavigate={navigate} />

      {/* Inline Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-3 rounded-xl bg-[#171D2A] border border-[#374151] text-sm font-medium text-white shadow-2xl"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
