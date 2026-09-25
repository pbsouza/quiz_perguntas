import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  ArrowRight, 
  ExternalLink, 
  Video, 
  FileEdit, 
  Sparkles, 
  Sun, 
  SunMedium, 
  Moon, 
  Lock, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { extractYouTubeInfo } from '../utils/youtube';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';

interface VideoPlayerPartProps {
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  quizTitle?: string;
  questionCount: number;
  onProceedToQuestions: () => void;
  onUpdateVideoUrl?: (newUrl: string) => void;
}

export const VideoPlayerPart: React.FC<VideoPlayerPartProps> = ({
  videoUrl,
  videoTitle,
  videoDescription,
  quizTitle,
  questionCount,
  onProceedToQuestions,
  onUpdateVideoUrl,
}) => {
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(videoUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const ytInfo = extractYouTubeInfo(videoUrl);

  const { isWakeLockActive, requestWakeLock, releaseWakeLock } = useScreenWakeLock();
  const playerRef = useRef<any>(null);

  // Synchronize wake lock with playback state
  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  // Handle YouTube IFrame Player API and message events
  useEffect(() => {
    let isMounted = true;

    // Attach to YouTube Iframe API if available
    const setupYTPlayer = () => {
      if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
      const iframe = document.getElementById('yt-video-player-iframe');
      if (!iframe) return;

      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player('yt-video-player-iframe', {
          events: {
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 3 = BUFFERING
              if (event.data === 1 || event.data === 3) {
                setIsPlaying(true);
                requestWakeLock();
              } else if (event.data === 2 || event.data === 0) {
                // 2 = PAUSED, 0 = ENDED
                setIsPlaying(false);
                releaseWakeLock();
              }
            },
          },
        });
      } catch (err) {
        // Player already attached or initialization error
      }
    };

    // Load YouTube IFrame API script if not yet loaded
    if (ytInfo) {
      if (!window.YT) {
        const existingTag = document.getElementById('youtube-iframe-api');
        if (!existingTag) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (previousReady) previousReady();
          if (isMounted) setupYTPlayer();
        };
      } else {
        setupYTPlayer();
      }
    }

    // Secondary listener: listen for postMessage events from YouTube iframe
    const handleWindowMessage = (event: MessageEvent) => {
      if (!isMounted) return;
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        // Check for YouTube player state change via message
        if (data.event === 'onStateChange') {
          const state = data.info;
          if (state === 1 || state === 3) {
            setIsPlaying(true);
            requestWakeLock();
          } else if (state === 2 || state === 0) {
            setIsPlaying(false);
            releaseWakeLock();
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleWindowMessage);

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleWindowMessage);
      // ALWAYS release wake lock when leaving video component
      releaseWakeLock();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [ytInfo?.videoId, requestWakeLock, releaseWakeLock]);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateVideoUrl && tempUrl.trim()) {
      onUpdateVideoUrl(tempUrl.trim());
      setEditingUrl(false);
    }
  };

  const isScreenAwake = isWakeLockActive || isPlaying;

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
      
      {/* Step Indicator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase">
            <Video className="w-3.5 h-3.5" />
            Parte 1 de 2: Vídeo
          </span>
          <span className="text-xs text-slate-400 font-medium">
            · {questionCount} perguntas a seguir
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            releaseWakeLock();
            onProceedToQuestions();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <span>Ir para as Perguntas</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {videoTitle || quizTitle || "Vídeo da Aula"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {videoDescription || "Assista ao vídeo abaixo com atenção antes de responder às questões da Parte 2."}
        </p>
      </div>

      {/* Screen Wake Lock Status Banner */}
      <div className={`px-3.5 py-2.5 rounded-2xl border text-xs flex items-center justify-between transition-all duration-300 ${
        isScreenAwake 
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900' 
          : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <div className="flex items-center gap-2">
          {isScreenAwake ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}

          <div className="flex items-center gap-1.5 font-medium">
            {isScreenAwake ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-amber-900">Tela mantida sempre acesa</span>
                <span className="hidden sm:inline text-amber-700/80">(vídeo em reprodução)</span>
              </>
            ) : (
              <>
                <span>Bloqueio de tela normal</span>
                <span className="hidden sm:inline text-slate-400">(tela acesa ao dar play no vídeo)</span>
              </>
            )}
          </div>
        </div>

        {/* Quick manual wake toggle if user wants to keep screen awake even while taking notes */}
        <button
          type="button"
          onClick={() => {
            if (isWakeLockActive) {
              setIsPlaying(false);
              releaseWakeLock();
            } else {
              requestWakeLock();
            }
          }}
          title={isWakeLockActive ? "Desativar tela sempre acesa" : "Forçar tela sempre acesa"}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
            isWakeLockActive 
              ? 'bg-amber-500 text-white shadow-2xs hover:bg-amber-600' 
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>{isWakeLockActive ? 'Tela Acesa: Ativa' : 'Manter Acesa'}</span>
        </button>
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-800 relative aspect-video flex items-center justify-center">
        {ytInfo ? (
          <iframe
            id="yt-video-player-iframe"
            src={ytInfo.embedUrl}
            title={videoTitle || "Vídeo do YouTube"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) ? (
          <video
            src={videoUrl}
            controls
            onPlay={() => {
              setIsPlaying(true);
              requestWakeLock();
            }}
            onPause={() => {
              setIsPlaying(false);
              releaseWakeLock();
            }}
            onEnded={() => {
              setIsPlaying(false);
              releaseWakeLock();
            }}
            className="w-full h-full object-contain"
          />
        ) : (
          /* Fallback when no valid video link is present */
          <div className="p-6 text-center flex flex-col items-center justify-center text-white max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">
              Link de vídeo não configurado
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              O JSON desta atividade ainda não contém um link válido do YouTube. Insira o link do vídeo para exibi-lo aqui.
            </p>
            <button
              type="button"
              onClick={() => setEditingUrl(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Inserir Link do YouTube
            </button>
          </div>
        )}
      </div>

      {/* Video Controls & Secondary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          {ytInfo && (
            <a
              href={ytInfo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir diretamente no YouTube</span>
            </a>
          )}

          {onUpdateVideoUrl && !editingUrl && (
            <button
              type="button"
              onClick={() => {
                setTempUrl(videoUrl || '');
                setEditingUrl(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{videoUrl ? 'Alterar link do vídeo' : 'Adicionar vídeo'}</span>
            </button>
          )}
        </div>

        {/* Big Bottom Action to Part 2 */}
        <button
          type="button"
          onClick={() => {
            releaseWakeLock();
            onProceedToQuestions();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <span>Avançar para as Perguntas (Parte 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Edit URL Form if toggled */}
      {editingUrl && (
        <form onSubmit={handleSaveUrl} className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center mt-2 animate-in fade-in duration-150">
          <input
            type="url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="Cole o link do vídeo do YouTube (ex: https://www.youtube.com/watch?v=...)"
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditingUrl(false)}
              className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!tempUrl.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Salvar Link
            </button>
          </div>
        </form>
      )}

      {/* Study Guidance Tips Card */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-3 mt-1">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-amber-900">Dica de Aprendizado & Bloqueio de Tela:</p>
          <p className="text-amber-800/90 mt-0.5">
            Ao dar play no vídeo, a tela do seu celular ou computador fica mantida acesa automaticamente. Quando você pausar ou avançar para as perguntas, a tela volta ao bloqueio e descanso normal do seu sistema.
          </p>
        </div>
      </div>

    </div>
  );
};
