export type ChannelCategory =
  | 'News'
  | 'Entertainment'
  | 'Movies'
  | 'Devotional'
  | 'Music'
  | 'Kids'
  | 'Educational';

export type PlaylistMode = 'telugu' | 'india' | 'global';

export interface StreamVariant {
  url: string;
  quality: string;
  label: string;
  sourceName: string;
  isGeoBlocked: boolean;
  not247: boolean;
}

export interface Channel {
  id: string;
  tvgId: string;
  channelNumber: string;
  name: string;
  rawTitle: string;
  shortCode: string;
  accentColor: string;
  category: ChannelCategory;
  rawGroupTitle: string;
  subGenre: string;
  language: string;
  country: string;
  sourceName: string;
  logo: string;
  thumbnail: string;
  streamType: 'hls' | 'embed';
  streamUrl: string;
  alternateStreams: StreamVariant[];
  quality: string;
  isGeoBlocked: boolean;
  not247: boolean;
  httpReferrer?: string;
  httpUserAgent?: string;
  isLive: boolean;
  isFree: boolean;
  authorizedSource: boolean;
  popularityRank: number;
  featuredInLiveRail: boolean;
  description: string;
  broadcaster: string;
  region: string;
}

export interface CategoryTile {
  id: ChannelCategory;
  title: string;
  subtitle: string;
  thumbnail: string;
  accentColor: string;
  description: string;
}

export interface WatchHistoryEntry {
  channelId: string;
  watchedAt: number;
}

export interface PlayerSettings {
  autoReconnect: boolean;
  defaultVolume: number;
  smartTvMode: boolean;
  showWatermark: boolean;
  playlistMode: PlaylistMode;
  customPlaylistUrl: string;
  customStreams: Record<string, string>;
}

export type AppRoute =
  | { view: 'home' }
  | { view: 'live'; channelId?: string }
  | { view: 'directory'; category?: ChannelCategory }
  | { view: 'search'; query?: string }
  | { view: 'favorites' }
  | { view: 'recent' }
  | { view: 'settings' }
  | { view: 'about' }
  | { view: 'contact' }
  | { view: 'privacy' }
  | { view: 'terms' };
