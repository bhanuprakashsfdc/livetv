import {
  Channel,
  ChannelCategory,
  PlaylistMode,
  StreamVariant,
} from '../types/channel';
import {
  CATEGORY_BACKDROPS,
  CHANNEL_BACKDROP_OVERRIDES,
  IPTV_SOURCES,
  POPULARITY_PRIORITY_PATTERNS,
} from './data';

const CACHE_PREFIX = 'tltv_iptv_cache_v1_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedPlaylist {
  fetchedAt: number;
  sourceUrl: string;
  channels: Channel[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractAttr(extinfLine: string, attrName: string): string {
  const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
  const match = extinfLine.match(regex);
  return match ? match[1].trim() : '';
}

function mapGroupToCategory(groupTitle: string, channelName: string): ChannelCategory {
  const combined = `${groupTitle} ${channelName}`.toLowerCase();

  if (/(news|vartalu|bulletin|tv9|ntv|tv5|abn|sakshi|hmtv|v6|10\s*tv|t\s*news|mahaa\s*news|prime9|brk\s*news|cvr\s*news|big\s*tv|99tv|6\s*tv)/i.test(combined)) {
    return 'News';
  }
  if (/(relig|devot|bhakt|spiritual|svbc|aastha|dharmam|calvary|divyavani|subhavaartha|nireekshana|chhaya\s*chitram)/i.test(combined)) {
    return 'Devotional';
  }
  if (/(movie|cinema|film|tolly)/i.test(combined)) {
    return 'Movies';
  }
  if (/(music|musix|beats|songs)/i.test(combined)) {
    return 'Music';
  }
  if (/(kid|animation|cartoon|yay|bal\s*bharat|kushi)/i.test(combined)) {
    return 'Kids';
  }
  if (/(educat|documentary|science|history|vidya|nipuna|t-sat|tsat|health)/i.test(combined)) {
    return 'Educational';
  }
  return 'Entertainment';
}

function getCategoryAccent(category: ChannelCategory): string {
  switch (category) {
    case 'News':
      return '#E50914';
    case 'Entertainment':
      return '#F5B942';
    case 'Movies':
      return '#F5B942';
    case 'Devotional':
      return '#FB923C';
    case 'Music':
      return '#F472B6';
    case 'Kids':
      return '#34D399';
    case 'Educational':
      return '#60A5FA';
  }
}

function deriveShortCode(name: string): string {
  const cleaned = name
    .replace(/\b(HD|SD|Telugu|TV|India|News)\b/gi, (m) =>
      name.split(/\s+/).length <= 2 ? m : ''
    )
    .trim();
  const words = (cleaned || name).split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  const initials = words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return initials || name.slice(0, 3).toUpperCase();
}

function parseQualityScore(quality: string): number {
  const num = parseInt(quality, 10);
  if (!Number.isNaN(num)) return num;
  if (/1080|fhd/i.test(quality)) return 1080;
  if (/720|hd/i.test(quality)) return 720;
  if (/576|sd/i.test(quality)) return 576;
  return 480;
}

function pickBackdrop(name: string, category: ChannelCategory): string {
  for (const rule of CHANNEL_BACKDROP_OVERRIDES) {
    if (rule.pattern.test(name)) return rule.url;
  }
  return CATEGORY_BACKDROPS[category];
}

function computePopularityRank(name: string, quality: string, isGeoBlocked: boolean, index: number): number {
  for (let i = 0; i < POPULARITY_PRIORITY_PATTERNS.length; i++) {
    if (POPULARITY_PRIORITY_PATTERNS[i].test(name)) {
      return i + 1 + (isGeoBlocked ? 100 : 0);
    }
  }
  const hdBonus = parseQualityScore(quality) >= 720 ? 0 : 25;
  return 40 + hdBonus + (isGeoBlocked ? 100 : 0) + index;
}

/**
 * Parses an iptv-org M3U playlist into structured Channel objects,
 * merging multi-feed variants of the same channel into `alternateStreams`.
 */
export function parseM3UPlaylist(m3uContent: string, mode: PlaylistMode): Channel[] {
  const normalized = m3uContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  interface RawParsedEntry {
    tvgId: string;
    logo: string;
    groupTitle: string;
    rawTitle: string;
    cleanName: string;
    quality: string;
    isGeoBlocked: boolean;
    not247: boolean;
    streamUrl: string;
    httpReferrer?: string;
    httpUserAgent?: string;
  }

  const rawEntries: RawParsedEntry[] = [];
  let currentExtinf: string | null = null;
  let currentUserAgent: string | undefined;
  let currentReferrer: string | undefined;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      currentExtinf = line;
      currentUserAgent = extractAttr(line, 'http-user-agent') || undefined;
      currentReferrer = extractAttr(line, 'http-referrer') || undefined;
      continue;
    }

    if (line.startsWith('#EXTVLCOPT:')) {
      const opt = line.slice('#EXTVLCOPT:'.length);
      if (opt.startsWith('http-user-agent=')) {
        currentUserAgent = opt.slice('http-user-agent='.length).trim();
      } else if (opt.startsWith('http-referrer=')) {
        currentReferrer = opt.slice('http-referrer='.length).trim();
      }
      continue;
    }

    if (line.startsWith('#')) {
      continue;
    }

    // Stream URL line
    if (currentExtinf && /^https?:\/\//i.test(line)) {
      const commaIdx = currentExtinf.lastIndexOf(',');
      const rawTitle =
        commaIdx !== -1 ? currentExtinf.slice(commaIdx + 1).trim() : 'Untitled Channel';

      const tvgId = extractAttr(currentExtinf, 'tvg-id');
      const logo = extractAttr(currentExtinf, 'tvg-logo');
      const groupTitle = extractAttr(currentExtinf, 'group-title') || 'General';

      const isGeoBlocked = /\[geo-blocked\]/i.test(rawTitle);
      const not247 = /\[not\s*24\/7\]/i.test(rawTitle);
      const qualityMatch = rawTitle.match(/\((\d{3,4}p)\)/i);
      const quality = qualityMatch
        ? qualityMatch[1].toLowerCase()
        : /\bHD\b/.test(rawTitle)
          ? 'HD'
          : 'SD';

      const cleanName = rawTitle
        .replace(/\s*\(\d{3,4}p\)/gi, '')
        .replace(/\s*\[[^\]]+\]/g, '')
        .replace(/\s*\(India\)/gi, '')
        .trim();

      rawEntries.push({
        tvgId,
        logo,
        groupTitle,
        rawTitle,
        cleanName: cleanName || rawTitle,
        quality,
        isGeoBlocked,
        not247,
        streamUrl: line,
        httpReferrer: currentReferrer,
        httpUserAgent: currentUserAgent,
      });

      currentExtinf = null;
      currentUserAgent = undefined;
      currentReferrer = undefined;
    }
  }

  // Group streams by canonical channel key so multi-stream channels appear once with feed switcher
  const grouped = new Map<string, RawParsedEntry[]>();

  for (const entry of rawEntries) {
    const baseKey =
      (entry.tvgId ? entry.tvgId.split('@')[0].toLowerCase() : '') ||
      slugify(entry.cleanName);
    const existing = grouped.get(baseKey);
    if (existing) {
      existing.push(entry);
    } else {
      grouped.set(baseKey, [entry]);
    }
  }

  const languageLabel = IPTV_SOURCES[mode].languageLabel;
  const channels: Channel[] = [];
  let idx = 0;

  for (const [baseKey, variants] of grouped.entries()) {
    // Prefer non-geoblocked & highest quality stream as primary
    const sortedVariants = [...variants].sort((a, b) => {
      if (a.isGeoBlocked !== b.isGeoBlocked) return a.isGeoBlocked ? 1 : -1;
      return parseQualityScore(b.quality) - parseQualityScore(a.quality);
    });

    const primary = sortedVariants[0];
    const category = mapGroupToCategory(primary.groupTitle, primary.cleanName);
    const accentColor = getCategoryAccent(category);
    const id = slugify(baseKey || primary.cleanName) || `channel-${idx + 1}`;
    const popularityRank = computePopularityRank(
      primary.cleanName,
      primary.quality,
      primary.isGeoBlocked,
      idx
    );

    const alternateStreams: StreamVariant[] = sortedVariants.map((v, vIdx) => ({
      url: v.streamUrl,
      quality: v.quality,
      label:
        sortedVariants.length > 1
          ? `Feed ${vIdx + 1} (${v.quality}${v.isGeoBlocked ? ' · Geo' : ''})`
          : `${v.quality} Live`,
      isGeoBlocked: v.isGeoBlocked,
      not247: v.not247,
    }));

    const subGenre =
      primary.groupTitle && primary.groupTitle !== 'Undefined'
        ? primary.groupTitle.replace(/;/g, ' & ')
        : category;

    const region =
      /telangana|yadagiri|t\s*news|v6/i.test(primary.cleanName)
        ? 'Telangana'
        : /andhra|saptagiri/i.test(primary.cleanName)
          ? 'Andhra Pradesh'
          : mode === 'telugu'
            ? 'AP & Telangana'
            : 'India';

    channels.push({
      id,
      tvgId: primary.tvgId || id,
      channelNumber: String(101 + idx),
      name: primary.cleanName,
      rawTitle: primary.rawTitle,
      shortCode: deriveShortCode(primary.cleanName),
      accentColor,
      category,
      rawGroupTitle: primary.groupTitle,
      subGenre,
      language: languageLabel,
      country: 'IN',
      logo: primary.logo,
      thumbnail: pickBackdrop(primary.cleanName, category),
      streamType: 'hls',
      streamUrl: primary.streamUrl,
      alternateStreams,
      quality: primary.quality,
      isGeoBlocked: primary.isGeoBlocked,
      not247: primary.not247,
      httpReferrer: primary.httpReferrer,
      httpUserAgent: primary.httpUserAgent,
      isLive: true,
      isFree: true,
      authorizedSource: true,
      popularityRank,
      featuredInLiveRail: false,
      description: `${primary.cleanName} is a publicly listed ${languageLabel} ${subGenre.toLowerCase()} television broadcast sourced live from the open-source iptv-org directory (${primary.quality} HLS stream).`,
      broadcaster: primary.tvgId ? primary.tvgId.split('.')[0] : primary.cleanName,
      region,
    });

    idx += 1;
  }

  // Sort by computed prominence rank, assign clean sequential channel numbers, and flag top Live Now rail
  channels.sort((a, b) => a.popularityRank - b.popularityRank);

  channels.forEach((ch, i) => {
    ch.channelNumber = String(101 + i);
    ch.featuredInLiveRail = i < 12 && !ch.isGeoBlocked;
  });

  return channels;
}

function readCache(cacheKey: string): CachedPlaylist | null {
  try {
    const raw = window.localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPlaylist;
    if (
      parsed &&
      Array.isArray(parsed.channels) &&
      parsed.channels.length > 0 &&
      Date.now() - parsed.fetchedAt < CACHE_TTL_MS
    ) {
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function writeCache(cacheKey: string, data: CachedPlaylist): void {
  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore quota errors (e.g. large India playlist in restricted storage)
  }
}

export async function fetchIptvChannels(options: {
  mode: PlaylistMode;
  customPlaylistUrl?: string;
  forceRefresh?: boolean;
}): Promise<{ channels: Channel[]; sourceUrl: string; fetchedAt: number }> {
  const sourceUrl =
    options.customPlaylistUrl?.trim() || IPTV_SOURCES[options.mode].url;
  const cacheKey = `${CACHE_PREFIX}${options.mode}_${slugify(sourceUrl).slice(0, 40)}`;

  if (!options.forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      return {
        channels: cached.channels,
        sourceUrl: cached.sourceUrl,
        fetchedAt: cached.fetchedAt,
      };
    }
  }

  const response = await fetch(sourceUrl, {
    headers: { Accept: 'audio/x-mpegurl, text/plain, */*' },
  });

  if (!response.ok) {
    throw new Error(`Playlist request failed (${response.status})`);
  }

  const m3uText = await response.text();
  const channels = parseM3UPlaylist(m3uText, options.mode);

  if (channels.length === 0) {
    throw new Error('No playable channels were found in the M3U playlist.');
  }

  const fetchedAt = Date.now();
  writeCache(cacheKey, { fetchedAt, sourceUrl, channels });

  return { channels, sourceUrl, fetchedAt };
}
