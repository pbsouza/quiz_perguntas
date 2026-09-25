/**
 * Utility functions for YouTube URL parsing and embed generation
 */

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubeInfo {
  videoId: string;
  embedUrl: string;
  originalUrl: string;
  startTime?: number;
}

/**
 * Extracts YouTube Video ID and optional start time from any YouTube URL format.
 */
export function extractYouTubeInfo(url: string | undefined | null): YouTubeInfo | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (!clean) return null;

  // Check if it's already just an 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return {
      videoId: clean,
      embedUrl: `https://www.youtube-nocookie.com/embed/${clean}`,
      originalUrl: `https://www.youtube.com/watch?v=${clean}`,
    };
  }

  // Regex patterns covering standard watch URLs, shortlinks, embeds, shorts, mobile
  const patterns = [
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i,
    /(?:https?:\/\/)?(?:www\.|m\.)?youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
  ];

  let videoId: string | null = null;
  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) return null;

  // Extract start time if present (e.g. t=120 or t=2m10s)
  let startTime: number | undefined;
  const tMatch = clean.match(/[?&]t=([0-9hms]+)/i);
  if (tMatch && tMatch[1]) {
    const rawTime = tMatch[1];
    if (/^\d+$/.test(rawTime)) {
      startTime = parseInt(rawTime, 10);
    } else {
      let seconds = 0;
      const hours = rawTime.match(/(\d+)h/i);
      const minutes = rawTime.match(/(\d+)m/i);
      const secs = rawTime.match(/(\d+)s/i);
      if (hours) seconds += parseInt(hours[1], 10) * 3600;
      if (minutes) seconds += parseInt(minutes[1], 10) * 60;
      if (secs) seconds += parseInt(secs[1], 10);
      if (seconds > 0) startTime = seconds;
    }
  }

  const queryParams = new URLSearchParams();
  queryParams.set('rel', '0');
  queryParams.set('modestbranding', '1');
  queryParams.set('enablejsapi', '1');
  if (typeof window !== 'undefined' && window.location?.origin) {
    queryParams.set('origin', window.location.origin);
  }
  if (startTime) {
    queryParams.set('start', String(startTime));
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${queryParams.toString()}`;

  return {
    videoId,
    embedUrl,
    originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    startTime,
  };
}

/**
 * Validates whether a string contains a valid YouTube URL or ID
 */
export function isYouTubeUrl(url: string | undefined | null): boolean {
  return extractYouTubeInfo(url) !== null;
}
