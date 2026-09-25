import React, { useState, useEffect } from 'react';
import { QuizSchema } from '../types/quiz';
import { SavedQuizItem, getSavedQuizzes, deleteSavedQuiz } from '../utils/quizStorage';
import { generateShareUrl } from '../utils/shareLink';
import { 
  X, 
  BookOpen, 
  Trash2, 
  Play, 
  Share2, 
  Download, 
  Search, 
  Calendar, 
  Award, 
  Check, 
  Sparkles,
  Copy
} from 'lucide-react';

interface SavedQuizzesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuiz: (quiz: QuizSchema) => void;
  onOpenShareModal: (quiz: QuizSchema) => void;
}

export const SavedQuizzesModal: React.FC<SavedQuizzesModalProps> = ({
  isOpen,
  onClose,
  onLoadQuiz,
  onOpenShareModal,
}) => {
  const [quizzes, setQuizzes] = useState<SavedQuizItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuizzes(getSavedQuizzes());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover este questionário dos salvos?')) {
      const updated = deleteSavedQuiz(id);
      setQuizzes(updated);
    }
  };

  const handleCopyLink = (quiz: QuizSchema, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateShareUrl(quiz);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (quiz: QuizSchema, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(quiz.title || 'quiz').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectQuiz = (quiz: QuizSchema) => {
    onLoadQuiz(quiz);
    onClose();
  };

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Meus Questionários Salvos
              </h3>
              <p className="text-xs text-slate-500">
                {quizzes.length} {quizzes.length === 1 ? 'questionário salvo' : 'questionários salvos'} localmente no seu navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        {quizzes.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar questionário..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* Quiz List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Nenhum questionário salvo ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Ao criar ou abrir qualquer questionário, ele será guardado automaticamente aqui para você praticar e estudar quando quiser.
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum questionário encontrado com &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredQuizzes.map(item => {
              const formattedDate = new Date(item.savedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectQuiz(item.data)}
                  className="group p-4 rounded-2xl border border-slate-200/90 hover:border-slate-400 bg-white hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.questionCount} questões
                      </span>
                      {item.lastScore && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {item.lastScore.percentage}% ({item.lastScore.correct}/{item.lastScore.total})
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Salvo em {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      onClick={(e) => handleCopyLink(item.data, item.id, e)}
                      title="Copiar link compartilhável"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDownload(item.data, e)}
                      title="Baixar questionário"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Excluir questionário"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSelectQuiz(item.data)}
                      className="ml-1 px-3 py-1.5 bg-slate-900 group-hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Abrir</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Armazenamento local (privado neste dispositivo)
          </span>
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
