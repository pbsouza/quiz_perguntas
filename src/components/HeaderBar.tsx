import React from 'react';
import { FileCode, RotateCcw, Trash2, Shuffle } from 'lucide-react';

interface HeaderBarProps {
  onOpenJsonEditor: () => void;
  onResetAnswers: () => void;
  onShuffleQuestions: () => void;
  onClearQuiz: () => void;
  hasQuiz: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenJsonEditor,
  onResetAnswers,
  onShuffleQuestions,
  onClearQuiz,
  hasQuiz,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 select-none">
            QuizSchema
          </span>
          <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium hidden xs:inline sm:inline">
            JSON Dinâmico
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasQuiz && (
            <>
              <button
                onClick={onShuffleQuestions}
                title="Embaralhar ordem das perguntas"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={onResetAnswers}
                title="Reiniciar respostas"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

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

          <button
            onClick={onOpenJsonEditor}
            className="px-3 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{hasQuiz ? 'Editar JSON' : 'Inserir JSON'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
