import React, { useState } from 'react';
import { QuizSchema } from '../types/quiz';
import { generateShareUrl } from '../utils/shareLink';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizSchema;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, quiz }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = generateShareUrl(quiz);
  const quizTitle = quiz.title || 'Questionário';
  const totalQuestions = quiz.questions?.length || 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Confira este questionário: *${quizTitle}* (${totalQuestions} questões)\n\nResponda agora diretamente pelo link:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: quizTitle,
          text: `Responda ao questionário "${quizTitle}" (${totalQuestions} questões):`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Compartilhar Questionário</h3>
              <p className="text-xs text-slate-500">Link direto com as questões embutidas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-sm font-semibold text-slate-800 line-clamp-1">{quizTitle}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {totalQuestions} {totalQuestions === 1 ? 'questão' : 'questões'} prontas para estudo
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Link de Acesso Direto:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 truncate focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              💡 Quem abrir esse link começará a responder as perguntas na hora pelo celular ou computador, sem precisar instalar nada nem enviar arquivos.
            </p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#25D366]/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Outros Apps</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
