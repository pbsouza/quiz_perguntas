/**
 * Utility for Screen Wake Lock API
 * Keeps the screen awake while media is playing and allows normal screen lock when paused.
 */

type WakeLockChangeCallback = (isActive: boolean) => void;

class ScreenWakeLockManager {
  private sentinel: WakeLockSentinel | null = null;
  private isRequested: boolean = false;
  private listeners: Set<WakeLockChangeCallback> = new Set();
  private fallbackVideo: HTMLVideoElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  public subscribe(callback: WakeLockChangeCallback): () => void {
    this.listeners.add(callback);
    callback(this.isActive());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const active = this.isActive();
    this.listeners.forEach((cb) => {
      try {
        cb(active);
      } catch (err) {
        console.error('WakeLock notify error:', err);
      }
    });
  }

  public isActive(): boolean {
    return this.sentinel !== null || (this.fallbackVideo !== null && !this.fallbackVideo.paused);
  }

  public async request(): Promise<boolean> {
    this.isRequested = true;

    // 1. Try standard Screen Wake Lock API (supported in Chromium, modern iOS Safari 16.4+, Edge, Android)
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (!this.sentinel) {
          this.sentinel = await navigator.wakeLock.request('screen');
          this.sentinel.addEventListener('release', () => {
            this.sentinel = null;
            this.notify();
          });
          this.notify();
          return true;
        }
        return true;
      } catch (err) {
        console.warn('Screen WakeLock API request failed:', err);
      }
    }

    // 2. Fallback for older iOS Safari without WakeLock API: minimal silent video loop
    try {
      if (!this.fallbackVideo && typeof document !== 'undefined') {
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('loop', '');
        video.setAttribute('muted', '');
        video.muted = true;
        // 1x1 base64 transparent silent mp4 video
        video.src = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAAAhmcmVlAAAABG1kYXQAAAAIZmRzYwAAABh0cmFrAAAAAAAAABwAAAAAAAEAAAAAAAA=';
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        document.body.appendChild(video);
        this.fallbackVideo = video;
      }
      if (this.fallbackVideo) {
        await this.fallbackVideo.play();
        this.notify();
        return true;
      }
    } catch {
      // ignore
    }

    this.notify();
    return false;
  }

  public async release(): Promise<void> {
    this.isRequested = false;

    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // ignore
      }
      this.sentinel = null;
    }

    if (this.fallbackVideo) {
      try {
        this.fallbackVideo.pause();
      } catch {
        // ignore
      }
    }

    this.notify();
  }

  private handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && this.isRequested) {
      // Re-acquire lock when user returns to tab if video was still active
      await this.request();
    } else if (document.visibilityState === 'hidden') {
      // Browser automatically drops the lock on hide
      this.sentinel = null;
      this.notify();
    }
  };
}

export const wakeLockManager = new ScreenWakeLockManager();
