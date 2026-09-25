import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCode, 
  RotateCcw, 
  Trash2, 
  Shuffle, 
  BookOpen, 
  Share2, 
  ChevronDown, 
  Layers
} from 'lucide-react';

interface HeaderBarProps {
  onOpenJsonEditor: () => void;
  onResetAnswers: () => void;
  onShuffleQuestions: () => void;
  onShuffleOptions: () => void;
  onShuffleAll: () => void;
  onOpenLibrary: () => void;
  onOpenShare?: () => void;
  onClearQuiz: () => void;
  hasQuiz: boolean;
  savedQuizzesCount: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenJsonEditor,
  onResetAnswers,
  onShuffleQuestions,
  onShuffleOptions,
  onShuffleAll,
  onOpenLibrary,
  onOpenShare,
  onClearQuiz,
  hasQuiz,
  savedQuizzesCount,
}) => {
  const [isShuffleMenuOpen, setIsShuffleMenuOpen] = useState(false);
  const shuffleMenuRef = useRef<HTMLDivElement>(null);

  // Close shuffle menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shuffleMenuRef.current && !shuffleMenuRef.current.contains(event.target as Node)) {
        setIsShuffleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 select-none">
            QuizSchema
          </span>
          <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium hidden xs:inline sm:inline">
            Questionários Interativos
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">

          {/* Library / Meus Quizzes button */}
          <button
            onClick={onOpenLibrary}
            title="Ver meus questionários salvos"
            className="px-2.5 sm:px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200/90"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Meus Quizzes</span>
            {savedQuizzesCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {savedQuizzesCount}
              </span>
            )}
          </button>

          {hasQuiz && (
            <>
              {/* Shuffle Menu Dropdown */}
              <div className="relative" ref={shuffleMenuRef}>
                <button
                  onClick={() => setIsShuffleMenuOpen(prev => !prev)}
                  title="Opções de embaralhamento"
                  className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-slate-200/90"
                >
                  <Shuffle className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Embaralhar</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isShuffleMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        onShuffleQuestions();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-semibold">Embaralhar Perguntas</div>
                        <div className="text-[10px] text-slate-400">Muda a ordem das questões</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onShuffleOptions();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-semibold">Embaralhar Alternativas</div>
                        <div className="text-[10px] text-slate-400">Muda posições A, B, C, D</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        onShuffleAll();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 flex items-center gap-2.5 text-sky-700 hover:text-sky-900 cursor-pointer font-medium"
                    >
                      <Shuffle className="w-4 h-4 text-sky-600" />
                      <div>
                        <div className="font-semibold">Embaralhar Tudo</div>
                        <div className="text-[10px] text-sky-600/80">Perguntas e alternativas juntas</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Share button */}
              {onOpenShare && (
                <button
                  onClick={onOpenShare}
                  title="Compartilhar questionário com link"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              {/* Restart button */}
              <button
                onClick={onResetAnswers}
                title="Reiniciar respostas"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Clear button */}
              <button
                onClick={onClearQuiz}
                title="Limpar quiz e voltar ao início"
                className="px-2.5 sm:px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            </>
          )}

          {/* Edit/Insert Questions button */}
          <button
            onClick={onOpenJsonEditor}
            className="px-3 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{hasQuiz ? 'Editar Questões' : 'Inserir Questões'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
