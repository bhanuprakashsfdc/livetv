import { CategoryTile, ChannelCategory, PlaylistMode } from '../types/channel';

export interface GitHubPlaylistEndpoint {
  name: string;
  repo: string;
  url: string;
  filterTeluguOnly?: boolean;
  priorityBoost?: number;
}

/**
 * Live public free-to-air IPTV HLS playlist endpoints aggregated from multiple
 * open-source GitHub repositories (iptv-org/iptv, Free-TV/IPTV, BuddyChewChew FAST).
 */
export const IPTV_SOURCES: Record<
  PlaylistMode,
  {
    label: string;
    description: string;
    url: string;
    languageLabel: string;
    sources: GitHubPlaylistEndpoint[];
  }
> = {
  telugu: {
    label: 'Telugu Live',
    description:
      'Free-to-air Telugu channels aggregated from iptv-org & Free-TV GitHub HLS playlists',
    url: 'https://iptv-org.github.io/iptv/languages/tel.m3u',
    languageLabel: 'Telugu',
    sources: [
      {
        name: 'iptv-org',
        repo: 'iptv-org/iptv',
        url: 'https://iptv-org.github.io/iptv/languages/tel.m3u',
      },
      {
        name: 'Free-TV',
        repo: 'Free-TV/IPTV',
        url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_india.m3u8',
        filterTeluguOnly: true,
        priorityBoost: 2,
      },
    ],
  },
  india: {
    label: 'India Mode',
    description:
      'Indian national & regional HLS channels aggregated from iptv-org & Free-TV GitHub repos',
    url: 'https://iptv-org.github.io/iptv/countries/in.m3u',
    languageLabel: 'India',
    sources: [
      {
        name: 'Free-TV',
        repo: 'Free-TV/IPTV',
        url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/playlist_india.m3u8',
        priorityBoost: 5,
      },
      {
        name: 'iptv-org',
        repo: 'iptv-org/iptv',
        url: 'https://iptv-org.github.io/iptv/countries/in.m3u',
      },
    ],
  },
  global: {
    label: 'Global Mode',
    description:
      'Worldwide free-to-air & FAST HLS channels aggregated from Free-TV, iptv-org, Samsung TV Plus & Pluto TV GitHub repos',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    languageLabel: 'Global',
    sources: [
      {
        name: 'Free-TV',
        repo: 'Free-TV/IPTV',
        url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
        priorityBoost: 15,
      },
      {
        name: 'Samsung TV Plus',
        repo: 'BuddyChewChew/app-m3u-generator',
        url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/samsungtvplus_all.m3u',
        priorityBoost: 8,
      },
      {
        name: 'Pluto TV',
        repo: 'BuddyChewChew/app-m3u-generator',
        url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/plutotv_all.m3u',
        priorityBoost: 6,
      },
      {
        name: 'iptv-org',
        repo: 'iptv-org/iptv',
        url: 'https://iptv-org.github.io/iptv/index.m3u',
      },
    ],
  },
};

export const EXTRA_GITHUB_PRESETS: Array<{
  label: string;
  repo: string;
  url: string;
}> = [
  {
    label: 'Free-TV Global Curated HD',
    repo: 'Free-TV/IPTV',
    url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
  },
  {
    label: 'iptv-org Global Master',
    repo: 'iptv-org/iptv',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
  },
  {
    label: 'Samsung TV Plus Global',
    repo: 'BuddyChewChew/app-m3u-generator',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/samsungtvplus_all.m3u',
  },
  {
    label: 'Pluto TV Global',
    repo: 'BuddyChewChew/app-m3u-generator',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/plutotv_all.m3u',
  },
  {
    label: 'Plex Live TV Global',
    repo: 'BuddyChewChew/app-m3u-generator',
    url: 'https://raw.githubusercontent.com/BuddyChewChew/app-m3u-generator/main/playlists/plex_all.m3u',
  },
  {
    label: 'iptv-org Global News',
    repo: 'iptv-org/iptv',
    url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
  },
  {
    label: 'iptv-org Global Movies',
    repo: 'iptv-org/iptv',
    url: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
  },
  {
    label: 'iptv-org Global Sports',
    repo: 'iptv-org/iptv',
    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
  },
];

export const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India',
  US: 'United States',
  GB: 'United Kingdom',
  UK: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  AE: 'UAE',
  SG: 'Singapore',
  NL: 'Netherlands',
  BR: 'Brazil',
  MX: 'Mexico',
  RU: 'Russia',
  TR: 'Turkey',
  ZA: 'South Africa',
  NZ: 'New Zealand',
  IE: 'Ireland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  PL: 'Poland',
  PT: 'Portugal',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  MY: 'Malaysia',
  ID: 'Indonesia',
  PH: 'Philippines',
  TH: 'Thailand',
  VN: 'Vietnam',
  CN: 'China',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  SA: 'Saudi Arabia',
  QA: 'Qatar',
  EG: 'Egypt',
  NG: 'Nigeria',
  KE: 'Kenya',
  IL: 'Israel',
  GR: 'Greece',
  UA: 'Ukraine',
  RO: 'Romania',
  CZ: 'Czechia',
  HU: 'Hungary',
  AL: 'Albania',
  INT: 'International',
};

export const HERO_BANNER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrAk8msnNBByy4GMgdHUHB8pJ0__dX6dyDkH6KMIxD5WhSt5gIquh6C1tiA0uSWb0zZVJDuscNuRtdAt8EecmaON6g0rfe2Vx9OTjTkNK60WJehXf8IMZaMPmd7873KGMCx2pgUa1SFQEjxrpPktB-DEqFcBB4AFtmlpGQOx0IHhbjwxPHghslaPYnhwVbafj2EW4-iAGROJz5D7m5umEnDiN5C8PHy6GZZUWsu3QJ';

export const CATEGORY_BACKDROPS: Record<ChannelCategory, string> = {
  News:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPILHTy77vBaWWZqnq2Uq8LZ8OwiX68sKDBgYvUIpOJpHco87Lhyb5Q-S7pbLM1tiY0_1cSUH28Sm6vBxEHdlk99o92-yd0BkzKDbXV87Wtrc2TleKl5NKkSzu_k2VLUxhDu7tMSFFut85ZurCZMUCPqO-2qU_8paCxElUJjYiNcF9mFYDpTsfjtPbkbpd6wqUSN6t4Apk1wLyifj5AnGbilZWrf2avxl__URx93kI',
  Entertainment:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC7qAkdWXINtMIxlB3Ctr1DjptRVnYFPrYUYIgyC1KtZ5pSLOsSlUuUuW9a_VwjJVLhKvZaB3zpyVuqQ43a1wXZAAmqG0X4Xm8d1fMbFjV8w2RvSCHLFqcXdj2NqCdAiAYTTgYhyAq6nQJ6A7h-wPijFXc4XeLSPnSN3ZScJ8WpcPTnFeFF7lB7oSaAqoTchp8d_wQFQd_Tlh7hMooOXzekT1QvhDQOS89STNpi3H8W',
  Movies:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAEz97oQpFY8COnBcXHJjvbf8PjoJQvTKzHu3Z-r7bea5mGZY8xfWsP3x9ZP-NMRejDNXzMkVVjsUH04tsRz3_aabFCB4d8s6uVNi6_NQP_J3wcQyGh_oNU5Wvdsne3VUWk95CsSQJfx5XlZJP3BMmPnr_FhpSmzKx1sId9yHU279Z5x_EjVoUH3zwYGMbcrLLLGwN2WX-Bl_dd-PjWkP86uyr_FMK5kWt0kqlJ8Og-',
  Devotional:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDK6MnAvqbfTqnLlxIgiSBnY9rfxSIkm1ISBs5iyXpzomL-5NDYHfGOmTw4vDuj45MvsTB2szCpTWWDT2MCskuEmh6LfYJkjV-OyVU53SI9EZr-SDvV9E0fXRehEt-filBf_IApWCpszk_n--Mdn5Y6blKYVdM4NJAQ5_p3m1WMKjn4ANALSkTFwgIQWargbf1MZaU3g03Zz4HCuvWxp1OLTZCaUkjFeLBAx1eGGDD8',
  Music:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDbJ4Ifs6KpQf0LCwalBGLWGZFFVrbVa7jDyZ-2XBNrwOTcbDN0V92e9FsKQVa7o-Q5i-kyiBA2PUt41sopqU4btY36ymh4E_7vqXMfzyypqZYV2R9TGKy9WyG8RlHR3YpzwhYbLak2bwINJoHdUPfwE0Vwwpg0PpuzD4rM3NE755XYM3LPSoPfEpd7g_34GBEAkDfV0aN-tutqoPZMpdEU_p4BU2GzM0qBfKtKPmQN',
  Kids:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIxZ7J9aoTf1DI0OkNC6cMGEHO576bLgPFGW2k9OfVrwlNEWOxB6XKuXL3u6YiyjVZ3WCZFqOW-mKsiooVlzjI6gVNzIjVOelB5DQ7INFTLppllQG8XVFvviZxm93tbhAm-ObLjTo6TEGQRDMdVRjvCiHApxNwIbir935Sqp0jk8COlKI8U-FU06l4Ym_KoaEWAI1nz-AiDs86hWSqRYn8RklHNWRhzs8K4I5lxZ0w',
  Educational:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDKhJHtddaH64OCXNYWoy0HG8Oi8hbL2YgCHzexGDUFVhMaU32NolJNVtQUtpbjZfhbAJz78F5iLR3LgE5_VRRcJ5lF2Wjd2O3h7H9qm48Q_ssff8qVf-AFO0kO0KFggt07G3DeYnL-N1A0_kHATxhTZZZdppviKdbbZfh_cIHpNaRSEBkcMinKwwl5UOQYKBsCG-lRSVp48NUKhqdlNKt-DrduNgAJe9D4Xlo_4WTP',
};

export const CHANNEL_BACKDROP_OVERRIDES: Array<{ pattern: RegExp; url: string }> = [
  {
    pattern: /dd\s*saptagiri/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-W-Ohazj-onOviSEzb-KrkMiTVzmX7DXen5zZhIDr52vMBmfor4uBr91IGm3L1S6zLX9bFydSYdZ0Lvnr9B6f-YMssrZ4ZY5o8Q1RLd61oLrBZgAo0k1juBdtyg33b6iA6SekLX536BPE_q_0gnng5aT3secME6PeH8Fazgi28fQRO0SpP22Ndhtl4ZHIpQZoDA2aLY7zSjJy79A54Rykihsg9ZaYmtFOHaJL3N6O',
  },
  {
    pattern: /dd\s*yadagiri/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBO7YSnJNobWpEa5UmJO2NlNL-3JcYcypR2CoZ52jUhWj-QFA_DqSy5fnKyJK9g6eTdx4ga5NXYIObvXz4PqNhg_GfCRlb7VMjnG9pFjatYhaf3AF30tbIxvwZaXRLXADchoLYsz0VmrxSbVBSRpmHmRKOJBTnZSgmEmjF-cVEfTddGtRcRsvbVgHQuNfEMOXsWTpCC4clS-lymn1hQbZjCROK_jTDpulGMbf8L79jz',
  },
  {
    pattern: /tv9/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBwbxciAqBfISDp8JT_SByUIbpeOXwyHNzubCM4qCCITB2fRRzrAO34TEG5kjrJkkuqBRVijmRzlqGAfEyhpUy5mujjbxFNaJs2kCIikcUtqR76t0NqMxmp-ejzBRTIHDdmsY3akEw6laIQleqvUTQTTsC3vQVHWpvbmn6aQB110aAd4UeutHxUzn8b567IS0WAt8_YnKhXiWmlIHz3DoVOKtbXLEdoUv0-pt2rPnZ',
  },
  {
    pattern: /ntv/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgOhff26WnxHn-eKaQdwsE42hqetSHje2ZxEIP5SVS0bQpa-361_51qq2Qw1po6vj0eSu7kfA_05KLVS1QcX-qDDl2m4Lj810OkrFM3odtfZF0K2oMwUMyyM6Q2pSbhXbf6YpvQKggQ1d2nT4bNVDiTnRneNnhIep_L8qGMxBoriNVvEzAYD9sKcXjj_iKIMnM66qK4A9v1Ec8O-Q6SPZ-2szHG8mcq69hjlUzAdER',
  },
  {
    pattern: /tv5/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfDxJg7vrodfFwYe7pNHpfzh9ZHyzvquqc2IuB6D2vdtDcLS0i3lvIQSR9Kduzx6B6hFTHTF1RV799ix7RHqpUlF6Zay_LkxVeMiJDWUHdCA1xy2HAysEiD_HUd3GSNmhG9gFLdxevKOLgiIQg7Jm5WF9bzQ7QTJbamqHuF5L7YHk_rEnrTAcoFK3Vf1BKhv7-QP711aUHMcoTzTTRKrkpkkKm9UOXbWi4kg90oG58',
  },
  {
    pattern: /sakshi/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrPRg4uT8MJOOzTY_3Ae45zx-Ci62dVFEG6vLQwfSAmPNRRpvMbrQpQGBjbBtJyhqCV8yH4K3DeJ2zKHLhqyY_qpn3ZLJT06v_7Tx-yXs7vlvAvu0P0u_Uo2ZhYU_W7eEHMw24XqDldOsHx2C0XomljzKNEPI-MHFdIcZHbvpa3N1tBqCE8tdFP8uFjj6Th-3O88Wqg7FxUAtMHCZcgccUfdYdVMsLl-l_GAix2g-Z',
  },
  {
    pattern: /t\s*news/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJxBDnzLxVWWrbz-RD-JfWmhDOJK8WAKufArkzGYEmxRzQ0-Vqd0JK9y3UTmhhfrogUq1E7mAWsFgq1cdpqb0Zp6GV6LjIImNiRKmvBunIEzK-reeDnkWN1zlDJrs67kf5ofcKO3RMPpb7pcsn9vGy9zTUylWgFnL7CY-ziXCUcIMGm6L26r28uFASw2998JsrtBTM6gJmtentcUV4PRtt6KBT_OovI7jB36HZQ6yc',
  },
  {
    pattern: /abn/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPkBBVL0sYS-giAjCdxs4vTzZ7YQCI8RcMC-yQQCfBxUWoJ71vlURWR0Roc0fjjV_gxqnc-FEqzfwLUBJfHgnLsdZxsmFbpgkY7YT9_SQLouXkSm2GyDVldMkfv4WFifWBK0MCp2nWP_1fHhwC879elkbPTGyD-DkH3zr0SHV8Tx4wrnRUZR4PWwf0I8NGrnz3ZnupelbzcobEAsTdkhy-ri57JLlyQ2nd6wY8ToMR',
  },
  {
    pattern: /etv\s*(andhra|telangana)/i,
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTPFg7wPkGi-jRYTQWkglaO5bSHNZJ9ou67ibHBvn5hIkEkTuYUN8yRTzBb17GOAxEMiZWj3lMz70L26TLsEGM0upKd7Ggz9CmPldlCfpCb9M-2DKt8wl0amlFwN9ar1e3t0U2hIXqJ6j8M546AYi2HUhxj3fAY-GHrzYN-QoD_g1RgZW_EuOBX4GEkSjL6RxnEpnqkJlf_GnotKcCtTs8gBAEO1MVuKMouO5hNMXc',
  },
];

export const CATEGORIES: CategoryTile[] = [
  {
    id: 'News',
    title: 'Telugu News',
    subtitle: '24x7 live bulletins, debates & regional coverage',
    thumbnail: CATEGORY_BACKDROPS.News,
    accentColor: '#E50914',
    description:
      'Live Telugu journalism, breaking bulletins across Andhra Pradesh & Telangana, and primetime discussions sourced live from iptv-org.',
  },
  {
    id: 'Entertainment',
    title: 'Entertainment',
    subtitle: 'Public broadcasters, family dramas & cultural shows',
    thumbnail: CATEGORY_BACKDROPS.Entertainment,
    accentColor: '#F5B942',
    description:
      'Telugu general entertainment, public service television, comedy, sports, and lifestyle channels.',
  },
  {
    id: 'Movies',
    title: 'Movies',
    subtitle: 'Tollywood classics & cinema showcases',
    thumbnail: CATEGORY_BACKDROPS.Movies,
    accentColor: '#F5B942',
    description:
      'Celebrate Telugu cinema from evergreen golden-era classics to contemporary Tollywood channels.',
  },
  {
    id: 'Devotional',
    title: 'Devotional',
    subtitle: 'Live temple darshan, suprabhatam & spiritual discourses',
    thumbnail: CATEGORY_BACKDROPS.Devotional,
    accentColor: '#FB923C',
    description:
      'Live temple rituals, Vedic chants, bhakti sangeetam, and spiritual broadcasts including SVBC, Bhakthi TV, and Hindu Dharmam.',
  },
  {
    id: 'Music',
    title: 'Music',
    subtitle: 'Telugu film melodies, folk & chartbusters',
    thumbnail: CATEGORY_BACKDROPS.Music,
    accentColor: '#E50914',
    description:
      'Non-stop Telugu film hits, evergreen melodies, and live music channels.',
  },
  {
    id: 'Kids',
    title: 'Kids',
    subtitle: 'Telugu animated stories & family-safe adventures',
    thumbnail: CATEGORY_BACKDROPS.Kids,
    accentColor: '#34D399',
    description:
      'Family-safe Telugu animation, stories, and children’s programming.',
  },
  {
    id: 'Educational',
    title: 'Educational',
    subtitle: 'Documentaries, knowledge & public learning',
    thumbnail: CATEGORY_BACKDROPS.Educational,
    accentColor: '#60A5FA',
    description:
      'Educational, documentary, and informative broadcasts available free-to-air.',
  },
];

/**
 * Dynamic popularity weighting patterns (inspired by arshadakl/streamhub prioritization)
 * used only to rank channels fetched live from iptv-org playlists.
 */
export const POPULARITY_PRIORITY_PATTERNS: RegExp[] = [
  /^tv9\s*telugu/i,
  /^etv\s*telugu/i,
  /^ntv\s*telugu/i,
  /^dd\s*saptagiri/i,
  /^etv\s*andhra\s*pradesh/i,
  /^svbc/i,
  /^tv5\s*news/i,
  /^dd\s*yadagiri/i,
  /^abn\s*andhra\s*jyot/i,
  /^sakshi\s*tv/i,
  /^t\s*news/i,
  /^etv\s*telangana/i,
  /^star\s*maa/i,
  /^zee\s*telugu/i,
  /^etv\s*cinema/i,
  /^bhakthi?\s*tv/i,
  /^v6\s*news/i,
  /^10\s*tv/i,
  /^mahaa\s*news/i,
  /^hmtv/i,
  /^raj\s*musix/i,
];

export const GLOBAL_POPULARITY_PATTERNS: RegExp[] = [
  /^bbc\s*(news|world)/i,
  /^al\s*jazeera\s*english/i,
  /^euronews\s*english/i,
  /^dw\s*english/i,
  /^france\s*24\s*english/i,
  /^bloomberg/i,
  /^abc\s*news\s*live/i,
  /^cbs\s*news/i,
  /^nbc\s*news\s*now/i,
  /^sky\s*news/i,
  /^nhk\s*world/i,
  /^wion/i,
  /^cnn/i,
  /^nasa/i,
  /^red\s*bull\s*tv/i,
  /^dd\s*india/i,
  /^ndtv/i,
  /^tv9\s*telugu/i,
  /^cna\b/i,
  /^rt\s*documentary/i,
  /^tastemade/i,
  /^failarmy/i,
  /^rakuten/i,
  /^plex/i,
];

export function formatRelativeWatchTime(timestamp: number): string {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Watched just now';
  if (minutes < 60) return `Watched ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Watched ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Watched yesterday';
  return `Watched ${days}d ago`;
}
