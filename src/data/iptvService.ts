import {
  Channel,
  ChannelCategory,
  PlaylistMode,
  StreamVariant,
} from '../types/channel';
import {
  CATEGORY_BACKDROPS,
  CHANNEL_BACKDROP_OVERRIDES,
  COUNTRY_NAMES,
  GLOBAL_POPULARITY_PATTERNS,
  GitHubPlaylistEndpoint,
  IPTV_SOURCES,
  POPULARITY_PRIORITY_PATTERNS,
} from './data';

const CACHE_PREFIX = 'tltv_iptv_cache_v2_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOCALSTORAGE_CHANNELS = 1200;

interface CachedPlaylist {
  fetchedAt: number;
  sourceUrl: string;
  activeSources: string[];
  channels: Channel[];
}

interface RawParsedEntry {
  tvgId: string;
  tvgCountry: string;
  logo: string;
  groupTitle: string;
  rawTitle: string;
  cleanName: string;
  quality: string;
  isGeoBlocked: boolean;
  not247: boolean;
  streamUrl: string;
  sourceName: string;
  priorityBoost: number;
  httpReferrer?: string;
  httpUserAgent?: string;
}

const memoryCache = new Map<string, CachedPlaylist>();

const TELUGU_MATCH_REGEX =
  /(telugu|saptagiri|yadagiri|tv9\s*telugu|ntv|tv5|abn|sakshi|t\s*news|etv|svbc|bhakthi|v6\s*news|10\s*tv|hmtv|mahaa|star\s*maa|zee\s*telugu|gemini|kushi|t-sat|tsat|cvr\s*news|prime9|99tv|big\s*tv|6\s*tv|raj\s*musix\s*telugu|hindu\s*dharmam|subhavaartha|calvary|divyavani|aradhana)/i;

const NON_HLS_PAGE_REGEX =
  /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be|twitch\.tv|dailymotion\.com|vimeo\.com|facebook\.com)\//i;

const COUNTRY_NAME_TO_CODE = new Map<string, string>(
  Object.entries(COUNTRY_NAMES).map(([code, name]) => [name.toLowerCase(), code])
);

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

  if (
    /(news|vartalu|bulletin|tv9|ntv|tv5|abn|sakshi|hmtv|v6|10\s*tv|t\s*news|mahaa\s*news|prime9|brk\s*news|cvr\s*news|big\s*tv|99tv|6\s*tv|cnn|bbc\s*(news|world)|euronews|al\s*jazeera|bloomberg|cnbc|msnbc|fox\s*news|sky\s*news|france\s*24|dw\b|wion|nhk\s*world|ndtv|aaj\s*tak|cna\b|abc\s*news|cbs\s*news|nbc\s*news|weather)/i.test(
      combined
    )
  ) {
    return 'News';
  }
  if (
    /(relig|devot|bhakt|spiritual|svbc|aastha|dharmam|calvary|divyavani|subhavaartha|nireekshana|church|gospel|islam|quran|tbn|ewtn|god\s*tv)/i.test(
      combined
    )
  ) {
    return 'Devotional';
  }
  if (
    /(movie|cinema|film|tolly|bolly|holly|action|thriller|horror|sci-fi|western|classic\s*film|rakuten|cine)/i.test(
      combined
    )
  ) {
    return 'Movies';
  }
  if (/(music|musix|beats|songs|mtv|vh1|vevo|concert|radio|hits|jazz|rock|pop)/i.test(combined)) {
    return 'Music';
  }
  if (
    /(kid|animation|cartoon|yay|bal\s*bharat|kushi|nick|disney|pbs\s*kids|baby|junior|toons|anime)/i.test(
      combined
    )
  ) {
    return 'Kids';
  }
  if (
    /(educat|documentary|science|history|vidya|nipuna|t-sat|tsat|health|nasa|nature|wildlife|discover|curiosity|smithsonian|travel|cooking|food|business|finance|parliament|legislative)/i.test(
      combined
    )
  ) {
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
    .replace(/\b(HD|SD|FHD|UHD|4K|Telugu|TV|India|News|Live)\b/gi, (m) =>
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
  if (/4k|2160/i.test(quality)) return 2160;
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

function inferCountryAndRegion(
  entry: RawParsedEntry,
  mode: PlaylistMode
): { countryCode: string; region: string } {
  if (mode === 'telugu') {
    const region = /telangana|yadagiri|t\s*news|v6/i.test(entry.cleanName)
      ? 'Telangana'
      : /andhra|saptagiri/i.test(entry.cleanName)
        ? 'Andhra Pradesh'
        : 'AP & Telangana';
    return { countryCode: 'IN', region };
  }

  if (mode === 'india') {
    const region = /telangana|yadagiri|t\s*news|v6/i.test(entry.cleanName)
      ? 'Telangana'
      : /andhra|saptagiri/i.test(entry.cleanName)
        ? 'Andhra Pradesh'
        : 'India';
    return { countryCode: 'IN', region };
  }

  // Global mode: check tvg-country first
  if (entry.tvgCountry) {
    const code = entry.tvgCountry.split(';')[0].trim().toUpperCase();
    if (code.length === 2 || code === 'INT') {
      return {
        countryCode: code === 'UK' ? 'GB' : code,
        region: COUNTRY_NAMES[code] ?? code,
      };
    }
  }

  // Check country suffix in tvg-id (e.g. "BBCNews.uk@SD" or "CNN.us")
  if (entry.tvgId) {
    const beforeAt = entry.tvgId.split('@')[0];
    const dotMatch = beforeAt.match(/\.([a-z]{2})$/i);
    if (dotMatch) {
      const code = dotMatch[1].toUpperCase();
      return {
        countryCode: code === 'UK' ? 'GB' : code,
        region: COUNTRY_NAMES[code] ?? code,
      };
    }
  }

  // Check if group-title itself is a known country name (Free-TV, Samsung TV Plus, Plex)
  const groupLower = entry.groupTitle.split(';')[0].trim().toLowerCase();
  const matchedCode = COUNTRY_NAME_TO_CODE.get(groupLower);
  if (matchedCode) {
    return {
      countryCode: matchedCode === 'UK' ? 'GB' : matchedCode,
      region: COUNTRY_NAMES[matchedCode] ?? entry.groupTitle,
    };
  }

  return { countryCode: 'INT', region: 'International' };
}

function computePopularityRank(
  name: string,
  quality: string,
  isGeoBlocked: boolean,
  hasLogo: boolean,
  priorityBoost: number,
  mode: PlaylistMode,
  index: number
): number {
  const patterns =
    mode === 'global' ? GLOBAL_POPULARITY_PATTERNS : POPULARITY_PRIORITY_PATTERNS;

  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(name)) {
      return i + 1 + (isGeoBlocked ? 150 : 0) - Math.min(priorityBoost, i);
    }
  }

  const hdBonus = parseQualityScore(quality) >= 720 ? 0 : 25;
  const logoBonus = hasLogo ? 0 : 35;
  const geoPenalty = isGeoBlocked ? 200 : 0;
  return 50 + hdBonus + logoBonus + geoPenalty - priorityBoost + index * 0.01;
}

function parseSingleM3UText(
  m3uContent: string,
  sourceName: string,
  priorityBoost = 0,
  filterTeluguOnly = false
): RawParsedEntry[] {
  const normalized = m3uContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

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

    if (currentExtinf && /^https?:\/\//i.test(line)) {
      // Skip non-HLS web page URLs (e.g. YouTube/Twitch links in Free-TV)
      if (NON_HLS_PAGE_REGEX.test(line)) {
        currentExtinf = null;
        currentUserAgent = undefined;
        currentReferrer = undefined;
        continue;
      }

      const commaIdx = currentExtinf.lastIndexOf(',');
      const rawTitle =
        commaIdx !== -1 ? currentExtinf.slice(commaIdx + 1).trim() : 'Untitled Channel';

      const tvgId = extractAttr(currentExtinf, 'tvg-id');
      const tvgCountry = extractAttr(currentExtinf, 'tvg-country');
      const logo = extractAttr(currentExtinf, 'tvg-logo');
      const groupTitle = extractAttr(currentExtinf, 'group-title') || 'General';

      const isGeoBlocked = /\[geo-blocked\]|Ⓖ/i.test(rawTitle);
      const not247 = /\[not\s*24\/7\]/i.test(rawTitle);
      const qualityMatch = rawTitle.match(/\((\d{3,4}p)\)/i);
      const quality = qualityMatch
        ? qualityMatch[1].toLowerCase()
        : /\b(4K|UHD)\b/i.test(rawTitle)
          ? '4K'
          : /\b(FHD|1080)\b/i.test(rawTitle)
            ? '1080p'
            : /\bHD\b/i.test(rawTitle)
              ? 'HD'
              : sourceName === 'Free-TV' || sourceName === 'Samsung TV Plus'
                ? 'HD'
                : 'SD';

      const cleanName = rawTitle
        .replace(/\s*\(\d{3,4}p\)/gi, '')
        .replace(/\s*\[[^\]]+\]/g, '')
        .replace(/[ⓈⓎⓉⒼⓋ]/g, '')
        .replace(/\s*\(India\)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (filterTeluguOnly && !TELUGU_MATCH_REGEX.test(`${cleanName} ${groupTitle} ${tvgId}`)) {
        currentExtinf = null;
        currentUserAgent = undefined;
        currentReferrer = undefined;
        continue;
      }

      rawEntries.push({
        tvgId,
        tvgCountry,
        logo,
        groupTitle,
        rawTitle,
        cleanName: cleanName || rawTitle,
        quality,
        isGeoBlocked,
        not247,
        streamUrl: line,
        sourceName,
        priorityBoost,
        httpReferrer: currentReferrer,
        httpUserAgent: currentUserAgent,
      });

      currentExtinf = null;
      currentUserAgent = undefined;
      currentReferrer = undefined;
    }
  }

  return rawEntries;
}

function buildChannelsFromEntries(rawEntries: RawParsedEntry[], mode: PlaylistMode): Channel[] {
  const grouped = new Map<string, RawParsedEntry[]>();

  for (const entry of rawEntries) {
    // Group by normalized channel name + country (or tvg-id prefix) so multi-repo HLS feeds merge cleanly
    const normalizedName = slugify(entry.cleanName);
    const { countryCode } = inferCountryAndRegion(entry, mode);
    const baseKey =
      mode === 'global'
        ? `${normalizedName || slugify(entry.tvgId)}-${countryCode.toLowerCase()}`
        : (entry.tvgId ? slugify(entry.tvgId.split('@')[0]) : '') || normalizedName;

    if (!baseKey) continue;
    const existing = grouped.get(baseKey);
    if (existing) {
      // Avoid exact duplicate stream URLs
      if (!existing.some((item) => item.streamUrl === entry.streamUrl)) {
        existing.push(entry);
      }
    } else {
      grouped.set(baseKey, [entry]);
    }
  }

  const languageLabel = IPTV_SOURCES[mode].languageLabel;
  const channels: Channel[] = [];
  let idx = 0;

  for (const [baseKey, variants] of grouped.entries()) {
    // Prefer non-geoblocked, higher-boosted source, and higher resolution as primary HLS stream
    const sortedVariants = [...variants].sort((a, b) => {
      if (a.isGeoBlocked !== b.isGeoBlocked) return a.isGeoBlocked ? 1 : -1;
      if (a.priorityBoost !== b.priorityBoost) return b.priorityBoost - a.priorityBoost;
      return parseQualityScore(b.quality) - parseQualityScore(a.quality);
    });

    const primary = sortedVariants[0];
    const bestLogo = sortedVariants.find((v) => v.logo)?.logo ?? '';
    const bestGroupTitle =
      sortedVariants.find(
        (v) =>
          v.groupTitle &&
          v.groupTitle !== 'Undefined' &&
          v.groupTitle !== 'General' &&
          !COUNTRY_NAME_TO_CODE.has(v.groupTitle.toLowerCase())
      )?.groupTitle ?? primary.groupTitle;

    const category = mapGroupToCategory(bestGroupTitle, primary.cleanName);
    const accentColor = getCategoryAccent(category);
    const id = slugify(baseKey || primary.cleanName) || `channel-${idx + 1}`;
    const { countryCode, region } = inferCountryAndRegion(primary, mode);
    const maxBoost = Math.max(...sortedVariants.map((v) => v.priorityBoost));

    const popularityRank = computePopularityRank(
      primary.cleanName,
      primary.quality,
      primary.isGeoBlocked,
      Boolean(bestLogo),
      maxBoost,
      mode,
      idx
    );

    const alternateStreams: StreamVariant[] = sortedVariants.map((v, vIdx) => ({
      url: v.streamUrl,
      quality: v.quality,
      sourceName: v.sourceName,
      label:
        sortedVariants.length > 1
          ? `${v.sourceName} · ${v.quality}${v.isGeoBlocked ? ' (Geo)' : ''}`
          : `${v.sourceName} · ${v.quality}`,
      isGeoBlocked: v.isGeoBlocked,
      not247: v.not247,
    }));

    const subGenre =
      bestGroupTitle &&
      bestGroupTitle !== 'Undefined' &&
      !COUNTRY_NAME_TO_CODE.has(bestGroupTitle.toLowerCase())
        ? bestGroupTitle.replace(/;/g, ' & ')
        : category;

    const uniqueSourceNames = Array.from(new Set(sortedVariants.map((v) => v.sourceName)));

    channels.push({
      id,
      tvgId: primary.tvgId || id,
      channelNumber: String(101 + idx),
      name: primary.cleanName,
      rawTitle: primary.rawTitle,
      shortCode: deriveShortCode(primary.cleanName),
      accentColor,
      category,
      rawGroupTitle: bestGroupTitle,
      subGenre,
      language: mode === 'global' ? region : languageLabel,
      country: countryCode,
      sourceName: primary.sourceName,
      logo: bestLogo,
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
      description: `${primary.cleanName} is a publicly listed ${region} ${subGenre.toLowerCase()} live HLS broadcast sourced via ${uniqueSourceNames.join(' & ')} (${primary.quality}).`,
      broadcaster: primary.tvgId ? primary.tvgId.split('.')[0] : primary.cleanName,
      region,
    });

    idx += 1;
  }

  channels.sort((a, b) => a.popularityRank - b.popularityRank);

  channels.forEach((ch, i) => {
    ch.channelNumber = String(101 + i);
    ch.featuredInLiveRail = i < 16 && !ch.isGeoBlocked;
  });

  return channels;
}

/**
 * Parses a single M3U playlist text into structured Channel objects.
 */
export function parseM3UPlaylist(
  m3uContent: string,
  mode: PlaylistMode,
  sourceName = 'iptv-org'
): Channel[] {
  const entries = parseSingleM3UText(m3uContent, sourceName, 0, false);
  return buildChannelsFromEntries(entries, mode);
}

function readCache(cacheKey: string): CachedPlaylist | null {
  const inMemory = memoryCache.get(cacheKey);
  if (inMemory && Date.now() - inMemory.fetchedAt < CACHE_TTL_MS) {
    return inMemory;
  }

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
      memoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function writeCache(cacheKey: string, data: CachedPlaylist): void {
  memoryCache.set(cacheKey, data);

  // Skip localStorage persistence for very large Global playlists to avoid storage quota stalls
  if (data.channels.length > MAX_LOCALSTORAGE_CHANNELS) {
    return;
  }

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

async function fetchEndpointText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'audio/x-mpegurl, text/plain, */*' },
  });
  if (!response.ok) {
    throw new Error(`Playlist request failed (${response.status}) for ${url}`);
  }
  return response.text();
}

export async function fetchIptvChannels(options: {
  mode: PlaylistMode;
  customPlaylistUrl?: string;
  forceRefresh?: boolean;
}): Promise<{
  channels: Channel[];
  sourceUrl: string;
  activeSources: string[];
  fetchedAt: number;
}> {
  const customUrl = options.customPlaylistUrl?.trim() || '';
  const modeConfig = IPTV_SOURCES[options.mode];
  const sourceUrl = customUrl || modeConfig.url;
  const cacheKey = `${CACHE_PREFIX}${options.mode}_${slugify(sourceUrl).slice(0, 48)}`;

  if (!options.forceRefresh) {
    const cached = readCache(cacheKey);
    if (cached) {
      return {
        channels: cached.channels,
        sourceUrl: cached.sourceUrl,
        activeSources: cached.activeSources,
        fetchedAt: cached.fetchedAt,
      };
    }
  }

  const endpoints: GitHubPlaylistEndpoint[] = customUrl
    ? [
        {
          name: 'Custom M3U',
          repo: customUrl,
          url: customUrl,
        },
      ]
    : modeConfig.sources;

  const settled = await Promise.allSettled(
    endpoints.map(async (ep) => {
      const text = await fetchEndpointText(ep.url);
      return {
        endpoint: ep,
        entries: parseSingleM3UText(
          text,
          ep.name,
          ep.priorityBoost ?? 0,
          Boolean(ep.filterTeluguOnly)
        ),
      };
    })
  );

  const combinedEntries: RawParsedEntry[] = [];
  const activeSources: string[] = [];
  const errors: string[] = [];

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      if (result.value.entries.length > 0) {
        combinedEntries.push(...result.value.entries);
        activeSources.push(result.value.endpoint.name);
      }
    } else {
      errors.push(
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );
    }
  }

  if (combinedEntries.length === 0) {
    throw new Error(
      errors[0] || 'No playable HLS channels were found across the configured playlists.'
    );
  }

  const channels = buildChannelsFromEntries(combinedEntries, options.mode);

  if (channels.length === 0) {
    throw new Error('No playable HLS channels were found in the M3U playlists.');
  }

  const fetchedAt = Date.now();
  const payload: CachedPlaylist = {
    fetchedAt,
    sourceUrl:
      customUrl ||
      (activeSources.length > 1
        ? `${activeSources.join(' + ')} (${endpoints.length} GitHub playlists)`
        : modeConfig.url),
    activeSources,
    channels,
  };
  writeCache(cacheKey, payload);

  return {
    channels: payload.channels,
    sourceUrl: payload.sourceUrl,
    activeSources: payload.activeSources,
    fetchedAt,
  };
}
