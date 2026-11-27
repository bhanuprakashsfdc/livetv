import { useState, useEffect, useCallback } from 'react';
import { Channel, PlaylistMode } from '../types/channel';
import { fetchIptvChannels } from '../data/iptvService';
import { IPTV_SOURCES } from '../data/data';

interface UseIptvChannelsResult {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  sourceUrl: string;
  lastUpdated: number | null;
  refresh: () => void;
}

export function useIptvChannels(
  mode: PlaylistMode,
  customPlaylistUrl?: string
): UseIptvChannelsResult {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>(
    customPlaylistUrl?.trim() || IPTV_SOURCES[mode].url
  );
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const load = useCallback(
    async (forceRefresh: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchIptvChannels({
          mode,
          customPlaylistUrl,
          forceRefresh,
        });
        setChannels(result.channels);
        setSourceUrl(result.sourceUrl);
        setLastUpdated(result.fetchedAt);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load channels from iptv-org playlist.'
        );
      } finally {
        setLoading(false);
      }
    },
    [mode, customPlaylistUrl]
  );

  useEffect(() => {
    load(refreshCounter > 0);
  }, [load, refreshCounter]);

  const refresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  return {
    channels,
    loading,
    error,
    sourceUrl,
    lastUpdated,
    refresh,
  };
}
