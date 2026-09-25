import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCode, 
  RotateCcw, 
  Trash2, 
  Shuffle, 
  BookOpen, 
  Share2, 
  ChevronDown, 
  Layers,
  MoreVertical
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const shuffleMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shuffleMenuRef.current && !shuffleMenuRef.current.contains(event.target as Node)) {
        setIsShuffleMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full max-w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-2 sm:px-4 md:px-6 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Logo / Title */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 select-none truncate">
            QuizSchema
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium hidden lg:inline whitespace-nowrap">
            Questionários
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Library / Meus Quizzes button */}
          <button
            type="button"
            onClick={onOpenLibrary}
            title="Ver meus questionários salvos"
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-slate-200 shrink-0"
          >
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="hidden md:inline">Meus Quizzes</span>
            {savedQuizzesCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                {savedQuizzesCount}
              </span>
            )}
          </button>

          {hasQuiz && (
            <>
              {/* Shuffle Menu Dropdown */}
              <div className="relative shrink-0" ref={shuffleMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsShuffleMenuOpen(prev => !prev);
                    setIsMoreMenuOpen(false);
                  }}
                  title="Opções de embaralhamento"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-slate-200 shrink-0"
                >
                  <Shuffle className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="hidden md:inline">Embaralhar</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isShuffleMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 sm:w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        onShuffleQuestions();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Embaralhar Perguntas</div>
                        <div className="text-[10px] text-slate-400">Muda a ordem das questões</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onShuffleOptions();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="font-semibold">Embaralhar Alternativas</div>
                        <div className="text-[10px] text-slate-400">Muda posições A, B, C, D</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        onShuffleAll();
                        setIsShuffleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-sky-50 flex items-center gap-2.5 text-sky-700 hover:text-sky-900 cursor-pointer font-medium"
                    >
                      <Shuffle className="w-4 h-4 text-sky-600 shrink-0" />
                      <div>
                        <div className="font-semibold">Embaralhar Tudo</div>
                        <div className="text-[10px] text-sky-600/80">Perguntas e alternativas</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Only Extra Buttons (>= md) */}
              <div className="hidden md:flex items-center gap-1 shrink-0">
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={onOpenShare}
                    title="Compartilhar questionário via link"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onResetAnswers}
                  title="Reiniciar respostas"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClearQuiz}
                  title="Limpar quiz e voltar ao início"
                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors cursor-pointer flex items-center gap-1 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>

              {/* Mobile Overflow Menu (< md) */}
              <div className="relative md:hidden shrink-0" ref={moreMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(prev => !prev);
                    setIsShuffleMenuOpen(false);
                  }}
                  title="Mais ações"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMoreMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in duration-100">
                    {onOpenShare && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenShare();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Compartilhar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onResetAnswers();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reiniciar Respostas</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        onClearQuiz();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Limpar Tudo</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* PRIMARY BUTTON: EDIT / INSERT QUESTIONS (Always visible, fits on any screen) */}
          <button
            type="button"
            onClick={onOpenJsonEditor}
            title={hasQuiz ? 'Editar ou adicionar perguntas' : 'Inserir novas perguntas'}
            className="px-2.5 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">{hasQuiz ? 'Editar Questões' : 'Inserir Questões'}</span>
            <span className="sm:hidden">{hasQuiz ? 'Editar' : 'Inserir'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
