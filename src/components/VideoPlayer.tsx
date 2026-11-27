import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  RefreshCw,
  AlertTriangle,
  Link2,
  Radio,
  X,
  Check,
  Copy,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Channel } from '../types/channel';
import { LiveBadge } from './LiveBadge';
import { ChannelEmblem } from './ChannelEmblem';
import { MediaImage } from './MediaImage';

interface VideoPlayerProps {
  channel: Channel;
  resolvedStreamUrl: string;
  defaultVolume: number;
  autoReconnect: boolean;
  showWatermark: boolean;
  onSaveCustomStream: (channelId: string, url: string) => void;
  onNotify: (message: string) => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
}

type PlayerStatus = 'unconfigured' | 'loading' | 'playing' | 'paused' | 'error';

interface QualityLevel {
  index: number;
  label: string;
}

type FullscreenHud =
  | { kind: 'volume'; percent: number; muted: boolean }
  | { kind: 'channel'; direction: 'prev' | 'next' };

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  resolvedStreamUrl,
  defaultVolume,
  autoReconnect,
  showWatermark,
  onSaveCustomStream,
  onNotify,
  onPrevChannel,
  onNextChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hudTimerRef = useRef<number | null>(null);
  const volumeRef = useRef<number>(defaultVolume);
  const isMutedRef = useRef<boolean>(false);
  const pendingChannelSwitchRef = useRef<'prev' | 'next' | null>(null);

  const [selectedFeedIndex, setSelectedFeedIndex] = useState<number>(0);
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorDetail, setErrorDetail] = useState<string>('');
  const [volume, setVolume] = useState<number>(defaultVolume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);
  const [showSourcePanel, setShowSourcePanel] = useState<boolean>(false);
  const [draftUrl, setDraftUrl] = useState<string>(resolvedStreamUrl);
  const [reconnectSeed, setReconnectSeed] = useState<number>(0);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [hud, setHud] = useState<FullscreenHud | null>(null);

  const showFullscreenHud = useCallback((nextHud: FullscreenHud, durationMs = 1500) => {
    setHud(nextHud);
    if (hudTimerRef.current !== null) {
      window.clearTimeout(hudTimerRef.current);
    }
    hudTimerRef.current = window.setTimeout(() => {
      setHud(null);
      hudTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (hudTimerRef.current !== null) {
        window.clearTimeout(hudTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSelectedFeedIndex(0);
    setQualityLevels([]);
    setCurrentLevel(-1);
    setShowQualityMenu(false);
    setShowSourcePanel(false);

    if (pendingChannelSwitchRef.current) {
      const dir = pendingChannelSwitchRef.current;
      pendingChannelSwitchRef.current = null;
      showFullscreenHud({ kind: 'channel', direction: dir }, 1800);
    }
  }, [channel.id, showFullscreenHud]);

  const hasCustomOverride =
    resolvedStreamUrl.trim() !== '' && resolvedStreamUrl !== channel.streamUrl;

  const activeFeed =
    channel.alternateStreams[selectedFeedIndex] ?? channel.alternateStreams[0];

  const activeStreamUrl = hasCustomOverride
    ? resolvedStreamUrl
    : activeFeed?.url || channel.streamUrl;

  useEffect(() => {
    setDraftUrl(activeStreamUrl);
  }, [activeStreamUrl, channel.id]);

  useEffect(() => {
    const video = videoRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setQualityLevels([]);
    setCurrentLevel(-1);

    if (!activeStreamUrl.trim()) {
      setStatus('unconfigured');
      setErrorDetail('');
      return;
    }

    if (!video) return;

    setStatus('loading');
    setErrorDetail('');

    const isHlsUrl =
      activeStreamUrl.includes('.m3u8') || channel.streamType === 'hls';

    const startPlayback = () => {
      video.volume = isMuted ? 0 : volume;
      video
        .play()
        .then(() => {
          setStatus('playing');
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video
            .play()
            .then(() => {
              setStatus('playing');
            })
            .catch(() => {
              setStatus('paused');
            });
        });
    };

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 20,
      });
      hlsRef.current = hls;

      hls.loadSource(activeStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        if (data.levels && data.levels.length > 1) {
          const levels: QualityLevel[] = data.levels.map((lvl, idx) => ({
            index: idx,
            label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
          }));
          setQualityLevels(levels);
        }
        startPlayback();
      });

      let networkRetries = 0;

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          autoReconnect &&
          networkRetries < 1
        ) {
          networkRetries += 1;
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && networkRetries < 1) {
          networkRetries += 1;
          hls.recoverMediaError();
          return;
        }

        const geoHint = channel.isGeoBlocked
          ? ' This feed is flagged as geo-restricted by iptv-org.'
          : '';
        setErrorDetail(
          `Unable to play this HLS stream directly in the browser (the broadcaster server may restrict browser CORS or be offline).${geoHint}`
        );
        setStatus('error');
        hls.destroy();
        hlsRef.current = null;
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsUrl) {
      video.src = activeStreamUrl;
      const handleLoaded = () => startPlayback();
      const handleError = () => {
        setErrorDetail(
          'This broadcast feed could not be played in the current browser.'
        );
        setStatus('error');
      };
      video.addEventListener('loadedmetadata', handleLoaded);
      video.addEventListener('error', handleError);
      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('error', handleError);
      };
    } else {
      setErrorDetail('HLS playback is not supported in this browser.');
      setStatus('error');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id, activeStreamUrl, reconnectSeed, autoReconnect]);

  useEffect(() => {
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const docWithWebkit = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const active = Boolean(
        document.fullscreenElement || docWithWebkit.webkitFullscreenElement
      );
      setIsFullscreen(active);
      if (!active) {
        setHud(null);
      }
    };
    const video = videoRef.current;
    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    video?.addEventListener('enterpictureinpicture', onEnterPip);
    video?.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      video?.removeEventListener('enterpictureinpicture', onEnterPip);
      video?.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!activeStreamUrl.trim()) {
      setShowSourcePanel(true);
      return;
    }
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setStatus('playing'))
        .catch(() => setStatus('error'));
    } else {
      video.pause();
      setStatus('paused');
    }
  }, [activeStreamUrl]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      isMutedRef.current = nextMuted;
      return nextMuted;
    });
  }, []);

  const adjustVolume = useCallback(
    (delta: number) => {
      const base = isMutedRef.current ? 0 : volumeRef.current;
      const nextVolume = Math.max(
        0,
        Math.min(1, Math.round((base + delta) * 100) / 100)
      );
      const nextMuted = nextVolume === 0;

      volumeRef.current = nextVolume;
      isMutedRef.current = nextMuted;
      setVolume(nextVolume);
      setIsMuted(nextMuted);

      if (videoRef.current) {
        videoRef.current.volume = nextMuted ? 0 : nextVolume;
        videoRef.current.muted = nextMuted;
      }

      showFullscreenHud({
        kind: 'volume',
        percent: Math.round(nextVolume * 100),
        muted: nextMuted,
      });
    },
    [showFullscreenHud]
  );

  const triggerChannelSwitch = useCallback(
    (direction: 'prev' | 'next') => {
      const handler = direction === 'next' ? onNextChannel : onPrevChannel;
      if (!handler) return;
      pendingChannelSwitchRef.current = direction;
      handler();
    },
    [onNextChannel, onPrevChannel]
  );

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      onNotify('Fullscreen is restricted by the current browser frame.');
    }
  }, [onNotify]);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!activeStreamUrl.trim() || status === 'unconfigured' || status === 'error') {
      onNotify('Picture-in-Picture requires an active playing stream.');
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video && document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      } else {
        onNotify('Picture-in-Picture is not supported in this browser.');
      }
    } catch {
      onNotify('Picture-in-Picture requires an active playing video stream.');
    }
  }, [activeStreamUrl, status, onNotify]);

  const handleReconnect = useCallback(() => {
    setReconnectSeed((n) => n + 1);
  }, []);

  const handleCopyStreamUrl = async () => {
    if (!activeStreamUrl) return;
    try {
      await navigator.clipboard.writeText(activeStreamUrl);
      onNotify('HLS stream URL copied (ready for VLC or external player)');
    } catch {
      onNotify('Unable to access clipboard in this frame.');
    }
  };

  const handleSelectQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setCurrentLevel(levelIndex);
    setShowQualityMenu(false);
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftUrl.trim();
    if (cleaned && !/^https?:\/\//i.test(cleaned)) {
      onNotify('Please enter a valid http:// or https:// HLS stream URL.');
      return;
    }
    onSaveCustomStream(channel.id, cleaned);
    setShowSourcePanel(false);
    if (cleaned) {
      onNotify(`Custom HLS stream saved for ${channel.name}.`);
    } else {
      onNotify(`Restored default iptv-org stream for ${channel.name}.`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isTextInput =
        activeEl &&
        ((activeEl.tagName === 'INPUT' &&
          (activeEl as HTMLInputElement).type !== 'range') ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);

      if (isTextInput || showSourcePanel) {
        return;
      }

      const docWithWebkit = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const inFullscreen =
        Boolean(
          document.fullscreenElement || docWithWebkit.webkitFullscreenElement
        ) || isFullscreen;

      if (inFullscreen && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          adjustVolume(0.05);
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          adjustVolume(-0.05);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          triggerChannelSwitch('next');
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          triggerChannelSwitch('prev');
          return;
        }
      }

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    isFullscreen,
    showSourcePanel,
    adjustVolume,
    triggerChannelSwitch,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
  ]);

  const isPlaying = status === 'playing';
  const activeQualityLabel =
    currentLevel === -1
      ? activeFeed?.quality || channel.quality
      : qualityLevels.find((l) => l.index === currentLevel)?.label || channel.quality;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#1F2937] select-none group"
    >
      <video
        ref={videoRef}
        playsInline
        className={`w-full h-full object-contain bg-black ${
          status === 'playing' || status === 'paused' ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={togglePlayPause}
      />

      {status !== 'playing' && status !== 'paused' && (
        <div className="absolute inset-0 pointer-events-none">
          <MediaImage
            src={channel.thumbnail}
            alt={`${channel.name} broadcast backdrop`}
            fallbackLabel={channel.name}
            fallbackAccent={channel.accentColor}
            className="w-full h-full object-cover opacity-25 scale-105 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/55" />
        </div>
      )}

      {showWatermark && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none">
          <ChannelEmblem
            shortCode={channel.shortCode}
            accentColor={channel.accentColor}
            logo={channel.logo}
            name={channel.name}
            size="sm"
            className="w-7 h-7 text-[10px] rounded-md bg-[#111827]/90 border-white/10 p-1"
          />
          <div className="hidden sm:block text-right">
            <div className="text-[11px] font-semibold text-white/95 leading-tight">
              {channel.name}
            </div>
            <div className="text-[10px] font-mono tabular-nums text-white/65 leading-tight">
              CH {channel.channelNumber} · {activeQualityLabel}
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
        <LiveBadge label="LIVE" size="md" />
        {channel.alternateStreams.length > 1 && !hasCustomOverride && (
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
            {channel.alternateStreams.map((feed, idx) => (
              <button
                key={feed.url}
                type="button"
                onClick={() => setSelectedFeedIndex(idx)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedFeedIndex === idx
                    ? 'bg-[#E50914] text-white'
                    : 'text-white/75 hover:text-white'
                }`}
              >
                {feed.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {hud && isFullscreen && (
        <div
          aria-live="polite"
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          {hud.kind === 'volume' ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#080B12]/90 backdrop-blur-md border border-[#2C364B] shadow-2xl min-w-[200px]">
              {hud.muted || hud.percent === 0 ? (
                <VolumeX className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              ) : (
                <Volume2 className="w-5 h-5 text-white shrink-0" />
              )}
              <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-[#E50914] transition-[width] duration-100"
                  style={{ width: `${hud.percent}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-white w-9 text-right">
                {hud.percent}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#080B12]/90 backdrop-blur-md border border-[#2C364B] shadow-2xl">
              <ChannelEmblem
                shortCode={channel.shortCode}
                accentColor={channel.accentColor}
                logo={channel.logo}
                name={channel.name}
                size="sm"
                className="w-9 h-9 rounded-lg bg-[#111827] border-white/10 p-1"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#F5B942]">
                  {hud.direction === 'next' ? 'Next Channel' : 'Previous Channel'} · CH {channel.channelNumber}
                </div>
                <div className="text-sm font-semibold text-white truncate max-w-[220px]">
                  {channel.name}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/15 border-t-[#E50914] animate-spin mb-4" />
          <p className="text-sm font-semibold text-white">
            Connecting to {channel.name}...
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Loading live {activeQualityLabel} HLS stream from iptv-org
          </p>
        </div>
      )}

      {status === 'unconfigured' && !showSourcePanel && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#171D2A]/90 border border-[#2C364B] flex items-center justify-center mb-4">
            <Radio className="w-7 h-7 text-[#F5B942]" />
          </div>
          <h3 className="text-base sm:text-xl font-semibold text-white max-w-lg">
            No Stream URL Available
          </h3>
          <p className="text-xs sm:text-sm text-[#D1D5DB] max-w-md mt-2 leading-relaxed">
            Attach a broadcaster-authorized HLS (.m3u8) URL to start watching {channel.name}.
          </p>
          <button
            type="button"
            onClick={() => setShowSourcePanel(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <Link2 className="w-4 h-4" />
            <span>Attach HLS Stream URL</span>
          </button>
        </div>
      )}

      {status === 'error' && !showSourcePanel && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 sm:p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-[#FF8A90]" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Stream Temporarily Unavailable
          </h3>
          <p className="text-xs sm:text-sm text-[#D1D5DB] max-w-md mt-1.5 leading-relaxed">
            {errorDetail}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <button
              type="button"
              onClick={handleReconnect}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reconnect</span>
            </button>
            {channel.alternateStreams.length > 1 && !hasCustomOverride && (
              <button
                type="button"
                onClick={() =>
                  setSelectedFeedIndex(
                    (prev) => (prev + 1) % channel.alternateStreams.length
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171D2A] border border-[#2C364B] hover:bg-[#1E2636] text-white text-xs sm:text-sm font-medium transition-colors"
              >
                <span>Try Next Feed</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyStreamUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171D2A] border border-[#2C364B] hover:bg-[#1E2636] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy .m3u8 URL</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSourcePanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#171D2A] border border-[#2C364B] hover:bg-[#1E2636] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span>Custom URL</span>
            </button>
          </div>
        </div>
      )}

      {status === 'paused' && !showSourcePanel && (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={`Resume ${channel.name}`}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35"
        >
          <span className="w-16 h-16 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
            <Play className="w-7 h-7 fill-current ml-0.5" />
          </span>
        </button>
      )}

      {showSourcePanel && (
        <div className="absolute inset-0 z-20 bg-[#080B12]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <form
            onSubmit={handleSaveSource}
            className="w-full max-w-lg rounded-2xl bg-[#171D2A] border border-[#2C364B] p-5 sm:p-6 text-left shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Stream Source — {channel.name}
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  Loaded dynamically from <code className="font-mono text-[#F5B942]">iptv-org</code>. Paste an alternate authorized HLS (.m3u8) URL below to override locally.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSourcePanel(false)}
                aria-label="Close stream source panel"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-white hover:bg-[#111827]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <label
                htmlFor="hls-url-input"
                className="block text-xs font-medium text-[#D1D5DB] mb-1.5"
              >
                HLS Stream URL (.m3u8)
              </label>
              <input
                id="hls-url-input"
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                placeholder="https://broadcaster.example.com/live/stream.m3u8"
                className="w-full h-11 px-3.5 rounded-lg bg-[#111827] border border-[#1F2937] focus:border-[#E50914] text-sm text-white placeholder-[#6B7280] focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyStreamUrl}
                className="text-xs text-[#9CA3AF] hover:text-white inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy current URL</span>
              </button>

              <div className="flex items-center gap-2">
                {hasCustomOverride && (
                  <button
                    type="button"
                    onClick={() => {
                      onSaveCustomStream(channel.id, '');
                      setShowSourcePanel(false);
                      onNotify(`Restored iptv-org stream for ${channel.name}.`);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-[#374151] text-xs font-medium text-[#D1D5DB]"
                  >
                    Reset to iptv-org
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#C50812] text-white text-xs font-semibold transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Play</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-8 pb-3 px-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={handleReconnect}
              aria-label="Reconnect live stream"
              title="Reconnect stream"
              className="w-10 h-10 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center justify-center transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`}
              />
            </button>

            {isFullscreen && onPrevChannel && onNextChannel && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => triggerChannelSwitch('prev')}
                  aria-label="Previous channel"
                  title="Previous channel (Left Arrow)"
                  className="w-9 h-10 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => triggerChannelSwitch('next')}
                  aria-label="Next channel"
                  title="Next channel (Right Arrow)"
                  className="w-9 h-10 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="w-10 h-10 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center justify-center transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const next = parseFloat(e.target.value);
                  setVolume(next);
                  if (next > 0 && isMuted) setIsMuted(false);
                }}
                aria-label="Volume"
                className="hidden sm:block w-20 md:w-24 accent-[#E50914] cursor-pointer"
              />
            </div>

            <div className="hidden md:flex items-center gap-2 pl-2 text-xs text-white/75">
              <span className="font-semibold text-[#E50914]">LIVE</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeQualityLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 relative">
            {qualityLevels.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQualityMenu((prev) => !prev)}
                  aria-label="Select stream quality"
                  className="h-10 px-2.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentLevel === -1 ? 'Auto' : activeQualityLabel}
                  </span>
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-12 right-0 w-32 rounded-xl bg-[#171D2A] border border-[#2C364B] p-1.5 shadow-2xl z-30">
                    <button
                      type="button"
                      onClick={() => handleSelectQuality(-1)}
                      className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-medium ${
                        currentLevel === -1
                          ? 'bg-[#E50914] text-white'
                          : 'text-[#D1D5DB] hover:bg-[#1E2636]'
                      }`}
                    >
                      Auto
                    </button>
                    {qualityLevels.map((lvl) => (
                      <button
                        key={lvl.index}
                        type="button"
                        onClick={() => handleSelectQuality(lvl.index)}
                        className={`w-full px-3 py-1.5 rounded-lg text-left text-xs font-mono ${
                          currentLevel === lvl.index
                            ? 'bg-[#E50914] text-white'
                            : 'text-[#D1D5DB] hover:bg-[#1E2636]'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSourcePanel((prev) => !prev)}
              aria-label="Inspect or override HLS stream URL"
              title="Stream URL"
              className="h-10 px-2.5 rounded-lg hover:bg-white/10 text-white/85 hover:text-white flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </button>

            <button
              type="button"
              onClick={togglePictureInPicture}
              aria-label="Picture in Picture"
              title="Picture-in-Picture"
              className={`w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors ${
                isPipActive ? 'text-[#F5B942]' : 'text-white/90 hover:text-white'
              }`}
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="w-10 h-10 rounded-lg hover:bg-white/10 text-white/90 hover:text-white flex items-center justify-center transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
