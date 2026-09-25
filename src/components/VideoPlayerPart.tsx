import React, { useState } from 'react';
import { Play, ArrowRight, ExternalLink, HelpCircle, Sparkles, Video, FileEdit, CheckCircle2 } from 'lucide-react';
import { extractYouTubeInfo } from '../utils/youtube';

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
  const ytInfo = extractYouTubeInfo(videoUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateVideoUrl && tempUrl.trim()) {
      onUpdateVideoUrl(tempUrl.trim());
      setEditingUrl(false);
    }
  };

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
          onClick={onProceedToQuestions}
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

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-800 relative aspect-video flex items-center justify-center">
        {ytInfo ? (
          <iframe
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
          onClick={onProceedToQuestions}
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
          <p className="font-semibold text-amber-900">Dica de Aprendizado:</p>
          <p className="text-amber-800/90 mt-0.5">
            Você poderá voltar a este vídeo a qualquer momento enquanto responde o questionário através da barra superior, sem perder o progresso das suas respostas.
          </p>
        </div>
      </div>

    </div>
  );
};
